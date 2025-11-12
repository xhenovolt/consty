<?php
// Basic employees API: GET list of employees
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("SELECT id, name, salary, project_id, email, phone, updated_at FROM employees ORDER BY id DESC");
        $employees = $stmt->fetchAll();
        echo json_encode(['employees' => $employees]);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!isset($input['name'], $input['salary'], $input['project_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit();
        }

        $name = $input['name'];
        $salary = $input['salary'];
        $project_id = $input['project_id'];
        $email = $input['email'] ?? null;
        $phone = $input['phone'] ?? null;

        $stmt = $pdo->prepare("INSERT INTO employees (name, salary, project_id, email, phone) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $salary, $project_id, $email, $phone]);
        http_response_code(201);
        echo json_encode(['success' => 'Employee added successfully']);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("UPDATE employees SET name = ?, salary = ?, project_id = ?, email = ?, phone = ? WHERE id = ?");
        $stmt->execute([
            $data['name'],
            $data['salary'],
            $data['project_id'],
            $data['email'],
            $data['phone'],
            $data['id']
        ]);
        echo json_encode(['success' => true]);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("DELETE FROM employees WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true]);
        exit();
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
