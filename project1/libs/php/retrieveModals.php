<?php

require '../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

$NEWS_DATA_API_KEY = $_ENV['NEWS_DATA_API_KEY'];
$CSC_USERNAME = $_ENV['CSC_USERNAME'];
$WEATHER_API_KEY = $_ENV['WEATHER_API_KEY'];

// Remove for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$country = $_REQUEST['country'] ?? null;

if (!$country) {
    echo json_encode([
        'status' => [
            'code' => '400',
            'name' => 'error',
            'description' => 'No country code provided',
            'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . ' ms'
        ]
    ]);
    exit;
}

// Function to make API requests
function makeApiRequest($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'User-Agent: GazetteerApp/1.0',
        'Content-Type: application/json'
    ]);
    
    $result = curl_exec($ch);
    
    if (curl_errno($ch)) {
        return 'Error: ' . curl_error($ch);
    }

    curl_close($ch);
    
    return json_decode($result, true);
}

// News API
$newsUrl = 'https://newsdata.io/api/1/latest?apikey='. $NEWS_DATA_API_KEY . '&country='. $country;
$newsData = makeApiRequest($newsUrl);
// 'https://newsapi.org/v2/top-headlines?country=' . $country . '&apiKey=' . $NEWS_API_KEY;
// 'https://api.thenewsapi.com/v1/news/headlines?locale=' . $country . '&language=en&api_token' . $THE_NEWS_API_KEY;


// COVID Stats API
$covidUrl = 'https://disease.sh/v3/covid-19/countries/' . $country;
$covidData = makeApiRequest($covidUrl);

// Overview API
$overviewUrl = 'http://api.geonames.org/countryInfoJSON?country=' . $country . '&username=' . $CSC_USERNAME;
$overviewData = makeApiRequest($overviewUrl);
$capital = $overviewData['geonames'][0]['capital'] ?? null;

// Weather API
$weatherData = null;
if ($capital) {
    $weatherUrl = 'http://api.weatherapi.com/v1/forecast.json?key=' . $WEATHER_API_KEY . '&days=3&q=' . $capital . '&aqi=no&alerts=no';
    $weatherData = makeApiRequest($weatherUrl);
}

$output = [
    'status' => [
        'code' => '200',
        'name' => 'ok',
        'description' => 'success',
        'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . ' ms'
    ],
    'data' => [
        'news' => $newsData['results'] ?? null,
        'covidStats' => $covidData ?? null,
        'overview' => $overviewData['geonames'][0] ?? null,
        'weather' => $weatherData ?? null
    ]
];

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);

?>
