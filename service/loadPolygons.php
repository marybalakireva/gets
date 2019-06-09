<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');
include_once('include/channels.inc');

include_once('include/header.inc');

if (ends_with($_SERVER['SCRIPT_FILENAME'], "Tracks.php")) {
    $type = CHANNEL_TRACK;
    $tag = "track";
    $root_tag = "tracks";
} else {
    $type = CHANNEL_POLYGON;
    $tag = "polygon";
    $root_tag = "polygons";
}

try {
    $dom = get_input_dom('schemes/loadChannels.xsd');

    $auth_token = get_request_argument($dom, 'auth_token');
    $category_name = get_request_argument($dom, 'category_name');
    $space_arg = get_request_argument($dom, 'space');

    $radius = get_request_argument($dom, 'radius', 0);
    $longitude = get_request_argument($dom, 'longitude', 0);
    $latitude = get_request_argument($dom, 'latitude', 0);

    $is_radius_filter = ($radius !== 0);

    $space = SPACE_ALL;
    if ($space_arg) {
        if ($space_arg === 'public') {
            $space = SPACE_PUBLIC;
        } elseif ($space_arg === 'private') {
            $space = SPACE_PRIVATE;
        }
    }

    if ($space === SPACE_PRIVATE && !$auth_token) {
        throw Exception('Private space requires auth_token', 1);
    }

    if ($space === SPACE_ALL && !$auth_token) {
        $space = SPACE_PUBLIC;
    }

    $dbconn = pg_connect(GEO2TAG_DB_STRING);
    $geo2tag_user_escaped = pg_escape_string($dbconn, GEO2TAG_USER);

    if ($auth_token) {
        auth_set_token($auth_token);
        $private_email = auth_get_google_email();
        $private_email_escaped = pg_escape_string($dbconn, $private_email);
    }

// email 'where' query
    $where_arr = array();
    $email_where_arr = array();
//$query_with = "public_user AS (SELECT id FROM users WHERE login='${geo2tag_user_escaped}')";
    $query_with = "";

    if ($space === SPACE_ALL || $space === SPACE_PRIVATE) {
        $email_where_arr[] = "channel.owner_id IN (SELECT id FROM private_user)";
        $permission_row = "BOOL_OR(channel.owner_id IN (SELECT id FROM private_user)) AS permission";
        $share_row = " (CASE WHEN BOOL_OR(share.id IS NOT NULL) AND BOOL_OR(channel.owner_id IN (SELECT id FROM private_user)) THEN JSON_AGG(DISTINCT row(share.key, share.remain)) ELSE NULL END) AS share";
        $query_with = "WITH private_user AS (SELECT id FROM users WHERE email='${private_email_escaped}')";
    } else {
        $permission_row = 'false AS permission';
        $share_row = "null AS share";
    }

    if ($space === SPACE_ALL || $space === SPACE_PUBLIC) {
        $email_where_arr[] = "subscribe.user_id = project_users.id";
        //$email_where_arr[] = "subscribe_users.login='$geo2tag_user_escaped'";
    }

    $query = "${query_with} SELECT channel.name, channel.description, channel.url, ${permission_row},
    BOOL_OR(subscribe.user_id = project_users.id) AS published,
    ${share_row}
    FROM channel ";

    if ($is_radius_filter) {
        $query .= 'INNER JOIN tag ON tag.channel_id = channel.id ';
    }

    $query .= 'INNER JOIN subscribe ON channel.id = subscribe.channel_id ';
//$query .= 'INNER JOIN users ON users.id = channel.owner_id ';
    $query .= 'INNER JOIN category ON safe_cast_to_json(channel.description)->>\'category_id\'=category.id::text ';
    $query .= 'INNER JOIN users AS project_users ON category.owner_id = project_users.id ';

    if ($space !== SPACE_PUBLIC) {
        $query .= 'LEFT JOIN share ON share.channel_id = channel.id ';
        $email_where_arr[] = "subscribe.user_id IN (SELECT id FROM private_user)";
    }

    $email_where = '(' . implode(' OR ', $email_where_arr) . ')';

    $where_arr[] = $email_where;
    if ($category_name) {
        $category_name_escaped = pg_escape_string($dbconn, $category_name);
        $where_arr[] = "category.name='${category_name_escaped}'";
    }

    $where_arr[] = "project_users.login='" . $geo2tag_user_escaped . "'";


    if ($type === CHANNEL_TRACK) {
        $where_arr[] = "(channel.name LIKE 'tr+%' OR channel.name LIKE 'tr_%')";
    } else {
        $where_arr[] = "(channel.name LIKE 'pl+%' OR channel.name LIKE 'pl_%')";
    }
    
# Distance where
    if ($is_radius_filter) {
        $where_arr[] = "gets_geo_distance(tag.latitude, tag.longitude, ${latitude}, ${longitude}) < ${radius}";
    }

    $query .= 'WHERE ' . implode(' AND ', $where_arr) . ' GROUP BY channel.name, channel.description, channel.url;';
    $result = pg_query($dbconn, $query);
    $user_is_admin = ($private_email !== null && is_user_admin($dbconn) > 0 ? true : false);

    $resp = "<$root_tag>";
    while ($row = pg_fetch_row($result)) {
        $channel_name = $row[0];
        $channel_desc = $row[1];
        $channel_url = $row[2];
        if (!$user_is_admin)
            $access = $row[3] == 'f' ? 'r' : 'rw';
        else
            $access = 'rw';

        $published = $row[4] == 'f' ? 'false' : 'true';

        $share = $row[5];

        $channel_description = null;
        $channel_category_id = null;
        $channel_lang = null;
        $channel_hname = null;

        $desc_arr = json_decode($channel_desc, true);

        if ($desc_arr) {
            $channel_description = get_array_element($desc_arr, 'description');
            $channel_category_id = get_array_element($desc_arr, 'category_id');
            $channel_lang = get_array_element($desc_arr, 'lang');
            $channel_hname = get_array_element($desc_arr, 'hname');
            $channel_photo_url = get_array_element($desc_arr, "photo");
        }

        $resp .= "<$tag>";
        $resp .= '<name>' . htmlspecialchars($channel_name) . '</name>';
        $resp .= '<description>' . htmlspecialchars($channel_description) . '</description>';
        $resp .= '<category_id>' . $channel_category_id . '</category_id>';

        if ($channel_lang)
            $resp .= '<lang>' . htmlspecialchars($channel_lang) . '</lang>';

        if ($channel_hname)
            $resp .= '<hname>' . htmlspecialchars($channel_hname) . '</hname>';

        if ($channel_photo_url)
            $resp .= '<photoUrl>' . htmlspecialchars($channel_photo_url) . '</photoUrl>';

        if ($channel_url)
            $resp .= '<url>' . htmlspecialchars($channel_url) . '</url>';


        $resp .= '<access>' . $access . '</access>';

        $resp .= '<published>' . $published . '</published>';

        if ($share) {
            $resp .= '<shares>';
            $share_array = json_decode($share, true);

            foreach ($share_array as $share_elem) {
                $key = htmlspecialchars($share_elem["f1"]);
                $remain = htmlspecialchars($share_elem["f2"]);
                if ($remain < -1)
                    $remain = -1;
                $resp .= "<share><key>$key</key><remain>$remain</remain></share>";
            }

            $resp .= '</shares>';
        }

        $resp .= "</$tag>";
    }

    $resp .= "</$root_tag>";

    pg_close($dbconn);

    send_result(0, 'success', $resp);
} catch (GetsAuthException $e) {
    send_error(1, "Google login error");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}

include_once('include/php-ga.inc');
