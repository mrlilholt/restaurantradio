import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FaLightbulb, FaPlay, FaTimes } from 'react-icons/fa';

const DailyInspo = ({ onPlay }) => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // 1. TIME-AWARE VIBE LOGIC
  const getVibe = (cuisine) => {
    const hour = new Date().getHours();
    
    // Define Time Slots
    const isMorning = hour >= 5 && hour < 11;     // 5am - 11am
    const isMidday = hour >= 11 && hour < 16;      // 11am - 4pm
    const isEvening = hour >= 16 && hour < 22;     // 4pm - 10pm
    // Late Night is 10pm - 5am

    // Normalize cuisine string (handles "Coffee Shop / Cafe" vs "Cafe")
    const type = cuisine?.toLowerCase() || '';

    // A. CAFE / BAKERY FLOW
    if (type.includes('cafe') || type.includes('bakery')) {
      if (isMorning) return { tag: 'jazz', title: 'Morning Brew', desc: 'Smooth jazz for the early rush.', label: 'Breakfast Special' };
      if (isMidday)  return { tag: 'acoustic', title: 'Acoustic Perk', desc: 'Light, breezy tracks for the lunch crowd.', label: 'Midday Special' };
      if (isEvening) return { tag: 'chillout', title: 'Evening Unwind', desc: 'Relaxing grooves for the late shifts.', label: 'Evening Special' };
      return { tag: 'lofi', title: 'Late Night Roast', desc: 'Deep beats for the closing crew.', label: 'Late Night Special' };
    }

    // B. FINE DINING / BISTRO FLOW
    if (type.includes('dining') || type.includes('bistro')) {
      if (isMorning) return { tag: 'classical', title: 'Morning Elegance', desc: 'Sophisticated sounds for prep time.', label: 'Morning Special' };
      if (isMidday)  return { tag: 'piano', title: 'Bistro Keys', desc: 'Gentle piano for a refined lunch.', label: 'Lunch Special' };
      if (isEvening) return { tag: 'lounge', title: 'The Supper Club', desc: 'Smooth, upscale atmosphere.', label: 'Dinner Special' };
      return { tag: 'ambient', title: 'Midnight Muse', desc: 'Minimalist sounds for a quiet close.', label: 'Late Night Special' };
    }

    // C. BAR / CASUAL / LOUD FLOW
    if (type.includes('bar') || type.includes('casual') || type.includes('fast')) {
      if (isMorning) return { tag: 'pop', title: 'Opening Energy', desc: 'Upbeat tracks to get the day started.', label: 'Morning Special' };
      if (isMidday)  return { tag: 'rock', title: 'Midday Pulse', desc: 'Classic energy for a busy floor.', label: 'Lunch Special' };
      if (isEvening) return { tag: 'house', title: 'The Golden Hour', desc: 'Deep house and grooves for the night.', label: 'Cocktail Special' };
      return { tag: 'techno', title: 'After Hours', desc: 'High energy for the late crowd.', label: 'After Hours' };
    }

    // D. DEFAULT FALLBACK
    return { tag: 'lofi', title: 'Daily Focus', desc: 'Chill beats to get you through the shift.', label: 'Daily Special' };
  };

  useEffect(() => {
    const fetchRecommendation = async () => {
      if (!currentUser) return;

      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);

          // Find vibe based on cuisine AND time of day
          const vibe = getVibe(data.cuisineType);
          
          const response = await fetch(
            `https://de1.api.radio-browser.info/json/stations/bytag/${vibe.tag}?limit=15&order=votes&reverse=true`
          );
          const stations = await response.json();
          
          if (stations.length > 0) {
            const randomStation = stations[Math.floor(Math.random() * stations.length)];
            setSuggestion({ ...randomStation, vibeDetails: vibe });
          }
        }
      } catch (error) {
        console.error("Error fetching inspo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [currentUser]);

  if (!isVisible || !profile?.cuisineType || !suggestion) return null;

  return (
    <div className="mb-8 bg-gradient-to-r from-brand-dark to-slate-800 rounded-2xl p-1 shadow-lg shadow-brand/10 animate-fadeIn">
      <div className="bg-slate-900/90 rounded-xl p-6 relative overflow-hidden backdrop-blur-sm">
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <FaTimes />
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaLightbulb className="text-3xl text-brand" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {/* This now displays "Lunch Special", "Dinner Special", etc. */}
              <span className="bg-brand/20 text-brand text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {suggestion.vibeDetails.label}
              </span>
              <span className="text-slate-400 text-xs font-medium">
                For your {profile.cuisineType}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">
              {suggestion.vibeDetails.title}
            </h3>
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              {suggestion.vibeDetails.desc} We found <strong>{suggestion.name}</strong> for you.
            </p>
          </div>

          <button 
            onClick={() => onPlay(suggestion)}
            className="w-full md:w-auto bg-white text-slate-900 hover:bg-brand hover:text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg group"
          >
            <FaPlay className="text-sm" />
            Play Recommendation
          </button>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default DailyInspo;