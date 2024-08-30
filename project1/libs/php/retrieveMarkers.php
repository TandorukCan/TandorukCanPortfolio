<?php

require '../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

$userName = $_ENV['CSC_USERNAME'];

// Remove for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$countryCode = $_REQUEST['countryCode'];
$queryTypes = isset($_REQUEST['queryTypes']) ? explode(',', $_REQUEST['queryTypes']) : [];

$featureCodes = [
    'unis' => 'UNIV',
    'parks' => 'PRK',
    'museums' => 'MUS',
    'amusement' => 'AMUS',
    'populatedPlaces' => 'featureClass=P&featureCode=PPLC&featureCode=PPLA&featureCode=PPLA2&minPopulation=50000&maxRows=100&orderby=population',
    'zoos' => 'ZOO',
    'capital' => 'PPLC',
    'airports' => 'AIRP',
    // Add other feature codes here
];

$output = [];

foreach ($queryTypes as $queryType) {
    $featureCode = isset($featureCodes[$queryType]) ? $featureCodes[$queryType] : '';

    if (empty($featureCode)) {
        continue; // Skip unknown query types
    }

    $url = 'http://api.geonames.org/searchJSON?country=' . $countryCode . '&featureCode=' . $featureCode . '&username=' . $userName;

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

    $output[$queryType] = $decode["geonames"];
}

$response['status']['code'] = "200";
$response['status']['name'] = "ok";
$response['status']['description'] = "success";
$response['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$response['data'] = $output;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($response);

?>
