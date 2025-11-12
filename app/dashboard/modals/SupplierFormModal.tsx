import React, { useState, useEffect } from "react";
import { useApp } from "../../dashboard/page";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

const SupplierFormModal = () => {
  const { state, actions } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    address: ""
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.selectedItem && state.modals.editSupplier) {
      setFormData({
        name: state.selectedItem.name || "",
        contact_email: state.selectedItem.contact_email || "",
        contact_phone: state.selectedItem.contact_phone || "",
        address: state.selectedItem.address || ""
      });
    } else {
      setFormData({
        name: "",
        contact_email: "",
        contact_phone: "",
        address: ""
      });
    }
  }, [state.selectedItem, state.modals.editSupplier]);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Supplier name is required";
    if (!formData.contact_email.trim()) newErrors.contact_email = "Email is required";
    if (!formData.contact_phone.trim()) newErrors.contact_phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (state.selectedItem) {
        await actions.updateSupplier(state.selectedItem.id, formData);
      } else {
        await actions.createSupplier(formData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isOpen = state.modals.createSupplier || state.modals.editSupplier;
  const title = state.selectedItem ? "Edit Supplier" : "Add New Supplier";

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        actions.closeModal("createSupplier");
        actions.closeModal("editSupplier");
      }}
      title={title}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Supplier Name"
          value={formData.name}
          onChange={(value: string) => setFormData((prev) => ({ ...prev, name: value }))}
          required
          error={errors.name}
        />
        <FormField
          label="Contact Email"
          value={formData.contact_email}
          onChange={(value: string) => setFormData((prev) => ({ ...prev, contact_email: value }))}
          required
          error={errors.contact_email}
        />
        <FormField
          label="Contact Phone"
          value={formData.contact_phone}
          onChange={(value: string) => setFormData((prev) => ({ ...prev, contact_phone: value }))}
          required
          error={errors.contact_phone}
        />
        <FormField
          label="Address"
          value={formData.address}
          onChange={(value: string) => setFormData((prev) => ({ ...prev, address: value }))}
          required
          error={errors.address}
        />
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg transition"
          >
            {loading ? "Saving..." : state.selectedItem ? "Update Supplier" : "Add Supplier"}
          </button>
          <button
            type="button"
            onClick={() => {
              actions.closeModal("createSupplier");
              actions.closeModal("editSupplier");
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

export default SupplierFormModal;
