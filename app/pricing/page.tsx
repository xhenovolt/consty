// This is a professional, futuristic pricing page for your system, positioned as a solution to customer problems, with PDF export.

"use client";

import React, { useEffect } from 'react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 250000,
    yearly: 2500000,
    staff: 'Up to 5',
    branches: '1',
    backups: 'Weekly',
    reports: 'Basic',
    support: 'Email',
    highlight: false,
    features: [
      'Weekly backups',
      'Basic reports',
      'Email support',
      '1 branch',
      'Up to 5 staff',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 450000,
    yearly: 4500000,
    staff: 'Up to 20',
    branches: 'Up to 3',
    backups: 'Daily',
    reports: 'Advanced & exports',
    support: 'WhatsApp + Email',
    training: 'Onsite/Remote',
    highlight: true,
    features: [
      'Daily backups',
      'Advanced reports & exports',
      'WhatsApp + Email support',
      'Up to 3 branches',
      'Up to 20 staff',
      'Onsite/Remote training',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 900000,
    yearly: 9000000,
    staff: 'Unlimited',
    branches: 'Unlimited',
    backups: 'Hourly + off-site',
    reports: 'BI connectors',
    support: '24/7 Phone/WhatsApp/Email',
    highlight: false,
    features: [
      'Hourly backups + off-site',
      'Business Intelligence connectors',
      'Full audit trail',
      '24/7 support',
      'Custom integrations (MoMo, SMS, Webhooks)',
      'Unlimited staff & branches',
    ],
  },
];

const differentiators = [
  { icon: <span role="img" aria-label="security">🔒</span>, label: 'Night Auto-Lock Security' },
  { icon: <span role="img" aria-label="branches">🏢</span>, label: 'Multi-Branch Ready' },
  { icon: <span role="img" aria-label="custom">⚙️</span>, label: 'Full Customisation' },
  { icon: <span role="img" aria-label="audit">📊</span>, label: 'Audit-Proof' },
  { icon: <span role="img" aria-label="scale">👥</span>, label: 'Scalable Infrastructure' },
  { icon: <span role="img" aria-label="local">🎓</span>, label: 'Local Understanding' },
];

const testimonials = [
  '“Trusted by schools in Iganga, Jinja, and beyond.”',
  '“Already trusted by growing institutions adopting digital transformation in Uganda.”',
];

const featureIcon = <span role="img" aria-label="check">✅</span>;

const PricingPage = () => {
  // useEffect(() => {
  //   // Hide navbar and sidebar if they exist
  //   const navbar = document.querySelector('.navbar, #navbar');
  //   const sidebar = document.querySelector('.sidebar, #sidebar');
  //   if (navbar) (navbar as HTMLElement).style.display = 'none';
  //   if (sidebar) (sidebar as HTMLElement).style.display = 'none';
  //   return () => {
  //     if (navbar) (navbar as HTMLElement).style.display = '';
  //     if (sidebar) (sidebar as HTMLElement).style.display = '';
  //   };
  // }, []);
  return (
    <div className="bg-gradient-to-b from-white to-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-black text-white grid place-items-center font-bold text-xl">XV</div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black">Xhenvolt Uganda — DRAIS</h1>
              <p className="text-xs text-slate-500">Digital Records & Academic Information System</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">Prepared for <span className="font-medium">Mr James Wilson Waiswa</span></p>
            <p className="text-xs text-slate-500">Project Manager - Lutheran Church of Uganda</p>
            <p className="text-xs text-slate-500">Prepared by Hamuza Ibrahim, Chief Visionary</p>
            <p className="text-xs text-slate-500">Issued: {new Date().toLocaleDateString()} | Valid Until: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
          </div>
        </div>
        {/* Hero */}
        <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-slate-100 mb-8">
          <h2 className="text-3xl font-bold mb-2 text-blue-700">DRAIS: The Future of Academic Management</h2>
          <p className="text-lg text-slate-700 mb-2">DRAIS is built to ensure your institution operates seamlessly — fast, secure, and fully customizable. Unlike typical systems, DRAIS adapts to your needs, ensures night-time auto-lock security, and guarantees smooth academic & financial operations across branches.</p>
          <p className="text-base text-green-700 font-semibold">Experience the difference between a system that just works — and one built to secure your future growth.</p>
        </div>
        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {plans.map((plan, idx) => (
            <div key={plan.id} className={`relative rounded-2xl bg-white p-8 shadow-lg border ${plan.highlight ? 'border-blue-700 ring-2 ring-blue-700' : 'border-gray-100'} flex flex-col items-center`}> 
              {plan.highlight && (
                <div className="absolute -top-4 right-4 bg-blue-700 text-white px-4 py-1 rounded-full text-xs font-bold shadow">Most Popular</div>
              )}
              <h3 className="text-2xl font-bold mb-2 text-blue-600">{plan.name}</h3>
              <p className="text-3xl font-extrabold text-gray-900 mb-2">USD{plan.price.toLocaleString()}<span className="text-base font-normal">/mo</span></p>
              <p className="text-lg text-gray-500 mb-2">or USD{plan.yearly.toLocaleString()}/yr</p>
              <ul className="text-sm text-gray-700 mb-6 space-y-1 text-left w-full">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">{featureIcon} {f}</li>
                ))}
              </ul>
              <button className={`w-full py-2 px-6 rounded-xl font-bold transition ${plan.highlight ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-blue-600 text-white hover:bg-blue-700'} shadow mb-2`}>Accept this plan</button>
            </div>
          ))}
        </div>
        {/* Differentiators */}
        <div className="mb-10">
          <h4 className="text-xl font-bold mb-4 text-blue-700">Why DRAIS is Different</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {differentiators.map((d, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 shadow">
                {d.icon}
                <span className="font-semibold text-slate-800">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Scope & Terms */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-slate-100">
            <h5 className="text-lg font-bold mb-2 text-blue-700">Scope Included</h5>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Deployment, setup, and brand customization.</li>
              <li>Import of existing records.</li>
              <li>Staff training sessions (depending on plan).</li>
              <li>Ongoing updates and security patches.</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-slate-100">
            <h5 className="text-lg font-bold mb-2 text-blue-700">Commercial Terms</h5>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Prices are VAT exclusive.</li>
              <li>Payment: 60% upfront, 40% after go-live (or Net 14).</li>
              <li>Offer valid until {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}.</li>
              <li>Month-to-month cancellation allowed.</li>
              <li>Data ownership remains with client.</li>
            </ul>
          </div>
        </div>
        {/* Testimonials */}
        <div className="mb-10">
          <h5 className="text-lg font-bold mb-2 text-blue-700">Testimonials</h5>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 shadow text-gray-700 italic">{t}</div>
            ))}
          </div>
        </div>
        {/* CTA */}
        <div className="rounded-2xl bg-blue-700 p-8 text-white text-center shadow mb-10">
          <h4 className="text-2xl font-bold mb-2">Choose DRAIS today and experience the difference!</h4>
          <p className="mb-4">Contact us: <span className="font-semibold">+256 7xx xxx xxx</span> | <span className="font-semibold">contact@xhenvolt.ug</span> | <span className="font-semibold">xhenvolt.ug</span></p>
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-xl shadow transition" onClick={() => window.print()}>Export as PDF</button>
        </div>
        {/* PDF Footer */}
        <footer className="text-xs text-center text-gray-400 py-6 print:text-black print:bg-white">
          Confidential Proposal prepared for Mr James Wilson Waiswa. Do not distribute without consent.
        </footer>
      </div>
    </div>
  );
};

export default PricingPage;