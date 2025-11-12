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
    // Project Analytics
    $projectStats = $pdo->query("
        SELECT 
            COUNT(*) as total_projects,
            SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing_projects,
            SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused_projects,
            SUM(CASE WHEN status = 'ended' THEN 1 ELSE 0 END) as completed_projects,
            AVG(budget) as avg_budget,
            SUM(budget) as total_project_value
        FROM projects
    ")->fetch();

    // Financial Analytics
    $financialStats = $pdo->query("
        SELECT 
            COALESCE(SUM(amount), 0) as total_expenses,
            COUNT(*) as total_transactions,
            AVG(amount) as avg_expense,
            MAX(amount) as largest_expense
        FROM expenses
    ")->fetch();

    // Resource Analytics
    $materialStats = $pdo->query("
        SELECT 
            COUNT(*) as total_materials,
            SUM(quantity) as total_quantity,
            SUM(used) as total_used,
            SUM(damaged) as total_damaged,
            SUM((used + damaged) * unit_price) as materials_cost
        FROM materials
    ")->fetch();

    $machineStats = $pdo->query("
        SELECT 
            COUNT(*) as total_machines,
            SUM(quantity) as total_quantity,
            SUM(used) as total_used,
            SUM(damaged) as total_damaged,
            SUM((used + damaged) * unit_price) as machines_cost
        FROM machines
    ")->fetch();

    // Team Analytics
    $teamStats = $pdo->query("
        SELECT 
            COUNT(DISTINCT e.id) as total_employees,
            COUNT(DISTINCT a.id) as total_architects,
            COALESCE(SUM(wh.hours_worked), 0) as total_hours_worked,
            COALESCE(SUM(s.amount_paid), 0) as total_salaries_paid
        FROM employees e
        LEFT JOIN working_hours wh ON e.id = wh.employee_id
        LEFT JOIN salaries s ON e.id = s.employee_id
        CROSS JOIN architects a
    ")->fetch();

    // Recent Activity
    $recentExpenses = $pdo->query("
        SELECT e.*, p.name as project_name, ec.name as category_name
        FROM expenses e
        LEFT JOIN projects p ON e.project_id = p.id
        LEFT JOIN expense_categories ec ON e.category_id = ec.id
        ORDER BY e.spent_at DESC
        LIMIT 10
    ")->fetchAll();

    // Monthly Trends
    $monthlyExpenses = $pdo->query("
        SELECT 
            DATE_FORMAT(spent_at, '%Y-%m') as month,
            SUM(amount) as total_amount,
            COUNT(*) as transaction_count
        FROM expenses
        WHERE spent_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(spent_at, '%Y-%m')
        ORDER BY month
    ")->fetchAll();

    // Project Status Distribution
    $projectDistribution = $pdo->query("
        SELECT 
            status,
            COUNT(*) as count,
            SUM(budget) as total_budget
        FROM projects
        GROUP BY status
    ")->fetchAll();

    // Top Expense Categories
    $topCategories = $pdo->query("
        SELECT 
            ec.name,
            COUNT(e.id) as transaction_count,
            SUM(e.amount) as total_amount,
            AVG(e.amount) as avg_amount
        FROM expense_categories ec
        LEFT JOIN expenses e ON ec.id = e.category_id
        GROUP BY ec.id, ec.name
        ORDER BY total_amount DESC
        LIMIT 10
    ")->fetchAll();

    // Resource Utilization
    $resourceUtilization = [
        'materials' => $pdo->query("
            SELECT 
                name,
                quantity,
                used,
                damaged,
                (quantity - used - damaged) as available,
                ROUND((used + damaged) / quantity * 100, 2) as utilization_rate
            FROM materials
            WHERE quantity > 0
            ORDER BY utilization_rate DESC
            LIMIT 5
        ")->fetchAll(),
        'machines' => $pdo->query("
            SELECT 
                name,
                quantity,
                used,
                damaged,
                (quantity - used - damaged) as available,
                ROUND((used + damaged) / quantity * 100, 2) as utilization_rate
            FROM machines
            WHERE quantity > 0
            ORDER BY utilization_rate DESC
            LIMIT 5
        ")->fetchAll()
    ];

    // Performance Metrics
    $performanceMetrics = [
        'budget_efficiency' => $projectStats['total_project_value'] > 0 ? 
            round(($financialStats['total_expenses'] / $projectStats['total_project_value']) * 100, 2) : 0,
        'project_completion_rate' => $projectStats['total_projects'] > 0 ?
            round(($projectStats['completed_projects'] / $projectStats['total_projects']) * 100, 2) : 0,
        'resource_utilization_rate' => ($materialStats['total_quantity'] + $machineStats['total_quantity']) > 0 ?
            round((($materialStats['total_used'] + $machineStats['total_used']) / 
                   ($materialStats['total_quantity'] + $machineStats['total_quantity'])) * 100, 2) : 0
    ];

    echo json_encode([
        'success' => true,
        'data' => [
            'project_stats' => $projectStats,
            'financial_stats' => $financialStats,
            'material_stats' => $materialStats,
            'machine_stats' => $machineStats,
            'team_stats' => $teamStats,
            'recent_expenses' => $recentExpenses,
            'monthly_trends' => $monthlyExpenses,
            'project_distribution' => $projectDistribution,
            'top_categories' => $topCategories,
            'resource_utilization' => $resourceUtilization,
            'performance_metrics' => $performanceMetrics,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch analytics data',
        'details' => $e->getMessage()
    ]);
}
?>
