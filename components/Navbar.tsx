"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

const navLinks = [
	{
		name: "Projects",
		links: [
			{ name: "Projects", href: "/consty/projects" },
			{ name: "Tracking", href: "/consty/project-logs" },
		],
	},
	{
		name: "Tasks",
		links: [
			{ name: "Tasks", href: "/consty/tasks" },
			{ name: "Tracking", href: "/consty/task-logs" },
		],
	},
	{
		name: "Employees",
		links: [
			{ name: "Employees", href: "/consty/employees" },
			{ name: "Tracking", href: "/consty/employee-logs" },
		],
	},
	{ name: "Documents", href: "/consty/documents" },
	{ name: "Salaries", href: "/consty/salaries" },
	{ name: "Expenses", href: "/consty/expenses" },
	{ name: "Reports", href: "/consty/reports" },
];

export default function Navbar() {
	const [mobileOpen, setMobileOpen] = React.useState(false);
	const [userMenu, setUserMenu] = React.useState(false);
	const [user, setUser] = useState<
		{ username?: string; photo?: string; role?: string } | null
	>(null);
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [hide, setHide] = useState<boolean | null>(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

	useEffect(() => {
		const raw =
			typeof window !== "undefined"
				? localStorage.getItem("session")
				: null;
		if (raw) {
			try {
				const parsed = JSON.parse(raw);
				setUser(parsed);
				setIsSignedIn(true);
				setHide(false);
				setIsAdmin(parsed.role === "admin");
			} catch {
				setHide(true);
			}
		} else {
			setHide(true);
		}
	}, []);

	const avatar = user?.photo ? (
		<img
			src={`http://localhost/consty/${user.photo}`}
			alt={user.username}
			className="h-9 w-9 rounded-full object-cover border border-blue-300"
		/>
	) : (
		<div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
			{(user?.username || "?").slice(0, 1).toUpperCase()}
		</div>
	);

	const handleLogout = async () => {
		try {
			await fetch("http://localhost/consty/api/logout.php", {
				method: "POST",
				credentials: "include",
			});
		} catch {}
		localStorage.removeItem("session");
		// Force a synchronous style redirect only after clearing storage
		window.location.replace("/consty");
	};

	// Hide completely if not signed in (avoid flash while determining)
	if (hide === null) return null;
	if (hide) return null;

	// Only admin can see Users link
	// Filter navLinks for non-admins
	const filteredNavLinks = navLinks.filter(link => {
		// Hide Employees and Salaries for non-admins
		if (
			(link.name === "Employees" || link.name === "Salaries") &&
			!isAdmin
		) {
			return false;
		}
		return true;
	}).map(link => {
		// For Employees dropdown, hide "Tracking" for non-admins
		if (link.name === "Employees" && link.links && !isAdmin) {
			return {
				...link,
				links: link.links.filter(l => l.name !== "Tracking")
			};
		}
		return link;
	});

	return (
		<>
			<header className="navbar sticky top-0 z-30 w-full bg-gradient-to-r from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 backdrop-blur shadow flex items-center justify-between px-4 md:px-8 h-16 border-b border-gray-200 dark:border-gray-800">
				<div className="flex items-center gap-0 ml-0 mr-8">
					<img
						src="/consty/consty.png"
						alt="Logo"
						className="h-9 w-9 rounded-full shadow-lg"
					/>
					<a
						href="/consty/dashboard"
						className="font-extrabold text-2xl text-blue-700 dark:text-blue-300 tracking-tight drop-shadow"
					>
						Consty
					</a>
				</div>
				<nav className="hidden md:flex gap-2 items-center">
					{filteredNavLinks.map((link) =>
						link.links ? (
							<div key={link.name} className="relative">
								<button
									className="hover:underline relative z-10"
									onClick={() =>
										setActiveDropdown(
											activeDropdown === link.name ? null : link.name
										)
									}
								>
									{link.name}
								</button>
								{activeDropdown === link.name && (
									<ul className="absolute flex flex-col bg-gray-800 text-white mt-2 rounded-lg shadow-lg">
										{link.links.map((sublink) => (
											<li key={sublink.name}>
												<a
													href={sublink.href}
													className="block px-4 py-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
													onClick={() => setActiveDropdown(null)}
												>
													{sublink.name}
												</a>
											</li>
										))}
									</ul>
								)}
							</div>
						) : (
							<a
								key={link.name}
								href={link.href}
								className="text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-lg px-3 py-1 rounded transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
							>
								{link.name}
							</a>
						)
					)}
					{isSignedIn && isAdmin && (
						<a
							href="/consty/users"
							className="text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-lg px-3 py-1 rounded transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
						>
							Users
						</a>
					)}
					{/* User / Avatar Dropdown */}
					<div className="relative">
						<button
							onClick={() => setUserMenu((v) => !v)}
							className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none"
						>
							{avatar}
							<span className="hidden lg:inline text-gray-700 dark:text-gray-100 font-semibold">
								{user?.username || "Guest"}
							</span>
							<ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
						</button>
						{userMenu && (
							<div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
								{isSignedIn ? (
									<>
										<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
											<p className="text-sm text-gray-500 dark:text-gray-400">
												Signed in as
											</p>
											<p className="font-bold text-gray-800 dark:text-gray-100 truncate">
												{user?.username}
											</p>
										</div>
										<a
											href="/consty/profile"
											className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/30"
										>
											Profile
										</a>
										<a
											href="/consty/settings"
											className="block px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30"
										>
											Settings
										</a>
										<button
											onClick={handleLogout}
											className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
										>
											Logout
										</button>
									</>
								) : (
									<>
										<a
											href="/consty/login"
											className="block px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30"
										>
											Sign In
										</a>
										<a
											href="/consty/signup"
											className="block px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30"
										>
											Sign Up
										</a>
									</>
								)}
							</div>
						)}
					</div>
				</nav>
				<div className="md:hidden flex items-center">
					<button
						className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
						onClick={() => setMobileOpen(true)}
						aria-label="Open menu"
					>
						<Menu className="w-7 h-7 text-blue-700 dark:text-blue-300" />
					</button>
				</div>
			</header>
			{/* Mobile Drawer */}
			{mobileOpen && (
				<div className="fixed inset-0 z-40 bg-black/40 flex">
					<div className="w-64 bg-white dark:bg-gray-900 h-full shadow-2xl p-6 flex flex-col animate-slideInLeft">
						<div className="flex items-center justify-between mb-8">
							<div className="flex items-center gap-2">
								<img
									src="/assets/images/logo.svg"
									alt="Logo"
									className="h-8 w-8 rounded-full"
								/>
								<span className="font-bold text-xl text-blue-700 dark:text-blue-300">
									Consty
								</span>
							</div>
							<button
								className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none"
								onClick={() => setMobileOpen(false)}
								aria-label="Close menu"
							>
								<X className="w-6 h-6 text-blue-700 dark:text-blue-300" />
							</button>
						</div>
						<nav className="flex flex-col gap-4">
							{filteredNavLinks.map((link) =>
								link.links ? (
									<div key={link.name} className="group">
										<button className="flex justify-between w-full text-left">
											{link.name}
											<ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
										</button>
										<div className="pl-4 hidden group-hover:block">
											{link.links.map((sublink) => (
												<a
													key={sublink.name}
													href={sublink.href}
													onClick={() => setMobileOpen(false)}
													className="block text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-lg px-2 py-2 rounded transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
												>
													{sublink.name}
												</a>
											))}
										</div>
									</div>
								) : (
									<a
										key={link.name}
										href={link.href}
										onClick={() => setMobileOpen(false)}
										className="text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-lg px-2 py-2 rounded transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
									>
										{link.name}
									</a>
								)
							)}
							{isSignedIn && isAdmin && (
								<a
									href="/consty/users"
									onClick={() => setMobileOpen(false)}
									className="text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-lg px-2 py-2 rounded transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
								>
									Users
								</a>
							)}
							<div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4 flex items-center gap-3">
								{avatar}
								<div className="flex-1">
									<p className="font-bold text-gray-800 dark:text-gray-100 leading-tight">
										{user?.username || "Guest"}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										{isSignedIn ? "Online" : "Not signed in"}
									</p>
								</div>
							</div>
							<div className="border-t border-gray-200 dark:border-gray-800 pt-2">
								{isSignedIn ? (
									<>
										<a
											href="/consty/profile"
											onClick={() => setMobileOpen(false)}
											className="block px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30"
										>
											Profile
										</a>
										<a
											href="/consty/settings"
											onClick={() => setMobileOpen(false)}
											className="block px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30"
										>
											Settings
										</a>
										<button
											onClick={() => {
												handleLogout();
											}}
											className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
										>
											Logout
										</button>
									</>
								) : (
									<>
										<a
											href="/consty/login"
											onClick={() => setMobileOpen(false)}
											className="block px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30"
										>
											Sign In
										</a>
										<a
											href="/consty/signup"
											onClick={() => setMobileOpen(false)}
											className="block px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30"
										>
											Sign Up
										</a>
									</>
								)}
							</div>
						</nav>
					</div>
				</div>
			)}
		</>
	);
}
