import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes, FaSignOutAlt, FaCog, FaInfoCircle, FaThLarge } from 'react-icons/fa';

const Navbar = () => {
  const { currentUser, logout, accessStatus } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // For mobile menu
  const [isProfileOpen, setIsProfileOpen] = useState(false); // For desktop dropdown
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
             {/* 1. Put your file named 'logo.png' inside the 'public' folder! */}
             <img 
              src="/logo.png" 
              alt="Restaurant Radio Logo" 
              className="w-20 h-20 rounded-xl object-contain bg-slate-800 shadow-lg shadow-brand/20" 
            />
             
            <div className="flex items-center gap-3">
              <img 
                src="/bannerNav.png" 
                alt="Restaurant Radio" 
                className="h-12 object-contain" 
              />
              
              {/* Tagline to the RIGHT */}
              <span className="hidden sm:block text-[0.65rem] text-slate-400 font-medium tracking-wide uppercase border-l border-white/10 pl-3 h-4 flex items-center">
                Set the Ambience
              </span>
            </div>
          </Link>

          {/* DESKTOP RIGHT SIDE */}
<div className="hidden md:flex items-center gap-6">
  {currentUser ? (
    <div className="relative" ref={dropdownRef}>
      
      {/* --- UPDATED PROFILE BUTTON --- */}
      <button 
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="flex items-center gap-3 text-sm font-medium text-slate-300 hover:text-white transition-colors focus:outline-none"
      >
        <div className="text-right hidden lg:block">
           <span className="block text-xs text-brand">Signed in</span>
           <span className="block font-bold leading-none">{currentUser.displayName || 'User'}</span>
        </div>

        {/* IMAGE LOGIC START */}
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-slate-700 relative">
            {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile"
                  referrerPolicy="no-referrer" // <--- THE MAGIC FIX
                  className="w-full h-full object-cover"
                  onError={(e) => {
                      e.target.style.display = 'none'; // Hide broken image
                      e.target.nextSibling.style.display = 'flex'; // Show fallback icon
                  }} 
                />
            ) : null}
            
            {/* Fallback Icon (Hidden if image loads) */}
            <div className={`absolute inset-0 flex items-center justify-center bg-slate-800 ${currentUser.photoURL ? 'hidden' : 'flex'}`}>
                <FaUserCircle className="text-2xl text-slate-400" />
            </div>
        </div>
        {/* IMAGE LOGIC END */}

      </button>

      {/* DROPDOWN MENU (Kept exactly the same) */}
      {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-2xl border border-white/10 py-1 overflow-hidden animate-fadeIn z-50">
           <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="text-sm font-bold text-white truncate">{currentUser.email}</p>
           </div>
           
           <Link to="/" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
              <FaThLarge /> Dashboard
           </Link>
           <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
              <FaCog /> Profile & Settings
           </Link>
           <Link to="/about" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
              <FaInfoCircle /> About
           </Link>
           
           <button 
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 border-t border-white/5 mt-1"
           >
              <FaSignOutAlt /> Logout
           </button>
        </div>
      )}
    </div>
  ) : (
      <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white">Log In</Link>
  )}
</div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white">
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-b border-white/10 px-4 pt-2 pb-4 space-y-1">
           <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700">Dashboard</Link>
           <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700">Profile</Link>
           <Link to="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700">About</Link>
           <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-slate-700">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;