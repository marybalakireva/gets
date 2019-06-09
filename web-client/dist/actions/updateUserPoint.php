<?php

    require_once('utils/process_request.inc');
    require_once('utils/constants.inc');
    require_once('utils/methods_url.inc');

    session_start();

    $outArray = array();
    //$outArray['auth_token'] = $_SESSION['g2t_token'];
    $outArray['auth_token'] = $_SESSION['g2t_token'];

    !isset($_POST['point_id']) ?: $outArray['point_id'] = $_POST['point_id'];
    !isset($_POST['name']) ?: $outArray['name'] = htmlspecialchars($_POST['name']);
    !isset($_POST['description']) ?: $outArray['description'] = htmlspecialchars($_POST['description']);
    !isset($_POST['url']) ?: $outArray['url'] = htmlspecialchars($_POST['url']);
    !isset($_POST['category']) ?: $outArray['category_id'] = htmlspecialchars($_POST['category']);
    !isset($_POST['latitude']) ?: $outArray['latitude'] = htmlspecialchars($_POST['latitude']);
    !isset($_POST['longitude']) ?: $outArray['longitude'] = htmlspecialchars($_POST['longitude']);
    !isset($_POST['radius']) ?: $outArray['radius'] = htmlspecialchars($_POST['radius']);
    !isset($_POST['audio_track_url']) ?: $outArray['audio_track_url'] = htmlspecialchars($_POST['audio_track_url']);

    if(isset($_POST["snap0"])){
        $i = 0;
        $outArray['snaps'] = "<snaps>";
        while(isset($_POST["snap$i"])){        
            $outArray['snaps'] .= "<snap>" . htmlspecialchars($_POST["snap$i"]) . "</snap>";
            $i++;
        }
        $outArray['snaps'] .= "</snaps>";
    }

    $data = array2xml($outArray, 'params', false);

    $string = process_request(UPDATE_USER_POINT, '<request>' . $data . '</request>', 'Content-Type: text/xml'); 

    echo  $string; 
    header('Location: ' . $_SERVER['HTTP_REFERER']);

    //Overrive to snaps contain  (crutch)
    function array2xml($array, $wrap='params') {
        // set initial value for XML string
        $xml = '';
        // wrap XML with $wrap TAG
        if ($wrap != null) {
            $xml .= "<$wrap>\n";
        }
        // main loop
        traversArray($array, $xml);

        // close wrap TAG if needed
        if ($wrap != null) {
            $xml .= "\n</$wrap>\n";
        }
        // return prepared XML string
        return $xml;
    }

    function traversArray($array, &$xml) {
        foreach ($array as $key=>$value) {           
            // append to XML string
            if($key == 'snaps'){
                $xml .= $value;
                continue;
            }
            $xml .= "<$key>" . htmlspecialchars($value) . "</$key>";
          
        }
    }

?>