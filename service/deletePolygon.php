<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');

include_once('include/header.inc');

try {
    $dom = get_input_dom('schemes/deleteChannel.xsd');

    $auth_token = get_request_argument($dom, 'auth_token');
    $channel_name = get_request_argument($dom, 'name');

    $dbconn = pg_connect(GEO2TAG_DB_STRING);
    auth_set_token($auth_token);

    $email = auth_get_google_email();

    $user_is_admin = (is_user_admin($dbconn) > 0 ? true : false);

    // admin user not required to check email
    if ($user_is_admin) {
        $query = "DELETE FROM channel 
            WHERE channel.name=$1 RETURNING channel.id;";

        $res = pg_query_params($dbconn, $query, array($channel_name));
    } else {
        $query = "DELETE FROM channel WHERE channel.id IN
            (SELECT channel.id FROM channel
            INNER JOIN users ON channel.owner_id = users.id 
            WHERE users.email=$1 AND channel.name=$2) RETURNING channel.id;";

        $res = pg_query_params($dbconn, $query, array($email, $channel_name));
    }

    $count = pg_num_rows($res);

    if ($count == 0) {
        send_error(1, "Channel not found");
    } else {
        send_result(0, "Channel successfully removed", $count);
    }
} catch (GetsAuthException $e) {
    send_error(1, "Can't revoke token");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}

include_once('include/php-ga.inc');
