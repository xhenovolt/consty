"use client";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import RequireAuth from "../../components/RequireAuth";
import dynamic from "next/dynamic";
import { 
  FileText, 
  Download, 
  Calendar, 
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Users,
  Building,
  DollarSign,
  Package,
  Settings,
  Eye
} from "lucide-react";

// Dynamic imports with loading states
const PieChart = dynamic(() => import("../../components/PieChart"), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
});
const BarChart = dynamic(() => import("../../components/BarChart"), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
});
const LineChart = dynamic(() => import("../../components/LineChart"), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
});

interface ReportData {
  metrics: Record<string, number>;
  users: any[];
  projects: any[];
  team_members: any[];
  tasks: any[];
  documents: any[];
  materials: any[];
  materials_log: any[];
  machines: any[];
  machines_log: any[];
  architects: any[];
  employees: any[];
  working_hours: any[];
  budget_categories: any[];
  expenses: any[];
  project_budget: any[];
  salaries: any[];
  expense_categories: any[];
  project_logs: any[];
  task_logs: any[];
  architect_logs: any[];
  employee_logs: any[];
  machine_logs: any[];
  material_logs: any[];
  expense_logs: any[];
  salary_logs: any[];
}

export default function ReportsPage() {
  const [range, setRange] = useState("today");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'detailed'>('overview');
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized API URL
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams({ range });
    if (range === "custom" && start && end) {
      params.set("start", start);
      params.set("end", end);
    }
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost/consty/api'}/reports.php?${params.toString()}`;
  }, [range, start, end]);

  // Optimized load function with useCallback
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const json = await res.json();
      
      if (!json.success) {
        throw new Error(json.error || "Failed to load report data");
      }
      
      setData(json);
      setLastUpdated(new Date());
    } catch (e: any) {
      console.error('Report loading error:', e);
      setError(e.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Enhanced export function with proper file generation
  const exportData = useCallback(async (format: "csv" | "excel" | "pdf") => {
    if (!data) return;
    
    setExportLoading(format);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `construction-report-${range}-${timestamp}`;
      
      switch (format) {
        case 'csv':
          await exportToCSV(data, filename);
          break;
        case 'excel':
          await exportToExcel(data, filename);
          break;
        case 'pdf':
          await exportToPDF(data, filename);
          break;
      }
    } catch (error) {
      console.error(`Export to ${format} failed:`, error);
      setError(`Failed to export ${format.toUpperCase()} file`);
    } finally {
      setExportLoading(null);
    }
  }, [data, range]);

  // CSV Export Function
  const exportToCSV = async (reportData: ReportData, filename: string) => {
    const csvContent = generateCSVContent(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${filename}.csv`);
  };

  // Excel Export Function (using HTML table format that Excel can open)
  const exportToExcel = async (reportData: ReportData, filename: string) => {
    const htmlContent = generateExcelHTML(reportData);
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    downloadFile(blob, `${filename}.xls`);
  };

  // PDF Export Function (using HTML to PDF approach)
  const exportToPDF = async (reportData: ReportData, filename: string) => {
    const htmlContent = generatePDFHTML(reportData);
    
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Trigger print dialog
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  // Helper function to download files
  const downloadFile = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Generate CSV content
  const generateCSVContent = (reportData: ReportData): string => {
    let csv = 'Construction Management System Report\n\n';
    csv += `Report Period: ${range}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    // Users Summary
    csv += 'USERS SUMMARY\n';
    csv += 'ID,Username,Email,Role,Projects Involved,Tasks Assigned\n';
    (reportData.users || []).forEach(user => {
      csv += `${user.id},"${user.username}","${user.email}","${user.role || 'User'}",${user.projects_involved || 0},${user.tasks_assigned || 0}\n`;
    });
    
    csv += '\n';
    
    // Projects Summary
    csv += 'PROJECTS SUMMARY\n';
    csv += 'ID,Name,Client,Budget,Status,Location,Team Size,Tasks\n';
    (reportData.projects || []).forEach(project => {
      csv += `${project.id},"${project.name}","${project.client}",${project.budget || 0},"${project.status}","${project.location || ''}",${project.team_size || 0},${project.total_tasks || 0}\n`;
    });
    
    csv += '\n';
    
    // Materials Summary
    csv += 'MATERIALS SUMMARY\n';
    csv += 'ID,Name,Quantity,Unit Price,Used,Damaged,Remaining\n';
    (reportData.materials || []).forEach(material => {
      csv += `${material.id},"${material.name}",${material.quantity},${material.unit_price},${material.used || 0},${material.damaged || 0},${material.remaining || 0}\n`;
    });
    
    csv += '\n';
    
    // Expenses Summary
    csv += 'EXPENSES SUMMARY\n';
    csv += 'ID,Amount,Description,Project,Category,Date\n';
    (reportData.expenses || []).forEach(expense => {
      csv += `${expense.id},${expense.amount},"${expense.description}","${expense.project_name || ''}","${expense.category_name || ''}","${expense.spent_at}"\n`;
    });
    
    return csv;
  };

  // Generate Excel HTML
  const generateExcelHTML = (reportData: ReportData): string => {
    return `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Construction Report</title>
          <style>
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1, h2 { color: #2563eb; }
          </style>
        </head>
        <body>
          <h1>Construction Management System Report</h1>
          <p><strong>Period:</strong> ${range}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          
          <h2>Projects Summary</h2>
          <table>
            <tr><th>Name</th><th>Client</th><th>Budget</th><th>Status</th><th>Location</th></tr>
            ${(reportData.projects || []).map(project => 
              `<tr><td>${project.name}</td><td>${project.client}</td><td>USD ${Number(project.budget || 0).toLocaleString()}</td><td>${project.status}</td><td>${project.location || ''}</td></tr>`
            ).join('')}
          </table>
          
          <h2>Materials Summary</h2>
          <table>
            <tr><th>Material</th><th>Quantity</th><th>Used</th><th>Price</th></tr>
            ${(reportData.materials || []).map(material => 
              `<tr><td>${material.name}</td><td>${material.quantity}</td><td>${material.used || 0}</td><td>USD ${Number(material.unit_price || 0).toLocaleString()}</td></tr>`
            ).join('')}
          </table>
          
          <h2>Recent Expenses</h2>
          <table>
            <tr><th>Amount</th><th>Description</th><th>Date</th></tr>
            ${(reportData.expenses || []).slice(0, 20).map(expense => 
              `<tr><td>USD ${Number(expense.amount || 0).toLocaleString()}</td><td>${expense.description}</td><td>${new Date(expense.spent_at).toLocaleDateString()}</td></tr>`
            ).join('')}
          </table>
        </body>
      </html>
    `;
  };

  // Generate PDF HTML
  const generatePDFHTML = (reportData: ReportData): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Construction Report - ${range}</title>
          <style>
            @media print {
              body { margin: 0; font-family: Arial, sans-serif; }
              .no-print { display: none; }
            }
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { color: #2563eb; text-align: center; }
            h2 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
            .summary { background-color: #f8f9fa; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Construction Management System Report</h1>
          <div class="summary">
            <p><strong>Report Period:</strong> ${range}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Users:</strong> ${(reportData.users || []).length}</p>
            <p><strong>Total Projects:</strong> ${(reportData.projects || []).length}</p>
            <p><strong>Total Materials:</strong> ${(reportData.materials || []).length}</p>
            <p><strong>Total Expenses:</strong> USD ${(reportData.expenses?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0).toLocaleString()}</p>
          </div>
          
          ${generateExcelHTML(reportData).replace(/<html>.*<body>/s, '').replace(/<\/body>.*<\/html>/s, '')}
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Report</button>
          </div>
        </body>
      </html>
    `;
  };

  // Setup auto-refresh with cleanup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(load, refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, load]);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const MetricCard = ({ title, value, icon: Icon, color, description }: any) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${color}`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white bg-opacity-10"></div>
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && <p className="text-xs opacity-75 mt-1">{description}</p>}
          </div>
          <div className="p-3 rounded-full bg-white bg-opacity-20">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, icon: Icon }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-500" />
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  if (loading && !data) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading Comprehensive Reports...</p>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (error && !data) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
          <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={load}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Retry Loading Reports
            </button>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  Comprehensive Reports
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Real-time analytics and detailed insights into your construction operations
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Activity className="h-4 w-4" />
                <span>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Controls Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Time Range Controls */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Report Period
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last_7_days">Last 7 Days</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  {range === "custom" && (
                    <>
                      <input
                        type="date"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="date"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                      />
                    </>
                  )}
                  <button
                    onClick={load}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-lg transition flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? "Loading..." : "Refresh"}
                  </button>
                </div>
              </div>

              {/* View Controls */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  View Options
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                    <button
                      onClick={() => setActiveView('overview')}
                      className={`px-4 py-2 text-sm font-medium transition ${
                        activeView === 'overview' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`
                    }
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveView('detailed')}
                      className={`px-4 py-2 text-sm font-medium transition ${
                        activeView === 'detailed' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`
                    }
                    >
                      Detailed
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto-refresh and Export Controls */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-500" />
                  Controls
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Auto-refresh</span>
                  </label>
                  
                  {autoRefresh && (
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    >
                      <option value={10}>Every 10 seconds</option>
                      <option value={30}>Every 30 seconds</option>
                      <option value={60}>Every minute</option>
                      <option value={300}>Every 5 minutes</option>
                    </select>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={() => exportData("csv")} 
                      disabled={exportLoading === 'csv'}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      {exportLoading === 'csv' ? 'Exporting...' : 'CSV'}
                    </button>
                    <button 
                      onClick={() => exportData("excel")} 
                      disabled={exportLoading === 'excel'}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      {exportLoading === 'excel' ? 'Exporting...' : 'Excel'}
                    </button>
                    <button 
                      onClick={() => exportData("pdf")} 
                      disabled={exportLoading === 'pdf'}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      {exportLoading === 'pdf' ? 'Exporting...' : 'PDF'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {autoRefresh && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live updates enabled - refreshing every {refreshInterval} seconds</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3">
              <Activity className="h-5 w-5" />
              {error}
            </div>
          )}
          
          {loading && (
            <div className="flex items-center justify-center py-8 bg-white dark:bg-gray-800 rounded-2xl mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3">Loading real-time data...</span>
            </div>
          )}
          
          {data && (
            <>
              {/* Overview Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <MetricCard
                  title="Total Users"
                  value={data.users?.length || 0}
                  icon={Users}
                  color="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  description="System users"
                />
                <MetricCard
                  title="Total Materials"
                  value={data.materials?.length || 0}
                  icon={Package}
                  color="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                  description="Material items"
                />
                <MetricCard
                  title="Total Expenses"
                  value={`USD ${(data.expenses?.reduce((sum: number, exp: any) => sum + Number(exp.amount || 0), 0) || 0).toLocaleString()}`}
                  icon={DollarSign}
                  color="bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                  description="All expenditures"
                />
              </div>

              {/* Main Charts Grid */}
              {activeView === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <ChartCard title="Project Status Distribution" icon={PieChartIcon}>
                    <PieChart
                      data={(data.projects || []).reduce((acc: any[], project: any) => {
                        const existing = acc.find(item => item.name === project.status);
                        if (existing) {
                          existing.value += 1;
                        } else {
                          acc.push({ name: project.status || 'Unknown', value: 1 });
                        }
                        return acc;
                      }, [])}
                    />
                  </ChartCard>

                  <ChartCard title="Task Status Overview" icon={BarChart3}>
                    <BarChart
                      data={(data.tasks || []).reduce((acc: any[], task: any) => {
                        const existing = acc.find(item => item.name === task.status);
                        if (existing) {
                          existing.value += 1;
                        } else {
                          acc.push({ name: task.status || 'Unknown', value: 1 });
                        }
                        return acc;
                      }, [])}
                    />
                  </ChartCard>

                  <ChartCard title="Material Quantities" icon={Package}>
                    <BarChart
                      data={(data.materials || []).slice(0, 10).map((material: any) => ({
                        name: material.name?.substring(0, 15) + (material.name?.length > 15 ? '...' : ''),
                        value: material.quantity || 0,
                      }))}
                    />
                  </ChartCard>

                  <ChartCard title="Salaries Overview" icon={DollarSign}>
                    <BarChart
                      data={(data.salaries || []).slice(0, 10).map((salary: any, index: number) => ({
                        name: salary.employee_name?.substring(0, 15) + (salary.employee_name?.length > 15 ? '...' : '') || `Employee ${index + 1}`,
                        value: Number(salary.amount_paid || 0),
                      }))}
                    />
                  </ChartCard>
                </div>
              ) : (
                // Detailed View with Tables
                <div className="space-y-8">
                  {/* Users Table */}
                  <ChartCard title="Users Details" icon={Users}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Username</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.users || []).map((user: any) => (
                            <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="py-3 px-4 text-sm">{user.id}</td>
                              <td className="py-3 px-4 text-sm font-medium">{user.username}</td>
                              <td className="py-3 px-4 text-sm">{user.email}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {user.role || 'User'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ChartCard>

                  {/* Projects Table */}
                  <ChartCard title="Projects Details" icon={Building}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Client</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Budget</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.projects || []).map((project: any) => (
                            <tr key={project.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="py-3 px-4 text-sm font-medium">{project.name}</td>
                              <td className="py-3 px-4 text-sm">{project.client}</td>
                              <td className="py-3 px-4 text-sm">USD {Number(project.budget || 0).toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  project.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  project.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  project.status === 'ended' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                }`}>
                                  {project.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm">{project.location}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ChartCard>

                  {/* Materials and Expenses in a Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ChartCard title="Materials Inventory" icon={Package}>
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Material</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Quantity</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Used</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(data.materials || []).map((material: any) => (
                              <tr key={material.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-3 px-4 text-sm font-medium">{material.name}</td>
                                <td className="py-3 px-4 text-sm">{material.quantity}</td>
                                <td className="py-3 px-4 text-sm">{material.used || 0}</td>
                                <td className="py-3 px-4 text-sm">USD {Number(material.unit_price || 0).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </ChartCard>

                    <ChartCard title="Recent Expenses" icon={DollarSign}>
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(data.expenses || []).slice(0, 10).map((expense: any) => (
                              <tr key={expense.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-3 px-4 text-sm font-medium">USD {Number(expense.amount || 0).toLocaleString()}</td>
                                <td className="py-3 px-4 text-sm">{expense.description}</td>
                                <td className="py-3 px-4 text-sm">{new Date(expense.spent_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </ChartCard>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}