<?php
require_once('utils/process_request.inc');

$post_data_json = file_get_contents('php://input');
$post_data_array = json_decode($post_data_json, true);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $post_data_array['url']);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
echo curl_exec($ch);
curl_close($ch);
?>

