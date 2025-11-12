import React, { useState, useEffect } from "react";
import { useApp } from "../../dashboard/page";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import { toast } from "react-toastify";

const ProjectFormModal = () => {
  const { state, actions } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    location: "",
    budget: "",
    start_date: "",
    end_date: "",
    status: "planning",
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.selectedItem && state.modals.editProject) {
      setFormData({
        name: state.selectedItem.name || "",
        client: state.selectedItem.client || "",
        location: state.selectedItem.location || "",
        budget: state.selectedItem.budget || "",
        start_date: state.selectedItem.start_date || "",
        end_date: state.selectedItem.end_date || "",
        status: state.selectedItem.status || "planning",
      });
    } else {
      setFormData({
        name: "",
        client: "",
        location: "",
        budget: "",
        start_date: "",
        end_date: "",
        status: "planning",
      });
    }
  }, [state.selectedItem, state.modals.editProject]);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (!formData.client.trim()) newErrors.client = "Client name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.budget || parseFloat(formData.budget) <= 0) newErrors.budget = "Valid budget is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (state.selectedItem) {
        await actions.updateProject(state.selectedItem.id, formData);
        toast.success("Project updated successfully!");
      } else {
        await actions.createProject(formData);
        toast.success("Project created successfully!");
      }
      actions.closeModal("createProject");
      actions.closeModal("editProject");
      setFormData({
        name: "",
        client: "",
        location: "",
        budget: "",
        start_date: "",
        end_date: "",
        status: "planning",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isOpen = state.modals.createProject || state.modals.editProject;
  const title = state.selectedItem ? "Edit Project" : "Add New Project";

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!loading) {
          actions.closeModal("createProject");
          actions.closeModal("editProject");
        }
      }}
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Project Name"
            value={formData.name}
            onChange={(value: string) => setFormData((prev) => ({ ...prev, name: value }))}
            required
            error={errors.name}
          />
          <FormField
            label="Client"
            value={formData.client}
            onChange={(value: string) => setFormData((prev) => ({ ...prev, client: value }))}
            required
            error={errors.client}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Location"
            value={formData.location}
            onChange={(value: string) => setFormData((prev) => ({ ...prev, location: value }))}
            required
            error={errors.location}
          />
          <FormField
            label="Budget (USD)"
            type="number"
            value={formData.budget}
            onChange={(value: string) => setFormData((prev) => ({ ...prev, budget: value }))}
            required
            error={errors.budget}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(value: string) => setFormData((prev) => ({ ...prev, start_date: value }))}
            required
            error={errors.start_date}
          />
          <FormField
            label="End Date"
            type="date"
            value={formData.end_date}
            onChange={(value: string) => setFormData((prev) => ({ ...prev, end_date: value }))}
            required
            error={errors.end_date}
          />
        </div>

        <FormField
          label="Status"
          type="select"
          value={formData.status}
          onChange={(value: string) => setFormData((prev) => ({ ...prev, status: value }))}
          options={[
            { value: "planning", label: "Planning" },
            { value: "ongoing", label: "Ongoing" },
            { value: "paused", label: "Paused" },
            { value: "completed", label: "Completed" },
          ]}
        />

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg transition"
          >
            {loading ? "Saving..." : state.selectedItem ? "Update Project" : "Add Project"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              actions.closeModal("createProject");
              actions.closeModal("editProject");
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectFormModal;
