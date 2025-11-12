import React, { useState, useEffect } from "react";

interface Project {
  id: number;
  name: string;
}
interface Category {
  id?: number;
  name?: string;
  planned_amount?: number | string;
  project_id?: number | string;
}
interface Props {
  onClose: () => void;
  onSave: () => void;
  category?: Category;
  projects: Project[];
}

export default function AddEditBudgetCategoryModal({ onClose, onSave, category, projects }: Props) {
  const [name, setName] = useState<string>(category?.name || "");
  const [plannedAmount, setPlannedAmount] = useState<string | number>(category?.planned_amount || "");
  const [projectId, setProjectId] = useState<string | number>(category?.project_id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(category?.name || "");
    setPlannedAmount(category?.planned_amount || "");
    setProjectId(category?.project_id || "");
  }, [category]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const method = category ? "PATCH" : "POST";
    const body = category
      ? { id: category.id, name, planned_amount: plannedAmount, project_id: projectId }
      : { name, planned_amount: plannedAmount, project_id: projectId };
    const res = await fetch("http://localhost/consty/api/budget_categories.php", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to save category.");
      return;
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">{category ? "Edit" : "Add"} Budget Category</h2>
        {error && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select value={projectId} onChange={e => setProjectId(e.target.value)} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">
            <option value="">Select Project</option>
            {projects.map((p: Project) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Category Name" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" required />
          <input type="number" value={plannedAmount} onChange={e => setPlannedAmount(e.target.value)} placeholder="Planned Amount" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" required />
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow">{loading ? "Saving..." : "Save"}</button>
        </form>
      </div>
    </div>
  );
}
