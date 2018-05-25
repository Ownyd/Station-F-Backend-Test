<?php
$servername = "127.0.0.1";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

// Create database
$sql = "CREATE DATABASE db_stf";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully\n";
} else {
    echo "Error creating database: " . $conn->error."\n";
}

$conn->close();
	$DB_HOST = '127.0.0.1';
	$DB_NAME = 'db_stf';
	$DB_DSN = "mysql:host=".$DB_HOST.";dbname=".$DB_NAME;
	$DB_USER = 'root';
	$DB_PASSWORD = '';

	$db = new PDO($DB_DSN, $DB_USER);

	$sql = $db->prepare("CREATE DATABASE IF NOT EXISTS `db_stf`");
	$sql->execute();
	$sql = $db->prepare("CREATE TABLE IF NOT EXISTS `Reservations`(
	`id_resa` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	`id_room` INT UNSIGNED NOT NULL,
	`username` varchar(254) NOT NULL,
	`date` varchar(15) NOT NULL,
	`hour` varchar(7) NOT NULL
	)
	");
	$sql->execute();
?>
