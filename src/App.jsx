import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RadioProvider } from './context/RadioContext';

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

  return (
    <AuthProvider>
      <RadioProvider>
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
            </Route>

          </Routes>
        </Router>
      </RadioProvider>
    </AuthProvider>
  );
}

export default App;