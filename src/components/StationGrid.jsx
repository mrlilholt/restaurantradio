import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../Context/AuthContext';
import { db } from '../utils/firebase'; 
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore'; 
import { 
  FaCoffee, FaWineGlass, FaUtensils, FaLeaf, FaMoon, FaCocktail,
  FaMusic, FaTag, FaSpinner, FaArrowLeft, FaMapMarkerAlt, 
  FaHeart, FaRegHeart, FaStar, FaPlay, FaHistory, FaSync, FaSearch,
  FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';
import { useRadioBrowser, getFlagEmoji } from '../hooks/useRadioBrowser';
import DailyInspo from './DailyInspo';
import { useNavigate } from 'react-router-dom';

// --- DATA CONSTANTS ---
const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return { label: "The Morning Rush", activity: "brewing coffee to", vibe: "Morning Cafe" };
    if (hour >= 11 && hour < 15) return { label: "The Lunch Crowd", activity: "serving lunch to", vibe: "Bistro Beats" };
    if (hour >= 15 && hour < 17) return { label: "The Afternoon Slump", activity: "powering through to", vibe: "Acoustic Chill" };
    if (hour >= 17 && hour < 22) return { label: "Dinner Service", activity: "setting the mood with", vibe: "Lounge & Wine" };
    return { label: "Late Night Vibes", activity: "winding down to", vibe: "Midnight Jazz" };
};

const stationTypes = [
  { id: 'cafe', name: 'Morning Cafe', tags: 'jazz,acoustic', icon: FaCoffee, color: 'from-[#F0B323]/80 to-orange-400/80', description: 'Soft vocals & gentle guitar.' }, // Pantone 143 C Yellow
  { id: 'dining', name: 'Fine Dining', tags: 'classical,piano', icon: FaUtensils, color: 'from-[#1B365D]/90 to-slate-900/90', description: 'Elegant background ambiance.' }, // Pantone 534 C Navy
  { id: 'lounge', name: 'Lounge & Bar', tags: 'house,chillout', icon: FaCocktail, color: 'from-cyan-400/80 to-sky-500/80', description: 'Upbeat but chill vibes.' },
  { id: 'bistro', name: 'Bistro', tags: 'folk,oldies', icon: FaWineGlass, color: 'from-[#F0B323]/60 to-[#1B365D]/80', description: 'Authentic local classics.' }, // Mixed
  { id: 'brunch', name: 'Garden Brunch', tags: 'indie,pop', icon: FaLeaf, color: 'from-sky-300/80 to-cyan-400/80', description: 'Breezy tunes for outdoors.' },
  { id: 'night', name: 'Late Night', tags: 'lofi,ambient', icon: FaMoon, color: 'from-blue-600/80 to-[#1B365D]/90', description: 'Relaxed beats for closing.' },
];

