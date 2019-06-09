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

if (!$dom->schemaValidate('schemes/deleteCategory.xsd')) {
    send_error(1, 'Error: not valid input XML document.');
    die();
}

$auth_token = $dom->getElementsByTagName('auth_token')->item(0)->nodeValue;
$category_id = $dom->getElementsByTagName('id')->item(0)->nodeValue;

$data = '<methodCall><methodName>deleteCategory</methodName><params><param><struct><member><name>projectName</name><value>'.GEO2TAG_USER.
	'</value></member><member><name>id</name><value>'. $category_id . '</value></member>'.
	'<member><name>token</name><value>'.$auth_token.'</value></member></struct></param></params></methodCall>';
$response =  process_request(GETS_SCRIPTS_URL, $data, 'Content-Type: text/xml');
if (!$response) {
	send_error(1, 'Error: problem with request to geo2tag.');
	die();
}

$dom_response = new DOMDocument();
$dom_response->loadXML($response);
$xpath = new DOMXPath($dom_response);

$success_element = $dom_response->getElementsByTagName('methodResponse');
if ($success_element->length == 0) {
	$xpath_query = "//member[name='faultString']/value/string";
	$errorNode = $xpath->query($xpath_query);
	send_error(1, 'Error: can\'t add new Category: '.$errorNode->item(0)->nodeValue);
	die();
}

$xpath_query = '//methodResponse/params/param/value/string';
$id_element = $xpath->query($xpath_query);
$id = $id_element->item(0)->nodeValue;

$content = '<category>'.$id.'</category>';
send_result(0, 'success', $content);

include_once('include/php-ga.inc');

?>
