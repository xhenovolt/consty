"use client"
import React, { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";

interface Log {
  id: number;
  project_id: number;
  status: string;
  changed_at: string;
  description?: string;
}

interface Project {
  id: number;
  name: string;
}

export default function ProjectLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost/consty/api/project_logs.php")
      .then(res => res.json())
      .then(d => { setLogs(d.logs || []); setLoading(false); })
      .catch(e => { setError("Failed to load logs."); setLoading(false); });

    fetch("http://localhost/consty/api/projects.php")
      .then(res => res.json())
      .then(d => setProjects(d.projects || []))
      .catch(() => {});
  }, []);

  return (
    <RequireAuth>
      <div className="w-full max-w-5xl mx-auto py-8 px-2 md:px-0">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-6">Project Logs</h1>
        {error && (
          <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow relative">
            <span>{error}</span>
          </div>
        )}
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-blue-50 dark:bg-blue-950">
              <tr>
                <th className="px-6 py-3">Project Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Changed At</th>
                <th className="px-6 py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No logs found.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td className="px-6 py-4">{projects.find(p => p.id === log.project_id)?.name || log.project_id}</td>
                    <td className="px-6 py-4">{log.status}</td>
                    <td className="px-6 py-4">{log.changed_at}</td>
                    <td className="px-6 py-4">{log.description || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RequireAuth>
  );
}