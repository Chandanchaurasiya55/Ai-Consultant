import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Database, PieChart, FileText } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="pb-20 animate-fade-in">
      {/* Hero Section */}
      <header className="py-20 text-center relative overflow-hidden px-6">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-2 rounded-full text-xs font-semibold mb-6">
            <Sparkles size={14} />
            <span>AI-Powered Strategy Audit for Smarter Growth</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto mb-6 leading-tight">
            Your Virtual AI <span className="bg-gradient-to-r from-brand-600 to-indigo-400 bg-clip-text text-transparent">Marketing Consultant</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Instantly audit your business operations, product positioning, and active channels. Receive structured, actionable 30-60-90 day marketing roadmap reports in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/register" className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-7 py-3.5 rounded-lg flex items-center gap-2 shadow-sm hover:shadow transition-all duration-200">
              Generate Your Audit Report <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium px-7 py-3.5 rounded-lg flex items-center gap-2 shadow-sm transition-all duration-200">
              See How It Works
            </a>
          </div>

          {/* Interactive UI Mockup to wow the user */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xl max-w-4xl mx-auto transform hover:scale-[1.01] transition-transform duration-300 text-left">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-xs text-slate-400 ml-3 font-mono">consultant.ai/dashboard/report_demo</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-1 flex flex-col gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audit Score</h4>
                  <div className="text-3xl font-extrabold text-brand-600 mt-1">84<span className="text-sm font-medium text-slate-400">/100</span></div>
                  <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">↑ Strong Value Prop</div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Quick SWOT Analysis</h4>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-md font-semibold">S: Unique Offering</span>
                    <span className="bg-red-50 text-red-700 text-[10px] px-2 py-0.5 rounded-md font-semibold">W: Low Visibility</span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-md font-semibold">O: SEO Growth</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase text-brand-600 tracking-wider">Recommended Strategy</span>
                    <span className="text-[10px] text-slate-400">Updated just now</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Target: Multi-Channel Traction</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Focus energy primarily on SEO and organic content. Your target audience responds heavily to authentic case studies rather than broad advertising banners.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm text-xs">
                    <strong className="block text-slate-900 mb-0.5">30 Days</strong>
                    <span className="text-slate-500 text-[11px] leading-tight block">On-page SEO setup</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm text-xs">
                    <strong className="block text-slate-900 mb-0.5">60 Days</strong>
                    <span className="text-slate-500 text-[11px] leading-tight block">Targeted email funnels</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm text-xs">
                    <strong className="block text-slate-900 mb-0.5">90 Days</strong>
                    <span className="text-slate-500 text-[11px] leading-tight block">Viral loops launch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Stats Strip */}
      <section className="bg-white border-y border-slate-200/80 mb-24 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="font-display text-4xl font-extrabold text-brand-600 mb-1">98%</div>
            <div className="text-sm text-slate-600 font-medium">Client Approval Rate</div>
          </div>
          <div>
            <div className="font-display text-4xl font-extrabold text-brand-600 mb-1">50k+</div>
            <div className="text-sm text-slate-600 font-medium">Audits Generated</div>
          </div>
          <div>
            <div className="font-display text-4xl font-extrabold text-brand-600 mb-1">10x</div>
            <div className="text-sm text-slate-600 font-medium">Average Strategy Speedup</div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 mb-24">
        <h2 className="font-display text-3xl font-bold text-center text-slate-900 mb-3">How It Works</h2>
        <p className="text-center text-slate-600 max-w-lg mx-auto mb-16">Get a complete marketing assessment in three simple steps.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center">
            <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-6">
              <Database size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-2 block">Step 01</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Enter Details</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Fill in your business name, product offerings, target audience, and detail what your company does.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center">
            <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-6">
              <PieChart size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-2 block">Step 02</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI Analysis</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Our intelligent algorithm audits your sector, checks SWOT vectors, and compares marketing channels.</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center">
            <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-6">
              <FileText size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-2 block">Step 03</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Get Plan & PDF</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Review your interactive strategy online and export the full, beautifully designed marketing roadmap to PDF.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-12 text-white text-center shadow-xl">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Audit Your Marketing?</h2>
          <p className="text-indigo-100 max-w-xl mx-auto mb-8 text-base">Create a free account today to analyze your product channels and design a bulletproof strategy.</p>
          <Link to="/register" className="bg-white text-brand-600 hover:bg-slate-50 font-bold px-8 py-3.5 rounded-lg shadow transition-all duration-200 inline-block">
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
