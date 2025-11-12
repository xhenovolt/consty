<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $project_id = $_GET['project_id'] ?? null;
    if ($project_id) {
        $stmt = $pdo->prepare('SELECT tm.*, u.username FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE tm.project_id = ?');
        $stmt->execute([$project_id]);
        $members = $stmt->fetchAll();
    } else {
        $stmt = $pdo->query('SELECT tm.*, u.username, p.name as project_name FROM team_members tm JOIN users u ON tm.user_id = u.id JOIN projects p ON tm.project_id = p.id');
        $members = $stmt->fetchAll();
    }
    echo json_encode(['team_members' => $members]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $project_id = $input['project_id'] ?? null;
    $user_id = $input['user_id'] ?? null;
    if (!$project_id || !$user_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Project and user required']);
        exit();
    }
    $stmt = $pdo->prepare('INSERT INTO team_members (project_id, user_id) VALUES (?, ?)');
    $stmt->execute([$project_id, $user_id]);
    echo json_encode(['success' => true]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Team member id required']);
        exit();
    }
    $stmt = $pdo->prepare('DELETE FROM team_members WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
