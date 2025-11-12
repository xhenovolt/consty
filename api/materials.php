<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

// MATERIALS TABLE
// CREATE TABLE materials (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(150) NOT NULL,
//     quantity INT DEFAULT 0,
//     used INT DEFAULT 0,
//     damaged INT DEFAULT 0,
//     leftover INT DEFAULT 0,
//     money_spent DECIMAL(12,2) DEFAULT 0.00,
//     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );

// Check if 'money_spent' column exists in 'materials', add if missing
$colCheck = $pdo->query("SHOW COLUMNS FROM materials LIKE 'money_spent'")->fetch();
if (!$colCheck) {
    $pdo->exec("ALTER TABLE materials ADD COLUMN money_spent DECIMAL(15,2) NOT NULL DEFAULT 0");
}

// Check if 'unit_price' column exists in 'materials', add if missing
$colCheck = $pdo->query("SHOW COLUMNS FROM materials LIKE 'unit_price'")->fetch();
if (!$colCheck) {
    $pdo->exec("ALTER TABLE materials ADD COLUMN unit_price DECIMAL(15,2) NOT NULL DEFAULT 0");
}

// Check if 'project_id' column exists in 'materials', add if missing
$colCheck = $pdo->query("SHOW COLUMNS FROM materials LIKE 'project_id'")->fetch();
if (!$colCheck) {
    $pdo->exec("ALTER TABLE materials ADD COLUMN project_id INT NULL");
}

