import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  Search, 
  Coins, 
  Target, 
  Users, 
  Briefcase, 
  Layers, 
  Activity,
  Check,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BusinessForm = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile'); // profile, audience, operational
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

  // Enrichment Loading State
  const [enriching, setEnriching] = useState(false);
  const [enrichFeedback, setEnrichFeedback] = useState('');

  // Competitor Discovery State
  const [discoveringComps, setDiscoveringComps] = useState(false);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState([]);
  const [showCompModal, setShowCompModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    websiteUrl: '',
    industry: '',
    products: '',
    businessModel: '',
    businessStage: '',
    targetCountryCities: '',
    targetAudience: '',
    primaryGoal: '',
    description: '',
    marketingBudget: '',
    revenueModel: '',
    monthlyVisitors: '',
    currentMarketing: '',
    usp: '',
    techStack: '',
    brandGuidelines: '',
    competitors: []
  });

  // Competitor input box
  const [newCompetitor, setNewCompetitor] = useState('');

  // 10 strategic steps tracker
  const strategicSteps = [
    { num: 1, name: 'Understand the Business', desc: 'Parsing submitted metadata and core offerings' },
    { num: 2, name: 'Collect Missing Information', desc: 'Validating operational details and resolving assumptions' },
    { num: 3, name: 'Market Research', desc: 'Analyzing industry size, market share metrics, and keyword trends' },
    { num: 4, name: 'Competitor Research', desc: 'Auditing direct market competitors and comparative scores' },
    { num: 5, name: 'Customer Research', desc: 'Compiling audience personas, pain points, and psychographics' },
    { num: 6, name: 'Identify Opportunities', desc: 'Cross-referencing customer needs with market competitor gaps' },
    { num: 7, name: 'Identify Weaknesses', desc: 'Constructing SWOT, PESTLE, and Porter\'s Five Forces matrix inputs' },
    { num: 8, name: 'Create Strategy', desc: 'Formulating positioning, pricing, brand voice, and GTM strategy' },
    { num: 9, name: 'Execution Roadmap', desc: 'Generating 30/60/90-day action plans and content calendars' },
    { num: 10, name: 'Estimate Outcomes', desc: 'Calculating measurable KPI dashboards and expected ROAS targets' }
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
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // URL Enrichment trigger
  const handleEnrichment = async () => {
    if (!formData.websiteUrl) {
      setError('Please provide a Website URL to enrich.');
      return;
    }
    setError('');
    setEnriching(true);
    setEnrichFeedback('Connecting to website scraper...');

    try {
      setTimeout(() => setEnrichFeedback('Analyzing page headers and meta tags...'), 1000);
      setTimeout(() => setEnrichFeedback('Executing Gemini Search grounding...'), 2200);

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
        description: data.description || prev.description,
        usp: data.usp || prev.usp,
        techStack: data.techStack || prev.techStack,
        businessModel: data.businessModel || prev.businessModel
      }));

      setEnrichFeedback('Enrichment complete! Form pre-populated.');
      setTimeout(() => {
        setEnriching(false);
        setEnrichFeedback('');
      }, 1500);

    } catch (err) {
      setError(`Enrichment failed: ${err.message}. Please fill out manually.`);
      setEnriching(false);
      setEnrichFeedback('');
    }
  };

  // Competitor Auto-Discovery
  const handleDiscoverCompetitors = async () => {
    if (!formData.businessName || !formData.products || !formData.description) {
      setError('Please fill in Business Name, Offerings, and Description first to discover competitors.');
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
          description: formData.description
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

  // Tab Validation
  const validateTab = (tab) => {
    setError('');
    if (tab === 'profile') {
      if (!formData.businessName || !formData.industry || !formData.products || !formData.businessModel || !formData.businessStage) {
        setError('Please fill in all required fields in the Business Profile.');
        return false;
      }
    } else if (tab === 'audience') {
      if (!formData.targetCountryCities || !formData.targetAudience || !formData.primaryGoal) {
        setError('Please fill in target countries, target audience, and primary goal.');
        return false;
      }
    }
    return true;
  };

  const switchTab = (nextTab) => {
    if (activeTab === 'profile' && nextTab !== 'profile') {
      if (!validateTab('profile')) return;
    }
    if (activeTab === 'audience' && nextTab === 'operational') {
      if (!validateTab('profile') || !validateTab('audience')) return;
    }
    setActiveTab(nextTab);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Gate F2: Check all required parameters
    const required = [
      'businessName', 'industry', 'products', 'businessModel', 
      'businessStage', 'targetCountryCities', 'targetAudience', 
      'marketingBudget', 'primaryGoal', 'description'
    ];
    
    const missing = required.filter(field => !formData[field]);
    if (missing.length > 0) {
      setError(`Please complete all required fields: ${missing.join(', ')}`);
      return;
    }

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
        throw new Error(data.message || 'Audit compilation failed.');
      }

      // Add a small delay at the end step for final report layout mapping
      setTimeout(() => {
        setLoading(false);
        navigate(`/audit/report/${data.report.id}`);
      }, 1000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-left animate-fade-in flex flex-col justify-center min-h-[80vh]">
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-50">
            <div 
              className="h-full bg-brand-600 transition-all duration-500" 
              style={{ width: `${((loadingStep + 1) / strategicSteps.length) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">MarketPilot AI Consultant Engine</h2>
              <p className="text-xs text-slate-400">Executing sequential 10-step market audit workflow</p>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="flex flex-col gap-4 mt-8">
            {strategicSteps.map((step, idx) => {
              const isActive = idx === loadingStep;
              const isCompleted = idx < loadingStep;
              return (
                <div 
                  key={step.num} 
                  className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-brand-50/50 border-brand-200 ring-2 ring-brand-600/5' 
                      : isCompleted 
                        ? 'bg-slate-50/50 border-slate-100 opacity-70' 
                        : 'bg-white border-transparent opacity-40'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : isActive 
                        ? 'bg-brand-600 text-white animate-bounce' 
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <Check size={13} strokeWidth={3} /> : step.num}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isActive ? 'text-brand-800' : 'text-slate-800'}`}>{step.name}</h4>
                    {isActive && <p className="text-[10px] text-brand-600 mt-0.5">{step.desc}</p>}
                  </div>
                  {isActive && (
                    <div className="ml-auto flex items-center gap-1 bg-brand-100 text-brand-700 text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-ping"></span>
                      <span>ACTIVE</span>
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
    <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in relative">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 text-white px-8 py-8 text-left relative">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
            <Sparkles size={120} />
          </div>
          <div className="flex items-center gap-3 bg-white/10 text-brand-100 text-xs font-bold px-3 py-1 rounded-full w-max mb-3 backdrop-blur-sm">
            <Activity size={13} />
            <span>Structured Business Intake</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Audit Discovery Portal</h2>
          <p className="text-brand-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Fill in the strategic values below. Optional fields not supplied will trigger intelligent AI hypotheses.
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button 
            type="button" 
            onClick={() => switchTab('profile')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'profile' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Briefcase size={15} />
            <span>1. Profile</span>
          </button>
          <button 
            type="button" 
            onClick={() => switchTab('audience')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'audience' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Users size={15} />
            <span>2. Audience</span>
          </button>
          <button 
            type="button" 
            onClick={() => switchTab('operational')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'operational' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Layers size={15} />
            <span>3. Strategy</span>
          </button>
        </div>

        <div className="p-8 sm:p-10">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs mb-8 text-left border-l-4 border-red-500 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="text-left space-y-6">
            
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-4 text-slate-900 border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider">Company Identity</h3>
                  <span className="text-[10px] text-slate-400 ml-auto">* Indicates required field</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Website URL with Enrichment */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="websiteUrl">
                      Website URL
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                        <input
                          id="websiteUrl"
                          type="text"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                          placeholder="e.g. https://ecospheregoods.com"
                          value={formData.websiteUrl}
                          onChange={handleChange}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleEnrichment}
                        disabled={enriching}
                        className="bg-brand-50 hover:bg-brand-100 disabled:bg-slate-50 text-brand-700 border border-brand-200 disabled:border-slate-200 text-xs font-bold px-4 py-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:text-slate-400"
                      >
                        {enriching ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-brand-200 border-t-brand-700 rounded-full animate-spin"></div>
                            <span>Enriching...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>Auto-Enrich</span>
                          </>
                        )}
                      </button>
                    </div>
                    {enrichFeedback && (
                      <div className="text-[11px] text-brand-600 font-semibold mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping"></span>
                        <span>{enrichFeedback}</span>
                      </div>
                    )}
                  </div>

                  {/* Business Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="businessName">
                      Business / Company Name *
                    </label>
                    <input
                      id="businessName"
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      placeholder="e.g. EcoSphere Goods"
                      value={formData.businessName}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="industry">
                      Industry / Category *
                    </label>
                    <select
                      id="industry"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      value={formData.industry}
                      onChange={handleChange}
                    >
                      <option value="">Select category</option>
                      <option value="SaaS & Tech">SaaS & Technology</option>
                      <option value="E-commerce & Retail">E-commerce & Retail</option>
                      <option value="Agency & B2B Services">Agency & B2B Services</option>
                      <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                      <option value="Education & EdTech">Education & EdTech</option>
                      <option value="Local Business (Food/Real Estate)">Local Business</option>
                      <option value="Other">Other sector</option>
                    </select>
                  </div>

                  {/* Business Model */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="businessModel">
                      Business Model *
                    </label>
                    <select
                      id="businessModel"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      value={formData.businessModel}
                      onChange={handleChange}
                    >
                      <option value="">Select model</option>
                      <option value="B2B">B2B (Business-to-Business)</option>
                      <option value="B2C">B2C (Business-to-Consumer)</option>
                      <option value="D2C">D2C (Direct-to-Consumer)</option>
                      <option value="SaaS">SaaS / Subscription</option>
                      <option value="Marketplace">Marketplace / Platform</option>
                      <option value="Agency">Agency / Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Business Stage */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="businessStage">
                      Business Stage *
                    </label>
                    <select
                      id="businessStage"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      value={formData.businessStage}
                      onChange={handleChange}
                    >
                      <option value="">Select stage</option>
                      <option value="Idea">Idea / Conceptual</option>
                      <option value="Early">Early Traction / MVP</option>
                      <option value="Established">Established Operations</option>
                      <option value="Scaling">Scaling & Expanding</option>
                    </select>
                  </div>

                  {/* Offerings */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="products">
                      Products / Offerings Offered *
                    </label>
                    <input
                      id="products"
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      placeholder="e.g. Bamboo kitchen towels, compostable garbage wraps"
                      value={formData.products}
                      onChange={handleChange}
                    />
                    <span className="text-[10px] text-slate-400 mt-1.5 block">Separate major items with commas.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AUDIENCE & GTM */}
            {activeTab === 'audience' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-4 text-slate-900 border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider">Audience & Intent</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Target Country & Cities */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="targetCountryCities">
                      Target Country & Cities *
                    </label>
                    <input
                      id="targetCountryCities"
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      placeholder="e.g. US, Canada, New York City"
                      value={formData.targetCountryCities}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Primary Goal */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="primaryGoal">
                      Primary Goal for Audit *
                    </label>
                    <input
                      id="primaryGoal"
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      placeholder="e.g. Scale retention, reduce ad CAC, launch organic SEO channel"
                      value={formData.primaryGoal}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Target Audience Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="targetAudience">
                      Target Audience Profile *
                    </label>
                    <textarea
                      id="targetAudience"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all min-h-[100px] resize-y"
                      placeholder="e.g. Environmentally conscious homeowners aged 25-45 who prioritize zero-waste lifestyles and sustainable home accessories."
                      value={formData.targetAudience}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OPERATIONAL DETAILS */}
            {activeTab === 'operational' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900">
                  <h3 className="text-sm font-bold uppercase tracking-wider">Operations & Optional Insights</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Detailed Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="description">
                      What do you do in detail? *
                    </label>
                    <textarea
                      id="description"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all min-h-[120px] resize-y"
                      placeholder="e.g. We manufacture carbon-neutral kitchen accessories using bamboo pulp. We distribute D2C across North America from local warehouses, offering discount subscription programs."
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Marketing Budget */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="marketingBudget">
                      Current Monthly Marketing Budget *
                    </label>
                    <input
                      id="marketingBudget"
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      placeholder="e.g. $1,000/mo, $5,000/mo, or Unknown"
                      value={formData.marketingBudget}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Revenue Model */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="revenueModel">
                      Revenue Model & range (Optional)
                    </label>
                    <input
                      id="revenueModel"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      placeholder="e.g. $10k-$15k/mo Shopify, AOV $45"
                      value={formData.revenueModel}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Monthly Visitors */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="monthlyVisitors">
                      Monthly Visitors / Sources (Optional)
                    </label>
                    <input
                      id="monthlyVisitors"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      placeholder="e.g. 5,000 visits/mo, 80% Meta Ads"
                      value={formData.monthlyVisitors}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Current Marketing Activities */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="currentMarketing">
                      Current Marketing Channels (Optional)
                    </label>
                    <input
                      id="currentMarketing"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      placeholder="e.g. Basic organic Instagram, Google Search ads"
                      value={formData.currentMarketing}
                      onChange={handleChange}
                    />
                  </div>

                  {/* USP */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="usp">
                      Unique Selling Prop (USP) (Optional)
                    </label>
                    <input
                      id="usp"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      placeholder="e.g. Carbon-neutral manufacturing with free subscription recycling"
                      value={formData.usp}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="techStack">
                      Tech Stack / CRM Tools (Optional)
                    </label>
                    <input
                      id="techStack"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      placeholder="e.g. Shopify, Google Analytics 4, HubSpot CRM"
                      value={formData.techStack}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Brand Guidelines */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2" htmlFor="brandGuidelines">
                      Brand Tone / Voice Guidelines (Optional)
                    </label>
                    <input
                      id="brandGuidelines"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                      placeholder="e.g. Minimalist, eco-focused, educational, trusted authority"
                      value={formData.brandGuidelines}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Competitor Discovery Field */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Target Competitors (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add competitor manually"
                        className="flex-1 px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                        value={newCompetitor}
                        onChange={(e) => setNewCompetitor(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualCompetitorAdd(e)}
                      />
                      <button
                        type="button"
                        onClick={handleManualCompetitorAdd}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-3 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} /> Add
                      </button>
                      <button
                        type="button"
                        onClick={handleDiscoverCompetitors}
                        disabled={discoveringComps}
                        className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-bold px-4 py-3 rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {discoveringComps ? (
                          <>
                            <div className="w-3 h-3 border-2 border-brand-200 border-t-brand-700 rounded-full animate-spin"></div>
                            <span>Searching...</span>
                          </>
                        ) : (
                          <>
                            <Search size={14} />
                            <span>Auto-Discover</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Render Selected Competitors */}
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
                        <span className="text-xs text-slate-400 italic">No competitors configured yet. System will generate benchmarks.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-200">
              {activeTab !== 'profile' ? (
                <button 
                  type="button" 
                  onClick={() => switchTab(activeTab === 'operational' ? 'audience' : 'profile')} 
                  className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <div></div>
              )}

              {activeTab !== 'operational' ? (
                <button 
                  type="button" 
                  onClick={() => switchTab(activeTab === 'profile' ? 'audience' : 'operational')} 
                  className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-extrabold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer ml-auto ring-4 ring-brand-500/10"
                >
                  <Sparkles size={16} fill="white" /> Compile Marketing Audit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Competitor Discovery Modal */}
      {showCompModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-xl w-full p-6 text-left">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Search className="text-brand-600" size={20} />
              <span>Competitors Discovered</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              We searched the web using Gemini. Select the candidates you wish to target in your SWOT and channels analysis.
            </p>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {suggestedCompetitors.length > 0 ? (
                suggestedCompetitors.map((comp) => {
                  const isChecked = formData.competitors.includes(comp.name);
                  return (
                    <div 
                      key={comp.name} 
                      onClick={() => addSuggestedCompetitor(comp.name)}
                      className={`p-3.5 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${isChecked ? 'bg-brand-50/40 border-brand-200 ring-1 ring-brand-500/10' : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/80'}`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isChecked ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-300'}`}>
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
                <div className="text-center py-6 text-xs text-slate-400 italic">No competitors found. You can add them manually.</div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCompModal(false)}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
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
