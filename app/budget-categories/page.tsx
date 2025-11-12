"use client"
import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import RequireAuth from "../../components/RequireAuth";

const AddEditBudgetCategoryModal = dynamic(() => import("../../components/AddEditBudgetCategoryModal"), { ssr: false });

export default function BudgetCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>(categories);

  const fetchCategories = () => {
    setLoading(true);
    fetch("http://localhost/consty/api/budget_categories.php")
      .then(res => res.json())
      .then(d => { setCategories(d.categories || []); setLoading(false); })
      .catch(e => { setError("Failed to load categories. " + (e.message || "")); setLoading(false); });
  };

  useEffect(() => {
    fetchCategories();
    fetch("http://localhost/consty/api/projects.php")
      .then(res => res.json())
      .then(d => setProjects(d.projects || []));
  }, []);

  useEffect(() => {
    let filtered = categories;
    if (searchTerm.trim()) {
      filtered = filtered.filter(cat =>
        Object.values(cat).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  const handleAddEdit = () => {
    setShowModal(false);
    setEditCategory(null);
    fetchCategories();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this category?")) {
      await fetch("/consty/api/budget_categories.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchCategories();
    }
  };

  return (
    <RequireAuth>
      <div className="w-full max-w-4xl mx-auto py-8 px-2 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">Budget Categories</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg" onClick={() => { setShowModal(true); setEditCategory(null); }}>+ Add Category</button>
        </div>
        {error && (
          <div className="mb-6 flex items-center justify-between bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow relative animate-fadeIn">
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-4 text-xl font-bold leading-none hover:text-red-900">&times;</button>
          </div>
        )}
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm px-6 py-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 w-full focus:ring-2 focus:ring-blue-400 outline-none text-base"
                aria-label="Search categories"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-blue-50 dark:bg-blue-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Planned Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actual Spent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Updated At</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No categories found.</td></tr>
              ) : (
                filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                    <td className="px-6 py-4">{projects.find(p => p.id === c.project_id)?.name || c.project_id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 break-words max-w-xs">{c.name}</td>
                    <td className="px-6 py-4">USD{Number(c.planned_amount).toFixed(2)}</td>
                    <td className="px-6 py-4">USD{Number(c.actual_spent).toFixed(2)}</td>
                    <td className="px-6 py-4">{c.updated_at || '-'}</td>
                    <td className="px-6 py-4 text-center flex gap-2 justify-center">
                      <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition" title="Edit" onClick={() => { setEditCategory(c); setShowModal(true); }}>Edit</button>
                      <button className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition" title="Remove" onClick={() => handleDelete(c.id)}>Remove</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showModal && (
          <Suspense fallback={null}>
            <AddEditBudgetCategoryModal
              onClose={() => { setShowModal(false); setEditCategory(null); }}
              onSave={handleAddEdit}
              category={editCategory}
              projects={projects}
            />
          </Suspense>
        )}
      </div>
    </RequireAuth>
  );
}
