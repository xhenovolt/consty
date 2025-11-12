<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

// MACHINES TABLE
// CREATE TABLE machines (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(150) NOT NULL,
//     quantity INT DEFAULT 0,
//     used INT DEFAULT 0,
//     damaged INT DEFAULT 0,
//     leftover INT DEFAULT 0,
//     money_spent DECIMAL(12,2) DEFAULT 0.00,
//     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );

// Check if 'project_id' column exists in 'machines', add if missing
$colCheck = $pdo->query("SHOW COLUMNS FROM machines LIKE 'project_id'")->fetch();
if (!$colCheck) {
    $pdo->exec("ALTER TABLE machines ADD COLUMN project_id INT NULL");
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// GET: return machines with supplier name (LEFT JOIN)
if ($method === 'GET') {
    $sql = "SELECT m.*, s.name AS supplier_name
            FROM machines m
            LEFT JOIN suppliers s ON m.supplier_id = s.id
            ORDER BY m.id DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $machines = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['machines' => $machines]);
    exit;
}

// POST: create machine (accept supplier_id)
if ($method === 'POST') {
    // validate required fields
    $name = $input['name'] ?? null;
    $quantity = isset($input['quantity']) ? (int)$input['quantity'] : 0;
    $unit_price = isset($input['unit_price']) ? (float)$input['unit_price'] : 0;
    $project_id = isset($input['project_id']) ? (int)$input['project_id'] : null;
    $supplier_id = isset($input['supplier_id']) ? ($input['supplier_id'] === null ? null : (int)$input['supplier_id']) : null;

    if (!$name) {
        http_response_code(400);
        echo json_encode(['error' => 'Name is required']);
        exit;
    }

    $sql = "INSERT INTO machines (name, quantity, unit_price, project_id, supplier_id, used, damaged, leftover, money_spent, updated_at)
            VALUES (:name, :quantity, :unit_price, :project_id, :supplier_id, 0, 0, :leftover, 0, NOW())";
    $stmt = $pdo->prepare($sql);
    $leftover = $quantity;
    $stmt->execute([
        ':name' => $name,
        ':quantity' => $quantity,
        ':unit_price' => $unit_price,
        ':project_id' => $project_id,
        ':supplier_id' => $supplier_id,
        ':leftover' => $leftover
    ]);
    $id = $pdo->lastInsertId();

    // return created machine (with supplier name)
    $stmt = $pdo->prepare("SELECT m.*, s.name AS supplier_name FROM machines m LEFT JOIN suppliers s ON m.supplier_id = s.id WHERE m.id = :id");
    $stmt->execute([':id' => $id]);
    $machine = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'machine' => $machine]);
    exit;
}

// PATCH/PUT: update machine (allow supplier_id)
if ($method === 'PATCH' || $method === 'PUT') {
    $id = $input['id'] ?? null;
    if (!$id) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }

    // build update fields dynamically (include supplier_id)
    $fields = [];
    $params = [':id' => $id];

    if (isset($input['name'])) { $fields[] = "name = :name"; $params[':name'] = $input['name']; }
    if (isset($input['quantity'])) { $fields[] = "quantity = :quantity"; $params[':quantity'] = (int)$input['quantity']; }
    if (array_key_exists('unit_price', $input)) { $fields[] = "unit_price = :unit_price"; $params[':unit_price'] = (float)$input['unit_price']; }
    if (array_key_exists('used', $input)) { $fields[] = "used = :used"; $params[':used'] = (int)$input['used']; }
    if (array_key_exists('damaged', $input)) { $fields[] = "damaged = :damaged"; $params[':damaged'] = (int)$input['damaged']; }
    if (array_key_exists('leftover', $input)) { $fields[] = "leftover = :leftover"; $params[':leftover'] = (int)$input['leftover']; }
    if (array_key_exists('money_spent', $input)) { $fields[] = "money_spent = :money_spent"; $params[':money_spent'] = (float)$input['money_spent']; }
    if (array_key_exists('project_id', $input)) { $fields[] = "project_id = :project_id"; $params[':project_id'] = $input['project_id'] === null ? null : (int)$input['project_id']; }
    if (array_key_exists('supplier_id', $input)) { $fields[] = "supplier_id = :supplier_id"; $params[':supplier_id'] = $input['supplier_id'] === null ? null : (int)$input['supplier_id']; }

    if (empty($fields)) { echo json_encode(['success'=>true]); exit; }

    $sql = "UPDATE machines SET " . implode(", ", $fields) . ", updated_at = NOW() WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $ok = $stmt->execute($params);
    if (!$ok) { http_response_code(500); echo json_encode(['error'=>'Failed to update']); exit; }

    // return updated machine
    $stmt = $pdo->prepare("SELECT m.*, s.name AS supplier_name FROM machines m LEFT JOIN suppliers s ON m.supplier_id = s.id WHERE m.id = :id");
    $stmt->execute([':id' => $id]);
    $machine = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'machine' => $machine]);
    exit;
}

// DELETE: remove machine by ID
if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? null; // Use query parameter for ID
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Machine ID is required.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM machines WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete machine.']);
    }
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
