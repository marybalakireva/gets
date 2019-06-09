<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');

header ('Content-Type:text/xml');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE');
    header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
} else {
    header('Access-Control-Allow-Origin: *');
}

$xml_post = file_get_contents('php://input');
if (!$xml_post) {
    send_error(1, 'Error: no input file');
    die();
}

libxml_use_internal_errors(true);
$dom = new DOMDocument();
$dom->loadXML($xml_post);

if (!$dom) {
    send_error(1, 'Error: resource isn\'t XML document.');
    die();
}

if (!$dom->relaxNGValidate('rng-schemes/deletePoint.rng')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$channel_name = get_request_argument($dom, 'track_name');
$category_id = get_request_argument($dom, 'category_id');

$requested_fields = array('name', 'latitude', 'longitude', 'time');
$requested_json_fields = array('uuid', 'description');

$dbconn = pg_connect(GEO2TAG_DB_STRING);
auth_set_token($auth_token);

// One of track_name or category_id must already be not null after schema validation
if ($channel_name) {
    $channel_name_escaped = pg_escape_string($dbconn, $channel_name);
    $channel_where = "channel.name='${channel_name_escaped}'";
} else {
    $category_id_escaped = pg_escape_string($dbconn, $category_id);
    $channel_where = "(safe_cast_to_json(channel.description)->>'category_id'='${category_id_escaped}'"
    . " OR safe_cast_to_json(tag.description)->>'category_id'='${category_id_escaped}')";
}

// e-mail
try {
    $email = auth_get_google_email();
    $email_escaped = pg_escape_string($dbconn, $email);
} catch (Exception $e) {
    send_error(1, $e->getMessage());
    die();
}

// Conditions
$condition_where_array = array('TRUE');
foreach ($requested_fields as $field) {
    $value = get_request_argument($dom, $field);
    if ($value) {
        if ($field === 'name')
            $field = 'label';
        $value_escaped = pg_escape_string($dbconn, $value);
        $condition_where_array[$field] = "${field}='${value_escaped}'";
    }
}

foreach ($requested_json_fields as $field) {
    $value = get_request_argument($dom, $field);
    if ($value) {
        $value_escaped = pg_escape_string($dbconn, $value);
        $condition_where_array[$field] = "safe_cast_to_json(tag.description)->>'${field}'='${value_escaped}'";
    }
}

$condition_where = implode(' AND ', $condition_where_array);

$query = "DELETE FROM tag WHERE tag.id IN 
    (SELECT tag.id FROM tag 
    INNER JOIN users ON users.id = tag.user_id 
    LEFT JOIN channel ON tag.channel_id = channel.id 
    WHERE (${channel_where}) AND users.email='${email_escaped}' AND (${condition_where}));";

if (!pg_query($dbconn, $query)) {
    send_error(1, "DB access error");
} else {
    send_result(0, "Tag successfully removed", "success");
}

include_once('include/php-ga.inc');

?>
