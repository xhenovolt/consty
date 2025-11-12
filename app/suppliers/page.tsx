"use client";

import React, { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import { Edit, Trash2, Plus, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Supplier {
  id: number;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  created_at?: string;
  updated_at?: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Supplier>({
    id: 0,
    name: "",
    contact_email: "",
    contact_phone: "",
    address: ""
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost/consty/api/suppliers.php");
      if (!res.ok) throw new Error("Failed to fetch suppliers");
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (e: any) {
      setError(e.message || "Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editSupplier ? "PUT" : "POST";
    const url = editSupplier
      ? `http://localhost/consty/api/suppliers.php?id=${editSupplier.id}`
      : "http://localhost/consty/api/suppliers.php";
    const body = JSON.stringify(form);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body
      });
      if (!res.ok) throw new Error("Failed to save supplier");
      const message = editSupplier ? "Supplier updated successfully" : "Supplier added successfully";
      toast.success(message);
      setShowModal(false);
      setEditSupplier(null);
      setForm({
        id: 0,
        name: "",
        contact_email: "",
        contact_phone: "",
        address: ""
      });
      fetchSuppliers();
    } catch (e: any) {
      toast.error(e.message || "Failed to save supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost/consty/api/suppliers.php?id=${id}`, {
        method: "DELETE"
      });
      // Get backend feedback message
      let msg = "Supplier deleted successfully";
      try {
        const data = await res.json();
        msg = data?.message || data?.success || data?.error || msg;
        if (!res.ok) throw new Error(msg);
      } catch (e: any) {
        if (!res.ok) throw new Error(msg);
      }
      toast.success(msg);
      setSuppliers((prev) => prev.filter((s) => s.id !== id)); // Optimistic update
    } catch (e: any) {
      toast.error(e.message || "Failed to delete supplier");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (supplier: Supplier) => {
    setEditSupplier(supplier);
    setForm(supplier);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditSupplier(null);
    setForm({
      id: 0,
      name: "",
      contact_email: "",
      contact_phone: "",
      address: ""
    });
    setShowModal(true);
  };

  return (
    <div className="w-full mx-auto py-8 px-2 md:px-0">
      <RequireAuth />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-green-700 dark:text-green-300">Suppliers</h1>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg"
          onClick={openAddModal}
        >
          <Plus className="inline-block mr-2" /> Add Supplier
        </button>
      </div>
      {error && (
        <div className="mb-6 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow relative">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-4 text-xl font-bold leading-none hover:text-red-900">&times;</button>
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
        <table className="table-auto w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-green-50 dark:bg-green-950">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">Name</th>
              <th className="px-2 py-3 text-left text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">Email</th>
              <th className="px-2 py-3 text-left text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">Phone</th>
              <th className="px-2 py-3 text-left text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">Address</th>
              <th className="px-2 py-3 text-left text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">Created At</th>
              <th className="px-2 py-3 text-left text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">Updated At</th>
              <th className="px-2 py-3 text-center text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-green-700 dark:text-green-300">Loading...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No suppliers found.</td></tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-green-50 dark:hover:bg-green-950 transition">
                  <td className="px-2 py-4 font-semibold text-gray-900 dark:text-gray-100 break-words">{s.name}</td>
                  <td className="px-2 py-4">{s.contact_email}</td>
                  <td className="px-2 py-4">{s.contact_phone}</td>
                  <td className="px-2 py-4">{s.address}</td>
                  <td className="px-2 py-4">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'}</td>
                  <td className="px-2 py-4">{s.updated_at ? new Date(s.updated_at).toLocaleDateString() : '-'}</td>
                  <td className="px-2 py-4 text-center flex gap-2 justify-center">
                    <button
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold p-2 rounded-lg text-xs shadow transition"
                      title="Edit Supplier"
                      onClick={() => openEditModal(s)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="bg-red-100 hover:bg-red-200 text-red-700 font-bold p-2 rounded-lg text-xs shadow transition"
                      title="Delete Supplier"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal for Add/Edit Supplier */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-green-700 dark:text-green-300">{editSupplier ? "Edit Supplier" : "Add Supplier"}</h2>
            <form onSubmit={handleAddEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Contact Email</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.contact_email}
                  onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Contact Phone</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.contact_phone}
                  onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Address</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editSupplier ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditSupplier(null); }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
