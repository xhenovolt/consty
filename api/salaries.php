<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $employee_id = $_GET['employee_id'] ?? null;
    $project_id = $_GET['project_id'] ?? null;
    $month = $_GET['month'] ?? null;

    if ($employee_id && $project_id && $month) {
        $stmt = $pdo->prepare('SELECT remaining_salary FROM salaries WHERE employee_id = ? AND project_id = ? AND month = ?');
        $stmt->execute([$employee_id, $project_id, $month]);
        $salary = $stmt->fetch();
        echo json_encode(['remaining_salary' => $salary['remaining_salary'] ?? 0]);
        exit();
    }

    $stmt = $pdo->query('SELECT *, updated_at FROM salaries ORDER BY id DESC');
    $salaries = $stmt->fetchAll();
    echo json_encode(['salaries' => $salaries]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $employee_id = $input['employee_id'] ?? null;
    $project_id = $input['project_id'] ?? null;
    $month = $input['month'] ?? '';
    $amount_paid = $input['amount_paid'] ?? 0.00;

    if (!$employee_id || !$project_id || !$month) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields required']);
        exit();
    }

    // Fetch the remaining salary for the employee, project, and month
    $stmt = $pdo->prepare('SELECT remaining_salary FROM salaries WHERE employee_id = ? AND project_id = ? AND month = ?');
    $stmt->execute([$employee_id, $project_id, $month]);
    $salary = $stmt->fetch();

    $remaining_salary = $salary['remaining_salary'] ?? 0;

    if ($amount_paid > $remaining_salary) {
        http_response_code(400);
        echo json_encode(['error' => 'Payment amount cannot exceed the remaining salary.']);
        exit();
    }

    $remaining_salary = max(0, $remaining_salary - $amount_paid);
    $remaining_salary = $remaining_salary - $amount_paid;

    $stmt = $pdo->prepare('INSERT INTO salaries (employee_id, project_id, month, amount_paid, remaining_salary) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$employee_id, $project_id, $month, $amount_paid, $remaining_salary]);

    $salary_id = $pdo->lastInsertId();

    // Log salary payment into expenses table
    $desc = 'Salary payment for employee ' . $employee_id . ' for ' . $month;
    $stmt = $pdo->prepare('INSERT INTO expenses (project_id, amount, description, spent_at) VALUES (?, ?, ?, NOW())');
    $stmt->execute([$project_id, $amount_paid, $desc]);

    echo json_encode(['success' => true, 'id' => $salary_id]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Salary ID is required']);
        exit();
    }

    $stmt = $pdo->prepare('DELETE FROM salaries WHERE id = ?');
    $stmt->execute([$id]);

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
