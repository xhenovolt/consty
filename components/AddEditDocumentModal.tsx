import React, { useState } from "react";
interface AddEditDocumentModalProps {
  document: any;
  projects: any[];
  onClose: () => void;
  onSave: (doc: any, file?: File | null) => void;
}
const AddEditDocumentModal: React.FC<AddEditDocumentModalProps> = ({ document, projects, onClose, onSave }) => {
  const [name, setName] = useState(document?.name || "");
  const [projectId, setProjectId] = useState(document?.project_id || "");
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          {document ? "Edit Document" : "Add Document"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ ...document, name, project_id: projectId }, file);
          }}
        >
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Document Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none mb-4"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Document Name (optional)"
          />
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Project
          </label>
          <select
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none mb-4"
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
          >
            <option value="">Select Project (optional)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            File
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none mb-4"
            required={!document}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold py-2 px-4 rounded-xl shadow"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white font-bold py-2 px-4 rounded-xl shadow"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddEditDocumentModal;
