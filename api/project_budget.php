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
        // Fetch all project budgets
        $stmt = $pdo->query('SELECT SUM(budget) AS total_budget FROM projects');
        $budgets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate total spent across all projects
        $expenseStmt = $pdo->query('SELECT SUM(amount) AS total_spent FROM expenses');
        $totalSpent = $expenseStmt->fetchColumn() ?: 0;

        // foreach ($budgets as &$budget) {
        //     // Calculate actual spent for each project
        //     $projectExpenseStmt = $pdo->prepare('SELECT SUM(amount) AS project_spent FROM expenses WHERE project_id = ?');
        //     $projectExpenseStmt->execute([$budget['project_id']]);
        //     $projectSpent = $projectExpenseStmt->fetchColumn() ?: 0;

        //     // Update actual spent and remaining balance
        //     $budget['actual_spent'] = $projectSpent;
        //     $budget['remaining_balance'] = max(0, $budget['total_budget'] - $projectSpent);
        // }

        echo json_encode(['budgets' => $budgets, 'totalSpent' => $totalSpent]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit();
}


if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $fields = [];
    $params = [];
    foreach (["total_budget", "planned", "actual_spent", "remaining_balance"] as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    if (!$id || count($fields) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Budget id and at least one field required']);
        exit();
    }
    $params[] = $id;
    $sql = 'UPDATE project_budget SET ' . implode(', ', $fields) . ' WHERE id = ?';
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
        echo json_encode(['error' => 'Budget id required']);
        exit();
    }
    $stmt = $pdo->prepare('DELETE FROM project_budget WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
