<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PATCH, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT *, updated_at FROM documents ORDER BY id DESC');
    $documents = $stmt->fetchAll();
    echo json_encode(['documents' => $documents]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['edit']) && $_POST['edit'] == '1') {
        // Edit document
        $id = $_POST['id'] ?? null;
        $name = $_POST['name'] ?? null;
        $project_id = $_POST['project_id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Document ID required']);
            exit();
        }
        $fields = [];
        $params = [];
        if ($name !== null && $name !== '') { $fields[] = 'name = ?'; $params[] = $name; }
        if ($project_id !== null && $project_id !== '') { $fields[] = 'project_id = ?'; $params[] = $project_id; }
        if (!empty($_FILES['file']['name']) && isset($_FILES['file']['tmp_name']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
            $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/consty/uploads/';
            if (!is_dir($uploadDir)) { mkdir($uploadDir, 0777, true); }
            $fileName = uniqid() . '_' . basename($_FILES['file']['name']);
            $filePathAbs = $uploadDir . $fileName;
            if (!move_uploaded_file($_FILES['file']['tmp_name'], $filePathAbs)) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to save file']);
                exit();
            }
            $filePathRel = '/consty/uploads/' . $fileName;
            $fields[] = 'file_path = ?';
            $params[] = $filePathRel;
        }
        if (count($fields) === 0) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit();
        }
        $params[] = $id;
        $sql = 'UPDATE documents SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['success' => true]);
        exit();
    } else {
        // Upload new document
        $name = $_POST['name'] ?? '';
        $project_id = $_POST['project_id'] ?? '';
        if (!$name || !$project_id || empty($_FILES['file']['name']) || !isset($_FILES['file']['tmp_name']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'All fields required']);
            exit();
        }
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/consty/uploads/';
        if (!is_dir($uploadDir)) { mkdir($uploadDir, 0777, true); }
        $fileName = uniqid() . '_' . basename($_FILES['file']['name']);
        $filePathAbs = $uploadDir . $fileName;
        if (!move_uploaded_file($_FILES['file']['tmp_name'], $filePathAbs)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save file']);
            exit();
        }
        $filePathRel = '/consty/uploads/' . $fileName;
        $stmt = $pdo->prepare('INSERT INTO documents (project_id, name, file_path) VALUES (?, ?, ?)');
        $stmt->execute([$project_id, $name, $filePathRel]);
        echo json_encode(['success' => true]);
        exit();
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $id = $_POST['id'] ?? null;
    $name = $_POST['name'] ?? null;
    $project_id = $_POST['project_id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Document ID required']);
        exit();
    }
    $fields = [];
    $params = [];
    if ($name !== null && $name !== '') { $fields[] = 'name = ?'; $params[] = $name; }
    if ($project_id !== null && $project_id !== '') { $fields[] = 'project_id = ?'; $params[] = $project_id; }
    if (!empty($_FILES['file']['name']) && isset($_FILES['file']['tmp_name']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/consty/uploads/';
        if (!is_dir($uploadDir)) { mkdir($uploadDir, 0777, true); }
        $fileName = uniqid() . '_' . basename($_FILES['file']['name']);
        $filePathAbs = $uploadDir . $fileName;
        if (!move_uploaded_file($_FILES['file']['tmp_name'], $filePathAbs)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save file']);
            exit();
        }
        $filePathRel = '/consty/uploads/' . $fileName;
        $fields[] = 'file_path = ?';
        $params[] = $filePathRel;
    }
    if (count($fields) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        exit();
    }
    $params[] = $id;
    $sql = 'UPDATE documents SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Document ID required']);
        exit();
    }
    $stmt = $pdo->prepare('DELETE FROM documents WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
