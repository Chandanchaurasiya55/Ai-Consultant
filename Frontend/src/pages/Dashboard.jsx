import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, ChevronRight, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-slate-500 text-sm mt-0.5">Optimize and scale your digital marketing presence.</p>
        </div>
        <Link to="/audit/new" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer">
          <Plus size={18} /> New Audit
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-3 border-slate-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 text-sm">Loading your dashboard data...</p>
        </div>
      ) : error ? (
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center border-l-4 border-l-red-500 shadow-sm">
          <p className="text-red-700 font-semibold">Error: {error}</p>
          <button onClick={() => window.location.reload()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg mt-4 cursor-pointer">Retry Loading</button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Stats widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                <FileText size={22} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Audits</h4>
                <div className="font-display text-2xl font-extrabold text-slate-900 leading-none">{reports.length}</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={22} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Average Score</h4>
                <div className="font-display text-2xl font-extrabold text-slate-900 leading-none">{reports.length > 0 ? '84/100' : 'N/A'}</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <BarChart3 size={22} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Active Channels</h4>
                <div className="font-display text-2xl font-extrabold text-slate-900 leading-none">{reports.length > 0 ? '4 Channels' : 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Audit History Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center pb-5 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-900">Marketing Audit History</h3>
              <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full">{reports.length} Audits Total</span>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-16 px-4">
                <FileText className="text-slate-300 mx-auto mb-4 animate-bounce" size={56} />
                <h4 className="text-base font-bold text-slate-800">No Audit Reports Yet</h4>
                <p className="text-slate-500 max-w-sm mx-auto mt-1 mb-6 text-sm leading-relaxed">
                  Provide your business name, offerings, and detail what you do to generate your first AI Audit Report.
                </p>
                <Link to="/audit/new" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-3 rounded-lg shadow inline-flex items-center gap-2 cursor-pointer transition-colors">
                  <Plus size={16} /> Generate First Audit
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 border border-slate-100 bg-slate-50/40 hover:bg-white hover:border-brand-300 rounded-xl transition-all duration-200 gap-4">
                    <div className="text-left">
                      <div className="text-base font-bold text-slate-900">{report.businessDetails?.businessName}</div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-1">
                        <span>{report.businessDetails?.industry}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <Calendar size={12} className="text-slate-400" />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </div>
                    <Link to={`/audit/report/${report.id}`} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto">
                      View Report <ChevronRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
