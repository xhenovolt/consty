"use client";

import React, { useState, useEffect } from "react";

export default function AddEditMaterialModal({ onClose, onSave, material, projects, suppliers }: { onClose: () => void; onSave: (material: any) => void; material: any; projects: { id: number; name: string }[]; suppliers: { id: number; name: string }[] }) {
  // store form values as strings for consistent input handling; use empty string when absent
  const [name, setName] = useState<string>(material?.name || "");
  const [quantity, setQuantity] = useState<string>(material?.quantity != null ? String(material.quantity) : "");
  const [unitPrice, setUnitPrice] = useState<string>(material?.unit_price != null ? String(material.unit_price) : "");
  const [projectId, setProjectId] = useState<string>(material?.project_id != null ? String(material.project_id) : "");
  const [supplierId, setSupplierId] = useState<string>(material?.supplier_id != null ? String(material.supplier_id) : "");
  const [used, setUsed] = useState<string>(material?.used != null ? String(material.used) : "");
  const [damaged, setDamaged] = useState<string>(material?.damaged != null ? String(material.damaged) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  // Local suppliers state — fallback to fetching if parent didn't pass suppliers
  const [localSuppliers, setLocalSuppliers] = useState<{ id: number; name: string }[]>(Array.isArray(suppliers) && suppliers.length ? suppliers : []);

  useEffect(() => {
    setName(material?.name || "");
    setQuantity(material?.quantity != null ? String(material.quantity) : "");
    setUnitPrice(material?.unit_price != null ? String(material.unit_price) : "");
    setProjectId(material?.project_id != null ? String(material.project_id) : "");
    setSupplierId(material?.supplier_id != null ? String(material.supplier_id) : "");
    setUsed(material?.used != null ? String(material.used) : "");
    setDamaged(material?.damaged != null ? String(material.damaged) : "");
  }, [material]);

  // If parent did not supply suppliers, fetch them from API
  useEffect(() => {
    if (Array.isArray(suppliers) && suppliers.length) {
      setLocalSuppliers(suppliers);
      return;
    }

    let mounted = true;
    fetch("http://localhost/consty/api/suppliers.php")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load suppliers");
        return res.json();
      })
      .then((d) => {
        if (!mounted) return;
        setLocalSuppliers(d.suppliers || []);
      })
      .catch(() => {
        if (!mounted) return;
        setLocalSuppliers([]);
      });
    return () => { mounted = false; };
  }, [suppliers]);

  const validate = () => {
    if (!name.trim()) return "Material name is required.";
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0) return "Quantity must be a non-negative number.";
    if (!supplierId) return "Supplier selection is required.";
    if (used !== "" && (isNaN(Number(used)) || Number(used) < 0)) return "Used must be a non-negative number.";
    if (damaged !== "" && (isNaN(Number(damaged)) || Number(damaged) < 0)) return "Damaged must be a non-negative number.";
    if (!projectId || isNaN(Number(projectId))) return "Project selection is required.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }
    setLoading(true);
    setError("");
    setValidationError("");

    // Calculate leftover dynamically
    const leftover = Math.max(0, Number(quantity || 0) - Number(used || 0) - Number(damaged || 0));

    const method = material ? "PATCH" : "POST";
    // send supplier_id as null if none selected to avoid accidental 0
    const supplier_id_payload = supplierId === "" ? null : Number(supplierId);
    const project_id_payload = projectId === "" ? null : Number(projectId);

    const body = material
      ? { id: material.id, name, quantity: Number(quantity), unit_price: Number(unitPrice), project_id: project_id_payload, supplier_id: supplier_id_payload, used: Number(used || 0), damaged: Number(damaged || 0), leftover }
      : { name, quantity: Number(quantity), unit_price: Number(unitPrice), project_id: project_id_payload, supplier_id: supplier_id_payload, used: Number(used || 0), damaged: Number(damaged || 0), leftover };

    const res = await fetch("http://localhost/consty/api/materials.php", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to save material.");
      return;
    }
    onSave(data.material);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">{material ? "Edit Material" : "Add Material"}</h2>
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
            value={supplierId}
            onChange={e => setSupplierId(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-blue-950 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          >
            <option value="">Select Supplier</option>
            {localSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-blue-950 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          >
            <option value="">Select Project</option>
            {Array.isArray(projects) && projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
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
            {loading ? (material ? "Saving..." : "Adding...") : (material ? "Save Changes" : "Add Material")}
          </button>
        </form>
      </div>
    </div>
  );
}
