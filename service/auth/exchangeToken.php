<?php

include_once('../include/methods_url.inc');
include_once('../include/utils.inc');
include_once('../include/auth.inc');
include_once('../include/config.inc');
include_once('../include/header.inc');

require_once '../include/GoogleClientAPI/src/Google_Client.php';
require_once '../include/GoogleClientAPI/src/contrib/Google_PlusService.php';

try {
    $dom = get_input_dom('../schemes/exchangeToken.xsd');

    $exchange_token = get_request_argument($dom, "exchange_token", null);

    $client = new Google_Client();
    $client->setAccessType('offline');
    $client->setApplicationName(GOOGLE_APP_NAME);
    $client->setClientId(GOOGLE_CLIENT_ID);
    $client->setClientSecret(GOOGLE_SECRET_ID);
    $client->setScopes(array('https://www.googleapis.com/auth/plus.me',
            'https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/userinfo.email'));

    $service = new Google_PlusService($client);
    $client->authenticate($exchange_token);

    $person = $service->people->get('me');
    $google_email = $person['emails'][0]['value'];
    $google_access_token = $client->getAccessToken();

    $auth_token = auth_set_initial_token($google_access_token, $google_email);

    $content = '<auth_token>' . $auth_token . '</auth_token>';
    send_result(0, 'success', $content);
} catch (GetsAuthException $e) {
    send_error(1, "Can't login in google");
} catch (Exception $e) {
    send_error($e->getCode(), $e->getMessage());
}
