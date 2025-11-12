"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import RequireAuth from "../../components/RequireAuth";

const AddEditArchitectModal = dynamic(() => import("../../components/AddEditArchitectModal"), { ssr: false });

interface Architect {
  id: number;
  name: string;
  project_id: number | null;
  email: string;
  phone: string;
  status?: string;
}

interface Project {
  id: number;
  name: string;
}

export default function ArchitectsPage() {
  const [architects, setArchitects] = useState<Architect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editArchitect, setEditArchitect] = useState<Architect | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedArchitect, setSelectedArchitect] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredArchitects, setFilteredArchitects] = useState<Architect[]>(architects);

  const fetchArchitects = () => {
    setLoading(true);
    let url = "http://localhost/consty/api/architects.php";
    if (statusFilter !== "all") url += `?status=${statusFilter}`;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText || "Unknown error");
        }
        return res.json();
      })
      .then((d) => {
        setArchitects(d.architects || []);
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load architects. " + (e.message || ""));
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
    fetchArchitects();
  }, []);

  useEffect(() => {
    fetch("http://localhost/consty/api/employees.php")
      .then(res => res.json())
      .then(data => setEmployees(data.employees || []));
  }, []);

  useEffect(() => {
    fetch("http://localhost/consty/api/project_list.php?action=list", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load projects");
        return res.json();
      })
      .then((d) => {
        setProjects(d.projects || []);
      })
      .catch(() => {
        setProjects([]);
      });
  }, []);

  useEffect(() => {
    let filtered = architects;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter(a =>
        Object.values(a).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setFilteredArchitects(filtered);
  }, [architects, statusFilter, searchTerm]);

  const handleAddEdit = () => {
    setShowModal(false);
    setEditArchitect(null);
    fetchArchitects();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this architect?')) {
      await fetch('http://localhost/consty/api/architects.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchArchitects();
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    await fetch('http://localhost/consty/api/architects.php', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    fetchArchitects(); // Refresh list after status change
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-2 md:px-0">
      <RequireAuth />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">Architects</h1>
        {isAdmin && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg"
            onClick={() => { setShowModal(true); setEditArchitect(null); }}
          >
            + Add Architect
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
              placeholder="Search architects..."
              className="px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 w-full focus:ring-2 focus:ring-blue-400 outline-none text-base"
              aria-label="Search architects"
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-blue-50 dark:bg-blue-950">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3">Updated At</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading...</td></tr>
            ) : architects.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No architects found.</td></tr>
            ) : (
              filteredArchitects.map((a) => (
                <tr key={a.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{a.name}</td>
                  <td className="px-6 py-4">{
                    (() => {
                      const proj = projects.find(p => p.id === a.project_id);
                      return proj ? proj.name : <span className="text-gray-400">-</span>;
                    })()
                  }</td>
                  <td className="px-6 py-4">{a.email}</td>
                  <td className="px-6 py-4">{a.phone || <span className="text-gray-400">-</span>}</td>
                  <td className="px-6 py-4">{a.updated_at || '-'}</td>
                  <td className="px-6 py-4 text-center flex gap-2 justify-center">
                    {isAdmin && (
                      <>
                        <button
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition flex items-center justify-center"
                          title="Edit"
                          onClick={() => { setEditArchitect(a); setShowModal(true); }}
                        >
                          <span className="sr-only">Edit</span>
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M4 21v-3.5L17.5 4.5a2.121 2.121 0 113 3L7 20.5H4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition flex items-center justify-center"
                          title="Remove"
                          onClick={() => handleDelete(a.id)}
                        >
                          <span className="sr-only">Remove</span>
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button
                          className={`font-bold py-1 px-3 rounded-lg text-xs shadow transition border border-gray-300 dark:border-gray-700 flex items-center justify-center ${a.status === 'active' ? 'bg-green-100 hover:bg-green-200 text-green-700' : a.status === 'inactive' ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'}`}
                          onClick={() => handleStatusChange(a.id, a.status === 'active' ? 'inactive' : 'active')}
                          title={a.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <span className="sr-only">{a.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                          {a.status === 'active' ? (
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          ) : (
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          )}
                        </button>
                        {a.status !== 'pending' && (
                          <button
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition border border-gray-300 dark:border-gray-700 flex items-center justify-center"
                            onClick={() => handleStatusChange(a.id, 'pending')}
                            title="Set Pending"
                          >
                            <span className="sr-only">Set Pending</span>
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        )}
                      </>
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
          <AddEditArchitectModal
            onClose={() => { setShowModal(false); setEditArchitect(null); }}
            onSave={handleAddEdit}
            architect={editArchitect}
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
  );
}
