<?php

    require_once('utils/process_request.inc');
    require_once('utils/constants.inc');
    require_once('utils/methods_url.inc');
    require_once('utils/array2xml.inc');

    //header ('Content-Type:text/xml');

    if(!isset($_POST['user_id'])){
       
        echo "Не выбран пользователь";
        return;
    }

    session_start();

    $outArray = array();
    $outArray['auth_token'] = $_SESSION['g2t_token'];

    $outArray['id'] = $_POST['user_id'];

    $data = array2xml($outArray, 'params', false);

    $string = process_request(GET_USER_TRACKS_URL, '<request>' . $data . '</request>', 'Content-Type: text/xml'); 

    $stringCategories = process_request(GET_CATEGORIES_METHOD_URL, '<request><params></params></request>', 'Content-Type: text/xml'); 
        
    $xmlCategories = new SimpleXMLElement($stringCategories);

    $categories = array(); 
    foreach($xmlCategories->xpath("content/categories/category") as $i){
        $categories["$i->id"] = $i->name; 
    }

    $xml = new SimpleXMLElement($string);

    $outStr = "";

    $outStr .= "<thead>
                    <tr>
                        <th id=\"id\">id</th>
                        <th id=\"name\">Name</th>      
                        <th>#</th>                           
                    </tr>
                </thead>";

    foreach($xml->xpath("content/tracks/track") as $i){

        $id = $i->info->category_id;

        $outStr .=  "<tr class=\"maintr\">
                        <td>" . htmlentities($i->id) . "</td>
                        <td>" . htmlentities($i->info->hname) . "</td>
                     </tr>";
                        
        $outStr .= "<tr class=\"subtr\"> <td colspan=\"3\" >";   

        $outStr .= "    <form method=\"post\" action=\"./actions/updateUserTrack.php\" >

                        <input name=\"track_id\" type=\"hidden\" value=\"" . htmlentities($i->id) . "\"/>                           

                        <label>" . getString('name','Name') . ": </label>
                                <input name=\"name\" type=\"text\" class=\"form-control\" value=\"" . htmlentities($i->info->hname) . "\"/>
                        
                        <label>" . getString('description','Description') . ": </label>
                                <textarea name=\"description\" type=\"textarea\" class=\"form-control\">" . htmlentities($i->info->description) . "</textarea>

                        <label>" . getString('url','Url') . ": </label>
                                <input name=\"url\" type=\"text\" class=\"form-control\" value=\"" . htmlentities($i->url) . "\"/>

                        <label>" . getString('language','Language') . ": </label>
                            <input name=\"lang\"type=\"text\" class=\"form-control\" value=\"" . htmlentities($i->info->lang). "\"/>

                        <label>" . getString('category','Category') . ": </label>  

                        <div class=\"btn-group\" role=\"group\">
                                <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">"
                                    . $categories["$id"] . 
                                    "<span class=\"caret\"></span>
                                </button>                                
                                <ul class=\"dropdown-menu\">"; 

                                    foreach($categories as $key=>$value){
                                        $outStr .= "<li><a id=\"$key\" class=\"dropdown-menu-item\">$value</a></li>";
                                    }

        $outStr .=              "</ul>   
                                 <input name=\"category\"type=\"hidden\" class=\"form-control\" value=\"" . htmlentities($i->info->category_id) . "\"/>                      
                        </div><br/>

                        <label>Список Точек: </label>";

                        if(isset($i->tags)){                            
                            foreach($i->tags->xpath("child::*") as $j){

                                $outStr .= "<br/>
                                            <label class=\"point\" id=\"" . htmlentities($j->id) . "\">" . htmlentities($j->id) . " " .htmlentities($j->name)  . "</label>";                  
                            }   
                        }
                       
        $outStr .=     "<br/><br/> 
                        <input name=\"submit\" type=\"submit\" value=\"" . getString('update','Update') . "\" class=\"btn btn-primary\"/>
                        </form>
                        <form method=\"post\" action=\"./actions/deleteTrack.php\" > 
                            <input name=\"submit\" type=\"submit\" value=\"" . getString('delete','Delete') . "\" class=\"btn btn-danger\"/> 
                            <input name=\"id\" type=\"hidden\" value=\"" . $i->id  . "\"/>
                        </form>";

        $outStr .= "</td> </tr>";        

    }
    echo $outStr;

?>