import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to={token ? "/user-dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              Complain<span className="gradient-text">IQ</span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Civic Governance</span>
          </div>
        </Link>

        {/* Navigation Links */}
        {token && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-white/10">
            <Link
              to="/user-dashboard"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/user-dashboard')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Feed
            </Link>
            <Link
              to="/completed-complaints"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/completed-complaints')
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckBadgeIcon className="w-3.5 h-3.5" />
              Resolved
            </Link>
            <Link
              to="/profile"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive('/profile')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              My Profile
            </Link>
          </nav>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {token ? (
            <>
              <Link
                to="/create-post"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white gradient-bg hover:opacity-90 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <PlusIcon className="w-4 h-4" />
                New Complaint
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 border border-white/10 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
