"use client"
import React, { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import { useRouter } from "next/navigation";

interface Log {
  id: number;
  employee_id: number;
  status: string;
  changed_at: string;
  description?: string;
  employee_name?: string;
}
interface Employee { id:number; name:string; salary:number; project_id?:number|null; email?:string; phone?:string; }

export default function EmployeeLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'employees' | 'logs'>('employees');
  const [actionLoading, setActionLoading] = useState<number|null>(null);
  const [toast, setToast] = useState<{msg:string,type:'success'|'error'}|null>(null);

  const showToast = (msg:string,type:'success'|'error'='success')=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    fetch("http://localhost/consty/api/employee_logs.php")
      .then(res => res.json())
      .then(d => { setLogs(d.logs || []); setLoading(false); })
      .catch(e => { setError("Failed to load logs."); setLoading(false); });
  }, []);
  useEffect(() => {
    fetch('http://localhost/consty/api/employees.php')
      .then(r=>r.json()).then(d=>setEmployees(d.employees||[])).catch(()=>{});
  }, []);
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
      <div className="w-full max-w-5xl mx-auto py-8 px-2 md:px-0">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-6 flex items-center gap-4">Employee Management
          <div className="flex gap-2 text-sm">
            <button onClick={()=>setActiveTab('employees')} className={`px-4 py-2 rounded-lg font-semibold shadow ${activeTab==='employees'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>Employees</button>
            <button onClick={()=>setActiveTab('logs')} className={`px-4 py-2 rounded-lg font-semibold shadow ${activeTab==='logs'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>Logs</button>
          </div>
        </h1>
        {error && (
          <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow relative">
            <span>{error}</span>
          </div>
        )}
        {activeTab==='employees' && (
          <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900 mb-10">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-blue-50 dark:bg-blue-950">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length===0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No employees found.</td></tr>
                ) : employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                    <td className="px-6 py-4">{emp.id}</td>
                    <td className="px-6 py-4 font-semibold">{emp.name}</td>
                    <td className="px-6 py-4">{emp.project_id || '-'}</td>
                    <td className="px-6 py-4">{emp.email || '-'}</td>
                    <td className="px-6 py-4">{emp.phone || '-'}</td>
                    <td className="px-6 py-4 flex gap-2 justify-center">
                      <button disabled={actionLoading===emp.id} onClick={async()=>{ try { setActionLoading(emp.id); const r=await fetch('http://localhost/consty/api/employee_logs.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({employee_id:emp.id,status:'in',description:'Signed in'})}); if(!r.ok) throw new Error('Failed'); showToast(`Employee ${emp.name} signed in`,'success'); const d=await r.json().catch(()=>({})); } catch(e:any){ showToast(e.message||'Sign in failed','error'); } finally { setActionLoading(null); fetch('http://localhost/consty/api/employee_logs.php').then(r=>r.json()).then(d=>setLogs(d.logs||[])); } }} className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-1 px-3 rounded-lg text-xs shadow disabled:opacity-50">Sign In</button>
                      <button disabled={actionLoading===emp.id} onClick={async()=>{ try { setActionLoading(emp.id); const r=await fetch('http://localhost/consty/api/employee_logs.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({employee_id:emp.id,status:'out',description:'Signed out'})}); if(!r.ok) throw new Error('Failed'); showToast(`Employee ${emp.name} signed out`,'success'); await r.json().catch(()=>({})); } catch(e:any){ showToast(e.message||'Sign out failed','error'); } finally { setActionLoading(null); fetch('http://localhost/consty/api/employee_logs.php').then(r=>r.json()).then(d=>setLogs(d.logs||[])); } }} className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded-lg text-xs shadow disabled:opacity-50">Sign Out</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab==='logs' && (
          <div className="overflow-x-auto rounded-2xl shadow-lg bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between px-6 pt-6 mb-2">
              <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">Employee Logs</h2>
              <button onClick={()=>fetch('http://localhost/consty/api/employee_logs.php').then(r=>r.json()).then(d=>setLogs(d.logs||[]))} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-lg shadow">Refresh</button>
            </div>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-blue-50 dark:bg-blue-950">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Changed At</th>
                  <th className="px-6 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No logs found.</td></tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-blue-50 dark:hover:bg-blue-950 transition">
                      <td className="px-6 py-4">{log.employee_name || log.employee_id}</td>
                      <td className="px-6 py-4 capitalize">{log.status}</td>
                      <td className="px-6 py-4">{log.changed_at}</td>
                      <td className="px-6 py-4">{log.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {toast && (
  <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-semibold flex items-center gap-2 animate-fadeIn ${toast.type==='success'?'bg-green-600 text-white':'bg-red-600 text-white'}`}> 
    {toast.msg}
    <button onClick={()=>setToast(null)} className="ml-2 text-white/80 hover:text-white">&times;</button>
  </div>
)}
<style jsx global>{`
@keyframes fadeIn { from { opacity:0; transform: translateY(6px);} to { opacity:1; transform: translateY(0);} }
.animate-fadeIn { animation: fadeIn .3s ease; }
`}</style>
      </div>
    </RequireAuth>
  );
}