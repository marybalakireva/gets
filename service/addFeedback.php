<?php
include_once('include/methods_url.inc');
include_once('include/utils.inc');
include_once('include/auth.inc');
include_once('datatypes/feedback.inc');

include_once('include/header.inc');

try {

    $dom = get_input_dom('schemes/addFeedback.xsd');
//    file_put_contents("test.log","у нас все получится!");
    $feedback = Feedback::makeFromXmlRequest($dom);

    $date = date(DATE_RFC822);
    $auth_token = get_request_argument($dom, "auth_token");
    auth_set_token($auth_token);

    $dbconn = pg_connect(GEO2TAG_DB_STRING);

    require_category($dbconn, $feedback->category);

    $name = $_SESSION['user_info']['name'];
    $useremail = $_SESSION['email'];
    $email = "mbalakir@cs.karelia.ru";

    $headers = array("From: $useremail",
        "Reply-To: $useremail",
        "Content-type: text/html;charset=utf-8\r\n",
    );
    $headers = implode("\r\n", $headers);

    $categoryName = get_category_name($dbconn,$feedback->category); // сделать проверку
    $message = "Категория: ".$categoryName."<br>"."Комментарий: ".$feedback->comment."<br>"."<a href='http://etourism.cs.karelia.ru:20200/mbalakir/web-client/dist/adminf.php?lang=ru'>Перейти к просмотру запроса</a>"."\r\n";

    mail($email, "GeTS", $message, $headers); // сделать проверку

    $status = "0";
    $pg_array = $feedback->toPgArray( $date, $feedback->category, $feedback->comment, $_SESSION['db_id'], $status);

    if (!safe_pg_insert($dbconn, 'feedbacks', $pg_array)) {
        send_error(1, 'Can\'t insert feedback to database');
    }

} catch (GetsAuthException $e) {
    send_error(1, "Google login error");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
    file_put_contents("test.log", $e->getMessage());
}
