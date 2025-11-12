<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Fetch all budget categories
        $stmt = $pdo->query('SELECT * FROM budget_categories');
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($categories as &$category) {
            // Calculate actual spent for the category from the expenses table
            $expenseStmt = $pdo->prepare('SELECT SUM(amount) AS total_spent FROM expenses WHERE category_id = ?');
            $expenseStmt->execute([$category['id']]);
            $totalSpent = $expenseStmt->fetchColumn() ?: 0;

            // Update actual spent
            $category['actual_spent'] = $totalSpent;
        }

        echo json_encode(['categories' => $categories]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
    $fields = [];
    $params = [];
    foreach (["name", "planned_amount", "actual_spent"] as $field) {
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
    $sql = 'UPDATE budget_categories SET ' . implode(', ', $fields) . ' WHERE id = ?';
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
    $stmt = $pdo->prepare('DELETE FROM budget_categories WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
