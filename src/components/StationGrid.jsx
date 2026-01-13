import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../Context/AuthContext';
import { db, functions } from '../utils/firebase'; // COMBINED: db and functions
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore'; 
import { 
  FaCoffee, FaWineGlass, FaUtensils, FaBeer, 
  FaMusic, FaGlobeAmericas, FaTag, FaSpinner, FaArrowLeft, FaMapMarkerAlt, 
  FaHeart, FaRegHeart, FaStar, FaCocktail, FaLeaf, FaMoon, FaPlay, FaHistory,
  FaLock 
} from 'react-icons/fa';
import { useRadioBrowser, getFlagEmoji } from '../hooks/useRadioBrowser';
import DailyInspo from './DailyInspo';
import { httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom'; // Add this
// gories
const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return { label: "The Morning Rush", activity: "brewing coffee to", vibe: "Morning Cafe" };
    if (hour >= 11 && hour < 15) return { label: "The Lunch Crowd", activity: "serving lunch to", vibe: "Bistro Beats" };
    if (hour >= 15 && hour < 17) return { label: "The Afternoon Slump", activity: "powering through to", vibe: "Acoustic Chill" };
    if (hour >= 17 && hour < 22) return { label: "Dinner Service", activity: "setting the mood with", vibe: "Lounge & Wine" };
    return { label: "Late Night Vibes", activity: "winding down to", vibe: "Midnight Jazz" };
};

const stationTypes = [
  { id: 'cafe', name: 'Morning Cafe', tags: 'jazz,acoustic', icon: FaCoffee, color: 'from-orange-400 to-amber-600', description: 'Soft vocals and gentle guitar.' },
  { id: 'dining', name: 'Fine Dining', tags: 'classical,piano', icon: FaUtensils, color: 'from-slate-700 to-slate-900', description: 'Elegant background ambiance.' },
  { id: 'lounge', name: 'Lounge & Bar', tags: 'house,chillout', icon: FaCocktail, color: 'from-purple-500 to-indigo-600', description: 'Upbeat but chill vibes.' },
  { id: 'bistro', name: 'Bistro', tags: 'folk,oldies', icon: FaWineGlass, color: 'from-red-500 to-rose-700', description: 'Authentic local classics.' },
  { id: 'brunch', name: 'Garden Brunch', tags: 'indie,pop', icon: FaLeaf, color: 'from-green-400 to-emerald-600', description: 'Breezy tunes for outdoors.' },
  { id: 'night', name: 'Late Night', tags: 'lofi,ambient', icon: FaMoon, color: 'from-blue-600 to-cyan-800', description: 'Relaxed beats for closing.' },
];

