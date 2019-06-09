<?php

require_once('utils/process_request.inc');
require_once('utils/constants.inc');
require_once('utils/methods_url.inc');
require_once('utils/array2xml.inc');

header('Content-Type:text/xml');

if (filter_input(INPUT_SERVER, 'REQUEST_METHOD') == 'POST') {
    $post_data_json = file_get_contents('php://input');
    $post_data_array = json_decode($post_data_json, true);
    if (!isset($post_data_array['id'])) {
        echo process_request(USER_LOGIN, '<request><params></params></request>', 'Content-Type: text/xml');
    } else {
        $data = array2xml($post_data_array, 'params', false);
        $response_token = process_request(USER_LOGIN, '<request>' . $data . '</request>', 'Content-Type: text/xml');
        if ($response_token) {
            $dom_token = new DOMDocument();
            $dom_token->loadXML($response_token);
            if (!$dom_token) {
                die('Error: resource isn\'t XML document.');
            }
            if ($dom_token->getElementsByTagName('code')->item(0)->nodeValue === '0') {
                session_start();
                $_SESSION['g2t_token'] = $dom_token->getElementsByTagName('auth_token')->item(0)->nodeValue;
                $response_email = process_request(GET_USER_INFO, '<request><params><auth_token>' . $_SESSION['g2t_token'] . '</auth_token></params></request>', 'Content-Type: text/xml');
                $dom_email = new DOMDocument();
                $dom_email->loadXML($response_email);
                if (!$dom_email) {
                    die('Error: resource isn\'t XML document.');
                }
                //var_dump($dom_email->saveXML());
                if ($dom_email->getElementsByTagName('code')->item(0)->nodeValue === '0') {
                    //var_dump($dom_email->saveXML());
                    $_SESSION['email'] = $dom_email->getElementsByTagName('email')->item(0)->nodeValue;
                    if ($dom_email->getElementsByTagName('isCoreUser')->length > 0) {
                        $_SESSION['core_user'] = $dom_email->getElementsByTagName('isCoreUser')->item(0)->nodeValue;
                    }
                    if ($dom_email->getElementsByTagName('isTrustedUser')->length > 0) {
                        $_SESSION['trusted_user'] = $dom_email->getElementsByTagName('isTrustedUser')->item(0)->nodeValue;
                    }
                    if ($dom_email->getElementsByTagName('isAdminUser')->length > 0) {
                        $_SESSION['admin_user'] = $dom_email->getElementsByTagName('isAdminUser')->item(0)->nodeValue;
                    }
                    echo $response_token;
                }
            }
        }
    }
} else {
    die('Not POST request');
}
?>