"use client";

import React, { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<{ username?: string; email?: string; phone?: string; photo?: string } | null>(null);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('session') : null;
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
  }, []);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-blue-950">
      <div className="text-xl text-blue-700 dark:text-blue-300 font-bold">No profile found.</div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-blue-950">
      <div className="relative w-full max-w-lg mx-auto rounded-3xl border border-white/40 dark:border-white/10 bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl shadow-2xl p-8 flex flex-col gap-6 animate-fadeIn text-gray-800 dark:text-gray-100">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 text-center mb-4">Profile</h1>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img src={`http://localhost/consty/${user.photo}`} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-blue-400 shadow-lg" />
          </div>
          <div className="text-xl font-bold">{user.username}</div>
          <div className="text-gray-600 dark:text-gray-300">{user.email}</div>
          <div className="text-gray-600 dark:text-gray-300">{user.phone}</div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">Welcome to your futuristic profile page!</div>
      </div>
      <style jsx global>{`                                                                          
        @keyframes fadeIn { from { opacity:0;} to {opacity:1;} }
        .animate-fadeIn { animation: fadeIn 0.4s ease; }
      `}</style>
    </div>
  );
}
