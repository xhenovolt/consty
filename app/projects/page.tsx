"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import RequireAuth from "../../components/RequireAuth";
import { Edit, Trash2, RefreshCw, StopCircle, Info } from "lucide-react";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PROJECT_STATUSES } from "../../constants/projectStatuses"; // Import from the new file

const AddEditProjectModal = dynamic(() => import("../../components/AddEditProjectModal"), { ssr: false });
const AddEditMaterialModal = dynamic(() => import("../../components/AddEditMaterialModal"), { ssr: false });
const AddEditMachineModal = dynamic(() => import("../../components/AddEditMachineModal"), { ssr: false });

interface Project {
  id: number;
  name: string;
  client: string;
  budget: number;
  location: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

interface ProjectDetails {
  project: Project;
  progress: number;
  team_members: { id: number; username: string }[];
  tasks: { id: number; name: string; status: string }[];
  documents: { id: number; name: string; file_path: string }[];
  expenses: { id: number; amount: number; description: string; spent_at: string }[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailsModal, setDetailsModal] = useState(false);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'tasks' | 'documents' | 'expenses'>('overview');
  // Add supplier fetching and state
  const [suppliers, setSuppliers] = useState<{id:number; name:string;}[]>([]);

  const fetchProjects = () => {
    setLoading(true);
    fetch("http://localhost/consty/api/projects.php")
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText || "Unknown error");
        }
        return res.json();
      })
      .then((d) => {
        setProjects(d.projects || []);
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load projects. " + (e.message || ""));
        setLoading(false);
      });
  };

  const fetchProjectDetails = async (id: number) => {
    setDetailsModal(true);
    setProjectDetails(null);
    try {
      const res = await fetch(`http://localhost/consty/api/project_details.php?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch project details");
      const data = await res.json();
      setProjectDetails(data);
    } catch (e) {
      setError("Failed to load project details.");
    }
  };

  const fetchSuppliers = () => {
    fetch("http://localhost/consty/api/suppliers.php")
      .then(res => res.json())
      .then(d => setSuppliers(d.suppliers || []))
      .catch(() => setSuppliers([]));
  };

  useEffect(() => {
    const session = typeof window !== 'undefined' ? localStorage.getItem('session') : null;
    if (session) {
      try {
        const user = JSON.parse(session);
        setIsAdmin(!user.role || user.role === 'admin');
      } catch {}
    }
    fetchProjects();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    let filtered = projects.filter(project => {
      // Search by any field
      const searchMatch = Object.values(project).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
      // Status filter - expanded options
      let statusMatch = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'paused') {
          statusMatch = project.status === 'paused' || project.status === 'pending' || project.status === 'on_hold';
        } else {
          statusMatch = project.status === statusFilter;
        }
      }
      return searchMatch && statusMatch;
    });
    setFilteredProjects(filtered);
  }, [searchTerm, statusFilter, projects]);

  const handleAddEdit = (project: Project) => {
    setShowModal(false);
    setEditProject(null);
    fetchProjects(); // Refresh the project list after saving
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this project?')) {
      const res = await fetch('http://localhost/consty/api/projects.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      // Use backend feedback
      let msg = "Project deleted successfully";
      try {
        const data = await res.json();
        msg = data?.message || data?.success || data?.error || msg;
        if (!res.ok) throw new Error(msg);
      } catch (e: any) {
        if (!res.ok) throw new Error(msg);
      }
      alert(msg);
      fetchProjects();
    }
  };

  const handleStatusChange = async (id: number, actionOverride?: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      try {
        const requestBody = { id };
        if (actionOverride === 'stop') {
          requestBody['stop'] = true; // Indicate that the "Stop" button was clicked
        }

        console.log(`Sending status change request:`, requestBody);
        const response = await fetch('http://localhost/consty/api/update_project_status.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        const responseData = await response.json();
        console.log('API Response:', responseData);
        if (!response.ok) {
          throw new Error(responseData.error || "Failed to update project status");
        }

        // Notify the user about the status change
        toast.success(responseData.message || "Project status updated.");
        fetchProjects(); // Refresh the project list after status change
      } catch (error) {
        console.error("Error updating project status:", error);
        toast.error("Failed to update project status. " + error.message);
      }
    }
  };

  return (
    <div>
      <div className="w-full mx-auto py-8 px-2 md:px-0">
        <RequireAuth />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">Projects</h1>
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg"
                  onClick={() => { setShowModal(true); setEditProject(null); }}
                >
                  + Add Project
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg"
                  onClick={() => window.location.href = "/consty/suppliers"}
                >
                  Suppliers
                </button>
              </>
            )}
          </div>
        </div>
        {error && (
          <div className="mb-6 flex items-center justify-between bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow relative animate-fadeIn">
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-4 text-xl font-bold leading-none hover:text-red-900">&times;</button>
          </div>
        )}
        {/* Enhanced Search and Filter Section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search projects..."
            className="border rounded-lg px-4 py-2 w-full md:w-1/3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full md:w-1/3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="paused">Paused/On Hold</option>
            <option value="review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="ended">Ended</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {/* Deadline filter */}
          <input
            type="date"
            className="border rounded-lg px-4 py-2 w-full md:w-1/3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            placeholder="Filter by deadline"
            onChange={e => {
              const date = e.target.value;
              setFilteredProjects(projects.filter(p => !date || p.end_date === date));
            }}
          />
        </div>
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
          <table className="table-auto w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-blue-50 dark:bg-blue-950">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/6">Name</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/6">Client</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/6">Budget</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/6">Location</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/6">Status</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/6">Start Date</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/6">End Date</th>
                {/* <th className="px-2 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/6">Deadline</th> */}
                <th className="px-2 py-3 w-1/6">Updated At</th>
                <th className="px-2 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={10} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading...</td></tr>
              ) : filteredProjects.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-gray-400">No projects found.</td></tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                    <td className="px-2 py-4 font-semibold text-gray-900 dark:text-gray-100 break-words">{p.name}</td>
                    <td className="px-2 py-4 break-words">{p.client}</td>
                    <td className="px-2 py-4">{p.budget}</td>
                    <td className="px-2 py-4 break-words">{p.location}</td>
                    <td className="px-2 py-4">{p.status}</td>
                    <td className="px-2 py-4">{p.start_date}</td>
                    <td className="px-2 py-4">{p.end_date}</td>
                    <td className="px-2 py-4">{p.end_date ? new Date(p.end_date).toLocaleDateString() : '-'}</td>
                    {/* <td className="px-2 py-4">{p.updated_at || '-'}</td> */}
                    <td className="px-2 py-4 text-center flex gap-2 justify-center">
                          <button
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold p-2 rounded-lg text-xs shadow transition"
                            title="Edit Project"
                            onClick={() => { setEditProject(p); setShowModal(true); }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                      {isAdmin && p.status !== 'ended' && (
                        <>
                          <button
                            className="bg-red-100 hover:bg-red-200 text-red-700 font-bold p-2 rounded-lg text-xs shadow transition"
                            title="Remove Project" 
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-xl shadow transition"
                            title="Change Project Status"
                            onClick={() => handleStatusChange(p.id)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold p-2 rounded-xl shadow transition"
                            title="Stop Project"
                            onClick={() => handleStatusChange(p.id, 'stop')}
                          >
                            <StopCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold p-2 rounded-lg text-xs shadow"
                        onClick={() => fetchProjectDetails(p.id)}
                        title="View Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showModal && isAdmin && (
          <Suspense fallback={null}>
            <AddEditProjectModal
              onClose={() => { setShowModal(false); setEditProject(null); }}
              onSave={(project) => handleAddEdit(project)}
              project={editProject}
              statusOptions={PROJECT_STATUSES}
              suppliers={suppliers}
            />
          </Suspense>
        )}
        {/* Example for materials and machines modals */}
        {/* 
        <Suspense fallback={null}>
          <AddEditMaterialModal
            onClose={...}
            onSave={...}
            material={...}
            suppliers={suppliers}
          />
        </Suspense>
        <Suspense fallback={null}>
          <AddEditMachineModal
            onClose={...}
            onSave={...}
            machine={...}
            suppliers={suppliers}
          />
        </Suspense>
        */}
        {detailsModal && projectDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-3xl">
              <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">{projectDetails.project.name}</h2>
              <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button
                  className={`px-4 py-2 font-semibold ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-4 py-2 font-semibold ${activeTab === 'team' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
                  onClick={() => setActiveTab('team')}
                >
                  Team Members
                </button>
                <button
                  className={`px-4 py-2 font-semibold ${activeTab === 'tasks' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
                  onClick={() => setActiveTab('tasks')}
                >
                  Tasks
                </button>
                <button
                  className={`px-4 py-2 font-semibold ${activeTab === 'documents' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
                  onClick={() => setActiveTab('documents')}
                >
                  Documents
                </button>
                <button
                  className={`px-4 py-2 font-semibold ${activeTab === 'expenses' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
                  onClick={() => setActiveTab('expenses')}
                >
                  Expenses
                </button>
              </div>
              <div className="overflow-y-auto max-h-96">
                {activeTab === 'overview' && (
                  <div>
                    <p><strong>Client:</strong> {projectDetails.project.client}</p>
                    <p><strong>Budget:</strong> {projectDetails.project.budget}</p>
                    <p><strong>Progress:</strong> {projectDetails.progress.toFixed(2)}%</p>
                    <p><strong>Status:</strong> {projectDetails.project.status}</p>
                    <p><strong>Deadline:</strong> {projectDetails.project.end_date ? new Date(projectDetails.project.end_date).toLocaleDateString() : '-'}</p>
                    {/* Show suppliers used in this project if available */}
                    {projectDetails.project.suppliers && (
                      <p><strong>Suppliers:</strong> {Array.isArray(projectDetails.project.suppliers)
                        ? projectDetails.project.suppliers.map((s:any) => s.name).join(', ')
                        : projectDetails.project.suppliers}
                      </p>
                    )}
                  </div>
                )}
                {activeTab === 'team' && (
                  <ul>
                    {projectDetails.team_members.map((member) => (
                      <li key={member.id}>{member.username}</li>
                    ))}
                  </ul>
                )}
                {activeTab === 'tasks' && (
                  <ul>
                    {projectDetails.tasks.map((task) => (
                      <li key={task.id}>{task.name} - {task.status}</li>
                    ))}
                  </ul>
                )}
                {activeTab === 'documents' && (
                  <ul>
                    {projectDetails.documents.map((doc) => (
                      <li key={doc.id}>{doc.name}</li>
                    ))}
                  </ul>
                )}
                {activeTab === 'expenses' && (
                  <ul>
                    {projectDetails.expenses.map((expense) => (
                      <li key={expense.id}>
                        <strong>USD {expense.amount.toLocaleString()}</strong> - {expense.description} ({new Date(expense.spent_at).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl shadow"
                onClick={() => setDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease;
          }
        `}</style>
      </div>
    </div>
  );
}

