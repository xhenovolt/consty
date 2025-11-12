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
    $month = $_GET['month'] ?? null;

    if (!$employee_id || !$month) {
        http_response_code(400);
        echo json_encode(['error' => 'Employee ID and month are required']);
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

        // Get all payments for this month ordered by payment date
        $stmt = $pdo->prepare("SELECT * FROM salaries WHERE employee_id = ? AND month = ? ORDER BY paid_at DESC");
        $stmt->execute([$employee_id, $month]);
        $previous_payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get the latest payment record to get current remaining salary
        $latest_payment = $previous_payments[0] ?? null;
        
        if ($latest_payment) {
            $remaining_salary = floatval($latest_payment['remaining_salary']);
            $total_paid = $monthly_salary - $remaining_salary;
        } else {
            $remaining_salary = $monthly_salary;
            $total_paid = 0;
        }

        // Check for unpaid previous months
        $current_month_num = date('n', strtotime($month . ' 1'));
        $current_year = date('Y');
        
        $unpaid_months = [];
        $has_unpaid_balance = false;
        
        // Check previous months in the same year
        for ($i = 1; $i < $current_month_num; $i++) {
            $check_month = date('F', mktime(0, 0, 0, $i, 1, $current_year));
            
            // Get the latest remaining_salary for the previous month
            $stmt = $pdo->prepare("SELECT remaining_salary FROM salaries WHERE employee_id = ? AND month = ? ORDER BY paid_at DESC LIMIT 1");
            $stmt->execute([$employee_id, $check_month]);
            $prev_month_record = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($prev_month_record) {
                $prev_remaining = floatval($prev_month_record['remaining_salary']);
            } else {
                // No payment record exists, so full salary is remaining
                $prev_remaining = $monthly_salary;
            }
            
            if ($prev_remaining > 0) {
                $unpaid_months[] = $check_month;
                $has_unpaid_balance = true;
            }
        }

        $response = [
            'success' => true,
            'employee' => $employee,
            'month' => $month,
            'monthly_salary' => $monthly_salary,
            'total_paid' => $total_paid,
            'remaining_salary' => max(0, $remaining_salary),
            'previous_payments' => $previous_payments,
            'status' => $remaining_salary <= 0 ? 'Fully paid' : ($total_paid > 0 ? 'Partially paid' : 'Unpaid'),
            'can_pay' => !$has_unpaid_balance && $remaining_salary > 0,
            'has_unpaid_balance' => $has_unpaid_balance,
            'unpaid_months' => $unpaid_months,
            'validation_error' => $has_unpaid_balance ? "Cannot pay for {$month}. Unpaid months: " . implode(', ', $unpaid_months) : null
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
