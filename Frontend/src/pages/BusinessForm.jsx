import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Sparkles, Check,
  Globe, Briefcase, Users, Activity, Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BusinessForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [enriching, setEnriching] = useState(false);
  const [enrichFeedback, setEnrichFeedback] = useState('');

  const [formData, setFormData] = useState({
    // Step 1 — Business Identity
    businessName: '',
    industry: '',
    businessModel: '',
    businessStage: '',
    businessDescription: '',
    websiteUrl: '',
    // Step 2 — Market Context
    targetCountry: '',
    targetAudience: '',
    products: '',
    marketingBudget: '',
    priceRange: '',
    competitors: [],
  });

  const [newCompetitor, setNewCompetitor] = useState('');

  const strategicSteps = [
    { num: 1, name: 'Scanning details & grounding search',        desc: 'Validating domain and running Google Search queries...' },
    { num: 2, name: 'Analyzing TAM/SAM/SOM market sizes',         desc: 'Evaluating sector statistics and industry growth CAGR...' },
    { num: 3, name: 'Profiling customer problems & gaps',         desc: 'Analyzing demographics, age trends, and consumer buying behaviors...' },
    { num: 4, name: 'Auditing competitor pricing & keywords',     desc: 'Mapping direct market players, SEO metrics, and keywords...' },
    { num: 5, name: 'Formulating marketing strategies',           desc: 'Drafting pricing tiers, acquisition loops, and GTM launch timelines...' },
    { num: 6, name: 'Compiling financial projections & pitches',  desc: 'Calculating unit economics, business canvases, and pitch decks...' },
  ];

  useEffect(() => {
    let timer;
    if (loading) {
      setLoadingStep(0);
      timer = setInterval(() => {
        setLoadingStep(prev => {
          if (prev < strategicSteps.length - 1) return prev + 1;
          clearInterval(timer);
          return prev;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [loading]);


  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleEnrichment = async () => {
    if (!formData.websiteUrl) { setError('Please provide a Website URL to auto-fill.'); return; }
    setError('');
    setEnriching(true);
    setEnrichFeedback('Connecting to website scraper...');
    try {
      setTimeout(() => setEnrichFeedback('Extracting meta descriptions...'), 1000);
      setTimeout(() => setEnrichFeedback('Invoking Google search grounding...'), 2000);
      const res = await fetch(
        `http://localhost:5000/api/consultant/enrich?url=${encodeURIComponent(formData.websiteUrl)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to auto-enrich from URL.');
      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        businessName:        data.businessName    || prev.businessName,
        industry:            data.industry        || prev.industry,
        products:            data.products        || prev.products,
        businessDescription: data.description     || prev.businessDescription,
        businessModel:       data.businessModel   || prev.businessModel,
      }));
      setEnrichFeedback('Auto-fill complete!');
      setTimeout(() => { setEnriching(false); setEnrichFeedback(''); }, 1500);
    } catch (err) {
      setError(`Auto-enrichment failed: ${err.message}`);
      setEnriching(false);
      setEnrichFeedback('');
    }
  };

  const addCompetitor = (e) => {
    e.preventDefault();
    const trimmed = newCompetitor.trim();
    if (trimmed && !formData.competitors.includes(trimmed)) {
      setFormData(prev => ({ ...prev, competitors: [...prev.competitors, trimmed] }));
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (name) => {
    setFormData(prev => ({ ...prev, competitors: prev.competitors.filter(c => c !== name) }));
  };

  const validateStep = (step) => {
    setError('');
    if (step === 1) {
      if (!formData.businessName || !formData.industry || !formData.businessModel ||
          !formData.businessStage || !formData.businessDescription) {
        setError('Please fill in all required fields (marked with *).');
        return false;
      }
    } else if (step === 2) {
      if (!formData.targetCountry || !formData.targetAudience ||
          !formData.products || !formData.marketingBudget) {
        setError('Please fill in all required fields (marked with *).');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(2); };
  const prevStep = () => { setError(''); setCurrentStep(1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/consultant/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Report generation failed.');
      setTimeout(() => { setLoading(false); navigate(`/audit/report/${data.report.id}`); }, 1000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };


  // ─── Full-screen loading overlay ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col justify-center min-h-[80vh] animate-fade-in">
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-50">
            <div className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${((loadingStep + 1) / strategicSteps.length) * 100}%` }} />
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">AI Business Research Agent</h2>
              <p className="text-xs text-slate-500">Initializing 4-Volume / 20-Chapter McKinsey-grade audit</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 mt-6">
            {strategicSteps.map((step, idx) => {
              const isActive    = idx === loadingStep;
              const isCompleted = idx < loadingStep;
              return (
                <div key={step.num} className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all ${
                  isActive    ? 'bg-indigo-50/50 border-indigo-200 ring-4 ring-indigo-500/5'
                  : isCompleted ? 'bg-slate-50/50 border-slate-100 opacity-60'
                  : 'bg-white border-transparent opacity-30'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCompleted ? 'bg-emerald-500 text-white'
                    : isActive  ? 'bg-indigo-600 text-white animate-bounce'
                    : 'bg-slate-100 text-slate-400'}`}>
                    {isCompleted ? <Check size={12} strokeWidth={3} /> : step.num}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>{step.name}</h4>
                    {isActive && <p className="text-[10px] text-indigo-600 mt-0.5 font-medium">{step.desc}</p>}
                  </div>
                  {isActive && (
                    <div className="ml-auto flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[9px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                      <span>COMPILING</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }


  // ─── Shared input / select class ────────────────────────────────────────────
  const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-8 py-8 relative">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none hidden md:block">
            <Compass size={110} />
          </div>
          <div className="flex items-center gap-2 bg-white/10 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full w-max mb-3 backdrop-blur-sm">
            <Activity size={13} />
            <span>Step {currentStep} of 2</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentStep === 1 ? 'Business Identity' : 'Market Context'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            {currentStep === 1
              ? 'Tell us about your business — the AI will research everything else.'
              : 'A few market details so the AI can ground its research to your geography and audience.'}
          </p>
        </div>

        {/* ── Step pills ── */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-8 py-3 gap-6 text-xs font-bold text-slate-400">
          {[1, 2].map(n => (
            <div key={n} className={`flex items-center gap-1.5 ${currentStep >= n ? 'text-indigo-600' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= n ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {currentStep > n ? <Check size={10} strokeWidth={3} /> : n}
              </span>
              <span className="hidden sm:inline">{n === 1 ? 'Identity' : 'Market'}</span>
            </div>
          ))}
        </div>

        <div className="p-8 sm:p-10">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs mb-6 border border-red-200 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={e => e.preventDefault()} className="space-y-5">


            {/* ══════════════════════════════════ STEP 1 ══════════════════════════════════ */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">

                {/* Website auto-fill */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="websiteUrl">
                    Website URL <span className="text-slate-400 font-normal normal-case">(optional — auto-fills fields below)</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={15} />
                      <input id="websiteUrl" type="text" className={`${inputCls} pl-10`}
                        placeholder="e.g. mybusiness.com" value={formData.websiteUrl} onChange={handleChange} />
                    </div>
                    <button type="button" onClick={handleEnrichment} disabled={enriching}
                      className="bg-indigo-50 hover:bg-indigo-100 disabled:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 disabled:text-slate-400 cursor-pointer">
                      {enriching
                        ? <><div className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-indigo-700 rounded-full animate-spin" /><span>Reading…</span></>
                        : <><Sparkles size={14} /><span>Auto-Fill</span></>}
                    </button>
                  </div>
                  {enrichFeedback && (
                    <p className="text-[11px] text-indigo-600 font-semibold mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />{enrichFeedback}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="businessName">
                      Business Name *
                    </label>
                    <input id="businessName" type="text" className={inputCls}
                      placeholder="e.g. EcoSphere Goods" value={formData.businessName} onChange={handleChange} />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="industry">
                      Industry / Niche *
                    </label>
                    <input id="industry" type="text" className={inputCls}
                      placeholder="e.g. Eco-friendly kitchenware, HR SaaS" value={formData.industry} onChange={handleChange} />
                  </div>

                  {/* Business Model */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="businessModel">
                      Business Model *
                    </label>
                    <select id="businessModel" className={inputCls} value={formData.businessModel} onChange={handleChange}>
                      <option value="">Select model</option>
                      <option value="B2B">B2B — Business to Business</option>
                      <option value="B2C">B2C — Business to Consumer</option>
                      <option value="D2C">D2C — Direct to Consumer</option>
                      <option value="SaaS">SaaS / Subscription</option>
                      <option value="Marketplace">Marketplace / Platform</option>
                      <option value="Agency">Agency / Consulting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Business Stage */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="businessStage">
                      Current Stage *
                    </label>
                    <select id="businessStage" className={inputCls} value={formData.businessStage} onChange={handleChange}>
                      <option value="">Select stage</option>
                      <option value="Idea">Idea / Pre-seed</option>
                      <option value="MVP">MVP / Prototype</option>
                      <option value="Startup">Early Startup</option>
                      <option value="Scaling">Scaling / Growth</option>
                    </select>
                  </div>

                  {/* Business Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="businessDescription">
                      What does your business do? * <span className="text-slate-400 font-normal normal-case">(2-4 sentences is enough)</span>
                    </label>
                    <textarea id="businessDescription" className={`${inputCls} min-h-[100px] resize-y`}
                      placeholder="e.g. We sell biodegradable bamboo kitchen products directly to eco-conscious households via a monthly subscription box. Our goal is to replace single-use plastics with durable, compostable alternatives."
                      value={formData.businessDescription} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}


            {/* ══════════════════════════════════ STEP 2 ══════════════════════════════════ */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Target Country */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="targetCountry">
                      Target Country *
                    </label>
                    <input id="targetCountry" type="text" className={inputCls}
                      placeholder="e.g. India, United States, UAE" value={formData.targetCountry} onChange={handleChange} />
                  </div>

                  {/* Marketing Budget */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="marketingBudget">
                      Monthly Marketing Budget * <span className="text-slate-400 font-normal normal-case">(approximate)</span>
                    </label>
                    <input id="marketingBudget" type="text" className={inputCls}
                      placeholder="e.g. ₹20,000/mo, $500/mo, Unknown" value={formData.marketingBudget} onChange={handleChange} />
                  </div>

                  {/* Products */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="products">
                      Main Products / Services *
                    </label>
                    <input id="products" type="text" className={inputCls}
                      placeholder="e.g. Bamboo towels, reusable food wraps" value={formData.products} onChange={handleChange} />
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="priceRange">
                      Price Range <span className="text-slate-400 font-normal normal-case">(optional)</span>
                    </label>
                    <input id="priceRange" type="text" className={inputCls}
                      placeholder="e.g. ₹500–₹2,000, $20–$80" value={formData.priceRange} onChange={handleChange} />
                  </div>

                  {/* Target Audience */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="targetAudience">
                      Who is your target customer? *
                    </label>
                    <input id="targetAudience" type="text" className={inputCls}
                      placeholder="e.g. Eco-conscious urban millennials aged 25–40, working professionals in metro cities"
                      value={formData.targetAudience} onChange={handleChange} />
                  </div>

                  {/* Competitors */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                      Known Competitors <span className="text-slate-400 font-normal normal-case">(optional — AI will discover more)</span>
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input type="text" className={`${inputCls} flex-1`}
                        placeholder="Type a competitor name and press Enter"
                        value={newCompetitor}
                        onChange={e => setNewCompetitor(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCompetitor(e)} />
                      <button type="button" onClick={addCompetitor}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-3 rounded-xl cursor-pointer whitespace-nowrap">
                        + Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.competitors.length > 0 ? formData.competitors.map(c => (
                        <span key={c} className="bg-slate-100 text-slate-800 text-xs font-semibold pl-3 pr-2 py-1 rounded-full flex items-center gap-1.5 border border-slate-200">
                          {c}
                          <button type="button" onClick={() => removeCompetitor(c)}
                            className="w-4 h-4 rounded-full bg-slate-200 hover:bg-red-200 text-[10px] flex items-center justify-center text-slate-600 hover:text-red-700 cursor-pointer">
                            ✕
                          </button>
                        </span>
                      )) : (
                        <span className="text-xs text-slate-400 italic">No competitors added — the AI will auto-discover them.</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}


            {/* ── Navigation ── */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
              {currentStep > 1 ? (
                <button type="button" onClick={prevStep}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                  <ArrowLeft size={14} /> Back
                </button>
              ) : <div />}

              {currentStep === 1 ? (
                <button type="button" onClick={nextStep}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ml-auto shadow-sm">
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer ml-auto ring-4 ring-indigo-500/10">
                  <Sparkles size={14} fill="white" /> Generate 20-Chapter Research Report
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessForm;
