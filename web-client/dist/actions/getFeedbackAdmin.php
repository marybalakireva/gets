<?php

    require_once('utils/process_request.inc');
    require_once('utils/constants.inc');
    require_once('utils/methods_url.inc');
    require_once('utils/array2xml.inc');

    //header ('Content-Type:text/xml');

    $post_data_json = file_get_contents('php://input');
    $post_data_array = json_decode($post_data_json, true);
    $data = array2xml($post_data_array, 'params', false);


    $string = process_request(GET_FEEDBACK_METHOD_URL, '<request>' . $data . '</request>', 'Content-Type: text/xml');
    $xml = new SimpleXMLElement($string);

    $outStr = "";

    $outStr .= "<thead>
                    <tr>
                        <!--<th id=\"id\">id</th>-->
                        <th id=\"Дата добавления\">Дата добавления</th>                                
                        <th id=\"Категория\">Категория</th>    
                        <th id=\"Комментарий\">Комментарий</th> 
                        <th id=\"Пользователь\">Пользователь</th>
                        <th id=\"Статус\">Статус</th>       
                    </tr>
                </thead>";

    foreach($xml->xpath("content/feedbacks/feedback") as $i){
        $outStr .=  "<tr>" .
                                            //"<td>" . htmlentities($i->id) . "</td>" .
                                            "<td>" . htmlentities($i->date_add) . "</td>" .
                                            "<td>" . htmlentities($i->category) . "</td>" .
                                            "<td>" . htmlentities($i->comment) . "</td>" .
                                            "<td>" . htmlentities($i->user_email) . "</td>" .
                                            "<td>" . htmlentities(($i->status == 0) ? "Не обработано" : "Обработано" ) . "</td>" ."
                                        </tr> ";

                    }
    echo $outStr;
?>