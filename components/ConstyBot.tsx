"use client";
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Wrench, Construction, Package, Users, DollarSign, FileText } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface ConstyKnowledge {
  [key: string]: {
    response: string;
    suggestions?: string[];
  };
}

const ConstyBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const constyKnowledge: ConstyKnowledge = {
    // General System Questions
    'what is consty': {
      response: "Consty is a comprehensive construction management system designed to help construction companies manage projects, tasks, materials, equipment, and workforce efficiently. It provides real-time insights, budget tracking, and streamlined operations.",
      suggestions: ["How do I create a project?", "What features does Consty offer?", "How to manage materials?"]
    },
    'features': {
      response: "Consty offers: 🏗️ Project Management, 📋 Task Tracking, 📦 Material Management, 👥 Workforce Management, 🔧 Equipment Tracking, 💰 Budget & Expense Management, 📊 Real-time Dashboard, 📈 Reports & Analytics, and 🔐 Role-based Access Control.",
      suggestions: ["How to create a project?", "Managing team members", "Track expenses"]
    },
    
    // Project Management
    'create project': {
      response: "To create a new project: 1) Navigate to Projects section, 2) Click 'Add New Project', 3) Fill in project details (name, client, location, budget, timeline), 4) Assign team members, 5) Set project status. The project will appear in your dashboard immediately.",
      suggestions: ["How to assign tasks?", "Set project budget", "Add team members"]
    },
    'project status': {
      response: "Projects can have different statuses: 'Planned' (not yet started), 'Ongoing' (active work), 'Paused' (temporarily stopped), 'Completed' (finished), or 'Cancelled'. You can update status from the project details page.",
      suggestions: ["Track project progress", "Manage project budget", "View project timeline"]
    },
    
    // Task Management
    'create task': {
      response: "To create tasks: 1) Go to Tasks section or open a specific project, 2) Click 'Add Task', 3) Enter task details (title, description, deadline, priority), 4) Assign to team member(s), 5) Set dependencies if needed. Tasks help break down projects into manageable work items.",
      suggestions: ["Assign task to employee", "Set task priority", "Track task progress"]
    },
    'task priority': {
      response: "Tasks have three priority levels: 'High' (urgent, critical tasks), 'Medium' (important but not urgent), and 'Low' (nice to have). High priority tasks appear first in lists and get highlighted in red.",
      suggestions: ["Create high priority task", "View overdue tasks", "Task assignment"]
    },
    
    // Material Management
    'manage materials': {
      response: "Material management includes: Adding new materials with quantities and costs, tracking material usage per project, monitoring stock levels, setting low-stock alerts, and managing supplier information. Go to Materials section to get started.",
      suggestions: ["Add new material", "Check stock levels", "Order materials"]
    },
    'low stock': {
      response: "When materials are running low (less than 10 units), Consty automatically shows alerts in the dashboard. You'll see notifications in the Priority Alerts section and the material will be highlighted in the materials list.",
      suggestions: ["Order materials", "Set stock alerts", "View material usage"]
    },
    
    // Employee/Workforce Management
    'add employee': {
      response: "To add team members: 1) Go to Employees section, 2) Click 'Add Employee', 3) Enter personal details (name, role, contact), 4) Set permissions and access level, 5) Assign to projects if needed. Employees can then log their working hours.",
      suggestions: ["Set employee roles", "Track working hours", "Assign employee to project"]
    },
    'working hours': {
      response: "Employees can log their daily working hours by project and task. This data is used for payroll calculation, project costing, and productivity analysis. Hours are tracked in the Working Hours section.",
      suggestions: ["View employee hours", "Calculate payroll", "Project time tracking"]
    },
    
    // Equipment Management
    'manage equipment': {
      response: "Equipment management tracks all machinery and tools: Add equipment details (name, type, purchase date, maintenance schedule), track equipment location and usage, schedule maintenance, and monitor equipment costs.",
      suggestions: ["Add new equipment", "Schedule maintenance", "Track equipment usage"]
    },
    
    // Financial Management
    'track expenses': {
      response: "Expense tracking covers: Recording project expenses by category (materials, labor, equipment), tracking against budget, viewing spending trends, and generating financial reports. All expenses are linked to specific projects.",
      suggestions: ["Add expense", "View budget status", "Financial reports"]
    },
    'budget management': {
      response: "Budget management helps you: Set project budgets, track actual spending vs. planned budget, get alerts when approaching budget limits (80%+ utilization), and analyze cost performance across projects.",
      suggestions: ["Set project budget", "View spending alerts", "Cost analysis"]
    },
    
    // Dashboard & Reports
    'dashboard': {
      response: "The dashboard provides a real-time overview: Key metrics (active projects, pending tasks, budget status), project progress charts, resource status, priority alerts, and quick action buttons for common tasks.",
      suggestions: ["View project progress", "Check alerts", "Quick actions"]
    },
    'reports': {
      response: "Consty generates various reports: Project progress reports, financial summaries, resource utilization, employee productivity, and custom reports. Reports can be exported and scheduled for regular delivery.",
      suggestions: ["Generate project report", "Financial summary", "Export data"]
    },
    
    // User Roles & Permissions
    'user roles': {
      response: "Consty has three main roles: 'Admin' (full system access), 'Manager' (project and team management), and 'User' (limited access to assigned tasks). Each role has specific permissions and dashboard views.",
      suggestions: ["Admin permissions", "Manager access", "Employee access"]
    },
    
    // Help & Support
    'help': {
      response: "Need help? You can: 1) Use this chatbot for quick questions, 2) Check the user manual in the Help section, 3) Contact system administrator, 4) Join our training sessions for advanced features.",
      suggestions: ["Contact support", "Training sessions", "User manual"]
    }
  };

  const quickStartSuggestions = [
    "What is Consty?",
    "How do I create a project?",
    "How to manage materials?",
    "Track project expenses",
    "Add team members",
    "What features does Consty offer?"
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "👋 Hello! I'm your Consty assistant. I can help you with construction project management, materials, workforce, budgets, and more. What would you like to know?",
        isBot: true,
        timestamp: new Date(),
        suggestions: quickStartSuggestions
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const findBestMatch = (query: string): string => {
    const lowercaseQuery = query.toLowerCase();
    
    // Direct keyword matching
    for (const [key, data] of Object.entries(constyKnowledge)) {
      if (lowercaseQuery.includes(key) || key.includes(lowercaseQuery.replace(/[?]/g, ''))) {
        return key;
      }
    }
    
    // Fuzzy matching for common variations
    if (lowercaseQuery.includes('project') && (lowercaseQuery.includes('new') || lowercaseQuery.includes('add'))) return 'create project';
    if (lowercaseQuery.includes('task') && (lowercaseQuery.includes('new') || lowercaseQuery.includes('add'))) return 'create task';
    if (lowercaseQuery.includes('material') && (lowercaseQuery.includes('manage') || lowercaseQuery.includes('stock'))) return 'manage materials';
    if (lowercaseQuery.includes('employee') || lowercaseQuery.includes('staff') || lowercaseQuery.includes('worker')) return 'add employee';
    if (lowercaseQuery.includes('equipment') || lowercaseQuery.includes('machine')) return 'manage equipment';
    if (lowercaseQuery.includes('expense') || lowercaseQuery.includes('cost')) return 'track expenses';
    if (lowercaseQuery.includes('budget')) return 'budget management';
    if (lowercaseQuery.includes('role') || lowercaseQuery.includes('permission')) return 'user roles';
    if (lowercaseQuery.includes('feature') || lowercaseQuery.includes('what can')) return 'features';
    
    return '';
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const matchedKey = findBestMatch(messageText);
      let botResponse = "I'm sorry, I don't have specific information about that. Here are some topics I can help with: project management, task creation, material tracking, budget management, employee management, equipment tracking, and system features. Could you please rephrase your question?";
      let suggestions: string[] = quickStartSuggestions;

      if (matchedKey && constyKnowledge[matchedKey]) {
        botResponse = constyKnowledge[matchedKey].response;
        suggestions = constyKnowledge[matchedKey].suggestions || quickStartSuggestions;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
        suggestions
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "👋 Chat cleared! How can I help you with Consty today?",
        isBot: true,
        timestamp: new Date(),
        suggestions: quickStartSuggestions
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'hidden' : 'flex'
        } items-center justify-center`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Consty Assistant</h3>
                <p className="text-xs opacity-90">Construction Management Help</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="text-blue-200 hover:text-white transition text-xs px-2 py-1 rounded"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-200 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse'}`}>
                  <div className={`p-2 rounded-full ${message.isBot ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    {message.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.isBot
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                    {message.suggestions && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.suggestions.slice(0, 3).map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(suggestion)}
                            className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Consty features..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConstyBot;
