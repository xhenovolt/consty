<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $employee_id = $_GET['employee_id'] ?? null;
    if (!$employee_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Employee ID is required']);
        exit();
    }

    // Fetch the latest paid month for the employee
    $stmt = $pdo->prepare('SELECT month FROM salaries WHERE employee_id = ? ORDER BY id DESC LIMIT 1');
    $stmt->execute([$employee_id]);
    $row = $stmt->fetch();

    $latest_paid_month = $row ? $row['month'] : null;
    echo json_encode(['latest_paid_month' => $latest_paid_month]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
