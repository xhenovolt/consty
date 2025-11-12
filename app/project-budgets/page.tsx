"use client";
import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import RequireAuth from "../../components/RequireAuth";

const AddEditProjectBudgetModal = dynamic(() => import("../../components/AddEditProjectBudgetModal"), { ssr: false });

export default function ProjectBudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState<any | null>(null);

  const fetchBudgets = () => {
    setLoading(true);
    fetch("http://localhost/consty/api/project_budget.php")
      .then(res => res.json())
      .then(d => { setBudgets(d.budgets || []); setLoading(false); })
      .catch(e => { setError("Failed to load budgets. " + (e.message || "")); setLoading(false); });
  };

  useEffect(() => {
    fetchBudgets();
    fetch("http://localhost/consty/api/projects.php")
      .then(res => res.json())
      .then(d => setProjects(d.projects || []));
  }, []);

  const handleAddEdit = () => {
    setShowModal(false);
    setEditBudget(null);
    fetchBudgets();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this budget?")) {
      await fetch("/consty/api/project_budget.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchBudgets();
    }
  };

  return (
    <RequireAuth>
      <div className="w-full max-w-4xl mx-auto py-8 px-2 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">Project Budgets</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg" onClick={() => { setShowModal(true); setEditBudget(null); }}>+ Add Budget</button>
        </div>
        {error && (
          <div className="mb-6 flex items-center justify-between bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow relative animate-fadeIn">
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-4 text-xl font-bold leading-none hover:text-red-900">&times;</button>
          </div>
        )}
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-blue-50 dark:bg-blue-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Total Budget</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Planned</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actual Spent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Remaining Balance</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Updated At</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading...</td></tr>
              ) : budgets.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No budgets found.</td></tr>
              ) : (
                budgets.map((b) => (
                  <tr key={b.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                    <td className="px-6 py-4">{projects.find(p => p.id === b.project_id)?.name || b.project_id}</td>
                    <td className="px-6 py-4">USD{Number(b.total_budget).toFixed(2)}</td>
                    <td className="px-6 py-4">USD{Number(b.planned).toFixed(2)}</td>
                    <td className="px-6 py-4">USD{Number(b.actual_spent).toFixed(2)}</td>
                    <td className="px-6 py-4">USD{Number(b.remaining_balance).toFixed(2)}</td>
                    <td className="px-6 py-4">{b.updated_at || '-'}</td>
                    <td className="px-6 py-4 text-center flex gap-2 justify-center">
                      <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition" title="Edit" onClick={() => { setEditBudget(b); setShowModal(true); }}>Edit</button>
                      <button className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition" title="Remove" onClick={() => handleDelete(b.id)}>Remove</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showModal && (
          <Suspense fallback={null}>
            <AddEditProjectBudgetModal
              onClose={() => { setShowModal(false); setEditBudget(null); }}
              onSave={handleAddEdit}
              budget={editBudget}
              projects={projects}
            />
          </Suspense>
        )}
      </div>
    </RequireAuth>
  );
}
