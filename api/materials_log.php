<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

// Check if 'quantity_damaged' column exists in 'materials_log', add if missing
$tableCheck = $pdo->query("SHOW COLUMNS FROM materials_log LIKE 'quantity_damaged'")->fetch();
if (!$tableCheck) {
    $pdo->exec("ALTER TABLE materials_log ADD COLUMN quantity_damaged INT NOT NULL DEFAULT 0");
}

// Check if 'used', 'damaged', and 'leftover' columns exist in 'materials', add if missing
$cols = ['used INT NOT NULL DEFAULT 0', 'damaged INT NOT NULL DEFAULT 0', 'leftover INT NOT NULL DEFAULT 0'];
$colNames = ['used', 'damaged', 'leftover'];
foreach ($colNames as $i => $col) {
    $colCheck = $pdo->query("SHOW COLUMNS FROM materials LIKE '$col'")->fetch();
    if (!$colCheck) {
        $pdo->exec("ALTER TABLE materials ADD COLUMN {$cols[$i]}");
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $project_id = $_GET['project_id'] ?? null;
    if ($project_id) {
        $stmt = $pdo->prepare('SELECT ml.*, m.name as material_name, p.name as project_name FROM materials_log ml JOIN materials m ON ml.material_id = m.id JOIN projects p ON ml.project_id = p.id WHERE ml.project_id = ? ORDER BY ml.logged_at DESC');
        $stmt->execute([$project_id]);
        $logs = $stmt->fetchAll();
    } else {
        $stmt = $pdo->query('SELECT ml.*, m.name as material_name, p.name as project_name FROM materials_log ml JOIN materials m ON ml.material_id = m.id JOIN projects p ON ml.project_id = p.id ORDER BY ml.logged_at DESC');
        $logs = $stmt->fetchAll();
    }
    echo json_encode(['materials_log' => $logs]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $project_id = $input['project_id'] ?? null;
    $material_id = $input['material_id'] ?? null;
    $quantity_used = isset($input['quantity_used']) ? (int)$input['quantity_used'] : null;
    $quantity_damaged = isset($input['quantity_damaged']) ? (int)$input['quantity_damaged'] : 0;

    if (!$project_id || !$material_id || $quantity_used === null) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields required']);
        exit();
    }

    $currentTimestamp = date("Y-m-d H:i:s"); // Generate the current timestamp in PHP

    // Log usage
    $stmt = $pdo->prepare('INSERT INTO materials_log (project_id, material_id, quantity_used, quantity_damaged, logged_at) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$project_id, $material_id, $quantity_used, $quantity_damaged, $currentTimestamp]);

    // Update material usage in materials table
    $stmt = $pdo->prepare('SELECT used, damaged, quantity, price, money_spent FROM materials WHERE id = ?');
    $stmt->execute([$material_id]);
    $mat = $stmt->fetch();
    $new_used = ($mat['used'] ?? 0) + $quantity_used;
    $new_damaged = ($mat['damaged'] ?? 0) + $quantity_damaged;
    $new_leftover = ($mat['quantity'] ?? 0) - ($new_used + $new_damaged);
    $increment_spent = ($quantity_used + $quantity_damaged) * ($mat['price'] ?? 0);
    $new_money_spent = ($mat['money_spent'] ?? 0) + $increment_spent;
    $stmt = $pdo->prepare('UPDATE materials SET used = ?, damaged = ?, leftover = ?, money_spent = ?, project_id = ? WHERE id = ?');
    $stmt->execute([$new_used, $new_damaged, $new_leftover, $new_money_spent, $project_id, $material_id]);

    // Log expense in expenses table
    $stmt = $pdo->prepare('INSERT INTO expenses (project_id, category_id, amount, description, spent_at) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$project_id, null, $increment_spent, 'Material usage logged', $currentTimestamp]);

    // After logging, update the materials table so frontend shows real data
    $stmt = $pdo->prepare('SELECT SUM(quantity_used) as total_used, SUM(quantity_damaged) as total_damaged FROM materials_log WHERE material_id = ?');
    $stmt->execute([$material_id]);
    $totals = $stmt->fetch();
    $stmt = $pdo->prepare('SELECT quantity FROM materials WHERE id = ?');
    $stmt->execute([$material_id]);
    $mat = $stmt->fetch();
    $new_used = (int)($totals['total_used'] ?? 0);
    $new_damaged = (int)($totals['total_damaged'] ?? 0);
    $new_leftover = (int)($mat['quantity'] ?? 0) - ($new_used + $new_damaged);
    $stmt = $pdo->prepare('UPDATE materials SET used = ?, damaged = ?, leftover = ?, project_id = ? WHERE id = ?');
    $stmt->execute([$new_used, $new_damaged, $new_leftover, $project_id, $material_id]);

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
