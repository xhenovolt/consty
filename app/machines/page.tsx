"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import RequireAuth from "../../components/RequireAuth";

const AddEditMachineModal = dynamic(() => import("../../components/AddEditMachineModal"), { ssr: false });

interface Machine {
  id: number;
  name: string;
  quantity: number;
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMachine, setEditMachine] = useState<Machine | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMachines, setFilteredMachines] = useState<any[]>(machines);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchMachines = () => {
    setLoading(true);
    fetch("http://localhost/consty/api/machines.php")
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText || "Unknown error");
        }
        return res.json();
      })
      .then((d) => {
        setMachines(d.machines || []);
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load machines. " + (e.message || ""));
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
    fetchMachines();
  }, []);

  useEffect(() => {
    let filtered = machines;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(mach => {
        if (statusFilter === 'used') return mach.used > 0;
        if (statusFilter === 'damaged') return mach.damaged > 0;
        if (statusFilter === 'leftover') return mach.leftover > 0;
        return true;
      });
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter(mach =>
        Object.values(mach).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setFilteredMachines(filtered);
  }, [machines, statusFilter, searchTerm]);

  const handleAddEdit = () => {
    setShowModal(false);
    setEditMachine(null);
    fetchMachines();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this machine?")) {
      await fetch("/consty/api/machines.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchMachines();
    }
  };

  return (
    <RequireAuth>
      <div className="w-full max-w-5xl mx-auto py-8 px-2 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">Machines</h1>
          {isAdmin && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg"
              onClick={() => { setShowModal(true); setEditMachine(null); }}
            >
              + Add Machine
            </button>
          )}
        </div>
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm px-6 py-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search machines..."
                className="px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 w-full focus:ring-2 focus:ring-blue-400 outline-none text-base"
                aria-label="Search machines"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm px-4 py-2 text-base font-semibold focus:ring-2 focus:ring-blue-400"
                aria-label="Machine Status Filter"
              >
                <option value="all">All</option>
                <option value="used">Used</option>
                <option value="damaged">Damaged</option>
                <option value="leftover">Leftover</option>
              </select>
            </div>
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={3} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading...</td></tr>
              ) : filteredMachines.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8 text-gray-400">No machines found.</td></tr>
              ) : (
                filteredMachines.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{m.name}</td>
                    <td className="px-6 py-4">{m.quantity}</td>
                    <td className="px-6 py-4 text-center flex gap-2 justify-center">
                      {isAdmin && (
                        <>
                          <button
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition"
                            title="Edit"
                            onClick={() => { setEditMachine(m); setShowModal(true); }}
                          >Edit</button>
                          <button
                            className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition"
                            title="Remove"
                            onClick={() => handleDelete(m.id)}
                          >Remove</button>
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
            <AddEditMachineModal
              onClose={() => { setShowModal(false); setEditMachine(null); }}
              onSave={handleAddEdit}
              machine={editMachine}
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
