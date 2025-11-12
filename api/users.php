<?php
session_start();
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');

require_once 'db.php';

$action = $_GET['action'] ?? '';

// Restrict all actions to admin except login
if (!isset($_SESSION['user']) || ($_SESSION['user']['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied. Admin privileges required.']);
    exit();
}

if ($action === 'list') {
    $stmt = $pdo->query('SELECT id, username, email, phone, photo, role, created_at, updated_at FROM users ORDER BY id DESC');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['users' => $users]);
    exit();
}

if ($action === 'add') {
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $role = $_POST['role'] ?? 'user';
    $password = $_POST['password'] ?? '';
    if (!$username || !$email || !$phone || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields required']);
        exit();
    }
    // Check for duplicates
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ? OR phone = ?');
    $stmt->execute([$username, $email, $phone]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Username, email, or phone already exists']);
        exit();
    }
    // Handle photo
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
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (username, email, phone, photo, password, role) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$username, $email, $phone, $photoPathRel, $hashed, $role]);
    echo json_encode(['success' => true]);
    exit();
}

if ($action === 'edit') {
    $id = $_POST['id'] ?? '';
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $role = $_POST['role'] ?? 'user';
    if (!$id || !$username || !$email || !$phone) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields required']);
        exit();
    }
    // Check for duplicates
    $stmt = $pdo->prepare('SELECT id FROM users WHERE (username = ? OR email = ? OR phone = ?) AND id != ?');
    $stmt->execute([$username, $email, $phone, $id]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Username, email, or phone already exists']);
        exit();
    }
    // Handle photo
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
    $fields = "username = ?, email = ?, phone = ?, role = ?";
    $params = [$username, $email, $phone, $role];
    if ($photoPathRel) {
        $fields .= ", photo = ?";
        $params[] = $photoPathRel;
    }
    $params[] = $id;
    $stmt = $pdo->prepare("UPDATE users SET $fields WHERE id = ?");
    $stmt->execute($params);
    echo json_encode(['success' => true]);
    exit();
}

if ($action === 'delete') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'User id required']);
        exit();
    }
    $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid action']);
