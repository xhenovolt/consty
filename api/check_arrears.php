<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $employee_id = $_GET['employee_id'] ?? null;
    $month = $_GET['month'] ?? null;

    if (!$employee_id || !$month) {
        http_response_code(400);
        echo json_encode(['error' => 'Employee ID and month are required.']);
        exit;
    }

    // Get all months before the selected month
    $months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    $selectedMonthIndex = array_search($month, $months);
    if ($selectedMonthIndex === false) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid month provided.']);
        exit;
    }

    $arrears = [];
    for ($i = 0; $i < $selectedMonthIndex; $i++) {
        $stmt = $pdo->prepare("SELECT remaining_salary FROM salaries WHERE employee_id = ? AND month = ?");
        $stmt->execute([$employee_id, $months[$i]]);
        $remainingSalary = $stmt->fetchColumn();

        if ($remainingSalary > 0) {
            $arrears[] = $months[$i];
        }
    }

    if (!empty($arrears)) {
        echo json_encode(['has_arrears' => true, 'arrears' => $arrears]);
    } else {
        echo json_encode(['has_arrears' => false]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed.']);
