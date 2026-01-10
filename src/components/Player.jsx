import React, { useRef, useEffect, useState } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaExclamationTriangle, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useFavorites } from '../context/RadioContext'; // <--- Import this

const Player = ({ station }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  
  // Get Favorites logic
  const { isFavorite, toggleFavorite } = useFavorites();

  // 1. Safety Check: If no station data, don't try to render
  if (!station) return null;

  useEffect(() => {
    // Reset state when station changes
    setError(false);
    setIsPlaying(false);

    if (audioRef.current) {
        // 2. Data Safety: Check for valid URL
        const source = station.url_resolved || station.url;
        
        if (!source) {
            console.warn("Station missing URL:", station);
            setError(true);
            return;
        }

        audioRef.current.src = source;
        
        // 3. Play Safety: Handle browser Autoplay policies
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(err => {
                    console.error("Playback failed (Autoplay or Format):", err);
                    setIsPlaying(false);
                });
        }
    }
  }, [station]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(e => console.error("Manual play failed:", e));
    } else {
        audioRef.current.pause();
        setIsPlaying(false);
    }
  };

  // 4. Render Safety: Handle missing names/favicons gracefully
  const safeName = station.name || "Unknown Station";
  const safeAtmosphere = station.atmosphere || "Live Radio";
  const isFav = isFavorite(station.stationuuid); // Check if this station is liked

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 z-50 animate-slideUp">
      
      <audio 
          ref={audioRef} 
          onError={() => setError(true)} 
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LEFT: Station Info */}
        <div className="flex items-center gap-4 w-1/3">
           <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0 relative group">
              {/* Show Spinner if connecting */}
              {!isPlaying && !error && !audioRef.current?.paused && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
              )}
              
              {station.favicon ? (
                  <img 
                    src={station.favicon} 
                    alt="Logo" 
                    className="w-full h-full object-cover" 
                    onError={(e) => e.target.style.display='none'} 
                  />
              ) : (
                  <span className="text-white font-bold text-lg">{safeName.substring(0, 2).toUpperCase()}</span>
              )}
           </div>
           
           <div className="hidden sm:block overflow-hidden">
              <div className="flex items-center gap-2">
                  <h4 className="text-white text-sm font-medium truncate max-w-[200px] select-none">
                    {safeName}
                  </h4>
                  {/* FAVORITE BUTTON ADDED HERE */}
                  <button 
                    onClick={() => toggleFavorite(station)}
                    className="text-slate-400 hover:text-brand-light transition-colors focus:outline-none"
                  >
                    {isFav ? <FaHeart className="text-brand" /> : <FaRegHeart />}
                  </button>
              </div>
              
              <p className="text-brand text-xs truncate select-none flex items-center gap-1">
                  {error ? (
                      <span className="text-red-400 flex items-center gap-1"><FaExclamationTriangle /> Stream Offline</span>
                  ) : safeAtmosphere}
              </p>
           </div>
        </div>

        {/* CENTER: Controls */}
        <div className="flex flex-col items-center gap-1 w-1/3">
           <button 
             onClick={togglePlay}
             disabled={error}
             className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg shadow-white/5 
                ${error ? 'bg-slate-700 cursor-not-allowed text-slate-500' : 'bg-white text-slate-900 hover:scale-105 hover:bg-brand-light'}
             `}
           >
              {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
           </button>
        </div>

        {/* RIGHT: Volume (Visual) */}
        <div className="flex items-center justify-end gap-3 w-1/3 text-slate-400">
            <FaVolumeUp className="text-sm" />
            <div className="w-20 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-slate-500 rounded-full" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Player;