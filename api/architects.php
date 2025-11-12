<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');

require_once 'db.php';

// Ensure 'status' column exists in architects table
$tableCheck = $pdo->query("SHOW COLUMNS FROM architects LIKE 'status'")->fetch();
if (!$tableCheck) {
    $pdo->exec("ALTER TABLE architects ADD COLUMN status VARCHAR(50) DEFAULT 'active'");
}

$action = $_GET['action'] ?? '';

if ($action === 'add') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    $project_id = $input['project_id'] ?? null;
    $email = $input['email'] ?? '';
    $phone = $input['phone'] ?? '';
    if (!$name || !$project_id || !$email || !$phone) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields required']);
        exit();
    }
    // Check project exists
    $stmt = $pdo->prepare('SELECT id FROM projects WHERE id = ?');
    $stmt->execute([$project_id]);
    if (!$stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid project selected']);
        exit();
    }
    $stmt = $pdo->prepare('INSERT INTO architects (name, project_id, email, phone) VALUES (?, ?, ?, ?)');
    $stmt->execute([$name, $project_id, $email, $phone]);
    echo json_encode(['success' => true]);
    exit();
}

if ($action === 'edit') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? '';
    $name = $input['name'] ?? '';
    $project_id = $input['project_id'] ?? null;
    $email = $input['email'] ?? '';
    $phone = $input['phone'] ?? '';
    if (!$id || !$name || !$project_id || !$email || !$phone) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields required']);
        exit();
    }
    // Check project exists
    $stmt = $pdo->prepare('SELECT id FROM projects WHERE id = ?');
    $stmt->execute([$project_id]);
    if (!$stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid project selected']);
        exit();
    }
    $stmt = $pdo->prepare('UPDATE architects SET name = ?, project_id = ?, email = ?, phone = ? WHERE id = ?');
    $stmt->execute([$name, $project_id, $email, $phone, $id]);
    echo json_encode(['success' => true]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Architect id required']);
        exit();
    }
    $stmt = $pdo->prepare('DELETE FROM architects WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT *, updated_at FROM architects ORDER BY id DESC');
    $architects = $stmt->fetchAll();
    echo json_encode(['architects' => $architects]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $status = $input['status'] ?? null;
    if (!$id || !$status) {
        http_response_code(400);
        echo json_encode(['error' => 'ID and status required']);
        exit();
    }
    $stmt = $pdo->prepare('UPDATE architects SET status = ? WHERE id = ?');
    $stmt->execute([$status, $id]);
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid action']);
