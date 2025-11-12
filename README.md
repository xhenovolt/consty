# Consty Construction Management System

Constya is a modern, full-stack construction management system built with Next.js (React), PHP (REST API), and MySQL. It provides advanced project, employee, material, machine, architect, task, and user management with secure authentication and role-based access control.

## Features
- Modern Next.js frontend with Tailwind CSS
- PHP REST API backend (CRUD for all entities)
- MySQL database
- Authentication (Sign up, Sign in, Sign out)
- Role-based access (admin/user)
- Admin-only user management (view, add, edit, delete users)
- Protected routes (projects, employees, materials, etc.)
- Responsive, mobile-friendly UI
- Advanced modals for add/edit actions
- 403 error handling for unauthorized access

## Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** PHP (REST API)
- **Database:** MySQL

## Folder Structure
```
c:\xampp\htdocs\consty
├── app/                # Next.js app (frontend)
│   ├── (auth)/         # Auth pages (login, signup)
│   ├── employees/      # Employees page
│   ├── materials/      # Materials page
│   ├── machines/       # Machines page
│   ├── architects/     # Architects page
│   ├── tasks/          # Tasks page
│   ├── users/          # Users management (admin only)
│   ├── projects/       # Projects page
│   └── ...
├── components/         # React components (Navbar, Sidebar, Modals, RequireAuth, etc.)
├── api/                # PHP API endpoints
│   ├── db.php
│   ├── login.php
│   ├── signup.php
│   ├── users.php
│   ├── employees.php
│   ├── materials.php
│   ├── machines.php
│   ├── architects.php
│   ├── tasks.php
│   └── ...
├── tailwind.config.js  # Tailwind CSS config
├── next.config.ts      # Next.js config
├── package.json        # Node.js dependencies
└── README.md           # Project documentation
```

## Setup Instructions

### 1. Database
- Create a MySQL database named `consty`.
- Run the following SQL to create the users table:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
- Create other tables as needed (employees, materials, etc.)

### 2. Backend (PHP API)
- Place all PHP files in the `api/` directory.
- Update `db.php` with your MySQL credentials if needed.
- Ensure your web server (e.g., XAMPP) is running and can serve the API endpoints (e.g., http://localhost/consty/api/login.php).

### 3. Frontend (Next.js)
- Install dependencies:
  ```
  npm install
  ```
- Start the development server:
  ```
  npm run dev
  ```
- Or build for production:
  ```
  npm run build && npm start
  ```
- Access the app at [*/consty](*/consty) (or your configured basePath).

### 4. Authentication & Roles
- Sign up as a new user (first user is a regular user; set role to 'admin' in the database for admin access).
- Only admins can access `/users` and manage users.
- All other routes are protected and require sign in.

### 5. Usage Notes
- Use the sidebar to navigate between entities.
- Only admins can see and manage users and projects.
- If you try to access a protected route without signing in, you will be redirected to `/login`.
- If you try to access an admin-only route as a non-admin, you will see a 403 Forbidden error.

## Contribution
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
