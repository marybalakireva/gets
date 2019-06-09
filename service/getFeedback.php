<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/config.inc');

header('Content-Type:text/xml');
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

if (!$dom->schemaValidate('schemes/getCategories.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = get_request_argument($dom, 'auth_token');
$dbconn = pg_connect(GEO2TAG_DB_STRING);
// Token unused but still check if supplied
try {
    if ($auth_token) {
        auth_set_token($auth_token);
        $private_email = auth_get_google_email();
        $private_email_escaped = pg_escape_string($dbconn, $private_email);
        session_commit();
    }
} catch (GetsAuthException $ex) {
    send_error(1, $ex->getMessage());
    die();
}

$public_login_escaped = pg_escape_string(GEO2TAG_USER);

if (!$auth_token) {
    $query = "SELECT feedbacks.id, feedbacks.date_add, feedbacks.category_id, feedbacks.comment, feedbacks.user_id, feedbacks.status
    FROM feedbacks;";
}

$result = pg_query($dbconn, $query);

//$default_category_id = defined("DEFAULT_CATEGORY_ID") ? DEFAULT_CATEGORY_ID : -1;

$xml = '<feedbacks>';

while ($row = pg_fetch_row($result)) {
    $xml .= '<feedback>';

    $xml_id = htmlspecialchars($row[0]);
    $xml_date_add = htmlspecialchars($row[1]);
    $xml_category = htmlspecialchars(get_category_name($dbconn,$row[2]));
    $xml_comment = htmlspecialchars($row[3]);

    $query_user = pg_query($dbconn,"SELECT users.email FROM users WHERE users.id = '$row[4]';");
    $user_email = pg_fetch_row($query_user);
    $xml_user_email = htmlspecialchars($user_email[0]);

    $xml_status = htmlspecialchars($row[5]);

    $xml .= "<id>${xml_id}</id>";
    $xml .= "<date_add>${xml_date_add}</date_add>";
    $xml .= "<category>${xml_category}</category>";
    $xml .= "<comment>${xml_comment}</comment>";
    $xml .= "<user_email>${xml_user_email}</user_email>";
    $xml .= "<status>${xml_status}</status>";

    $xml .= '</feedback>';
}

$xml .= '</feedbacks>';

send_result(0, 'success', $xml);

include_once('include/php-ga.inc');

?>
