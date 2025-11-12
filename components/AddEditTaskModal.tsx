"use client";

import React, { useState, useEffect } from "react";

interface AddEditTaskModalProps {
  onClose: () => void;
  onSave: (payload?: any) => void;
  task?: any;
  employees?: { id: number; name: string }[];
}

const AddEditTaskModal: React.FC<AddEditTaskModalProps> = ({ onClose, onSave, task, employees = [] }) => {
  const [name, setName] = useState(task?.name || "");
  const [projectId, setProjectId] = useState(task?.project_id || "");
  const [deadline, setDeadline] = useState(task?.deadline || "");
  const [status, setStatus] = useState(task?.status || "pending");
  const [assignedTo, setAssignedTo] = useState<string | number>(task?.assigned_to || "");
  const [priority, setPriority] = useState(task?.priority || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState("");

  useEffect(() => {
    setName(task?.name || "");
    setProjectId(task?.project_id || "");
    setDeadline(task?.deadline || "");
    setStatus(task?.status || "pending");
    setAssignedTo(task?.assigned_to || "");
    setSelectedProject(task?.project_id || "");
    setPriority(task?.priority || "");
  }, [task]);

  useEffect(() => {
    fetch("http://localhost/consty/api/project_list.php", { credentials: "include" })
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
    fetch("http://localhost/consty/api/users.php?action=list", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load users");
        return res.json();
      })
      .then((d) => {
        setUsers(d.users || []);
      })
      .catch(() => {
        setUsers([]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const method = task ? "PATCH" : "POST";
    const taskData = {
      name,
      project_id: selectedProject,
      assigned_to: Number(assignedTo) || null,
      deadline,
      priority,
      status,
      ...(task?.id ? { id: task.id } : {})
    };
    const res = await fetch("http://localhost/consty/api/tasks.php", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to save task.");
      return;
    }
    // Pass saved task back to parent so it can refresh and re-render action buttons.
    onSave(data.task || data);
    // Close modal after successful save so parent UI updates are visible immediately.
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">{task ? "Edit Task" : "Add Task"}</h2>
        {error && <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <select
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-blue-950 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            required
          >
            <option value="">Select Project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div>
            <label className="block text-sm font-semibold mb-1">Assign To (Employee)</label>
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(Number(e.target.value))} // Ensure the value is converted to a number
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-blue-950 border border-gray-300 dark:border-gray-700"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <input
            type="date"
            placeholder="Deadline"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
          <select
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-blue-950 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-blue-950 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none"
            value={priority}
            onChange={e => setPriority(e.target.value)}
            required
          >
            <option value="">Select Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (task ? "Saving..." : "Adding...") : (task ? "Save Changes" : "Add Task")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddEditTaskModal;
