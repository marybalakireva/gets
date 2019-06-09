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

    $string = process_request(GET_USER_POINTS_URL, '<request>' . $data . '</request>', 'Content-Type: text/xml'); 

    $stringCategories = process_request(GET_CATEGORIES_METHOD_URL, '<request><params></params></request>', 'Content-Type: text/xml'); 

    $xmlCategories = new SimpleXMLElement($stringCategories);

    $categories = array(); 
    foreach($xmlCategories->xpath("content/categories/category") as $i){
        $categories["$i->id"] = $i->name; 
    }
//echo $string;
    //$xml = new SimpleXMLElement($string);
    $xml = simplexml_load_string($string);

    $outStr = "";

    $outStr .= "<thead>
                    <tr>
                        <th id=\"id\">id</th>
                        <th id=\"name\">Name</th>      
                        <th>#</th>                           
                    </tr>
                </thead>";

    foreach($xml->xpath("content/tags/tag") as $i){

        $id = $i->info->category_id;

        $outStr .=  "<tr class=\"maintr\">
                        <td id=\"id\">" . htmlentities($i->id) . "</td>
                        <td id=\"name\">" . htmlentities($i->label) . "</td>
                     </tr>";
                     
        $outStr .= "<tr class=\"subtr\"> <td colspan=\"3\" >";   

        $outStr .= "    <form method=\"post\" action=\"./actions/updateUserPoint.php\" >

                        <input name=\"point_id\" type=\"hidden\" value=\"" . htmlentities($i->id) . "\"/>                           

                        <label>" . getString('name','Name') . ": </label>
                                <input name=\"name\" type=\"text\" class=\"form-control\" value=\"" . htmlentities($i->label) . "\"/>
                        
                        <label>" . getString('description','Description') . ": </label>
                                <textarea name=\"description\" type=\"textarea\" class=\"form-control\">" . htmlentities($i->info->description) . "</textarea>

                        <label>" . getString('url','Url') . ": </label>
                                <input name=\"url\" type=\"text\" class=\"form-control\" value=\"" . htmlentities($i->url->link) . "\"/>

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

                        <label>" . getString('latitude','Latitude') . ": </label>
                                <input name=\"latitude\" type=\"text\" class=\"form-control\" value=\"" . htmlentities($i->latitude) . "\"/>

                        <label>" . getString('longitude','Longitude') . ": </label>
                                <input name=\"longitude\" type=\"text\" class=\"form-control\" value=\"" . htmlentities($i->longitude) . "\"/>

                        <label>" . getString('active-radius','Active radius (meters)') . ": </label>
                                <input name=\"radius\" type=\"text\" class=\"form-control\" value=\"" . htmlentities($i->info->radius) . "\"/>

                        <label>" . getString('audio-track','Audio track') . ": </label>
                                <input name=\"audio_track_url\" type=\"text\" class=\"form-control\" value=\"" . htmlentities($i->url->audio) . "\"/>
                                    <audio controls>
                                      <source src=\"" . htmlentities($i->url->audio) . "\" >                                 
                                    Your browser does not support the audio element.
                                    </audio>
                                    <br/>
                        <label>" . getString('picture','Picture') . ": </label><br/>                                                             
                                
                                <div>";

                        $num = 0;
                        if(isset($i->url->photo)){                            
                            foreach($i->url->photo->xpath("child::*") as $j){

                                $outStr .= "<input name=\"snap" .htmlentities($num) ."\" type=\"text\" class=\"form-control\" value=\"" . $j . "\"/>
                                <img class=\"img-thumbnail\" src=\"" . htmlentities($j) . "\" height=\"250\" width=\"250\">";    
                                $num++;                        
                            }
                        }

                        $outStr .= "   <br/> 
                        <input num=\"" . $num . "\" type=\"button\" value=\"" . getString('add','Add') . " " . getString('picture','Picture') . "\" class=\"btn btn-primary addPhotoBtn\"/> </div>";

        $outStr .= "    <br/><label>" . getString('extended-data', 'Extended data') . ": </label><br/>
                        
                        <label>time: </label>
                            <label>" . $i->time . "</label><br/>

                        <label> uuid: </label>
                            <label>" . $i->info->uuid . "</label><br/>
                                ";

                        if(isset($i->info)){
                            foreach($i->info->xpath("child::*") as $key => $value){

                                if($key < 4) continue;

                                $outStr .= " <label>" . $value->getName() . ": </label>
                                                <input type=\"text\" class=\"form-control\" value=\"" . $value . "\"/>";
                            }
                        }
                                
         $outStr .= "   <br/> 
                        <input type=\"button\" value=\"" . getString('show-on-map','Show on map') . "\" class=\"btn btn-info btn-map\"/>
                        <br/><br/> 
                        <input name=\"submit\" type=\"submit\" value=\"" . getString('update','Update') . "\" class=\"btn btn-primary\"/>
                        </form>
                        <form method=\"post\" action=\"./actions/deletePointById.php\" > 
                            <input name=\"submit\" type=\"submit\" value=\"" . getString('delete','Delete') . "\" class=\"btn btn-danger\"/> 
                            <input name=\"id\" type=\"hidden\" value=\"" . $i->id  . "\"/>
                        </form>";

        $outStr .= "</td> </tr>";        

    }
    echo $outStr;

?>