const StationGrid = ({ onPlayStation }) => { 
  const { countries, searchStation } = useRadioBrowser();
  const { currentUser, isPro, isTrialActive, trialDaysLeft } = useAuth();  
  const navigate = useNavigate();
  const timeContext = getTimeContext();
  
  // --- STATE ---
  const [favorites, setFavorites] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [stationList, setStationList] = useState([]); 
  const [activeSearch, setActiveSearch] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [showDailyInspo, setShowDailyInspo] = useState(true); // Default to true
  
  // Ref for Smooth Scrolling
  const scrollContainerRef = useRef(null);

  // --- FIRESTORE SYNC ---
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
        if (data.showDailyInspo !== undefined) setShowDailyInspo(data.showDailyInspo);
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  // --- ACTIONS ---
  const toggleFavorite = async (e, station) => {
    e.stopPropagation();
    if (!currentUser) return; 
    const userRef = doc(db, 'users', currentUser.uid);
    const isAlreadyFav = favorites.some(f => f.stationuuid === station.stationuuid);
    try {
      if (isAlreadyFav) {
        await updateDoc(userRef, { favorites: arrayRemove(station) });
      } else {
        await setDoc(userRef, { favorites: arrayUnion(station) }, { merge: true });
      }
    } catch (error) { console.error("Error updating favorites:", error); }
  };

  const addToHistory = async (station) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    try {
        const newHistory = [station, ...recentlyPlayed.filter(s => s.stationuuid !== station.stationuuid)].slice(0, 10);
        await setDoc(userRef, { recentlyPlayed: newHistory }, { merge: true });
    } catch (error) { console.error("Error saving history:", error); }
  };

  const handleSafePlay = (station, index) => {
    if (!isTrialActive) { navigate('/profile?upgrade=true'); return; }
    addToHistory(station);
    onPlayStation({
        ...station,
        sourceList: activeSearch ? stationList : [], 
        sourceIndex: index,
        atmosphere: activeSearch ? (activeSearch.name || activeSearch.term) : 'Daily Pick',
        coverGradient: activeSearch ? activeSearch.color : 'from-slate-700 to-slate-900',
    });
  };

  // --- SEARCH LOGIC ---
  const executeSearch = async (term, sortType = 'clickcount', isRefresh = false) => {
    if (!term) return;
    if (!isTrialActive) { navigate('/profile?upgrade=true'); return; }

    setIsLoading(true);
    setStationList([]);

    const matchedCountry = countries.find(c => c.name.toLowerCase() === term.toLowerCase());

    if (!isRefresh) {
        setActiveSearch({
            type: 'search',
            term: term,
            name: matchedCountry ? matchedCountry.name : `Results for "${term}"`,
            icon: matchedCountry ? FaMapMarkerAlt : FaMusic,
            isCountrySearch: !!matchedCountry,
            countryCode: matchedCountry?.iso_3166_1
        });
    }

    try {
        const params = new URLSearchParams();
        params.append('limit', '40');
        params.append('hidebroken', 'true');
        params.append('order', sortType); 
        params.append('reverse', 'true');
        params.append('nocache', Date.now()); 

        let data = [];
        if (matchedCountry) {
            params.append('countrycode', matchedCountry.iso_3166_1);
            const res = await fetch(`https://de1.api.radio-browser.info/json/stations/search?${params.toString()}`);
            data = await res.json();
        } else {
             const nameParams = new URLSearchParams(params); nameParams.append('name', term);
             const tagParams = new URLSearchParams(params); tagParams.append('tag', term);
             const [nameRes, tagRes] = await Promise.all([
                fetch(`https://de1.api.radio-browser.info/json/stations/search?${nameParams.toString()}`),
                fetch(`https://de1.api.radio-browser.info/json/stations/search?${tagParams.toString()}`)
             ]);
             const nameData = await nameRes.json();
             const tagData = await tagRes.json();
             const combined = [...nameData, ...tagData];
             const uniqueMap = new Map();
             combined.forEach(item => uniqueMap.set(item.stationuuid, item));
             data = Array.from(uniqueMap.values());
        }

        const playable = data.filter(s => {
            const url = s.url_resolved || s.url;
            return url && !url.endsWith('.m3u') && !url.endsWith('.pls');
        });
        setStationList(playable);
    } catch (error) { console.error("Search failed:", error); } 
    finally { setIsLoading(false); }
  };

  const handleSearchSubmit = (e) => { e.preventDefault(); executeSearch(searchInput); };
  const handleRefreshList = () => { if (activeSearch) executeSearch(activeSearch.term, 'random', true); };
  const clearSearch = () => { setActiveSearch(null); setStationList([]); setSearchInput(''); };

  // --- SCROLL LOGIC (SMOOTH CAROUSEL) ---
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollAmount = container.clientWidth * 0.75; // Scroll 75% of screen width
        
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  // We duplicate the list once to give a feeling of "more" content to scroll through
  // For true infinite loops, complex listeners are needed, but this works well for UX
  const carouselItems = [...stationTypes, ...stationTypes]; 

  const handleLibraryClick = (type) => {
    if (type === 'favorites') setActiveSearch({ type: 'favorites', name: 'My Favorites', icon: FaHeart, color: 'from-yellow-500 to-amber-600' });
    if (type === 'history') setActiveSearch({ type: 'history', name: 'Recently Played', icon: FaHistory, color: 'from-pink-500 to-rose-600' });
  };

  const handleMoodClick = (card) => {
      executeSearch(card.tags.split(',')[0]);
      setActiveSearch({ ...card, type: 'mood' });
  };

  const isFavorite = (id) => favorites.some(f => f.stationuuid === id);

  const renderStationRow = (station, index) => (
    <div key={station.stationuuid} onClick={() => handleSafePlay(station, index)} className="flex items-center justify-between p-4 bg-slate-800/40 border border-white/5 hover:bg-slate-700/50 hover:border-brand/30 rounded-xl cursor-pointer group transition-all mb-3">
        <div className="flex items-center gap-4 overflow-hidden flex-1">
            <div className="w-12 h-12 rounded-lg bg-slate-900 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5">
                {station.favicon ? <img src={station.favicon} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} /> : <FaMusic className="text-slate-600" />}
            </div>
            <div className="min-w-0">
                <h4 className="font-bold text-white truncate group-hover:text-brand-light transition-colors">{station.name}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                    {station.countrycode && <span className="text-lg">{getFlagEmoji(station.countrycode)}</span>}
                    <span>{station.bitrate || 128}kbps</span>
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={(e) => toggleFavorite(e, station)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors z-20">
                {isFavorite(station.stationuuid) ? <FaHeart className="text-brand" /> : <FaRegHeart className="text-slate-400 group-hover:text-white" />}
            </button>
            <button className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-200"><FaPlay className="ml-1" /></button>
        </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
      
      {/* 1. TRIAL BANNER */}
      {!isPro && (
        <div className={`mb-8 p-4 rounded-2xl border flex items-center justify-between transition-all ${trialDaysLeft > 0 ? 'bg-brand/10 border-brand/20 text-brand-light' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${trialDaysLeft > 0 ? 'bg-brand/20' : 'bg-red-500/20'}`}><FaStar size={16} /></div>
            <div>
              <p className="font-bold text-sm">{trialDaysLeft > 0 ? `Free Trial: ${trialDaysLeft} days remaining` : 'Trial Expired'}</p>
              <p className="text-xs opacity-70">{trialDaysLeft > 0 ? 'Enjoy full access to all premium stations.' : 'Upgrade to Pro to resume the music.'}</p>
            </div>
          </div>
          <button onClick={() => navigate('/profile?upgrade=true')} className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${trialDaysLeft > 0 ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-red-500 text-white hover:bg-red-600'}`}>{trialDaysLeft > 0 ? 'Upgrade Now' : 'View Plans'}</button>
        </div>
      )}

      {/* 2. DAILY INSPO */}
      {!activeSearch && showDailyInspo && (
         <div className="mb-10">
            <DailyInspo onPlay={(s) => handleSafePlay(s, 0)} />
         </div>
      )}

      {/* 3. SEARCH BAR */}
      <div className="mb-10 max-w-2xl mx-auto animate-fadeIn">
         <div className="text-center mb-5">
             <span className="text-brand font-bold tracking-widest uppercase text-xs md:text-sm opacity-90">| Set the Ambience |</span>
         </div>
         <form onSubmit={handleSearchSubmit} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-slate-500 group-focus-within:text-brand transition-colors text-sm" />
            </div>
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search city, country, or vibe..." className="w-full bg-slate-800 text-white pl-10 pr-24 py-3 rounded-full border border-white/10 hover:border-brand/50 focus:border-brand outline-none transition-all shadow-lg text-base placeholder:text-slate-500" />
            <button type="submit" className="absolute right-1 top-1 bottom-1 bg-brand hover:bg-brand-dark text-white px-5 rounded-full font-bold text-xs transition-all">Search</button>
         </form>
      </div>

      {/* 4. LOADING */}
      {isLoading && (
         <div className="text-center py-20"><FaSpinner className="animate-spin text-4xl text-brand mx-auto mb-4" /><p className="text-slate-400 animate-pulse">Scanning frequencies...</p></div>
      )}

      {/* 5. MAIN DASHBOARD (SPLIT LAYOUT) */}
      {!isLoading && !activeSearch && (
         <div className="animate-fadeIn space-y-12">
             
             {/* SECTION A: YOUR COLLECTION */}
             <div>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><FaHeart className="text-brand" /> Your Collection</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Favorites Card */}
                    <div onClick={() => handleLibraryClick('favorites')} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F0B323]/20 to-orange-500/10 border border-[#F0B323]/20 p-6 cursor-pointer transition-all hover:border-[#F0B323]/50">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity"><FaStar className="text-6xl text-[#F0B323]" /></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-full bg-[#F0B323] text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"><FaStar /></div>
                            <h3 className="text-2xl font-bold text-white mb-1">My Favorites</h3>
                            <p className="text-slate-400 text-sm">Access your saved stations.</p>
                        </div>
                    </div>

                    {/* History Card */}
                    <div onClick={() => handleLibraryClick('history')} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B365D]/40 to-slate-900/40 border border-[#1B365D]/30 p-6 cursor-pointer transition-all hover:border-[#1B365D]/60">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity"><FaHistory className="text-6xl text-sky-500" /></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-full bg-[#1B365D] border border-white/10 text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"><FaHistory /></div>
                            <h3 className="text-2xl font-bold text-white mb-1">Recently Played</h3>
                            <p className="text-slate-400 text-sm">Jump back into the groove.</p>
                        </div>
                    </div>
                </div>
             </div>

             {/* SECTION B: MOODS (Horizontal Scroll Carousel) */}
             <div className="relative group">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2"><FaMusic className="text-brand" /> Explore Vibes</h2>
                    
                    {/* Navigation Arrows (Top right on mobile, or hovering sides on desktop) */}
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => scroll('left')}
                            className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white hover:bg-brand transition-colors"
                         >
                             <FaChevronLeft size={12} />
                         </button>
                         <button 
                            onClick={() => scroll('right')}
                            className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white hover:bg-brand transition-colors"
                         >
                             <FaChevronRight size={12} />
                         </button>
                    </div>
                </div>
                
                {/* SCROLL CONTAINER 
                    - flex-nowrap: Forces single row
                    - overflow-x-auto: Enables scrolling
                    - scroll-smooth: Enables CSS smooth transitions
                    - snap-x: Enforces card alignment
                */}
                <div 
                    ref={scrollContainerRef}
                    className="flex flex-nowrap gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar for Firefox/IE
                >
                    {carouselItems.map((mood, idx) => (
                        <div 
                            key={`${mood.id}-${idx}`} 
                            onClick={() => handleMoodClick(mood)}
                            className="flex-none w-[80%] sm:w-[45%] md:w-[30%] lg:w-[22%] snap-start"
                        >
                            <div className="group/card relative h-36 rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 shadow-lg">
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-40 group-hover/card:opacity-60 transition-opacity duration-300`} />
                                
                                {/* Content */}
                                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                    <div className="absolute top-4 left-4 text-white/50 text-2xl group-hover/card:text-white group-hover/card:scale-110 transition-all">
                                        <mood.icon />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg leading-tight">{mood.name}</h4>
                                        <p className="text-xs text-white/70 line-clamp-1 mt-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                            {mood.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
         </div>
      )}

      {/* 6. SEARCH RESULTS */}
      {!isLoading && activeSearch && (
         <div className="animate-fadeIn pb-32">
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                 <div>
                     <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                         {activeSearch.icon && <div className={`p-2 rounded-lg bg-gradient-to-br ${activeSearch.color || 'from-brand to-purple-600'}`}><activeSearch.icon className="text-white text-sm" /></div>}
                         {activeSearch.name}
                     </h2>
                     <p className="text-slate-400 text-sm mt-1">
                       {stationList.length === 0 ? 'No stations found.' : `Found ${stationList.length} stations.`}
                     </p>
                 </div>
                 
                 <div className="flex items-center gap-2">
                     {activeSearch.type === 'search' && (
                         <button onClick={handleRefreshList} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-brand-light font-bold rounded-lg text-sm transition-colors border border-white/5"><FaSync /> Shuffle</button>
                     )}
                     <button onClick={clearSearch} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-white/5"><FaArrowLeft /> Back</button>
                 </div>
             </div>
             
             <div className="grid grid-cols-1 gap-3">
                 {(activeSearch.type === 'favorites' ? favorites : activeSearch.type === 'history' ? recentlyPlayed : stationList).length === 0 ? (
                     <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-white/5 border-dashed">
                         <FaMusic className="text-4xl text-slate-600 mx-auto mb-4" />
                         <p className="text-slate-400">No stations found.</p>
                         <button onClick={clearSearch} className="text-brand font-bold mt-4 hover:underline">Clear Search</button>
                     </div>
                 ) : (
                     (activeSearch.type === 'favorites' ? favorites : activeSearch.type === 'history' ? recentlyPlayed : stationList).map((station, index) => renderStationRow(station, index))
                 )}
             </div>
         </div>
      )}
    </div>
  );
};

export default StationGrid;