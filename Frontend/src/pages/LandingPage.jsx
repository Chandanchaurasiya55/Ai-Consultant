import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Search, BarChart2, FileText,
  TrendingUp, Users, Globe, Zap, ChevronRight, Star
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    { icon: Search,     title: 'Market Sizing',       desc: 'TAM, SAM, SOM calculated with live Google Search grounding — real numbers, not guesses.' },
    { icon: Users,      title: 'Customer Research',    desc: 'Deep persona profiles, buying behaviour, pain points, and jobs-to-be-done analysis.' },
    { icon: BarChart2,  title: 'Competitor Intel',     desc: 'SEO, pricing, social media, ads, and review mining across your top competitors.' },
    { icon: TrendingUp, title: 'Financial Projections',desc: 'CAC, LTV, break-even, gross margin, and 3-year revenue models.' },
    { icon: Globe,      title: 'Location Research',    desc: 'Best cities, states, purchasing power, and demand density mapped to your market.' },
    { icon: Zap,        title: 'Execution Roadmap',    desc: '30 / 60 / 90 / 180-day GTM plan with prioritised action tasks.' },
  ];

  const chapters = [
    'Business Idea Validation', 'Industry Overview', 'TAM / SAM / SOM',
    'Customer Research', 'Business Model Canvas', 'SWOT Analysis',
    'PESTEL Analysis', "Porter's Five Forces", 'Demand Research',
    'Keyword Research', 'Location Research', 'Competitor Mapping',
    'SEO Analysis', 'Social Media Analysis', 'Paid Ads Analysis',
    'Pricing Analysis', 'Review Mining', 'Financial Research',
    'Marketing Strategy', 'Sales Funnel', 'Risk Analysis', 'Execution Roadmap',
    'Templates Library', 'AI Prompt Library',
  ];

  return (
    <div className="overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-6 py-24">
        {/* background grid + blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #e0e7ff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              opacity: 0.45
            }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-indigo-100/60 blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-100/40 blur-3xl -z-10" />
        </div>

        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-medium mb-8 shadow-sm">
            <Sparkles size={12} className="fill-indigo-500 text-indigo-500" />
            AI-Powered · 28 Chapters · Google Search Grounded
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-semibold text-slate-900 tracking-tight leading-[1.08] mb-6">
            Your business,{' '}
            <span className="relative">
              <span className="bg-linear-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                researched deeply
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 9 Q75 2 150 9 Q225 16 298 9" stroke="url(#u)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="u" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1"/><stop offset="1" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
            {' '}by AI.
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Generate a full McKinsey-grade market research report — 28 chapters, live-grounded data,
            charts, diagrams, and brand assets — in minutes. Just describe your business.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <Link to="/register"
              className="group bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-7 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200">
              Get your free report
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#how-it-works"
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-normal px-7 py-3.5 rounded-xl flex items-center gap-2 shadow-sm transition-all duration-200">
              See how it works
            </a>
          </div>

          {/* social proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span>4.9 / 5 from early users</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <span>No credit card required</span>
            <div className="w-px h-4 bg-slate-200" />
            <span>Report ready in ~3 minutes</span>
          </div>
        </div>
      </section>


      {/* ── STATS STRIP ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-100 py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '28',    label: 'Research chapters' },
            { value: '5',     label: 'Report volumes' },
            { value: '3 min', label: 'Avg generation time' },
            { value: '100%',  label: 'Live-grounded data' },
          ].map(s => (
            <div key={s.label}>
              <div className="font-display text-3xl font-semibold text-indigo-600 mb-1">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REPORT PREVIEW MOCKUP ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest mb-3">What you get</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
              A complete research report, not a summary
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base font-normal leading-relaxed">
              Every chapter is written with real, grounded data pulled from the web at generation time.
            </p>
          </div>

          {/* browser mockup */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden">
            {/* browser bar */}
            <div className="bg-slate-100 px-4 py-3 flex items-center gap-3 border-b border-slate-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-slate-400 font-mono border border-slate-200">
                research-agent.ai/audit/report/demo
              </div>
            </div>

            <div className="flex min-h-[380px]">
              {/* sidebar */}
              <div className="hidden md:flex w-52 border-r border-slate-100 bg-slate-50/70 flex-col p-4 gap-1 shrink-0">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-2 mb-2">Chapters</p>
                {['Vol 1 — Foundations', 'Vol 2 — Strategy', 'Vol 3 — Competitors', 'Vol 4 — Operations', 'Vol 5 — Toolkit'].map((v, i) => (
                  <div key={v} className={`text-xs px-3 py-2 rounded-lg font-normal ${i === 1 ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                    {v}
                  </div>
                ))}
              </div>

              {/* main content */}
              <div className="flex-1 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-medium text-indigo-500 uppercase tracking-widest">Chapter 6</span>
                  <span className="text-slate-200">·</span>
                  <span className="text-[10px] text-slate-400">SWOT Analysis</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-slate-900 mb-4">Strengths, Weaknesses, Opportunities & Threats</h3>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {/* Strengths */}
                  <div className="p-3 rounded-xl border bg-emerald-50/60 border-emerald-100">
                    <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider mb-2">Strengths</p>
                    {['Low COGS vs competitors', 'Strong D2C margins', 'No legacy infrastructure'].map(item => (
                      <div key={item} className="flex items-start gap-1.5 mb-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span className="text-[11px] text-slate-600 font-normal leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* Weaknesses */}
                  <div className="p-3 rounded-xl border bg-red-50/60 border-red-100">
                    <p className="text-[10px] font-medium text-red-500 uppercase tracking-wider mb-2">Weaknesses</p>
                    {['Brand awareness gap', 'Limited initial capital', 'No offline distribution'].map(item => (
                      <div key={item} className="flex items-start gap-1.5 mb-1">
                        <div className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        <span className="text-[11px] text-slate-600 font-normal leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* Opportunities */}
                  <div className="p-3 rounded-xl border bg-blue-50/60 border-blue-100">
                    <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wider mb-2">Opportunities</p>
                    {['Eco-trend growing 18% YoY', 'Underserved Tier-2 cities', 'Social commerce expansion'].map(item => (
                      <div key={item} className="flex items-start gap-1.5 mb-1">
                        <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <span className="text-[11px] text-slate-600 font-normal leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* Threats */}
                  <div className="p-3 rounded-xl border bg-orange-50/60 border-orange-100">
                    <p className="text-[10px] font-medium text-orange-500 uppercase tracking-wider mb-2">Threats</p>
                    {['Amazon private labels', 'Rising ad costs', 'Supply chain volatility'].map(item => (
                      <div key={item} className="flex items-start gap-1.5 mb-1">
                        <div className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                        <span className="text-[11px] text-slate-600 font-normal leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {['3 Charts', '2 Diagrams', '4 Recommendations', 'Trust Indicators'].map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-1 rounded-full font-normal">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── CHAPTER GRID ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest mb-3">Full coverage</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
              28 chapters across 5 volumes
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base font-normal leading-relaxed">
              Every section is backed by live web research — not templates, not generic advice.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {chapters.map((ch, i) => (
              <div key={ch}
                className="group bg-white border border-slate-100 rounded-xl px-3.5 py-3 flex items-center gap-2.5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-150 cursor-default">
                <span className="text-[10px] font-medium text-indigo-400 w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-xs text-slate-600 font-normal leading-snug group-hover:text-slate-800 transition-colors">{ch}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest mb-3">Process</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
              From idea to full report in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-slate-200 z-0" />

            {[
              {
                num: '01', icon: FileText,
                title: 'Describe your business',
                desc: 'Fill a 2-step form — business name, industry, model, stage, and target market. That\'s it.',
              },
              {
                num: '02', icon: Zap,
                title: 'AI researches everything',
                desc: 'Gemini runs 5 parallel research calls with Google Search grounding, pulling real market data.',
              },
              {
                num: '03', icon: BarChart2,
                title: 'Download your report',
                desc: 'Get 28 chapters with charts, Mermaid diagrams, and strategic recommendations. Export to DOCX.',
              },
            ].map(step => (
              <div key={step.num} className="relative z-10 bg-white border border-slate-200 rounded-2xl p-7 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <step.icon size={20} className="text-indigo-600" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-medium text-indigo-500 uppercase tracking-widest mb-2 block">Step {step.num}</span>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 font-normal leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-medium text-indigo-500 uppercase tracking-widest mb-3">What's inside</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              Every research dimension covered
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title}
                className="group p-6 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-sm transition-all duration-200">
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <f.icon size={17} className="text-indigo-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 font-normal leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-50/60">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-indigo-600 rounded-3xl p-12 sm:p-16 text-center overflow-hidden">
            {/* subtle background texture */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} />
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-violet-600 rounded-full blur-3xl opacity-40" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 text-indigo-100 text-xs font-normal px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
                <Sparkles size={11} className="fill-white" /> Free to start · No card needed
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4 leading-tight">
                Ready to research your business?
              </h2>
              <p className="text-indigo-200 text-base font-normal max-w-lg mx-auto mb-8 leading-relaxed">
                Describe your idea in 2 minutes. Get a 28-chapter, investor-ready research report powered by Google-grounded AI.
              </p>
              <Link to="/register"
                className="group inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-slate-50 text-sm font-medium px-8 py-3.5 rounded-xl shadow-lg transition-all duration-200">
                Start for free
                <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Sparkles size={15} className="text-indigo-600 fill-indigo-500" />
            Business Research Agent
          </div>
          <p className="text-xs text-slate-400 font-normal">
            © {new Date().getFullYear()} · Powered by Google Gemini &amp; Search Grounding
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
