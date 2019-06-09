<?php
include_once('geo2tag_errors_list.inc');
include_once('config.inc');
include_once('methods_url.inc');
include_once('auth.inc');

define('SPACE_ALL', 0);
define('SPACE_PUBLIC', 1);
define('SPACE_PRIVATE', 2);

/*
    Function processes request to geo2tag server

    Params:
        method - url of method that need to be called in geo2tag
	data - data in JSON format that need to be sent along with the request
	content_type - type of content in HTTP notation
 */
function process_request($method, $data, $content_type) {
	/* Initialize and configure curl request */
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_HTTPHEADER, array($content_type));
	curl_setopt($ch, CURLOPT_URL, $method);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

	/* Execute request and send result to the client */
	$result = curl_exec($ch);
	if (curl_errno($ch)) {
		echo curl_error($ch);
		return;
	} else {
		curl_close($ch);
		return $result;
	}
}

/*
   Function performs json request using google authentication method
 */
function process_json_request($method, $array, $gets_token = null, $allow_token_refreshing = true) {
    if ($gets_token !== null) {
        auth_set_token($gets_token);
        $geo2tag_token = auth_get_geo2tag_token();
        session_commit();
        $array['auth_token'] = $geo2tag_token;
    }

    $request_json = unicode_json_encode($array);

    $response_json = process_request($method, $request_json, 'Content-Type:application/json');
    if (!$response_json) {
        throw new Exception('Error: problem with request to geo2tag.', 1);
    }

    $response_array = json_decode($response_json, true);
    if (!$response_array) {
        throw new Exception('Error: can\'t decode data from geo2tag.', 1);
    }

    $response_code = $response_array['errno'];
    if ($response_code === WRONG_TOKEN_ERROR && $allow_token_refreshing === true && $gets_token !== null) {
        auth_set_token($gets_token);
        auth_refresh_geo2tag_access();
        session_commit();

        return process_json_request($method, $array, $gets_token, false);
    }

    if ($response_code !== SUCCESS) {
        $error_str = check_errors($response_code);

        switch ($response_code) {
        case CHANNEL_ALREADY_EXIST_ERROR: 
            throw new ChannelAlreadyExistException($error_str, $response_code);
        case CHANNEL_ALREADY_SUBSCRIBED_ERROR:
            throw new ChannelAlreadySubscribedException($error_str, $response_code);
        case CHANNEL_NOT_SUBCRIBED_ERROR:
            throw new ChannelNotSubscribedException($error_str, $response_code);
        case WRONG_TOKEN_ERROR:
            throw new WrongTokenException($error_str, $response_code);
        default:
            throw new Exception($error_str, $response_code);
        }
    }

    return $response_array;
}

/*
    Function for checking for errors in response from geo2tag

    Params:
        code - errno code that geo2tag send in response
 */
function check_errors($code) {
	switch($code) {
		case SUCCESS:
			return 'Ok';
		case WRONG_TOKEN_ERROR:
			return 'Wrong token error';
		case USER_ALREADY_EXIST_ERROR:
			return 'User already exist error';
		case USER_DOES_NOT_EXIST_ERROR:
			return 'User does not exist error';
		case CHANNEL_ALREADY_EXIST_ERROR:
			return 'Channel already exist error';
		case CHANNEL_DOES_NOT_EXIST_ERROR:
			return 'Channel does not exist error';
		case SUBSCRIPTION_ALREADY_EXIST:
			return 'Subscription already exist error';
		case INTERNAL_DB_ERROR:
			return 'Internal database error';
		case INCORRECT_QUERY_NAME_ERROR:
			return 'Incorrect query name error';
		case INCORRECT_JSON_ERROR:
			return 'Incorrect JSON error';
		case INCORRECT_CREDENTIALS_ERROR:
			return 'Incorrect credentials error';
		case CHANNEL_NOT_SUBCRIBED_ERROR:
			return 'Channel not subscribed error';
		case CHANNEL_ALREADY_SUBSCRIBED_ERROR:
			return 'Channel already subscribed error';
		case TAG_DOES_NOT_EXIST_ERROR:
			return 'Tag does not exist error';
		case TAG_ALREADY_EXIST_ERROR:
			return 'Tag already exist error';
		case NULL_TIMESLOT_ERROR:
			return 'Null timeslot error';
		case UNKNOWN_ERROR:
			return 'Unknown error';
		case TMP_USER_ALREADY_EXIST_ERROR:
			return 'TMP user already exist error';
		case NETWORK_ERROR:
			return 'Network error';
		case EMAIL_ALREADY_EXIST_ERROR:
			return 'Email already exist error';
		case WEAK_PASSWORD_ERROR:
			return 'Weak password error';
		case NOT_SUPPORTED:
			return 'Not supported';
		case DB_DOES_NOT_EXIST_ERROR:
			return 'Database does not exist error';
		case USER_DOES_NOT_OWN_CHANNEL_ERROR:
			return 'User does not own channel error';
		default:
			return 'Unlisted error';
	}
}

