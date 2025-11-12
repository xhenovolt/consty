import React, { useState, useEffect } from "react";

interface Project { id: number; name: string; }
interface Category { id: number; name: string; }
interface Task { id: number; name: string; }
interface Expense {
  id?: number;
  project_id?: number | string;
  category_id?: number | string;
  task_id?: number | string;
  amount?: number | string;
  description?: string;
}
interface Props {
  onClose: () => void;
  onSave: () => void;
  expense?: Expense;
  projects: Project[];
  categories: Category[];
  tasks: Task[];
}

export default function AddEditExpenseModal({ onClose, onSave, expense, projects, categories, tasks }: Props) {
  const [projectId, setProjectId] = useState<string | number>(expense?.project_id || "");
  const [categoryId, setCategoryId] = useState<string | number>(expense?.category_id || "");
  const [taskId, setTaskId] = useState<string | number>(expense?.task_id || "");
  const [amount, setAmount] = useState<string | number>(expense?.amount || "");
  const [description, setDescription] = useState<string>(expense?.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setProjectId(expense?.project_id || "");
    setCategoryId(expense?.category_id || "");
    setTaskId(expense?.task_id || "");
    setAmount(expense?.amount || "");
    setDescription(expense?.description || "");
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const method = expense ? "PATCH" : "POST"; // Use PATCH for editing
    const body = expense
      ? { id: expense.id, project_id: projectId, category_id: categoryId, task_id: taskId, amount, description }
      : { project_id: projectId, category_id: categoryId, task_id: taskId, amount, description };
    const res = await fetch("http://localhost/consty/api/expenses.php", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to save expense.");
      return;
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 animate-fadeIn">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 dark:text-gray-300 hover:text-red-500">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">{expense ? "Edit" : "Add"} Expense</h2>
        {error && <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select value={projectId} onChange={e => setProjectId(e.target.value)} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none">
            <option value="">Select Project</option>
            {projects.map((p: Project) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none">
            <option value="">Select Category</option>
            {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={taskId} onChange={e => setTaskId(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none">
            <option value="">Select Task (optional)</option>
            {tasks.map((t: Task) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none" required />
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none" />
          <button type="submit" disabled={loading} className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-bold px-6 py-2 rounded-xl shadow">{loading ? "Saving..." : "Save"}</button>
        </form>
      </div>
    </div>
  );
}
