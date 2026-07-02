import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  ChevronRight, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Sparkles, 
  Bookmark, 
  Clock, 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Coins,
  ShieldCheck,
  CreditCard,
  Building,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation tabs within dashboard
  const [activeTab, setActiveTab] = useState('history'); // history, saved, profile, settings

  // Mock credits and activity parameters to enrich premium SaaS feel
  const [credits, setCredits] = useState({ available: 42, total: 50 });
  const [recentSearches, setRecentSearches] = useState([
    "Eco friendly household goods",
    "SaaS subscription payroll tool",
    "Local artisan bakery"
  ]);

  // Mock settings state
  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    autoEnrichUrl: true,
    consultingTone: "McKinsey Standard",
    geminiModel: "gemini-2.5-flash"
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/consultant/reports', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load audits.');
        }

        const data = await response.json();
        setReports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReports();
    }
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleNotification = () => {
    setSettingsForm(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      
      {/* Upper Brand Info Banner */}
      <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-64 h-64 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10">
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-150 w-max mb-3">
            <Sparkles size={12} fill="currentColor" />
            <span>Premium McKinsey-Grade Consulting AI</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user?.name || 'Researcher'}!
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-xl leading-relaxed">
            Formulate high-fidelity business strategy reports, market sizing frameworks, and competitor gap audits.
          </p>
        </div>

        <Link 
          to="/audit/new" 
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer shrink-0 z-10"
        >
          <Plus size={16} /> Compile New Research
        </Link>
      </div>

      {/* Grid: Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: NAVIGATION & SAAS METRIC METADATA */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Glassmorphic Navigation Panel */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/85 rounded-2xl p-4 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">
              Dashboard Controls
            </h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === 'history' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-655 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Clock size={15} />
                <span>Research History</span>
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === 'saved' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-655 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Bookmark size={15} />
                <span>Saved Reports</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-655 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <UserIcon size={15} />
                <span>Consultant Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-655 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <SettingsIcon size={15} />
                <span>Agent Settings</span>
              </button>
            </div>
          </div>

          {/* Credits remaining indicator card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Coins size={14} className="text-amber-500" />
                <span>Token Balance</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Resets monthly</span>
            </div>
            
            <div className="mb-2">
              <div className="text-2xl font-black text-slate-900">
                {credits.available} <span className="text-xs font-bold text-slate-400">/ {credits.total} credits</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-600 rounded-full" 
                style={{ width: `${(credits.available / credits.total) * 100}%` }}
              ></div>
            </div>

            <div className="text-[10px] text-slate-400 font-medium mt-3 leading-normal">
              1 credit is consumed per modular research compilation. Need more? <span className="text-indigo-600 font-bold cursor-pointer hover:underline">Upgrade Plan</span>
            </div>
          </div>

          {/* Recent Searches Sidebar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm text-left">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock size={12} /> Recent Ideas Run
            </h4>
            <div className="flex flex-col gap-2">
              {recentSearches.map((s, idx) => (
                <div key={idx} className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer truncate font-medium flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CONTENT RENDERER */}
        <div className="lg:col-span-9 space-y-6">

          {/* TAB 1: HISTORY OR SAVED */}
          {(activeTab === 'history' || activeTab === 'saved') && (
            <div className="space-y-6">
              
              {/* Stats Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Strategy Reports</h4>
                    <div className="font-display text-xl font-extrabold text-slate-900 leading-none">
                      {activeTab === 'saved' ? reports.filter((_, idx) => idx % 2 === 0).length : reports.length}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Average Score</h4>
                    <div className="font-display text-xl font-extrabold text-slate-900 leading-none">
                      {reports.length > 0 ? '88 / 100' : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Active Pipelines</h4>
                    <div className="font-display text-xl font-extrabold text-slate-900 leading-none">
                      {reports.length > 0 ? 'Grounding Enabled' : 'Ready'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reports Grid Section */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                    {activeTab === 'saved' ? 'Saved Strategy Reports' : 'Business Audit Trail'}
                  </h3>
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {activeTab === 'saved' ? reports.filter((_, idx) => idx % 2 === 0).length : reports.length} Reports
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center min-h-[250px]">
                    <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 text-xs font-semibold">Verifying secure DB records...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 text-center">
                    <p className="text-xs font-semibold">Error retrieving records: {error}</p>
                    <button onClick={() => window.location.reload()} className="bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold px-4 py-2 border border-slate-200 rounded-lg mt-3 cursor-pointer">Retry</button>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <FileText className="text-slate-350 mx-auto mb-4 animate-pulse" size={52} />
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">No Strategy Documents Found</h4>
                    <p className="text-slate-500 max-w-sm mx-auto mt-1 mb-6 text-xs leading-relaxed">
                      Supply your business name, target country, and preferences to build an investor-ready roadmap.
                    </p>
                    <Link to="/audit/new" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow inline-flex items-center gap-2 cursor-pointer transition-colors">
                      <Plus size={14} /> Generate First Report
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {(activeTab === 'saved' ? reports.filter((_, idx) => idx % 2 === 0) : reports).map((report) => (
                      <div 
                        key={report.id} 
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-md rounded-xl transition-all duration-200 gap-4"
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-slate-900">{report.businessDetails?.businessName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">Score: 88</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-550 mt-1">
                            <span className="font-semibold text-slate-700">{report.businessDetails?.industry}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            <span className="bg-indigo-50/70 border border-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 rounded">{report.businessDetails?.businessModel || 'B2C'}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            <Calendar size={12} className="text-slate-400" />
                            <span>{formatDate(report.createdAt)}</span>
                          </div>
                        </div>
                        <Link 
                          to={`/audit/report/${report.id}`} 
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          View Roadmap <ChevronRight size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider pb-4 border-b border-slate-100 mb-6 flex items-center gap-2">
                <UserIcon size={18} className="text-indigo-600" />
                <span>Consultant Profile Credentials</span>
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                    <div className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl">{user?.name || 'Researcher'}</div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl">{user?.email || 'N/A'}</div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900">Security Clearance Active</h4>
                    <p className="text-[11px] text-indigo-700/80 mt-0.5 leading-normal">
                      Your session is protected with 256-bit JWT authorization. Report parameters and documents are isolated and securely stored in your dedicated MongoDB sandbox.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <CreditCard className="text-slate-650" size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800">Subscription Tier: Enterprise Trial</div>
                    <p className="text-[10px] text-slate-450 mt-0.5">Renews automatically on August 1, 2026</p>
                  </div>
                  <button className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer ml-auto transition-colors">Manage Billing</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider pb-4 border-b border-slate-100 mb-6 flex items-center gap-2">
                <SettingsIcon size={18} className="text-indigo-600" />
                <span>Agent Settings & Preferences</span>
              </h3>

              <div className="space-y-6">
                
                {/* Switch 1 */}
                <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Email Notifications</div>
                    <p className="text-[10px] text-slate-450 mt-0.5">Send a digest when high-conviction competitor analysis completes.</p>
                  </div>
                  <button 
                    onClick={toggleNotification}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${settingsForm.emailNotifications ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform ${settingsForm.emailNotifications ? 'translate-x-5' : ''}`}></span>
                  </button>
                </div>

                {/* Switch 2 */}
                <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Auto-Enrichment from URL</div>
                    <p className="text-[10px] text-slate-450 mt-0.5">Pre-populate wizards using website heuristic meta scraping.</p>
                  </div>
                  <button 
                    onClick={() => setSettingsForm(prev => ({ ...prev, autoEnrichUrl: !prev.autoEnrichUrl }))}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${settingsForm.autoEnrichUrl ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform ${settingsForm.autoEnrichUrl ? 'translate-x-5' : ''}`}></span>
                  </button>
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Default Consulting Persona</label>
                    <select 
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={settingsForm.consultingTone}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, consultingTone: e.target.value }))}
                    >
                      <option value="McKinsey Standard">McKinsey Standard (Strategic & Analytical)</option>
                      <option value="Venture Capitalist">Venture Capitalist (Growth & Margin Focused)</option>
                      <option value="Product Owner">Product Owner (Agile & MVP Oriented)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">AI Execution Model</label>
                    <select 
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={settingsForm.geminiModel}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, geminiModel: e.target.value }))}
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Default)</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow cursor-pointer transition-all">Save Changes</button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
