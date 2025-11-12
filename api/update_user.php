<?php
session_start();
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');

require_once 'db.php';

$id = $_POST['id'] ?? '';
$username = $_POST['username'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$oldPassword = $_POST['oldPassword'] ?? '';
$newPassword = $_POST['newPassword'] ?? '';

if (!$id || !$username || !$email || !$phone) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields required']);
    exit();
}

// Check for duplicate username/email/phone (excluding current user)
$stmt = $pdo->prepare('SELECT id FROM users WHERE (username = ? OR email = ? OR phone = ?) AND id != ?');
$stmt->execute([$username, $email, $phone, $id]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Username, email, or phone already exists']);
    exit();
}

// Handle photo upload
$photoPathRel = null;
if (!empty($_FILES['photo']['name'])) {
    $uploadDir = __DIR__ . '/../uploads';
    if (!is_dir($uploadDir)) { @mkdir($uploadDir, 0777, true); }
    $original = basename($_FILES['photo']['name']);
    $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
    $allowed = ['jpg','jpeg','png','webp'];
    if (!in_array($ext, $allowed)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid image type']);
        exit();
    }
    $photoName = uniqid('u_', true) . '.' . $ext;
    $photoPathRel = 'uploads/' . $photoName;
    $photoPathAbs = $uploadDir . '/' . $photoName;
    if (!move_uploaded_file($_FILES['photo']['tmp_name'], $photoPathAbs)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save photo']);
        exit();
    }
}

// Password update logic
if ($oldPassword && $newPassword) {
    $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($oldPassword, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Current password is incorrect']);
        exit();
    }
    $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
    $updatePassword = true;
} else {
    $updatePassword = false;
}

// Build update query
$fields = "username = ?, email = ?, phone = ?";
$params = [$username, $email, $phone];
if ($photoPathRel) {
    $fields .= ", photo = ?";
    $params[] = $photoPathRel;
}
if ($updatePassword) {
    $fields .= ", password = ?";
    $params[] = $hashed;
}
$params[] = $id;
$stmt = $pdo->prepare("UPDATE users SET $fields WHERE id = ?");
$stmt->execute($params);

// Return updated user
$stmt = $pdo->prepare('SELECT id, username, email, phone, photo, role, created_at FROM users WHERE id = ?');
$stmt->execute([$id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
$_SESSION['user'] = $user;

echo json_encode(['success' => true, 'user' => $user]);
