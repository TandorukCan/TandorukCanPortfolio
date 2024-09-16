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

    // Prepare SQL statement to update department data
    $query = $conn->prepare('UPDATE department SET name = ?, locationID = ? WHERE id = ?');

    // Bind parameters to avoid SQL injection
    $query->bind_param("sii", $_POST['name'], $_POST['locationID'], $_POST['id']);

    // Execute the query
    $query->execute();

    if ($query === false) {

        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "query failed";
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
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];
    } else {
        $output['status']['code'] = "204";
        $output['status']['name'] = "no change";
        $output['status']['description'] = "no rows updated";
        $output['data'] = [];
    }

    mysqli_close($conn);

    echo json_encode($output);

?>
