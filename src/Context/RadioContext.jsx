import React, { createContext, useContext, useState, useEffect } from 'react';

const RadioContext = createContext();

// This hook allows any component to get the favorites data
export const useFavorites = () => {
  return useContext(RadioContext);
};

export const RadioProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // 1. Load favorites from LocalStorage on app start
  useEffect(() => {
    const saved = localStorage.getItem('restaurant_radio_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // 2. Save favorites to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('restaurant_radio_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (station) => {
    if (isFavorite(station.stationuuid)) {
      setFavorites(prev => prev.filter(f => f.stationuuid !== station.stationuuid));
    } else {
      setFavorites(prev => [...prev, station]);
    }
  };

  const isFavorite = (stationId) => {
    return favorites.some(f => f.stationuuid === stationId);
  };

  const value = {
    favorites,
    toggleFavorite,
    isFavorite
  };

  return (
    <RadioContext.Provider value={value}>
      {children}
    </RadioContext.Provider>
  );
};