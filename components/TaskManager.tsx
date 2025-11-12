"use client";
import React, { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
}
interface Project {
  id: number;
  name: string;
}
interface Task {
  id: number;
  name: string;
  project_id: number;
  assigned_to: number;
  deadline: string;
  priority: string;
  status: string;
  username?: string;
}

export default function TaskManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [taskName, setTaskName] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetch("http://localhost/consty/api/projects.php")
      .then(res => res.json())
      .then(d => setProjects(d.projects || []));
    fetch("http://localhost/consty/api/users.php")
      .then(res => res.json())
      .then(d => setUsers(d.users || []));
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetch(`http://localhost/consty/api/tasks.php?project_id=${selectedProject}`)
        .then(res => res.json())
        .then(d => setTasks(d.tasks || []));
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("http://localhost/consty/api/tasks.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: taskName,
        project_id: selectedProject,
        assigned_to: assignedTo,
        deadline,
        priority,
        status
      })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.success) {
      setError(data.error || "Failed to add task.");
      return;
    }
    // Refresh tasks
    fetch(`http://localhost/consty/api/tasks.php?project_id=${selectedProject}`)
      .then(res => res.json())
      .then(d => setTasks(d.tasks || []));
    setTaskName("");
    setAssignedTo("");
    setDeadline("");
    setPriority("");
    setStatus("pending");
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    setEditLoading(true);
    setEditError("");
    const res = await fetch("http://localhost/consty/api/tasks.php", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editTask.id,
        name: editTask.name,
        assigned_to: editTask.assigned_to,
        deadline: editTask.deadline,
        priority: editTask.priority,
        status: editTask.status
      })
    });
    const data = await res.json();
    setEditLoading(false);
    if (!res.ok || !data.success) {
      setEditError(data.error || "Failed to update task.");
      return;
    }
    fetch(`http://localhost/consty/api/tasks.php?project_id=${selectedProject}`)
      .then(res => res.json())
      .then(d => setTasks(d.tasks || []));
    setEditTask(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-2 md:px-0">
      <h2 className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mb-6">Task & Schedule Management</h2>
      <form onSubmit={handleAddTask} className="flex flex-col gap-4 mb-8">
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">
          <option value="">Select Project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="Task Name" required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" />
        <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">
          <option value="">Assign to User</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
        </select>
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" />
        <select value={priority} onChange={e => setPriority(e.target.value)} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">
          <option value="">Select Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">
          <option value="pending">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow">{loading ? "Adding..." : "Add Task"}</button>
      </form>
      {error && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
      <h3 className="text-xl font-bold mb-4">Tasks for Selected Project</h3>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-blue-50 dark:bg-blue-950">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Task Name</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Assigned To</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Deadline</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Priority</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
          {tasks.map(t => (
            <tr key={t.id}>
              <td className="px-6 py-4">{t.name}</td>
              <td className="px-6 py-4">{t.assigned_username || '-'}</td>
              <td className="px-6 py-4">{t.deadline}</td>
              <td className="px-6 py-4">{t.priority}</td>
              <td className="px-6 py-4">{t.status}</td>
              <td className="px-6 py-4 text-center">
                <button
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition"
                  onClick={() => setEditTask(t)}
                  disabled={loading}
                >Edit</button>
                <button
                  className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded-lg text-xs shadow transition"
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    await fetch("http://localhost/consty/api/tasks.php", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: t.id })
                    });
                    fetch(`http://localhost/consty/api/tasks.php?project_id=${selectedProject}`)
                      .then(res => res.json())
                      .then(d => setTasks(d.tasks || []));
                    setLoading(false);
                  }}
                  disabled={loading}
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={() => setEditTask(null)} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
            <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">Edit Task</h2>
            {editError && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">{editError}</div>}
            <form onSubmit={handleEditTask} className="flex flex-col gap-4">
              <input type="text" value={editTask.name} onChange={e => setEditTask({ ...editTask, name: e.target.value })} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" />
              <select value={editTask.assigned_to} onChange={e => setEditTask({ ...editTask, assigned_to: Number(e.target.value) })} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">
                <option value="">Assign to User</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
              <input type="date" value={editTask.deadline || ""} onChange={e => setEditTask({ ...editTask, deadline: e.target.value })} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700" />
              <select value={editTask.priority} onChange={e => setEditTask({ ...editTask, priority: e.target.value })} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select value={editTask.status} onChange={e => setEditTask({ ...editTask, status: e.target.value })} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">
                <option value="pending">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <button type="submit" disabled={editLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow">{editLoading ? "Saving..." : "Save Changes"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
