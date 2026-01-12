import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FaLightbulb, FaPlay, FaArrowRight, FaTimes } from 'react-icons/fa';

const DailyInspo = ({ onPlay }) => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // 1. Define the "Vibes" logic
  // Map cuisine types to Radio Browser tags/countries
  const getVibe = (cuisine) => {
    const vibes = {
      'Cafe': { tag: 'jazz', title: 'Morning Brew', desc: 'Smooth jazz for a relaxed start.' },
      'Fine Dining': { tag: 'classical', title: 'Elegant Evening', desc: 'Sophisticated sounds for fine plating.' },
      'Casual': { tag: 'pop', title: 'Upbeat Lunch', desc: 'Keep the energy moving.' },
      'Bar': { tag: 'house', title: 'Cocktail Hour', desc: 'Deep grooves for the night crowd.' },
      'Fast Food': { tag: 'top 40', title: 'Top Hits', desc: 'Current hits to keep the pace fast.' },
      'Bakery': { tag: 'acoustic', title: 'Fresh Out the Oven', desc: 'Warm, acoustic tracks.' },
    };
    // Default fallback if they haven't set a cuisine or picked something else
    return vibes[cuisine] || { tag: 'lofi', title: 'Daily Focus', desc: 'Chill beats to get you through the prep.' };
  };

  useEffect(() => {
    const fetchRecommendation = async () => {
      if (!currentUser) return;

      try {
        // A. Get User Profile
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);

          // If they have a cuisine, find a station for it
          if (data.cuisineType) {
            const vibe = getVibe(data.cuisineType);
            
            // B. Fetch from Radio Browser API
            // We fetch 10 stations with this tag and pick a random one
            const response = await fetch(
              `https://de1.api.radio-browser.info/json/stations/bytag/${vibe.tag}?limit=15&order=votes&reverse=true`
            );
            const stations = await response.json();
            
            if (stations.length > 0) {
              // Pick a random one from the top 15 results to keep it fresh
              const randomStation = stations[Math.floor(Math.random() * stations.length)];
              setSuggestion({ ...randomStation, vibeDetails: vibe });
            }
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
        
        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <FaTimes />
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          
          {/* Icon Box */}
          <div className="w-16 h-16 bg-brand/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FaLightbulb className="text-3xl text-brand" />
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-brand/20 text-brand text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Daily Special
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

          {/* Action Button */}
          <button 
            onClick={() => onPlay(suggestion)}
            className="w-full md:w-auto bg-white text-slate-900 hover:bg-brand hover:text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg group"
          >
            <FaPlay className="text-sm" />
            Play Recommendation
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default DailyInspo;