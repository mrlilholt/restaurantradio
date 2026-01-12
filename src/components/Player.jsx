import React, { useRef, useEffect, useState } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExclamationTriangle, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../Context/AuthContext'; 
// 1. Use the new renamed hook
import { useCloudFavorites } from '../Context/favoritesContext';

const Player = ({ station }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // 2. Call the new hook name
  const { favorites = [], toggleFavorite } = useCloudFavorites();
  const { currentUser } = useAuth();

  if (!station) return null;

  // 3. Logic to check if favorited (with safety check)
  const isFav = Array.isArray(favorites) && favorites.some(fav => fav.stationuuid === station.stationuuid);

  // Check if favorite
  // 1. Handle Station Changes
  useEffect(() => {
    setError(false);
    setIsPlaying(false);

    if (audioRef.current) {
        const source = station.url_resolved || station.url;
        if (!source) {
            setError(true);
            return;
        }
        audioRef.current.src = source;
        audioRef.current.load(); // Ensure new source is loaded

        // Try to auto-play
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => setIsPlaying(true))
                .catch(err => {
                    console.log("Autoplay prevented:", err);
                    setIsPlaying(false);
                });
        }
    }
  }, [station]);

  // 2. Handle Volume Changes (NEW)
  useEffect(() => {
    if (audioRef.current) {
      // If muted, volume is 0. Otherwise, use the slider value.
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(e => console.error("Play failed:", e));
    } else {
        audioRef.current.pause();
        setIsPlaying(false);
    }
  };

  const safeName = station.name || "Unknown Station";
  const safeAtmosphere = station.atmosphere || "Live Radio";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 z-50 animate-slideUp">
      
      {/* Hidden Audio Element */}
      <audio 
          ref={audioRef} 
          onError={() => setError(true)} 
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          crossOrigin="anonymous"
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LEFT: Station Info */}
        <div className="flex items-center gap-4 w-1/3">
           <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0 relative">
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
              <div className="flex items-center gap-1">
                  <h4 className="text-white text-sm font-medium truncate max-w-[200px] select-none">
                    {safeName}
                  </h4>
                  
                  {/* UPDATE: Larger hit area (p-2) and stopPropagation */}
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!currentUser) return alert("Log in to save favorites!");
                        toggleFavorite(station);
                    }}
                    className="p-2 text-slate-400 hover:text-brand-light hover:scale-110 active:scale-95 transition-all"
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

        {/* CENTER: Play Controls */}
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

        {/* RIGHT: Real Volume Control */}
        <div className="flex items-center justify-end gap-3 w-1/3 text-slate-400 group">
            <button 
                onClick={() => setIsMuted(!isMuted)}
                className="hover:text-white transition-colors focus:outline-none"
            >
                {isMuted || volume === 0 ? <FaVolumeMute className="text-lg" /> : <FaVolumeUp className="text-lg" />}
            </button>
            
            <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false); // Unmute if they drag the slider
                }}
                className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand hover:bg-slate-600 transition-colors"
            />
        </div>
      </div>
    </div>
  );
};

export default Player;