<?php
session_start();
// Set CORS headers for session cookies
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');

require_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password required']);
    exit();
}

$stmt = $pdo->prepare('SELECT id, username, email, password, role, phone, photo FROM users WHERE username = ?');
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit();
}

$_SESSION['user'] = [
    'id' => $user['id'],
    'username' => $user['username'],
    'email' => $user['email'],
    'role' => $user['role'],
    'phone' => $user['phone'] ?? null,
    'photo' => $user['photo'] ?? null
];

echo json_encode([
    'success' => true,
    'role' => $user['role'],
    'username' => $user['username'],
    'id' => $user['id'],
    'phone' => $user['phone'] ?? null,
    'photo' => $user['photo'] ?? null
]);
