<?php
// $host = 'localhost';
// $db   = 'consty';
// $user = 'root';
// $pass = '';
// $charset = 'utf8mb4';
// $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
// $options = [
//     PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
//     PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
//     PDO::ATTR_EMULATE_PREPARES   => false,
// ];
// $pdo = new PDO($dsn, $user, $pass, $options);

$host = 'sql102.ezyro.com';          // MySQL host from ProFreeHost
$db   = 'ezyro_40388790_consty';    // Database name
$user = 'ezyro_40388790';           // MySQL username
$pass = '24a45edf5367f2f4';      // Your actual vPanel password
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$pdo = new PDO($dsn, $user, $pass, $options);
