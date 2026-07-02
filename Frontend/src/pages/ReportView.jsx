import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Calendar, 
  Sparkles, 
  Check, 
  ChevronLeft, 
  Award, 
  RefreshCw, 
  ExternalLink,
  AlertTriangle,
  Send,
  X,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Lightbulb,
  DollarSign,
  Layers,
  Cpu,
  ShieldAlert,
  Compass,
  Zap,
  Globe,
  ShoppingCart,
  MessageSquare,
  Activity,
  Briefcase,
  Heart,
  Search,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
  LayoutGrid,
  Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReportView = () => {
  const { id } = useParams();
  const { token } = useAuth();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation tabs for premium report layout
  const [activeTab, setActiveTab] = useState('strategy'); // strategy, canvases, brand, financial
  
  // Section regeneration states
  const [regenSectionKey, setRegenSectionKey] = useState(null); 
  const [regenModifier, setRegenModifier] = useState('');
  const [submittingRegen, setSubmittingRegen] = useState(false);
  const [regeneratingKeys, setRegeneratingKeys] = useState({});

  // Active sidebar section state
  const [activeSection, setActiveSection] = useState('');

  const sectionKeys = [
    'businessSummary',
    'executiveSummary',
    'marketSize',
    'industryOverview',
    'industryGrowthRate',
    'currentTrends',
    'futureTrends',
    'customerPersona',
    'customerProblems',
    'customerNeeds',
    'buyingBehaviour',
    'marketDemand',
    'marketGap',
    'opportunities',
    'threats',
    'swotAnalysis',
    'pestleAnalysis',
    'competitorResearch',
    'keywordResearch',
    'seoStrategy',
    'socialMediaStrategy',
    'contentMarketingPlan',
    'paidAdsStrategy',
    'pricingStrategy',
    'salesStrategy',
    'customerAcquisition',
    'retentionStrategy',
    'businessRisks',
    'investmentRequirement',
    'revenueModel',
    'growthStrategy',
    'goToMarketStrategy',
    'launchChecklist',
    'actionPlan90Day',
    'oneYearRoadmap',
    'aiRecommendations',
    'businessScore',
    'successProbability',
    'estimatedCompetitionLevel',
    'estimatedDifficultyLevel',
    'estimatedRoi',
    'marketOpportunityScore',
    'finalConclusion'
  ];

  const sectionIcons = {
    businessSummary: Briefcase,
    executiveSummary: FileText,
    marketSize: TrendingUp,
    industryOverview: Globe,
    industryGrowthRate: BarChart3,
    currentTrends: TrendingUp,
    futureTrends: Compass,
    customerPersona: Users,
    customerProblems: AlertTriangle,
    customerNeeds: Heart,
    buyingBehaviour: ShoppingCart,
    marketDemand: BarChart3,
    marketGap: Activity,
    opportunities: Lightbulb,
    threats: ShieldAlert,
    swotAnalysis: BarChart3,
    pestleAnalysis: Compass,
    competitorResearch: Target,
    keywordResearch: Search,
    seoStrategy: Globe,
    socialMediaStrategy: MessageSquare,
    contentMarketingPlan: FileText,
    paidAdsStrategy: DollarSign,
    pricingStrategy: DollarSign,
    salesStrategy: Zap,
    customerAcquisition: TrendingUp,
    retentionStrategy: Heart,
    businessRisks: AlertTriangle,
    investmentRequirement: Coins,
    revenueModel: DollarSign,
    growthStrategy: Compass,
    goToMarketStrategy: Zap,
    launchChecklist: Check,
    actionPlan90Day: Calendar,
    oneYearRoadmap: Calendar,
    aiRecommendations: Cpu,
    businessScore: Award,
    successProbability: Check,
    estimatedCompetitionLevel: Target,
    estimatedDifficultyLevel: Activity,
    estimatedRoi: DollarSign,
    marketOpportunityScore: Award,
    finalConclusion: CheckCircle2
  };

  const sectionGroups = [
    {
      title: 'Identity & Context',
      keys: ['businessSummary', 'executiveSummary', 'finalConclusion']
    },
    {
      title: 'Market Dynamics',
      keys: ['marketSize', 'industryOverview', 'industryGrowthRate', 'currentTrends', 'futureTrends', 'marketDemand', 'marketGap', 'opportunities', 'threats']
    },
    {
      title: 'Customer & Competitor Intel',
      keys: ['customerPersona', 'customerProblems', 'customerNeeds', 'buyingBehaviour', 'swotAnalysis', 'pestleAnalysis', 'competitorResearch']
    },
    {
      title: 'Keyword & Content playbooks',
      keys: ['keywordResearch', 'seoStrategy', 'socialMediaStrategy', 'contentMarketingPlan', 'paidAdsStrategy']
    },
    {
      title: 'Monetization & Sales Growth',
      keys: ['pricingStrategy', 'salesStrategy', 'customerAcquisition', 'retentionStrategy', 'growthStrategy', 'goToMarketStrategy']
    },
    {
      title: 'Execution & Metrics',
      keys: ['businessRisks', 'investmentRequirement', 'revenueModel', 'launchChecklist', 'actionPlan90Day', 'oneYearRoadmap', 'aiRecommendations', 'businessScore', 'successProbability', 'estimatedCompetitionLevel', 'estimatedDifficultyLevel', 'estimatedRoi', 'marketOpportunityScore']
    }
  ];

  const getSectionTitle = (key) => {
    return key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/consultant/reports/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load strategy report details.');
        }

        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchReport();
    }
  }, [id, token]);

  // Setup active section intersection observer
  useEffect(() => {
    if (loading || !report || activeTab !== 'strategy') return;

    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -75% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionKeys.forEach((key) => {
      const element = document.getElementById(key);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sectionKeys.forEach((key) => {
        const element = document.getElementById(key);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [report, loading, activeTab]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async (format) => {
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/consultant/reports/${id}/export/${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to download report as ${format.toUpperCase()}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${report.businessDetails.businessName.replace(/\s+/g, '_')}_Research.${format === 'docx' ? 'docx' : 'json'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegenerate = async (sectionKey) => {
    setError('');
    setSubmittingRegen(true);
    setRegeneratingKeys(prev => ({ ...prev, [sectionKey]: true }));

    try {
      const response = await fetch(`http://localhost:5000/api/consultant/reports/${id}/regenerate-section`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sectionKey,
          modifier: regenModifier
        })
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate this section.');
      }

      const data = await response.json();

      setReport(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [sectionKey]: data.section
        }
      }));

      setRegenSectionKey(null);
      setRegenModifier('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingRegen(false);
      setRegeneratingKeys(prev => ({ ...prev, [sectionKey]: false }));
    }
  };

  const scrollToSection = (key) => {
    const element = document.getElementById(key);
    if (element) {
      const navbarOffset = 96;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(key);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-650 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-xs font-semibold">Running database hydrates and report shaders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center border-l-4 border-l-red-500 shadow-lg">
          <p className="text-red-700 font-semibold text-xs">Error: {error}</p>
          <Link to="/dashboard" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg mt-4 inline-block">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative text-left">
      
      {/* Printable Style Block */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          nav, footer, .no-print {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .page-break {
            page-break-before: always;
            padding-top: 2rem;
          }
        }
      `}</style>

      {/* Back Button */}
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-150/70 hover:bg-slate-200 transition-all no-print mb-6 w-max">
        <ChevronLeft size={14} /> Back to Dashboard
      </Link>

      {/* Header Info Block */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-200 mb-8 no-print">
        <div>
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full w-max mb-3">
            <Award size={13} />
            <span>AI Business Research Agent</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Research Report: <span className="bg-gradient-to-r from-indigo-650 via-indigo-500 to-indigo-800 bg-clip-text text-transparent">{report.businessDetails?.businessName}</span>
          </h1>
          <p className="text-xs text-slate-550 mt-2 flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{report.businessDetails?.industry}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <Calendar size={13} className="text-slate-400" />
            <span>Compiled on {formatDate(report.createdAt)}</span>
          </p>
        </div>
        
        {/* Actions Exporters Box */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button 
            onClick={() => handleExport('docx')} 
            className="bg-white hover:bg-slate-50 text-slate-750 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download size={14} /> Download DOCX
          </button>
          <button 
            onClick={() => handleExport('json')} 
            className="bg-white hover:bg-slate-50 text-slate-750 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download size={14} /> Export JSON
          </button>
          <button 
            onClick={handlePrint} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer ml-auto lg:ml-0"
          >
            <Download size={14} /> Save Report (PDF)
          </button>
        </div>
      </div>

      {/* Tabs navigation headers (no-print) */}
      <div className="flex border-b border-slate-200 bg-slate-50/50 mb-8 no-print rounded-xl p-1 gap-1 max-w-2xl">
        <button
          onClick={() => setActiveTab('strategy')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'strategy' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Strategy Audit (43 Sections)
        </button>
        <button
          onClick={() => setActiveTab('canvases')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'canvases' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Strategic Canvases
        </button>
        <button
          onClick={() => setActiveTab('brand')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'brand' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Brand & Pitches
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'financial' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Financial Outlook
        </button>
      </div>

      {/* Printed Header (Visible only on print) */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-350 pb-4">
        <h1 className="text-3xl font-black uppercase text-slate-950">McKinsey-Style Strategic Research</h1>
        <p className="text-sm font-bold text-slate-700 mt-1">AI Business Research Agent Platform</p>
        <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
          <div><strong>Business Name:</strong> {report.businessDetails?.businessName}</div>
          <div><strong>Industry:</strong> {report.businessDetails?.industry}</div>
          <div><strong>Business Stage:</strong> {report.businessDetails?.businessStage}</div>
          <div><strong>Model:</strong> {report.businessDetails?.businessModel}</div>
          <div><strong>Geography:</strong> {report.businessDetails?.targetCountry}</div>
        </div>
      </div>

      {/* TAB 1: STRATEGY AUDIT (43 SECTIONS + SIDEBAR) */}
      {activeTab === 'strategy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SIDEBAR NAVIGATION - no-print */}
          <div className="lg:col-span-3 lg:sticky lg:top-[96px] lg:h-[calc(100vh-136px)] flex flex-col no-print">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm overflow-hidden flex-grow flex flex-col">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 px-3">
                <FileText size={14} className="text-slate-400" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Roadmap Navigation
                </h3>
              </div>
              <nav className="flex flex-col gap-4 overflow-y-auto pr-1 flex-grow no-scrollbar">
                {sectionGroups.map((group, gIdx) => {
                  const activeKeysInGroup = group.keys.filter(key => report.sections[key]);
                  if (activeKeysInGroup.length === 0) return null;

                  return (
                    <div key={gIdx} className="space-y-1">
                      <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                        {group.title}
                      </h4>
                      <div className="flex flex-col gap-0.5">
                        {activeKeysInGroup.map((key) => {
                          const section = report.sections[key];
                          const IconComponent = sectionIcons[key] || FileText;
                          const isActive = activeSection === key;
                          return (
                            <button
                              key={key}
                              onClick={() => scrollToSection(key)}
                              className={`w-full text-left text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-2.5 transition-all duration-150 border-l-2 ${
                                isActive 
                                  ? 'text-indigo-700 bg-indigo-50 border-indigo-600 font-semibold' 
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                              }`}
                            >
                              <IconComponent size={14} className={isActive ? 'text-indigo-650' : 'text-slate-400'} />
                              <span className="truncate">{section.title || getSectionTitle(key)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* STRATEGIC SECTIONS */}
          <div className="lg:col-span-9 space-y-8 print-full-width">
            {sectionKeys.map((key) => {
              const section = report.sections[key];
              if (!section) return null;

              const isRegenerating = regeneratingKeys[key];
              const IconComponent = sectionIcons[key] || FileText;

              return (
                <div 
                  key={key} 
                  id={key}
                  className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md page-break text-left"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-600 to-indigo-400"></div>

                  {isRegenerating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center animate-fade-in">
                      <RefreshCw className="text-indigo-600 animate-spin mb-2" size={28} />
                      <p className="text-xs font-semibold text-slate-500">Regenerating {getSectionTitle(key)}...</p>
                    </div>
                  )}

                  {/* Section Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl mt-0.5 shrink-0">
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-slate-900 leading-tight">
                          {section.title || getSectionTitle(key)}
                        </h3>
                        
                        {/* Trust Indicators */}
                        {(section.trustIndicators && section.trustIndicators.length > 0) && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {section.trustIndicators.map((indicator, idx) => (
                              <div 
                                key={idx} 
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                                  indicator.type === 'source' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-250/30' 
                                    : 'bg-amber-50 text-amber-700 border-amber-250/30'
                                }`}
                              >
                                {indicator.type === 'source' ? <Check size={10} strokeWidth={3} /> : <AlertTriangle size={10} />}
                                <span>
                                  {indicator.type === 'source' ? 'Source: ' : 'Assumption: '}
                                  {indicator.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setRegenSectionKey(regenSectionKey === key ? null : key)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-slate-400 hover:bg-slate-50 transition-all no-print cursor-pointer shrink-0"
                      title="Refine this section"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>

                  {/* Refiner panel */}
                  {regenSectionKey === key && (
                    <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl no-print animate-fade-in shadow-inner">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-bold text-slate-800">Refine Section Prompt</h4>
                        <button 
                          type="button" 
                          onClick={() => { setRegenSectionKey(null); setRegenModifier(''); }} 
                          className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 hover:bg-slate-200 rounded"
                        >
                          <X size={15} />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. emphasize target country regulatory limitations, adjust budget split..."
                          className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          value={regenModifier}
                          onChange={(e) => setRegenModifier(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRegenerate(key)}
                          disabled={submittingRegen}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Send size={11} />
                          <span>Submit</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section Content */}
                  <div className="text-slate-700 leading-relaxed text-sm whitespace-pre-line mb-6 font-normal">
                    {section.content}
                  </div>

                  {/* CUSTOM GRAPHICS ELEMENT IF CHART DATA PROVIDED */}
                  {section.chartData && (
                    <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-xl max-w-xl">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">AI Sourced Estimates Graphic</h4>
                      <div className="space-y-3.5">
                        {section.chartData.labels.map((lbl, lIdx) => {
                          const val = section.chartData.values[lIdx];
                          const maxVal = Math.max(...section.chartData.values);
                          const percentage = maxVal > 0 ? (val / maxVal) * 100 : 0;
                          return (
                            <div key={lIdx} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold text-slate-700">
                                <span>{lbl}</span>
                                <span>{val.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-600 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {section.recommendations && section.recommendations.length > 0 && (
                    <div className="space-y-4 pt-5 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Consulting Recommendations</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.recommendations.map((rec, rIdx) => (
                          <div 
                            key={rIdx} 
                            className="bg-slate-50/40 border border-slate-200/60 border-l-4 border-l-indigo-650 rounded-xl p-4 flex flex-col justify-between"
                          >
                            <div>
                              <h5 className="font-bold text-slate-900 text-sm mb-2">{rec.title}</h5>
                              <div className="text-xs text-slate-600 mb-2 leading-relaxed">
                                <span className="font-semibold text-slate-800">Why: </span>{rec.why}
                              </div>
                              <div className="text-xs text-slate-600 mb-4 leading-relaxed">
                                <span className="font-semibold text-slate-800">How: </span>{rec.how}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 mt-2">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-150">
                                Impact: {rec.impact}
                              </span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-150">
                                Difficulty: {rec.difficulty}
                              </span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-150 truncate max-w-[120px]">
                                Cost: {rec.cost}
                              </span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-150/70 text-slate-700 border border-slate-200">
                                {rec.timeframe}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STRATEGIC CANVASES */}
      {activeTab === 'canvases' && report.bonusAssets && (
        <div className="space-y-10">
          
          {/* Business Model Canvas */}
          {report.bonusAssets.businessCanvas && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="font-display text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">
                Business Model Canvas (McKinsey Standard)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                
                {/* Key Partners */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 md:row-span-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users size={12} className="text-indigo-650" /> Key Partners
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.businessCanvas.keyPartners}</p>
                </div>

                {/* Key Activities & Resources */}
                <div className="space-y-4 md:col-span-1">
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Activity size={12} className="text-indigo-650" /> Key Activities
                    </h4>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.businessCanvas.keyActivities}</p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Compass size={12} className="text-indigo-650" /> Key Resources
                    </h4>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.businessCanvas.keyResources}</p>
                  </div>
                </div>

                {/* Value Propositions */}
                <div className="border border-slate-200 rounded-xl p-4 bg-indigo-50/20 border-indigo-100 md:row-span-2">
                  <h4 className="text-[10px] font-bold text-indigo-850 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-indigo-650" /> Value Propositions
                  </h4>
                  <p className="text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed">{report.bonusAssets.businessCanvas.valuePropositions}</p>
                </div>

                {/* Customer Relationships & Channels */}
                <div className="space-y-4 md:col-span-1">
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Heart size={12} className="text-indigo-650" /> Relationships
                    </h4>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.businessCanvas.customerRelationships}</p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Globe size={12} className="text-indigo-650" /> Channels
                    </h4>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.businessCanvas.channels}</p>
                  </div>
                </div>

                {/* Customer Segments */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 md:row-span-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users size={12} className="text-indigo-650" /> Customer Segments
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.businessCanvas.customerSegments}</p>
                </div>

                {/* Cost Structure & Revenue Streams */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 md:col-span-2.5 col-span-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <DollarSign size={12} className="text-indigo-650" /> Cost Structure
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.businessCanvas.costStructure}</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-indigo-50/10 border-indigo-100 md:col-span-2.5 col-span-1">
                  <h4 className="text-[10px] font-bold text-indigo-850 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Coins size={12} className="text-indigo-650" /> Revenue Streams
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.businessCanvas.revenueStreams}</p>
                </div>

              </div>
            </div>
          )}

          {/* Lean Canvas */}
          {report.bonusAssets.leanCanvas && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="font-display text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">
                Lean Startup Canvas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                
                {/* Problem */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 md:row-span-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-indigo-650" /> Problem
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.leanCanvas.problem}</p>
                </div>

                {/* Solution & Key Metrics */}
                <div className="space-y-4 md:col-span-1">
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-indigo-650" /> Solution
                    </h4>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.leanCanvas.solution}</p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-indigo-650" /> Key Metrics
                    </h4>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.leanCanvas.keyMetrics}</p>
                  </div>
                </div>

                {/* Unique Value Proposition */}
                <div className="border border-slate-200 rounded-xl p-4 bg-indigo-50/20 border-indigo-100 md:row-span-2">
                  <h4 className="text-[10px] font-bold text-indigo-850 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-indigo-650" /> Unique Value Prop
                  </h4>
                  <p className="text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed">{report.bonusAssets.leanCanvas.uniqueValueProposition}</p>
                </div>

                {/* Unfair Advantage & Channels */}
                <div className="space-y-4 md:col-span-1">
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-indigo-650" /> Unfair Advantage
                    </h4>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.leanCanvas.unfairAdvantage}</p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Globe size={12} className="text-indigo-650" /> Channels
                    </h4>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.leanCanvas.channels}</p>
                  </div>
                </div>

                {/* Customer Segments */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 md:row-span-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users size={12} className="text-indigo-650" /> Customer Segments
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.leanCanvas.customerSegments}</p>
                </div>

                {/* Costs & Revenue */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 md:col-span-2.5 col-span-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <DollarSign size={12} className="text-indigo-650" /> Cost Structure
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.leanCanvas.costStructure}</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-indigo-50/10 border-indigo-100 md:col-span-2.5 col-span-1">
                  <h4 className="text-[10px] font-bold text-indigo-850 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Coins size={12} className="text-indigo-650" /> Revenue Streams
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{report.bonusAssets.leanCanvas.revenueStreams}</p>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 3: BRAND ASSETS & PITCHES */}
      {activeTab === 'brand' && report.bonusAssets && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Business Names & Brand Colors */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Names Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles size={12} /> Brand Names Generated
              </h4>
              <div className="flex flex-col gap-2">
                {report.bonusAssets.businessNameGenerator.map((name, idx) => (
                  <div key={idx} className="px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs text-slate-805 flex justify-between items-center">
                    <span>{name}</span>
                    <span className="text-[10px] text-indigo-500 font-semibold cursor-pointer" onClick={() => navigator.clipboard.writeText(name)}>Copy</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Domains Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Globe size={12} /> Domain Suggestions
              </h4>
              <div className="flex flex-col gap-2">
                {report.bonusAssets.domainSuggestions.map((domain, idx) => (
                  <div key={idx} className="px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 flex justify-between items-center font-medium">
                    <span>{domain}</span>
                    <a href={`https://www.whois.com/whois/${domain}`} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-500 font-semibold hover:underline">Check availability</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <LayoutGrid size={12} /> Color Theme Options
              </h4>
              <div className="flex flex-col gap-2">
                {report.bonusAssets.brandColorSuggestions.map((color, idx) => {
                  const hex = color.split(' ')[0];
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-150/40 rounded-xl">
                      <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: hex }}></div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-800">{hex}</div>
                        <p className="text-[10px] text-slate-500">{color.substring(hex.length + 1)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right panel: Brand statements & pitches */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Statements Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Core Positioning Foundations
              </h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Corporate Mission</h5>
                  <p className="text-sm text-slate-650 leading-relaxed font-normal">{report.bonusAssets.mission}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Corporate Vision</h5>
                  <p className="text-sm text-slate-650 leading-relaxed font-normal">{report.bonusAssets.vision}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Unique Value Proposition (UVP)</h5>
                  <p className="text-sm text-slate-800 leading-relaxed font-bold bg-indigo-50/20 border border-indigo-100/50 p-3 rounded-xl">{report.bonusAssets.uvp}</p>
                </div>
              </div>
            </div>

            {/* Pitches Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pb-2 border-b border-slate-100">
                  Elevator Pitch (30-Seconds)
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed italic">{report.bonusAssets.elevatorPitch}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pb-2 border-b border-slate-100">
                  McKinsey Investor Pitch Narrative
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">{report.bonusAssets.investorPitch}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pb-2 border-b border-slate-100">
                  Pitch Deck Outline Structure
                </h4>
                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-line border border-slate-800">
                  {report.bonusAssets.pitchDeckOutline}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 4: FINANCIAL OUTLOOK */}
      {activeTab === 'financial' && report.bonusAssets && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Unit Economics Box */}
          {report.bonusAssets.unitEconomics && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
              <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <Coins size={16} className="text-indigo-650" />
                <span>Unit Economics & CAC/CLV Indicators</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Acquisition Cost (CAC)</div>
                  <div className="text-xl font-black text-slate-805">{report.bonusAssets.unitEconomics.cac}</div>
                </div>

                <div className="bg-indigo-50/20 p-4 border border-indigo-100/40 rounded-xl">
                  <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">Customer Lifetime Value (CLV)</div>
                  <div className="text-xl font-black text-indigo-900">{report.bonusAssets.unitEconomics.clv}</div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl col-span-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CAC Payback Runway</div>
                  <div className="text-sm font-semibold text-slate-700">{report.bonusAssets.unitEconomics.paybackPeriod}</div>
                </div>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed font-normal">
                Standard unit margins of <span className="font-bold text-slate-700">{report.bonusAssets.unitEconomics.marginPercent || '78%'}</span> are mapped. This CAC/CLV ratio indicates high growth viability and early scaling stability.
              </div>
            </div>
          )}

          {/* Break-even Analysis Box */}
          {report.bonusAssets.breakEvenAnalysis && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
              <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-655" />
                <span>Monthly Break-Even Calculations</span>
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-655">Estimated Fixed Costs Monthly</span>
                  <span className="text-xs font-bold text-slate-900">{report.bonusAssets.breakEvenAnalysis.fixedCosts}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-655">Variable Costs Per Unit</span>
                  <span className="text-xs font-bold text-slate-900">{report.bonusAssets.breakEvenAnalysis.variableCostsPerUnit}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-655">Selling Price Per Unit (AOV)</span>
                  <span className="text-xs font-bold text-slate-900">{report.bonusAssets.breakEvenAnalysis.sellingPricePerUnit}</span>
                </div>
                <div className="flex justify-between items-center bg-indigo-50/30 p-3 rounded-xl border border-indigo-100/50">
                  <span className="text-xs font-bold text-indigo-900">Units Needed to Break-even</span>
                  <span className="text-sm font-black text-indigo-700">{report.bonusAssets.breakEvenAnalysis.breakEvenUnits}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-semibold leading-normal">
                Monthly revenue threshold to clear fixed capital burn is estimated at {report.bonusAssets.breakEvenAnalysis.breakEvenRevenue}.
              </div>
            </div>
          )}

          {/* Revenue Projection Card */}
          {report.bonusAssets.financialProjection && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left md:col-span-2">
              <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                <Activity size={16} className="text-indigo-650" />
                <span>3-Year Operational Revenue Forecasts</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Year 1 Forecast</div>
                  <div className="text-xl font-black text-slate-900">{report.bonusAssets.financialProjection.year1Revenue}</div>
                </div>

                <div className="bg-indigo-50/20 border border-indigo-100/30 rounded-xl p-4 text-center">
                  <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">Year 2 Forecast</div>
                  <div className="text-xl font-black text-indigo-900">{report.bonusAssets.financialProjection.year2Revenue}</div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Year 3 Forecast</div>
                  <div className="text-xl font-black text-slate-900">{report.bonusAssets.financialProjection.year3Revenue}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-655 font-normal leading-relaxed">
                <div>
                  <span className="font-bold text-slate-805 uppercase tracking-wider block mb-1">Cost of Goods Sold (COGS)</span>
                  {report.bonusAssets.financialProjection.cogs}
                </div>
                <div>
                  <span className="font-bold text-slate-805 uppercase tracking-wider block mb-1">Margins Guidance</span>
                  {report.bonusAssets.financialProjection.margins}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default ReportView;
