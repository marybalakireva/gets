<?php
require_once('utils/process_request.inc');
require_once('utils/constants.inc');
require_once('utils/methods_url.inc');
require_once('utils/array2xml.inc');

header ('Content-Type:text/xml');

if (!isset($_GET['post_url'])) {
    die('<response><status><code>1</code><message>Post url is not set.</message></status></response>');
}

echo process_request($_GET['post_url'], file_get_contents('php://input'), 'Content-Type: ' . $_SERVER['CONTENT_TYPE']);
?>