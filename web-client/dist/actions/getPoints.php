<?php
require_once('utils/process_request.inc');
require_once('utils/constants.inc');
require_once('utils/methods_url.inc');
require_once('utils/array2xml.inc');

header ('Content-Type:text/xml');

$request_type = PUBLIC_REQUEST;

session_start();
if (isset($_SESSION['g2t_token'])) {
    $request_type = PRIVATE_REQUEST;
}

if (filter_input(INPUT_SERVER, 'REQUEST_METHOD') == 'POST') {
    $post_data_json = file_get_contents('php://input');
    $post_data_array = json_decode($post_data_json, true);
    if ($request_type === PRIVATE_REQUEST) {
        $auth_token_array = array();
        $auth_token_array['auth_token'] = $_SESSION['g2t_token'];
        $combined_array = array_merge($auth_token_array, $post_data_array);
        $data = array2xml($combined_array, 'params', false);
    } else {
        $data = array2xml($post_data_array, 'params', false);
    }
    echo process_request(LOAD_POINTS_METHOD_URL, '<request>' . $data . '</request>', 'Content-Type: text/xml');   
} else {
    die('Not POST request');
}
?>

