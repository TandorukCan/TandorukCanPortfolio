<?php

// Remove the next two lines for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Include database configuration
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
    echo json_encode($output);
    exit;
}

// Check if the type parameter is set
if (!isset($_REQUEST['type'])) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "error";
    $output['status']['description'] = "type not specified";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

// Determine the type and prepare the corresponding SQL statement
switch ($_REQUEST['type']) {
    case 'department':
        if (!isset($_REQUEST['name'], $_REQUEST['locationID'])) {
            $output['status']['code'] = "400";
            $output['status']['name'] = "error";
            $output['status']['description'] = "Missing department data";
            echo json_encode($output);
            exit;
        }
        $query = $conn->prepare('INSERT INTO department (name, locationID) VALUES(?, ?)');
        $query->bind_param("si", $_REQUEST['name'], $_REQUEST['locationID']);
        break;
    
    case 'location':
        if (!isset($_REQUEST['name'])) {
            $output['status']['code'] = "400";
            $output['status']['name'] = "error";
            $output['status']['description'] = "Missing location name";
            echo json_encode($output);
            exit;
        }
        $query = $conn->prepare('INSERT INTO location (name) VALUES(?)');
        $query->bind_param("s", $_REQUEST['name']);
        break;

    case 'personnel':
        if (!isset($_REQUEST['firstName'], $_REQUEST['lastName'], $_REQUEST['email'], $_REQUEST['jobTitle'], $_REQUEST['departmentID'])) {
            $output['status']['code'] = "400";
            $output['status']['name'] = "error";
            $output['status']['description'] = "Missing personnel data";
            echo json_encode($output);
            exit;
        }
        $query = $conn->prepare('INSERT INTO personnel (firstName, lastName, email, jobTitle, departmentID) VALUES(?,?,?,?,?)');
        $query->bind_param("ssssi", $_REQUEST['firstName'], $_REQUEST['lastName'], $_REQUEST['email'], $_REQUEST['jobTitle'], $_REQUEST['departmentID']);
        break;

    default:
        $output['status']['code'] = "400";
        $output['status']['name'] = "error";
        $output['status']['description'] = "Invalid type";
        $output['data'] = [];
        echo json_encode($output);
        exit;
}

// Execute the query and handle the response
$query->execute();

if ($query->affected_rows > 0) {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = ucfirst($_REQUEST['type']) . " added successfully.";
} else {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "Insert query failed";
}

// Close the connection
mysqli_close($conn);

$executionEndTime = microtime(true);
$output['status']['returnedIn'] = ($executionEndTime - $executionStartTime) / 1000 . " ms";

echo json_encode($output);

?>
