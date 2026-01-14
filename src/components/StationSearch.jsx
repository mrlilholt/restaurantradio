import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaMapMarkerAlt, FaGlobeAmericas, FaTimes } from 'react-icons/fa';
import { useRadioBrowser, getFlagEmoji } from '../hooks/useRadioBrowser';

const StationSearch = ({ onSearch, initialLocation }) => {
  const [query, setQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(initialLocation || null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  
  // Get countries for the dropdown
  const { countries } = useRadioBrowser();
  const locationRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Send all data to parent: Text, Country Code, and City/State (locationQuery)
    onSearch({
      term: query,
      country: selectedCountry?.iso_3166_1,
      city: locationQuery
    });
  };

  const clearLocation = (e) => {
    e.stopPropagation();
    setSelectedCountry(null);
    setLocationQuery('');
    onSearch({ term: query, country: null, city: '' });
  };

  // Filter countries for the dropdown list
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(locationQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto mb-10 relative z-30">
      <form 
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row bg-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand/50 transition-all"
      >
        
        {/* 1. KEYWORD SEARCH (Left) */}
        <div className="flex-1 flex items-center px-4 py-4 border-b md:border-b-0 md:border-r border-white/5 relative">
          <FaSearch className="text-slate-400 text-lg flex-shrink-0" />
          <input 
            type="text"
            placeholder="Search stations, genres, or moods..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 ml-3 text-base font-medium outline-none"
          />
        </div>

        {/* 2. LOCATION SELECTOR (Right) */}
        <div className="flex-1 flex items-center px-4 py-2 relative" ref={locationRef}>
           
           {/* The Trigger Button / Input Area */}
           <div 
             className="flex items-center w-full cursor-pointer"
             onClick={() => setIsLocationOpen(true)}
           >
             <span className="text-xl flex-shrink-0 mr-3">
               {selectedCountry ? getFlagEmoji(selectedCountry.iso_3166_1) : '🌍'}
             </span>
             
             <div className="flex-1">
               <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                 {selectedCountry ? 'Location Set' : 'Location Filter'}
               </p>
               {selectedCountry ? (
                 <div className="flex items-center justify-between">
                    <span className="text-white font-bold truncate">{selectedCountry.name} {locationQuery ? `(${locationQuery})` : ''}</span>
                 </div>
               ) : (
                 <span className="text-slate-400">Everywhere / Global</span>
               )}
             </div>

             {selectedCountry ? (
               <button onClick={clearLocation} className="p-2 hover:text-red-400 text-slate-500 transition-colors">
                 <FaTimes />
               </button>
             ) : (
               <FaMapMarkerAlt className="text-slate-600" />
             )}
           </div>

           {/* The Dropdown Menu */}
           {isLocationOpen && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-[300px] flex flex-col overflow-hidden animate-fadeIn">
                {/* Search Box inside Dropdown for City/State */}
                <div className="p-3 border-b border-white/5 bg-slate-900/50">
                   <input 
                     autoFocus
                     type="text" 
                     placeholder={selectedCountry ? `City in ${selectedCountry.name}...` : "Search Country..."}
                     value={locationQuery}
                     onChange={(e) => setLocationQuery(e.target.value)}
                     className="w-full bg-slate-800 text-white text-sm px-3 py-2 rounded-lg border border-slate-600 focus:border-brand outline-none"
                   />
                   {selectedCountry && (
                     <p className="text-[10px] text-slate-400 mt-2 text-right">
                       Hit <span className="text-brand font-bold">Enter</span> to search this city
                     </p>
                   )}
                </div>

                <div className="overflow-y-auto custom-scrollbar">
                   {/* Option: Global */}
                   {!locationQuery && !selectedCountry && (
                     <button 
                       type="button"
                       onClick={() => { setSelectedCountry(null); setIsLocationOpen(false); }} 
                       className="w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-3 text-slate-300 hover:text-white"
                     >
                       <span className="text-lg">🌍</span> 
                       <span className="font-bold">Global / Everywhere</span>
                     </button>
                   )}

                   {/* Country List */}
                   {!selectedCountry && filteredCountries.map(c => (
                     <button 
                       key={c.iso_3166_1} 
                       type="button"
                       onClick={() => { 
                         setSelectedCountry(c); 
                         setLocationQuery(''); // Reset query to allow typing city
                         // Keep menu open so they can type city if they want
                       }} 
                       className="w-full text-left px-4 py-3 hover:bg-slate-700 border-b border-slate-700/50 flex items-center gap-3 text-slate-300 hover:text-white"
                     >
                       <span className="text-lg">{getFlagEmoji(c.iso_3166_1)}</span> 
                       <span className="truncate flex-1">{c.name}</span>
                       <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">{c.stationcount}</span>
                     </button>
                   ))}
                   
                   {/* If Country Selected: Show "Search for [City]" Button */}
                   {selectedCountry && (
                      <button 
                        type="submit" // Submits the main form
                        onClick={() => setIsLocationOpen(false)}
                        className="w-full text-left px-4 py-3 bg-brand/10 hover:bg-brand/20 text-brand-light flex items-center gap-2"
                      >
                         <FaSearch />
                         Search for "{locationQuery || 'All'}" in {selectedCountry.name}
                      </button>
                   )}
                </div>
             </div>
           )}
        </div>

        {/* 3. GO BUTTON */}
        <button 
          type="submit" 
          className="bg-brand hover:bg-brand-dark text-white font-bold px-8 py-4 md:py-0 transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2"
        >
          Find Stations
        </button>

      </form>
    </div>
  );
};

export default StationSearch;