<?php

/**
 * Function returns XML string for input associative array.
 * @param Array $array Input associative array
 * @param String $wrap Wrapping tag
 */
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
        if (is_array($value)) {
            $xml .= is_string($key) ? "<$key>" : '';
            traversArray($value, $xml);
            $xml .= is_string($key) ? "</$key>" : '';
        } else {
            // append to XML string
            $xml .= "<$key>" . htmlspecialchars($value) . "</$key>";
        }
    }
}

?>