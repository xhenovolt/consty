"use client"
import { useState } from "react";
import WebsiteNavbar from "../components/WebsiteNavbar";
import AuthModal from "../components/AuthModal";

export default function AboutPage() {
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
      <section className="w-full max-w-4xl mx-auto px-4 py-16 flex flex-col items-center">
        <h2 className="text-4xl font-extrabold mb-4 text-[#0a2e57] text-center">Who We Are</h2>
        <p className="mb-6 text-lg text-center text-[#17613a]">At Consty Construction, we bring over 20 years of expertise in delivering top-tier construction services. From residential homes to commercial skyscrapers, our team blends innovation, precision, and sustainability to build structures that last a lifetime.<br/>We believe in transparent communication, cutting-edge technology, and client satisfaction as the pillars of our success.</p>
        <h3 className="text-2xl font-bold mb-2 text-[#0a2e57] text-center">Our Mission</h3>
        <p className="mb-6 text-lg text-center text-[#17613a]">To deliver exceptional construction solutions that exceed client expectations, foster long-term relationships, and contribute to the sustainable development of our communities.</p>
        <h3 className="text-2xl font-bold mb-2 text-[#0a2e57] text-center">Our Vision</h3>
        <p className="mb-6 text-lg text-center text-[#17613a]">To be the leading construction company in the region, recognized for our integrity, quality, and innovation in every project we undertake.</p>
        <h3 className="text-2xl font-bold mb-2 text-[#0a2e57] text-center">Our Values</h3>
        <ul className="mb-6 text-lg text-[#17613a] list-disc list-inside">
          <li><span className="font-semibold text-[#0a2e57]">Integrity:</span> We uphold the highest standards of honesty and transparency in all our dealings.</li>
          <li><span className="font-semibold text-[#0a2e57]">Quality:</span> We are committed to delivering superior workmanship and durable results.</li>
          <li><span className="font-semibold text-[#0a2e57]">Safety:</span> We prioritize the safety of our team, clients, and the public in every project.</li>
          <li><span className="font-semibold text-[#0a2e57]">Innovation:</span> We embrace new technologies and methods to provide efficient and sustainable solutions.</li>
          <li><span className="font-semibold text-[#0a2e57]">Customer Focus:</span> We listen to our clients and tailor our services to meet their unique needs.</li>
        </ul>
        <h3 className="text-2xl font-bold mb-2 text-[#0a2e57] text-center">Why Choose Us?</h3>
        <p className="mb-6 text-lg text-center text-[#17613a]">Our experienced team, attention to detail, and commitment to excellence set us apart. We manage every aspect of your project, from planning and design to construction and finishing, ensuring a seamless and stress-free experience.</p>
        <h3 className="text-2xl font-bold mb-2 text-[#0a2e57] text-center">Our Team</h3>
        <p className="mb-6 text-lg text-center text-[#17613a]">Consty Construction is powered by a diverse group of skilled professionals, including engineers, architects, project managers, and craftsmen. Our team is dedicated to continuous learning and improvement, staying ahead of industry trends to deliver the best results for our clients.</p>
        <h3 className="text-2xl font-bold mb-2 text-[#0a2e57] text-center">Sustainability & Community</h3>
        <p className="mb-6 text-lg text-center text-[#17613a]">We are committed to sustainable building practices and giving back to the communities we serve. Our projects are designed to minimize environmental impact and maximize value for future generations.</p>
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