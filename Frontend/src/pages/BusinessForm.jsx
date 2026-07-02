import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Plus, 
  Search, 
  Globe, 
  Briefcase, 
  Users, 
  Activity, 
  Layers, 
  Coins, 
  HelpCircle,
  TrendingUp,
  MapPin,
  Heart,
  DollarSign,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BusinessForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  // Step indicator: 1 to 5
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

  // Auto-enrichment & competitors discovery states
  const [enriching, setEnriching] = useState(false);
  const [enrichFeedback, setEnrichFeedback] = useState('');
  const [discoveringComps, setDiscoveringComps] = useState(false);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState([]);
  const [showCompModal, setShowCompModal] = useState(false);

  // Competitor input tags helper
  const [newCompetitor, setNewCompetitor] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    businessName: '',
    businessIdea: '',
    businessDescription: '',
    businessCategory: '',
    industry: '',
    businessModel: '',
    businessStage: '',
    websiteUrl: '',

    // Step 2
    targetCountry: '',
    targetState: '',
    targetCity: '',
    targetLanguage: '',
    geoLocation: '',
    urbanRural: '',

    // Step 3
    targetAudience: '',
    ageGroup: '',
    gender: '',
    income: '',
    education: '',
    occupation: '',
    interests: '',
    painPoints: '',
    buyingBehaviour: '',
    customerGoals: '',

    // Step 4
    products: '',
    services: '',
    priceRange: '',
    usp: '',
    competitors: [],
    budget: '',
    expectedRevenue: '',
    marketingBudget: '',

    // Step 5: Research Preferences (all 20)
    researchPreferences: {
      industryAnalysis: true,
      competitorAnalysis: true,
      keywordResearch: true,
      swotAnalysis: true,
      pestleAnalysis: true,
      marketingStrategy: true,
      seoStrategy: true,
      socialMediaStrategy: true,
      advertisingStrategy: true,
      goToMarketStrategy: true,
      pricingStrategy: true,
      salesFunnel: true,
      brandPositioning: true,
      productValidation: true,
      trendAnalysis: true,
      riskAnalysis: true,
      opportunityAnalysis: true,
      investmentEstimation: true,
      legalConsiderations: true
    }
  });

  const strategicSteps = [
    { num: 1, name: 'Scanning details & grounding search', desc: 'Validating domain and running Google Search queries...' },
    { num: 2, name: 'Analyzing TAM/SAM/SOM market sizes', desc: 'Evaluating sector statistics and industry growth CAGR...' },
    { num: 3, name: 'Profiling customer problems & gaps', desc: 'Analyzing demographics, age trends, and consumer buying behaviors...' },
    { num: 4, name: 'Auditing competitor pricing & keywords', desc: 'Mapping direct market players, SEO metrics, and keywords...' },
    { num: 5, name: 'Formulating marketing strategies', desc: 'Drafting pricing tiers, acquisition loops, and GTM launch timelines...' },
    { num: 6, name: 'Compiling financial projections & pitches', desc: 'Calculating unit economics, business canvases, and pitch decks...' }
  ];

  useEffect(() => {
    let timer;
    if (loading) {
      setLoadingStep(0);
      timer = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < strategicSteps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(timer);
            return prev;
          }
        });
      }, 3500); // 3.5s per module compilation display (total ~21s load state)
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePreferenceChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      researchPreferences: {
        ...prev.researchPreferences,
        [key]: !prev.researchPreferences[key]
      }
    }));
  };

  // Auto-enrichment
  const handleEnrichment = async () => {
    if (!formData.websiteUrl) {
      setError('Please provide a Website URL to enrich.');
      return;
    }
    setError('');
    setEnriching(true);
    setEnrichFeedback('Connecting to website scraper...');

    try {
      setTimeout(() => setEnrichFeedback('Extracting meta descriptions...'), 1000);
      setTimeout(() => setEnrichFeedback('Invoking Google search grounding...'), 2000);

      const response = await fetch(`http://localhost:5000/api/consultant/enrich?url=${encodeURIComponent(formData.websiteUrl)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to auto-enrich from URL.');
      }

      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        businessName: data.businessName || prev.businessName,
        industry: data.industry || prev.industry,
        products: data.products || prev.products,
        businessDescription: data.description || prev.businessDescription,
        usp: data.usp || prev.usp,
        businessModel: data.businessModel || prev.businessModel
      }));

      setEnrichFeedback('Enrichment complete! Fields auto-filled.');
      setTimeout(() => {
        setEnriching(false);
        setEnrichFeedback('');
      }, 1500);

    } catch (err) {
      setError(`Auto-enrichment failed: ${err.message}. Please enter details manually.`);
      setEnriching(false);
      setEnrichFeedback('');
    }
  };

  // Competitors discovery
  const handleDiscoverCompetitors = async () => {
    if (!formData.businessName || !formData.products || !formData.businessDescription) {
      setError('Please fill in Business Name, Offerings, and Business Description first to discover competitors.');
      return;
    }
    setError('');
    setDiscoveringComps(true);

    try {
      const response = await fetch('http://localhost:5000/api/consultant/discover-competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          industry: formData.industry,
          products: formData.products,
          description: formData.businessDescription
        })
      });

      if (!response.ok) {
        throw new Error('Could not retrieve competitor listings.');
      }

      const data = await response.json();
      setSuggestedCompetitors(data.competitors || []);
      setShowCompModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setDiscoveringComps(false);
    }
  };

  const addSuggestedCompetitor = (name) => {
    setFormData(prev => {
      const current = prev.competitors;
      if (current.includes(name)) {
        return { ...prev, competitors: current.filter(c => c !== name) };
      } else {
        return { ...prev, competitors: [...current, name] };
      }
    });
  };

  const handleManualCompetitorAdd = (e) => {
    e.preventDefault();
    if (newCompetitor.trim() && !formData.competitors.includes(newCompetitor.trim())) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, newCompetitor.trim()]
      }));
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (name) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter(c => c !== name)
    }));
  };

  // Navigation steps validation
  const validateStep = (step) => {
    setError('');
    if (step === 1) {
      if (!formData.businessName || !formData.industry || !formData.businessModel || !formData.businessStage || !formData.businessDescription) {
        setError('Please fill in all required fields (marked with *).');
        return false;
      }
    } else if (step === 2) {
      if (!formData.targetCountry) {
        setError('Target Country is required to establish geographic market boundaries.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.targetAudience) {
        setError('Please supply a target audience description.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.products || !formData.marketingBudget) {
        setError('Please define your products/offerings and marketing budget.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep(4)) return;

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/consultant/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Audit compiling failed.');
      }

      setTimeout(() => {
        setLoading(false);
        navigate(`/audit/report/${data.report.id}`);
      }, 1500);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Full-screen loader for modular processing
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-left animate-fade-in flex flex-col justify-center min-h-[80vh]">
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-50">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500" 
              style={{ width: `${((loadingStep + 1) / strategicSteps.length) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">AI Business Research Agent</h2>
              <p className="text-xs text-slate-405">Executing sequential 6-module McKinsey strategic audit</p>
            </div>
          </div>

          {/* Stepper items */}
          <div className="flex flex-col gap-4 mt-6">
            {strategicSteps.map((step, idx) => {
              const isActive = idx === loadingStep;
              const isCompleted = idx < loadingStep;
              return (
                <div 
                  key={step.num} 
                  className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-indigo-50/50 border-indigo-200 ring-4 ring-indigo-500/5' 
                      : isCompleted 
                        ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                        : 'bg-white border-transparent opacity-30'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : isActive 
                        ? 'bg-indigo-600 text-white animate-bounce' 
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <Check size={12} strokeWidth={3} /> : step.num}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isActive ? 'text-indigo-850' : 'text-slate-800'}`}>{step.name}</h4>
                    {isActive && <p className="text-[10px] text-indigo-600 mt-0.5 font-medium">{step.desc}</p>}
                  </div>
                  {isActive && (
                    <div className="ml-auto flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[9px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in relative text-left">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Upper Gradient Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-8 py-8 text-left relative">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none hidden md:block">
            <Compass size={120} />
          </div>
          <div className="flex items-center gap-2 bg-white/10 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full w-max mb-3 backdrop-blur-sm">
            <Activity size={13} />
            <span>Wizard Step {currentStep} of 5</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Strategy Intake Wizard</h2>
          <p className="text-slate-350 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Fill in the parameters below. Supply as much detail as possible to unlock McKinsey-grade outcomes.
          </p>
        </div>

        {/* Wizard Step Markers */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 justify-between px-8 py-4 text-xs font-bold text-slate-400">
          <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-indigo-600' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
            <span className="hidden sm:inline">Identity</span>
          </div>
          <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-indigo-600' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
            <span className="hidden sm:inline">Geography</span>
          </div>
          <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-indigo-600' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
            <span className="hidden sm:inline">Audience</span>
          </div>
          <div className={`flex items-center gap-1.5 ${currentStep >= 4 ? 'text-indigo-600' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 4 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>4</span>
            <span className="hidden sm:inline">Financials</span>
          </div>
          <div className={`flex items-center gap-1.5 ${currentStep >= 5 ? 'text-indigo-600' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 5 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>5</span>
            <span className="hidden sm:inline">Preferences</span>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs mb-8 border border-red-200 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            
            {/* STEP 1: IDENTITY */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900">
                  <Briefcase size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Business Identity</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="websiteUrl">
                      Website URL (Optional)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                        <input
                          id="websiteUrl"
                          type="text"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="e.g. ecospheregoods.com"
                          value={formData.websiteUrl}
                          onChange={handleChange}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleEnrichment}
                        disabled={enriching}
                        className="bg-indigo-50 hover:bg-indigo-100 disabled:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:text-slate-400"
                      >
                        {enriching ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-indigo-700 rounded-full animate-spin"></div>
                            <span>Reading...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>Auto-Fill</span>
                          </>
                        )}
                      </button>
                    </div>
                    {enrichFeedback && (
                      <div className="text-[11px] text-indigo-600 font-semibold mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                        <span>{enrichFeedback}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="businessName">
                      Business Name *
                    </label>
                    <input
                      id="businessName"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. EcoSphere Goods"
                      value={formData.businessName}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="businessCategory">
                      Business Category *
                    </label>
                    <select
                      id="businessCategory"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={formData.businessCategory}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      <option value="SaaS & Tech">SaaS & Technology</option>
                      <option value="E-commerce & Retail">E-commerce & Retail</option>
                      <option value="Agency & Services">Agency & B2B Services</option>
                      <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                      <option value="Consumer Brands">Consumer Goods</option>
                      <option value="Other">Other Category</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="industry">
                      Specific Industry Sub-sector *
                    </label>
                    <input
                      id="industry"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Eco-friendly kitchen storage, HR payroll SaaS"
                      value={formData.industry}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="businessModel">
                      Business Model *
                    </label>
                    <select
                      id="businessModel"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={formData.businessModel}
                      onChange={handleChange}
                    >
                      <option value="">Select Model</option>
                      <option value="B2B">B2B (Business-to-Business)</option>
                      <option value="B2C">B2C (Business-to-Consumer)</option>
                      <option value="D2C">D2C (Direct-to-Consumer)</option>
                      <option value="SaaS">SaaS / Subscription</option>
                      <option value="Marketplace">Marketplace / Platform</option>
                      <option value="Agency">Agency / Consulting</option>
                      <option value="Other">Other Model</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="businessStage">
                      Operational Stage *
                    </label>
                    <select
                      id="businessStage"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={formData.businessStage}
                      onChange={handleChange}
                    >
                      <option value="">Select Stage</option>
                      <option value="Idea">Conceptual / Pre-seed Idea</option>
                      <option value="MVP">Prototype / Minimum Viable Product</option>
                      <option value="Startup">Early Stage Traction Startup</option>
                      <option value="Scaling">Scaling / Growth Phase</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="businessIdea">
                      Business Idea Pitch Summary *
                    </label>
                    <input
                      id="businessIdea"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Biodegradable kitchenware delivered on monthly subscriptions."
                      value={formData.businessIdea}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="businessDescription">
                      Detailed Business Operations Description *
                    </label>
                    <textarea
                      id="businessDescription"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[120px] resize-y"
                      placeholder="Detail what you do, how you deliver values, team capabilities, and primary objectives..."
                      value={formData.businessDescription}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: GEOGRAPHY */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900">
                  <MapPin size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Geography & Localization</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="targetCountry">
                      Target Country *
                    </label>
                    <input
                      id="targetCountry"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. United States, United Kingdom"
                      value={formData.targetCountry}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="targetState">
                      Target State / Province
                    </label>
                    <input
                      id="targetState"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. California, London Area"
                      value={formData.targetState}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="targetCity">
                      Target City
                    </label>
                    <input
                      id="targetCity"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. San Francisco, Manchester"
                      value={formData.targetCity}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="targetLanguage">
                      Primary Language
                    </label>
                    <input
                      id="targetLanguage"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. English, French, Spanish"
                      value={formData.targetLanguage}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="geoLocation">
                      Geo Coordinates / Focus Area Description
                    </label>
                    <input
                      id="geoLocation"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. East Coast metropolitan zones, North London"
                      value={formData.geoLocation}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="urbanRural">
                      Urban / Rural / Suburban Sector
                    </label>
                    <select
                      id="urbanRural"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={formData.urbanRural}
                      onChange={handleChange}
                    >
                      <option value="">Select Setting</option>
                      <option value="Urban">Urban / High-Density Metropolitan</option>
                      <option value="Suburban">Suburban Residential</option>
                      <option value="Rural">Rural / Agricultural / Isolated</option>
                      <option value="Mixed">Mixed Geography</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: TARGET AUDIENCE */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900">
                  <Users size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Target Demographics & Psychographics</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="targetAudience">
                      Primary Target Audience Description *
                    </label>
                    <textarea
                      id="targetAudience"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[80px] resize-y"
                      placeholder="e.g. Busy professional parents who prioritize waste reductions and clean design aesthetics..."
                      value={formData.targetAudience}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="ageGroup">
                      Age Range Group
                    </label>
                    <input
                      id="ageGroup"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. 25-40, Gen Z, Mid-career professionals"
                      value={formData.ageGroup}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="gender">
                      Gender Focus
                    </label>
                    <input
                      id="gender"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Female-skewed, All, Neutral"
                      value={formData.gender}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="income">
                      Average Household Income Tiers
                    </label>
                    <input
                      id="income"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. $75k-$120k, Mid-to-high disposable income"
                      value={formData.income}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="education">
                      Education Levels
                    </label>
                    <input
                      id="education"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Bachelor degrees, professional certifications"
                      value={formData.education}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="occupation">
                      Key Occupations
                    </label>
                    <input
                      id="occupation"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Tech managers, remote writers, stay-at-home parents"
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="interests">
                      Core Interests / Hobbies
                    </label>
                    <input
                      id="interests"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Sustainable lifestyle, gourmet cooking, minimalism"
                      value={formData.interests}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="painPoints">
                      Core Pain Points & Frustrations
                    </label>
                    <input
                      id="painPoints"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Plastic packaging waste is unavoidable; eco-alternatives break easily"
                      value={formData.painPoints}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="buyingBehaviour">
                      Buying Behaviour
                    </label>
                    <input
                      id="buyingBehaviour"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Reviews comparisons, values brand certifications"
                      value={formData.buyingBehaviour}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="customerGoals">
                      Ultimate Customer Goals
                    </label>
                    <input
                      id="customerGoals"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Reach zero-waste kitchen footprints seamlessly"
                      value={formData.customerGoals}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: FINANCIALS & PRODUCT */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900">
                  <DollarSign size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Offerings, Pricing & Budgets</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="products">
                      Key Products *
                    </label>
                    <input
                      id="products"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Bamboo towels, reusable food wraps"
                      value={formData.products}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="services">
                      Associated Services Offered
                    </label>
                    <input
                      id="services"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Monthly subscription replenishment, eco consulting audit"
                      value={formData.services}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="priceRange">
                      AOV / Target Price Range
                    </label>
                    <input
                      id="priceRange"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. $30-$50 per order, $25/mo subscription"
                      value={formData.priceRange}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="usp">
                      Unique Value Proposition (USP)
                    </label>
                    <input
                      id="usp"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. Zero plastic bamboo fiber towels with automated lifecycle replacements"
                      value={formData.usp}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="budget">
                      Capital Setup Budget
                    </label>
                    <input
                      id="budget"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. $10,000 startup loans, self-funded $5,000"
                      value={formData.budget}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="expectedRevenue">
                      Expected Month 12 Monthly Revenue
                    </label>
                    <input
                      id="expectedRevenue"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. $15,000/mo, $100,000 ARR target"
                      value={formData.expectedRevenue}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider mb-2" htmlFor="marketingBudget">
                      Planned Monthly Marketing Budget *
                    </label>
                    <input
                      id="marketingBudget"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. $1,000/mo, $5,000/mo, or Unknown/TBD"
                      value={formData.marketingBudget}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Competitors List Config */}
                  <div className="md:col-span-2 space-y-3 pt-2">
                    <label className="block text-xs font-bold text-slate-655 uppercase tracking-wider">
                      Known Competitors (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add competitor"
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        value={newCompetitor}
                        onChange={(e) => setNewCompetitor(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualCompetitorAdd(e)}
                      />
                      <button
                        type="button"
                        onClick={handleManualCompetitorAdd}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} /> Add
                      </button>
                      <button
                        type="button"
                        onClick={handleDiscoverCompetitors}
                        disabled={discoveringComps}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {discoveringComps ? (
                          <>
                            <div className="w-3 h-3 border-2 border-indigo-200 border-t-indigo-700 rounded-full animate-spin"></div>
                            <span>Searching...</span>
                          </>
                        ) : (
                          <>
                            <Search size={14} />
                            <span>Auto-Find</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.competitors.length > 0 ? (
                        formData.competitors.map((comp) => (
                          <div key={comp} className="bg-slate-100 text-slate-800 text-xs font-semibold pl-3 pr-2 py-1 rounded-full flex items-center gap-1.5 border border-slate-200">
                            <span>{comp}</span>
                            <button 
                              type="button" 
                              onClick={() => removeCompetitor(comp)}
                              className="w-4 h-4 rounded-full bg-slate-200 hover:bg-red-200 text-[10px] flex items-center justify-center font-bold text-slate-600 hover:text-red-700 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No competitors entered. The AI agent will auto-discover benchmarks.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: PREFERENCES */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900">
                  <Layers size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Research Preferences</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-normal">
                  Select which McKinsey strategic modules and canvases you wish the AI Agent to build. Unselected categories will be excluded from the analysis report.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(formData.researchPreferences).map((key) => {
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^\w/, (c) => c.toUpperCase());
                    const isChecked = formData.researchPreferences[key];
                    return (
                      <div 
                        key={key}
                        onClick={() => handlePreferenceChange(key)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked ? 'bg-indigo-50/30 border-indigo-200' : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-800">{label}</div>
                        <button 
                          type="button"
                          className={`w-9 h-5.5 rounded-full relative transition-colors focus:outline-none ${
                            isChecked ? 'bg-indigo-600' : 'bg-slate-200'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-1 left-1 transition-transform ${
                            isChecked ? 'translate-x-3.5' : ''
                          }`}></span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-200">
              {currentStep > 1 ? (
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className="bg-white hover:bg-slate-50 text-slate-650 border border-slate-200 text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 5 ? (
                <button 
                  type="button" 
                  onClick={nextStep} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ml-auto shadow-sm hover:shadow"
                >
                  Next Step <ArrowRight size={14} />
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={handleSubmit}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer ml-auto ring-4 ring-indigo-500/10"
                >
                  <Sparkles size={14} fill="white" /> Generate Deep Research Report
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Competitors Discovered Modal */}
      {showCompModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-xl w-full p-6 text-left">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Search className="text-indigo-600" size={20} />
              <span>Competitors Discovered</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              We parsed the web using Gemini. Add candidates you wish to target in SWOT and competitive indexes:
            </p>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {suggestedCompetitors.length > 0 ? (
                suggestedCompetitors.map((comp) => {
                  const isChecked = formData.competitors.includes(comp.name);
                  return (
                    <div 
                      key={comp.name} 
                      onClick={() => addSuggestedCompetitor(comp.name)}
                      className={`p-3.5 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                        isChecked ? 'bg-indigo-50/40 border-indigo-200' : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'
                      }`}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{comp.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-normal">{comp.description}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 italic">No competitors found. Add manually instead.</div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCompModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Confirm Selection ({formData.competitors.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessForm;
