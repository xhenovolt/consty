<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
header('Content-Type: application/json');
require_once 'db.php';

try {
    // Get date range parameters
    $range = $_GET['range'] ?? 'today';
    $start = $_GET['start'] ?? null;
    $end = $_GET['end'] ?? null;
    
    // Build date filter based on range for different date columns
    function buildDateFilter($dateColumn, $range, $start = null, $end = null) {
        $dateParams = [];
        
        switch ($range) {
            case 'today':
                return ["DATE($dateColumn) = CURDATE()", []];
            case 'yesterday':
                return ["DATE($dateColumn) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)", []];
            case 'last_7_days':
                return ["$dateColumn >= DATE_SUB(NOW(), INTERVAL 7 DAY)", []];
            case 'this_month':
                return ["MONTH($dateColumn) = MONTH(NOW()) AND YEAR($dateColumn) = YEAR(NOW())", []];
            case 'last_month':
                return ["MONTH($dateColumn) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) AND YEAR($dateColumn) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))", []];
            case 'custom':
                if ($start && $end) {
                    return ["DATE($dateColumn) BETWEEN ? AND ?", [$start, $end]];
                }
                return ["1=1", []];
            default:
                return ["1=1", []];
        }
    }

    // 1. USERS DATA AND ANALYTICS (uses created_at)
    list($userDateFilter, $userDateParams) = buildDateFilter('u.created_at', $range, $start, $end);
    $usersQuery = "
        SELECT u.*, 
               COUNT(DISTINCT tm.project_id) as projects_involved,
               COUNT(DISTINCT t.id) as tasks_assigned
        FROM users u
        LEFT JOIN team_members tm ON u.id = tm.user_id
        LEFT JOIN tasks t ON u.id = t.assigned_to
        WHERE $userDateFilter
        GROUP BY u.id
        ORDER BY u.created_at DESC
    ";
    $stmt = $pdo->prepare($usersQuery);
    $stmt->execute($userDateParams);
    $users = $stmt->fetchAll();

    $userMetrics = $pdo->query("
        SELECT 
            COUNT(*) as total_users,
            SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
            SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regular_users,
            SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today
        FROM users
    ")->fetch();

    // 2. PROJECTS DATA AND ANALYTICS (uses updated_at)
    list($projectDateFilter, $projectDateParams) = buildDateFilter('p.updated_at', $range, $start, $end);
    $projectsQuery = "
        SELECT p.*, 
               COUNT(DISTINCT tm.user_id) as team_size,
               COUNT(DISTINCT t.id) as total_tasks,
               COUNT(DISTINCT d.id) as documents_count,
               COALESCE(pb.total_budget, 0) as budget_allocated,
               COALESCE(pb.actual_spent, 0) as budget_spent,
               COALESCE(pb.remaining_balance, 0) as budget_remaining
        FROM projects p
        LEFT JOIN team_members tm ON p.id = tm.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        LEFT JOIN documents d ON p.id = d.project_id
        LEFT JOIN project_budget pb ON p.id = pb.project_id
        WHERE $projectDateFilter
        GROUP BY p.id
        ORDER BY p.updated_at DESC
    ";
    $stmt = $pdo->prepare($projectsQuery);
    $stmt->execute($projectDateParams);
    $projects = $stmt->fetchAll();

    $projectMetrics = $pdo->query("
        SELECT 
            COUNT(*) as total_projects,
            SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing_projects,
            SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused_projects,
            SUM(CASE WHEN status = 'ended' THEN 1 ELSE 0 END) as completed_projects,
            AVG(budget) as avg_budget,
            SUM(budget) as total_budget_value
        FROM projects
    ")->fetch();

    // 3. TEAM MEMBERS DATA (uses updated_at)
    list($teamDateFilter, $teamDateParams) = buildDateFilter('tm.updated_at', $range, $start, $end);
    $teamQuery = "
        SELECT tm.*, 
               u.username, u.email,
               p.name as project_name
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        JOIN projects p ON tm.project_id = p.id
        WHERE $teamDateFilter
        ORDER BY tm.updated_at DESC
    ";
    $stmt = $pdo->prepare($teamQuery);
    $stmt->execute($teamDateParams);
    $team_members = $stmt->fetchAll();

    // 4. TASKS DATA AND ANALYTICS (uses updated_at)
    list($taskDateFilter, $taskDateParams) = buildDateFilter('t.updated_at', $range, $start, $end);
    $tasksQuery = "
        SELECT t.*, 
               u.username as assigned_user,
               p.name as project_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN projects p ON t.project_id = p.id
        WHERE $taskDateFilter
        ORDER BY t.updated_at DESC
    ";
    $stmt = $pdo->prepare($tasksQuery);
    $stmt->execute($taskDateParams);
    $tasks = $stmt->fetchAll();

    $taskMetrics = $pdo->query("
        SELECT 
            COUNT(*) as total_tasks,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
            SUM(CASE WHEN deadline < CURDATE() AND status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks
        FROM tasks
    ")->fetch();

    // 5. DOCUMENTS DATA (uses uploaded_at)
    list($docDateFilter, $docDateParams) = buildDateFilter('d.uploaded_at', $range, $start, $end);
    $documentsQuery = "
        SELECT d.*, p.name as project_name
        FROM documents d
        JOIN projects p ON d.project_id = p.id
        WHERE $docDateFilter
        ORDER BY d.uploaded_at DESC
    ";
    $stmt = $pdo->prepare($documentsQuery);
    $stmt->execute($docDateParams);
    $documents = $stmt->fetchAll();

    // 6. MATERIALS DATA AND ANALYTICS (uses updated_at)
    list($materialDateFilter, $materialDateParams) = buildDateFilter('m.updated_at', $range, $start, $end);
    $materialsQuery = "
        SELECT m.*,
               COALESCE(SUM(ml.quantity_used), 0) as total_used,
               (m.quantity - COALESCE(SUM(ml.quantity_used), 0)) as remaining
        FROM materials m
        LEFT JOIN materials_log ml ON m.id = ml.material_id
        WHERE $materialDateFilter
        GROUP BY m.id
        ORDER BY m.updated_at DESC
    ";
    $stmt = $pdo->prepare($materialsQuery);
    $stmt->execute($materialDateParams);
    $materials = $stmt->fetchAll();

    $materialMetrics = $pdo->query("
        SELECT 
            COUNT(*) as total_materials,
            SUM(quantity) as total_quantity,
            SUM(money_spent) as total_material_cost,
            AVG(unit_price) as avg_unit_price
        FROM materials
    ")->fetch();

    // 7. MATERIALS LOG DATA (uses logged_at)
    list($materialLogDateFilter, $materialLogDateParams) = buildDateFilter('ml.logged_at', $range, $start, $end);
    $materialsLogQuery = "
        SELECT ml.*, 
               m.name as material_name,
               p.name as project_name
        FROM materials_log ml
        JOIN materials m ON ml.material_id = m.id
        JOIN projects p ON ml.project_id = p.id
        WHERE $materialLogDateFilter
        ORDER BY ml.logged_at DESC
    ";
    $stmt = $pdo->prepare($materialsLogQuery);
    $stmt->execute($materialLogDateParams);
    $materials_log = $stmt->fetchAll();

    // 8. MACHINES DATA AND ANALYTICS (uses updated_at)
    list($machineeDateFilter, $machineDateParams) = buildDateFilter('m.updated_at', $range, $start, $end);
    $machinesQuery = "
        SELECT m.*,
               COALESCE(SUM(ml.quantity_used), 0) as total_usage
        FROM machines m
        LEFT JOIN machines_log ml ON m.id = ml.machine_id
        WHERE $machineeDateFilter
        GROUP BY m.id
        ORDER BY m.updated_at DESC
    ";
    $stmt = $pdo->prepare($machinesQuery);
    $stmt->execute($machineDateParams);
    $machines = $stmt->fetchAll();

    $machineMetrics = $pdo->query("
        SELECT 
            COUNT(*) as total_machines,
            SUM(quantity) as total_quantity,
            SUM(used) as total_used,
            SUM(damaged) as total_damaged,
            SUM(money_spent) as total_machine_cost
        FROM machines
    ")->fetch();

    // 9. MACHINES LOG DATA (uses logged_at)
    list($machineLogDateFilter, $machineLogDateParams) = buildDateFilter('ml.logged_at', $range, $start, $end);
    $machinesLogQuery = "
        SELECT ml.*, 
               m.name as machine_name,
               p.name as project_name
        FROM machines_log ml
        JOIN machines m ON ml.machine_id = m.id
        JOIN projects p ON ml.project_id = p.id
        WHERE $machineLogDateFilter
        ORDER BY ml.logged_at DESC
    ";
    $stmt = $pdo->prepare($machinesLogQuery);
    $stmt->execute($machineLogDateParams);
    $machines_log = $stmt->fetchAll();

    // 10. ARCHITECTS DATA (uses updated_at)
    list($architectDateFilter, $architectDateParams) = buildDateFilter('a.updated_at', $range, $start, $end);
    $architectsQuery = "
        SELECT a.*, p.name as project_name
        FROM architects a
        LEFT JOIN projects p ON a.project_id = p.id
        WHERE $architectDateFilter
        ORDER BY a.updated_at DESC
    ";
    $stmt = $pdo->prepare($architectsQuery);
    $stmt->execute($architectDateParams);
    $architects = $stmt->fetchAll();

    // 11. EMPLOYEES DATA AND ANALYTICS (uses updated_at)
    list($employeeDateFilter, $employeeDateParams) = buildDateFilter('e.updated_at', $range, $start, $end);
    $employeesQuery = "
        SELECT e.*, 
               p.name as project_name,
               COALESCE(SUM(wh.hours_worked), 0) as total_hours,
               COALESCE(SUM(s.amount_paid), 0) as total_paid
        FROM employees e
        LEFT JOIN projects p ON e.project_id = p.id
        LEFT JOIN working_hours wh ON e.id = wh.employee_id
        LEFT JOIN salaries s ON e.id = s.employee_id
        WHERE $employeeDateFilter
        GROUP BY e.id
        ORDER BY e.updated_at DESC
    ";
    $stmt = $pdo->prepare($employeesQuery);
    $stmt->execute($employeeDateParams);
    $employees = $stmt->fetchAll();

    $employeeMetrics = $pdo->query("
        SELECT 
            COUNT(*) as total_employees,
            AVG(salary) as avg_salary,
            SUM(salary) as total_salary_budget
        FROM employees
    ")->fetch();

    // 12. WORKING HOURS DATA (uses logged_at)
    list($hoursDateFilter, $hoursDateParams) = buildDateFilter('wh.logged_at', $range, $start, $end);
    $workingHoursQuery = "
        SELECT wh.*, 
               e.name as employee_name,
               p.name as project_name
        FROM working_hours wh
        JOIN employees e ON wh.employee_id = e.id
        JOIN projects p ON wh.project_id = p.id
        WHERE $hoursDateFilter
        ORDER BY wh.logged_at DESC
    ";
    $stmt = $pdo->prepare($workingHoursQuery);
    $stmt->execute($hoursDateParams);
    $working_hours = $stmt->fetchAll();

    // 13. BUDGET CATEGORIES DATA (uses updated_at)
    list($budgetDateFilter, $budgetDateParams) = buildDateFilter('bc.updated_at', $range, $start, $end);
    $budgetCategoriesQuery = "
        SELECT bc.*, p.name as project_name
        FROM budget_categories bc
        JOIN projects p ON bc.project_id = p.id
        WHERE $budgetDateFilter
        ORDER BY bc.updated_at DESC
    ";
    $stmt = $pdo->prepare($budgetCategoriesQuery);
    $stmt->execute($budgetDateParams);
    $budget_categories = $stmt->fetchAll();

    // 14. EXPENSES DATA AND ANALYTICS (uses spent_at)
    list($expenseDateFilter, $expenseDateParams) = buildDateFilter('e.spent_at', $range, $start, $end);
    $expensesQuery = "
        SELECT e.*, 
               p.name as project_name,
               ec.name as category_name,
               t.name as task_name
        FROM expenses e
        JOIN projects p ON e.project_id = p.id
        LEFT JOIN expense_categories ec ON e.category_id = ec.id
        LEFT JOIN tasks t ON e.task_id = t.id
        WHERE $expenseDateFilter
        ORDER BY e.spent_at DESC
    ";
    $stmt = $pdo->prepare($expensesQuery);
    $stmt->execute($expenseDateParams);
    $expenses = $stmt->fetchAll();

    $expenseMetrics = $pdo->query("
        SELECT 
            COUNT(*) as total_transactions,
            SUM(amount) as total_expenses,
            AVG(amount) as avg_expense,
            MAX(amount) as largest_expense
        FROM expenses
    ")->fetch();

    // 15. PROJECT BUDGET DATA (uses updated_at)
    list($projBudgetDateFilter, $projBudgetDateParams) = buildDateFilter('pb.updated_at', $range, $start, $end);
    $projectBudgetQuery = "
        SELECT pb.*, p.name as project_name
        FROM project_budget pb
        JOIN projects p ON pb.project_id = p.id
        WHERE $projBudgetDateFilter
        ORDER BY pb.updated_at DESC
    ";
    $stmt = $pdo->prepare($projectBudgetQuery);
    $stmt->execute($projBudgetDateParams);
    $project_budget = $stmt->fetchAll();

    // 16. SALARIES DATA (uses paid_at)
    list($salaryDateFilter, $salaryDateParams) = buildDateFilter('s.paid_at', $range, $start, $end);
    $salariesQuery = "
        SELECT s.*, 
               e.name as employee_name,
               p.name as project_name
        FROM salaries s
        JOIN employees e ON s.employee_id = e.id
        JOIN projects p ON s.project_id = p.id
        WHERE $salaryDateFilter
        ORDER BY s.paid_at DESC
    ";
    $stmt = $pdo->prepare($salariesQuery);
    $stmt->execute($salaryDateParams);
    $salaries = $stmt->fetchAll();

    // 17. EXPENSE CATEGORIES DATA (uses updated_at)
    $expense_categories = $pdo->query("
        SELECT ec.*,
               COUNT(e.id) as expense_count,
               COALESCE(SUM(e.amount), 0) as total_amount
        FROM expense_categories ec
        LEFT JOIN expenses e ON ec.id = e.category_id
        GROUP BY ec.id
        ORDER BY ec.updated_at DESC
    ")->fetchAll();

    // 18. ALL LOG TABLES (use changed_at)
    list($logDateFilter, $logDateParams) = buildDateFilter('pl.changed_at', $range, $start, $end);
    
    $projectLogsQuery = "
        SELECT pl.*, p.name as project_name
        FROM project_logs pl
        JOIN projects p ON pl.project_id = p.id
        WHERE $logDateFilter
        ORDER BY pl.changed_at DESC
        LIMIT 100
    ";
    $stmt = $pdo->prepare($projectLogsQuery);
    $stmt->execute($logDateParams);
    $project_logs = $stmt->fetchAll();

    // Task logs
    list($taskLogDateFilter, $taskLogDateParams) = buildDateFilter('tl.changed_at', $range, $start, $end);
    $taskLogsQuery = "
        SELECT tl.*, t.name as task_name
        FROM task_logs tl
        JOIN tasks t ON tl.task_id = t.id
        WHERE $taskLogDateFilter
        ORDER BY tl.changed_at DESC
        LIMIT 100
    ";
    $stmt = $pdo->prepare($taskLogsQuery);
    $stmt->execute($taskLogDateParams);
    $task_logs = $stmt->fetchAll();

    // Architect logs
    list($architectLogDateFilter, $architectLogDateParams) = buildDateFilter('al.changed_at', $range, $start, $end);
    $architectLogsQuery = "
        SELECT al.*, a.name as architect_name
        FROM architect_logs al
        JOIN architects a ON al.architect_id = a.id
        WHERE $architectLogDateFilter
        ORDER BY al.changed_at DESC
        LIMIT 100
    ";
    $stmt = $pdo->prepare($architectLogsQuery);
    $stmt->execute($architectLogDateParams);
    $architect_logs = $stmt->fetchAll();

    // Employee logs
    list($employeeLogDateFilter, $employeeLogDateParams) = buildDateFilter('el.changed_at', $range, $start, $end);
    $employeeLogsQuery = "
        SELECT el.*, e.name as employee_name
        FROM employee_logs el
        JOIN employees e ON el.employee_id = e.id
        WHERE $employeeLogDateFilter
        ORDER BY el.changed_at DESC
        LIMIT 100
    ";
    $stmt = $pdo->prepare($employeeLogsQuery);
    $stmt->execute($employeeLogDateParams);
    $employee_logs = $stmt->fetchAll();

    // Machine logs
    list($machineLogLogDateFilter, $machineLogLogDateParams) = buildDateFilter('ml.changed_at', $range, $start, $end);
    $machineLogsQuery = "
        SELECT ml.*, m.name as machine_name
        FROM machine_logs ml
        JOIN machines m ON ml.machine_id = m.id
        WHERE $machineLogLogDateFilter
        ORDER BY ml.changed_at DESC
        LIMIT 100
    ";
    $stmt = $pdo->prepare($machineLogsQuery);
    $stmt->execute($machineLogLogDateParams);
    $machine_logs = $stmt->fetchAll();

    // Material logs
    list($materialLogLogDateFilter, $materialLogLogDateParams) = buildDateFilter('ml.changed_at', $range, $start, $end);
    $materialLogsQuery = "
        SELECT ml.*, m.name as material_name
        FROM material_logs ml
        JOIN materials m ON ml.material_id = m.id
        WHERE $materialLogLogDateFilter
        ORDER BY ml.changed_at DESC
        LIMIT 100
    ";
    $stmt = $pdo->prepare($materialLogsQuery);
    $stmt->execute($materialLogLogDateParams);
    $material_logs = $stmt->fetchAll();

    // Expense logs
    list($expenseLogDateFilter, $expenseLogDateParams) = buildDateFilter('el.changed_at', $range, $start, $end);
    $expenseLogsQuery = "
        SELECT el.*, e.description as expense_description
        FROM expense_logs el
        JOIN expenses e ON el.expense_id = e.id
        WHERE $expenseLogDateFilter
        ORDER BY el.changed_at DESC
        LIMIT 100
    ";
    $stmt = $pdo->prepare($expenseLogsQuery);
    $stmt->execute($expenseLogDateParams);
    $expense_logs = $stmt->fetchAll();

    // Salary logs
    list($salaryLogDateFilter, $salaryLogDateParams) = buildDateFilter('sl.changed_at', $range, $start, $end);
    $salaryLogsQuery = "
        SELECT sl.*, s.month, e.name as employee_name
        FROM salary_logs sl
        JOIN salaries s ON sl.salary_id = s.id
        JOIN employees e ON s.employee_id = e.id
        WHERE $salaryLogDateFilter
        ORDER BY sl.changed_at DESC
        LIMIT 100
    ";
    $stmt = $pdo->prepare($salaryLogsQuery);
    $stmt->execute($salaryLogDateParams);
    $salary_logs = $stmt->fetchAll();

    // ADVANCED ANALYTICS AND METRICS
    $advancedMetrics = [
        'financial_overview' => [
            'total_project_value' => $projectMetrics['total_budget_value'] ?? 0,
            'total_expenses' => $expenseMetrics['total_expenses'] ?? 0,
            'total_material_cost' => $materialMetrics['total_material_cost'] ?? 0,
            'total_machine_cost' => $machineMetrics['total_machine_cost'] ?? 0,
            'total_salary_budget' => $employeeMetrics['total_salary_budget'] ?? 0,
        ],
        'productivity_metrics' => [
            'projects_per_user' => ($userMetrics['total_users'] ?? 0) > 0 ? round(($projectMetrics['total_projects'] ?? 0) / $userMetrics['total_users'], 2) : 0,
            'tasks_completion_rate' => ($taskMetrics['total_tasks'] ?? 0) > 0 ? round((($taskMetrics['completed_tasks'] ?? 0) / $taskMetrics['total_tasks']) * 100, 2) : 0,
            'project_completion_rate' => ($projectMetrics['total_projects'] ?? 0) > 0 ? round((($projectMetrics['completed_projects'] ?? 0) / $projectMetrics['total_projects']) * 100, 2) : 0,
            'overdue_rate' => ($taskMetrics['total_tasks'] ?? 0) > 0 ? round((($taskMetrics['overdue_tasks'] ?? 0) / $taskMetrics['total_tasks']) * 100, 2) : 0,
        ],
        'resource_utilization' => [
            'material_utilization_rate' => ($materialMetrics['total_quantity'] ?? 0) > 0 ? round((array_sum(array_column($materials, 'total_used')) / $materialMetrics['total_quantity']) * 100, 2) : 0,
            'machine_utilization_rate' => ($machineMetrics['total_quantity'] ?? 0) > 0 ? round((($machineMetrics['total_used'] ?? 0) / $machineMetrics['total_quantity']) * 100, 2) : 0,
            'avg_team_size' => count($projects) > 0 ? round(array_sum(array_column($projects, 'team_size')) / count($projects), 2) : 0,
        ],
        'trend_analysis' => [
            'daily_expenses' => $pdo->query("
                SELECT DATE(spent_at) as date, SUM(amount) as total
                FROM expenses 
                WHERE spent_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(spent_at)
                ORDER BY date DESC
                LIMIT 30
            ")->fetchAll(),
            'monthly_project_completion' => $pdo->query("
                SELECT DATE_FORMAT(updated_at, '%Y-%m') as month, COUNT(*) as completed
                FROM projects 
                WHERE status = 'ended' AND updated_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(updated_at, '%Y-%m')
                ORDER BY month DESC
            ")->fetchAll(),
        ]
    ];

    // Prepare the comprehensive response
    $response = [
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'period' => $range,
        'date_range' => [
            'start' => $start,
            'end' => $end
        ],
        
        // Core Data Tables
        'users' => $users,
        'projects' => $projects,
        'team_members' => $team_members,
        'tasks' => $tasks,
        'documents' => $documents,
        'materials' => $materials,
        'materials_log' => $materials_log,
        'machines' => $machines,
        'machines_log' => $machines_log,
        'architects' => $architects,
        'employees' => $employees,
        'working_hours' => $working_hours,
        'budget_categories' => $budget_categories,
        'expenses' => $expenses,
        'project_budget' => $project_budget,
        'salaries' => $salaries,
        'expense_categories' => $expense_categories,
        
        // Log Tables
        'project_logs' => $project_logs,
        'task_logs' => $task_logs,
        'architect_logs' => $architect_logs,
        'employee_logs' => $employee_logs,
        'machine_logs' => $machine_logs,
        'material_logs' => $material_logs,
        'expense_logs' => $expense_logs,
        'salary_logs' => $salary_logs,
        
        // Metrics and Analytics
        'metrics' => [
            'users' => $userMetrics,
            'projects' => $projectMetrics,
            'tasks' => $taskMetrics,
            'materials' => $materialMetrics,
            'machines' => $machineMetrics,
            'employees' => $employeeMetrics,
            'expenses' => $expenseMetrics,
        ],
        
        // Summary Statistics
        'summary' => [
            'total_records' => [
                'users' => count($users),
                'projects' => count($projects),
                'tasks' => count($tasks),
                'materials' => count($materials),
                'machines' => count($machines),
                'employees' => count($employees),
                'expenses' => count($expenses),
            ]
        ]
    ];

    echo json_encode($response, JSON_NUMERIC_CHECK);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to generate reports',
        'details' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>