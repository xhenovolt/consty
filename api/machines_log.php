<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');
require_once 'db.php';

// Check if 'damaged_used' column exists in 'machines_log', add if missing
$colCheck = $pdo->query("SHOW COLUMNS FROM machines_log LIKE 'damaged_used'")->fetch();
if (!$colCheck) {
    $pdo->exec("ALTER TABLE machines_log ADD COLUMN damaged_used INT NOT NULL DEFAULT 0");
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $project_id = $_GET['project_id'] ?? null;
    if ($project_id) {
        $stmt = $pdo->prepare('SELECT ml.*, m.name as machine_name, p.name as project_name FROM machines_log ml JOIN machines m ON ml.machine_id = m.id JOIN projects p ON ml.project_id = p.id WHERE ml.project_id = ? ORDER BY ml.logged_at DESC');
        $stmt->execute([$project_id]);
        $logs = $stmt->fetchAll();
    } else {
        $stmt = $pdo->query('SELECT ml.*, m.name as machine_name, p.name as project_name FROM machines_log ml JOIN machines m ON ml.machine_id = m.id JOIN projects p ON ml.project_id = p.id ORDER BY ml.logged_at DESC');
        $logs = $stmt->fetchAll();
    }
    echo json_encode(['logs' => $logs]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $project_id = $input['project_id'] ?? null;
    $machine_id = $input['machine_id'] ?? null;
    $quantity_used = isset($input['quantity_used']) ? (int)$input['quantity_used'] : null;
    $damaged_used = isset($input['damaged_used']) ? (int)$input['damaged_used'] : 0;
    if (!$project_id || !$machine_id || $quantity_used === null) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields required']);
        exit();
    }
    // Log usage
    $stmt = $pdo->prepare('INSERT INTO machines_log (project_id, machine_id, quantity_used, damaged_used, logged_at) VALUES (?, ?, ?, ?, NOW())');
    $stmt->execute([$project_id, $machine_id, $quantity_used, $damaged_used]);
    // Update machine usage in machines table
    $stmt = $pdo->prepare('SELECT used, damaged, quantity, unit_price, money_spent FROM machines WHERE id = ?');
    $stmt->execute([$machine_id]);
    $mach = $stmt->fetch();
    $new_used = ($mach['used'] ?? 0) + $quantity_used;
    $new_damaged = ($mach['damaged'] ?? 0) + $damaged_used;
    $new_leftover = ($mach['quantity'] ?? 0) - ($new_used + $new_damaged);
    $increment_spent = ($quantity_used + $damaged_used) * ($mach['unit_price'] ?? 0);
    $new_money_spent = ($mach['money_spent'] ?? 0) + $increment_spent;
    $stmt = $pdo->prepare('UPDATE machines SET used = ?, damaged = ?, leftover = ?, money_spent = ?, project_id = ? WHERE id = ?');
    $stmt->execute([$new_used, $new_damaged, $new_leftover, $new_money_spent, $project_id, $machine_id]);
    // After logging, update the machines table so frontend shows real data
    $stmt = $pdo->prepare('SELECT SUM(quantity_used) as total_used, SUM(damaged_used) as total_damaged FROM machines_log WHERE machine_id = ?');
    $stmt->execute([$machine_id]);
    $totals = $stmt->fetch();
    $stmt = $pdo->prepare('SELECT quantity FROM machines WHERE id = ?');
    $stmt->execute([$machine_id]);
    $mach = $stmt->fetch();
    $new_used = (int)($totals['total_used'] ?? 0);
    $new_damaged = (int)($totals['total_damaged'] ?? 0);
    $new_leftover = (int)($mach['quantity'] ?? 0) - ($new_used + $new_damaged);
    $stmt = $pdo->prepare('UPDATE machines SET used = ?, damaged = ?, leftover = ?, project_id = ? WHERE id = ?');
    $stmt->execute([$new_used, $new_damaged, $new_leftover, $project_id, $machine_id]);
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
