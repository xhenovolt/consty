"use client";
import React, { useEffect } from "react";

export default function RestrictedPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title = "Access Restricted";
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-red-950 dark:to-blue-950 animate-fade-in">
      <div className="flex flex-col items-center">
        <div className="mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 via-pink-500 to-blue-400 blur-2xl opacity-40 w-40 h-40 animate-pulse"></div>
          <div className="flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-2xl border-8 border-white dark:border-gray-900 z-10 relative">
            <svg className="w-20 h-20 text-white animate-lock-spin" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" d="M17 11V7a5 5 0 00-10 0v4"/>
              <rect width="16" height="10" x="4" y="11" rx="2" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="16" r="1.5" fill="currentColor" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight text-center drop-shadow-lg">
          🚫 Access Restricted6
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center max-w-xl">
          You do not have permission to view this page.<br />
          <span className="text-pink-600 dark:text-pink-400 font-semibold">Admin privileges are required.</span>
        </p>
        <a
          href="/consty/dashboard"
          className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:scale-105 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-lg"
        >
          Return to Dashboard
        </a>
        <div className="mt-12 text-sm text-gray-400 dark:text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Consty &mdash; Secure Construction Management
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lock-spin { 0% { transform: rotate(-10deg);} 50% {transform: rotate(10deg);} 100% {transform: rotate(-10deg);} }
        .animate-lock-spin { animation: lock-spin 2s infinite; }
      `}</style>
    </div>
  );
}
