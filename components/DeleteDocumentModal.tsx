import React from "react";
interface DeleteDocumentModalProps {
  document: any;
  onClose: () => void;
  onDelete: () => void;
  loading?: boolean;
}
const DeleteDocumentModal: React.FC<DeleteDocumentModalProps> = ({ document, onClose, onDelete, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80">
    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Confirm Delete</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Are you sure you want to delete the document <span className="font-semibold text-gray-800 dark:text-gray-100">{document?.name}</span>?</p>
      <div className="flex justify-end gap-2">
        <button type="button" className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold py-2 px-4 rounded-xl shadow" onClick={onClose}>Cancel</button>
        <button type="button" className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-400 text-white font-bold py-2 px-4 rounded-xl shadow" onClick={onDelete} disabled={loading}>{loading ? "Deleting..." : "Delete"}</button>
      </div>
    </div>
  </div>
);
export default DeleteDocumentModal;
