"use client";

import React, { useState, useEffect } from "react";

export default function AddEditUserModal({ onClose, onSave, user }: { onClose: () => void; onSave: () => void; user: any }) {
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "user");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUsername(user?.username || "");
    setEmail(user?.email || "");
    setRole(user?.role || "user");
    setPassword("");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const method = user ? "PATCH" : "POST";
    const body = user
      ? { id: user.id, username, email, role, password: password || undefined }
      : { username, email, role, password };
    const res = await fetch("http://localhost/consty/api/users.php", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to save user.");
      return;
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">{user ? "Edit User" : "Add User"}</h2>
        {error && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <select
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-blue-950 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <input
            type="password"
            placeholder={user ? "New Password (leave blank to keep)" : "Password"}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required={!user}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (user ? "Saving..." : "Adding...") : (user ? "Save Changes" : "Add User")}
          </button>
        </form>
      </div>
    </div>
  );
}
