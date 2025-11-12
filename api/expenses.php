<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $project_id = $_GET['project_id'] ?? null;
    if ($project_id) {
        $stmt = $pdo->prepare('SELECT *, updated_at FROM expenses WHERE project_id = ? ORDER BY spent_at DESC');
        $stmt->execute([$project_id]);
        $expenses = $stmt->fetchAll();
    } else {
        $stmt = $pdo->query('SELECT *, updated_at FROM expenses ORDER BY id DESC');
        $expenses = $stmt->fetchAll();
    }
    echo json_encode(['expenses' => $expenses]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $project_id = $input['project_id'] ?? null;
    $amount = $input['amount'] ?? 0.00;
    $description = $input['description'] ?? '';
    $category_id = $input['category_id'] ?? null;
    $task_id = $input['task_id'] ?? null;
    if (!$project_id || !$amount) {
        http_response_code(400);
        echo json_encode(['error' => 'Project and amount required']);
        exit();
    }
    $stmt = $pdo->prepare('INSERT INTO expenses (project_id, category_id, task_id, amount, description, spent_at) VALUES (?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$project_id, $category_id, $task_id, $amount, $description]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Expense ID is required for updates']);
        exit();
    }

    $fields = [];
    $params = [];
    foreach (['project_id', 'category_id', 'task_id', 'amount', 'description'] as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $params[] = $input[$field];
        }
    }

    // Ensure there are fields to update
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields provided for update']);
        exit();
    }

    $params[] = $id;
    $sql = 'UPDATE expenses SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
