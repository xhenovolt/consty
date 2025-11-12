<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $isStopAction = $input['stop'] ?? false;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Project ID is required']);
        exit();
    }

    try {
        // Fetch the current status from the database
        $stmt = $pdo->prepare('SELECT status FROM projects WHERE id = ?');
        $stmt->execute([$id]);
        $project = $stmt->fetch();

        if (!$project) {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
            exit();
        }

        $currentStatus = $project['status'];

        // Determine the next status
        $nextStatus = '';
        if ($isStopAction) {
            $nextStatus = 'ended'; // Explicitly set to "ended" for the "Stop" button
        } else {
            switch ($currentStatus) {
                case 'ongoing':
                    $nextStatus = 'paused';
                    break;
                case 'paused':
                    $nextStatus = 'ongoing';
                    break;
                case 'ended':
                    http_response_code(400);
                    echo json_encode(['error' => 'Cannot change status of a completed project']);
                    exit();
                default:
                    $nextStatus = 'ongoing'; // Default to 'ongoing' for unknown statuses
            }
        }

        // Update the project status
        $updateStmt = $pdo->prepare('UPDATE projects SET status = ? WHERE id = ?');
        $updateStmt->execute([$nextStatus, $id]);

        // Log the status change
        $logStmt = $pdo->prepare('INSERT INTO project_logs (project_id, status, description) VALUES (?, ?, ?)');
        $logStmt->execute([$id, $nextStatus, "Status changed to $nextStatus"]);

        echo json_encode(['success' => true, 'message' => "Project status updated to '$nextStatus'"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update project status', 'details' => $e->getMessage()]);
    }
    exit();
}
