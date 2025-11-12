<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM projects ORDER BY id DESC');
    $projects = $stmt->fetchAll();
    echo json_encode(['projects' => $projects]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    $client = $input['client'] ?? '';
    $budget = $input['budget'] ?? 0;
    $location = $input['location'] ?? '';
    $status = $input['status'] ?? 'ongoing';
    $start_date = $input['start_date'] ?? null;
    $end_date = $input['end_date'] ?? null;

    if (!$name || !$client) {
        http_response_code(400);
        echo json_encode(['error' => 'Name and client are required']);
        exit();
    }

    $stmt = $pdo->prepare('INSERT INTO projects (name, client, budget, location, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$name, $client, $budget, $location, $status, $start_date, $end_date]);

    // Log the creation of the project
    $project_id = $pdo->lastInsertId();
    $logStmt = $pdo->prepare('INSERT INTO project_logs (project_id, status, description) VALUES (?, ?, ?)');
    $logStmt->execute([$project_id, $status, 'Project created']);

    echo json_encode(['success' => true, 'id' => $project_id]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $status = $input['status'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Project ID is required for updates']);
        exit();
    }

    // Validate status if provided
    $validStatuses = ['pause', 'pending', 'planned', 'resume', 'start', 'stop', 'ongoing', 'paused', 'ended'];
    if ($status && !in_array($status, $validStatuses)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid status value']);
        exit();
    }

    $fields = [];
    $params = [];
    foreach (['name', 'client', 'budget', 'location', 'status', 'start_date', 'end_date'] as $field) {
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
    $sql = 'UPDATE projects SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Log status changes
    if ($status) {
        $logStmt = $pdo->prepare('INSERT INTO project_logs (project_id, status, description) VALUES (?, ?, ?)');
        $logStmt->execute([$id, $status, "Status changed to $status"]);
    }

    echo json_encode(['success' => true]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Project ID is required.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['message' => 'Project deleted successfully.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete project.']);
    }
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
echo json_encode(['error' => 'Invalid request']);
