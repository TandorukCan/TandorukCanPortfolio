<?php
require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

$cd_host = $_ENV['CD_HOST'];
$cd_port = $_ENV['CD_PORT'];
$cd_dbname = $_ENV['CD_DBNAME'];
$cd_user = $_ENV['CD_USER'];
$cd_password = $_ENV['CD_PASSWORD'];
$cd_socket = "";
?>
