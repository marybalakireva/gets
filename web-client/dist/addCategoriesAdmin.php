 <?php

	require_once('utils/process_request.inc');
	require_once('utils/constants.inc');
	require_once('utils/methods_url.inc');
	require_once('utils/array2xml.inc');

	session_start();

	$outArray = array();

	$outArray['auth_token'] = $_SESSION['g2t_token'];

	!isset($_POST['name']) ?: $outArray['name'] = $_POST['name'];
	!isset($_POST['description']) ?: $outArray['description'] = $_POST['description'];
	!isset($_POST['url']) ?: $outArray['url'] = $_POST['url'];
	
	$xmlAr = array2xml($outArray, 'params', false);

	$outXml = process_request(ADD_CATEGORY_METHOD_URL, '<request>' . $xmlAr . '</request>', 'Content-Type: text/xml');
	//echo $outXml;
	header('Location: ' . $_SERVER['HTTP_REFERER']);

 ?>
