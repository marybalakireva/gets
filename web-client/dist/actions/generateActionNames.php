<?php

require_once('utils/config.inc');
$base_url = 'http://' . $_SERVER['SERVER_NAME'] . substr($_SERVER['REQUEST_URI'], 0, -strlen(basename(__FILE__)));

if(defined('GETS_WEB_HOST'))
    $base_url = 'http://' . GETS_WEB_HOST . substr($_SERVER['REQUEST_URI'], 0, -strlen(basename(__FILE__)));

$js_file = 'var ADD_POINT_ACTION = "' . $base_url . 'addPoint.php";';
$js_file .= 'var ADD_TRACK_ACTION = "' . $base_url . 'addTrack.php";';
$js_file .= 'var GET_CATEGORIES_ACTION = "' . $base_url . 'getCategories.php";';
$js_file .= 'var GET_POINTS_ACTION = "' . $base_url . 'getPoints.php";';
$js_file .= 'var GET_TRACK_BY_NAME_ACTION = "' . $base_url . 'getTrackByName.php";';
$js_file .= 'var GET_TRACKS_ACTION = "' . $base_url . 'getTracks.php";';
$js_file .= 'var GET_UPLOAD_LINK_ACTION = "' . $base_url . 'getUploadLink.php";';
$js_file .= 'var GET_USER_INFO_ACTION = "' . $base_url . 'getUserInfo.php";';
$js_file .= 'var IS_LOGGED_IN_ACTION = "' . $base_url . 'isLoggedIn.php";';
$js_file .= 'var LOGIN_ACTION = "' . $base_url . 'login.php";';
$js_file .= 'var LOGOUT_ACTION = "' . $base_url . 'logout.php";';
$js_file .= 'var REMOVE_POINT_ACTION = "' . $base_url . 'removePoint.php";';
$js_file .= 'var REMOVE_TRACK_ACTION = "' . $base_url . 'removeTrack.php";';
$js_file .= 'var UPDATE_POINT_ACTION = "' . $base_url . 'updatePoint.php";';
$js_file .= 'var UPLOAD_FILE_ACTION = "' . $base_url . 'uploadFile.php";';
$js_file .= 'var PUBLISH_ACTION = "' . $base_url . 'publish.php";';
$js_file .= 'var UNPUBLISH_ACTION = "' . $base_url . 'unpublish.php";';
//$js_file .= 'var ADD_FEEDBACK_ACTION = "' . $base_url . 'addFeedback.php";';
$js_file .= 'var ADD_FEEDBACK_ACTION = "' . $base_url . 'addFeedback.php";';
$js_file .= 'var GET_FEEDBACK_ACTION = "' . $base_url . 'getFeedback.php";';
$js_file .= 'var RETRANSLATOR_ACTION = "' . $base_url . 'retranslator.php";';

echo $js_file;
?>
