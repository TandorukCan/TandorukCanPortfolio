<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$file = '../countryBorders.geo.json'; // Updated path to the JSON file

if (!file_exists($file)) {
    echo json_encode([
        'status' => [
            'code' => '404',
            'name' => 'error',
            'description' => 'File not found',
            'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . ' ms'
        ]
    ]);
    exit;
}

$jsonContent = file_get_contents($file);

if ($jsonContent === false) {
    echo json_encode([
        'status' => [
            'code' => '500',
            'name' => 'error',
            'description' => 'Unable to read file',
            'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . ' ms'
        ]
    ]);
    exit;
}

$decode = json_decode($jsonContent, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'status' => [
            'code' => '500',
            'name' => 'error',
            'description' => 'JSON Error: ' . json_last_error_msg(),
            'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . ' ms'
        ]
    ]);
    exit;
}

echo json_encode([
    'status' => [
        'code' => '200',
        'name' => 'ok',
        'description' => 'success',
        'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . ' ms'
    ],
    'data' => $decode
]);

?>
