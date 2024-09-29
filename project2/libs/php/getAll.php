<?php

// Remove next two lines for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

// Connect to the database
$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status'] = [
        'code' => "300",
        'name' => "failure",
        'description' => "database unavailable",
        'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
    ];
    $output['data'] = [];

    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// Determine the type of entity to retrieve
$entityType = $_GET['entityType'] ?? 'all';  // Default to 'all' if not provided

// Valid entity types
$validEntityTypes = ['all', 'department', 'location'];
if (!in_array($entityType, $validEntityTypes)) {
    $output['status'] = [
        'code' => "400",
        'name' => "failed",
        'description' => "Invalid entity type. Valid options are: 'all', 'department', 'location'"
    ];
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

// Prepare query based on entity type
switch ($entityType) {
    case 'all':
        // Query for all personnel with departments and locations
        $query = 'SELECT p.lastName, p.firstName, p.jobTitle, p.email, p.id, d.name as department, l.name as location 
                  FROM personnel p 
                  LEFT JOIN department d ON (d.id = p.departmentID) 
                  LEFT JOIN location l ON (l.id = d.locationID) 
                  ORDER BY p.lastName, p.firstName, d.name, l.name';
        break;

    case 'department':
        // Query for all departments
        $query = 'SELECT d.id as id, d.name as name, d.locationID as locationID, l.name AS locationName 
                  FROM department d 
                  LEFT JOIN location l ON d.locationID = l.id';
        break;

    case 'location':
        // Query for all locations
        $query = 'SELECT id, name FROM location';
        break;
}

// Prepare the statement
$stmt = $conn->prepare($query);

if (!$stmt) {
    $output['status'] = [
        'code' => "400",
        'name' => "query failed",
        'description' => "SQL statement preparation failed"
    ];
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// Execute the statement
$stmt->execute();

// Get the result
$result = $stmt->get_result();

if (!$result) {
    $output['status'] = [
        'code' => "400",
        'name' => "query failed",
        'description' => "SQL query failed"
    ];
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// Collect data
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;  // More concise way to add to the array
}

// Prepare output
$output['status'] = [
    'code' => "200",
    'name' => "ok",
    'description' => "success",
    'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
];
$output['data'] = $data;

$stmt->close();  // Close the prepared statement
mysqli_close($conn);  // Close the database connection

// Return JSON response
echo json_encode($output);

?>
