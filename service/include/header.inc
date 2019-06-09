<?php

ini_set('session.use_cookies', 0);
ini_set('session.use_trans_sid', 1);

header('Content-Type:text/xml');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE');
    header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');
} else {
    header('Access-Control-Allow-Origin: *');
}

function get_input_dom($schema_file, $is_relax_ng = false) {
    $xml_post = file_get_contents('php://input');
    if (!$xml_post) {
        throw new Exception('Error: no input file', 1);
    }

    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $dom->loadXML($xml_post);

    if (!$dom) {
        throw new Exception('Error: resource isn\'t XML document.', 1);
    }

    if ($is_relax_ng) {
        if (!$dom->relaxNGValidate($schema_file)) {
            throw new Exception('Error: not valid input XML document.', 1);
        }
    } else {
        if (!$dom->schemaValidate($schema_file)) {
            throw new Exception('Error: not valid input XML document.', 1);
        }
    }

    return $dom;
}