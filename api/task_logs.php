<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM task_logs ORDER BY changed_at DESC');
    $logs = $stmt->fetchAll();
    echo json_encode(['logs' => $logs]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $task_id = $input['task_id'] ?? null;
    $status = $input['status'] ?? null;
    $description = $input['description'] ?? null;

    if (!$task_id || !$status) {
        http_response_code(400);
        echo json_encode(['error' => 'Task ID and status are required']);
        exit();
    }

    $stmt = $pdo->prepare('INSERT INTO task_logs (task_id, status, description) VALUES (?, ?, ?)');
    $stmt->execute([$task_id, $status, $description]);
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
