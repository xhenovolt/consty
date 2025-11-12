"use client";
import React, { useEffect, useState, useMemo, createContext, useContext } from "react";
import RequireAuth from "../../components/RequireAuth";
import ConstyBot from "../../components/ConstyBot";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  DollarSign, 
  Package, 
  Wrench, 
  MapPin,
  Calendar,
  Activity,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Zap,
  Shield,
  Construction,
  FileText,
  Bell,
  Eye,
  ArrowRight,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Search,
  Download,
  Maximize2,
  Star,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// Dynamic imports for charts
const PieChart = dynamic(() => import("../../components/PieChart"), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded"></div>
});
const BarChart = dynamic(() => import("../../components/BarChart"), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded"></div>
});
const LineChart = dynamic(() => import("../../components/LineChart"), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded"></div>
});
import AddEditProjectModal from "../../components/AddEditProjectModal";
import AddEditTaskModal from "../../components/AddEditTaskModal";
import AddEditMaterialModal from "../../components/AddEditMaterialModal";

interface DashboardData {
  projects: any[];
  tasks: any[];
  materials: any[];
  machines: any[];
  employees: any[];
  expenses: any[];
  working_hours: any[];
  suppliers?: any[];
  user: any;
  ai_insights?: {
    completion_prediction: string;
    risk_alerts: string[];
    cost_optimization: string[];
    recommendations: string[];
  };
}

interface UserRole {
  role: string;
  permissions: string[];
}

// Enhanced State Management
interface AppState {
  data: DashboardData | null;
  loading: boolean;
  error: string;
  dashboardMode: 'simplified' | 'professional'; // New dashboard mode state
  showAIInsights: boolean; // New AI insights visibility state
  modals: {
    createProject: boolean;
    editProject: boolean;
    createTask: boolean;
    editTask: boolean;
    createMaterial: boolean;
    editMaterial: boolean;
    deleteConfirm: boolean;
    help: boolean;
    settings: boolean;
    projectDetails: boolean;
    taskDetails: boolean;
    materialDetails: boolean;
    aiInsightsDetail: boolean; // New modal for detailed AI insights
    createSupplier: boolean; // New modal for creating supplier
    editSupplier: boolean; // New modal for editing supplier
  };
  selectedItem: any;
  notifications: any[];
  viewMode: 'grid' | 'list';
  theme: 'light' | 'dark';
  language: 'en' | 'sw' | 'lg';
  audioEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  filters: {
    status: string;
    priority: string;
    dateRange: { start: string; end: string };
    search: string;
  };
  favoriteProjects: string[];
  recentActivities: any[];
}

