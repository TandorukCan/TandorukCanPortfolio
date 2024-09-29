<?php

// Remove the next two lines for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

// Connect to the database
$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];

    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// Identify update type: 'personnel', 'department', 'location'
$updateType = $_POST['updateType'] ?? '';

switch ($updateType) {
    case 'personnel':
        $query = $conn->prepare('UPDATE personnel SET firstName = ?, lastName = ?, email = ?, jobTitle = ?, departmentID = ? WHERE id = ?');
        $query->bind_param("ssssii", $_POST['firstName'], $_POST['lastName'], $_POST['email'], $_POST['jobTitle'], $_POST['departmentID'], $_POST['id']);
        break;

    case 'department':
        $query = $conn->prepare('UPDATE department SET name = ?, locationID = ? WHERE id = ?');
        $query->bind_param("sii", $_POST['name'], $_POST['locationID'], $_POST['id']);
        break;

    case 'location':
        $query = $conn->prepare('UPDATE location SET name = ? WHERE id = ?');
        $query->bind_param("si", $_POST['name'], $_POST['id']);
        break;

    default:
        $output['status']['code'] = "400";
        $output['status']['name'] = "failed";
        $output['status']['description'] = "invalid update type";
        $output['data'] = [];
        echo json_encode($output);
        exit;
}

// Execute the query
$query->execute();

if ($query === false) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "query failed";
    $output['status']['description'] = "execution failed";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// Check if rows were affected (i.e., updated)
if ($query->affected_rows > 0) {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
} else {
    $output['status']['code'] = "204";
    $output['status']['name'] = "no change";
    $output['status']['description'] = "no rows updated";
}

$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];

mysqli_close($conn);
echo json_encode($output);

?>
