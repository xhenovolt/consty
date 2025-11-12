"use client";
import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

const EditDocumentModal = dynamic(() => import("../../components/AddEditDocumentModal"), { ssr: false });
const DeleteDocumentModal = dynamic(() => import("../../components/DeleteDocumentModal"), { ssr: false });

interface Project {
  id: number;
  name: string;
}
interface Document {
  id: number;
  name: string;
  file_path: string;
  uploaded_at: string;
  updated_at: string;
  project_id: number;
  project_name?: string;
}

export default function DocumentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [filterProject, setFilterProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(documents);
  const [editDocument, setEditDocument] = useState<Document | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDocument, setDeleteDocument] = useState<Document | null>(null);

  useEffect(() => {
    fetch("http://localhost/consty/api/projects.php")
      .then(res => res.json())
      .then(d => setProjects(d.projects || []));
    fetch("http://localhost/consty/api/documents.php")
      .then(res => res.json())
      .then(d => setDocuments(d.documents || []));
  }, []);

  useEffect(() => {
    let filtered = documents;
    if (filterProject) {
      filtered = filtered.filter(doc => String(doc.project_id) === filterProject);
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter(doc =>
        Object.values(doc).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setFilteredDocuments(filtered);
  }, [documents, filterProject, searchTerm]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !docName || !selectedProject) return setError("All fields required");
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("name", docName);
    formData.append("project_id", selectedProject);
    formData.append("file", file);
    const res = await fetch("http://localhost/consty/api/documents.php", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.success) {
      setError(data.error || "Failed to upload document.");
      return;
    }
    setDocName("");
    setFile(null);
    setSelectedProject("");
    fetch("http://localhost/consty/api/documents.php")
      .then(res => res.json())
      .then(d => setDocuments(d.documents || []));
  };

  const handleDelete = async (id: number) => {
    setDeleteDocument(documents.find(doc => doc.id === id) || null);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!deleteDocument) return;
    setLoading(true);
    const res = await fetch(`http://localhost/consty/api/documents.php?id=${deleteDocument.id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    setLoading(false);
    setShowDeleteModal(false);
    setDeleteDocument(null);
    if (!res.ok || !data.success) {
      setError(data.error || "Failed to delete document.");
      return;
    }
    setDocuments(documents.filter(doc => doc.id !== deleteDocument.id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-2 md:px-0 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-0 md:mb-0">Documents</h1>
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none text-base"
              aria-label="Search documents"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-300 pointer-events-none">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </span>
          </div>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full md:w-auto">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="mt-4">
          <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-center w-full">
            <input type="text" value={docName} onChange={e => setDocName(e.target.value)} placeholder="Document Name" required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="">Select Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={e => setFile(e.target.files?.[0] || null)} required className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <button type="submit" disabled={loading} className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-bold px-6 py-2 rounded-xl shadow">{loading ? "Uploading..." : "Upload"}</button>
          </form>
        </div>
      </div>
      {error && <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 flex flex-col gap-2 cursor-pointer hover:ring-2 hover:ring-blue-400 transition">
            <div className="font-bold text-blue-700 dark:text-blue-300 text-lg truncate">
              <a
                href={`http://localhost/${doc.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                title="Open document"
                onClick={e => e.stopPropagation()}
              >
                {doc.name}
              </a>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Project: {doc.project_name || doc.project_id}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Uploaded: {new Date(doc.uploaded_at).toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Updated: {new Date(doc.updated_at).toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Type: {doc.file_path.split('.').pop()?.toUpperCase()}</div>
            <div className="px-6 py-4 text-center flex gap-2 justify-center">
              <button className="bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 font-bold py-1 px-3 rounded-lg text-xs shadow transition" title="Edit" onClick={e => { e.stopPropagation(); setEditDocument(doc); setShowModal(true); }}>Edit</button>
              <button className="bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 font-bold py-1 px-3 rounded-lg text-xs shadow transition" title="Delete" onClick={e => { e.stopPropagation(); handleDelete(doc.id); }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {viewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 animate-fadeIn"
          onClick={e => {
            if (e.target === e.currentTarget) setViewDoc(null);
          }}
          style={{ overflowY: 'auto' }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-3xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setViewDoc(null)} className="absolute top-4 right-4 text-2xl text-gray-400 dark:text-gray-300 hover:text-red-500">&times;</button>
            <h2 className="text-2xl font-bold mb-2 text-blue-700 dark:text-blue-300">{viewDoc.name}</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Project: {viewDoc.project_name || viewDoc.project_id}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">Uploaded: {new Date(viewDoc.uploaded_at).toLocaleString()}</div>
            {viewDoc.file_path.match(/\.(jpg|jpeg|png|webp)$/i) ? (
              <img src={`http://localhost/${viewDoc.file_path}`} alt={viewDoc.name} className="w-full h-auto rounded-xl border border-gray-300 dark:border-gray-700" />
            ) : (
              <iframe src={`http://localhost/${viewDoc.file_path}`} title={viewDoc.name} className="w-full h-[60vh] rounded-xl border border-gray-300 dark:border-gray-700" />
            )}
          </div>
        </div>
      )}
      {showModal && editDocument && (
        <Suspense fallback={null}>
          <EditDocumentModal
            document={editDocument}
            projects={projects}
            onClose={() => { setShowModal(false); setEditDocument(null); }}
            onSave={async (doc, file) => {
              setShowModal(false);
              setEditDocument(null);
              setLoading(true);
              let formData = new FormData();
              formData.append("edit", "1");
              formData.append("id", String(doc.id));
              if (doc.name && doc.name !== editDocument.name) formData.append("name", doc.name);
              if (doc.project_id && doc.project_id !== String(editDocument.project_id)) formData.append("project_id", doc.project_id);
              if (file) formData.append("file", file);
              const res = await fetch("http://localhost/consty/api/documents.php", {
                method: "POST",
                body: formData,
              });
              setLoading(false);
              fetch("http://localhost/consty/api/documents.php")
                .then(res => res.json())
                .then(d => setDocuments(d.documents || []));
            }}
          />
        </Suspense>
      )}
      {showDeleteModal && deleteDocument && (
        <Suspense fallback={null}>
          <DeleteDocumentModal
            document={deleteDocument}
            onClose={() => { setShowDeleteModal(false); setDeleteDocument(null); }}
            onDelete={confirmDelete}
            loading={loading}
          />
        </Suspense>
      )}
    </div>
  );
}
