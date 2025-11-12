<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM expense_categories ORDER BY id DESC');
    $categories = $stmt->fetchAll();
    echo json_encode(['categories' => $categories]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    $description = $input['description'] ?? '';
    if (!$name) {
        http_response_code(400);
        echo json_encode(['error' => 'Category name required']);
        exit();
    }
    $stmt = $pdo->prepare('INSERT INTO expense_categories (name, description) VALUES (?, ?)');
    $stmt->execute([$name, $description]);
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $fields = [];
    $params = [];
    foreach (["name", "description"] as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    if (!$id || count($fields) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Category id and at least one field required']);
        exit();
    }
    $params[] = $id;
    $sql = 'UPDATE expense_categories SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Category id required']);
        exit();
    }
    $stmt = $pdo->prepare('DELETE FROM expense_categories WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
