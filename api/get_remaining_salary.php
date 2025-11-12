<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $employee_id = $_GET['employee_id'] ?? null;
    $month = $_GET['month'] ?? date('F'); // Default to current month

    if (!$employee_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Employee ID is required']);
        exit;
    }

    try {
        // Get employee details
        $stmt = $pdo->prepare("SELECT * FROM employees WHERE id = ?");
        $stmt->execute([$employee_id]);
        $employee = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$employee) {
            http_response_code(404);
            echo json_encode(['error' => 'Employee not found']);
            exit;
        }

        $monthly_salary = floatval($employee['salary']);

        // Get the latest salary record for the specified month (most recent payment)
        $stmt = $pdo->prepare("SELECT * FROM salaries WHERE employee_id = ? AND month = ? ORDER BY paid_at DESC LIMIT 1");
        $stmt->execute([$employee_id, $month]);
        $latest_payment = $stmt->fetch(PDO::FETCH_ASSOC);

        // Get all payments for this month for breakdown
        $stmt = $pdo->prepare("SELECT * FROM salaries WHERE employee_id = ? AND month = ? ORDER BY paid_at DESC");
        $stmt->execute([$employee_id, $month]);
        $all_payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($latest_payment) {
            // Use the remaining_salary from the latest payment record
            $remaining_salary = floatval($latest_payment['remaining_salary']);
            $total_paid = $monthly_salary - $remaining_salary;
        } else {
            // No payments made for this month yet
            $remaining_salary = $monthly_salary;
            $total_paid = 0;
        }

        $response = [
            'success' => true,
            'employee_id' => $employee_id,
            'month' => $month,
            'monthly_salary' => $monthly_salary,
            'total_paid' => $total_paid,
            'remaining_salary' => $remaining_salary,
            'is_fully_paid' => $remaining_salary == 0,
            'payment_count' => count($all_payments),
            'salary_breakdown' => [
                'base_salary' => $monthly_salary,
                'payments_made' => $all_payments,
                'remaining' => $remaining_salary,
                'percentage_paid' => $monthly_salary > 0 ? round((($monthly_salary - $remaining_salary) / $monthly_salary) * 100, 2) : 0
            ]
        ];

        echo json_encode($response);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
