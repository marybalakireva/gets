<?php
include_once('config.inc');

define('LOGIN_METHOD_URL', 'http://' . GETS_SERVER_URL . 'login.php');
define('LOGOUT_METHOD_URL', 'http://' . GETS_SERVER_URL . 'logout.php');
define('AVAILABLE_CHANNELS_METHOD_URL', 'http://' . GETS_SERVER_URL . 'available_channels.php');
define('WRITE_TAG_METHOD_URL', 'http://' . GETS_SERVER_URL . 'addPoint.php');
define('SUBSCRIBED_METHOD_URL', 'http://' . GETS_SERVER_URL . 'subscribed.php');
define('SUBSCRIBE_METHOD_URL', 'http://' . GETS_SERVER_URL . 'subscribe.php');
define('UNSUBSCRIBE_METHOD_URL', 'http://' . GETS_SERVER_URL . 'unsubscribe.php');
define('LOAD_POINTS_METHOD_URL', 'http://' . GETS_SERVER_URL . 'loadPoints.php');
define('ADD_CHANNEL_METHOD_URL', 'http://' . GETS_SERVER_URL . 'addChannel.php');
define('GET_CATEGORIES_METHOD_URL', 'http://' . GETS_SERVER_URL . 'getCategories.php');
define('LOAD_TRACKS_METHOD_URL', 'http://' . GETS_SERVER_URL . 'loadTracks.php');
define('LOAD_TRACK_METHOD_URL', 'http://' . GETS_SERVER_URL . 'loadTrack.php');
define('ADD_TRACK_METHOD_URL', 'http://' . GETS_SERVER_URL . 'createTrack.php');
define('REMOVE_TRACK_METHOD_URL', 'http://' . GETS_SERVER_URL . 'deleteTrack.php');
define('GET_UPLOAD_LINK_METHOD_URL', 'http://' . GETS_SERVER_URL . 'files/uploadFile.php');
define('REMOVE_POINT_METHOD_URL', 'http://' . GETS_SERVER_URL . 'deletePoint.php');
define('GET_USER_INFO', 'http://' . GETS_SERVER_URL . 'userInfo.php');
define('USER_LOGIN', 'http://' . GETS_SERVER_URL . 'userLogin.php');
define('UPDATE_POINT', 'http://' . GETS_SERVER_URL . 'updatePoint.php');
define('PUBLISH', 'http://' . GETS_SERVER_URL . 'publish.php');
define('UNPUBLISH', 'http://' . GETS_SERVER_URL . 'unpublish.php');

define('ADD_FEEDBACK_METHOD_URL', 'http://etourism.cs.karelia.ru:20200/mbalakir/service/addFeedback.php');
define('GET_FEEDBACK_METHOD_URL', 'http://'. GETS_SERVER_URL.'getFeedback.php');
?>