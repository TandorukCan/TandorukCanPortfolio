<?php

require '../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

$userName = $_ENV['CSC_USERNAME'];

// Remove for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$country = $_REQUEST['country'];
$url = 'http://api.geonames.org/wikipediaSearchJSON?q=' . urlencode($country) . '&maxRows=100&username=' . $userName;


$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);


$result = curl_exec($ch);

if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
    exit;
}

curl_close($ch);

$decode = json_decode($result, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo 'JSON Error: ' . json_last_error_msg();
    exit;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output = $decode['geonames'];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>