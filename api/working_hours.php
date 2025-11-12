<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $project_id = $_GET['project_id'] ?? null;
    if ($project_id) {
        $stmt = $pdo->prepare('SELECT wh.*, e.name as employee_name, p.name as project_name FROM working_hours wh JOIN employees e ON wh.employee_id = e.id JOIN projects p ON wh.project_id = p.id WHERE wh.project_id = ? ORDER BY wh.logged_at DESC');
        $stmt->execute([$project_id]);
        $hours = $stmt->fetchAll();
    } else {
        $stmt = $pdo->query('SELECT wh.*, e.name as employee_name, p.name as project_name FROM working_hours wh JOIN employees e ON wh.employee_id = e.id JOIN projects p ON wh.project_id = p.id ORDER BY wh.logged_at DESC');
        $hours = $stmt->fetchAll();
    }
    echo json_encode(['working_hours' => $hours]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $employee_id = $input['employee_id'] ?? null;
    $project_id = $input['project_id'] ?? null;
    $hours_worked = $input['hours_worked'] ?? null;
    if (!$employee_id || !$project_id || !$hours_worked) {
        http_response_code(400);
        echo json_encode(['error' => 'Employee, project, and hours required']);
        exit();
    }
    $stmt = $pdo->prepare('INSERT INTO working_hours (employee_id, project_id, hours_worked) VALUES (?, ?, ?)');
    $stmt->execute([$employee_id, $project_id, $hours_worked]);
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
