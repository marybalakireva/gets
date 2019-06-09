 
 <?php

	require_once('utils/process_request.inc');
	require_once('utils/constants.inc');
	require_once('utils/methods_url.inc');
	require_once('utils/array2xml.inc');

	session_start();

	$token = $_SESSION['g2t_token'];
	$id = $_POST["id"];	

	$outArray = array();

	$outArray['auth_token'] = $token;
	$outArray['id'] = $id;

	$xmlAr = array2xml($outArray, 'params', false);

	$outXml = process_request(DELETE_USER_METHOD_URL, '<request>' . $xmlAr . '</request>', 'Content-Type: text/xml');

	$xml = new SimpleXMLElement($outXml);	

	echo $outXml;
	header('Location: ' . $_SERVER['HTTP_REFERER']);

 ?>
