import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon as HomeOutline,
  PlusSquareIcon as PlusOutline,
  UserIcon as UserOutline,
  CheckCircleIcon as CheckOutline,
  SearchIcon,
  LogOutIcon,
  Sparkles
} from 'lucide-react';
import { 
  HomeIcon as HomeSolid,
  PlusSquareIcon as PlusSolid,
  UserIcon as UserSolid,
  CheckCircleIcon as CheckSolid
} from 'lucide-react';

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
    <>
      {/* Top Desktop & Mobile Header */}
      <header className="sticky top-0 z-40 w-full bg-black/90 backdrop-blur-md border-b border-[#262626]">
        <div className="max-w-5xl mx-auto px-4 h-15 flex items-center justify-between py-3">
          
          {/* Brand Logo */}
          <Link to={token ? "/user-dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              Complain<span className="text-sky-500">IQ</span>
            </span>
          </Link>

          {/* Search Input (Desktop) */}
          {token && (
            <div className="hidden md:flex items-center gap-2 bg-[#121212] border border-[#262626] rounded-xl px-3 py-1.5 w-64">
              <SearchIcon className="w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search civic feed..." 
                className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full"
              />
            </div>
          )}

          {/* Desktop Right Nav Links */}
          {token ? (
            <div className="hidden md:flex items-center gap-5">
              <Link to="/user-dashboard" title="Feed" className="text-white hover:opacity-80 transition-opacity">
                {isActive('/user-dashboard') ? <HomeSolid className="w-6 h-6 text-white" /> : <HomeOutline className="w-6 h-6 text-gray-300" />}
              </Link>
              <Link to="/create-post" title="New Complaint" className="text-white hover:opacity-80 transition-opacity">
                {isActive('/create-post') ? <PlusSolid className="w-6 h-6 text-white" /> : <PlusOutline className="w-6 h-6 text-gray-300" />}
              </Link>
              <Link to="/completed-complaints" title="Resolved" className="text-white hover:opacity-80 transition-opacity">
                {isActive('/completed-complaints') ? <CheckSolid className="w-6 h-6 text-emerald-400" /> : <CheckOutline className="w-6 h-6 text-gray-300" />}
              </Link>
              <Link to="/profile" title="Profile" className="text-white hover:opacity-80 transition-opacity">
                {isActive('/profile') ? <UserSolid className="w-6 h-6 text-white" /> : <UserOutline className="w-6 h-6 text-gray-300" />}
              </Link>
              <button 
                onClick={handleLogout} 
                title="Logout" 
                className="text-gray-400 hover:text-red-400 transition-colors pl-2 border-l border-[#262626]"
              >
                <LogOutIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 transition-colors"
            >
              Log In
            </Link>
          )}

          {/* Mobile Right Quick Logout Action */}
          {token && (
            <button 
              onClick={handleLogout} 
              className="md:hidden text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOutIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Bottom Mobile Navigation Bar (Instagram Native App Navigation) */}
      {token && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/95 backdrop-blur-lg border-t border-[#262626] px-6 py-3 flex items-center justify-between">
          <Link to="/user-dashboard" className="text-white">
            {isActive('/user-dashboard') ? <HomeSolid className="w-6 h-6 text-white" /> : <HomeOutline className="w-6 h-6 text-gray-400" />}
          </Link>
          <Link to="/completed-complaints" className="text-white">
            {isActive('/completed-complaints') ? <CheckSolid className="w-6 h-6 text-emerald-400" /> : <CheckOutline className="w-6 h-6 text-gray-400" />}
          </Link>
          <Link to="/create-post" className="text-white">
            {isActive('/create-post') ? <PlusSolid className="w-7 h-7 text-sky-500" /> : <PlusOutline className="w-7 h-7 text-gray-300" />}
          </Link>
          <Link to="/profile" className="text-white">
            {isActive('/profile') ? <UserSolid className="w-6 h-6 text-white" /> : <UserOutline className="w-6 h-6 text-gray-400" />}
          </Link>
        </div>
      )}
    </>
  );
}

export default Navbar;
