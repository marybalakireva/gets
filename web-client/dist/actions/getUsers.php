<?php

    require_once('utils/process_request.inc');
    require_once('utils/constants.inc');
    require_once('utils/methods_url.inc');
    require_once('utils/array2xml.inc');

    //header ('Content-Type:text/xml');

    $outArray = array();
    $outArray['auth_token'] = $_SESSION['g2t_token'];

    $data = array2xml($outArray, 'params', false);

    $string = process_request(GET_USERS_METHOD_URL, '<request>' . $data . '</request>', 'Content-Type: text/xml'); 

    $xml = new SimpleXMLElement($string);

    $outStr = "";

    $outStr .= "<thead>
                    <tr>
                        <th id=\"id\">id</th>
                        <th id=\"name\">" . getString('name','Name') . "</th>                                
                        <th id=\"email\">eMail</th>  
                        <th id=\"rights\">" . getString('rights','Rights') . "</th>      
                        <th>#</th>                           
                    </tr>
                </thead>";

    foreach($xml->xpath("content/users/user") as $i){

        $rights = ($i->admin != "") ? "Admin" : (($i->trusted != "") ? "Trusted" : "Simple");

        if($i->id == "") continue;

                            $outStr .=  "<tr id=\"" . $i->id . "\">
                                            <td>" . $i->id . "</td>
                                            <td>" . $i->name . "</td>
                                            <td>" . $i->email . "</td>                                          
                                            <td>
                                                <div class=\"btn-group\" role=\"group\">
                                                    <button name=\"$rights\" type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">"
                                                      . getString(strtolower($rights), $rights) . 
                                                      "<span class=\"caret\"></span>
                                                    </button>
                                                    <ul class=\"dropdown-menu\" id=\"" . $i->id . "\">
                                                      <li><a id=\"Simple\" class=\"dropdown-menu-item\">" . getString('simple','Simple') . "</a></li>
                                                      <li><a id=\"Trusted\" class=\"dropdown-menu-item\">" . getString('trusted','Trusted') . "</a></li>
                                                      <li><a id=\"Admin\" class=\"dropdown-menu-item\">" . getString('admin','Admin') . "</a></li>
                                                    </ul>                        
                                                </div>
                                            </td> 
                                            <td> <input id=\"" . $i->id . "\" type=\"button\" value=\"Удалить\" class=\"btn btn-danger\"/> </td>
                                        </tr> "
                                        ;
    }

    echo $outStr;

//iseet($i->admin) ? "admin" : isset($i->trusted) ? "trusted" : "simple"
?>