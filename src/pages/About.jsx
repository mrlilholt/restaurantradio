import React from 'react';
import { FaMusic, FaGlobeAmericas, FaHeart, FaShieldAlt } from 'react-icons/fa';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      
      {/* Header Section */}
      <div className="text-center mb-16 animate-fadeIn">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand to-brand-dark rounded-2xl shadow-xl shadow-brand/20 mb-6 rotate-3">
          <FaMusic className="text-4xl text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Atmosphere <span className="text-brand">Engineered</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          We help restaurants, cafes, and bars curate the perfect sonic environment for their guests, powered by a global network of high-quality radio streams.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/5 hover:border-brand/30 transition-colors">
          <FaGlobeAmericas className="text-3xl text-brand mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Global Reach</h3>
          <p className="text-slate-400">
            Access thousands of stations from over 100 countries. Authentic French jazz? Tokyo Pop? We have it.
          </p>
        </div>

        <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/5 hover:border-brand/30 transition-colors">
          <FaShieldAlt className="text-3xl text-brand mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Reliable Streams</h3>
          <p className="text-slate-400">
            We filter for high-uptime, high-bitrate streams so your background music never cuts out during service.
          </p>
        </div>

        <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/5 hover:border-brand/30 transition-colors">
          <FaHeart className="text-3xl text-brand mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Curated for You</h3>
          <p className="text-slate-400">
            Our algorithms learn your venue type (Cafe, Bar, Fine Dining) and suggest the perfect soundtrack.
          </p>
        </div>
      </div>

      {/* Story / Mission */}
      <div className="bg-slate-800 rounded-3xl p-10 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-4">Why we built this</h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>
              Silence is awkward. Bad music is worse. We realized that many restaurant owners rely on personal playlists that get repetitive, or expensive commercial services that lack soul.
            </p>
            <p>
              RestaurantRadio connects you to the live pulse of the world. It’s not a playlist; it’s a connection to culture. Whether you want the energy of a Berlin club or the relaxation of a Kyoto tea house, we bring that atmosphere to your venue instantly.
            </p>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm text-slate-500">Current Version v1.2.0</span>
            <span className="text-sm text-slate-500">© 2025 RestaurantRadio Inc.</span>
          </div>
        </div>
        
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </div>

    </div>
  );
};

export default About;