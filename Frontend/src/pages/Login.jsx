import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-6 py-12 animate-fade-in">
      <div className="w-full max-w-[440px] bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-xl text-center">
        <div className="auth-header mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-xl text-brand-600 mb-5">
            <Sparkles size={28} fill="currentColor" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome Back</h2>
          <p className="text-sm text-slate-500">Log in to view your marketing audits</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-lg text-sm mb-6 text-left border-l-4 border-red-500 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-5 text-left">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="email">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6 text-left">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="password">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                id="password"
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="text-sm text-slate-600 mt-6">
          Don't have an account? <Link to="/register" className="text-brand-600 font-bold hover:text-brand-700 transition-colors">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
