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
$query = "SELECT category.id, category.name, category.description, category.url, false AS published
    FROM category JOIN users ON category.owner_id=users.id
    WHERE users.login='${public_login_escaped}';";
} else {
    $query = "WITH published_channels AS (
        SELECT channel.id AS id, channel.name
        FROM channel
        INNER JOIN users ON users.id = channel.owner_id
        INNER JOIN subscribe ON subscribe.channel_id=channel.id
        INNER JOIN users AS subscribed_users ON subscribed_users.id = subscribe.user_id
        WHERE users.email='${private_email_escaped}' AND subscribed_users.login='${public_login_escaped}' AND channel.name LIKE 'ch+%'
    )

    SELECT category.id, category.name, category.description, category.url, bool_or(channel.id IN (SELECT id from published_channels)) AS published
    FROM category 
    INNER JOIN users AS project_users ON category.owner_id = project_users.id

    LEFT JOIN channel ON safe_cast_to_json(channel.description)->>'category_id' = category.id::text
    WHERE project_users.login = '${public_login_escaped}'
    GROUP BY category.id;";
}
    
$result = pg_query($dbconn, $query);

$default_category_id = defined("DEFAULT_CATEGORY_ID") ? DEFAULT_CATEGORY_ID : -1;

$xml = '<categories>';

while ($row = pg_fetch_row($result)) {
    $xml .= '<category>';

    $xml_id = htmlspecialchars($row[0]);
    $xml_name = htmlspecialchars($row[1]);
    $xml_description = htmlspecialchars($row[2]);
    $xml_url = htmlspecialchars($row[3]);

    $xml .= "<id>${xml_id}</id>";
    $xml .= "<name>${xml_name}</name>";
    $xml .= "<description>${xml_description}</description>";
    $xml .= "<url>${xml_url}</url>";
    if ($default_category_id !== -1 && $default_category_id === (int) $row[0]) {
        $xml .= "<default>true</default>";
    }
    
    if ($auth_token) {
        $xml_published = htmlspecialchars($row[4]) === 't' ? "true" : "false";
        $xml .= "<published>${xml_published}</published>";
    }
    
    $xml .= '</category>';
}

$xml .= '</categories>';



send_result(0, 'success', $xml);

include_once('include/php-ga.inc');

?>