function send_error($code, $message) {
	$xml_response = '<?xml version="1.0" encoding="UTF-8"?>';
	$xml_response .= '<response><status>';
	$xml_response .= '<code>' . $code . '</code>';
	$xml_response .= '<message>' . $message . '</message>';
	$xml_response .= '</status></response>';
	echo $xml_response;
}

function send_result($code, $message, $content) {
	$xml_response = '<?xml version="1.0" encoding="UTF-8"?>';
	$xml_response .= '<response><status>';
	$xml_response .= '<code>' . $code . '</code>';
	$xml_response .= '<message>' . $message . '</message>';
	$xml_response .= "</status>\n";
	$xml_response .= '<content>' . $content . '</content>';
	$xml_response .= "</response>\n";
	echo $xml_response;
}

function add_place_mark(&$xml, $label, $description, $url, $datetime, $latitude, $longitude, $altitude, $id, $access = null, $category_id = null) {
    // Try parse description json
    $description_json = json_decode($description, true);
    $url_json = json_decode($url, true);

    //Get inner description
    $inner_description = null;
    if ($description_json && array_key_exists('description', $description_json)) {
        $inner_description = $description_json['description'];
    }

    $xml .= '<Placemark>';
    $xml .= '<name>' . htmlspecialchars($label) . '</name>';

    if (!$description_json)
        $xml .= '<description>' . '<![CDATA[' . $description . ']]>' . '</description>';
    else if ($inner_description)
        $xml .= '<description>' . '<![CDATA[' . $inner_description . ']]>' . '</description>';
    else
        $xml .= '<description></description>';

    $xml .= '<ExtendedData xmlns:gets="http://gets.cs.petrsu.ru/">';
    $xml .= '<Data name="link"><value>' . htmlspecialchars($url) . '</value></Data>';
    $xml .= '<Data name="time"><value>' . htmlspecialchars($datetime) . '</value></Data>';

    if ($access != null) {
        $xml .= '<Data name="access"><value>' . $access . '</value></Data>';
    }

    if ($category_id && (!$description_json || !array_key_exists("category_id", $description_json))) {
        $xml .= '<Data name="category_id"><value>' . htmlspecialchars($category_id) . '</value></Data>';
    }

    $description_json = safe_merge_arrays($description_json, $url_json);

    $uuid_found = false;

    if ($description_json) {
        foreach ($description_json as $key => $value) {
            if (is_scalar($value)) {
                $value = htmlspecialchars($value);
                $xml .= "<Data name=\"$key\"><value>$value</value></Data>";
            }

            if ($key == "uuid") {
                $uuid_found = true;
            }
        }

        // Custom elements must be after 'Data'
        foreach ($description_json as $key => $value) {
            if (is_array($value) && $key == 'photo') {
                foreach ($value as $sub_value) {
                    $xml .= "<gets:photo>$sub_value</gets:photo>";
                }
            }
        }
    }

    if (!$uuid_found) {
        $xml .= "<Data name=\"uuid\"><value>$id</value></Data>";
    }

    $xml .= '</ExtendedData>';

    $xml .= '<Point><coordinates>' . $longitude . ',' . $latitude . ',' . $altitude . '</coordinates></Point>';
    $xml .= '</Placemark>';
}


/**
    Function finds and returns named argument from request DOM
    Params:
        dom - DOM representing client request
        field - name of argument
        default_value (optional) - return value if argument not specified

    Returns:
        argument as string or null if argument not specified

 */
function get_request_argument($dom, $field, $default_value = null) {
    $element = $dom->getElementsByTagName($field);
    $is_defined = $element->length > 0;
    if ($is_defined)
        return $element->item(0)->nodeValue;
    else
        return $default_value;
}

