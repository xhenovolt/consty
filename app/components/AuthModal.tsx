"use client";
import React, { useState } from "react";

interface AuthModalProps {
  mode: "login" | "signup";
  onClose: () => void;
  switchMode: (m: "login" | "signup") => void;
}

export default function AuthModal({ mode, onClose, switchMode }: AuthModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        localStorage.setItem(
          "session",
          JSON.stringify({ id: data.id, username: data.username, role: data.role, photo: data.photo })
        );
        window.location.href = "/consty/dashboard";
      } else {
        const fd = new FormData();
        fd.append("username", username);
        fd.append("email", email);
        fd.append("phone", phone);
        fd.append("password", password);
        fd.append("role", role);
        if (photo) fd.append("photo", photo);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/signup.php`, {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");
        localStorage.setItem(
          "session",
          JSON.stringify({ id: data.id, username: data.username, role: data.role, photo: data.photo })
        );
        window.location.href = "/consty/dashboard";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundImage: "url(http://localhost/consty/public/apart.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg mx-auto rounded-3xl border border-white/40 dark:border-white/10 bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl shadow-2xl p-8 flex flex-col gap-6 animate-fadeIn text-gray-800 dark:text-gray-100">
        <img src="/consty/consty.png" alt="Consty Logo" className="h-12 w-auto mx-auto mb-2" />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-red-500 text-xl font-bold"
        >
          &times;
        </button>
        <div className="flex gap-4 mb-2">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 rounded-xl font-semibold transition ${
              mode === "login"
                ? "bg-blue-600 text-white shadow"
                : "bg-white/40 dark:bg-gray-700/40 text-blue-700 dark:text-blue-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => switchMode("signup")}
            className={`flex-1 py-2 rounded-xl font-semibold transition ${
              mode === "signup"
                ? "bg-blue-600 text-white shadow"
                : "bg-white/40 dark:bg-gray-700/40 text-blue-700 dark:text-blue-300"
            }`}
          >
            Sign Up
          </button>
        </div>
        <h2 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 text-center tracking-tight">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        {error && (
          <div className="bg-red-500/20 border border-red-400/40 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg text-center text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {mode === "signup" && (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
            {mode === "signup" && (
              <input
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
            {mode === "signup" && (
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setPhoto(f);
                    setPreview(f ? URL.createObjectURL(f) : undefined);
                  }}
                  required
                  className="flex-1 text-sm file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer cursor-pointer"
                />
                {preview && (
                  <img
                    src={preview}
                    alt="preview"
                    className="h-14 w-14 rounded-full object-cover border border-white/40"
                  />
                )}
              </div>
            )}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {mode === "signup" && (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/25 tracking-wide transition"
          >
            {loading
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
              ? "Login"
              : "Sign Up"}
          </button>
          {mode === "login" ? (
            <p className="text-center text-sm">
              Need an account?{" "}
              <button
                onClick={() => switchMode("signup")}
                className="text-blue-800 dark:text-blue-300 hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-center text-sm">
              Already have an account?{" "}
              <button
                onClick={() => switchMode("login")}
                className="text-blue-800 dark:text-blue-300 hover:underline"
              >
                Login
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}