"use client";

import React, { useEffect, useState } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState<{ id?: number; username?: string; email?: string; phone?: string; photo?: string; role?: string; created_at?: string } | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('session') : null;
    if (raw) {
      try {
        const u = JSON.parse(raw);
        setUser(u);
        setUsername(u.username || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setPreview(u.photo ? `/${u.photo}` : null);
      } catch {}
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setPhoto(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");
    const fd = new FormData();
    fd.append("id", String(user.id));
    fd.append("username", username);
    fd.append("email", email);
    fd.append("phone", phone);
    if (photo) fd.append("photo", photo);
    if (oldPassword && newPassword) {
      fd.append("oldPassword", oldPassword);
      fd.append("newPassword", newPassword);
    }
    const res = await fetch("http://localhost/consty/api/update_user.php", { method: "POST", body: fd, credentials: "include" });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.success) {
      setMessage("Profile updated!");
      localStorage.setItem("session", JSON.stringify(data.user));
      setUser(data.user);
      setPreview(data.user.photo ? `/${data.user.photo}` : null);
      setOldPassword("");
      setNewPassword("");
    } else {
      setMessage(data.error || "Failed to update profile.");
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-blue-950">
      <div className="text-xl text-blue-700 dark:text-blue-300 font-bold">No settings available.</div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-blue-950">
      <div className="relative w-full max-w-lg mx-auto rounded-3xl border border-white/40 dark:border-white/10 bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl shadow-2xl p-8 flex flex-col gap-6 animate-fadeIn text-gray-800 dark:text-gray-100">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 text-center mb-4">Settings</h1>
        <form onSubmit={handleUpdate} className="flex flex-col gap-4 items-center">
          <div className="flex flex-col items-center gap-2 relative">
            <div className="relative">
              <img src={preview || (user.photo ? `/${user.photo}` : undefined) || `http://localhost/consty/${user.photo}`} alt="Profile" className="h-32 w-32 rounded-full object-cover border-4 border-blue-400 shadow-lg" />
              <label htmlFor="profile-photo" className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg cursor-pointer flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6v-3a2 2 0 012-2h3" /></svg>
                <input id="profile-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
          </div>
          <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          <div className="w-full flex flex-col gap-2 mt-2">
            <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">Change Password</label>
            <input type="password" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} placeholder="Current Password" className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="New Password" className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold py-2 px-6 rounded-2xl shadow-lg shadow-blue-500/25 tracking-wide transition">{loading ? "Updating..." : "Update Profile"}</button>
        </form>
        {message && <div className="text-center text-blue-700 dark:text-blue-300 font-semibold mt-2">{message}</div>}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">Futuristic settings page. More options coming soon!</div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn { from { opacity:0;} to {opacity:1;} }
        .animate-fadeIn { animation: fadeIn 0.4s ease; }
      `}</style>
    </div>
  );
}
