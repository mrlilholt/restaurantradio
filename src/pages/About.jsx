import React, { useState } from 'react';
import { 
  FaMusic, FaGlobeAmericas, FaHeart, FaShieldAlt, 
  FaCode, FaTimes, FaLayerGroup, FaCheckCircle, FaRocket, FaServer 
} from 'react-icons/fa';

const About = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Milestone data for the Tech Stack Modal
  const milestones = [
    { 
      title: "Subscription Logic", 
      desc: "Architected a multi-tier Stripe billing system supporting Monthly, Annual, and Lifetime access with automated trial gating." 
    },
    { 
      title: "Cuisine-Aware Vibe Engine", 
      desc: "Developed a dynamic recommendation algorithm that suggests stations based on restaurant type and time-of-day." 
    },
    { 
      title: "Real-time Sync", 
      desc: "Implemented Firestore listeners to sync favorites and 'Recently Played' history across multiple devices instantly." 
    },
    { 
      title: "Conversion Tracking", 
      desc: "Integrated Google Analytics (GA4) with custom events to monitor the full user journey from landing to checkout." 
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16 pt-32">
      
      {/* 1. HEADER SECTION */}
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
        
        {/* TECH STACK TOGGLE BUTTON */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-8 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl border border-white/10 transition-all font-bold group shadow-lg"
        >
          <FaCode className="text-brand group-hover:scale-110 transition-transform" />
          View Project Tech Stack
        </button>
      </div>

      {/* 2. FEATURE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/5 hover:border-brand/30 transition-colors">
          <FaGlobeAmericas className="text-3xl text-brand mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Global Reach</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Access over 30,000 live stations from every corner of the globe. From Tokyo jazz to Parisian cafe beats.
          </p>
        </div>

        <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/5 hover:border-brand/30 transition-colors">
          <FaShieldAlt className="text-3xl text-brand mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Reliable Streams</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            We prioritize high-bitrate, stable connections to ensure your atmosphere never cuts out during service.
          </p>
        </div>

        <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/5 hover:border-brand/30 transition-colors">
          <FaHeart className="text-3xl text-brand mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Curated For You</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Our 'Daily Special' logic picks the perfect station based on your restaurant type and the time of day.
          </p>
        </div>
      </div>

      {/* 3. STORY / MISSION SECTION */}
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

      {/* 4. TECH STACK MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-800 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center gap-3">
                <FaLayerGroup className="text-brand text-xl" />
                <h2 className="text-xl font-bold text-white">Engineering RestaurantRadio</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Column 1: Core Tech */}
                <div>
                  <h3 className="text-brand font-black text-[10px] uppercase tracking-widest mb-4">Main Stack</h3>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0"><FaRocket size={14}/></div>
                      <div>
                        <p className="font-bold text-sm text-white">React & Vite</p>
                        <p className="text-[11px] text-slate-500">High-performance SPA with fast hot-reloading.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0"><FaServer size={14}/></div>
                      <div>
                        <p className="font-bold text-sm text-white">Firebase Suite</p>
                        <p className="text-[11px] text-slate-500">Firestore NoSQL, Cloud Auth, and Serverless Functions.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0"><FaLayerGroup size={14}/></div>
                      <div>
                        <p className="font-bold text-sm text-white">Tailwind CSS</p>
                        <p className="text-[11px] text-slate-500">Utility-first styling with custom glassmorphism components.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Accomplishments */}
                <div>
                  <h3 className="text-brand font-black text-[10px] uppercase tracking-widest mb-4">Key Achievements</h3>
                  <div className="space-y-4">
                    {milestones.map((m, i) => (
                      <div key={i} className="flex gap-3">
                        <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={14} />
                        <div>
                          <p className="text-xs font-bold text-white">{m.title}</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{m.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stripe & GA Mention - FIXED GA4 LOGO */}
              <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-8 grayscale opacity-40">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                    alt="Stripe" 
                    className="h-4" 
                />
                <img 
                    src="https://www.vectorlogo.zone/logos/google_analytics/google_analytics-ar21.svg" 
                    alt="Google Analytics 4" 
                    className="h-5" 
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900/50 border-t border-white/5 text-center flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live System Production v1.2.0</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;