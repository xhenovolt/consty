<?php
session_start();
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

// Add this for restricted API endpoints (optional, for API guards)
if (
    isset($_GET['requireAdmin']) &&
    ($_SESSION['user']['role'] ?? '') !== 'admin'
) {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied. Admin privileges required.']);
    exit();
}

echo json_encode(['user' => $_SESSION['user']]);
