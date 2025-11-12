"use client";

import React, { useState, useEffect } from "react";

export default function AddEditMachineModal({ onClose, onSave, machine, projects, suppliers }: { onClose: () => void; onSave: (machine: any) => void; machine: any; projects: { id: number; name: string }[]; suppliers?: any[] }) {
  const [name, setName] = useState<string>(machine?.name || "");
  const [quantity, setQuantity] = useState<string>(machine?.quantity != null ? String(machine.quantity) : "");
  const [unitPrice, setUnitPrice] = useState<string>(machine?.unit_price != null ? String(machine.unit_price) : "");
  const [projectId, setProjectId] = useState<string>(machine?.project_id != null ? String(machine.project_id) : "");
  const [supplierId, setSupplierId] = useState<string>(machine?.supplier_id != null ? String(machine.supplier_id) : "");
  const [used, setUsed] = useState<string>(machine?.used != null ? String(machine.used) : "");
  const [damaged, setDamaged] = useState<string>(machine?.damaged != null ? String(machine.damaged) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  // local suppliers if parent didn't provide
  const [localSuppliers, setLocalSuppliers] = useState<any[]>(Array.isArray(suppliers) ? suppliers : []);

  useEffect(() => {
    setName(machine?.name || "");
    setQuantity(machine?.quantity != null ? String(machine.quantity) : "");
    setUnitPrice(machine?.unit_price != null ? String(machine.unit_price) : "");
    setProjectId(machine?.project_id != null ? String(machine.project_id) : "");
    setSupplierId(machine?.supplier_id != null ? String(machine.supplier_id) : "");
    setUsed(machine?.used != null ? String(machine.used) : "");
    setDamaged(machine?.damaged != null ? String(machine.damaged) : "");
  }, [machine]);

  useEffect(() => {
    if (Array.isArray(suppliers) && suppliers.length) {
      setLocalSuppliers(suppliers);
      return;
    }
    let mounted = true;
    fetch("http://localhost/consty/api/suppliers.php")
      .then(r => r.json())
      .then(d => { if (!mounted) return; setLocalSuppliers(d.suppliers || []); })
      .catch(()=>{ if(!mounted) return; setLocalSuppliers([]); });
    return ()=>{ mounted = false; };
  }, [suppliers]);

  const validate = () => {
    if (!name.trim()) return "Machine name is required.";
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0) return "Quantity must be a non-negative number.";
    if (!projectId || isNaN(Number(projectId))) return "Project selection is required.";
    if (!supplierId || supplierId === "") return "Supplier selection is required.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) { setValidationError(v); return; }
    setLoading(true); setError(""); setValidationError("");

    const payload = {
      name,
      quantity: Number(quantity),
      unit_price: Number(unitPrice),
      project_id: projectId === "" ? null : Number(projectId),
      supplier_id: supplierId === "" ? null : Number(supplierId),
      used: Number(used || 0),
      damaged: Number(damaged || 0),
      leftover: Math.max(0, Number(quantity || 0) - Number(used || 0) - Number(damaged || 0))
    };

    try {
      const method = machine ? "PATCH" : "POST";
      const url = "http://localhost/consty/api/machines.php";
      const body = machine ? { id: machine.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to save machine.");
        return;
      }
      onSave();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to save machine.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">{machine ? "Edit Machine" : "Add Machine"}</h2>
        {error && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
        {validationError && <div className="bg-red-500/20 border border-red-400/40 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg text-center text-sm mb-2">{validationError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Unit Price"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={unitPrice}
            onChange={e => setUnitPrice(e.target.value)}
            required
          />
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="bg-white text-gray-900 dark:text-gray-300 dark:bg-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          >
            <option value="">Select Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {/* Supplier dropdown (searchable if long list) */}
          <div className="relative">
            <select
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-blue-950 border border-gray-300 dark:border-gray-700 w-full"
              required
            >
              <option value="">Select Supplier</option>
              {localSuppliers.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {/* Simple search hint for long lists: you can later replace with react-select */}
          </div>

          <input
            type="number"
            placeholder="Used"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={used}
            onChange={e => setUsed(e.target.value)}
          />
          <input
            type="number"
            placeholder="Damaged"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={damaged}
            onChange={e => setDamaged(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (machine ? "Saving..." : "Adding...") : (machine ? "Save Changes" : "Add Machine")}
          </button>
        </form>
      </div>
    </div>
  );
}
