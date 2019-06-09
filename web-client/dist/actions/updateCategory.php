<?php

    require_once('utils/process_request.inc');
    require_once('utils/constants.inc');
    require_once('utils/methods_url.inc');
    require_once('utils/array2xml.inc');

    session_start();

    $outArray = array();
    //$outArray['auth_token'] = $_SESSION['g2t_token'];
    $outArray['auth_token'] = $_SESSION['g2t_token'];

    !isset($_POST['id']) ?: $outArray['id'] = $_POST['id'];
    !isset($_POST['name']) ?: $outArray['name'] = htmlspecialchars($_POST['name']);
    !isset($_POST['description']) ?: $outArray['description'] = htmlspecialchars($_POST['description']);
    !isset($_POST['url']) ?: $outArray['url'] = htmlspecialchars($_POST['url']);   
   
    $data = array2xml($outArray, 'params', false);

    $string = process_request(UPDATE_CATEGORY_METHOD_URL, '<request>' . $data . '</request>', 'Content-Type: text/xml'); 

    echo  $string; 
    header('Location: ' . $_SERVER['HTTP_REFERER']);
?>