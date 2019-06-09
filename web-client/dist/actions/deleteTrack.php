<?php
require_once('utils/process_request.inc');
require_once('utils/constants.inc');
require_once('utils/methods_url.inc');
require_once('utils/array2xml.inc');

header ('Content-Type:text/xml');

session_start();

$outArray['auth_token'] = $_SESSION['g2t_token'];
!isset($_POST['id']) ?: $outArray['id'] = $_POST['id'];
$data = array2xml($outArray, 'params', false);
echo process_request(REMOVE_TRACK_METHOD_URL, '<request>' . $data . '</request>', 'Content-Type: text/xml');   
header('Location: ' . $_SERVER['HTTP_REFERER']);

?>