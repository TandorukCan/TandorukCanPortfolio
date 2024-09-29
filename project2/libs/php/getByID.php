<?php

// Example use from browser
// http://localhost/companydirectory/libs/php/getByID.php?entity=personnel&id=<id>

// Remove the next two lines for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

// Create connection
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

// Get parameters from the request
$entity = $_REQUEST['entity'];  // 'personnel', 'department', or 'location'
$id = $_REQUEST['id'];  // ID to search for

// Initialize output
$output = ['data' => []];

switch ($entity) {
    case 'personnel':
        // Query personnel by ID
        $personnelQuery = $conn->prepare('SELECT id, firstName, lastName, email, jobTitle, departmentID FROM personnel WHERE id = ?');
        $personnelQuery->bind_param("i", $id);
        $personnelQuery->execute();
        $personnelResult = $personnelQuery->get_result();

        if ($personnelResult->num_rows > 0) {
            $output['data']['personnel'] = $personnelResult->fetch_all(MYSQLI_ASSOC);
        } else {
            $output['data']['personnel'] = [];
        }

        // Retrieve all departments
        $departmentQuery = 'SELECT id, name from department ORDER BY name';
        $deptResult = $conn->query($departmentQuery);
        $departments = [];

        if ($deptResult->num_rows > 0) {
            while ($deptRow = mysqli_fetch_assoc($deptResult)) {
                $departments[] = $deptRow;
            }
            $output['data']['department'] = $departments;
        }

        break;

    case 'department':
        // Query department by ID
        $departmentQuery = $conn->prepare('SELECT d.id, d.name, d.locationID, l.name AS locationName FROM department d LEFT JOIN location l ON d.locationID = l.id WHERE d.id = ?');
        $departmentQuery->bind_param("i", $id);
        $departmentQuery->execute();
        $deptResult = $departmentQuery->get_result();

        if ($deptResult->num_rows > 0) {
            $output['data']['department'] = $deptResult->fetch_all(MYSQLI_ASSOC);
        } else {
            $output['data']['department'] = [];
        }

        break;

    case 'location':
        // Query location by ID
        $locationQuery = $conn->prepare('SELECT id, name FROM location WHERE id = ?');
        $locationQuery->bind_param("i", $id);
        $locationQuery->execute();
        $locResult = $locationQuery->get_result();

        if ($locResult->num_rows > 0) {
            $output['data']['location'] = $locResult->fetch_all(MYSQLI_ASSOC);
        } else {
            $output['data']['location'] = [];
        }

        break;

    default:
        // Invalid entity type
        $output['status']['code'] = "400";
        $output['status']['name'] = "invalid";
        $output['status']['description'] = "Invalid entity type";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        echo json_encode($output);
        mysqli_close($conn);
        exit;
}

// Set the status of the response
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";

// Output the result as JSON
header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);

// Close connection
mysqli_close($conn);
?>
