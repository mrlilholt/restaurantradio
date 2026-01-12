import React from 'react';
import { useAuth } from '../context/AuthContext'; // Note: Ensure capitalization matches your file (AuthContext vs authContext)
import { Navigate } from 'react-router-dom';
import { FaUserCircle, FaMusic, FaGoogle } from 'react-icons/fa';

const Login = () => {
  // 1. We changed 'login' to 'googleSignIn' to match the new AuthContext
  const { googleSignIn, currentUser } = useAuth();
  
  if (currentUser) return <Navigate to="/" />;

  // 2. A simple wrapper to handle the promise
  const handleLogin = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-brand to-brand-light rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-brand/20 transform rotate-3 hover:rotate-6 transition-transform duration-300">
               <FaMusic className="text-white text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Curate the perfect atmosphere for your guests.
            </p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleLogin} 
              className="group w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <FaGoogle className="text-xl text-slate-600 group-hover:text-brand transition-colors" />
              <span>Continue with Google</span>
            </button>
            
            <div className="text-center pt-6">
                <p className="text-xs text-slate-500 font-medium">
                  SECURE ACCESS • INSTANT SETUP
                </p>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-500 text-sm">
          By continuing, you agree to our Terms of Service <br/> and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;