import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Player from './Player';
import Footer from './Footer'; // This was causing the error

const MainLayout = ({ currentStation }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-brand selection:text-white pb-24">
      {/* 1. Navbar is always here */}
      <Navbar />

      {/* 2. Main Content Area */}
      <main>
        <Outlet />
      </main>

      {/* 3. ADD THE FOOTER HERE */}
      <Footer />

      {/* 4. Player (Fixed at bottom) */}
      {currentStation && <Player station={currentStation} />}
    </div>
  );
};

export default MainLayout;