/**
 * @param $dom DOMNode
 * @return associative array of first level children
 */
function get_request_array($dom) {
    $ret = array();
    for ($node = $dom->firstChild; $node !== null; $node = $node->nextSibling) {
        if ($node->nodeType == XML_ELEMENT_NODE
                && $node->firstChild !== null
                && $node->firstChild->nodeType == XML_TEXT_NODE) {
            $ret[$node->nodeName] = $node->firstChild->nodeValue;
        }
    }
    return $ret;
}

/**
 * @param $dom DOMNode
 * @param $tag string
 * @return array of children with given name
 */
function get_request_plain_array($dom, $tag) {
    $ret = array();
    for ($node = $dom->firstChild; $node !== null; $node = $node->nextSibling) {
        if ($node->nodeType == XML_ELEMENT_NODE && $node->firstChild !== null && $node->firstChild->nodeType == XML_TEXT_NODE && $node->nodeName === $tag) {
            $ret[] = $node->firstChild->nodeValue;
        }
    }
    return $ret;
}

function get_array_element($array, $field, $default_value = null) {
    if (array_key_exists($field, $array))
        return $array[$field];
    else
        return $default_value;
}

function safe_merge_arrays($array1, $array2) {
    if ($array1 === null && $array2 === null) {
        return null;
    } else if ($array1 === null) {
        return $array2;
    } else if ($array2 === null) {
        return $array1;
    } else {
        return array_merge($array2, $array1);
    }
}

/**
    Returns all available categories as array
    Params:
        token - optional token for caching categories

    Returns:
        array of categories represented as dictionaries {id, name, description, url}

    Throws:
        Exception on network error
 */
function get_categories($token = null) {
    $categories_request_content = '<?xml version="1.0" encoding="UTF-8"?><methodCall><methodName>getCategories</methodName></methodCall>';
    $categories_response = process_request(GETS_SCRIPTS_URL,
                                    $categories_request_content,
                                    'Content-Type: text/xml');

    if (!$categories_response)
        throw new Exception('Cannot request categories from geo2tag', 1);


    $categories_response_dom = new DOMDocument();
    $categories_response_dom->loadXML($categories_response);
    if (!$categories_response_dom) 
        throw new Exception('Categories response not XML file', 1);


    $idx = 0;
    $ret = array();

    $categories = $categories_response_dom->getElementsByTagName('struct');
    foreach ($categories as $category) {
        $item = array();
        $members = $category->getElementsByTagName('member');
        foreach ($members as $member) {
            $tag_name = $member->getElementsByTagName('name')->item(0)->nodeValue;
            $item[$tag_name] = $member->getElementsByTagName('value')->item(0)->getElementsByTagName('string')->item(0)->nodeValue;
        }

        $ret[$idx++] = $item;
    }

    return $ret;
}


function get_channel_info($channel_name, $token) {
    $request = xmlrpc_encode_request('getChannelDescription', array('channel' => $channel_name, 'gets_token' => $token));
    $response = process_request(GETS_SCRIPTS_URL, $request, 'Content-Type: text/xml');

    $xmlrpc = xmlrpc_decode($response);
    if (!is_array($xmlrpc) || xmlrpc_is_fault($xmlrpc)) {
        send_error(1, 'Can\'t load channel information');
        die();
    }

    return $xmlrpc;
}

/**
    Like var_dump but outputs to error log instead of stdin
  */
function dump_error_log($object) {
    ob_start();
    var_dump($object);
    $contents = ob_get_contents();
    ob_end_clean();
    error_log($contents);
}

