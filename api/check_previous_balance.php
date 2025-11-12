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
    $detailed = $_GET['detailed'] ?? false;

    if (!$employee_id || !$month) {
        http_response_code(400);
        echo json_encode(['error' => 'Employee ID and month are required']);
        exit;
    }

    try {
        // Get employee salary
        $stmt = $pdo->prepare("SELECT salary FROM employees WHERE id = ?");
        $stmt->execute([$employee_id]);
        $employee = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$employee) {
            http_response_code(404);
            echo json_encode(['error' => 'Employee not found']);
            exit;
        }

        $monthly_salary = floatval($employee['salary']);
        $current_month_num = date('n', strtotime($month . ' 1'));
        $current_year = date('Y');
        
        $unpaid_details = [];
        $total_unpaid = 0;
        $has_balance = false;
        
        // Check all previous months in the current year
        for ($i = 1; $i < $current_month_num; $i++) {
            $check_month = date('F', mktime(0, 0, 0, $i, 1, $current_year));
            
            // Get the latest remaining_salary for this month from the database
            $stmt = $pdo->prepare("SELECT remaining_salary, amount_paid FROM salaries WHERE employee_id = ? AND month = ? ORDER BY paid_at DESC LIMIT 1");
            $stmt->execute([$employee_id, $check_month]);
            $latest_record = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($latest_record) {
                $remaining = floatval($latest_record['remaining_salary']);
                $paid = floatval($latest_record['amount_paid']);
            } else {
                // No payment record exists, so full salary is remaining
                $remaining = $monthly_salary;
                $paid = 0;
            }
            
            if ($remaining > 0) {
                $has_balance = true;
                $total_unpaid += $remaining;
                $unpaid_details[] = [
                    'month' => $check_month,
                    'amount' => $remaining,
                    'paid' => $paid,
                    'salary' => $monthly_salary,
                    'status' => $paid == 0 ? 'Unpaid' : 'Partially paid'
                ];
            }
        }

        $response = [
            'success' => true,
            'has_balance' => $has_balance,
            'unpaid_balance' => $total_unpaid,
            'total_unpaid' => $total_unpaid,
            'unpaid_months' => implode(', ', array_column($unpaid_details, 'month')),
            'employee_id' => $employee_id,
            'target_month' => $month,
            'monthly_salary' => $monthly_salary
        ];

        if ($detailed) {
            $response['unpaid_details'] = $unpaid_details;
        }

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
