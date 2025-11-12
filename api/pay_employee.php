<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $employee_id = $input['employee_id'] ?? null;
    $amount = $input['amount'] ?? 0.00;
    $month = $input['month'] ?? '';
    $project_id = $input['project_id'] ?? null;
    if (!$employee_id || !$amount || !$month || !$project_id) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields required']);
        exit();
    }

    // Get employee salary
    $stmt = $pdo->prepare('SELECT salary FROM employees WHERE id = ?');
    $stmt->execute([$employee_id]);
    $row = $stmt->fetch();
    $salary = $row ? $row['salary'] : 0.00;

    // Get the most recent remaining salary
    $stmt = $pdo->prepare('SELECT remaining_salary FROM salaries WHERE employee_id = ? ORDER BY id DESC LIMIT 1');
    $stmt->execute([$employee_id]);
    $last_salary_row = $stmt->fetch();
    $last_remaining_salary = $last_salary_row ? $last_salary_row['remaining_salary'] : $salary;

    // Calculate the new remaining salary
    $remaining_salary = $last_remaining_salary - $amount;
    if($remaining_salary < 0) $remaining_salary = $salary - $amount; // Reset if overpaid
    // Insert into salaries table
    $stmt = $pdo->prepare('INSERT INTO salaries (employee_id, project_id, month, amount_paid, remaining_salary) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$employee_id, $project_id, $month, $amount, $remaining_salary]);

    // Log into expenses table
    $desc = 'Salary payment for employee ' . $employee_id . ' for ' . $month;
    $stmt = $pdo->prepare('INSERT INTO expenses (project_id, amount, description, spent_at) VALUES (?, ?, ?, NOW())');
    $stmt->execute([$project_id, $amount, $desc]);

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
