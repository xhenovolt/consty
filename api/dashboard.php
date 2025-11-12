<?php
// Database connection settings
// $host = 'localhost';
// $db   = 'consty'; // Change to your DB name
// $user = 'root';      // Change to your DB user
// $pass = '';  // Change to your DB password
// $charset = 'utf8mb4';

// $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
// $options = [
//     PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
//     PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
//     PDO::ATTR_EMULATE_PREPARES   => false,
// ];

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


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    $tables = [
        'users', 'projects', 'materials', 'machines', 'tasks', 'architects', 'employees'
    ];
    $counts = [];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
        $row = $stmt->fetch();
        $counts[$table] = (int)$row['count'];
    }

    echo json_encode([
        'users' => $counts['users'],
        'projects' => $counts['projects'],
        'materials' => $counts['materials'],
        'machines' => $counts['machines'],
        'tasks' => $counts['tasks'],
        'architects' => $counts['architects'],
        'employees' => $counts['employees'],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]); // Return real error for debugging
}
