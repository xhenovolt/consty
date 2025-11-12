import React, { useEffect, useState } from "react";
import {
  User,
  ClipboardList,
  Users,
  FileText,
  DollarSign,
  Receipt,
  BarChart2,
  Archive,
  Box,
  Settings,
  Clock,
} from "lucide-react";

const sidebarLinks = [
  { name: "Architects", href: "/consty/architects", icon: <User /> },
  {
    name: "Projects",
    href: "/consty/projects",
    icon: <ClipboardList />,
    dropdown: [
      { name: "Projects", href: "/consty/projects", icon: <ClipboardList /> },
      { name: "Tracking", href: "/consty/project-logs", icon: <Clock /> },
    ],
  },
  {
    name: "Employees",
    href: "/consty/employees",
    icon: <Users />,
    dropdown: [
      { name: "Employees", href: "/consty/employees", icon: <Users /> },
      { name: "Tracking", href: "/consty/employee-logs", icon: <Clock /> },
    ],
  },
  {
    name: "Tasks",
    href: "/consty/tasks",
    icon: <ClipboardList />,
    dropdown: [
      { name: "Tasks", href: "/consty/tasks", icon: <ClipboardList /> },
      { name: "Tracking", href: "/consty/task-logs", icon: <Clock /> },
    ],
  },
  { name: "Documents", href: "/consty/documents", icon: <FileText /> },
  { name: "Salaries", href: "/consty/salaries", icon: <DollarSign /> },
  { name: "Expenses", href: "/consty/expenses", icon: <Receipt /> },
  { name: "Reports", href: "/consty/reports", icon: <BarChart2 /> },
  {
    name: "Resources",
    icon: <Archive />,
    dropdown: [
      { name: "Materials", href: "/consty/resources/materials", icon: <Box /> },
      { name: "Machines", href: "/consty/resources/machines", icon: <Settings /> },
    ],
  },
];

export default function Sidebar() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const session =
      typeof window !== "undefined"
        ? localStorage.getItem("session")
        : null;
    if (!session) {
      setHasSession(false);
      window.location.href = "/consty";
    } else {
      setHasSession(true);
      try {
        const user = JSON.parse(session);
        setRole(user.role || null);
      } catch {
        setRole(null);
      }
    }
  }, []);

  if (hasSession === null) return null; // avoid flash while checking
  if (hasSession === false) return null; // do not show sidebar if not signed in

  // Filter sidebarLinks based on role
  const filteredLinks = sidebarLinks.filter(link => {
    // Employees, Salaries, Employee Logs are admin only
    if (
      (link.name === "Employees" || link.name === "Salaries") &&
      role !== "admin"
    ) {
      return false;
    }
    // Hide Employee Logs in Employees dropdown for non-admin
    if (link.name === "Employees" && link.dropdown) {
      link.dropdown = link.dropdown.filter(
        d =>
          !(d.name === "Tracking" && role !== "admin")
      );
      // If dropdown is empty, hide the parent
      if (link.dropdown.length === 0) return false;
    }
    return true;
  });

  return (
    <aside
      className="group hidden md:flex flex-col w-20 hover:w-64 h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg p-4 sticky top-0 z-20 transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-8">
        <img src="/consty/consty.png" alt="Logo" className="h-8 w-8" />
        <a
          href="/consty/dashboard"
          className="font-bold text-xl text-blue-700 dark:text-blue-300 tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          DASHBOARD
        </a>
      </div>
      <nav className="flex flex-col gap-2">
        {filteredLinks.map((link) =>
          link.dropdown ? (
            <div key={link.name} className="relative">
              <button
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors duration-200 w-full"
                onClick={() => setOpenDropdown(openDropdown === link.name ? null : link.name)}
                aria-expanded={openDropdown === link.name}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {link.name}
                </span>
                <svg
                  className={`w-4 h-4 ml-auto transform transition-transform ${
                    openDropdown === link.name ? "rotate-180" : ""
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === link.name && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-2 w-48 z-10">
                  {link.dropdown.map((d) => (
                    <a
                      key={d.name}
                      href={d.href}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 rounded transition-colors duration-200"
                    >
                      <span className="text-base">{d.icon}</span>
                      {d.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <a
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors duration-200"
            >
              <span className="text-lg">{link.icon}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {link.name}
              </span>
            </a>
          )
        )}
      </nav>
      <div className="mt-auto pt-8 text-xs text-gray-400 dark:text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        &copy; {new Date().getFullYear()} Consty
      </div>
    </aside>
  );
}