const AppContext = createContext<any>(null);

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// Enhanced Reusable Components
const Modal = ({ isOpen, onClose, title, children, size = "md" }: any) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const IconButton = ({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = 'default',
  size = 'md',
  disabled = false,
  tooltip = '',
  count = 0,
  loading = false
}: any) => {
  const variants = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300',
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };

  const sizes = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      title={tooltip || label}
      className={`
        relative rounded-xl shadow-sm transition-all duration-200 
        ${variants[variant]} ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
      ) : (
        <Icon className="h-5 w-5" />
      )}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
};

const SmartCard = ({ children, className = '', onClick, hoverable = true, ...props }: any) => (
  <div
    className={`
      bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700
      transition-all duration-300 overflow-hidden
      ${hoverable ? 'hover:shadow-xl' : ''}
      ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
      ${className}
    `}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
);

// Enhanced Form Components
const FormField = ({ label, type = "text", value, onChange, required = false, options = [], error, help }: any) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'select' ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        required={required}
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        required={required}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        required={required}
      />
    )}
    {help && <p className="text-xs text-gray-500 dark:text-gray-400">{help}</p>}
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

// ProjectFormModal kept for backwards compatibility but not rendered; AddEditProjectModal is used instead.
const ProjectFormModal = () => {
  const { state, actions } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    location: '',
    budget: '',
    start_date: '',
    deadline: '',
    description: '',
    status: 'planning',
    priority: 'medium'
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.selectedItem && state.modals.editProject) {
      setFormData({
        name: state.selectedItem.name || '',
        client: state.selectedItem.client || '',
        location: state.selectedItem.location || '',
        budget: state.selectedItem.budget || '',
        start_date: state.selectedItem.start_date || '',
        deadline: state.selectedItem.deadline || '',
        description: state.selectedItem.description || '',
        status: state.selectedItem.status || 'planning',
        priority: state.selectedItem.priority || 'medium'
      });
    } else {
      setFormData({
        name: '',
        client: '',
        location: '',
        budget: '',
        start_date: '',
        deadline: '',
        description: '',
        status: 'planning',
        priority: 'medium'
      });
    }
  }, [state.selectedItem, state.modals.editProject]);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.client.trim()) newErrors.client = 'Client name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.budget || parseFloat(formData.budget) <= 0) newErrors.budget = 'Valid budget is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    
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
      } else {
        await actions.createProject(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOpen = state.modals.createProject || state.modals.editProject;
  const title = state.selectedItem ? 'Edit Project' : 'Create New Project';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        actions.closeModal('createProject');
        actions.closeModal('editProject');
      }}
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Project Name"
            value={formData.name}
            onChange={(value: string) => setFormData(prev => ({ ...prev, name: value }))}
            required
            error={errors.name}
            help="Enter a descriptive name for your project"
          />
          <FormField
            label="Client"
            value={formData.client}
            onChange={(value: string) => setFormData(prev => ({ ...prev, client: value }))}
            required
            error={errors.client}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Location"
            value={formData.location}
            onChange={(value: string) => setFormData(prev => ({ ...prev, location: value }))}
            required
            error={errors.location}
          />
          <FormField
            label="Budget (USD)"
            type="number"
            value={formData.budget}
            onChange={(value: string) => setFormData(prev => ({ ...prev, budget: value }))}
            required
            error={errors.budget}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(value: string) => setFormData(prev => ({ ...prev, start_date: value }))}
            required
            error={errors.start_date}
          />
          <FormField
            label="Deadline"
            type="date"
            value={formData.deadline}
            onChange={(value: string) => setFormData(prev => ({ ...prev, deadline: value }))}
            required
            error={errors.deadline}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Status"
            type="select"
            value={formData.status}
            onChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}
            options={[
              { value: 'planning', label: '📋 Planning' },
              { value: 'ongoing', label: '🚧 Ongoing' },
              { value: 'paused', label: '⏸️ Paused' },
              { value: 'completed', label: '✅ Completed' }
            ]}
          />
          <FormField
            label="Priority"
            type="select"
            value={formData.priority}
            onChange={(value: string) => setFormData(prev => ({ ...prev, priority: value }))}
            options={[
              { value: 'low', label: '🟢 Low' },
              { value: 'medium', label: '🟡 Medium' },
              { value: 'high', label: '🟠 High' },
              { value: 'urgent', label: '🔴 Urgent' }
            ]}
          />
        </div>

        <FormField
          label="Description"
          type="textarea"
          value={formData.description}
          onChange={(value: string) => setFormData(prev => ({ ...prev, description: value }))}
          help="Provide additional details about the project"
        />
        
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {state.selectedItem ? 'Update Project' : 'Create Project'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              actions.closeModal('createProject');
              actions.closeModal('editProject');
            }}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

// New Dashboard Mode Toggle Component
const DashboardModeToggle = () => {
  const { state, actions } = useApp();

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Eye className="h-4 w-4" />
        <span>View Mode:</span>
      </div>
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => actions.updateSettings({ dashboardMode: 'simplified', showAIInsights: false })}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            state.dashboardMode === 'simplified'
              ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Simple
          </div>
        </button>
        <button
          onClick={() => actions.updateSettings({ dashboardMode: 'professional' })}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            state.dashboardMode === 'professional'
              ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Professional
          </div>
        </button>
      </div>
      {state.dashboardMode === 'professional' && (
        <button
          onClick={() => actions.updateSettings({ showAIInsights: !state.showAIInsights })}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
            state.showAIInsights
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          AI Insights
        </button>
      )}
    </div>
  );
};

// Enhanced AI Insights Banner for Professional Mode
const ProfessionalAIInsights = () => {
  const { state, actions } = useApp();

  if (!state.showAIInsights || !state.data?.ai_insights) return null;

  const insights = state.data.ai_insights;

  return (
    <div className="space-y-6">
      {/* Main AI Insights Overview */}
      <SmartCard className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 border-2 border-purple-200 dark:border-purple-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI-Powered Construction Analytics</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Real-time insights for informed decision making</p>
              </div>
            </div>
            <button
              onClick={() => actions.openModal('aiInsightsDetail')}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="text-sm font-medium">Detailed View</span>
            </button>
          </div>

          {/* Key Predictions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Project Completion</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{insights.completion_prediction}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Risk Alerts</h3>
              </div>
              <div className="space-y-1">
                {insights.risk_alerts.length > 0 ? (
                  insights.risk_alerts.slice(0, 2).map((alert, idx) => (
                    <p key={idx} className="text-sm text-red-600 dark:text-red-400">• {alert}</p>
                  ))
                ) : (
                  <p className="text-sm text-green-600 dark:text-green-400">No active risks detected</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Cost Optimization</h3>
              </div>
              <div className="space-y-1">
                {insights.cost_optimization.slice(0, 2).map((tip, idx) => (
                  <p key={idx} className="text-sm text-blue-600 dark:text-blue-400">• {tip}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Recommendations */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Recommended Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SmartCard>

      {/* Professional Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfessionalChart 
          title="Project Performance Trends"
          type="line"
          data={generateProjectTrends(state.data)}
        />
        <ProfessionalChart 
          title="Resource Utilization"
          type="bar"
          data={generateResourceUtilization(state.data)}
        />
      </div>
    </div>
  );
};

// Professional Chart Component
const ProfessionalChart = ({ title, type, data }: any) => {
  return (
    <SmartCard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Live Data</span>
          </div>
        </div>
        
        {type === 'line' ? (
          <LineChart data={data} />
        ) : (
          <BarChart data={data} />
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Updated: {new Date().toLocaleTimeString()}</span>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </SmartCard>
  );
};

// Detailed AI Insights Modal
const AIInsightsDetailModal = () => {
  const { state, actions } = useApp();

  if (!state.modals.aiInsightsDetail || !state.data?.ai_insights) return null;

  const insights = state.data.ai_insights;

  return (
    <Modal
      isOpen={state.modals.aiInsightsDetail}
      onClose={() => actions.closeModal('aiInsightsDetail')}
      title="Comprehensive AI Analytics"
      size="xl"
    >
      <div className="space-y-6">
        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Executive Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Project Health Score</h4>
              <div className="flex items-center gap-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="text-2xl font-bold text-green-600">78%</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Risk Assessment</h4>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${insights.risk_alerts.length > 2 ? 'bg-red-500' : insights.risk_alerts.length > 0 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span className="font-medium">
                  {insights.risk_alerts.length > 2 ? 'High Risk' : insights.risk_alerts.length > 0 ? 'Medium Risk' : 'Low Risk'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DetailedAnalyticsSection
            title="Project Forecasting"
            icon={Target}
            content={insights.completion_prediction}
            recommendations={insights.recommendations}
          />
          <DetailedAnalyticsSection
            title="Risk Management"
            icon={AlertTriangle}
            content={`${insights.risk_alerts.length} active risks identified`}
            recommendations={insights.risk_alerts}
          />
        </div>

        {/* Cost Analysis Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cost Analysis & Optimization</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Budget</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Actual</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Variance</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {generateCostAnalysisData(state.data).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 font-medium">{row.category}</td>
                      <td className="px-4 py-3">USD {row.budget.toLocaleString()}</td>
                      <td className="px-4 py-3">USD {row.actual.toLocaleString()}</td>
                      <td className={`px-4 py-3 font-medium ${row.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {row.variance}%
                      </td>
                      <td className="px-4 py-3 text-blue-600">{row.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Detailed Analytics Section Component
const DetailedAnalyticsSection = ({ title, icon: Icon, content, recommendations }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
    </div>
    <p className="text-gray-600 dark:text-gray-300 mb-4">{content}</p>
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900 dark:text-white">Key Insights:</h4>
      {recommendations.slice(0, 3).map((rec: string, idx: number) => (
        <div key={idx} className="flex items-start gap-2">
          <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{rec}</span>
        </div>
      ))}
    </div>
  </div>
);

// Helper: Generate cost analysis data for dashboard tables and analytics
const generateCostAnalysisData = (data: any) => {
  if (!data) return [];
  // Calculate budgets and actuals per category
  const totalBudget = (data.projects || []).reduce((sum: number, p: any) => sum + (parseFloat(p.budget) || 0), 0);

  // Ensure percentages sum to 100 and do not exceed it
  // Use fixed order: Materials, Labor, Equipment, Other
  let perc = [0.4, 0.3, 0.2, 0.1];
  let sumPerc = perc.reduce((a, b) => a + b, 0);
  if (sumPerc !== 1) {
    // Normalize so they sum to 1
    perc = perc.map(p => p / sumPerc);
  }
  // If rounding causes >100, adjust last
  let budgets = perc.map(p => Math.round(totalBudget * p));
  let budgetSum = budgets.reduce((a, b) => a + b, 0);
  if (budgetSum !== Math.round(totalBudget)) {
    budgets[budgets.length - 1] += Math.round(totalBudget) - budgetSum;
  }

  // Actuals
  const materialActual = (data.materials || []).reduce((sum: number, m: any) => sum + (parseFloat(m.money_spent) || 0), 0);
  const laborActual = (data.expenses || []).filter((e: any) => (e.category || '').toLowerCase().includes('labor')).reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);
  const equipmentActual = (data.expenses || []).filter((e: any) => (e.category || '').toLowerCase().includes('equipment')).reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);
  const otherActual = (data.expenses || []).filter((e: any) =>
    !(e.category || '').toLowerCase().includes('labor') &&
    !(e.category || '').toLowerCase().includes('equipment')
  ).reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);

  return [
    {
      category: 'Materials',
      budget: budgets[0],
      actual: Math.round(materialActual),
      variance: budgets[0] ? Math.abs(Math.round(((materialActual - budgets[0]) / budgets[0]) * 100)) : 0,
      recommendation: materialActual > budgets[0] ? 'Review material usage' : 'On track'
    },
    {
      category: 'Labor',
      budget: budgets[1],
      actual: Math.round(laborActual),
      variance: budgets[1] ? Math.abs(Math.round(((laborActual - budgets[1]) / budgets[1]) * 100)) : 0,
      recommendation: laborActual > budgets[1] ? 'Optimize workforce allocation' : 'On track'
    },
    {
      category: 'Equipment',
      budget: budgets[2],
      actual: Math.round(equipmentActual),
      variance: budgets[2] ? Math.abs(Math.round(((equipmentActual - budgets[2]) / budgets[2]) * 100)) : 0,
      recommendation: equipmentActual > budgets[2] ? 'Check equipment maintenance costs' : 'On track'
    },
    {
      category: 'Other',
      budget: budgets[3],
      actual: Math.round(otherActual),
      variance: budgets[3] ? Math.abs(Math.round(((otherActual - budgets[3]) / budgets[3]) * 100)) : 0,
      recommendation: otherActual > budgets[3] ? 'Audit miscellaneous expenses' : 'On track'
    }
  ];
};

