<?php
session_start();
$result = array();
$result['email'] = isset($_SESSION['email']) ? $_SESSION['email'] : 'unknown';
$result['core_user'] = isset($_SESSION['core_user']) ? $_SESSION['core_user'] : false;
$result['trusted_user'] = isset($_SESSION['trusted_user']) ? $_SESSION['trusted_user'] : false;
$result['admin_user'] = isset($_SESSION['admin_user']) ? $_SESSION['admin_user'] : false;
echo json_encode($result);
?>