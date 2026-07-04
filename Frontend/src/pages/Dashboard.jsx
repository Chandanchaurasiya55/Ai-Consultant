import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle, FileText, LogOut, Sparkles, Calendar,
  ArrowRight, Loader2, AlertCircle, Trash2, Building2
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_BASE}/consultant/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load reports');
        const data = await res.json();
        setReports(data);
      } catch (err) {
        setError(err.message || 'Could not fetch your reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 animate-fade-in">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-brand-600 to-indigo-400 bg-clip-text text-transparent">{user?.name}</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Your AI-powered business research reports</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/audit/new"
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 text-sm"
            >
              <PlusCircle size={16} />
              New Research Audit
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-medium px-4 py-2.5 rounded-lg text-sm transition-all duration-200"
              title="Logout"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Reports</div>
            <div className="text-3xl font-extrabold text-brand-600">{reports.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Chapters Generated</div>
            <div className="text-3xl font-extrabold text-brand-600">{reports.length * 28}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Account</div>
            <div className="text-sm font-semibold text-slate-700 mt-1 truncate">{user?.email}</div>
          </div>
        </div>

        {/* Reports List */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Your Research Reports</h2>

          {loading && (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Loading your reports…</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {!loading && !error && reports.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-16 text-center">
              <div className="w-14 h-14 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-5">
                <Sparkles size={26} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No reports yet</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Run your first AI-powered 28-chapter McKinsey-grade business research audit in minutes.
              </p>
              <Link
                to="/audit/new"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-all duration-200 text-sm"
              >
                <PlusCircle size={16} />
                Start Your First Audit
              </Link>
            </div>
          )}

          {!loading && !error && reports.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base truncate">
                        {report.businessDetails?.businessName || 'Unnamed Business'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {report.businessDetails?.industry || '—'} · {report.businessDetails?.businessModel || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {report.businessDetails?.businessStage && (
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                        {report.businessDetails.businessStage}
                      </span>
                    )}
                    {report.businessDetails?.targetCountry && (
                      <span className="text-[11px] font-semibold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-md">
                        {report.businessDetails.targetCountry}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar size={12} />
                      {new Date(report.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </div>
                    <Link
                      to={`/audit/report/${report.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      View Report <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
