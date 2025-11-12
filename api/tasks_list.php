<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT id, name FROM tasks ORDER BY id DESC');
    $tasks = $stmt->fetchAll();
    echo json_encode(['tasks' => $tasks]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
