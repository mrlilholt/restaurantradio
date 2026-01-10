import React from 'react';
import { useAuth } from '../context/authContext';
import { FaMusic, FaSignOutAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { currentUser, logout, accessStatus } = useAuth();
  
  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform duration-200">
                <FaMusic className="text-white text-lg" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white tracking-tight leading-none group-hover:text-brand-light transition-colors">
                Restaurant<span className="text-brand">Radio</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-medium tracking-[0.2em] uppercase mt-0.5">Global Ambience</span>
            </div>
          </Link>

          <div>
            {currentUser ? (
              <div className="flex items-center gap-6">
                {accessStatus?.plan === 'trial' && (
                   <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-brand/20">
                     <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                     <span className="text-xs font-semibold text-brand-light">
                       {accessStatus.daysLeft} days left in trial
                     </span>
                   </div>
                )}
                
                <button 
                  onClick={logout} 
                  className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
                >
                   <FaSignOutAlt />
                   <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    Log In
                </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;