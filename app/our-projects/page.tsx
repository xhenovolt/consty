"use client"
import { useState } from "react";
import WebsiteNavbar from "../components/WebsiteNavbar";
import AuthModal from "../components/AuthModal";

export default function ProjectsPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  return (
    <div
      style={{
        backgroundImage: "url(http://localhost/consty/public/contact.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-950 text-gray-900 dark:text-gray-100"
    >
      <WebsiteNavbar onOpenAuth={(mode) => {
        setAuthMode(mode);
        setShowAuth(true);
      }} />
      <section className="w-full max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-[#0a2e57]">Portfolio of Excellence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-[#17613a]">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 hover:scale-105 transition flex flex-col items-center">
            <img src="/consty/complex.png" alt="Modern Residential Complex" className="rounded-lg mb-4 h-32 w-full object-cover" />
            <h3 className="font-bold text-lg mb-2 text-[#0a2e57]">Modern Residential Complex</h3>
            <p className="text-center">City Center</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 hover:scale-105 transition flex flex-col items-center">
            <img src="/consty/office tower.png" alt="Innovative Office Tower" className="rounded-lg mb-4 h-32 w-full object-cover" />
            <h3 className="font-bold text-lg mb-2 text-[#0a2e57]">Innovative Office Tower</h3>
            <p className="text-center">Tech District</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 hover:scale-105 transition flex flex-col items-center">
            <img src="/consty/school.png" alt="Eco-Friendly School Campus" className="rounded-lg mb-4 h-32 w-full object-cover" />
            <h3 className="font-bold text-lg mb-2 text-[#0a2e57]">Eco-Friendly School Campus</h3>
            <p className="text-center">Greenfield</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 hover:scale-105 transition flex flex-col items-center">
            <img src="/consty/villa.png" alt="Luxury Villa" className="rounded-lg mb-4 h-32 w-full object-cover" />
            <h3 className="font-bold text-lg mb-2 text-[#0a2e57]">Luxury Villa</h3>
            <p className="text-center">Lakeside Retreat</p>
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