"use client";
import React, { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  photo?: string;
}
interface Project {
  id: number;
  name: string;
}
interface TeamMember {
  id: number;
  project_id: number;
  user_id: number;
  username: string;
  project_name: string;
}

export default function TeamMembersManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost/consty/api/projects.php")
      .then(res => res.json())
      .then(d => setProjects(d.projects || []));
    fetch("http://localhost/consty/api/users.php")
      .then(res => res.json())
      .then(d => setUsers(d.users || []));
    fetch("http://localhost/consty/api/team_members.php")
      .then(res => res.json())
      .then(d => setTeamMembers(d.team_members || []));
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("http://localhost/consty/api/team_members.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: selectedProject, user_id: selectedUser })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.success) {
      setError(data.error || "Failed to assign team member.");
      return;
    }
    // Refresh team members list
    fetch("http://localhost/consty/api/team_members.php")
      .then(res => res.json())
      .then(d => setTeamMembers(d.team_members || []));
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-2 md:px-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mb-6">Assign Team Members to Projects</h2>
      <form onSubmit={handleAssign} className="flex gap-4 mb-8">
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
          <option value="">Select Project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
          <option value="">Select User</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
        </select>
        <button type="submit" disabled={loading} className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-bold px-6 py-2 rounded-xl shadow">{loading ? "Assigning..." : "Assign"}</button>
      </form>
      {error && <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg">{error}</div>}
      <h3 className="text-xl font-bold mb-4">Current Team Members</h3>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-blue-50 dark:bg-blue-950">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Username</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Project</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
          {teamMembers.map(tm => (
            <tr key={tm.id}>
              <td className="px-6 py-4">{tm.username}</td>
              <td className="px-6 py-4">{tm.project_name}</td>
              <td className="px-6 py-4 text-center">
                <button
                  className="bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 font-bold py-1 px-3 rounded-lg text-xs shadow transition"
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    // Example edit: assign to a different project
                    const newProjectId = prompt("Enter new project ID for this user:", tm.project_id);
                    if (newProjectId && newProjectId !== tm.project_id) {
                      await fetch("http://localhost/consty/api/team_members.php", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: tm.id, project_id: newProjectId })
                      });
                      fetch("http://localhost/consty/api/team_members.php")
                        .then(res => res.json())
                        .then(d => setTeamMembers(d.team_members || []));
                    }
                    setLoading(false);
                  }}
                  disabled={loading}
                >Edit</button>
                <button
                  className="bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 font-bold py-1 px-3 rounded-lg text-xs shadow transition"
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    await fetch("http://localhost/consty/api/team_members.php", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: tm.id })
                    });
                    fetch("http://localhost/consty/api/team_members.php")
                      .then(res => res.json())
                      .then(d => setTeamMembers(d.team_members || []));
                    setLoading(false);
                  }}
                  disabled={loading}
                >Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
