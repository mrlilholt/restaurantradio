import React, { useRef, useEffect, useState } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaRegHeart, FaHeart } from 'react-icons/fa';
import { useFavorites } from '../context/favoritesContext';

const Player = ({ station }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  // Get Favorites Logic
  const { toggleFavorite, isFavorite } = useFavorites();
  const isFav = isFavorite(station?.stationuuid);

  // When the 'station' prop changes, load and play the new URL
  useEffect(() => {
    if (station && audioRef.current) {
        setError(false);
        setIsPlaying(true); // Assume it will play
        
        // The API gives us 'url_resolved' which is the direct stream link
        audioRef.current.src = station.url_resolved || station.url;
        audioRef.current.play().catch(err => {
            console.error("Playback failed:", err);
            setIsPlaying(false);
            setError(true);
        });
    }
  }, [station]);

  const togglePlay = () => {
    if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
    } else {
        audioRef.current.pause();
        setIsPlaying(false);
    }
  };

  if (!station) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 z-50">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} onError={() => setError(true)} onPause={() => setIsPlaying(false)} onPlay={() => setIsPlaying(true)} />

      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/3">
           <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${station.coverGradient || 'from-gray-700 to-gray-900'} flex items-center justify-center shrink-0`}>
              {/* Try to show station logo (favicon), fallback to initials */}
              {station.favicon ? (
                  <img src={station.favicon} alt="Station Logo" className="w-full h-full object-cover rounded-lg" onError={(e) => e.target.style.display='none'} />
              ) : (
                  <span className="text-white font-bold">{station.name?.substring(0, 2)}</span>
              )}
           </div>
           <div className="hidden sm:block overflow-hidden">
              <h4 className="text-white text-sm font-medium truncate max-w-[200px]" title={station.name}>
                {station.name}
              </h4>
              <p className="text-brand text-xs truncate">
                  {error ? 'Stream Unavailable' : (station.atmosphere || 'Live Radio')}
              </p>
           </div>
           {/* NEW: Favorite Button in Player */}
           <button 
             onClick={() => toggleFavorite(station)}
             className="ml-2 text-slate-400 hover:text-brand transition-colors"
           >
             {isFav ? <FaHeart className="text-brand" /> : <FaRegHeart />}
           </button>
        </div>
              
        
        {/* Play/Pause Controls */}
        <div className="flex flex-col items-center gap-1 w-1/3">
           <button 
             onClick={togglePlay}
             className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 hover:scale-105 transition-transform shadow-lg shadow-white/10"
           >
              {isPlaying ? <FaPause className="text-sm" /> : <FaPlay className="ml-1 text-sm" />}
           </button>
        </div>

        {/* Volume Icon (Visual only for now) */}
        <div className="flex items-center justify-end gap-3 w-1/3 text-slate-400">
            <FaVolumeUp className="text-sm" />
        </div>

      </div>
    </div>
  );
};

export default Player;