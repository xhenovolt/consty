"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import RequireAuth from "../../components/RequireAuth";

const AddEditMaterialModal = dynamic(() => import("../../components/AddEditMaterialModal"), { ssr: false });

interface Material {
  id: number;
  name: string;
  quantity: number;
  price: number;
  money_spent?: number | string;
}
interface MaterialLog {
  id: number;
  material_id: number;
  project_id: number;
  quantity_used: number;
  logged_at: string;
  material_name?: string;
  project_name?: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>(materials);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [materialLogs, setMaterialLogs] = useState<MaterialLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState("");
  const [activeTab, setActiveTab] = useState<'materials' | 'logs'>('materials');

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
    let filtered = materials;
    if (searchTerm.trim()) {
      filtered = filtered.filter(mat =>
        Object.values(mat).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setFilteredMaterials(filtered);
  }, [materials, searchTerm]);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLogsLoading(true);
        setLogsError("");
        const res = await fetch("http://localhost/consty/api/materials_log.php");
        const text = await res.text();
        try { console.log('Raw materials_log response:', text); } catch {}
        let d: any = {};
        try { d = JSON.parse(text); } catch (e) { console.error('JSON parse error for materials_log', e); }
        if (!res.ok) throw new Error(d.error || res.statusText);
        const candidate = d.materials_log || d.logs || [];
        const arr = Array.isArray(candidate) ? candidate : Object.values(candidate || {});
        console.log('Parsed logs array length:', arr.length, arr);
        setMaterialLogs(arr as any);
      } catch (e:any) {
        console.error('Failed to load material logs', e);
        setLogsError(e.message || 'Failed to load logs');
      } finally {
        setLogsLoading(false);
      }
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
      const res = await fetch("/consty/api/materials.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      // Use backend feedback
      let msg = "Material deleted successfully";
      try {
        const data = await res.json();
        msg = data?.message || data?.success || data?.error || msg;
        if (!res.ok) throw new Error(msg);
      } catch (e: any) {
        if (!res.ok) throw new Error(msg);
      }
      alert(msg);
      fetchMaterials();
    }
  };

  return (
    <RequireAuth>
      <div className="w-full mx-auto py-8 px-2 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">Materials</h1>
          <div className="flex items-center gap-2">
            <button onClick={()=>setActiveTab('materials')} className={`px-4 py-2 rounded-lg text-sm font-semibold shadow transition ${activeTab==='materials' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Materials</button>
            <button onClick={()=>setActiveTab('logs')} className={`px-4 py-2 rounded-lg text-sm font-semibold shadow transition ${activeTab==='logs' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Usage Logs</button>
            {isAdmin && activeTab==='materials' && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg"
                onClick={() => { setShowModal(true); setEditMaterial(null); }}
              >
                + Add Material
              </button>
            )}
          </div>
        </div>
        {error && (
          <div className="mb-6 flex items-center justify-between bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow relative animate-fadeIn">
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-4 text-xl font-bold leading-none hover:text-red-900">&times;</button>
          </div>
        )}
        {activeTab==='materials' && (
          <>
            {/* Search Bar */}
            <div className="mb-4 flex flex-col md:flex-row items-center gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search materials..."
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 w-full md:w-1/3"
              />
            </div>
            <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-blue-50 dark:bg-blue-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading...</td></tr>
                  ) : filteredMaterials.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-400">No materials found.</td></tr>
                  ) : (
                    filteredMaterials.map((m) => (
                      <tr key={m.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{m.name}</td>
                        <td className="px-6 py-4">{m.quantity}</td>
                        <td className="px-6 py-4">{!isNaN(Number(m.money_spent)) ? Number(m.money_spent).toFixed(2) : "0.00"}</td>
                        <td className="px-6 py-4 text-center flex gap-2 justify-center">
                          {isAdmin && (
                            <>
                              <button
                                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition"
                                title="Edit"
                                onClick={() => { setEditMaterial(m); setShowModal(true); }}
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
                <AddEditMaterialModal
                  onClose={() => { setShowModal(false); setEditMaterial(null); }}
                  onSave={handleAddEdit}
                  material={editMaterial}
                />
              </Suspense>
            )}
          </>
        )}
        {activeTab==='logs' && (
          <div className="mt-4 overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
            <h2 className="text-xl font-bold px-6 pt-6 mb-2 text-blue-700 dark:text-blue-300 flex items-center justify-between">Material Usage Logs <div className="flex items-center gap-2"><button onClick={async ()=>{ setLogsLoading(true); try { const res = await fetch('http://localhost/consty/api/materials_log.php'); const text = await res.text(); let d: any = {}; try { d = JSON.parse(text); } catch (e){ console.error('JSON parse error refresh', e, text); } if (res.ok) { const candidate = d.materials_log || d.logs || []; const arr = Array.isArray(candidate)? candidate : Object.values(candidate||{}); setMaterialLogs(arr); setLogsError(''); } else { setLogsError(d.error || 'Failed'); } } catch (e:any){ setLogsError(e.message || 'Failed'); } setLogsLoading(false); }} className="ml-4 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-lg shadow disabled:opacity-50" disabled={logsLoading}>{logsLoading? 'Loading...' : 'Refresh'}</button></div></h2>
            {logsError && <div className="mx-6 mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">{logsError}</div>}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-blue-50 dark:bg-blue-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Quantity Used</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Logged At</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {logsLoading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading logs...</td></tr>
                ) : materialLogs.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No usage logs found.</td></tr>
                ) : (
                  materialLogs.map(log => (
                    <tr key={log.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                      <td className="px-6 py-4">{log.material_name || materials.find(m=>m.id===log.material_id)?.name || log.material_id}</td>
                      <td className="px-6 py-4">{log.project_name || log.project_id}</td>
                      <td className="px-6 py-4">{log.quantity_used}</td>
                      <td className="px-6 py-4">{log.logged_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
