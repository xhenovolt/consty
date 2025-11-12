"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import RequireAuth from "../../../components/RequireAuth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Add lucide icons
import { Edit, CheckCircle, Trash2 } from "lucide-react";

const AddEditMaterialModal = dynamic(() => import("../../../components/AddEditMaterialModal"), { ssr: false });

interface Material {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  used: number;
  damaged: number;
  leftover: number;
  money_spent: number;
  project_id?: number;
  supplier_id?: number;       // added
  supplier_name?: string;     // added
  updated_at?: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logMaterial, setLogMaterial] = useState<Material | null>(null);
  const [projects, setProjects] = useState<{id:number;name:string}[]>([]);
  const [suppliers, setSuppliers] = useState<{id:number;name:string}[]>([]); // new
  const [selectedProject, setSelectedProject] = useState("");
  const [quantityUsed, setQuantityUsed] = useState("");
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [materialLogs, setMaterialLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'materials'|'logs'>('materials');
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');

  const filteredMaterials = materials.filter(m => {
    // include supplier_name in searchable fields
    let matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (m.supplier_name && String(m.supplier_name).toLowerCase().includes(searchTerm.toLowerCase()));
    let matchesStatus = true;
    if (statusFilter === 'used') matchesStatus = m.used > 0;
    if (statusFilter === 'damaged') matchesStatus = m.damaged > 0;
    if (statusFilter === 'leftover') matchesStatus = m.leftover > 0;
    return matchesSearch && matchesStatus;
  });

  const fetchMaterials = () => {
    setLoading(true);
    fetch("http://localhost/consty/api/materials.php")
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText || "Unknown error");
        }
        return res.json();
      })
      .then((d) => {
        setMaterials(d.materials || []);
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load materials. " + (e.message || ""));
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
    fetchMaterials();
  }, []);

  useEffect(() => {
    fetch("http://localhost/consty/api/projects.php")
      .then(res => res.json())
      .then(d => setProjects(d.projects || []));
    // fetch suppliers for modal select
    fetch("http://localhost/consty/api/suppliers.php")
      .then(res => res.json())
      .then(d => setSuppliers(d.suppliers || []))
      .catch(()=>setSuppliers([]));
  }, []);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLogsLoading(true); setLogsError('');
        const res = await fetch("http://localhost/consty/api/materials_log.php");
        const json = await res.json().catch(()=>({}));
        if(!res.ok) throw new Error(json.error||res.statusText);
        setMaterialLogs(json.materials_log || json.logs || []);
      } catch(e:any){ setLogsError(e.message||'Failed to load logs'); }
      finally { setLogsLoading(false); }
    };
    loadLogs();
  }, []);

  const handleAddEdit = (material?: Material) => {
    setShowModal(false);
    setEditMaterial(null);
    fetchMaterials();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this material?")) {
      await fetch("http://localhost/consty/api/materials.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchMaterials();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMaterial) return;
    setEditLoading(true);
    setEditError("");
    const res = await fetch("http://localhost/consty/api/materials.php", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editMaterial.id,
        quantity: editMaterial.quantity,
        unit_price: editMaterial.unit_price,
        used: editMaterial.used,
        damaged: editMaterial.damaged,
        leftover: editMaterial.leftover,
        money_spent: editMaterial.money_spent
      })
    });
    const data = await res.json();
    setEditLoading(false);
    if (!res.ok || !data.success) {
      setEditError(data.error || "Failed to update material.");
      return;
    }
    setEditMaterial(null);
    fetch("http://localhost/consty/api/materials.php")
      .then(res => res.json())
      .then(d => setMaterials(d.materials || []));
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logMaterial || !selectedProject || !quantityUsed) {
      setLogError("All fields required");
      return;
    }

    const usedVal = Number(quantityUsed);
    const damagedVal = logMaterial.damaged ? Number(logMaterial.damaged) : 0;
    const leftoverVal = logMaterial.quantity - (logMaterial.used + logMaterial.damaged);
    if (usedVal + damagedVal > leftoverVal) {
      setLogError(`Used + Damaged (${usedVal + damagedVal}) cannot exceed leftover (${leftoverVal}).`);
      return;
    }

    setLogLoading(true);
    setLogError("");

    try {
      const res = await fetch("http://localhost/consty/api/materials_log.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProject,
          material_id: logMaterial.id,
          quantity_used: usedVal,
          quantity_damaged: damagedVal,
        }),
      });
      const data = await res.json();
      setLogLoading(false);

      if (!res.ok || !data.success) {
        setLogError(data.error || "Failed to log usage.");
        return;
      }

      // Update the materials state
      setMaterials((prevMaterials) =>
        prevMaterials.map((material) =>
          material.id === logMaterial.id
            ? {
                ...material,
                used: material.used + usedVal,
                damaged: material.damaged + damagedVal,
                leftover: material.quantity - (material.used + usedVal + material.damaged + damagedVal),
                money_spent: material.money_spent + (usedVal + damagedVal) * material.unit_price,
              }
            : material
        )
      );

      // Update the materialLogs state
      const newLog = {
        id: Date.now(), // Temporary unique ID for the new log
        material_id: logMaterial.id,
        project_id: selectedProject,
        quantity_used: usedVal,
        quantity_damaged: damagedVal,
        logged_at: new Date().toISOString(), // Current timestamp
      };
      setMaterialLogs((prevLogs) => [newLog, ...prevLogs]);

      // Show success toast notification
      toast.success("Material usage logged successfully!");

      // Reset the modal state
      setShowLogModal(false);
      setLogMaterial(null);
      setSelectedProject("");
      setQuantityUsed("");
    } catch (error: any) {
      setLogLoading(false);
      setLogError(error.message || "Failed to log usage.");
    }
  };

  const handlePayEmployee = async (employeeId: number, amount: number) => {
    try {
      const res = await fetch("http://localhost/consty/api/pay_employee.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to pay employee.");

      // Show success toast notification
      alert("Payment successful!");

      // Refresh employee data
      fetchMaterials();
    } catch (error: any) {
      alert(`Payment failed: ${error.message}`);
    }
  };

  const handleEditClick = (material: Material) => {
    setEditMaterial(material); // Set the material to be edited
    setShowModal(true); // Open the modal
  };

  return (
    <RequireAuth>
      <div className="w-full  mx-auto py-8 px-0 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">Materials Tracking</h1>
          <div className="flex gap-2 items-center">
            <button onClick={()=>setActiveTab('materials')} className={`px-4 py-2 rounded-lg text-sm font-semibold shadow transition ${activeTab==='materials'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Materials</button>
            <button onClick={()=>setActiveTab('logs')} className={`px-4 py-2 rounded-lg text-sm font-semibold shadow transition ${activeTab==='logs'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Usage Logs</button>
            {isAdmin && activeTab==='materials' && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg"
                onClick={() => { setShowModal(true); setEditMaterial(null); }}
              >+ Add Material</button>
            )}
          </div>
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
                placeholder="Search materials..."
                className="px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 w-full focus:ring-2 focus:ring-blue-400 outline-none text-base"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                aria-label="Search materials"
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
                aria-label="Material Status Filter"
              >
                <option value="all">All Materials</option>
                <option value="used">Used</option>
                <option value="damaged">Damaged</option>
                <option value="leftover">Leftover</option>
              </select>
            </div>
          </div>
        </div>
        {activeTab==='materials' && (
          <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-blue-50 dark:bg-blue-950">
                <tr>
                  <th className="px-2 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Name</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Supplier</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Project</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Quantity</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Unit Price</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Used</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Damaged</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Leftover</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Money Spent</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Updated At</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={10} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading...</td></tr>
                ) : filteredMaterials.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-8 text-gray-400">No materials found.</td></tr>
                ) : (
                  filteredMaterials.map((m) => (
                    <tr key={m.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                      <td className="px-2 text-left py-4 font-semibold text-gray-900 dark:text-gray-100 break-words max-w-xs">{m.name}</td>
                      <td className="px-2 text-left py-4">{m.supplier_name || '-'}</td>
                      <td className="px-2 text-left py-4">{projects.find(p => p.id === m.project_id)?.name || '-'}</td>
                      <td className="px-2 text-left py-4">{m.quantity}</td>
                      <td className="px-2 text-left py-4">{m.unit_price}</td>
                      <td className="px-2 text-left py-4">{m.used}</td>
                      <td className="px-2 text-left py-4">{m.damaged}</td>
                      <td className="px-2 text-left py-4">{m.quantity - (m.used + m.damaged)}</td>
                      <td className="px-2 text-left py-4">{((m.used + m.damaged) * m.unit_price).toFixed(2)}</td>
                      <td className="px-2 text-left py-4">{m.updated_at || '-'}</td>
                      <td className="px-2 text-left py-4 ">
                        <div className="flex items-left justify-start gap-2">
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEditClick(m)}
                                title="Edit"
                                className="p-1 rounded-md bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                                aria-label={`Edit ${m.name}`}
                              >
                                <Edit className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => { setLogMaterial(m); setShowLogModal(true); }}
                                title="Log Usage"
                                className="p-1 rounded-md bg-green-100 hover:bg-green-200 text-green-700"
                                aria-label={`Log usage for ${m.name}`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleDelete(m.id)}
                                title="Remove"
                                className="p-1 rounded-md bg-red-100 hover:bg-red-200 text-red-700"
                                aria-label={`Remove ${m.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeTab==='logs' && (
          <div className="mt-4 overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
            <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300 flex items-center gap-4">
              Material Usage Logs
              <button
                onClick={async ()=>{
                  try {
                    setLogsLoading(true);
                    const r = await fetch('http://localhost/consty/api/materials_log.php');
                    const j = await r.json().catch(()=>({}));
                    if (r.ok) {
                      setMaterialLogs(j.materials_log || j.logs || []);
                      setLogsError('');
                    } else {
                      setLogsError(j.error || 'Failed');
                    }
                  } catch ( e:any) {
                    setLogsError(e.message || 'Failed');
                  } finally {
                    setLogsLoading(false);
                  }
                }}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-lg shadow disabled:opacity-50"
                disabled={logsLoading}
              >{logsLoading? 'Loading...' : 'Refresh'}</button>
            </h2>
            {logsError && <div className="mb-4 mx-2 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">{logsError}</div>}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-blue-50 dark:bg-blue-950">
                <tr>
                  <th className="px-6 py-3">Material (Supplier)</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Quantity Used</th>
                  <th className="px-6 py-3">Logged At</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {logsLoading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading logs...</td></tr>
                ) : materialLogs.length===0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No logs found.</td></tr>
                ) : (
                  materialLogs.map(log => (
                    <tr key={log.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold">{materials.find(mat => mat.id === log.material_id)?.name || log.material_id}</div>
                        <div className="text-xs text-gray-500">{materials.find(mat => mat.id === log.material_id)?.supplier_name || ''}</div>
                      </td>
                      <td className="px-6 py-4">{projects.find(p => p.id === log.project_id)?.name || log.project_id}</td>
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
            <AddEditMaterialModal
              onClose={() => { setShowModal(false); setEditMaterial(null); }}
              onSave={handleAddEdit}
              material={editMaterial} // Pass the material to be edited
              projects={projects} // Pass the projects state to the modal
              suppliers={suppliers} // Pass suppliers so modal preselects and submits supplier_id
            />
          </Suspense>
        )}
        {showLogModal && logMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button onClick={() => setShowLogModal(false)} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
              <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Log Material Usage</h2>
              {logError && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">{logError}</div>}
              <form onSubmit={handleLogSubmit} className="flex flex-col gap-4">
                <input type="text" value={logMaterial.name} disabled className="px-4 py-2 rounded-lg  border border-gray-300 dark:border-gray-700" />
                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} required className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-blue-950 border border-gray-300 dark:border-gray-700">
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" value={quantityUsed} onChange={e => setQuantityUsed(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" placeholder="Quantity Used" required />
                <input
                  type="number"
                  value={logMaterial?.damaged || ""}
                  onChange={e => logMaterial && setLogMaterial({ ...logMaterial, damaged: Number(e.target.value) })}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
                  placeholder="Quantity Damaged (optional)"
                />
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
