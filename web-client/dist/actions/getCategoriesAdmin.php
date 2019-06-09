<?php

require_once('utils/process_request.inc');
require_once('utils/constants.inc');
require_once('utils/methods_url.inc');
require_once('utils/array2xml.inc');

//header ('Content-Type:text/xml');

$post_data_json = file_get_contents('php://input');
$post_data_array = json_decode($post_data_json, true);
$data = array2xml($post_data_array, 'params', false);

$string = process_request(GET_CATEGORIES_METHOD_URL, '<request>' . $data . '</request>', 'Content-Type: text/xml');


$xml = new SimpleXMLElement($string);

$outStr = "";

$outStr .= "<thead>
                    <tr>
                        <th id=\"id\">id</th>
                        <th id=\"name\">name</th>                                
                        <th>#</th>                                    
                    </tr>
                </thead>";

foreach ($xml->xpath("content/categories/category") as $i) {
    print_r($i->id);
    $outStr .= "<tr class=\"maintr\">" .
        "<td>" . htmlentities($i->id) . "</td>" .
        "<td>" . htmlentities($i->name) . "</td>" .
        "<td>   
                                            </td>
                                        </tr> 
                                        <tr class=\"subtr\"> <td colspan=\"3\"> 
                                        <form method=\"post\" action=\"./actions/updateCategory.php\" >

                                                <input name=\"id\" type=\"hidden\" value=\"" . htmlentities($i->id) . "\"/> 

                                                <label>" . getString('name', 'Name') . ": </label>
                                                    <input name=\"name\" type=\"text\" class=\"form-control\" value=\"" . htmlentities($i->name) . "\"/>  

                                                <label>" . getString('description', 'Description') . ": </label>
                                                        <textarea name=\"description\" type=\"textarea\" class=\"form-control\">" . htmlentities($i->description) . "</textarea>

                                                <label>" . getString('url', 'Url') . ": </label>
                                                        <input name=\"url\" type=\"text\" class=\"form-control\" value=\"" . htmlentities($i->url) . "\"/>
                                                <br/> 
                                                <input name=\"submit\" type=\"submit\" value=\"" . getString('update', 'Update') . "\" class=\"btn btn-primary\"/>
                                            </form>
                                            <form method=\"post\" action=\"./actions/deleteCategoryAdmin.php\" > 
                                                <input name=\"submit\" type=\"submit\" value=\"" . getString('delete', 'Delete') . "\" class=\"btn btn-danger\"/> 
                                                <input name=id type=\"hidden\" value=\"" . $i->id . "\"/>
                                            </form>
                                            </td>
                                        </tr>";
}

echo $outStr;

?>