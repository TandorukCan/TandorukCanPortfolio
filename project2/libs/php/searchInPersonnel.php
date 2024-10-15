<?php

// remove next two lines for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

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

// Retrieving filter and input values from the request
$filter = $_GET['filter'] ?? 'All'; // Defaults to 'all' if not provided
$input = $_GET['input'] ?? ''; // Defaults to an empty string if not provided
$searchText = "%" . ($_GET['txt'] ?? '') . "%"; // Search term with wildcard for LIKE

// Prepare query based on filter type
if ($filter === 'department') {
    if ($_GET['txt'] == "") {
        // If search text is empty, return all personnel in the specified department
        $query = $conn->prepare('
            SELECT `p`.`id`, `p`.`firstName`, `p`.`lastName`, `p`.`email`, `p`.`jobTitle`, 
                   `d`.`id` as `departmentID`, `d`.`name` AS `department`, 
                   `l`.`id` as `locationID`, `l`.`name` AS `location`
            FROM `personnel` `p`
            LEFT JOIN `department` `d` ON (`d`.`id` = `p`.`departmentID`)
            LEFT JOIN `location` `l` ON (`l`.`id` = `d`.`locationID`)
            WHERE `d`.`name` = ?
            ORDER BY `p`.`lastName`, `p`.`firstName`, `d`.`name`, `l`.`name`
        ');
        $query->bind_param("s", $input);
    } else {
        // If search text is not empty, filter personnel
        $query = $conn->prepare('
            SELECT `p`.`id`, `p`.`firstName`, `p`.`lastName`, `p`.`email`, `p`.`jobTitle`, 
                   `d`.`id` as `departmentID`, `d`.`name` AS `department`, 
                   `l`.`id` as `locationID`, `l`.`name` AS `location`
            FROM `personnel` `p`
            LEFT JOIN `department` `d` ON (`d`.`id` = `p`.`departmentID`)
            LEFT JOIN `location` `l` ON (`l`.`id` = `d`.`locationID`)
            WHERE (`p`.`firstName` LIKE ? OR `p`.`lastName` LIKE ? OR `p`.`email` LIKE ? 
                   OR `p`.`jobTitle` LIKE ? OR `d`.`name` LIKE ? OR `l`.`name` LIKE ?)
                  AND `d`.`name` = ?
            ORDER BY `p`.`lastName`, `p`.`firstName`, `d`.`name`, `l`.`name`
        ');
        $query->bind_param("sssssss", $searchText, $searchText, $searchText, $searchText, $searchText, $searchText, $input);
    }

} elseif ($filter === 'location') {
    if ($_GET['txt'] == "") {
        // If search text is empty, return all personnel in the specified location
        $query = $conn->prepare('
            SELECT `p`.`id`, `p`.`firstName`, `p`.`lastName`, `p`.`email`, `p`.`jobTitle`, 
                   `d`.`id` as `departmentID`, `d`.`name` AS `department`, 
                   `l`.`id` as `locationID`, `l`.`name` AS `location`
            FROM `personnel` `p`
            LEFT JOIN `department` `d` ON (`d`.`id` = `p`.`departmentID`)
            LEFT JOIN `location` `l` ON (`l`.`id` = `d`.`locationID`)
            WHERE `l`.`name` = ?
            ORDER BY `p`.`lastName`, `p`.`firstName`, `d`.`name`, `l`.`name`
        ');
        $query->bind_param("s", $input);
    } else {
        // If search text is not empty, filter personnel
        $query = $conn->prepare('
            SELECT `p`.`id`, `p`.`firstName`, `p`.`lastName`, `p`.`email`, `p`.`jobTitle`, 
                   `d`.`id` as `departmentID`, `d`.`name` AS `department`, 
                   `l`.`id` as `locationID`, `l`.`name` AS `location`
            FROM `personnel` `p`
            LEFT JOIN `department` `d` ON (`d`.`id` = `p`.`departmentID`)
            LEFT JOIN `location` `l` ON (`l`.`id` = `d`.`locationID`)
            WHERE (`p`.`firstName` LIKE ? OR `p`.`lastName` LIKE ? OR `p`.`email` LIKE ? 
                   OR `p`.`jobTitle` LIKE ? OR `d`.`name` LIKE ? OR `l`.`name` LIKE ?)
                  AND `l`.`name` = ?
            ORDER BY `p`.`lastName`, `p`.`firstName`, `d`.`name`, `l`.`name`
        ');
        $query->bind_param("sssssss", $searchText, $searchText, $searchText, $searchText, $searchText, $searchText, $input);
    }

} else {
    // Default case (filter = 'All')
    if ($_GET['txt'] == "") {
        // If search text is empty, return all personnel
        $query = $conn->prepare('
            SELECT `p`.`id`, `p`.`firstName`, `p`.`lastName`, `p`.`email`, `p`.`jobTitle`, 
                   `d`.`id` as `departmentID`, `d`.`name` AS `department`, 
                   `l`.`id` as `locationID`, `l`.`name` AS `location`
            FROM `personnel` `p`
            LEFT JOIN `department` `d` ON (`d`.`id` = `p`.`departmentID`)
            LEFT JOIN `location` `l` ON (`l`.`id` = `d`.`locationID`)
            ORDER BY `p`.`lastName`, `p`.`firstName`, `d`.`name`, `l`.`name`
        ');
    } else {
        // If search text is not empty, filter personnel
        $query = $conn->prepare('
            SELECT `p`.`id`, `p`.`firstName`, `p`.`lastName`, `p`.`email`, `p`.`jobTitle`, 
                   `d`.`id` as `departmentID`, `d`.`name` AS `department`, 
                   `l`.`id` as `locationID`, `l`.`name` AS `location`
            FROM `personnel` `p`
            LEFT JOIN `department` `d` ON (`d`.`id` = `p`.`departmentID`)
            LEFT JOIN `location` `l` ON (`l`.`id` = `d`.`locationID`)
            WHERE `p`.`firstName` LIKE ? OR `p`.`lastName` LIKE ? OR `p`.`email` LIKE ? 
                  OR `p`.`jobTitle` LIKE ? OR `d`.`name` LIKE ? OR `l`.`name` LIKE ?
            ORDER BY `p`.`lastName`, `p`.`firstName`, `d`.`name`, `l`.`name`
        ');
        $query->bind_param("ssssss", $searchText, $searchText, $searchText, $searchText, $searchText, $searchText);
    }
}

// Execute query
$query->execute();

if (false === $query) {

    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";    
    $output['data'] = [];

    mysqli_close($conn);

    echo json_encode($output); 

    exit;
}

$result = $query->get_result();
$found = [];

while ($row = mysqli_fetch_assoc($result)) {
    array_push($found, $row);
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data']['found'] = $found;

mysqli_close($conn);

echo json_encode($output); 

?>
