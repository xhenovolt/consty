import React, { useState, useEffect } from "react";

interface Project { id: number; name: string; }
interface Budget {
  id?: number;
  project_id?: number | string;
  total_budget?: number | string;
  planned?: number | string;
  actual_spent?: number | string;
  remaining_balance?: number | string;
}
interface Props {
  onClose: () => void;
  onSave: () => void;
  budget?: Budget;
  projects: Project[];
}

export default function AddEditProjectBudgetModal({ onClose, onSave, budget, projects }: Props) {
  const [projectId, setProjectId] = useState<string | number>(budget?.project_id || "");
  const [totalBudget, setTotalBudget] = useState<string | number>(budget?.total_budget || "");
  const [planned, setPlanned] = useState<string | number>(budget?.planned || "");
  const [actualSpent, setActualSpent] = useState<string | number>(budget?.actual_spent || "");
  const [remainingBalance, setRemainingBalance] = useState<string | number>(budget?.remaining_balance || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setProjectId(budget?.project_id || "");
    setTotalBudget(budget?.total_budget || "");
    setPlanned(budget?.planned || "");
    setActualSpent(budget?.actual_spent || "");
    setRemainingBalance(budget?.remaining_balance || "");
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const method = budget ? "PATCH" : "POST";
    const body = budget
      ? { id: budget.id, project_id: projectId, total_budget: totalBudget, planned, actual_spent: actualSpent, remaining_balance: remainingBalance }
      : { project_id: projectId, total_budget: totalBudget, planned, actual_spent: actualSpent, remaining_balance: remainingBalance };
    const res = await fetch("http://localhost/consty/api/project_budget.php", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to save budget.");
      return;
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">{budget ? "Edit" : "Add"} Project Budget</h2>
        {error && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select value={projectId} onChange={e => setProjectId(e.target.value)} required className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-blue-950 border border-gray-300 dark:border-gray-700">
            <option value="">Select Project</option>
            {projects.map((p: Project) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="number" value={totalBudget} onChange={e => setTotalBudget(e.target.value)} placeholder="Total Budget" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" required />
          <input type="number" value={planned} onChange={e => setPlanned(e.target.value)} placeholder="Planned" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" />
          <input type="number" value={actualSpent} onChange={e => setActualSpent(e.target.value)} placeholder="Actual Spent" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" />
          <input type="number" value={remainingBalance} onChange={e => setRemainingBalance(e.target.value)} placeholder="Remaining Balance" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" />
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow">{loading ? "Saving..." : "Save"}</button>
        </form>
      </div>
    </div>
  );
}
