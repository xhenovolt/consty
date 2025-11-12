"use client"
import React, { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import { useRouter } from "next/navigation";

interface Salary {
  id: number;
  employee_id: number;
  project_id: number;
  month: string;
  amount_paid: number;
  remaining_salary: number;
  paid_at: string;
  updated_at: string;
}

export default function SalariesPage() {
  const router = useRouter();
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchSalaries = () => {
    setLoading(true);
    fetch("http://localhost/consty/api/salaries.php")
      .then(res => res.json())
      .then(d => { setSalaries(d.salaries || []); setLoading(false); })
      .catch(e => { setError("Failed to load salaries."); setLoading(false); });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this salary record?")) return;
    setActionLoading(id);
    try {
      const res = await fetch("http://localhost/consty/api/salaries.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete salary record.");
      fetchSalaries();
    } catch (e) {
      setError(e.message || "Failed to delete salary record.");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    const session = typeof window !== "undefined" ? localStorage.getItem("session") : null;
    let isAdmin = false;
    if (session) {
      try {
        const user = JSON.parse(session);
        isAdmin = user.role === "admin";
      } catch {}
    }
    if (!isAdmin) {
      router.replace("/restricted");
    }
  }, [router]);

  useEffect(() => {
    fetchSalaries();
  }, []);

  return (
    <RequireAuth>
      <div className="w-full max-w-5xl mx-auto py-8 px-2 md:px-0">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-6">Salaries</h1>
        {error && <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-blue-50 dark:bg-blue-950">
              <tr>
                <th className="px-6 py-3">Employee ID</th>
                <th className="px-6 py-3">Project ID</th>
                <th className="px-6 py-3">Month</th>
                <th className="px-6 py-3">Amount Paid</th>
                <th className="px-6 py-3">Remaining Salary</th>
                <th className="px-6 py-3">Paid At</th>
                <th className="px-6 py-3">Updated At</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8">Loading...</td></tr>
              ) : salaries.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No salary records found.</td></tr>
              ) : (
                salaries.map(s => (
                  <tr key={s.id}>
                    <td className="px-6 py-4">{s.employee_id}</td>
                    <td className="px-6 py-4">{s.project_id}</td>
                    <td className="px-6 py-4">{s.month}</td>
                    <td className="px-6 py-4">{Number(s.amount_paid).toFixed(2)}</td>
                    <td className="px-6 py-4">{Number(s.remaining_salary).toFixed(2)}</td>
                    <td className="px-6 py-4">{s.paid_at}</td>
                    <td className="px-6 py-4">{s.updated_at || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={actionLoading === s.id}
                        className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded-lg text-xs shadow disabled:opacity-50"
                      >
                        {actionLoading === s.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAuth>
  );
}