try {
    // Helper: send JSON response
    function jsonResponse($data, $status = 200) {
        header('Content-Type: application/json');
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    // Read request method and body
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    // GET: fetch materials with supplier name via LEFT JOIN
    if ($method === 'GET') {
        try {
            // Adjust the query to include supplier info
            $stmt = $pdo->prepare("
                SELECT m.*, s.id AS supplier_id, s.name AS supplier_name
                FROM materials m
                LEFT JOIN suppliers s ON m.supplier_id = s.id
                ORDER BY m.id DESC
            ");
            $stmt->execute();
            $materials = $stmt->fetchAll(PDO::FETCH_ASSOC);

            jsonResponse(['materials' => $materials]);
        } catch (Exception $e) {
            jsonResponse(['error' => 'Failed to fetch materials: ' . $e->getMessage()], 500);
        }
    }

    // POST: create new material (accept supplier_id)
    if ($method === 'POST') {
        try {
            $name = $input['name'] ?? null;
            $quantity = isset($input['quantity']) ? (float)$input['quantity'] : 0;
            $unit_price = isset($input['unit_price']) ? (float)$input['unit_price'] : 0;
            $project_id = isset($input['project_id']) ? (int)$input['project_id'] : null;
            $supplier_id = isset($input['supplier_id']) ? (int)$input['supplier_id'] : null;
            $used = isset($input['used']) ? (float)$input['used'] : 0;
            $damaged = isset($input['damaged']) ? (float)$input['damaged'] : 0;
            $leftover = isset($input['leftover']) ? (float)$input['leftover'] : max(0, $quantity - $used - $damaged);

            if (!$name) jsonResponse(['error' => 'Material name is required'], 400);

            // If supplier_id provided, validate existence
            if ($supplier_id) {
                $s = $pdo->prepare('SELECT id FROM suppliers WHERE id = ?');
                $s->execute([$supplier_id]);
                if (!$s->fetch()) {
                    jsonResponse(['error' => 'Invalid supplier_id provided'], 400);
                }
            }

            $insert = $pdo->prepare('
                INSERT INTO materials (name, quantity, unit_price, project_id, supplier_id, used, damaged, leftover, money_spent, updated_at)
                VALUES (:name, :quantity, :unit_price, :project_id, :supplier_id, :used, :damaged, :leftover, :money_spent, NOW())
            ');
            $money_spent = (($used + $damaged) * $unit_price);
            $insert->execute([
                ':name' => $name,
                ':quantity' => $quantity,
                ':unit_price' => $unit_price,
                ':project_id' => $project_id,
                ':supplier_id' => $supplier_id,
                ':used' => $used,
                ':damaged' => $damaged,
                ':leftover' => $leftover,
                ':money_spent' => $money_spent
            ]);

            $materialId = $pdo->lastInsertId();
            // return created material including supplier_name
            $q = $pdo->prepare("
                SELECT m.*, s.id AS supplier_id, s.name AS supplier_name
                FROM materials m
                LEFT JOIN suppliers s ON m.supplier_id = s.id
                WHERE m.id = ?
                LIMIT 1
            ");
            $q->execute([$materialId]);
            $material = $q->fetch(PDO::FETCH_ASSOC);

            jsonResponse(['success' => true, 'material' => $material], 201);
        } catch (Exception $e) {
            jsonResponse(['error' => 'Failed to create material: ' . $e->getMessage()], 500);
        }
    }

    // PATCH: update material (including supplier_id). Body should include id.
    if ($method === 'PATCH') {
        try {
            $id = isset($input['id']) ? (int)$input['id'] : null;
            if (!$id) jsonResponse(['error' => 'Material id is required'], 400);

            // Fetch existing material
            $orig = $pdo->prepare('SELECT * FROM materials WHERE id = ?');
            $orig->execute([$id]);
            $existing = $orig->fetch(PDO::FETCH_ASSOC);
            if (!$existing) jsonResponse(['error' => 'Material not found'], 404);

            // Prepare updateable fields — keep existing values if not provided
            $name = $input['name'] ?? $existing['name'];
            $quantity = isset($input['quantity']) ? (float)$input['quantity'] : (float)$existing['quantity'];
            $unit_price = isset($input['unit_price']) ? (float)$input['unit_price'] : (float)$existing['unit_price'];
            $project_id = array_key_exists('project_id', $input) ? ($input['project_id'] === null ? null : (int)$input['project_id']) : $existing['project_id'];
            $supplier_id = array_key_exists('supplier_id', $input) ? ($input['supplier_id'] === null ? null : (int)$input['supplier_id']) : $existing['supplier_id'];
            $used = isset($input['used']) ? (float)$input['used'] : (float)$existing['used'];
            $damaged = isset($input['damaged']) ? (float)$input['damaged'] : (float)$existing['damaged'];
            $leftover = isset($input['leftover']) ? (float)$input['leftover'] : max(0, $quantity - $used - $damaged);
            $money_spent = isset($input['money_spent']) ? (float)$input['money_spent'] : (($used + $damaged) * $unit_price);

            // If supplier_id provided (not null), validate supplier exists
            if ($supplier_id) {
                $s = $pdo->prepare('SELECT id FROM suppliers WHERE id = ?');
                $s->execute([$supplier_id]);
                if (!$s->fetch()) {
                    jsonResponse(['error' => 'Invalid supplier_id provided'], 400);
                }
            }

            $update = $pdo->prepare('
                UPDATE materials SET
                    name = :name,
                    quantity = :quantity,
                    unit_price = :unit_price,
                    project_id = :project_id,
                    supplier_id = :supplier_id,
                    used = :used,
                    damaged = :damaged,
                    leftover = :leftover,
                    money_spent = :money_spent,
                    updated_at = NOW()
                WHERE id = :id
            ');
            $update->execute([
                ':name' => $name,
                ':quantity' => $quantity,
                ':unit_price' => $unit_price,
                ':project_id' => $project_id,
                ':supplier_id' => $supplier_id,
                ':used' => $used,
                ':damaged' => $damaged,
                ':leftover' => $leftover,
                ':money_spent' => $money_spent,
                ':id' => $id
            ]);

            // Return updated material including supplier_name
            $q = $pdo->prepare("
                SELECT m.*, s.id AS supplier_id, s.name AS supplier_name
                FROM materials m
                LEFT JOIN suppliers s ON m.supplier_id = s.id
                WHERE m.id = ?
                LIMIT 1
            ");
            $q->execute([$id]);
            $material = $q->fetch(PDO::FETCH_ASSOC);

            jsonResponse(['success' => true, 'material' => $material]);
        } catch (Exception $e) {
            jsonResponse(['error' => 'Failed to update material: ' . $e->getMessage()], 500);
        }
    }

    // DELETE: delete material by id (unchanged behavior)
    if ($method === 'DELETE') {
        try {
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            $id = $body['id'] ?? $_GET['id'] ?? null;
            if (!$id) jsonResponse(['error' => 'Material id required'], 400);

            $del = $pdo->prepare('DELETE FROM materials WHERE id = ?');
            $del->execute([$id]);

            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            jsonResponse(['error' => 'Failed to delete material: ' . $e->getMessage()], 500);
        }
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
