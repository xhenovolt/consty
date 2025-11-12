<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT t.*, e.name as assigned_username, p.name as project_name, t.updated_at FROM tasks t LEFT JOIN employees e ON t.assigned_to = e.id LEFT JOIN projects p ON t.project_id = p.id ORDER BY t.id DESC');
    $tasks = $stmt->fetchAll();
    echo json_encode(['tasks' => $tasks]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    $project_id = $input['project_id'] ?? null;
    $assigned_to = $input['assigned_to'] ?? null;
    $deadline = $input['deadline'] ?? null;
    $priority = $input['priority'] ?? '';
    $status = $input['status'] ?? 'pending';
    if (!$name || !$project_id || !$assigned_to || !$deadline) {
        http_response_code(400);
        echo json_encode(['error' => 'Name, project, assigned user, and deadline required']);
        exit();
    }
    $stmt = $pdo->prepare('INSERT INTO tasks (name, project_id, assigned_to, deadline, priority, status) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$name, $project_id, $assigned_to, $deadline, $priority, $status]);

    // Log the creation of the task
    $task_id = $pdo->lastInsertId();
    $logStmt = $pdo->prepare('INSERT INTO task_logs (task_id, status, description) VALUES (?, ?, ?)');
    $logStmt->execute([$task_id, $status, 'Task created']);

    echo json_encode(['success' => true, 'id' => $task_id]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Task ID is required.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['message' => 'Task deleted successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete task.']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $name = $input['name'] ?? null;
    $assigned_to = $input['assigned_to'] ?? null;
    $deadline = $input['deadline'] ?? null;
    $priority = $input['priority'] ?? null;
    $status = $input['status'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Task id required']);
        exit();
    }
    $fields = [];
    $params = [];
    if ($name !== null) { $fields[] = 'name = ?'; $params[] = $name; }
    if ($assigned_to !== null) { $fields[] = 'assigned_to = ?'; $params[] = $assigned_to; }
    if ($deadline !== null) { $fields[] = 'deadline = ?'; $params[] = $deadline; }
    if ($priority !== null) { $fields[] = 'priority = ?'; $params[] = $priority; }
    if ($status !== null) { $fields[] = 'status = ?'; $params[] = $status; }
    if (count($fields) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        exit();
    }
    $params[] = $id;
    $sql = 'UPDATE tasks SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Log the status change
    if ($status !== null) {
        $logStmt = $pdo->prepare('INSERT INTO task_logs (task_id, status, description) VALUES (?, ?, ?)');
        $logStmt->execute([$id, $status, 'Status changed to ' . $status]);
    }

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
