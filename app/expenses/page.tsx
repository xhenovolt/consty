"use client"
import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import RequireAuth from "../../components/RequireAuth";

const AddEditExpenseModal = dynamic(() => import("../../components/AddEditExpenseModal"), { ssr: false });

interface Expense {
  id: number;
  project_id: number;
  category_id?: number;
  task_id?: number;
  amount: number;
  description?: string;
  spent_at: string;
  updated_at?: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  updated_at?: string;
}

interface Project {
  id: number;
  name: string;
}

export default function ExpensesPage() {
  const [tab, setTab] = useState<'expenses'|'categories'>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<{id:number;name:string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState<any | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>(expenses);

  const fetchExpenses = () => {
    setLoading(true);
    fetch("http://localhost/consty/api/expenses.php")
      .then(res => res.json())
      .then(d => { setExpenses(d.expenses || []); setLoading(false); })
      .catch(e => { setError("Failed to load expenses. " + (e.message || "")); setLoading(false); });
  };

  useEffect(() => {
    fetchExpenses();
    fetch("http://localhost/consty/api/projects.php")
      .then(res => res.json())
      .then(d => setProjects(d.projects || []));
    fetch("http://localhost/consty/api/expense_categories.php")
      .then(res => res.json())
      .then(d => setCategories(d.categories || []));
    fetch("http://localhost/consty/api/tasks_list.php")
      .then(res => res.json())
      .then(d => setTasks(d.tasks || []));
  }, []);

  useEffect(() => {
    let filtered = expenses;
    if (searchTerm.trim()) {
      filtered = filtered.filter(exp =>
        Object.values(exp).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setFilteredExpenses(filtered);
  }, [expenses, searchTerm]);

  const handleAddEdit = () => {
    setShowModal(false);
    setEditExpense(null);
    fetchExpenses();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this expense?")) {
      await fetch("http://localhost/consty/api/expenses.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchExpenses();
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost/consty/api/expense_categories.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory)
    });
    setShowCategoryModal(false);
    setNewCategory({ name: '', description: '' });
    // Refresh categories
    fetch("http://localhost/consty/api/expense_categories.php")
      .then(res => res.json())
      .then(d => setCategories(d.categories || []));
  };

  return (
    <RequireAuth>
      <div className="w-full max-w-5xl mx-auto py-8 px-2 md:px-0">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-6">Expenses</h1>
        <div className="mb-6 flex gap-4">
          <button className={`px-6 py-2 rounded-lg font-bold ${tab==='expenses'?'bg-blue-600 text-white':'bg-blue-100 text-blue-700'}`} onClick={()=>setTab('expenses')}>Expenses</button>
          <button className={`px-6 py-2 rounded-lg font-bold ${tab==='categories'?'bg-blue-600 text-white':'bg-blue-100 text-blue-700'}`} onClick={()=>setTab('categories')}>Categories</button>
        </div>
        {error && (
          <div className="mb-6 flex items-center justify-between bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow relative animate-fadeIn">
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-4 text-xl font-bold leading-none hover:text-red-900">&times;</button>
          </div>
        )}
        {tab==='expenses' && (
          <div>
            <div className="mb-4 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow" onClick={()=>{ setShowModal(true); setEditExpense(null); }}>+ Add Expense</button>
            </div>
            <div className="mb-4">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm px-6 py-4 flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full md:w-1/3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search expenses..."
                    className="px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 w-full focus:ring-2 focus:ring-blue-400 outline-none text-base"
                    aria-label="Search expenses"
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
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Task ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Spent At</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Updated At</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading...</td></tr>
                  ) : filteredExpenses.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">No expenses found.</td></tr>
                  ) : (
                    filteredExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                        <td className="px-6 py-4">{projects.find(p => p.id === e.project_id)?.name || e.project_id}</td>
                        <td className="px-6 py-4">{categories.find(c => c.id === e.category_id)?.name || e.category_id}</td>
                        <td className="px-6 py-4">{e.task_id ? (tasks.find(t => t.id === e.task_id)?.name || e.task_id) : '-'}</td>
                        <td className="px-6 py-4">USD{Number(e.amount).toFixed(2)}</td>
                        <td className="px-6 py-4">{e.description}</td>
                        <td className="px-6 py-4">{e.spent_at}</td>
                        <td className="px-6 py-4">{e.updated_at || '-'}</td>
                        <td className="px-6 py-4 text-center flex gap-2 justify-center">
                          <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition" title="Edit" onClick={() => { setEditExpense(e); setShowModal(true); }}>Edit</button>
                          <button className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition" title="Remove" onClick={() => handleDelete(e.id)}>Remove</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {showModal && (
              <Suspense fallback={null}>
                <AddEditExpenseModal
                  onClose={() => { setShowModal(false); setEditExpense(null); }}
                  onSave={handleAddEdit}
                  expense={editExpense}
                  projects={projects}
                  categories={categories}
                  tasks={tasks}
                />
              </Suspense>
            )}
          </div>
        )}
        {tab==='categories' && (
          <div>
            <div className="mb-4 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow" onClick={()=>setShowCategoryModal(true)}>+ Add Category</button>
            </div>
            <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-blue-50 dark:bg-blue-950">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-gray-400">No categories found.</td></tr>
                  ) : (
                    categories.map(c => (
                      <tr key={c.id}>
                        <td className="px-6 py-4 font-semibold">{c.name}</td>
                        <td className="px-6 py-4">{c.description || '-'}</td>
                        <td className="px-6 py-4">{c.updated_at || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {showCategoryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
                  <button onClick={()=>setShowCategoryModal(false)} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
                  <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Add Category</h2>
                  <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
                    <input type="text" value={newCategory.name} onChange={e=>setNewCategory({...newCategory, name: e.target.value})} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" placeholder="Category Name" required />
                    <input type="text" value={newCategory.description} onChange={e=>setNewCategory({...newCategory, description: e.target.value})} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" placeholder="Description" />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow">Add Category</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
