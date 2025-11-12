"use client";
import React, { useState, useEffect } from "react";

interface Project {
  id?: number;
  name: string;
  description: string;
  client?: string;
  budget?: number;
  location?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export default function AddEditProjectModal({ project, onClose, onSave }: {
  project?: Project | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [startDate, setStartDate] = useState(project?.start_date || "");
  const [endDate, setEndDate] = useState(project?.end_date || "");
  const [client, setClient] = useState(project?.client || "");
  const [budget, setBudget] = useState(project?.budget || "");
  const [location, setLocation] = useState(project?.location || "");
  const [status, setStatus] = useState(project?.status || "ongoing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setStartDate(project.start_date || "");
      setEndDate(project.end_date || "");
      setClient(project.client || "");
      setBudget(project.budget || "");
      setLocation(project.location || "");
      setStatus(project.status || "ongoing");
    }
  }, [project]);

  const validate = () => {
    if (!name.trim()) return "Project name is required.";
    if (!description.trim()) return "Description is required.";
    if (startDate && endDate && startDate > endDate) return "End date must be after start date.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setValidationError(err); return; }
    setLoading(true);
    setError("");
    setValidationError("");

    const method = project ? "PATCH" : "POST";
    const body: any = {
      id: project?.id,
      name,
      client,
      budget,
      location,
      status,
    };

    // Include start_date and end_date only if they are defined
    if (startDate) body.start_date = startDate;
    if (endDate) body.end_date = endDate;

    const res = await fetch("http://localhost/consty/api/projects.php", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to save project.");
      return;
    }
    onSave(data.project); // Pass the saved project back to the parent
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg mx-auto rounded-3xl border border-white/40 dark:border-white/10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl shadow-2xl p-8 flex flex-col gap-6 animate-fadeIn text-gray-800 dark:text-gray-100">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-red-500 text-xl font-bold">&times;</button>
        <h2 className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 text-center mb-2">{project ? "Edit Project" : "Add Project"}</h2>
        {error && <div className="bg-red-500/20 border border-red-400/40 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg text-center text-sm">{error}</div>}
        {validationError && <div className="bg-red-500/20 border border-red-400/40 text-red-800 dark:text-red-300 px-4 py-2 rounded-lg text-center text-sm mb-2">{validationError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Project Name" required className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" required className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" rows={3} />
          <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="text" value={client} onChange={e=>setClient(e.target.value)} placeholder="Client" className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="number" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="Budget" className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <select value={status} onChange={e=>setStatus(e.target.value)} className="px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-white/40 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="ongoing">Ongoing</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
          </select>
          <button type="submit" disabled={loading} className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/25 tracking-wide transition">{loading ? (project ? "Saving..." : "Creating...") : (project ? "Save Changes" : "Add Project")}</button>
        </form>
      </div>
    </div>
  );
}