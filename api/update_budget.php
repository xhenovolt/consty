<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$db   = 'consty';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];
header('Content-Type: application/json');
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    // Check if budgets table exists, create if not
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'budgets'")->fetch();
    if (!$tableCheck) {
        $pdo->exec("CREATE TABLE budgets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            used DECIMAL(15,2) NOT NULL DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
        $pdo->exec("INSERT INTO budgets (used) VALUES (0)");
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $amount = $input['amount'] ?? null;
        if (!$amount) {
            http_response_code(400);
            echo json_encode(['error' => 'Amount is required']);
            exit();
        }
        // Update used budget
        $stmt = $pdo->prepare('UPDATE budgets SET used = used + ? WHERE id = 1');
        $stmt->execute([$amount]);
        echo json_encode(['success' => true]);
        exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
