"use client"
import { useState } from "react";
import WebsiteNavbar from "../components/WebsiteNavbar";
import AuthModal from "../components/AuthModal";

export default function ServicesPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  return (
    <div
      style={{
        backgroundImage: "url(http://localhost/consty/public/contact.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="min-h-screen"
    >
      <WebsiteNavbar onOpenAuth={(mode) => {
        setAuthMode(mode);
        setShowAuth(true);
      }} />
      
      <section className="w-full max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-[#0a2e57]">Comprehensive Construction Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-[#17613a]">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 flex flex-col items-center hover:scale-105 transition">
            <span className="mb-4 text-blue-700 dark:text-blue-300"><i className="bi bi-house-door text-4xl"></i></span>
            <h3 className="font-bold text-lg mb-2 text-[#0a2e57]">Residential Construction</h3>
            <p className="text-center">Custom homes built to your vision with quality materials and craftsmanship.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 flex flex-col items-center hover:scale-105 transition">
            <span className="mb-4 text-blue-700 dark:text-blue-300"><i className="bi bi-building text-4xl"></i></span>
            <h3 className="font-bold text-lg mb-2 text-[#0a2e57]">Commercial Projects</h3>
            <p className="text-center">Office buildings, retail spaces, and industrial facilities designed for performance.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 flex flex-col items-center hover:scale-105 transition">
            <span className="mb-4 text-blue-700 dark:text-blue-300"><i className="bi bi-arrow-repeat text-4xl"></i></span>
            <h3 className="font-bold text-lg mb-2 text-[#0a2e57]">Renovation & Remodeling</h3>
            <p className="text-center">Transform your existing spaces with our expert renovation solutions.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 flex flex-col items-center hover:scale-105 transition">
            <span className="mb-4 text-blue-700 dark:text-blue-300"><i className="bi bi-clipboard-check text-4xl"></i></span>
            <h3 className="font-bold text-lg mb-2 text-[#0a2e57]">Project Management</h3>
            <p className="text-center">End-to-end project oversight ensuring timelines, budget control, and quality.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 flex flex-col items-center hover:scale-105 transition">
            <span className="mb-4 text-blue-700 dark:text-blue-300"><i className="bi bi-leaf text-4xl"></i></span>
            <h3 className="font-bold text-lg mb-2 text-[#0a2e57]">Sustainable Building</h3>
            <p className="text-center">Eco-friendly construction techniques to reduce environmental impact.</p>
          </div>
        </div>
      </section>
      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          switchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  );
}