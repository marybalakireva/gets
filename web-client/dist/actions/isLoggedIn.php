<?php
session_start();
$result = array();
if (isset($_SESSION['g2t_token'])) {
    $result['status'] = true;
    echo json_encode($result);
} else {
    $result['status'] = false;
    echo json_encode($result);
}
?>

