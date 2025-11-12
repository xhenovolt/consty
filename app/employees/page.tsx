"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import RequireAuth from "../../components/RequireAuth";
import PayEmployeeModal from "../../components/PayEmployeeModal";
import { Edit, Trash2, DollarSign } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const AddEditEmployeeModal = dynamic(() => import("../../components/AddEditEmployeeModal"), { ssr: false });

interface Employee {
  id: number;
  name: string;
  salary: number;
  email?: string;
  phone?: string;
  project_id?: number;
}

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [remainingSalary, setRemainingSalary] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // NEW: Track selected month
  const [canPay, setCanPay] = useState<boolean>(true); // NEW: Track if payment is allowed

  const fetchEmployees = () => {
    setLoading(true);
    fetch("http://localhost/consty/api/employees.php")
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || res.statusText || "Unknown error");
        }
        return res.json();
      })
      .then((d) => {
        setEmployees(d.employees || []);
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load employees. " + (e.message || ""));
        setLoading(false);
      });
  };

  useEffect(() => {
    const session = typeof window !== 'undefined' ? localStorage.getItem('session') : null;
    if (session) {
      try {
        const user = JSON.parse(session);
        setIsAdmin(!user.role || user.role === 'admin');
      } catch {}
    }
    fetchEmployees();
  }, []);

  useEffect(() => {
    let filtered = employees;
    if (searchTerm.trim()) {
      filtered = filtered.filter(emp =>
        Object.values(emp).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const handleAddEdit = () => {
    setShowModal(false);
    setEditEmployee(null);
    fetchEmployees();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this employee?")) {
      await fetch("http://localhost/consty/api/employees.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchEmployees();
    }
  };

  const handlePayEmployee = async (employeeId: number, amount: number, month: string, projectId: number) => {
    try {
      // Check for unpaid balances in the previous month
      const previousMonthRes = await fetch(`http://localhost/consty/api/check_previous_balance.php?employee_id=${employeeId}&month=${month}`);
      const previousMonthData = await previousMonthRes.json();

      console.log('Previous month check response:', previousMonthData); // Debug log

      if (!previousMonthRes.ok) {
        Swal.fire({
          title: "Error",
          text: previousMonthData.error || "Failed to check previous month balance",
          icon: "error",
          confirmButtonText: "OK",
          footer: `<small>API Response: ${JSON.stringify(previousMonthData)}</small>` // Show API response
        });
        return;
      }

      // Enhanced check with more detailed API response handling
      if (previousMonthData.has_balance || previousMonthData.unpaid_balance > 0) {
        const unpaidDetails = previousMonthData.unpaid_details || [];
        const unpaidMonthsList = unpaidDetails.length > 0 
          ? unpaidDetails.map((detail: any) => `${detail.month}: $${detail.amount}`).join(', ')
          : previousMonthData.unpaid_months || 'Previous month';
          
        Swal.fire({
          title: "Payment Blocked",
          html: `
            <p>Cannot pay for ${month}.</p>
            <p><strong>Unpaid months:</strong> ${unpaidMonthsList}</p>
            <p><strong>Total unpaid amount:</strong> $${previousMonthData.total_unpaid || 0}</p>
          `,
          icon: "error",
          confirmButtonText: "OK",
          footer: `<small>Please clear previous balances before proceeding</small>`
        });
        return;
      }

      // Proceed with payment if no balances in the previous month
      const res = await fetch("http://localhost/consty/api/pay_employee.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          amount,
          month,
          project_id: projectId,
        }),
      });
      const data = await res.json();

      console.log('Payment API response:', data); // Debug log

      if (data.success) {
        Swal.fire({
          title: "Payment Successful",
          html: `
            <p>Successfully paid <strong>$${amount.toFixed(2)}</strong> to ${selectedEmployee?.name}</p>
            <p><strong>Month:</strong> ${month}</p>
            <p><strong>Transaction ID:</strong> ${data.transaction_id || 'N/A'}</p>
            <p><strong>New balance:</strong> $${data.new_balance || 0}</p>
          `,
          icon: "success",
          confirmButtonText: "OK",
        });
        setShowPayModal(false);
        setSelectedEmployee(null);
        fetchEmployees();
        // Refresh remaining salary after payment
        if (selectedEmployee) {
          const remainingRes = await fetch(`http://localhost/consty/api/get_remaining_salary.php?employee_id=${selectedEmployee.id}`);
          const remainingData = await remainingRes.json();
          console.log('Updated remaining salary response:', remainingData); // Debug log
          setRemainingSalary(remainingData.remaining_salary || 0);
        }
      } else {
        Swal.fire({
          title: "Payment Failed",
          html: `
            <p><strong>Error:</strong> ${data.error || "An error occurred while processing the payment."}</p>
            <p><strong>Details:</strong> ${data.details || 'No additional details'}</p>
          `,
          icon: "error",
          confirmButtonText: "OK",
          footer: `<small>API Response: ${JSON.stringify(data)}</small>`
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error); // Debug log
      Swal.fire({
        title: "Network Error",
        text: "An error occurred while communicating with the server.",
        icon: "error",
        confirmButtonText: "OK",
        footer: `<small>Error: ${error.message}</small>`
      });
    }
  };

  const openPayModal = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowPayModal(true);
    try {
      const res = await fetch(`http://localhost/consty/api/get_remaining_salary.php?employee_id=${employee.id}&month=${new Date().toLocaleString('default', { month: 'long' })}`);
      const data = await res.json();
      console.log('Remaining salary response:', data); // Debug log
      
      if (res.ok && data.success !== false) {
        setRemainingSalary(data.remaining_salary || 0);
        // Display additional salary information if available
        if (data.salary_breakdown) {
          console.log('Salary breakdown:', data.salary_breakdown);
        }
      } else {
        setRemainingSalary(null);
        console.error('Failed to fetch remaining salary:', data.error);
      }
    } catch (error: any) {
      console.error('Error fetching remaining salary:', error); // Debug log
      setRemainingSalary(null);
    }
  };

  const handleMonthChange = async (month: string) => {
    setSelectedMonth(month);
    if (!selectedEmployee) return;

    try {
      const res = await fetch(`http://localhost/consty/api/check_previous_balance.php?employee_id=${selectedEmployee.id}&month=${month}&detailed=true`);
      const data = await res.json();

      console.log('Month change check response:', data); // Debug log

      if (!res.ok) {
        setCanPay(false);
        Swal.fire({
          title: "API Error",
          text: data.error || "An error occurred while checking the previous month's balance.",
          icon: "error",
          confirmButtonText: "OK",
          footer: `<small>Status: ${res.status} - ${res.statusText}</small>`
        });
        return;
      }

      if (data.has_balance || data.unpaid_balance > 0) {
        setCanPay(false);
        const unpaidDetails = data.unpaid_details || [];
        const detailedInfo = unpaidDetails.length > 0 
          ? unpaidDetails.map((detail: any) => `${detail.month}: $${detail.amount} (${detail.status})`).join('<br>')
          : data.unpaid_months || 'Previous month';
          
        Swal.fire({
          title: "Payment Validation",
          html: `
            <p>Cannot pay for <strong>${month}</strong></p>
            <div style="text-align: left; margin: 10px 0;">
              <strong>Unpaid balances:</strong><br>
              ${detailedInfo}
            </div>
            <p><strong>Total unpaid:</strong> $${data.total_unpaid || data.unpaid_balance || 0}</p>
          `,
          icon: "warning",
          confirmButtonText: "OK",
          footer: `<small>Clear previous balances to proceed with ${month} payment</small>`
        });
      } else {
        setCanPay(true);
        // Optionally show success message for valid month selection
        console.log(`Payment allowed for ${month}. No outstanding balances.`);
      }
    } catch (error: any) {
      console.error('Month change error:', error); // Debug log
      setCanPay(false);
      Swal.fire({
        title: "Connection Error",
        text: "Could not verify payment eligibility. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        footer: `<small>Network Error: ${error.message}</small>`
      });
    }
  };

  useEffect(() => {
    const session = typeof window !== "undefined" ? localStorage.getItem("session") : null;
    let isAdmin = false;
    if (session) {
      try {
        const user = JSON.parse(session);
        isAdmin = user.role === "admin";
      } catch {}
    }
    if (!isAdmin) {
      router.replace("/restricted");
    }
  }, [router]);

  return (
    <RequireAuth>
      <div className="w-full mx-auto py-8 px-2 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">Employees</h1>
          {isAdmin && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg"
              onClick={() => { setShowModal(true); setEditEmployee(null); }}
            >
              + Add Employee
            </button>
          )}
        </div>
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm px-6 py-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search employees..."
                className="px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 w-full focus:ring-2 focus:ring-blue-400 outline-none text-base"
                aria-label="Search employees"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
            </div>
          </div>
        </div>
        {error && (
          <div className="mb-6 flex items-center justify-between bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow relative animate-fadeIn">
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-4 text-xl font-bold leading-none hover:text-red-900">&times;</button>
          </div>
        )}
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
          <table className="table-auto w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-blue-50 dark:bg-blue-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/5">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/5">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/5">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/5">Salary</th>
                <th className="px-6 py-3 w-1/5">Updated At</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider w-1/5">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-blue-700 dark:text-blue-300">Loading...</td></tr>
              ) : filteredEmployees.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No employees found.</td></tr>
              ) : (
                filteredEmployees.map((e) => (
                  <tr key={e.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 break-words">{e.name}</td>
                    <td className="px-6 py-4 break-words">{e.email}</td>
                    <td className="px-6 py-4 break-words">{e.phone}</td>
                    <td className="px-6 py-4">{Number(e.salary).toFixed(2)}</td>
                    <td className="px-6 py-4">{e.updated_at || '-'}</td>
                    <td className="px-6 py-4 text-center flex gap-2 justify-center">
                      {isAdmin && (
                        <>
                          <button
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-bold p-2 rounded-lg text-xs shadow transition"
                            title="Edit"
                            onClick={() => { setEditEmployee(e); setShowModal(true); }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="bg-red-100 hover:bg-red-200 text-red-700 font-bold p-2 rounded-lg text-xs shadow transition"
                            title="Remove"
                            onClick={() => handleDelete(e.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded-xl shadow transition"
                        onClick={() => openPayModal(e)}
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <a
                        href={`/consty/salaries?employee_id=${e.id}`}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold p-2 rounded-lg text-xs shadow transition ml-2"
                        title="View Salary History"
                      >
                        <DollarSign className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showModal && isAdmin && (
          <Suspense fallback={null}>
            <AddEditEmployeeModal
              onClose={() => { setShowModal(false); setEditEmployee(null); }}
              onSave={handleAddEdit}
              employee={editEmployee}
            />
          </Suspense>
        )}
        {showPayModal && (
          <PayEmployeeModal
            employee={selectedEmployee}
            remainingSalary={remainingSalary}
            selectedMonth={selectedMonth} // Pass selected month to modal
            canPay={canPay} // Pass payment permission to modal
            onMonthChange={handleMonthChange} // Trigger month change handler
            onClose={() => { setShowPayModal(false); setSelectedEmployee(null); }}
            onPay={handlePayEmployee}
          />
        )}
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
    </RequireAuth>
  );
}
