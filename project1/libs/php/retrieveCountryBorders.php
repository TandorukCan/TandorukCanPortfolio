<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$file = '../countryBorders.geo.json'; // Path to the JSON file

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

// Get the country code from the query string
$countryCode = $_GET['countryCode'] ?? null;

if (!$countryCode) {
    // No country code provided, return the list of countries
    $countries = array_map(function($country) {
        return [
            'name' => $country['properties']['name'],
            'iso_a2' => $country['properties']['iso_a2']
        ];
    }, $decode['features']);

    // Sort countries alphabetically by name
    usort($countries, function($a, $b) {
        return strcmp($a['name'], $b['name']);
    });

    echo json_encode([
        'status' => [
            'code' => '200',
            'name' => 'ok',
            'description' => 'success',
            'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . ' ms'
        ],
        'data' => $countries
    ]);
} else {
    // Country code provided, filter the countries
    $selectedCountry = array_filter($decode['features'], function($country) use ($countryCode) {
        return $country['properties']['iso_a2'] === $countryCode;
    });

    if (empty($selectedCountry)) {
        echo json_encode([
            'status' => [
                'code' => '404',
                'name' => 'error',
                'description' => 'Country not found',
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
        'data' => array_values($selectedCountry) // Re-index array
    ]);
}

?>
