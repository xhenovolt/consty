<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $projectId = $_GET['id'] ?? null;

    if (!$projectId) {
        http_response_code(400);
        echo json_encode(['error' => 'Project ID is required']);
        exit();
    }

    // Fetch project details
    $stmt = $pdo->prepare('SELECT * FROM projects WHERE id = ?');
    $stmt->execute([$projectId]);
    $project = $stmt->fetch();

    if (!$project) {
        http_response_code(404);
        echo json_encode(['error' => 'Project not found']);
        exit();
    }

    // Calculate progress
    $expenseStmt = $pdo->prepare('SELECT SUM(amount) AS total_expenses FROM expenses WHERE project_id = ?');
    $expenseStmt->execute([$projectId]);
    $totalExpenses = $expenseStmt->fetchColumn() ?: 0;

    $progress = $project['budget'] > 0 ? ($totalExpenses / $project['budget']) * 100 : 0;

    // Fetch related data
    $teamStmt = $pdo->prepare('SELECT u.id, u.username FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE tm.project_id = ?');
    $teamStmt->execute([$projectId]);
    $teamMembers = $teamStmt->fetchAll();

    $tasksStmt = $pdo->prepare('SELECT * FROM tasks WHERE project_id = ?');
    $tasksStmt->execute([$projectId]);
    $tasks = $tasksStmt->fetchAll();

    $documentsStmt = $pdo->prepare('SELECT * FROM documents WHERE project_id = ?');
    $documentsStmt->execute([$projectId]);
    $documents = $documentsStmt->fetchAll();

    $expensesStmt = $pdo->prepare('SELECT * FROM expenses WHERE project_id = ? ORDER BY spent_at DESC');
    $expensesStmt->execute([$projectId]);
    $expenses = $expensesStmt->fetchAll();

    echo json_encode([
        'project' => $project,
        'progress' => $progress,
        'team_members' => $teamMembers,
        'tasks' => $tasks,
        'documents' => $documents,
        'expenses' => $expenses,
    ]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
