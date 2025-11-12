"use client";
import { useState } from "react";
import WebsiteNavbar from "../components/WebsiteNavbar";
import AuthModal from "../components/AuthModal";

export default function ContactPage() {
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
      <section className="w-full max-w-4xl mx-auto px-4 py-16" id="contact">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-[#0a2e57]">Ready to Build Your Dream?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#17613a]">
          <form className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 flex flex-col gap-6">
            <input type="text" placeholder="Your Name" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none" required />
            <input type="email" placeholder="Your Email" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none" required />
            <textarea placeholder="Project Details" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none" rows={5} required />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg">Send Message</button>
          </form>
          <div className="flex flex-col gap-4 justify-center">
            <div><strong>Email:</strong> info@consty.com</div>
            <div><strong>Phone:</strong> +252 610743070 / 0616793910</div>
            <div><strong>Address:</strong> Maka Al-Mukarama, Moqdishu, Somalia</div>
            <iframe src="https://maps.google.com/maps?q=Maka%20Al-Mukarama%2C%20Moqdishu%2C%20Somalia&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="200" className="rounded-xl border-none" loading="lazy"></iframe>
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