-- DROP ALL TABLES
DROP TABLE IF EXISTS users, projects, team_members, tasks, documents, materials, materials_log, machines, machines_log, architects, employees, working_hours, budget_categories, expenses, project_budget, salaries, expense_categories, project_logs, task_logs, architect_logs, employee_logs, machine_logs, material_logs, expense_logs, salary_logs, suppliers;

-- USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(100) NOT NULL UNIQUE,
    photo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- SUPPLIERS TABLE
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(150),
    contact_phone VARCHAR(50),
    address VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PROJECTS TABLE
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    client VARCHAR(150),
    budget DECIMAL(15,2),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ongoing',
    start_date DATE,
    end_date DATE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TEAM MEMBERS TABLE (no foreign keys)
CREATE TABLE team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TASKS TABLE (no foreign keys)
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    project_id INT,
    assigned_to INT,
    deadline DATE,
    priority VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- DOCUMENTS TABLE (no foreign keys)
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- MATERIALS TABLE (no foreign keys)
CREATE TABLE materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    money_spent DECIMAL(10,2) NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- MATERIALS LOG TABLE (no foreign keys)
CREATE TABLE materials_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity_used INT NOT NULL,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- MACHINES TABLE (no foreign keys)
CREATE TABLE machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    used INT DEFAULT 0,
    damaged INT DEFAULT 0,
    leftover INT DEFAULT 0,
    money_spent DECIMAL(10,2) DEFAULT 0.00,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- MACHINES LOG TABLE (no foreign keys)
CREATE TABLE machines_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    machine_id INT NOT NULL,
    quantity_used INT NOT NULL,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ARCHITECTS TABLE (no foreign keys)
CREATE TABLE architects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    project_id INT,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- EMPLOYEES TABLE (no foreign keys)
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    project_id INT,
    email VARCHAR(100),
    phone VARCHAR(20),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- WORKING HOURS TABLE (no foreign keys)
CREATE TABLE working_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    project_id INT NOT NULL,
    hours_worked DECIMAL(5,2) NOT NULL,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- BUDGET CATEGORIES TABLE (no foreign keys)
CREATE TABLE budget_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    planned_amount DECIMAL(15,2) NOT NULL,
    actual_spent DECIMAL(15,2) DEFAULT 0.00,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- EXPENSES TABLE (no foreign keys)
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    category_id INT,
    task_id INT,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255),
    spent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PROJECT BUDGET TABLE (no foreign keys)
CREATE TABLE project_budget (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    total_budget DECIMAL(15,2) NOT NULL,
    planned DECIMAL(15,2) DEFAULT 0.00,
    actual_spent DECIMAL(15,2) DEFAULT 0.00,
    remaining_balance DECIMAL(15,2) DEFAULT 0.00,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- SALARIES TABLE (no foreign keys)
CREATE TABLE salaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    project_id INT NOT NULL,
    month VARCHAR(20) NOT NULL,
    amount_paid DECIMAL(15,2) NOT NULL,
    remaining_salary DECIMAL(15,2) NOT NULL,
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- EXPENSE CATEGORIES TABLE
CREATE TABLE expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PROJECT LOGS TABLE (no foreign keys)
CREATE TABLE project_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255)
);

-- TASK LOGS TABLE (no foreign keys)
CREATE TABLE task_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255)
);

-- ARCHITECT LOGS TABLE (no foreign keys)
CREATE TABLE architect_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    architect_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255)
);

-- EMPLOYEE LOGS TABLE (no foreign keys)
CREATE TABLE employee_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255)
);

-- MACHINE LOGS TABLE (no foreign keys)
CREATE TABLE machine_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255)
);

-- MATERIAL LOGS TABLE (no foreign keys)
CREATE TABLE material_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255)
);

-- EXPENSE LOGS TABLE (no foreign keys)
CREATE TABLE expense_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255)
);

-- SALARY LOGS TABLE (no foreign keys)
CREATE TABLE salary_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    salary_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255)
);