"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import RequireAuth from "../../components/RequireAuth";

const AddEditTaskModal = dynamic(() => import("../../components/AddEditTaskModal"), { ssr: false });

interface Task {
  id: number;
  name: string;
  project_id: number | null;
  project_name?: string;
  deadline: string | null;
  status: string;
  assigned_to?: number | null;
  assigned_username?: string;
  priority?: string;
  updated_at?: string;
}

interface Employee { id:number; name:string; }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);

  const fetchTasks = () => {
    setLoading(true);
    fetch("http://localhost/consty/api/tasks.php")
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText || "Unknown error");
        }
        return res.json();
      })
      .then((d) => {
        setTasks(d.tasks || []);
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load tasks. " + (e.message || ""));
        setLoading(false);
      });
  };

  useEffect(() => {
    const session = typeof window !== 'undefined' ? localStorage.getItem('session') : null;
    if (session) {
      try {
        const user = JSON.parse(session);
        setIsAdmin(!user.role || user.role === 'admin');
      } catch {}
    }
    fetchTasks();
  }, []);

  useEffect(() => {
    let filtered = tasks;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => (task.priority || '').toLowerCase() === priorityFilter);
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter(task =>
        Object.values(task).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setFilteredTasks(filtered);
  }, [tasks, statusFilter, priorityFilter, searchTerm]);

  useEffect(()=>{
    fetch('http://localhost/consty/api/employees.php')
      .then(r=>r.json())
      .then(d=>setEmployees(d.employees||[]))
      .catch(()=>{});
  }, []);

  const handleAddEdit = () => {
    setShowModal(false);
    setEditTask(null);
    fetchTasks();
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this task?')) {
      const res = await fetch('http://localhost/consty/api/tasks.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      // Use backend feedback
      let msg = "Task deleted successfully";
      try {
        const data = await res.json();
        msg = data?.message || data?.success || data?.error || msg;
        if (!res.ok) throw new Error(msg);
      } catch (e: any) {
        if (!res.ok) throw new Error(msg);
      }
      alert(msg);
      fetchTasks();
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    await fetch('http://localhost/consty/api/tasks.php', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    fetchTasks();
  };

  const handlePriorityChange = async (id: number, currentPriority: string | undefined) => {
    const priorities = ['high', 'medium', 'low'];
    const idx = priorities.indexOf((currentPriority || 'medium').toLowerCase());
    const newPriority = priorities[(idx + 1) % priorities.length];
    await fetch('http://localhost/consty/api/tasks.php', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, priority: newPriority })
    });
    fetchTasks();
  };

  return (
    <RequireAuth>
      <div className="w-full mx-auto py-8 px-2 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">Tasks</h1>
          {isAdmin && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg"
              onClick={() => { setShowModal(true); setEditTask(null); }}
            >
              + Add Task
            </button>
          )}
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
                placeholder="Search tasks..."
                className="px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 w-full focus:ring-2 focus:ring-blue-400 outline-none text-base"
                aria-label="Search tasks"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm px-4 py-2 text-base font-semibold focus:ring-2 focus:ring-blue-400"
                aria-label="Status Filter"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm px-4 py-2 text-base font-semibold focus:ring-2 focus:ring-blue-400"
                aria-label="Priority Filter"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
          <table className="min-w-full w-full table-fixed divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-blue-50 dark:bg-blue-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Updated At</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No tasks found.</td></tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 break-words max-w-xs">{t.name}</td>
                    <td className="px-6 py-4 break-words max-w-xs">{t.project_name || <span className="text-gray-400">-</span>}</td>
                    <td className="px-6 py-4 break-words max-w-xs">{t.assigned_username || <span className="text-gray-400">-</span>}</td>
                    <td className="px-6 py-4 break-words max-w-xs">{t.deadline || <span className="text-gray-400">-</span>}</td>
                    <td className="px-6 py-4 break-words max-w-xs">{t.priority || <span className="text-gray-400">-</span>}</td>
                    <td className="px-6 py-4 break-words max-w-xs">{t.status}</td>
                    <td className="px-6 py-4 break-words max-w-xs">{t.updated_at || '-'}</td>
                    <td className="px-6 py-4 text-center flex gap-2 justify-center">
                      {isAdmin && (
                        t.status === 'completed' ? (
                          <button
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded p-1 flex items-center justify-center"
                            title="Edit"
                            onClick={() => handleEdit(t)}
                          >
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M4 21v-3.5L17.5 4.5a2.121 2.121 0 113 3L7 20.5H4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        ) : (
                          <>
                            <button
                              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded p-1 flex items-center justify-center"
                              title="Edit"
                              onClick={() => handleEdit(t)}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M4 21v-3.5L17.5 4.5a2.121 2.121 0 113 3 3L7 20.5H4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button
                              className="bg-red-100 hover:bg-red-200 text-red-700 rounded p-1 flex items-center justify-center"
                              title="Remove"
                              onClick={() => handleDelete(t.id)}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded p-1 flex items-center justify-center"
                              title="Set Pending"
                              onClick={() => handleStatusChange(t.id, 'pending')}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button
                              className="bg-green-100 hover:bg-green-200 text-green-700 rounded p-1 flex items-center justify-center"
                              title="Set Completed"
                              onClick={() => handleStatusChange(t.id, 'completed')}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button
                              className="bg-purple-100 hover:bg-purple-200 text-purple-700 rounded p-1 flex items-center justify-center"
                              title="Set In Progress"
                              onClick={() => handleStatusChange(t.id, 'in-progress')}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <button
                              className="bg-pink-100 hover:bg-pink-200 text-pink-700 rounded p-1 flex items-center justify-center"
                              title="Change Priority"
                              onClick={() => handlePriorityChange(t.id, t.priority)}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 19V6M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showModal && isAdmin && (
          <Suspense fallback={null}>
            <AddEditTaskModal
              onClose={() => { setShowModal(false); setEditTask(null); }}
              onSave={handleAddEdit}
              task={editTask}
              employees={employees}
            />
          </Suspense>
        )}
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease;
          }
        `}</style>
      </div>
    </RequireAuth>
  );
}
