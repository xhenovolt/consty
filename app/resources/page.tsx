"use client";
import React, { useEffect, useState } from "react";

export default function ResourceTrackingPage() {
  // Placeholder for materials, machines, team members, working hours
  // You can expand with API calls and UI as needed
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-2 md:px-0">
      <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-8">Resource Tracking</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">Materials</h2>
          <p className="text-gray-500 mb-2">Track materials used, needed, damaged, leftover, and money spent.</p>
          {/* Add materials log and summary here */}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">Machines</h2>
          <p className="text-gray-500 mb-2">Track machines, usage, and status.</p>
          {/* Add machines log and summary here */}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">Team Members</h2>
          <p className="text-gray-500 mb-2">See which team members are assigned to which projects.</p>
          {/* Add team member assignment and tracking here */}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">Working Hours</h2>
          <p className="text-gray-500 mb-2">Record and view employee working hours per project.</p>
          {/* Add working hours log and summary here */}
        </div>
      </div>
    </div>
  );
}
