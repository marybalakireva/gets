<?php

    require_once('utils/process_request.inc');
    require_once('utils/constants.inc');
    require_once('utils/methods_url.inc');
    require_once('utils/array2xml.inc');

    session_start();

    $id = $_POST["id"]; 

    $outArray = array();

    $outArray['auth_token'] = $_SESSION['g2t_token'];
    $outArray['id'] = $id;

    $data = array2xml($outArray, 'params', false);

    $outStr = process_request(DELETE_CATEGORY_METHOD_URL, '<request>' . $data . '</request>', 'Content-Type: text/xml'); 

    //echo $outStr ;
    header('Location: ' . $_SERVER['HTTP_REFERER']);
?>