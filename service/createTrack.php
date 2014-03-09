<?php

include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/public_token.inc');

header ('Content-Type:text/xml');

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

if (!$dom->schemaValidate('schemes/createTrack.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$data_array = array();

$auth_token = get_request_argument($dom, 'auth_token');
$description = get_request_argument($dom, 'description');
$url = get_request_argument($dom, 'url');
$name = get_request_argument($dom, 'name');
$category_id = get_request_argument($dom, 'category_id', -1);
$lang = get_request_argument($dom, 'lang');

$desc_array = array();
$desc_array['description'] = $description;
$desc_array['categoryId'] = $category_id;
if ($lang) $desc_array['lang'] = $lang;
$desc_json = json_encode($desc_array);

$data_array['auth_token'] = $auth_token;
$data_array['description'] = $desc_json;
$data_array['url'] = $url;
$data_array['name'] = $name;

$data_json = json_encode($data_array);

$response_json = process_request(ADD_CHANNEL_METHOD_URL, $data_json, 'Content-Type:application/json');
if (!$response_json) {
    send_error(1, 'Error: problem with request to geo2tag.');
    die();
}

echo $response_json;

$response_array = json_decode($response_json, true);
if (!$response_array) {
    send_error(1, 'Error: can\'t decode data from geo2tag.');
    die();
}

$response_code = check_errors($response_array['errno']);
if ($response_code != 'Ok') {
    send_error(1, $response_code);
    die();
}

send_result(0, 'success', '');

?>