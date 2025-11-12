"use client";
import React, { useState, useEffect } from "react";

export default function EditProjectModal({ project, onClose, onSave }: { project: any; onClose: () => void; onSave: (updatedProject: any) => void }) {
  const [name, setName] = useState(project?.name || "");
  const [client, setClient] = useState(project?.client || "");
  const [budget, setBudget] = useState(project?.budget || "");
  const [location, setLocation] = useState(project?.location || "");
  const [startDate, setStartDate] = useState(project?.start_date || "");
  const [endDate, setEndDate] = useState(project?.end_date || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`http://localhost/consty/api/projects.php?id=${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, client, budget, location, start_date: startDate, end_date: endDate }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to update project.");
      return;
    }
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Edit Project</h2>
        {error && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Project Name"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Client"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={client}
            onChange={e => setClient(e.target.value)}
          />
          <input
            type="number"
            placeholder="Budget"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={budget}
            onChange={e => setBudget(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              type="date"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}