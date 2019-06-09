<?php

    if(file_put_contents("points.json", $_POST['jsonPoints']))
        echo json_encode(array("res" => "ok"));

?>