"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import RequireAuth from "../../../components/RequireAuth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Edit, Trash2, Clock, RefreshCw } from "lucide-react"; // NEW: lucide icons

const AddEditMachineModal = dynamic(() => import("../../../components/AddEditMachineModal"), { ssr: false });

interface Machine {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  used: number;
  damaged: number;
  leftover: number;
  money_spent: number;
  updated_at: string;
  project_id?: number;
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMachine, setEditMachine] = useState<Machine | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logMachine, setLogMachine] = useState<Machine | null>(null);
  const [projects, setProjects] = useState<{id:number;name:string}[]>([]);
  const [suppliers, setSuppliers] = useState<{id:number;name:string}[]>([]); // NEW
  const [selectedProject, setSelectedProject] = useState("");
  const [quantityUsed, setQuantityUsed] = useState("");
  const [damagedUsed, setDamagedUsed] = useState("");
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState("");
  const [machineLogs, setMachineLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'machines' | 'logs'>('machines');
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');

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
        const updatedMachines = (d.machines || []).map((machine: Machine) => ({
          ...machine,
          money_spent: (machine.used || 0) + (machine.damaged || 0) > 0
            ? machine.unit_price * ((machine.used || 0) + (machine.damaged || 0))
            : 0,
          supplier_name: machine.supplier_name, // Ensure supplier_name is included
        }));
        setMachines(updatedMachines);
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
    fetch("http://localhost/consty/api/projects.php")
      .then(res => res.json())
      .then(d => setProjects(d.projects || []));
    // fetch suppliers for table & modal
    fetch("http://localhost/consty/api/suppliers.php")
      .then(res => res.json())
      .then(d => setSuppliers(d.suppliers || []))
      .catch(() => setSuppliers([]));
  }, []);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLogsLoading(true); setLogsError('');
        const res = await fetch("http://localhost/consty/api/machines_log.php");
        const d = await res.json().catch(()=>({}));
        if(!res.ok) throw new Error(d.error || res.statusText);
        setMachineLogs(d.logs || d.machines_log || []);
      } catch(e:any){ setLogsError(e.message || 'Failed to load logs'); }
      finally { setLogsLoading(false); }
    };
    loadLogs();
  }, []);

  const handleAddEdit = () => {
    setShowModal(false);
    setEditMachine(null);
    fetchMachines();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this machine?")) {
      try {
        const res = await fetch(`http://localhost/consty/api/machines.php?id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText || "Failed to delete machine.");
        }
        toast.success("Machine deleted successfully!");
        fetchMachines(); // Refresh the machines list
      } catch (error: any) {
        toast.error(error.message || "Failed to delete machine.");
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMachine) return;
    setEditLoading(true);
    setEditError("");
    const res = await fetch("http://localhost/consty/api/machines.php", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editMachine.id,
        quantity: editMachine.quantity,
        used: editMachine.used,
        damaged: editMachine.damaged,
        leftover: editMachine.leftover,
        money_spent: editMachine.money_spent,
        supplier_id: editMachine.supplier_id ?? null // NEW: include supplier update
      })
    });
    const data = await res.json();
    setEditLoading(false);
    if (!res.ok || !data.success) {
      setEditError(data.error || "Failed to update machine.");
      return;
    }
    setEditMachine(null);
    fetch("http://localhost/consty/api/machines.php")
      .then(res => res.json())
      .then(d => setMachines(d.machines || []));
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logMachine || !selectedProject || quantityUsed === "") {
      setLogError("All fields required");
      return;
    }

    const usedVal = Number(quantityUsed);
    const damagedVal = Number(damagedUsed);
    const leftoverVal = logMachine.quantity - (logMachine.used + logMachine.damaged);
    if (usedVal + damagedVal > leftoverVal) {
      setLogError(`Used + Damaged (${usedVal + damagedVal}) cannot exceed leftover (${leftoverVal}).`);
      return;
    }

    setLogLoading(true);
    setLogError("");

    try {
      const res = await fetch("http://localhost/consty/api/machines_log.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProject,
          machine_id: logMachine.id,
          quantity_used: usedVal,
          damaged_used: damagedVal,
        }),
      });
      const data = await res.json();
      setLogLoading(false);

      if (!res.ok || !data.success) {
        setLogError(data.error || "Failed to log usage.");
        return;
      }

      // Show success toast notification
      toast.success("Machine usage logged successfully!");

      // Reset the modal state
      setShowLogModal(false);
      setLogMachine(null);
      setSelectedProject("");
      setQuantityUsed("");
      setDamagedUsed("");

      // Refresh the machines list
      fetchMachines();
    } catch (error: any) {
      setLogLoading(false);
      setLogError(error.message || "Failed to log usage.");
    }
  };

  const filteredMachines = machines.filter(m => {
    let matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === 'used') matchesStatus = m.used > 0;
    if (statusFilter === 'damaged') matchesStatus = m.damaged > 0;
    if (statusFilter === 'leftover') matchesStatus = m.leftover > 0;
    return matchesSearch && matchesStatus;
  });

  const handleEditClick = (machine: Machine) => {
    setEditMachine(machine); // Set the machine to be edited
    setShowModal(true); // Open the modal
  };

  const handleAddClick = () => {
    setEditMachine(null); // Clear the editMachine state for add mode
    setShowModal(true); // Open the modal
  };

  return (
    <RequireAuth>
      <div className="w-full mx-auto py-8 px-2 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">Machines</h1>
          <div className="flex items-center gap-2">
            <button onClick={()=>setActiveTab('machines')} className={`px-4 py-2 rounded-lg text-sm font-semibold shadow transition ${activeTab==='machines' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Machines</button>
            <button onClick={()=>setActiveTab('logs')} className={`px-4 py-2 rounded-lg text-sm font-semibold shadow transition ${activeTab==='logs' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Usage Logs</button>
            {isAdmin && activeTab === 'machines' && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg"
                onClick={handleAddClick} // Use handleAddClick for adding a machine
              >
                + Add Machine
              </button>
            )}
          </div>
        </div>
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm px-6 py-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search machines..."
                className="px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 w-full focus:ring-2 focus:ring-blue-400 outline-none text-base"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search machines"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show:</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm px-4 py-2 text-base font-semibold focus:ring-2 focus:ring-blue-400"
                aria-label="Machine Status Filter"
              >
                <option value="all">All Machines</option>
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
        {activeTab === "machines" && (
          <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-blue-50 dark:bg-blue-950">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Name</th>
                  <th className="px-2 py-1 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Project</th>
                  <th className="px-2 py-1 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Supplier</th>
                  <th className="px-2 py-1 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Qty</th>
                  <th className="px-2 py-1 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Unit</th>
                  <th className="px-2 py-1 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Used</th>
                  <th className="px-2 py-1 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Damaged</th>
                  <th className="px-2 py-1 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Left</th>
                  <th className="px-2 py-1 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Spent</th>
                  <th className="px-2 py-1 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Updated</th>
                  <th className="px-2 py-1 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={11} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading...</td></tr>
                ) : filteredMachines.length === 0 ? (
                  <tr><td colSpan={11} className="text-center py-8 text-gray-400">No machines found.</td></tr>
                ) : (
                  filteredMachines.map(m => (
                    <tr key={m.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                      <td className="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100 min-w-0 truncate">{m.name}</td>
                      <td className="px-3 py-2 min-w-0 truncate">{projects.find(p => p.id === m.project_id)?.name || '-'}</td>
                      <td className="px-3 py-2 min-w-0 truncate">{m.supplier_name || 'unavailable'}</td>
                      <td className="px-3 py-2 text-sm">{m.quantity}</td>
                      <td className="px-3 py-2 text-sm">${m.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-sm">{m.used}</td>
                      <td className="px-3 py-2 text-sm">{m.damaged}</td>
                      <td className="px-3 py-2 text-sm">{m.quantity - (m.used + m.damaged)}</td>
                      <td className="px-3 py-2 text-sm">${m.money_spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-sm">{m.updated_at || '-'}</td>
                      <td className="px-3 py-2 text-center">
                        {isAdmin && (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                              title="Edit"
                              onClick={() => handleEditClick(m)}
                            >
                              <Edit className="h-4 w-4 text-yellow-600" />
                            </button>
                            <button
                              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                              title="Log Usage"
                              onClick={() => { setLogMachine(m); setShowLogModal(true); }}
                            >
                              <Clock className="h-4 w-4 text-green-600" />
                            </button>
                            <button
                              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                              title="Remove"
                              onClick={() => handleDelete(m.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeTab==='logs' && (
          <div className="mt-8 overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
            <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300 flex items-center gap-4">Machine Usage Logs
              <button
                onClick={async ()=>{ try { setLogsLoading(true); const r = await fetch('http://localhost/consty/api/machines_log.php'); const j = await r.json().catch(()=>({})); if(r.ok){ setMachineLogs(j.logs || j.machines_log || []); setLogsError(''); } else { setLogsError(j.error || 'Failed'); } } catch(e:any){ setLogsError(e.message || 'Failed'); } finally { setLogsLoading(false);} }}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-lg shadow disabled:opacity-50" disabled={logsLoading}
              >{logsLoading ? 'Loading...' : 'Refresh'}</button>
            </h2>
            {logsError && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">{logsError}</div>}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-blue-50 dark:bg-blue-950">
                <tr>
                  <th className="px-6 py-3">Machine</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Quantity Used</th>
                  <th className="px-6 py-3">Logged At</th>
                </tr>
              </thead>
              <tbody>
                {logsLoading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading logs...</td></tr>
                ) : machineLogs.length===0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No logs found.</td></tr>
                ) : (
                  machineLogs.map(log => (
                    <tr key={log.id}>
                      <td className="px-6 py-4">{machines.find(m=>m.id===log.machine_id)?.name || log.machine_id}</td>
                      <td className="px-6 py-4">{projects.find(p=>p.id===log.project_id)?.name || log.project_id}</td>
                      <td className="px-6 py-4">{log.quantity_used}</td>
                      <td className="px-6 py-4">{log.logged_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {showModal && isAdmin && (
          <Suspense fallback={null}>
            <AddEditMachineModal
              onClose={() => { setShowModal(false); setEditMachine(null); }}
              onSave={handleAddEdit}
              machine={editMachine} // Pass the machine to be edited (null for add mode)
              projects={projects}
              suppliers={suppliers} // NEW: pass suppliers into modal
            />
          </Suspense>
        )}
        {showLogModal && logMachine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button onClick={() => setShowLogModal(false)} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
              <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Log Machine Usage</h2>
              {logError && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">{logError}</div>}
              <form onSubmit={handleLogSubmit} className="flex flex-col gap-4">
                <input type="text" value={logMachine.name} disabled className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" />
                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} required className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-blue-950 border border-gray-300 dark:border-gray-700">
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" value={quantityUsed} onChange={e => setQuantityUsed(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" placeholder="Quantity Used" required />
                <input type="number" value={damagedUsed} onChange={e => setDamagedUsed(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" placeholder="Damaged Quantity" />
                <button type="submit" disabled={logLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow">{logLoading ? "Logging..." : "Log Usage"}</button>
              </form>
            </div>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
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
