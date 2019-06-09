<?php
    $routeCoords = json_decode($_POST['routeCoords']);
    $fromLat = $routeCoords->fromLat;
    $fromLng = $routeCoords->fromLng;
    $toLat = $routeCoords->toLat;
    $toLng = $routeCoords->toLng;
    $disability = $routeCoords->disability;
   /* $fromLat = 61.785328;
    $fromLng = 34.347391;
    $toLat = 61.789176;
    $toLng = 34.354344;
    $disability = 1;*/
    exec("/SDK/Java/jdk/bin/java -jar graphhopper-priority.jar ". $fromLat . " " . $fromLng . " " . $toLat . " " . $toLng . " " . $disability, $result);
    echo $result[0];
?>