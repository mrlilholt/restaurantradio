import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/authContext'; // <--- NEW
import { db } from '../utils/firebase'; // <--- NEW
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore'; // <--- NEW
import { 
  FaCoffee, FaWineGlass, FaUtensils, FaHamburger, FaBreadSlice, FaBeer, 
  FaMusic, FaSearch, FaGlobeAmericas, FaTag, FaSpinner, FaArrowLeft, FaMapMarkerAlt, 
  FaHeart, FaRegHeart, FaStar, FaCocktail, FaLeaf, FaMoon, FaPlay // <--- Added missing icons
} from 'react-icons/fa';
import { useRadioBrowser, getFlagEmoji } from '../hooks/useRadioBrowser';
import DailyInspo from './DailyInspo';

// 1. Station Categories
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
  const { currentUser } = useAuth(); // <--- Get current user
  
  // --- STATE ---
  const [favorites, setFavorites] = useState([]); // <--- Local Favorites State
  const [selectedLocation, setSelectedLocation] = useState(null); 
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVibe, setActiveVibe] = useState(null); 
  const [stationList, setStationList] = useState([]); 
  const [loadingVibeId, setLoadingVibeId] = useState(null); 

  // --- NEW: FIRESTORE SYNC ---
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    
    // Listen for changes in real-time
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.favorites) {
          setFavorites(data.favorites);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // --- NEW: TOGGLE FAVORITE FUNCTION ---
  const toggleFavorite = async (e, station) => {
    e.stopPropagation(); // Stop card click
    
    if (!currentUser) {
        alert("Please log in to save favorites!");
        return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const isAlreadyFav = favorites.some(f => f.stationuuid === station.stationuuid);

    try {
      if (isAlreadyFav) {
        await updateDoc(userRef, {
          favorites: arrayRemove(station)
        });
      } else {
        await setDoc(userRef, {
          favorites: arrayUnion(station)
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  // Helper to check status
  const isFavorite = (id) => favorites.some(f => f.stationuuid === id);


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

  const displayCards = [favoritesCard, ...stationTypes];

  // --- HELPER: GROUP FAVORITES ---
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


  // --- HANDLERS ---
  const handleVibeClick = async (vibe) => {
    setLoadingVibeId(vibe.id);
    setStationList([]); 

    if (vibe.id === 'favorites') {
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
    onPlayStation({
        ...station,
        atmosphere: activeVibe.name,
        coverGradient: activeVibe.color,
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
                    {activeVibe.id === 'favorites' && <span className="text-brand hidden sm:inline">{station.atmosphere}</span>}
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
      
      {/* --- NEW: DAILY INSPO --- */}
      {!activeVibe && (
         <DailyInspo onPlay={onPlayStation} />
      )}

      {/* --- HEADER --- */}
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

      {/* --- VIEW 1: THE GRID --- */}
      {!activeVibe && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
            {displayCards.map((station) => (
              <div 
                key={station.id}
                onClick={() => handleVibeClick(station)}
                className="group relative bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer overflow-hidden"
              >
                {selectedLocation && station.id !== 'favorites' && (
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity z-10">
                        <div className="w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center text-lg border border-white/10 shadow-lg">
                            {getFlagEmoji(selectedLocation.iso_3166_1)}
                        </div>
                    </div>
                )}
                
                <div className={`absolute inset-0 bg-gradient-to-br ${station.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* --- CARD HEADER: ICON + HEART --- */}
                <div className="relative z-10 flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${station.color} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                        <station.icon className="text-white text-xl" />
                    </div>

                    {station.id !== 'favorites' && (
                        <button 
                            onClick={(e) => toggleFavorite(e, station)}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-90 backdrop-blur-md"
                        >
                            {isFavorite(station.stationuuid) ? (
                                <FaHeart className="text-brand text-sm" />
                            ) : (
                                <FaRegHeart className="text-white/70 text-sm" />
                            )}
                        </button>
                    )}
                </div>

                <div className="relative z-10 mt-6 mb-2">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-light transition-colors">{station.name}</h3>
                    <p className="text-xs font-medium text-brand uppercase tracking-wider mb-2">
                        {station.id === 'favorites' 
                           ? 'Your Collection' 
                           : `${selectedLocation ? selectedLocation.name : 'Global'} • ${station.tags.split(',')[0]}`
                        }
                    </p>
                    <p className="text-slate-400 text-sm leading-relaxed pr-8">{station.description}</p>
                </div>

                <div className="absolute bottom-4 right-4 z-20">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/5">
                        {loadingVibeId === station.id ? (
                            <FaSpinner className="text-brand animate-spin" />
                        ) : (
                            <FaMusic className="text-white ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
      )}

      {/* --- VIEW 2: THE EXPANDED LIST --- */}
      {activeVibe && (
        <div className="animate-fadeIn">
            {/* Expanded Header */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={handleBack}
                    className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
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
                        {activeVibe.id === 'favorites' 
                            ? `${favorites.length} stations in your library`
                            : `Found ${stationList.length} stations matching your vibe`
                        }
                    </p>
                </div>
            </div>

            <div className="pb-32">
                
                {/* --- RENDER LOGIC FOR FAVORITES vs REGULAR --- */}
                
                {/* 1. FAVORITES VIEW (Grouped) */}
                {activeVibe.id === 'favorites' ? (
                     Object.keys(groupedFavorites).length === 0 ? (
                        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-white/5">
                            <p className="text-slate-400">You haven't saved any stations yet.</p>
                            <button onClick={handleBack} className="text-brand font-bold mt-2 hover:underline">Go Back</button>
                        </div>
                     ) : (
                        // Map Countries
                        Object.entries(groupedFavorites).map(([country, genreMap]) => (
                            <div key={country} className="mb-8 animate-fadeIn">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">
                                    <FaGlobeAmericas className="text-brand" /> {country}
                                </h3>
                                
                                {/* Map Genres inside Country */}
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
                ) : (
                    // 2. REGULAR SEARCH VIEW (Flat List)
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