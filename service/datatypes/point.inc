<?php

require_once 'include/utils.inc';

class Point {
    public static $photo_extra_keys = array("photo", "photoUrl", "icon", "iconUrl");
    public static $url_extra_keys = array("photoUrl", "photo", "icon", "iconUrl", "audio", "audioUrl", "link");
    
    public $title;
    public $description = "";
    public $link = "";
    public $latitude;
    public $longitude;
    public $altitude = 0;
    public $time;
    public $uuid;
    public $key;
    
    public $access = true;
    public $category_id;

    public $extended_data = array();
    public $photos = array();

    public function merge(Point $other) {
        if ($other->title) {
            $this->title = $other->title;
        }
        
        if ($other->link) {
            $this->link = $other->link;
        }

        if ($other->description) {
            $this->description = $other->description;
        }
        
        if ($other->latitude) {
            $this->latitude = $other->latitude;
        }
        
        if ($other->longitude) {
            $this->longitude = $other->longitude;
        }
        
        if ($other->altitude) {
            $this->altitude = $other->altitude;
        }
        
        if ($other->extended_data) {
            $this->extended_data = $other->extended_data;
        }
        
        if ($other->photos) {
            $this->photos = $other->photos;
        }
    }
    
    public function toPgArray($user_id, $channel_id) {
        $pg_array = array();
        $pg_array["label"] = $this->title;
        $pg_array["latitude"] = $this->latitude;
        $pg_array["longitude"] = $this->longitude;
        $pg_array["altitude"] = $this->altitude;

        if ($user_id) {
            $pg_array["user_id"] = $user_id;
        }
        
        if ($channel_id) {
            $pg_array["channel_id"] = $channel_id;
        }
        
        $description_field_array = array();
        $url_field_array = array();
        
        $description_field_array["description"] = $this->description;
        $description_field_array["uuid"] = $this->uuid;
        
        if ($this->category_id) {
            $description_field_array["category_id"] = $this->category_id;
        }

        if (count($this->photos) !== 0) {
            $url_field_array["photo"] = $this->photos;
        }
        
        if ($this->link) {
            $url_field_array["link"] = $this->link;
        }
        
        foreach ($this->extended_data as $key => $value) {
            if (in_array($key, Point::$url_extra_keys)) {
                $url_field_array[$key] = $value;
            } else {
                $description_field_array[$key] = $value;
            }
        }
        
        $pg_array["description"] = unicode_json_encode($description_field_array);
        
        if (count($url_field_array) !== 0) {
            $pg_array["url"] = unicode_json_encode($url_field_array);
        } else {
            $pg_array["url"] = "{}";
        }
        
        $pg_time = date_gets_to_postgres($this->time);
        if ($pg_time) {
            $pg_array["time"] = $pg_time;     
        }

        return $pg_array;
    }
    
    public function toKmlPlacemark() {
        $xml = '<Placemark>';
        $xml .= '<name>' . htmlspecialchars($this->title) . '</name>';
        $xml .= '<description>' . htmlspecialchars($this->description) . '</description>';
        $xml .= '<ExtendedData xmlns:gets="http://gets.cs.petrsu.ru/">';
        
        if ($this->link) {
            $xml .= '<Data name="link"><value>' . htmlspecialchars($this->link) . '</value></Data>';
        }
        
        $xml .= '<Data name="time"><value>' . htmlspecialchars($this->time) . '</value></Data>';
        $xml .= '<Data name="uuid"><value>' . htmlspecialchars($this->uuid) . '</value></Data>';

        $xml .= '<Data name="access"><value>' . ($this->access ? "rw" : "r") . '</value></Data>';
        
        if ($this->category_id) {
            $xml .= '<Data name="category_id"><value>' . $this->category_id . '</value></Data>';
        }
        if ($this->key) {
            $xml .= '<Data name="key"><value>' . $this->key . '</value></Data>';
        }
        foreach ($this->extended_data as $key => $value) {
            if (is_scalar($value)) {
                $value = htmlspecialchars($value);
                $xml .= "<Data name=\"$key\"><value>$value</value></Data>";
            }

            if ($key === "uuid") {
                $uuid_found = true;
            }
        }

        // Custom elements must be after 'Data'
        foreach ($this->photos as $photo_url) {
            $photo_url_escaped = htmlspecialchars($photo_url);
            $xml .= "<gets:photo>${photo_url_escaped}</gets:photo>";
        }
        
        $xml .= '</ExtendedData>';

        $xml .= '<Point><coordinates>' . $this->longitude . ',' . $this->latitude . ',' . $this->altitude . '</coordinates></Point>';
        $xml .= '</Placemark>';

        return $xml;
    }
    
