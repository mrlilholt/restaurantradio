import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Player from './Player';

const MainLayout = ({ currentStation }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-brand selection:text-white pb-24">
      {/* 1. Navbar is always here */}
      <Navbar />

      {/* 2. Outlet is a placeholder where the child routes (Grid, Profile, About) will appear */}
      <Outlet />

      {/* 3. Player is always here (if station exists) */}
      {currentStation && <Player station={currentStation} />}
    </div>
  );
};

export default MainLayout;