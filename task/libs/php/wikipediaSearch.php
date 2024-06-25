<?php
	$username = "tanjoe"; //register and change username
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	$url='http://api.geonames.org/wikipediaSearchJSON?q=' . $_REQUEST['word'] . '&maxRows=1&username=' . $username;
	$ch = curl_init();

	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);



	$result=curl_exec($ch);


	curl_close($ch);

	$decode = json_decode($result,true);


	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode['geonames'];

	header('Content-Type: application/json; charset=UTF-8');
	// echo "lang: " . $_REQUEST['q'] . "<br>";
	// echo "country: " . $_REQUEST['country'] . "<br>";

	echo json_encode($output);

?>
