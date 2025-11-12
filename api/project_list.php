<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');

require_once 'db.php';

$stmt = $pdo->query('SELECT id, name FROM projects ORDER BY name ASC');
$projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['projects' => $projects]);
