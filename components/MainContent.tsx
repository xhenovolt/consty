"use client";

import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Dashboard summary type
interface DashboardData {
  users: number;
  projects: number;
  materials: number;
  machines: number;
  tasks: number;
  architects: number;
  employees: number;
  projectStats?: { name: string; value: number }[];
}

const staticData: DashboardData = {
  users: 12,
  projects: 5,
  materials: 23,
  machines: 7,
  tasks: 42,
  architects: 3,
  employees: 18,
  projectStats: [
    { name: "Ongoing", value: 3 },
    { name: "Completed", value: 1 },
    { name: "Pending", value: 1 },
  ],
};

export default function MainContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  const [user, setUser] = useState<{ username?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("http://localhost/consty/api/dashboard.php")
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText || "Unknown error");
        }
        return res.json();
      })
      .then((d) => {
        // Optionally, you can add projectStats if your API supports it
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load dashboard data. " + (e.message || ""));
        setData(staticData);
        setLoading(false);
      });

    const stored = typeof window !== 'undefined' ? localStorage.getItem('session') : null;
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        setIsAdmin(!u.role || u.role === 'admin');
      } catch { /* ignore */ }
    }
  }, []);

  // Use staticData.projectStats if no server data
  const chartData = data?.projectStats || staticData.projectStats;

  return (
    <section className="w-full max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl shadow-xl p-8 md:p-16 text-white mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
            {`Hello ${user?.username ? user.username.toUpperCase() : 'Employee'}, welcome to consty`}
          </h1>
          <p className="text-lg md:text-2xl font-medium mb-6 opacity-90">A modern, responsive, and beautiful construction site powered by Next.js & Tailwind CSS.</p>
          <a href="#" className="inline-block bg-white text-blue-700 font-bold px-6 py-3 rounded-xl shadow hover:bg-blue-50 transition">Get Started</a>
        </div>
        <img src="/consty/illustration.png" alt="Dashboard Illustration" className="w-32 h-32 md:w-48 md:h-48 drop-shadow-xl" />
      </div>
      {/* Error Alert */}
      {error && showAlert && (
        <div className="mb-6 flex items-center justify-between bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow relative animate-fadeIn">
          <span>{error}</span>
          <button onClick={() => setShowAlert(false)} className="ml-4 text-xl font-bold leading-none hover:text-red-900">&times;</button>
        </div>
      )}
      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-lg text-blue-700 dark:text-blue-300">Loading dashboard...</div>
        ) : data && (
          <>
            {isAdmin && <SummaryCard label="Users" value={data.users} color="from-blue-400 to-blue-600" />}
            <SummaryCard label="Projects" value={data.projects} color="from-green-400 to-green-600" />
            <SummaryCard label="Materials" value={data.materials} color="from-yellow-400 to-yellow-600" />
            <SummaryCard label="Machines" value={data.machines} color="from-indigo-400 to-indigo-600" />
            <SummaryCard label="Tasks" value={data.tasks} color="from-pink-400 to-pink-600" />
            <SummaryCard label="Architects" value={data.architects} color="from-purple-400 to-purple-600" />
            <SummaryCard label="Employees" value={data.employees} color="from-teal-400 to-teal-600" />
          </>
        )}
      </div>
      {/* Projects Chart */}
      <div className="mt-10 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">Projects Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#8884d8" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </section>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} text-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center hover:scale-[1.03] transition-transform`}>
      <div className="text-3xl font-extrabold mb-2">{value}</div>
      <div className="text-lg font-semibold tracking-wide">{label}</div>
    </div>
  );
}