    // time, label, latitude, longitude, altitude, description, url, id, access, category_id
    public static function makeFromPgRow($row) {
        $point = new Point();
        
        $point->time = date_postgres_to_gets($row[0]);
        $point->title = $row[1];
        $point->latitude = $row[2];
        $point->longitude = $row[3];
        $point->altitude = $row[4];
        
        $description_array = json_decode($row[5], true);
        if ($description_array !== null) {
            $point->addExtraArray($description_array);
        } else {
            $point->description = $row[5];
        }
        
        $url_array = json_decode($row[6], true);
        if ($url_array !== null) {
            $point->addExtraArray($url_array);
        } else {
            $point->link = $row[6];
        }
        
        if (!$point->uuid) {
            $point->uuid = $row[7];
        }
        
        if (array_key_exists(9, $row)) {
            $point->category_id = (int) $row[9];
        }
        if (array_key_exists(10, $row)) {
            $point->key = $row[10];
        }
        if (array_key_exists(8, $row)) {
            $point->access = $row[8] === 't';
        }
        
        return $point;
    }

    public static function makeFromXmlRequest(DOMDocument $dom) {
        $point = new Point();
        
        $params_node = $dom->getElementsByTagName("params")->item(0);
        $request_array = get_request_array($params_node);
        
        $point->title = get_array_element($request_array, "title");
        $point->latitude = get_array_element($request_array, "latitude");
        $point->longitude = get_array_element($request_array, "longitude");
        $point->altitude = get_array_element($request_array, "altitude", 0);
        $point->time = get_array_element($request_array, "time");
        $point->link = get_array_element($request_array, "link");

        $description = get_array_element($request_array, "description");
        
        $description_array = json_decode($description, true);
        if ($description_array !== null) {
            $point->addExtraArray($description_array);
        } else {
            $point->description = $description;
        }
        
        // Process optional extended_data tag
        $extended_data_element = $dom->getElementsByTagName('extended_data');
        if ($extended_data_element->length > 0) {
            $extended_data_array = get_request_array($extended_data_element->item(0));
            $point->addExtraArray($extended_data_array);
        }
        
        // Process optional photos tag
        $photos_element = $dom->getElementsByTagName('photos');
        if ($photos_element->length > 0) {
            $photos_array = get_request_plain_array($photos_element->item(0), "photo");
            $point->addPhotoArray($photos_array);
        }
        
        // Point always should contain uuid
        if (!$point->uuid) {
            $point->uuid = uuidv4();
        }
        
        return $point;
    }
    
    private function addExtraArray($extra_array) {
        foreach ($extra_array as $extra_key => $extra_element) {
            $this->addExtraElement($extra_key, $extra_element);
        }
    }
    
    public function addExtraElement($extra_key, $extra_element) {
        if (in_array($extra_key, Point::$photo_extra_keys)) {
            if (is_scalar($extra_element)) {
                $this->addPhoto($extra_element);
            } else if (is_array($extra_element)) {
                $this->addPhotoArray($extra_element);
            }
        } else if ($extra_key === "uuid") {
            $this->uuid = $extra_element;
        } else if ($extra_key === "description") {
            $this->description = $extra_element;
        } else if ($extra_key === "link") {
            $this->link = $extra_element;
        } else if ($extra_key === "category_id") {
            $this->category_id = (int) $extra_element;
        } else if (is_scalar($extra_element)) {
            $this->extended_data[$extra_key] = $extra_element;
        }
    }
    
    private function addPhotoArray($photo_url_array) {
        foreach ($photo_url_array as $photo_url) {
            $this->addPhoto($photo_url);
        }
    }
    
    private function addPhoto($photo_url) {
        $this->photos[] = $photo_url;
    }
}
