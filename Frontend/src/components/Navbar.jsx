import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, User, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-4 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-extrabold text-slate-900 tracking-tight">
          <Sparkles className="text-brand-600 animate-pulse" size={22} fill="currentColor" />
          <span>Business Research<span className="bg-gradient-to-r from-brand-600 to-indigo-400 bg-clip-text text-transparent"> Agent</span></span>
        </Link>

        {/* Middle Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/#about" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">About</Link>
          <Link to="/#services" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Services</Link>
          <Link to="/#pricing" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Price</Link>
          <Link to="/#blog" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Blog</Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 transition-all cursor-pointer hover:shadow-sm"
                title="Go to Dashboard"
              >
                <User size={12} />
                <span>{user?.name}</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors px-4 py-2 rounded-lg">Login</Link>
              <Link to="/register" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all duration-200">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
