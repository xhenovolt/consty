"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const AddEditUserModal = dynamic(() => import("../../components/AddEditUserModal"), { ssr: false });

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
}

function UserModal({ user, onClose, onSave }: { user?: User; onClose: () => void; onSave: () => void }) {
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [role, setRole] = useState(user?.role || "user");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user?.photo ? `/${user.photo}` : null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (user) setPreview(user.photo ? `/${user.photo}` : null);
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setPhoto(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const validate = () => {
    if (!username.trim()) return "Username is required.";
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return "Valid email required.";
    if (!phone || !/^\+?[0-9\-() ]{6,}$/.test(phone)) return "Valid phone required.";
    if (!role) return "Role is required.";
    if (!user && !password) return "Password is required.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setValidationError(err); return; }
    setLoading(true);
    setError("");
    setValidationError("");
    const fd = new FormData();
    fd.append("username", username);
    fd.append("email", email);
    fd.append("phone", phone);
    fd.append("role", role);
    if (photo) fd.append("photo", photo);
    if (!user) fd.append("password", password);
    if (user) fd.append("id", String(user.id));
    const url = user ? "http://localhost/consty/api/users.php?action=edit" : "http://localhost/consty/api/users.php?action=add";
    const res = await fetch(url, { method: "POST", body: fd, credentials: "include" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.success) {
      setError(data.error || "Failed to save user.");
      return;
    }
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg mx-auto rounded-3xl border border-white/40 dark:border-white/10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl shadow-2xl p-8 flex flex-col gap-6 animate-fadeIn text-gray-800 dark:text-gray-100">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-red-500 text-xl font-bold">&times;</button>
        <h2 className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 text-center mb-2">{user ? "Edit User" : "Add User"}</h2>
        {error && <div className="bg-red-500/20 border border-red-400/40 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg text-center text-sm">{error}</div>}
        {validationError && <div className="bg-red-500/20 border border-red-400/40 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg text-center text-sm mb-2">{validationError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" required className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" required className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <select value={role} onChange={e=>setRole(e.target.value)} className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {!user && <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />}
          <div className="flex items-center gap-4">
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="flex-1 text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer cursor-pointer" />
            {preview && <img src={preview} alt="preview" className="h-14 w-14 rounded-full object-cover border border-white/40" />}
          </div>
          <button type="submit" disabled={loading} className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/25 tracking-wide transition">{loading ? (user ? "Saving..." : "Creating...") : (user ? "Save Changes" : "Add User")}</button>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = typeof window !== 'undefined' ? localStorage.getItem('session') : null;
    if (!session) {
      window.location.href = "/consty";
      return;
    }
    try {
      const user = JSON.parse(session);
      setIsAdmin(!user.role || user.role === "admin");
    } catch {}
    fetch("http://localhost/consty/api/users.php?action=list", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load users");
        return res.json();
      })
      .then((d) => {
        setUsers(d.users || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Failed to load users");
        setLoading(false);
      });
  }, []);

  const handleSave = () => {
    setLoading(true);
    fetch("/consty/api/users.php?action=list", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load users");
        return res.json();
      })
      .then((d) => {
        setUsers(d.users || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Failed to load users");
        setLoading(false);
      });
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) return;
    if (confirm("Are you sure you want to delete this user?")) {
      await fetch(`http://localhost/consty/api/users.php?action=delete`, {
        method: "POST",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      handleSave();
    }
  };

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-blue-950">
      <div className="text-xl text-blue-700 dark:text-blue-300 font-bold">Access denied. Admins only.</div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-blue-950">
      <div className="w-full max-w-5xl mx-auto rounded-3xl border border-white/40 dark:border-white/10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl shadow-2xl p-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">Users</h1>
          <button onClick={()=>{setEditUser(undefined);setShowModal(true);}} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg">+ Add User</button>
        </div>
        {error && <div className="mb-6 flex items-center justify-between bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow relative animate-fadeIn"><span>{error}</span><button onClick={()=>setError("")} className="ml-4 text-xl font-bold leading-none hover:text-red-900">&times;</button></div>}
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white/30 dark:bg-gray-900/30">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-blue-50/40 dark:bg-blue-950/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Updated At</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/20 dark:bg-gray-900/20 divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition">
                    <td className="px-6 py-4"><img src={`http://localhost/${u.photo}`} alt={u.username} className="h-10 w-10 rounded-full object-cover border border-blue-300" /></td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{u.username}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.phone}</td>
                    <td className="px-6 py-4">{u.role || "admin"}</td>
                    <td className="px-6 py-4">{u.created_at}</td>
                    <td className="px-6 py-4">{u.updated_at || '-'}</td>
                    <td className="px-6 py-4 text-center flex gap-2 justify-center">
                      <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition" title="Edit" onClick={()=>{setEditUser(u);setShowModal(true);}}>Edit</button>
                      <button className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition" title="Remove" onClick={()=>handleDelete(u.id)}>Remove</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showModal && <UserModal user={editUser} onClose={()=>setShowModal(false)} onSave={handleSave} />}
      </div>
      <style jsx global>{`
        @keyframes fadeIn { from { opacity:0;} to {opacity:1;} }
        .animate-fadeIn { animation: fadeIn 0.4s ease; }
      `}</style>
    </div>
  );
}
