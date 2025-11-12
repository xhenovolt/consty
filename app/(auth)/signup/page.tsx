"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    if (photo) formData.append("photo", photo);

    const res = await fetch("http://localhost/consty/api/signup.php", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Signup failed.");
      return;
    }
    router.push("../login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-blue-950">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-6 animate-fadeIn"
        encType="multipart/form-data"
      >
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 text-center">
          Sign Up
        </h1>
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-center">
            {error}
          </div>
        )}
        <input
          type="text"
          placeholder="Username"
          className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone"
          className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setPhoto(f);
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
            required
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="h-24 w-24 object-cover rounded-full border"
            />
          )}
        </div>
        <input
          type="password"
          placeholder="Password"
          className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition text-lg disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Already have an account?{" "}
          <a
            href="/consty/login"
            className="text-blue-700 dark:text-blue-300 font-bold hover:underline"
          >
            Sign In
          </a>
        </div>
      </form>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </div>
  );
}
