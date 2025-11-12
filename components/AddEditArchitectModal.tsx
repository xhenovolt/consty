"use client";

import React, { useState, useEffect } from "react";

interface Architect {
  id?: number;
  name: string;
  project_id: number | null;
  email: string;
  phone: string;
}

interface Project {
  id: number;
  name: string;
}

interface AddEditArchitectModalProps {
  onClose: () => void;
  onSave: (architect: Architect) => void;
  architect: Architect | null;
  employees: { id: number; name: string; email?: string; phone?: string }[];
}

export default function AddEditArchitectModal({ architect, onClose, onSave, employees }: AddEditArchitectModalProps) {
  const [name, setName] = useState(architect?.name || "");
  const [projectId, setProjectId] = useState(architect?.project_id || "");
  const [email, setEmail] = useState(architect?.email || "");
  const [phone, setPhone] = useState(architect?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);

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
    if (architect) {
      setName(architect.name || "");
      setProjectId(architect.project_id || "");
      setEmail(architect.email || "");
      setPhone(architect.phone || "");
    }
  }, [architect]);

  const validate = () => {
    if (!name.trim()) return "Architect name is required.";
    if (!projectId) return "Project selection is required.";
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return "Valid email required.";
    if (!phone || !/^\+?[0-9\-() ]{6,}$/.test(phone)) return "Valid phone required.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setValidationError(err); return; }
    setLoading(true);
    setError("");
    setValidationError("");
    const body = {
      name,
      project_id: projectId,
      email,
      phone,
      ...(architect?.id ? { id: architect.id } : {})
    };
    const url = architect?.id ? "http://localhost/consty/api/architects.php?action=edit" : "http://localhost/consty/api/architects.php?action=add";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include"
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.success) {
      setError(data.error || "Failed to save architect.");
      return;
    }
    onSave(body);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg mx-auto rounded-3xl border border-white/40 dark:border-white/10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl shadow-2xl p-8 flex flex-col gap-6 animate-fadeIn text-gray-800 dark:text-gray-100">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-red-500 text-xl font-bold">&times;</button>
        <h2 className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 text-center mb-2">{architect ? "Edit Architect" : "Add Architect"}</h2>
        {error && <div className="bg-red-500/20 border border-red-400/40 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg text-center text-sm">{error}</div>}
        {validationError && <div className="bg-red-500/20 border border-red-400/40 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg text-center text-sm mb-2">{validationError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block mb-2 text-sm font-semibold text-blue-700 dark:text-blue-300">Name</label>
          <select
            className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-blue-200 dark:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-gray-100 mb-4 transition-shadow shadow-sm"
            value={name}
            onChange={e => {
              const emp = employees.find(emp => emp.name === e.target.value);
              setName(emp ? emp.name : "");
              setEmail(emp?.email || "");
              setPhone(emp?.phone || "");
            }}
            required
          >
            <option value="">Select employee...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.name}>{emp.name}</option>
            ))}
          </select>
          <label className="block mb-2 text-sm font-semibold text-blue-700 dark:text-blue-300">Project</label>
          <select
            className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-blue-200 dark:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-gray-100 mb-4 transition-shadow shadow-sm"
            value={projectId}
            onChange={e => setProjectId(Number(e.target.value))}
            required
          >
            <option value="">Select project...</option>
            {projects.map(proj => (
              <option key={proj.id} value={proj.id}>{proj.name}</option>
            ))}
          </select>
          <label className="block mb-2 text-sm font-semibold text-blue-700 dark:text-blue-300">Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-blue-200 dark:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-gray-100 mb-4 transition-shadow shadow-sm" />
          <label className="block mb-2 text-sm font-semibold text-blue-700 dark:text-blue-300">Phone</label>
          <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" required className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-blue-200 dark:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-gray-100 mb-4 transition-shadow shadow-sm" />
          <button type="submit" disabled={loading} className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/25 tracking-wide transition">{loading ? (architect ? "Saving..." : "Creating...") : (architect ? "Save Changes" : "Add Architect")}</button>
        </form>
      </div>
    </div>
  );
}
