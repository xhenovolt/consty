<?php
// API to handle employee sign-in / sign-out logs
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT el.*, e.name as employee_name FROM employee_logs el JOIN employees e ON el.employee_id = e.id ORDER BY el.changed_at DESC");
    echo json_encode(['logs' => $stmt->fetchAll()]);
    exit();
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $employee_id = $input['employee_id'] ?? null;
    $status = $input['status'] ?? null; // 'in' or 'out'
    $description = $input['description'] ?? null;
    if(!$employee_id || !$status){ http_response_code(400); echo json_encode(['error'=>'employee_id and status required']); exit(); }
    $stmt = $pdo->prepare('INSERT INTO employee_logs (employee_id, status, description, changed_at) VALUES (?,?,?,NOW())');
    $stmt->execute([$employee_id, $status, $description]);
    echo json_encode(['success'=>true]);
    exit();
}
http_response_code(400);
echo json_encode(['error'=>'Invalid request']);
