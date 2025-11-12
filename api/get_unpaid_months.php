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

    // Define all months in a year
    $all_months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Fetch months that exist in the salaries table for the employee
    $stmt = $pdo->prepare('SELECT DISTINCT month FROM salaries WHERE employee_id = ? ORDER BY id ASC');
    $stmt->execute([$employee_id]);
    $paid_months = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Determine unpaid months by comparing all months with paid months
    $unpaid_months = array_diff($all_months, $paid_months);

    echo json_encode(['unpaid_months' => array_values($unpaid_months)]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
