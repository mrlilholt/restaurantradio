import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import StationGrid from './components/StationGrid';
import Player from './components/Player';
import { FavoritesProvider } from './context/FavoritesContext';
// --- COMPONENTS ---

const ProtectedRoute = ({ children }) => {
  const { currentUser, accessStatus } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (!accessStatus?.hasAccess) return <Navigate to="/premium" />;
  return children;
};

// Update Layout to accept currentStation and pass it to Player
const Layout = ({ children, currentStation }) => (
  // FIX APPLIED HERE: Added 'pt-20' to push content down below the fixed Navbar
  <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-brand selection:text-white pb-24 pt-20">
    <Navbar />
    {children}
    {/* Only show Player if we actually have a station to play */}
    {currentStation && <Player station={currentStation} />}
  </div>
);

const Paywall = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
    <div className="text-center max-w-lg bg-slate-800 p-8 rounded-2xl border border-red-500/20 shadow-2xl">
      <div className="text-5xl mb-4">⛔</div>
      <h2 className="text-2xl font-bold text-white mb-2">Trial Expired</h2>
      <button className="bg-brand hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-xl transition-colors w-full shadow-lg shadow-brand/20">
        Pay $5.00 for Lifetime Access
      </button>
    </div>
  </div>
);

// --- MAIN APP ---
function App() {
  // 1. Create state to hold the playing station
  const [currentStation, setCurrentStation] = useState(null);

  return (
    <AuthProvider>
      <FavoritesProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              {/* 2. Pass the state down to Layout */}
              <Layout currentStation={currentStation}>
                {/* 3. Pass the setter function to the Grid so it can change the music */}
                <StationGrid onPlayStation={setCurrentStation} />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/premium" element={
            <ProtectedRoute>
                 <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pt-20">
                    <Navbar /> 
                    <Paywall />
                 </div>
            </ProtectedRoute>
          } />

        </Routes>
      </Router>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;