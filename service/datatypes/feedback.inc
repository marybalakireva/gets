<?php

require_once 'include/utils.inc';

class Feedback
{

    public $category;
    public $comment = "";


    public static function makeFromXmlRequest(DOMDocument $dom)
    {
        $feedback = new Feedback();

        $params_node = $dom->getElementsByTagName("params")->item(0);
        $request_array = get_request_array($params_node);

        $feedback->category = get_array_element($request_array, "category");
        $feedback->comment = get_array_element($request_array, "comment");

        return $feedback;
    }

    public function toPgArray($date, $category, $comment, $user_id,  $status)
    {
        $pg_array = array();
        $pg_array["category_id"] = $category;
        $pg_array["comment"] = $comment;
        $pg_array["date_add"] = $date;
        $pg_array["user_id"] = $user_id;
        $pg_array["status"] = $status;

        return $pg_array;
    }


}