// AI Insights Generator
const generateAIInsights = (data: any) => {
  const ongoingProjects = data.projects.filter((p: any) => p.status === 'ongoing');
  const overdueTasks = data.tasks.filter((t: any) => new Date(t.deadline) < new Date() && t.status !== 'completed');
  const lowStockMaterials = data.materials.filter((m: any) => (m.quantity - (m.used || 0)) < 10);
  const totalBudget = data.projects.reduce((sum: number, p: any) => sum + (parseFloat(p.budget) || 0), 0);
  const totalExpenses = data.expenses.reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);

  return {
    completion_prediction: ongoingProjects.length > 0 ? 
      `Based on current progress, ${Math.round(ongoingProjects.length * 0.7)} projects expected to complete on time` :
      "No active projects to analyze",
    risk_alerts: [
      ...(overdueTasks.length > 0 ? [`${overdueTasks.length} overdue tasks require immediate attention`] : []),
      ...(lowStockMaterials.length > 0 ? [`${lowStockMaterials.length} materials running low on stock`] : []),
      ...(totalExpenses > totalBudget * 0.8 ? ['Budget utilization exceeds 80% - monitor spending'] : [])
    ],
    cost_optimization: [
      totalExpenses > totalBudget * 0.7 ? 'Consider bulk purchasing for cost savings' : 'Budget is on track',
      lowStockMaterials.length > 3 ? 'Optimize inventory management to reduce carrying costs' : 'Inventory levels are optimal'
    ],
    recommendations: [
      ongoingProjects.length > 5 ? 'Consider resource allocation optimization for multiple projects' : 'Project load is manageable',
      overdueTasks.length > 0 ? 'Implement task priority matrix for better deadline management' : 'Task management is effective'
    ]
  };
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>({
    data: null,
    loading: true,
    error: "",
    dashboardMode: 'simplified', // Default to simplified mode
    showAIInsights: false, // AI insights hidden by default
    modals: {
      createProject: false,
      editProject: false,
      createTask: false,
      editTask: false,
      createMaterial: false,
      editMaterial: false,
      deleteConfirm: false,
      help: false,
      settings: false,
      projectDetails: false,
      taskDetails: false,
      materialDetails: false,
      aiInsightsDetail: false, // New modal state
      createSupplier: false, // New modal state
      editSupplier: false, // New modal state
    },
    selectedItem: null,
    notifications: [],
    viewMode: 'grid',
    theme: 'light',
    language: 'en',
    audioEnabled: false,
    fontSize: 'medium',
    filters: {
      status: '',
      priority: '',
      dateRange: { start: '', end: '' },
      search: ''
    },
    favoriteProjects: [],
    recentActivities: []
  });

  // Enhanced Actions
  const actions = {
    openModal: (modal: string, item?: any) => {
      setState(prev => ({
        ...prev,
        modals: { ...prev.modals, [modal]: true },
        selectedItem: item || null
      }));
    },

    closeModal: (modal: string) => {
      setState(prev => ({
        ...prev,
        modals: { ...prev.modals, [modal]: false },
        selectedItem: null
      }));
    },

    refreshData: async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        // API calls implementation
        const [
          projectsRes,
          tasksRes,
          materialsRes,
          machinesRes,
          employeesRes,
          expensesRes,
          hoursRes,
          suppliersRes
        ] = await Promise.all([
          fetch('http://localhost/consty/api/projects.php'),
          fetch('http://localhost/consty/api/tasks.php'),
          fetch('http://localhost/consty/api/materials.php'),
          fetch('http://localhost/consty/api/machines.php'),
          fetch('http://localhost/consty/api/employees.php'),
          fetch('http://localhost/consty/api/expenses.php'),
          fetch('http://localhost/consty/api/working_hours.php'),
          fetch('http://localhost/consty/api/suppliers.php')
        ]);

        const [projects, tasks, materials, machines, employees, expenses, working_hours, suppliers] = await Promise.all([
          projectsRes.json().catch(() => ({ projects: [] })),
          tasksRes.json().catch(() => ({ tasks: [] })),
          materialsRes.json().catch(() => ({ materials: [] })),
          machinesRes.json().catch(() => ({ machines: [] })),
          employeesRes.json().catch(() => ({ employees: [] })),
          expensesRes.json().catch(() => ({ expenses: [] })),
          hoursRes.json().catch(() => ({ working_hours: [] })),
          suppliersRes.json().catch(() => ({ suppliers: [] }))
        ]);

        setState(prev => ({
          ...prev,
          data: {
            projects: projects.projects || [],
            tasks: tasks.tasks || [],
            materials: materials.materials || [],
            machines: machines.machines || [],
            employees: employees.employees || [],
            expenses: expenses.expenses || [],
            working_hours: working_hours.working_hours || [],
            user: prev.data?.user || {},
            suppliers: suppliers.suppliers || [],
            ai_insights: (function generateAIInsights(data: any) {
              const ongoingProjects = data.projects.filter((p: any) => p.status === 'ongoing');
              const overdueTasks = data.tasks.filter((t: any) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed');
              const lowStockMaterials = data.materials.filter((m: any) => (m.quantity - (m.used || 0)) < 10);
              const totalBudget = data.projects.reduce((sum: number, p: any) => sum + (parseFloat(p.budget) || 0), 0);
              const totalExpenses = data.expenses.reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);

              return {
                completion_prediction: ongoingProjects.length > 0 ? `Based on current progress, ${Math.round(ongoingProjects.length * 0.7)} projects expected to complete on time` : "No active projects to analyze",
                risk_alerts: [
                  ...(overdueTasks.length > 0 ? [`${overdueTasks.length} overdue tasks require immediate attention`] : []),
                  ...(lowStockMaterials.length > 0 ? [`${lowStockMaterials.length} materials running low on stock`] : []),
                  ...(totalExpenses > totalBudget * 0.8 ? ['Budget utilization exceeds 80% - monitor spending'] : [])
                ],
                cost_optimization: [
                  totalExpenses > totalBudget * 0.7 ? 'Consider bulk purchasing for cost savings' : 'Budget is on track',
                  lowStockMaterials.length > 3 ? 'Optimize inventory management to reduce carrying costs' : 'Inventory levels are optimal'
                ],
                recommendations: [
                  ongoingProjects.length > 5 ? 'Consider resource allocation optimization for multiple projects' : 'Project load is manageable',
                  overdueTasks.length > 0 ? 'Implement task priority matrix for better deadline management' : 'Task management is effective'
                ]
              };
            })({
              projects: projects.projects || [],
              tasks: tasks.tasks || [],
              materials: materials.materials || [],
              expenses: expenses.expenses || []
            })
          },
          loading: false,
          error: ""
        }));
      } catch (error: any) {
        setState(prev => ({ ...prev, error: error.message || "Failed to load data", loading: false }));
      }
    },

    createProject: async (projectData: any) => {
      try {
        const response = await fetch('http://localhost/consty/api/projects.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });

        if (!response.ok) throw new Error('Failed to create project');

        actions.closeModal('createProject');
        await actions.refreshData();
        actions.showNotification("Project created successfully", "success");
      } catch (error: any) {
        actions.showNotification(error.message || "Failed to create project", "error");
        throw error;
      }
    },

    updateProject: async (id: string, projectData: any) => {
      try {
        const response = await fetch(`http://localhost/consty/api/projects.php?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });

        if (!response.ok) throw new Error('Failed to update project');

        actions.closeModal('editProject');
        await actions.refreshData();
        actions.showNotification("Project updated successfully", "success");
      } catch (error: any) {
        actions.showNotification(error.message || "Failed to update project", "error");
        throw error;
      }
    },

    deleteProject: async (id: string) => {
      try {
        const response = await fetch(`http://localhost/consty/api/projects.php?id=${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete project');

        actions.closeModal('deleteConfirm');
        await actions.refreshData();
        actions.showNotification("Project deleted successfully", "success");
      } catch (error: any) {
        actions.showNotification(error.message || "Failed to delete project", "error");
        throw error;
      }
    },

    createTask: async (taskData: any) => {
      try {
        const response = await fetch('http://localhost/consty/api/tasks.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });

        if (!response.ok) throw new Error('Failed to create task');

        actions.closeModal('createTask');
        await actions.refreshData();
        actions.showNotification("Task created successfully", "success");
      } catch (error: any) {
        actions.showNotification(error.message || "Failed to create task", "error");
        throw error;
      }
    },

    updateTask: async (id: string, taskData: any) => {
      try {
        const response = await fetch(`http://localhost/consty/api/tasks.php?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });

        if (!response.ok) throw new Error('Failed to update task');

        actions.closeModal('editTask');
        await actions.refreshData();
        actions.showNotification("Task updated successfully", "success");
      } catch (error: any) {
        actions.showNotification(error.message || "Failed to update task", "error");
        throw error;
      }
    },

    deleteTask: async (id: string) => {
      try {
        const response = await fetch(`http://localhost/consty/api/tasks.php?id=${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete task');

        actions.closeModal('deleteConfirm');
        await actions.refreshData();
        actions.showNotification("Task deleted successfully", "success");
      } catch (error: any) {
        actions.showNotification(error.message || "Failed to delete task", "error");
        throw error;
      }
    },

    createMaterial: async (materialData: any) => {
      try {
        const response = await fetch('http://localhost/consty/api/materials.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(materialData)
        });

        if (!response.ok) throw new Error('Failed to create material');

        actions.closeModal('createMaterial');
        await actions.refreshData();
        actions.showNotification("Material created successfully", "success");
      } catch (error: any) {
        actions.showNotification(error.message || "Failed to create material", "error");
        throw error;
      }
    },

    updateMaterial: async (id: string, materialData: any) => {
      try {
        // Use PATCH to the collection and include id in body so supplier_id changes are applied
        const response = await fetch('http://localhost/consty/api/materials.php', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...materialData })
        });

        if (!response.ok) throw new Error('Failed to update material');

        actions.closeModal('editMaterial');
        await actions.refreshData();
        actions.showNotification("Material updated successfully", "success");
      } catch (error: any) {
        actions.showNotification(error.message || "Failed to update material", "error");
        throw error;
      }
    },

    deleteMaterial: async (id: string) => {
      try {
        const response = await fetch(`http://localhost/consty/api/materials.php?id=${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete material');

        actions.closeModal('deleteConfirm');
        await actions.refreshData();
        actions.showNotification("Material deleted successfully", "success");
      } catch (error: any) {
        actions.showNotification(error.message || "Failed to delete material", "error");
        throw error;
      }
    },

    createSupplier: async (supplierData: any) => {
      try {
        const response = await fetch('http://localhost/consty/api/suppliers.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierData)
        });

        if (!response.ok) throw new Error('Failed to create supplier');

        actions.closeModal('createSupplier');
        await actions.refreshData();
        actions.showNotification("Supplier created successfully", "success");
      } catch (error: any) {
        actions.showNotification(error.message || "Failed to create supplier", "error");
        throw error;
      }
    },

    updateSupplier: async (id: string, supplierData: any) => {
      try {
        const response = await fetch(`http://localhost/consty/api/suppliers.php?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierData)
        });

        if (!response.ok) throw new Error('Failed to update supplier');

        actions.closeModal('editSupplier');
        await actions.refreshData();
        actions.showNotification("Supplier updated successfully", "success");
      } catch (error: any) {
        actions.showNotification(error.message || "Failed to update supplier", "error");
        throw error;
      }
    },

    deleteSupplier: async (id: string) => {
      try {
        const response = await fetch(`http://localhost/consty/api/suppliers.php?id=${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete supplier');

        actions.closeModal('deleteConfirm');
        await actions.refreshData();
        actions.showNotification("Supplier deleted successfully", "success");
      } catch (error: any) {
        actions.showNotification(error.message || "Failed to delete supplier", "error");
        throw error;
      }
    },

    showNotification: (message: string, type: 'success' | 'error' | 'warning') => {
      const id = Date.now();
      setState(prev => ({
        ...prev,
        notifications: [...prev.notifications, { id, message, type }]
      }));
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== id)
        }));
      }, 5000);
    },

    // NEW: allow manual removal of a notification from components
    removeNotification: (id: number) => {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== id)
      }));
    },

    toggleFavorite: (projectId: string) => {
      setState(prev => ({
        ...prev,
        favoriteProjects: prev.favoriteProjects.includes(projectId)
          ? prev.favoriteProjects.filter(id => id !== projectId)
          : [...prev.favoriteProjects, projectId]
      }));
    },

    updateSettings: (settings: Partial<AppState>) => {
      setState(prev => ({ ...prev, ...settings }));
    }
  };

  // AI Insights Generator
  const generateAIInsights = (data: any) => {
    const ongoingProjects = data.projects.filter((p: any) => p.status === 'ongoing');
    const overdueTasks = data.tasks.filter((t: any) => new Date(t.deadline) < new Date() && t.status !== 'completed');
    const lowStockMaterials = data.materials.filter((m: any) => (m.quantity - (m.used || 0)) < 10);
    const totalBudget = data.projects.reduce((sum: number, p: any) => sum + (parseFloat(p.budget) || 0), 0);
    const totalExpenses = data.expenses.reduce((sum: number, e: any) => sum + (parseFloat(e.amount) || 0), 0);

    return {
      completion_prediction: ongoingProjects.length > 0 ? 
        `Based on current progress, ${Math.round(ongoingProjects.length * 0.7)} projects expected to complete on time` :
        "No active projects to analyze",
      risk_alerts: [
        ...(overdueTasks.length > 0 ? [`${overdueTasks.length} overdue tasks require immediate attention`] : []),
        ...(lowStockMaterials.length > 0 ? [`${lowStockMaterials.length} materials running low on stock`] : []),
        ...(totalExpenses > totalBudget * 0.8 ? ['Budget utilization exceeds 80% - monitor spending'] : [])
      ],
      cost_optimization: [
        totalExpenses > totalBudget * 0.7 ? 'Consider bulk purchasing for cost savings' : 'Budget is on track',
        lowStockMaterials.length > 3 ? 'Optimize inventory management to reduce carrying costs' : 'Inventory levels are optimal'
      ],
      recommendations: [
        ongoingProjects.length > 5 ? 'Consider resource allocation optimization for multiple projects' : 'Project load is manageable',
        overdueTasks.length > 0 ? 'Implement task priority matrix for better deadline management' : 'Task management is effective'
      ]
    };
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole>({ role: 'user', permissions: [] });
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <RequireAuth>
      <AppProvider>
        <DashboardContent 
          userRole={userRole} 
          setUserRole={setUserRole} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </AppProvider>
    </RequireAuth>
  );
}

const AccessRestricted = () => (
  <div
    className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in"
    style={{
      animation: 'fadeIn 0.7s cubic-bezier(0.4,0,0.2,1)',
    }}
  >
    <div className="relative mb-6">
      <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-glow"></div>
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-lg">
        <svg className="w-12 h-12 text-white animate-lock-spin" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeWidth="2" d="M17 11V7a5 5 0 00-10 0v4"/>
          <rect width="16" height="10" x="4" y="11" rx="2" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="16" r="1.5" fill="currentColor" />
        </svg>
      </div>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      🚫 Access Restricted
    </h2>
    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md">
      This section is reserved for administrators only.
    </p>
    <a
      href="/dashboard"
      className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
    >
      Return to Dashboard
    </a>
    <style>{`
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes glow {
        0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7);}
        70% { box-shadow: 0 0 0 12px rgba(239,68,68,0);}
        100% { box-shadow: 0 0 0 0 rgba(239,68,68,0);}
      }
      .animate-glow { animation: glow 2s infinite; }
      @keyframes lock-spin { 0% { transform: rotate(-10deg);} 50% {transform: rotate(10deg);} 100% {transform: rotate(-10deg);} }
      .animate-lock-spin { animation: lock-spin 2s infinite; }
    `}</style>
  </div>
);

const DashboardContent = ({ userRole, setUserRole, activeTab, setActiveTab }: any) => {
  const { state, actions } = useApp();

  useEffect(() => {
    // Get user role from session
    const session = typeof window !== 'undefined' ? localStorage.getItem('session') : null;
    if (session) {
      try {
        const user = JSON.parse(session);
        setUserRole({
          role: user.role || 'user',
          permissions: user.permissions || []
        });
      } catch {}
    }
    
    actions.refreshData();
    // Auto-refresh every 5 minutes (300 seconds)
    const interval = setInterval(actions.refreshData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Role-based metrics
  const roleBasedMetrics = useMemo(() => {
    if (!state.data || !state.data.projects || !state.data.tasks || !state.data.employees || !state.data.machines) return [];

    const baseMetrics = [
      {
        title: "Active Projects",
        value: state.data.projects.filter(p => p.status === 'ongoing').length,
        total: state.data.projects.length,
        icon: Construction,
        color: "bg-gradient-to-r from-blue-500 to-blue-600",
        trend: "+12%",
        description: "Currently active"
      },
      {
        title: "Pending Tasks",
        value: state.data.tasks.filter(t => t.status === 'pending').length,
        total: state.data.tasks.length,
        icon: FileText,
        color: "bg-gradient-to-r from-orange-500 to-orange-600",
        trend: "-5%",
        description: "Awaiting action"
      }
    ];

    if (userRole.role === 'admin' || userRole.role === 'manager') {
      baseMetrics.push(
        {
          title: "Total Budget",
          value: `USD ${(state.data.projects || []).reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0).toLocaleString()}`,
          total: null,
          icon: DollarSign,
          color: "bg-gradient-to-r from-green-500 to-green-600",
          trend: "+8%",
          description: "Allocated funds"
        },
        {
          title: "Team Members",
          value: (state.data.employees || []).length,
          total: null,
          icon: Users,
          color: "bg-gradient-to-r from-purple-500 to-purple-600",
          trend: "+3%",
          description: "Active workforce"
        }
      );
    }

    if (userRole.role === 'admin') {
      baseMetrics.push({
        title: "Equipment",
        value: (state.data.machines || []).length,
        total: null,
        icon: Wrench,
        color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
        trend: "0%",
        description: "Total machinery"
      });
    }

    return baseMetrics;
  }, [state.data, userRole]);

  const MetricCard = ({ metric }: { metric: any }) => (
    <SmartCard 
      className={`${metric.color} text-white p-6 cursor-pointer transform hover:scale-105`}
      onClick={() => {
        if (metric.title.includes('Projects')) {
          actions.openModal('projectDetails');
        }
        // Audio feedback
        if ('speechSynthesis' in window && state.audioEnabled) {
          const text = `${metric.title}: ${metric.value}. ${metric.description}`;
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
        }
      }}
    >
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-white bg-opacity-20">
              <metric.icon className="h-6 w-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              metric.trend.startsWith('+') ? 'text-green-200' : 
              metric.trend.startsWith('-') ? 'text-red-200' : 'text-gray-200'
            }`}>
              {metric.trend.startsWith('+') ? <TrendingUp className="h-4 w-4" /> : 
               metric.trend.startsWith('-') ? <TrendingDown className="h-4 w-4" /> : 
               <Activity className="h-4 w-4" />}
              {metric.trend}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium opacity-90">{metric.title}</h3>
            <p className="text-2xl font-bold mt-1">
              {metric.value}
              {metric.total && <span className="text-lg opacity-75">/{metric.total}</span>}
            </p>
            <p className="text-xs opacity-75 mt-1">{metric.description}</p>
          </div>
        </div>
      </div>
    </SmartCard>
  );

  const DashboardCard = ({ title, children, icon: Icon, actions: cardActions }: any) => (
    <SmartCard>
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          {cardActions && <div className="flex gap-2">{cardActions}</div>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </SmartCard>
  );

  // Add helper to compute project progress consistently
  const computeProjectProgress = (project: any, tasks: any[] = []) => {
	// prefer explicit project.progress
	if (typeof project?.progress === 'number' && !isNaN(project.progress)) {
		return Math.max(0, Math.min(100, Math.round(project.progress)));
	}

	// derive from tasks if available
	if (Array.isArray(tasks) && tasks.length > 0) {
		const projectTasks = tasks.filter((t: any) =>
			String(t.project_id) === String(project.id) || t.project_id === project.id
		);
		if (projectTasks.length > 0) {
			const completed = projectTasks.filter((t: any) => t.status === 'completed').length;
			return Math.max(0, Math.min(100, Math.round((completed / projectTasks.length) * 100)));
		}
	}

	// fallback to date-based estimate if start_date & deadline exist
	if (project?.start_date && project?.deadline) {
		const start = new Date(project.start_date).getTime();
		const end = new Date(project.deadline).getTime();
		const now = Date.now();
		if (!isNaN(start) && !isNaN(end) && end > start) {
			return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
		}
	}

	// default 0
	return 0;
};

  const restrictedTabs = ['employees', 'employee-logs', 'salaries'];
  const isRestrictedTab = restrictedTabs.includes(activeTab);

  if (isRestrictedTab && userRole.role !== 'admin') {
    // Optionally, set 403 status for SSR/SEO
    if (typeof window !== "undefined") {
      // For client-side navigation, you can also use router.replace("/dashboard") if you want to force redirect
    }
    return <AccessRestrictedPage />;
  }

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Define the deleteHandler function
  const deleteHandler = async (id: number) => {
    if (confirm('Are you sure you want to remove this project?')) {
      try {
        const res = await fetch('http://localhost/consty/api/projects.php', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        let msg = "Project deleted successfully";
        const data = await res.json();
        msg = data?.message || data?.success || data?.error || msg;

        if (!res.ok) throw new Error(msg);

        alert(msg);
        await actions.refreshData(); // Refresh the dashboard data
      } catch (error: any) {
        console.error("Deletion failed:", error.message || "An error occurred.");
        alert(error.message || "Failed to delete project.");
      }
    }
  };

  // --- Restrict Employees/Salaries Tabs for non-admins ---
  // Define restricted tab IDs
  const adminOnlyTabs = ['workforce', 'salaries', 'employees'];

  return (
    <div className="min-h-screen">
      <div className="px-6 py-8">
        {/* Enhanced Header with Mode Toggle */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Construction Dashboard
                {state.dashboardMode === 'professional' && (
                  <span className="ml-3 text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Professional Mode
                  </span>
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {state.dashboardMode === 'simplified' 
                  ? "Essential project information at a glance"
                  : "Comprehensive analytics and AI-powered insights for informed decision making"
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <DashboardModeToggle />
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Activity className="h-4 w-4" />
                <span>Updates every 5 min</span>
              </div>
              <IconButton
                icon={RefreshCw}
                label="Refresh"
                onClick={actions.refreshData}
                variant="primary"
                loading={state.loading}
                tooltip="Refresh data now"
              />
            </div>
          </div>

          {/* Conditional AI Insights Banner */}
          {state.dashboardMode === 'simplified' && state.data?.ai_insights && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm font-medium">AI insights available for enhanced analytics</span>
                </div>
                <button
                  onClick={() => actions.updateSettings({ dashboardMode: 'professional', showAIInsights: true })}
                  className="px-4 py-2 bg-white text-green-700 dark:text-green-500 bg-opacity-20 rounded-lg text-sm font-medium hover:bg-opacity-30 transition"
                >
                  View Insights
                </button>
              </div>
            </div>
          )}

          {/* Professional AI Insights */}
          {state.dashboardMode === 'professional' && <ProfessionalAIInsights />}
        </div>

        {/* Role-based Metrics Grid - Enhanced for Professional Mode */}
        <div className={`grid gap-6 mb-8 ${
          state.dashboardMode === 'professional' 
            ? 'grid-cols-1 lg:grid-cols-3' 
            : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {roleBasedMetrics.map((metric, idx) => (
            <MetricCard key={idx} metric={metric} />
          ))}
          
          
          {/* Additional Professional Metrics */}
          {state.dashboardMode === 'professional' && (
            <SmartCard className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-6">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-6 w-6" />
                <span className="text-sm font-medium opacity-90">Efficiency Score</span>
              </div>
              <div className="text-2xl font-bold">87%</div>
              <div className="text-xs opacity-75 mt-1">+5% from last month</div>
            </SmartCard>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-4"><h1 className="text-lg font-semibold">Overview</h1></div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-8">
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
            {
              [
                // { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'projects', label: 'Projects', icon: Construction },
                { id: 'finance', label: 'Finance', icon: DollarSign, roles: ['admin', 'manager'] },
                { id: 'resources', label: 'Resources', icon: Package },
                { id: 'workforce', label: 'Workforce', icon: Users, roles: ['admin'] }, // now admin only
                { id: 'equipment', label: 'Equipment', icon: Wrench, roles: ['admin'] },
                { id: 'suppliers', label: 'Suppliers', icon: Users, roles: ['admin', 'manager'] },
                // { id: 'employees', label: 'Employees', icon: Users, roles: ['admin'] },
                // { id: 'salaries', label: 'Salaries', icon: DollarSign, roles: ['admin'] },
              ]
                .filter(tab => !tab.roles || tab.roles.includes(userRole.role))
                .map(tab => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition ${
                        activeTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-400'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })
            }
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <>
              {/* Enhanced Project Progress Overview */}
              <div className={`grid hidden gap-8 ${
                state.dashboardMode === 'professional' 
                  ? 'grid-cols-1 lg:grid-cols-3' 
                  : 'grid-cols-1 lg:grid-cols-2'
              }`}>
                <DashboardCard 
                  title="Project Progress" 
                  icon={Target}
                  actions={
                    <IconButton
                      icon={Plus}
                      label="New Project"
                      onClick={() => actions.openModal('createProject')}
                      variant="primary"
                      tooltip="Create a new project"
                    />
                  }
                >
                  {state.data?.projects?.length > 0 ? (
                    <div className="space-y-3">
                      {(state.data.projects || []).slice(0, 8).map((project, idx) => {
                        const pct = computeProjectProgress(project, state.data?.tasks || []);
                        return (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex-1 pr-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{project.name}</div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>{project.client}</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">|</span>
                                <span>{new Date(project.start_date).toLocaleDateString()}</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">|</span>
                                <span>{project.status}</span>
                              </div>
                            </div>
                            <div className="w-32 text-right">
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progress</div>
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                  <div
                                    className="h-2.5 bg-green-600 rounded-full"
                                    style={{ width: `${pct}%`, transition: 'width 0.3s ease' }}
                                    aria-valuenow={pct}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    role="progressbar"
                                  />
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">{pct}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Construction className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active projects</p>
                    </div>
                  )}
                </DashboardCard>

                <DashboardCard title="Financial Overview" icon={DollarSign}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Budget</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        USD {(
                          (state.data?.projects || []).reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0) || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Expenses</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        USD {(
                          (state.data?.expenses || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget Utilization</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {(
                          ((state.data?.expenses || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) /
                          ((state.data?.projects || []).reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0) || 1)) * 100
                        ).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            </>
          )}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Management</h2>
                <IconButton
                  icon={Plus}
                  label="New Project"
                  onClick={() => actions.openModal('createProject')}
                  variant="primary"
                />
              </div>
              <EnhancedDataTable
                data={state.data?.projects || []}
                columns={[
                  { header: 'Project Name', accessor: 'name' },
                  { header: 'Client', accessor: 'client' },
                  { header: 'Location', accessor: 'location' },
                  { header: 'Status', accessor: 'status' },
                  { header: 'Deadline', accessor: 'end_date', render: (date: string) =>
                      date ? new Date(date).toLocaleDateString() : <span className="text-gray-400">N/A</span>
                  }
                ]}
                title="All Projects"
                onRowClick={(project) => actions.openModal('projectDetails', project)}
                onEdit={(project) => actions.openModal('editProject', project)}
                onDelete={deleteHandler} // Pass deleteHandler as onDelete prop
              />
            </div>
          )}

          {/* Finance Tab Content - Only for admin/manager */}
          {activeTab === 'finance' && (userRole.role === 'admin' || userRole.role === 'manager') && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCard title="Budget Analysis" icon={DollarSign}>
                  <div className="space-y-4">
                    {generateCostAnalysisData(state.data).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="font-medium">{item.category}</span>
                        <span className={`font-bold ${item.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.variance > 0 ? '' : ''}{item.variance}%
                        </span>
                      </div>
                    ))}
                  </div>
                </DashboardCard>
                <DashboardCard title="Expense Trends" icon={TrendingUp}>
                  <LineChart data={generateProjectTrends(state.data)} />
                </DashboardCard>
              </div>
            </div>
          )}

          {/* Resources Tab Content */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Management</h2>
                <IconButton
                  icon={Plus}
                  label="Add Material"
                  onClick={() => actions.openModal('createMaterial')}
                  variant="primary"
                />
              </div>
              <EnhancedDataTable
                data={state.data?.materials || []}
                columns={[
                  { header: 'Material', accessor: 'name' },
                  { header: 'Supplier', accessor: 'supplier_name' },
                  { header: 'Unit Price', accessor: 'unit_price', render: (price: string) =>
                      price ? `USD ${parseFloat(price).toLocaleString()}` : <span className="text-gray-400">N/A</span>
                  },
                  { header: 'Money Spent', accessor: 'money_spent', render: (spent: string) =>
                      spent ? `USD ${parseFloat(spent).toLocaleString()}` : <span className="text-gray-400">N/A</span>
                  },
                ]}
                title="Materials Inventory"
                onRowClick={(material) => actions.openModal('materialDetails', material)}
                onEdit={(material) => actions.openModal('editMaterial', material)}
                onDelete={deleteHandler} // Pass deleteHandler as onDelete prop
              />
            </div>
          )}

          {/* Workforce Tab Content - Only for admin/manager */}
          {activeTab === 'workforce' && (userRole.role === 'admin' || userRole.role === 'manager') && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workforce Management</h2>
              <div className="grid grid-cols-4 lg:grid-cols-3 gap-6">
                <DashboardCard title="Team Overview" icon={Users}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Total Employees</span>
                      <span className="font-bold">{(state.data?.employees || []).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Projects</span>
                      <span className="font-bold">{state.data?.projects.filter(p => p.status === 'ongoing').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tasks Completed</span>
                      <span className="font-bold text-green-600">{state.data?.tasks.filter(t => t.status === 'completed').length}</span>
                    </div>
                  </div>
                </DashboardCard>
                  {/* <DashboardCard title="Performance" icon={Target} className="lg:col-span-6">
                    <BarChart data={generateResourceUtilization(state.data)} />
                  </DashboardCard> */}
              </div>
            </div>
          )}

          {/* Equipment Tab Content - Only for admin */}
          {activeTab === 'equipment' && userRole.role === 'admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Equipment Management</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCard title="Equipment Status" icon={Wrench}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Total Machines</span>
                      <span className="font-bold">{(state.data?.machines || []).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Operational</span>
                      <span className="font-bold text-green-600">{Math.floor((state.data?.machines || []).length * 0.85)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Under Maintenance</span>
                      <span className="font-bold text-yellow-600">{Math.floor((state.data?.machines || []).length * 0.15)}</span>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard title="Utilization" icon={Activity}>
                  <PieChart data={[
                    { name: 'Active', value: 70 },
                    { name: 'Idle', value: 20 },
                    { name: 'Maintenance', value: 10 }
                  ]} />
                </DashboardCard>
              </div>
            </div>
          )}

          {/* Suppliers Tab Content - Only for admin/manager */}
          {activeTab === 'suppliers' && (userRole.role === 'admin' || userRole.role === 'manager') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h2>
                <IconButton
                  icon={Plus}
                  label="Add Supplier"
                  onClick={() => actions.openModal('createSupplier')}
                  variant="primary"
                />
              </div>
              <EnhancedDataTable
                data={state.data?.suppliers || []}
                columns={[
                  { header: 'Name', accessor: 'name' },
                  { header: 'Email', accessor: 'contact_email' },
                  { header: 'Phone', accessor: 'contact_phone' },
                  { header: 'Address', accessor: 'address' },
                  {
                    header: 'Materials Supplied',
                    accessor: 'materials_count',
                    render: (_: any, row: any) => {
                      const count = (state.data?.materials || []).filter((m: any) => String(m.supplier_id) === String(row.id)).length;
                      return <span className="font-semibold">{count}</span>;
                    }
                  },
                  {
                    header: 'Machines Supplied',
                    accessor: 'machines_count',
                    render: (_: any, row: any) => {
                      const count = (state.data?.machines || []).filter((m: any) => String(m.supplier_id) === String(row.id)).length;
                      return <span className="font-semibold">{count}</span>;
                    }
                  },
                  { header: 'Created At', accessor: 'created_at', render: (date: string) =>
                      date ? new Date(date).toLocaleDateString() : <span className="text-gray-400">N/A</span>
                  }
                ]}
                title="All Suppliers"
                onRowClick={(supplier) => actions.openModal('supplierDetails', supplier)}
                onEdit={(supplier) => actions.openModal('editSupplier', supplier)}
                onDelete={deleteHandler} // Pass deleteHandler as onDelete prop
              />
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modals */}
      {(state.modals.createProject || state.modals.editProject) && (
        <AddEditProjectModal
          project={state.modals.editProject ? state.selectedItem : null}
          onClose={() => {
            actions.closeModal('createProject');
            actions.closeModal('editProject');
          }}
          onSave={async () => {
            await actions.refreshData();
            actions.showNotification('Project saved', 'success');
          }}
        />
      )}

      {(state.modals.createTask || state.modals.editTask) && (
        <AddEditTaskModal
          task={state.modals.editTask ? state.selectedItem : undefined}
          employees={state.data?.employees || []}
          onClose={() => {
            actions.closeModal('createTask');
            actions.closeModal('editTask');
          }}
          onSave={async () => {
            await actions.refreshData();
            actions.showNotification('Task saved', 'success');
          }}
        />
      )}

      {(state.modals.createMaterial || state.modals.editMaterial) && (
        <AddEditMaterialModal
          material={state.modals.editMaterial ? state.selectedItem : undefined}
          projects={state.data?.projects || []}
          suppliers={state.data?.suppliers || []}
          onClose={() => {
            actions.closeModal('createMaterial');
            actions.closeModal('editMaterial');
          }}
          onSave={async () => {
            await actions.refreshData();
            actions.showNotification('Material saved', 'success');
          }}
        />
      )}

      <AIInsightsDetailModal />

      {/* Enhanced Notification System */}
      <NotificationSystem />

      <ConstyBot />
    </div>
  );
};

// Enhanced Notification System
const NotificationSystem = () => {
  const { state, actions } = useApp();

  if (state.notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {state.notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
            transform transition-all duration-300 ease-in-out
            ${notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }
          `}
        >
          <div className="flex-shrink-0">
            {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {notification.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-600" />}
            {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
          </div>
          <span className="text-sm font-medium flex-1">{notification.message}</span>
          <button
            onClick={() => {
              setState(prev => ({
                ...prev,
                notifications: prev.notifications.filter(n => n.id !== notification.id)
              }));
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Enhanced Data Table with Real-time Features
const EnhancedDataTable = ({ data, columns, title, onRowClick, onEdit, onDelete, searchable = true, exportable = true }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const itemsPerPage = 10;

  const filteredData = data.filter((item: any) =>
    searchable ? Object.values(item).some((value: any) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ) : true
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToCSV = () => {
    const csv = [
      columns.map((col: any) => col.header).join(','),
      ...sortedData.map((row: any) =>
        columns.map((col: any) => row[col.accessor]).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <SmartCard className="overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <div className="flex gap-2">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}
            {exportable && (
              <IconButton
                icon={Download}
                label="Export"
                onClick={exportToCSV}
                variant="primary"
                tooltip="Export to CSV"
              />
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(paginatedData.map(item => item.id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                />
              </th>
              {columns.map((column: any) => (
                <th
                  key={column.accessor}
                  onClick={() => {
                    if (sortColumn === column.accessor) {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortColumn(column.accessor);
                      setSortDirection('asc');
                    }
                  }}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {sortColumn === column.accessor && (
                      sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((row: any, index: number) => (
              <tr
                key={row.id || index}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedRows.includes(row.id) ? "bg-blue-50 dark:bg-blue-900" : ""
                }`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows([...selectedRows, row.id]);
                      } else {
                        setSelectedRows(selectedRows.filter(id => id !== row.id));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                {columns.map((column: any) => (
                  <td
                    key={column.accessor}
                    onClick={() => onRowClick?.(row)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                  >
                    {column.render ? column.render(row[column.accessor], row) : row[column.accessor]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <IconButton
                      icon={Edit}
                      label="Edit"
                      onClick={() => onEdit?.(row)}
                      size="sm"
                      variant="primary"
                      tooltip="Edit item"
                    />
                    <IconButton
                      icon={Trash2}
                      label="Delete"
                      onClick={() => onDelete?.(row.id)} // Use onDelete prop instead of deleteHandler
                      size="sm"
                      variant="danger"
                      tooltip="Delete item"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
            {selectedRows.length > 0 && (
              <span className="ml-2 text-blue-600">({selectedRows.length} selected)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {Math.ceil(sortedData.length / itemsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(Math.ceil(sortedData.length / itemsPerPage), currentPage + 1))}
              disabled={currentPage === Math.ceil(sortedData.length / itemsPerPage)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </SmartCard>
  );
};

// Helper: Generate project trends data for charts (line chart)
const generateProjectTrends = (data: any) => {
  if (!data || !data.projects) return [];
  // Example: show number of completed projects per month for the last 6 months
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleString('default', { month: 'short', year: '2-digit' }), date: d };
  });

  return months.map(({ label, date }, idx) => {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const completed = (data.projects || []).filter((p: any) => {
      if (!p.end_date && !p.deadline) return false;
      const end = new Date(p.end_date || p.deadline);
      return end >= date && end < nextMonth && (p.status === 'completed' || p.progress === 100);
    }).length;
    return { name: label, value: completed };
  });
};

// Helper: Generate resource utilization data for charts (bar chart)
const generateResourceUtilization = (data: any) => {
  if (!data) return [];
  // Example: show used vs available for materials, machines, employees
  const materialsUsed = (data.materials || []).reduce((sum: number, m: any) => sum + (m.used || 0), 0);
  const materialsTotal = (data.materials || []).reduce((sum: number, m: any) => sum + (m.quantity || 0), 0);
  const machinesUsed = Math.floor((data.machines || []).length * 0.85);
  const machinesTotal = (data.machines || []).length;
  const employeesUsed = Math.floor((data.employees || []).length * 0.9);
  const employeesTotal = (data.employees || []).length;

  return [
    { name: 'Materials', Used: materialsUsed, Available: Math.max(0, materialsTotal - materialsUsed) },
    { name: 'Machines', Used: machinesUsed, Available: Math.max(0, machinesTotal - machinesUsed) },
    { name: 'Employees', Used: employeesUsed, Available: Math.max(0, employeesTotal - employeesUsed) }
  ];
};

// Add this helper function near the top (before DashboardContent or where other helpers are defined)
const formatCurrency = (value: number) => {
  if (!value && value !== 0) return " $0";
  const n = Number(value) || 0;
  return `$${n.toLocaleString()}`;
};

const AccessRestrictedPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-red-950 animate-fade-in">
    <div className="flex flex-col items-center">
      <div className="mb-6">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-lg animate-pulse">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" d="M17 11V7a5 5 0 00-10 0v4"/>
            <rect width="16" height="10" x="4" y="11" rx="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="16" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        🚫 Access Restricted
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md">
        You do not have permission to view this page.
      </p>
      <a
        href="/dashboard"
        className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
      >
        Return to Dashboard
      </a>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  </div>
);