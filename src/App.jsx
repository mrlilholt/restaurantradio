import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { RadioProvider } from './Context/RadioContext';
import { FavoritesProvider } from './Context/favoritesContext';
import Legal from './pages/Legal';

// Components
import Login from './components/Login';
import StationGrid from './components/StationGrid';
import MainLayout from './components/MainLayout'; // Import the new layout

// Pages
import Profile from './pages/Profile';
import About from './pages/About';

// import About from './pages/About'; // (Uncomment when you make this file)

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return null; // Or a spinner
  if (!currentUser) return <Navigate to="/login" />;
  
  // Note: We can add the Paywall check back here later
  return children;
};

function App() {
  // State lifted to the top so Player can access it from anywhere
  const [currentStation, setCurrentStation] = useState(null);
// 2. ADD THIS BLOCK: Capture Referral Code
React.useEffect(() => {
    // 1. Check if there is a 'ref' param in the URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');

    // 2. If found, save it to the browser's local storage
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
      console.log("Referral code captured:", refCode);
    }
  }, []);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('referredBy', refCode);
    }
  }, []);

  return (
    <AuthProvider>
      <RadioProvider>
        <FavoritesProvider> 
        <Router>
          <Routes>
            
            {/* PUBLIC ROUTE */}
            <Route path="/login" element={<Login />} />
            
            {/* PROTECTED & PERSISTENT ROUTES */}
            {/* We wrap these routes in the MainLayout. 
                React Router keeps MainLayout mounted while switching the inner 'element'.
            */}
            <Route element={
              <ProtectedRoute>
                <MainLayout currentStation={currentStation} />
              </ProtectedRoute>
            }>
                {/* These components appear INSIDE the <Outlet /> of MainLayout 
                */}
                <Route 
                   path="/" 
                   element={<StationGrid onPlayStation={setCurrentStation} />} 
                />
                <Route path="/profile" element={<Profile />} />
                <Route path="/about" element={<About />} />
                <Route path="/legal" element={<Legal />} />
            </Route>

          </Routes>
        </Router>
        </FavoritesProvider>
      </RadioProvider>
    </AuthProvider>
  );
}

export default App;