import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface PayEmployeeModalProps {
  employee: any;
  remainingSalary: number | null;
  selectedMonth: string;
  canPay: boolean;
  onMonthChange: (month: string) => void;
  onClose: () => void;
  onPay: (employeeId: number, amount: number, month: string, projectId: number) => void;
}

const months = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

const PayEmployeeModal: React.FC<PayEmployeeModalProps> = ({ 
  employee, 
  remainingSalary, 
  selectedMonth, 
  canPay, 
  onMonthChange, 
  onClose, 
  onPay 
}) => {
  const [amount, setAmount] = useState(0);
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [validationError, setValidationError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the list of projects
    fetch("http://localhost/consty/api/projects.php")
      .then((res) => res.json())
      .then((data) => {
        console.log('Projects fetched:', data); // Debug log
        setProjects(data.projects || []);
      })
      .catch((error) => {
        console.error('Error fetching projects:', error); // Debug log
        setProjects([]);
      });
  }, []);

  useEffect(() => {
    if (selectedMonth && employee) {
      setLoading(true);
      // Fetch detailed payment information for the selected month
      fetch(`http://localhost/consty/api/get_payment_details.php?employee_id=${employee.id}&month=${selectedMonth}`)
        .then((res) => res.json())
        .then((data) => {
          console.log('Payment details response:', data); // Debug log
          setPaymentDetails(data);
          if (data.validation_error) {
            setValidationError(data.validation_error);
          } else {
            setValidationError("");
          }
        })
        .catch((error) => {
          console.error('Error fetching payment details:', error); // Debug log
          setPaymentDetails(null);
          setValidationError("Failed to load payment details");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedMonth, employee]);

  const handleMonthChange = (month: string) => {
    setAmount(0);
    setValidationError("");
    onMonthChange(month);
  };

  const handlePay = () => {
    if (!canPay) {
      setValidationError("Payment is not allowed for this month. Please check previous balances.");
      return;
    }

    if (amount < 1) {
      setValidationError("Payment amount must be at least 1.");
      return;
    }

    if (amount > (remainingSalary || 0)) {
      setValidationError(`Payment amount cannot exceed the remaining salary of $${remainingSalary?.toLocaleString()}.`);
      return;
    }

    if (!projectId) {
      setValidationError("Please select a project.");
      return;
    }

    setValidationError("");

    // Call the parent's onPay function
    onPay(employee.id, amount, selectedMonth, Number(projectId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Pay Employee</h2>
        
        {/* Employee Information */}
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <div className="font-semibold text-gray-800 dark:text-gray-100">{employee?.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Monthly Salary: USD {Number(employee?.salary).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Remaining for {selectedMonth || 'selected month'}: USD {remainingSalary !== null ? remainingSalary.toLocaleString() : "0.00"}
          </div>
        </div>

        {/* Month Selection */}
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
        <select
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none mb-4"
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
        >
          <option value="">Select Month</option>
          {months.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Payment Details */}
        {loading && (
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Loading payment details...</div>
          </div>
        )}

        {paymentDetails && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
            <div className="text-sm text-green-800 dark:text-green-200">
              <strong>Payment Status:</strong> {paymentDetails.status || 'Available for payment'}
            </div>
            {paymentDetails.previous_payments && paymentDetails.previous_payments.length > 0 && (
              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                Previous payments: ${paymentDetails.total_paid ? paymentDetails.total_paid.toLocaleString() : '0.00'}
                <br />
                <span className="text-xs">({paymentDetails.previous_payments.length} payment(s))</span>
              </div>
            )}
            {paymentDetails.has_unpaid_balance && (
              <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                <strong>Unpaid months:</strong> {paymentDetails.unpaid_months.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Amount Input */}
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Amount (USD)</label>
        <input
          type="number"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none mb-4"
          value={amount}
          min={1}
          max={remainingSalary || undefined}
          onChange={e => setAmount(Number(e.target.value))}
          placeholder="Enter payment amount"
          disabled={!canPay || !selectedMonth}
        />

        {/* Project Selection */}
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Project</label>
        <select
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 outline-none mb-4"
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          disabled={!canPay || !selectedMonth}
        >
          <option value="">Select Project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>

        {/* Validation Messages */}
        {!canPay && selectedMonth && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
            <div className="text-red-600 dark:text-red-400 text-sm font-medium">
              Payment blocked for {selectedMonth}
            </div>
            <div className="text-red-500 dark:text-red-300 text-xs mt-1">
              Please clear previous month balances before proceeding
            </div>
          </div>
        )}

        {validationError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
            <div className="text-red-600 dark:text-red-400 text-sm">{validationError}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold py-2 px-4 rounded-xl shadow transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`font-bold py-2 px-4 rounded-xl shadow transition ${
              canPay && amount >= 1 && selectedMonth && projectId && remainingSalary !== null
                ? "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white"
                : "bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed"
            }`}
            onClick={handlePay}
            disabled={!canPay || amount < 1 || !selectedMonth || !projectId || remainingSalary === null}
          >
            Pay ${amount.toLocaleString()}
          </button>
        </div>

        {/* Debug Information (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            <details>
              <summary>Debug Info</summary>
              <pre className="text-xs mt-2">
                {JSON.stringify({
                  canPay,
                  remainingSalary,
                  selectedMonth,
                  paymentDetails,
                  employee: employee?.name
                }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayEmployeeModal;
