<?php

// Remove the next two lines for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

// Check if the ID and type were provided in the request
if (!isset($_POST['id']) || empty($_POST['id']) || !isset($_POST['type']) || empty($_POST['type'])) {
    $output['status']['code'] = 400;
    $output['status']['name'] = "invalid";
    $output['status']['description'] = "ID or type is missing or invalid.";
    echo json_encode($output);
    exit;
}

// Determine the table based on the 'type' parameter
switch ($_POST['type']) {
    case 'department':
        $table = 'department';
        break;
    case 'location':
        $table = 'location';
        break;
    case 'personnel':
        $table = 'personnel';
        break;
    default:
        $output['status']['code'] = 400;
        $output['status']['name'] = "invalid";
        $output['status']['description'] = "Invalid type specified.";
        echo json_encode($output);
        exit;
}

// Connect to the database
$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = 300;
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    echo json_encode($output);
    exit;
}

// Prepare SQL query to delete the record from the correct table
$query = $conn->prepare("DELETE FROM $table WHERE id = ?");

// Bind the ID to the query
$query->bind_param("i", $_POST['id']);

$query->execute();

// Check if the deletion was successful
if ($query->affected_rows > 0) {
    $output['status']['code'] = 200;
    $output['status']['name'] = "ok";
    $output['status']['description'] = ucfirst($table) . " deleted successfully.";
} else {
    $output['status']['code'] = 204;
    $output['status']['name'] = "no change";
    $output['status']['description'] = "No record found with the provided ID.";
}

// Close the connection
mysqli_close($conn);

$executionEndTime = microtime(true);
$output['status']['returnedIn'] = ($executionEndTime - $executionStartTime) / 1000 . " ms";

echo json_encode($output);

?>