# http://stackoverflow.com/questions/2040240/php-function-to-generate-v4-uuid
function uuidv4()
{
    $data = openssl_random_pseudo_bytes(16);
    assert(strlen($data) == 16);

    $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

/**
 * Escapes value before insertion to database of needed
 * @param resource $dbconn
 * @param mixed $value
 */
function convert_database_value($dbconn, $value) {
    if (is_bool($value)) {
        return $value ? 'true' : 'false';
    } else if (is_string($value)) {
        return "'" . pg_escape_string($dbconn, $value) . "'";
    } else if (is_numeric($value)) {
        return "$value";
    } else if (is_null($value)) {
        return "null";
    } else {
        throw new Exception("Wrong type passed to safe_pg_insert");
    }
}

/**
 * pg_insert without backslash escaping issues
 * @param $dbconn
 * @param $table
 * @param $data_array
 * @return resource query result
 */
function safe_pg_insert($dbconn, $table, $data_array) {
    $values_array = array();
    $names_array = array();

    foreach ($data_array as $key => $value) {
        $names_array[] = $key;
        $values_array[] = convert_database_value($dbconn, $value);
    }

    $values = implode(",", $values_array);
    $names = implode(",", $names_array);
    $query = "INSERT INTO $table ($names) VALUES ($values);";
    pg_query($dbconn, $query);
    return $query;
//    return "INSERT INTO $table ($names) VALUES ($values);";
}

function get_category_name($dbconn, $category_id) {

    $result = pg_query($dbconn,"SELECT category.name FROM category WHERE category.id='$category_id';");
    $row = pg_fetch_row($result);
    if ($row) {
        return $row[0];
    } else {
        return null;
    }
}
/**
 * pg_update without possible backslash escaping issues
 */
function safe_pg_update($dbconn, $table, $data_array, $condition) {
    $sets_array = array();
    $where_array = array("TRUE");
    
    foreach ($data_array as $key => $value) {
        $value_escaped = convert_database_value($dbconn, $value);
        $sets_array[] = "$key=$value_escaped";
    }
    
    foreach ($condition as $key => $value) {
        $value_escaped = convert_database_value($dbconn, $value);
        $where_array[] = "$key=$value_escaped";
    } 
    
    $sets_string = implode(",", $sets_array);
    $where_string = implode(" AND ", $where_array);
    
    return pg_query($dbconn, "UPDATE $table SET $sets_string WHERE $where_string;");
}

/*
 * Hack for UNICODE strings in json_encode() for PHP 5.3 and below.
 * 
 * Source: http://php.net/manual/ru/function.json-encode.php#105789
 */
function unicode_json_encode($arr) {
    if (defined(JSON_UNESCAPED_UNICODE)) {
        return json_encode($arr, JSON_UNESCAPED_UNICODE);
    } else {
        //convmap since 0x80 char codes so it takes all multibyte codes (above ASCII 127). 
        //So such characters are being "hidden" from normal json_encoding
        array_walk_recursive($arr, 'unicode_callback');
        return mb_decode_numericentity(json_encode($arr), array(0x80, 0xffff, 0, 0xffff), 'UTF-8');
    }
}

function unicode_callback(&$item, $key) {
    if (is_string($item)) {
        $item = mb_encode_numericentity($item, array(0x80, 0xffff, 0, 0xffff), 'UTF-8');
    }
}

function parse_extended_data($description, $input_extended_data_array) {
    if ($description) {
        # If caller pass extended data in description, process it correctly
        $extended_data_array = json_decode($description, true);
        if (!$extended_data_array) {
            $extended_data_array = array();
        } else {
            $description = null;
        }
    } else {
        $extended_data_array = array();
        $description = null;
    }

    $extended_data_array = safe_merge_arrays($extended_data_array, $input_extended_data_array);

    if (!array_key_exists("description", $extended_data_array) && $description) {
        $extended_data_array["description"] = $description;
    }

    if (!array_key_exists("uuid", $extended_data_array)) {
        $extended_data_array["uuid"] = uuidv4();
    }

    return $extended_data_array;
}

/**
 * Checks if channel for category_id exists and creates it otherwise
 *
 * @param $dbconn resource PostgreSQL connection
 * @param $category_id integer id of category
 * @return string name if channel
 */
function ensure_category_channel($dbconn, $category_id) {
    $user_id = auth_get_db_id($dbconn);
    $channel_name = "ch+${category_id}+${user_id}";
    $channel_name_escaped = pg_escape_string($dbconn, $channel_name);

    $select_request = "SELECT channel.id FROM channel WHERE channel.name='${channel_name_escaped}';";
    $select_resp = pg_query($dbconn, $select_request);

    if (pg_num_rows($select_resp) == 0) {
        $desc_array = array('description' => "Private channel for category ${category_id} user ${user_id}",
                'category_id' => "${category_id}");
        $description = pg_escape_string($dbconn, json_encode($desc_array));

        $insert_request = "INSERT INTO channel (name, description, url, owner_id) VALUES ('${channel_name_escaped}', '${description}', '{}', ${user_id}) RETURNING channel.id;";
        $insert_resp = pg_query($dbconn, $insert_request);

        $tmp_row = pg_fetch_row($insert_resp);
        $channel_id = $tmp_row[0];

        $insert_subscribe_request = "INSERT INTO subscribe VALUES (${channel_id}, ${user_id});";
        pg_query($dbconn, $insert_subscribe_request);
    }

    return $channel_name;
}

/**
 * Check if category with given id exists or throw
 * @param $dbconn resource
 * @param $category_id integer
 * @throws Exception if category doesn't exist
 */
function require_category($dbconn, $category_id) {
    $response = pg_query_params($dbconn, 'SELECT category.id FROM category
      INNER JOIN users ON category.owner_id=users.id
      WHERE users.email=$1 AND category.id=$2;', array(GEO2TAG_EMAIL, $category_id));

    if (pg_num_rows($response) === 0) {
        throw new Exception("Category $category_id doesn't exist", 1);
    }
}

/**
 * Check if current user is admin
 * Function requires authentication using auth_set_token
 * @param $dbconn resource
 * @return integer owner id of current project or zero if user is not admin
 */
function is_user_admin($dbconn) {
    $user_login = auth_get_db_login($dbconn);

    if ($user_login === GEO2TAG_USER) {
        $response = pg_query_params($dbconn,
            'SELECT users.id FROM users WHERE users.login=$1;', array($user_login));
    } else {
        $response = pg_query_params($dbconn,
            'WITH owner_ids AS (SELECT users.id as owner_id
                FROM users
                WHERE users.login=$1)

            SELECT "adminUsers".owner_id
                FROM users
                INNER JOIN "adminUsers" ON users.id = "adminUsers".admin_id
                INNER JOIN owner_ids ON owner_ids.owner_id = "adminUsers".owner_id
                WHERE users.login=$2;', array(GEO2TAG_USER, $user_login));
    }

    $row = pg_fetch_row($response);
    if (!$row) {
        return 0;
    }

    return $row[0];
}

/**
 * Check if current user is admin
 * Function requires authentication using auth_set_token
 * @param $dbconn resource
 * @throws Exception if user not admin
 * @return integer owner id of current project
 */
function require_user_admin($dbconn) {
    $id = is_user_admin($dbconn);

    if ($id <= 0) {
        throw new Exception("User required to be admin", 1);
    }

    return $id;
}

function is_user_trusted($dbconn) {
    $user_login = auth_get_db_login($dbconn);

    if ((defined("ALL_USERS_TRUSTED") && ALL_USERS_TRUSTED == 'true')
        || $user_login === GEO2TAG_USER) {
        $response = pg_query_params($dbconn,
            'SELECT users.id FROM users WHERE users.login=$1;', array(GEO2TAG_USER));
    } else {
        $response = pg_query_params($dbconn,
            'WITH owner_ids AS (SELECT users.id as owner_id
                   FROM users
                   WHERE users.login=$1)
            SELECT COALESCE("trustedUsers".owner_id, "adminUsers".owner_id) as owner_id
                FROM users
                LEFT JOIN "adminUsers" ON users.id = "adminUsers".admin_id
                LEFT JOIN "trustedUsers" ON users.id = "trustedUsers".user_id
                WHERE (("adminUsers".owner_id IN (SELECT owner_id FROM owner_ids))
                        OR ("trustedUsers".owner_id IN (SELECT owner_id FROM owner_ids)))
                    AND users.login=$2;', array(GEO2TAG_USER, $user_login));
    }

    $row = pg_fetch_row($response);
    if (!$row) {
        return 0;
    }

    return $row[0];
}

function require_user_trusted($dbconn) {
    $id = is_user_trusted($dbconn);

    if ($id <= 0) {
        throw new Exception("User required to be trusted", 1);
    }

    return $id;
}


/*
 * Check that user with $auth_token or public user subscribed to channel $channel_name
 * Returns: array (channel_id, is_owned)
 */
function require_channel_accessible($dbconn, $channel_name, $is_public) {
    if (!$is_public) {
        $email = auth_get_google_email();
    } else {
        $email = GEO2TAG_EMAIL;
    }

    $result_check = pg_query_params($dbconn, 'SELECT channel.id, BOOL_OR(users.email=$1) FROM channel 
            INNER JOIN subscribe ON channel.id = subscribe.channel_id 
            INNER JOIN users ON users.id = subscribe.user_id 
            WHERE (users.email=$1 OR users.login=$2) AND channel.name=$3
            GROUP BY channel.id;',
        array($email, GEO2TAG_USER, $channel_name));

    if (!($result_check_row = pg_fetch_row($result_check))) {
        throw new Exception('Channel not subscribed', 1);
    }

    // Replace 't'/'f' with true/false
    $result_check_row[1] = $result_check_row[1] === 't';
    return $result_check_row;
}

/**
 * Check that current user owns channel $channel_name
 * Admin users also has permissions
 * Returns: array (user_id, channel_id)
 */
function require_channel_owned($dbconn, $channel_name) {
    if (is_user_admin($dbconn)) {
	$result_check = pg_query_params($dbconn, 'SELECT users.id, channel.id FROM channel 
            INNER JOIN users ON users.id = channel.owner_id 
            WHERE channel.name=$1;', array($channel_name));
    } else {
	$email = auth_get_google_email();
	$result_check = pg_query_params($dbconn, 'SELECT users.id, channel.id FROM channel 
            INNER JOIN users ON users.id = channel.owner_id 
            WHERE users.email=$1 AND channel.name=$2;', array($email, $channel_name));
    }

    if (!($result_check_row = pg_fetch_row($result_check))) {
        throw new Exception("Channel ${channel_name} not owned", 1);
    }

    return $result_check_row;
}

/**
 * Check is user owns share with given key
 * @param type $dbconn database connection
 * @param type $key share key
 * @return boolean
 */
function check_key_owned($dbconn, $key) {
    if (is_user_admin($dbconn)) {
        return true;
    }
    
    $email = auth_get_google_email();
    $result = pg_query_params($dbconn, "SELECT count(*) "
            . "FROM share "
            . "JOIN channel ON share.channel_id = channel.id "
            . "JOIN users ON users.id = channel.owner_id "
            . "AND users.email=$1 AND share.key=$2;", array($email, $key));
    
    $row = pg_fetch_row($result);
    
    return $row[0] > 0;
}

function get_channel_id($dbconn, $channel_name) {
    $result = pg_query_params($dbconn, 'SELECT id FROM channel WHERE name = $1;', array($channel_name));
    $row = pg_fetch_row($result);
    if ($row) {
        return $row[0];
    } else {
        return null;
    }
}

// https://stackoverflow.com/questions/834303/startswith-and-endswith-functions-in-php
function starts_with($haystack, $needle) {
    // search backwards starting from haystack length characters from the end
    return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== FALSE;
}

function ends_with($haystack, $needle) {
    // search forward starting from end minus needle length characters
    return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== FALSE);
}

/**
 * Check that channel id represents track
 * 
 * @deprecated
 * @param string $track_id
 * @return boolean yes/no
 */
function check_track_id($track_id) {
    return starts_with($track_id, "tr+");
}

function date_gets_to_postgres($gets_date) {
    $date_parsed = date_create_from_format('d m Y H:i:s.u', $gets_date);
    return date_format($date_parsed, 'Y-m-d H:i:s.u');
}

function date_postgres_to_gets($gets_date) {
    $date_parsed = date_create_from_format('Y-m-d H:i:s.u', $gets_date);
    if (!$date_parsed) {
        $date_parsed = date_create_from_format('Y-m-d H:i:s', $gets_date);
    }
    return date_format($date_parsed, 'd m Y H:i:s.u');
}

// display error description in xml validation
function libxml_display_error($error)
{
    $return = "";
    switch ($error->level) {
        case LIBXML_ERR_WARNING:
            $return .= "Warning $error->code: ";
            break;
        case LIBXML_ERR_ERROR:
            $return .= "Error $error->code: ";
            break;
        case LIBXML_ERR_FATAL:
            $return .= "Fatal Error $error->code: ";
            break;
    }
    $return .= trim($error->message);
    if ($error->file) {
        $return .=    " in $error->file";
    }
    $return .= " on line $error->line";
    $return .= " on column $error->column";

    return $return;
}

// gather all errors in xml validation
function libxml_display_errors() {
    $return = "<errors>";
    $errors = libxml_get_errors();
    foreach ($errors as $error) {
        $return .= "<error>".libxml_display_error($error)."</error>";
    }
    libxml_clear_errors();
    
    return $return."</errors>";
}