const StationGrid = ({ onPlayStation }) => { 
  const { countries, searchStation } = useRadioBrowser();
  const { currentUser, isPro, isTrialActive, trialDaysLeft } = useAuth();  
  // --- STATE ---
  const [favorites, setFavorites] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]); 
  const [selectedLocation, setSelectedLocation] = useState(null); 
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVibe, setActiveVibe] = useState(null); 
  const [stationList, setStationList] = useState([]); 
  const [loadingVibeId, setLoadingVibeId] = useState(null); 
  const navigate = useNavigate();
  const timeContext = getTimeContext();
  const [showLivePill, setShowLivePill] = useState(true); // Default to true

  // --- FIRESTORE SYNC (Favorites + History) ---
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setRecentlyPlayed([]);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.favorites) setFavorites(data.favorites);
        if (data.recentlyPlayed) setRecentlyPlayed(data.recentlyPlayed);
        setShowLivePill(data.showLivePill !== false); 
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // --- ACTIONS ---

  // 1. Toggle Favorite
  const toggleFavorite = async (e, station) => {
    e.stopPropagation();
    if (!currentUser) { alert("Please log in to save favorites!"); return; }

    const userRef = doc(db, 'users', currentUser.uid);
    const isAlreadyFav = favorites.some(f => f.stationuuid === station.stationuuid);

    try {
      if (isAlreadyFav) {
        await updateDoc(userRef, { favorites: arrayRemove(station) });
      } else {
        await setDoc(userRef, { favorites: arrayUnion(station) }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  // 2. Add to History
  const addToHistory = async (station) => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    
    try {
        const docSnap = await getDoc(userRef);
        let currentHistory = [];
        if (docSnap.exists() && docSnap.data().recentlyPlayed) {
            currentHistory = docSnap.data().recentlyPlayed;
        }

        const filtered = currentHistory.filter(s => s.stationuuid !== station.stationuuid);
        filtered.unshift(station);
        const trimmed = filtered.slice(0, 6);

        await setDoc(userRef, { recentlyPlayed: trimmed }, { merge: true });
    } catch (error) {
        console.error("Error saving history:", error);
    }
  };

  const isFavorite = (id) => favorites.some(f => f.stationuuid === id);

  // --- PREPARE CARDS ---
  
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoritesCard = {
    id: 'favorites',
    name: 'My Favorites',
    tags: 'saved',
    icon: FaStar,
    color: 'from-yellow-500 to-amber-600',
    description: `${favorites.length} stations in your collection.`
  };

  const historyCard = {
    id: 'history',
    name: 'Recently Played',
    tags: 'history',
    icon: FaHistory,
    color: 'from-pink-500 to-rose-600',
    description: 'Jump back into your recent grooves.'
  };

  const displayCards = [favoritesCard, historyCard, ...stationTypes];

  // --- GROUPING LOGIC FOR FAVORITES ---
  const groupedFavorites = useMemo(() => {
    if (!favorites.length) return {};
    const grouped = {};
    favorites.forEach(station => {
      const country = station.country || 'International';
      let genre = station.tags ? station.tags.split(',')[0].trim() : 'Various';
      genre = genre.charAt(0).toUpperCase() + genre.slice(1);
      if (!grouped[country]) grouped[country] = {};
      if (!grouped[country][genre]) grouped[country][genre] = [];
      grouped[country][genre].push(station);
    });
    return Object.keys(grouped).sort().reduce((obj, key) => {
        obj[key] = grouped[key];
        return obj;
    }, {});
  }, [favorites]);


  // --- EVENT HANDLERS ---

  const handleVibeClick = async (vibe) => {
    if (!isTrialActive) {
    navigate('/profile?upgrade=true');    
    return;
  }
    setLoadingVibeId(vibe.id);
    setStationList([]); 

    if (vibe.id === 'favorites' || vibe.id === 'history') {
        setActiveVibe(vibe);
        setLoadingVibeId(null);
        return;
    }

    const countryCode = selectedLocation ? selectedLocation.iso_3166_1 : undefined;
    const tags = vibe.tags.split(','); 
    const limit = 30; 
    let foundStations = [];

    if (countryCode) {
        foundStations = await searchStation(countryCode, tags[0]);
        if (foundStations.length < 5 && tags[1]) {
             const more = await searchStation(countryCode, tags[1]);
             foundStations = [...foundStations, ...more];
        }
    }

    if (foundStations.length === 0) {
        foundStations = await searchStation(undefined, tags[0]);
        if (foundStations.length < 5 && tags[1]) {
             const more = await searchStation(undefined, tags[1]);
             foundStations = [...foundStations, ...more];
        }
    }

    const playableStations = foundStations.filter(s => {
        const url = s.url_resolved || s.url;
        return url && !url.endsWith('.m3u') && !url.endsWith('.pls');
    }).slice(0, limit); 

    setStationList(playableStations);
    setActiveVibe(vibe);
    setLoadingVibeId(null);
  };

  const playSpecificStation = (station) => {
    if (!isTrialActive) {
navigate('/profile?upgrade=true');    
    return; 
  }

    addToHistory(station);
    onPlayStation({
        ...station,
        atmosphere: activeVibe ? activeVibe.name : 'Daily Pick',
        coverGradient: activeVibe ? activeVibe.color : 'from-slate-700 to-slate-900',
        locationName: selectedLocation ? selectedLocation.name : 'Global'
    });
  };

  const handleBack = () => {
      setActiveVibe(null);
      setStationList([]);
  };

  // --- RENDER ROW HELPER ---
  const renderStationRow = (station) => (
    <div 
        key={station.stationuuid}
        onClick={() => playSpecificStation(station)}
        className="flex items-center justify-between p-4 bg-slate-800/40 border border-white/5 hover:bg-slate-700/50 hover:border-brand/30 rounded-xl cursor-pointer group transition-all mb-3"
    >
        <div className="flex items-center gap-4 overflow-hidden flex-1">
            <div className="w-12 h-12 rounded-lg bg-slate-900 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5">
                {station.favicon ? (
                    <img src={station.favicon} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                ) : (
                    <FaMusic className="text-slate-600" />
                )}
            </div>
            <div className="min-w-0">
                <h4 className="font-bold text-white truncate group-hover:text-brand-light transition-colors">{station.name}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{station.bitrate}kbps</span>
                    {activeVibe && activeVibe.id === 'favorites' && <span className="text-brand hidden sm:inline">{station.atmosphere}</span>}
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={(e) => toggleFavorite(e, station)}
                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors z-20"
            >
                {isFavorite(station.stationuuid) 
                    ? <FaHeart className="text-brand" /> 
                    : <FaRegHeart className="text-slate-400 group-hover:text-white" />
                }
            </button>
            <button className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-200">
                <FaPlay className="ml-1" />
            </button>
        </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">      
    
    {/* 1. MOVE TRIAL BANNER HERE (Top of the page) */}
    {!isPro && (
      <div className={`mb-8 p-4 rounded-2xl border flex items-center justify-between transition-all ${
        trialDaysLeft > 0 
          ? 'bg-brand/10 border-brand/20 text-brand-light' 
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${trialDaysLeft > 0 ? 'bg-brand/20' : 'bg-red-500/20'}`}>
            <FaStar size={16} />
          </div>
          <div>
            <p className="font-bold text-sm">
              {trialDaysLeft > 0 
                ? `Free Trial: ${trialDaysLeft} days remaining` 
                : 'Trial Expired'}
            </p>
            <p className="text-xs opacity-70">
              {trialDaysLeft > 0 
                ? 'Enjoy full access to all premium stations.' 
                : 'Upgrade to Pro to resume the music.'}
            </p>
          </div>
        </div>
        <button 
  onClick={() => {
    // TRACKING PING
    if (window.gtag) {
      window.gtag('event', 'click_upgrade_banner', { 
        trial_status: trialDaysLeft > 0 ? 'active' : 'expired' 
      });
    }
    navigate('/profile?upgrade=true');
  }}
  className={`px-4 py-2 rounded-xl font-bold text-xs ...`}
>
  {trialDaysLeft > 0 ? 'Upgrade Now' : 'View Plans'}
</button>
      </div>
    )}
      
      {/* --- DAILY INSPO (LOCKED IF NOT PRO) --- */}
      {!activeVibe && (
         <div className="relative group mb-8">
             {/* If PRO, show normally. If FREE, show with blur and lock. */}
             <div className={!isPro ? "blur-sm pointer-events-none select-none grayscale opacity-50 transition-all duration-500" : ""}>
                 {/* LIVE STATUS PILL */}
{!activeVibe && showLivePill && (
    <div className="flex items-center gap-3 mb-6 px-2 animate-fadeIn">
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            LIVE
        </div>
        <p className="text-slate-400 text-xs md:text-sm">
            It's <span className="text-white font-bold">{timeContext.label}</span>. 
            Most venues are {timeContext.activity} <span className="text-brand font-bold">{timeContext.vibe}</span>.
        </p>
    </div>
)}
                 <DailyInspo onPlay={playSpecificStation} />
             </div>

             {/* The Lock Overlay */}
             {!isPro && (
                 <div className="absolute inset-0 flex items-center justify-center z-20">
                     <div className="text-center">
                         <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/10 shadow-xl">
                             <FaLock className="text-brand" />
                         </div>
                         <button 
  onClick={() => {
    // TRACKING PING
    if (window.gtag) {
      window.gtag('event', 'click_unlock_daily_special');
    }
    navigate('/profile?upgrade=true');
  }}
  className="bg-brand text-white font-bold py-2 px-6 rounded-full ..."
>
  Unlock Daily Special
</button>
                     </div>
                 </div>
             )}
         </div>
      )}

      {/* HEADER */}
      {!activeVibe && (
        <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Select Your Atmosphere</h2>
                    <p className="text-slate-400 text-sm">
                        Curating stations for: <span className="text-brand font-bold uppercase tracking-wider">{selectedLocation ? selectedLocation.name : 'The World'}</span>
                    </p>
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-200 ${isLocationMenuOpen ? 'bg-slate-800 border-brand text-white ring-2 ring-brand/20' : 'bg-slate-800/50 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <span className="text-xl">{getFlagEmoji(selectedLocation?.iso_3166_1)}</span>
                        <div className="text-left leading-tight mr-2">
                            <span className="block text-xs text-slate-500 uppercase font-bold">Location</span>
                            <span className="font-bold">{selectedLocation ? selectedLocation.name : 'Global / Everywhere'}</span>
                        </div>
                        <FaMapMarkerAlt className={isLocationMenuOpen ? 'text-brand' : 'text-slate-500'} />
                    </button>

                    {isLocationMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-full md:w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 overflow-hidden max-h-[400px] flex flex-col">
                            <div className="p-3 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
                                <input autoFocus type="text" placeholder="Search country..." className="w-full bg-slate-900 text-white text-sm px-3 py-2 rounded-lg border border-slate-700 focus:border-brand outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                            <div className="overflow-y-auto custom-scrollbar">
                                <button onClick={() => { setSelectedLocation(null); setIsLocationMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-700 border-b border-slate-700/50 flex items-center gap-3 text-slate-300 hover:text-white">
                                    <span className="text-lg">🌍</span> <span className="font-bold">Global (All Countries)</span>
                                </button>
                                {filteredCountries.map(c => (
                                    <button key={c.iso_3166_1} onClick={() => { setSelectedLocation(c); setIsLocationMenuOpen(false); setSearchQuery(''); }} className="w-full text-left px-4 py-3 hover:bg-slate-700 border-b border-slate-700/50 flex items-center gap-3 text-slate-300 hover:text-white">
                                        <span className="text-lg">{getFlagEmoji(c.iso_3166_1)}</span> <span className="truncate flex-1">{c.name}</span>
                                        <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">{c.stationcount}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* VIEW 1: THE GRID */}
      {!activeVibe && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
            {displayCards.map((station) => (
              <div 
                key={station.id}
                onClick={() => handleVibeClick(station)}
                className="group relative bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer overflow-hidden"
              >
                {selectedLocation && station.id !== 'favorites' && station.id !== 'history' && (
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity z-10">
                        <div className="w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center text-lg border border-white/10 shadow-lg">
                            {getFlagEmoji(selectedLocation.iso_3166_1)}
                        </div>
                    </div>
                )}
                
                <div className={`absolute inset-0 bg-gradient-to-br ${station.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10 flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${station.color} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                        <station.icon className="text-white text-xl" />
                    </div>

                    {station.id !== 'favorites' && station.id !== 'history' }
                </div>

                <div className="relative z-10 mt-6 mb-2">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-light transition-colors">{station.name}</h3>
                    <p className="text-xs font-medium text-brand uppercase tracking-wider mb-2">
                        {station.id === 'favorites' ? 'Your Collection' : 
                         station.id === 'history' ? 'Recent Listens' :
                         `${selectedLocation ? selectedLocation.name : 'Global'} • ${station.tags.split(',')[0]}`
                        }
                    </p>
                    <p className="text-slate-400 text-sm leading-relaxed pr-8">{station.description}</p>
                </div>
              </div>
            ))}
          </div>
      )}

      {/* VIEW 2: EXPANDED LIST */}
      {activeVibe && (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={handleBack} className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                    <FaArrowLeft />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeVibe.color} flex items-center justify-center text-sm shadow-lg`}>
                            <activeVibe.icon />
                        </span>
                        {activeVibe.name}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {activeVibe.id === 'favorites' ? `${favorites.length} stations in your library` :
                         activeVibe.id === 'history' ? 'Your last 6 stations' :
                         `Found ${stationList.length} stations matching your vibe`}
                    </p>
                </div>
            </div>

            <div className="pb-32">
                
                {/* 1. FAVORITES VIEW */}
                {activeVibe.id === 'favorites' && (
                     Object.keys(groupedFavorites).length === 0 ? (
                        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-white/5">
                            <p className="text-slate-400">You haven't saved any stations yet.</p>
                            <button onClick={handleBack} className="text-brand font-bold mt-2 hover:underline">Go Back</button>
                        </div>
                     ) : (
                        Object.entries(groupedFavorites).map(([country, genreMap]) => (
                            <div key={country} className="mb-8 animate-fadeIn">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">
                                    <FaGlobeAmericas className="text-brand" /> {country}
                                </h3>
                                {Object.entries(genreMap).map(([genre, stations]) => (
                                    <div key={genre} className="mb-6 ml-2 md:ml-6">
                                        <h4 className="flex items-center gap-2 text-sm font-bold text-brand uppercase tracking-wider mb-3">
                                            <FaTag className="text-xs" /> {genre}
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {stations.map(station => renderStationRow(station))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                     )
                )}

                {/* 2. HISTORY VIEW */}
                {activeVibe.id === 'history' && (
                    recentlyPlayed.length === 0 ? (
                        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-white/5">
                            <p className="text-slate-400">No listening history yet. Go play some music!</p>
                            <button onClick={handleBack} className="text-brand font-bold mt-2 hover:underline">Go Back</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {recentlyPlayed.map(station => renderStationRow(station))}
                        </div>
                    )
                )}

                {/* 3. REGULAR SEARCH VIEW */}
                {activeVibe.id !== 'favorites' && activeVibe.id !== 'history' && (
                    <div className="grid grid-cols-1 gap-3">
                        {stationList.length === 0 ? (
                            <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-white/5">
                                <p className="text-slate-400">No matching stations found in this region.</p>
                                <button onClick={handleBack} className="text-brand font-bold mt-2 hover:underline">Go Back</button>
                            </div>
                        ) : (
                            stationList.map(station => renderStationRow(station))
                        )}
                    </div>
                )}
            </div>
        </div>
      )}

     

    </div>
  );
};

export default StationGrid;