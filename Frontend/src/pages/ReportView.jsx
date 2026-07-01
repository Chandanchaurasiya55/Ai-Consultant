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
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReportView = () => {
  const { id } = useParams();
  const { token } = useAuth();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Section regeneration states
  const [regenSectionKey, setRegenSectionKey] = useState(null); // section key currently open for input
  const [regenModifier, setRegenModifier] = useState('');
  const [submittingRegen, setSubmittingRegen] = useState(false);
  const [regeneratingKeys, setRegeneratingKeys] = useState({}); // tracker for keys in loading state: { pricingStrategy: true }

  // Active sidebar section state
  const [activeSection, setActiveSection] = useState('');

  const sectionKeys = [
    'executiveSummary', 'businessOverview', 'marketResearch', 'customerResearch',
    'competitorAnalysis', 'swot', 'pestle', 'porterFiveForces', 'businessModelAnalysis',
    'positioningBrand', 'pricingStrategy', 'goToMarket', 'channelMarketing', 'contentStrategy',
    'salesFunnel', 'customerAcquisition', 'aiAutomation', 'budgetRecommendation', 'executionPlan',
    'roadmapLongTerm', 'kpiDashboard', 'riskAssessment', 'finalRecommendations'
  ];

  const sectionIcons = {
    executiveSummary: FileText,
    businessOverview: Briefcase,
    marketResearch: Globe,
    customerResearch: Users,
    competitorAnalysis: Target,
    swot: BarChart3,
    pestle: Compass,
    porterFiveForces: ShieldAlert,
    businessModelAnalysis: Layers,
    positioningBrand: Award,
    pricingStrategy: DollarSign,
    goToMarket: Zap,
    channelMarketing: MessageSquare,
    contentStrategy: Sparkles,
    salesFunnel: ShoppingCart,
    customerAcquisition: TrendingUp,
    aiAutomation: Cpu,
    budgetRecommendation: DollarSign,
    executionPlan: Activity,
    roadmapLongTerm: Calendar,
    kpiDashboard: BarChart3,
    riskAssessment: AlertTriangle,
    finalRecommendations: Lightbulb
  };

  const sectionGroups = [
    {
      title: 'Context & Profile',
      keys: ['executiveSummary', 'businessOverview', 'businessModelAnalysis']
    },
    {
      title: 'Market Intelligence',
      keys: ['marketResearch', 'customerResearch', 'competitorAnalysis', 'swot', 'pestle', 'porterFiveForces']
    },
    {
      title: 'Brand Positioning',
      keys: ['positioningBrand', 'pricingStrategy']
    },
    {
      title: 'Growth & Marketing',
      keys: ['goToMarket', 'channelMarketing', 'contentStrategy', 'salesFunnel', 'customerAcquisition']
    },
    {
      title: 'Execution & Scale',
      keys: ['aiAutomation', 'budgetRecommendation', 'executionPlan', 'roadmapLongTerm', 'kpiDashboard', 'riskAssessment', 'finalRecommendations']
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
          throw new Error('Failed to load audit report details.');
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
    if (loading || !report) return;

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
  }, [report, loading]);

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
      const navbarOffset = 88; // 64px navbar + solid breathing space
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
        <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-sm font-semibold">Generating Strategy Report layout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center border-l-4 border-l-red-500 shadow-lg">
          <p className="text-red-700 font-semibold text-sm">Error: {error}</p>
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
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-all no-print mb-6 w-max">
        <ChevronLeft size={14} /> Return to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-200 mb-8 no-print">
        <div>
          <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold px-3 py-1 rounded-full w-max mb-3">
            <Award size={13} />
            <span>MarketPilot AI Consulting Engagement</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Strategy Audit: <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">{report.businessDetails?.businessName}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{report.businessDetails?.industry}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <Calendar size={13} className="text-slate-400" />
            <span>Audited on {formatDate(report.createdAt)}</span>
          </p>
        </div>
        
        <button 
          onClick={handlePrint} 
          className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer w-full lg:w-auto justify-center"
        >
          <Download size={15} /> Export Strategy Report (PDF)
        </button>
      </div>

      {/* Printed Header (Visible only on print) */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-300 pb-4">
        <h1 className="text-3xl font-black uppercase text-slate-950">MarketPilot AI Marketing Audit</h1>
        <p className="text-sm font-bold text-slate-700 mt-1">Company Profile Strategy Document</p>
        <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
          <div><strong>Business Name:</strong> {report.businessDetails?.businessName}</div>
          <div><strong>Industry:</strong> {report.businessDetails?.industry}</div>
          <div><strong>Business Stage:</strong> {report.businessDetails?.businessStage}</div>
          <div><strong>Primary Goal:</strong> {report.businessDetails?.primaryGoal}</div>
        </div>
      </div>

      {/* Content Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR NAVIGATION - no-print */}
        <div className="lg:col-span-3 lg:sticky lg:top-[96px] lg:h-[calc(100vh-136px)] flex flex-col no-print">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm overflow-hidden flex-grow flex flex-col">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 px-3">
              <FileText size={14} className="text-slate-400" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Report Sections
              </h3>
            </div>
            <nav className="flex flex-col gap-4 overflow-y-auto pr-1 flex-grow no-scrollbar">
              {sectionGroups.map((group, gIdx) => {
                const activeKeysInGroup = group.keys.filter(key => report.sections[key]);
                if (activeKeysInGroup.length === 0) return null;

                return (
                  <div key={gIdx} className="space-y-1">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
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
                                ? 'text-brand-700 bg-brand-50/60 border-brand-600 font-semibold shadow-sm' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                            }`}
                          >
                            <IconComponent size={14} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
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
                className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300 page-break"
              >
                {/* Visual Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-600 to-indigo-400"></div>

                {/* Visual loading overlays for local regeneration */}
                {isRegenerating && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center animate-fade-in">
                    <RefreshCw className="text-brand-600 animate-spin mb-2" size={28} />
                    <p className="text-xs font-semibold text-slate-500">Regenerating {getSectionTitle(key)}...</p>
                  </div>
                )}

                {/* Section Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-brand-50 border border-brand-100 text-brand-600 rounded-xl mt-0.5 shrink-0">
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
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200/60'
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

                  {/* Regenerate Section Button (no-print) */}
                  <button
                    onClick={() => setRegenSectionKey(regenSectionKey === key ? null : key)}
                    className="p-2 rounded-xl border border-slate-200 hover:border-brand-500 hover:text-brand-600 text-slate-400 hover:bg-brand-50/20 transition-all no-print cursor-pointer shrink-0"
                    title="Regenerate this section only"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                {/* Regeneration Form (no-print) */}
                {regenSectionKey === key && (
                  <div className="mb-6 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl no-print animate-fade-in shadow-inner">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold text-slate-800">Regenerate Section Options</h4>
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
                        placeholder="e.g. adjust pricing strategies targeting premium demographics, include local competitor options..."
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        value={regenModifier}
                        onChange={(e) => setRegenModifier(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRegenerate(key)}
                        disabled={submittingRegen}
                        className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        <Send size={11} />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Section Content */}
                <div className="text-slate-700 leading-relaxed text-sm whitespace-pre-line mb-6 font-normal">
                  {section.content}
                </div>

                {/* Section Recommendations */}
                {section.recommendations && section.recommendations.length > 0 && (
                  <div className="space-y-4 pt-5 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Strategic Recommendations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.recommendations.map((rec, rIdx) => {
                        const impactColor = rec.impact === 'High' ? 'border-l-emerald-500' : rec.impact === 'Medium' ? 'border-l-blue-500' : 'border-l-slate-350';
                        return (
                          <div 
                            key={rIdx} 
                            className={`bg-slate-50/40 hover:bg-white border border-slate-150/70 border-l-4 ${impactColor} rounded-xl p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between`}
                          >
                            <div>
                              <h5 className="font-bold text-slate-900 text-sm mb-2">{rec.title}</h5>
                              <div className="text-xs text-slate-650 mb-2 leading-relaxed">
                                <span className="font-semibold text-slate-800">Why: </span>{rec.why}
                              </div>
                              <div className="text-xs text-slate-650 mb-4 leading-relaxed">
                                <span className="font-semibold text-slate-800">How: </span>{rec.how}
                              </div>
                            </div>

                            {/* Recommendation Metadata Tags */}
                            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 mt-2">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                rec.impact === 'High' ? 'bg-green-50 text-green-700 border border-green-200' : 
                                rec.impact === 'Medium' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                                'bg-slate-50 text-slate-600 border border-slate-200'
                              }`}>
                                Impact: {rec.impact}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                rec.difficulty === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                                rec.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                Diff: {rec.difficulty}
                              </span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[120px]">
                                {rec.cost}
                              </span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                Time: {rec.timeframe}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* CITATIONS & SOURCES */}
          {report.sources && report.sources.length > 0 && (
            <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm text-left page-break relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-500 to-purple-500"></div>
              
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <FileText size={16} /> Verified Sources & Citations
              </h3>
              <div className="space-y-4">
                {report.sources.map((src, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 hover:border-slate-700/80 transition-all duration-200">
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-250">{src.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{src.snippet}</div>
                    </div>
                    {src.url && (
                      <a 
                        href={src.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 shrink-0 no-print transition-colors"
                      >
                        <span>Visit Site</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportView;
