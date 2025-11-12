"use client";
import React, { useState } from "react";
import Link from "next/link";
import AuthModal from "./components/AuthModal";
import { motion } from "framer-motion";

function WebsiteNavbar({ onOpenAuth }: { onOpenAuth: (mode: 'login'|'signup') => void }) {
  return (
    <nav className="w-full flex justify-between py-2 bg-gradient-to-br from-gray-50 to-blue-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-950 text-gray-900 dark:text-gray-100 shadow mb-8">
      <div className="flex gap-2 text-lg font-bold items-center justify-between w-full max-w-6xl px-4">
        <div className="mx-4">
          <Link href="/" className="flex items-center gap-2 mr-28">
            <img src="/consty/consty.png" alt="Consty Logo" className="h-10 w-auto" style={{display:'inline-block', verticalAlign:'middle'}} />
            <span className="text-2xl font-extrabold text-[#0a2e57] tracking-wide">Consty</span>
          </Link>
        </div>
          
        <div className="flex gap-8 text-lg font-bold items-center justify-between  max-w-6xl">
        <Link href="/" className="text-blue-700 dark:text-blue-300 hover:underline">Home</Link>
        <Link href="/about" className="text-blue-700 dark:text-blue-300 hover:underline">About</Link>
        <Link href="/services" className="text-blue-700 dark:text-blue-300 hover:underline">Services</Link>
        <Link href="/our-projects" className="text-blue-700 dark:text-blue-300 hover:underline">Projects</Link>
        <Link href="/contact" className="text-blue-700 dark:text-blue-300 hover:underline">Contact</Link>
        <button onClick={()=>onOpenAuth('login')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded-xl shadow transition text-lg">Login</button>
        </div>
      </div>
    </nav>
  );
}

export default function HomePage() {
  const [showAuth,setShowAuth]=useState(false);
  const [authMode,setAuthMode]=useState<'login'|'signup'>('login');
  // Define the solutions array
  const solutions = [
    {
      title: "Project Management",
      description: "Streamline your construction projects with advanced tools.",
      icon: "📋",
    },
    {
      title: "AI Insights",
      description: "Leverage AI to predict risks and optimize costs.",
      icon: "🤖",
    },
    {
      title: "Resource Tracking",
      description: "Monitor materials, machines, and workforce in real-time.",
      icon: "📦",
    },
  ];
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-200 dark:from-gray-600 dark:to-blue-900">
      <WebsiteNavbar onOpenAuth={(m)=>{setAuthMode(m);setShowAuth(true);}} />
      <div className="home-1" style={{
          backgroundImage: "url(http://localhost/consty/public/apart.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>

      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center justify-center py-40 px-4 text-[#0a2e57] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-cover bg-center"></div>
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center drop-shadow-lg animate-fadeIn text-[#0a2e57]">Building Tomorrow, Today</h1>
          <p className="text-2xl mb-8 text-center max-w-2xl mx-auto animate-fadeIn text-[#17613a]">Innovative Construction Solutions | Quality Craftsmanship | Timely Delivery</p>
          <Link href="#contact" className="bg-white text-blue-700 font-bold py-3 px-8 rounded-xl shadow hover:bg-blue-100 transition text-lg animate-fadeIn">Get Your Free Quote Now →</Link>
        </div>
      </section>

      {/* About Us Section */}
     

      {/* Services Section */}
      {/* Why Choose Us Section */}
      <section
        className="w-full max-w-5xl mx-auto px-4 py-16"
        style={{
          backgroundImage: "url(http://localhost/consty/public/apart.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h2 className="text-4xl font-extrabold mb-8 text-center text-[#0a2e57]">What Sets Us Apart</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg text-[#17613a]">
          <li className="flex flex-col gap-2 bg-white dark:bg-gray-900 rounded-xl shadow p-6">
            <span className="text-[#0a2e57]"><i className="bi bi-award text-2xl"></i></span>
            <span className="font-bold text-[#0a2e57]">Experienced & Certified Team</span>
            <span>Our team is composed of highly skilled professionals with years of experience in the construction industry. Each member is certified in their respective fields, ensuring that every project is handled with expertise and care. We invest in continuous training and development to keep our team updated with the latest industry standards and best practices.</span>
          </li>
          <li className="flex flex-col gap-2 bg-white dark:bg-gray-900 rounded-xl shadow p-6">
            <span className="text-[#0a2e57]"><i className="bi bi-cpu text-2xl"></i></span>
            <span className="font-bold text-[#0a2e57]">Cutting-Edge Technology & Equipment</span>
            <span>We utilize the latest construction technologies and state-of-the-art equipment to deliver efficient, precise, and innovative solutions. Our commitment to technology allows us to streamline processes, reduce costs, and ensure the highest quality outcomes for our clients.</span>
          </li>
          <li className="flex flex-col gap-2 bg-white dark:bg-gray-900 rounded-xl shadow p-6">
            <span className="text-[#0a2e57]"><i className="bi bi-cash-coin text-2xl"></i></span>
            <span className="font-bold text-[#0a2e57]">Transparent Pricing & Honest Communication</span>
            <span>We believe in building trust through transparency. Our pricing is clear and detailed, with no hidden fees. We maintain open lines of communication throughout every stage of the project, keeping you informed and involved in all key decisions.</span>
          </li>
          <li className="flex flex-col gap-2 bg-white dark:bg-gray-900 rounded-xl shadow p-6">
            <span className="text-[#0a2e57]"><i className="bi bi-clock-history text-2xl"></i></span>
            <span className="font-bold text-[#0a2e57]">On-Time Delivery Guarantee</span>
            <span>We understand the importance of deadlines. Our project management approach is meticulous, allowing us to deliver projects on schedule without compromising on quality. We proactively address potential delays and keep you updated on progress at all times.</span>
          </li>
          <li className="flex flex-col gap-2 bg-white dark:bg-gray-900 rounded-xl shadow p-6">
            <span className="text-[#0a2e57]"><i className="bi bi-shield-check text-2xl"></i></span>
            <span className="font-bold text-[#0a2e57]">Safety & Compliance Prioritized</span>
            <span>Safety is at the core of our operations. We strictly adhere to all safety regulations and industry standards, ensuring a secure environment for our workers, clients, and the public. Our safety record is a testament to our commitment to responsible construction practices.</span>
          </li>
          <li className="flex flex-col gap-2 bg-white dark:bg-gray-900 rounded-xl shadow p-6">
            <span className="text-[#0a2e57]"><i className="bi bi-person-badge text-2xl"></i></span>
            <span className="font-bold text-[#0a2e57]">Customized Solutions for Every Client</span>
            <span>We recognize that every client and project is unique. Our team works closely with you to understand your specific needs and preferences, delivering tailored solutions that align with your vision, budget, and timeline. Your satisfaction is our top priority.</span>
          </li>
        </ul>
      </section>
      </div>

     
      {/* Projects Section */}
     <div className="section-3" style={{
          backgroundImage: "url(http://localhost/consty/public/contact.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
      {/* Testimonials Section */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-[#0a2e57]">Hear from Our Clients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#17613a]">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col items-center">
            <img src="/consty/valentino.png" alt="Jane M." className="rounded-full h-16 w-16 mb-4 object-cover" />
            <p className="italic mb-2">“Consty Construction exceeded our expectations. Professional and reliable from start to finish.”</p>
            <span className="font-bold">– Jane M.</span>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col items-center">
            <img src="/consty/zuckerberg.png" alt="Michael R." className="rounded-full h-16 w-16 mb-4 object-cover" />
            <p className="italic mb-2">“Timely delivery and outstanding craftsmanship. Highly recommended.”</p>
            <span className="font-bold">– Michael R.</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        className="w-full max-w-4xl mx-auto px-4 py-16"
        id="contact"
      >
        <h2 className="text-4xl font-extrabold mb-8 text-center text-[#0a2e57]">Ready to Build Your Dream?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#17613a]">
          <form className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 flex flex-col gap-6">
            <input type="text" placeholder="Your Name" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none" required />
            <input type="email" placeholder="Your Email" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none" required />
            <textarea placeholder="Project Details" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 outline-none" rows={5} required />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow transition text-lg">Send Message</button>
          </form>
          <div className="flex flex-col gap-4 justify-center">
            <div><strong>Phone:</strong> +252 610743070 / 0616793910</div>
            <div><strong>Email:</strong> info@consty.com</div>
            <div><strong>Location:</strong> Maka Al-Mukarama, Moqdishu, Somalia</div>
            <iframe src="https://maps.google.com/maps?q=Maka%20Al-Mukarama%2C%20Moqdishu%2C%20Somalia&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="200" className="rounded-xl border-none" loading="lazy"></iframe>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-[#0a2e57]">Our Innovative Solutions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col gap-4"
            >
              <div className="text-4xl">{solution.icon}</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#0a2e57]">{solution.title}</h3>
                <p className="text-[#17613a]">{solution.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

     </div>

      {showAuth && <AuthModal mode={authMode} onClose={()=>setShowAuth(false)} switchMode={(m)=>setAuthMode(m)} />}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity:0;} to {opacity:1;} }
        .animate-fadeIn { animation: fadeIn 0.4s ease; }
      `}</style>
    </div>
  );
}
