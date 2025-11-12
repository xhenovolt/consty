<?php
session_start();
// CORS for session cookie
header('Access-Control-Allow-Origin:  https://chief-kodiak-smashing.ngrok-free.app');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');

require_once 'db.php';

// Expect multipart/form-data for file upload
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Expected multipart/form-data for the file upload']);
    exit();
}

$username = $_POST['username'] ?? '';
$email    = $_POST['email'] ?? '';
$phone    = $_POST['phone'] ?? '';
$password = $_POST['password'] ?? '';
$role     = $_POST['role'] ?? 'user';

if (!$username || !$email || !$phone || !$password || empty($_FILES['photo']['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields (username, email, phone, photo, password) are required']);
    exit();
}

// Only allow one admin to sign up
if ($role === 'admin') {
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE role = "admin"');
    $stmt->execute();
    $adminCount = $stmt->fetchColumn();
    if ($adminCount > 0) {
        http_response_code(403);
        echo json_encode(['error' => 'Only one admin can sign up.']);
        exit();
    }
}

// Basic email / phone validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email']);
    exit();
}
if (!preg_match('/^[0-9+\-() ]{6,}$/', $phone)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid phone']);
    exit();
}

// Check for duplicate email or username or phone
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? OR username = ? OR phone = ?');
$stmt->execute([$email, $username, $phone]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email, username, or phone already exists']);
    exit();
}

// Handle photo upload
$photoPathRel = null;
if (!empty($_FILES['photo']['name']) && isset($_FILES['photo']['tmp_name']) && is_uploaded_file($_FILES['photo']['tmp_name'])) {
    $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/consty/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    $photoName = uniqid() . '_' . basename($_FILES['photo']['name']);
    $photoPathAbs = $uploadDir . $photoName;
    if (!move_uploaded_file($_FILES['photo']['tmp_name'], $photoPathAbs)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save photo']);
        exit();
    }
    $photoPathRel = '/consty/uploads/' . $photoName;
}

try {
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (username, email, phone, photo, password, role) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$username, $email, $phone, $photoPathRel, $hashed, $role]);
    $id = $pdo->lastInsertId();

    // Start authenticated session immediately
    $_SESSION['user'] = [
        'id' => $id,
        'username' => $username,
        'email' => $email,
        'role' => $role,
        'phone' => $phone,
        'photo' => $photoPathRel
    ];

    echo json_encode([
        'success' => true,
        'id' => $id,
        'username' => $username,
        'email' => $email,
        'role' => $role,
        'phone' => $phone,
        'photo' => $photoPathRel
    ]);
} catch (PDOException $e) {
    if (str_contains(strtolower($e->getMessage()), 'duplicate')) {
        http_response_code(409);
        echo json_encode(['error' => 'Username, email, phone, or photo already exists']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}
