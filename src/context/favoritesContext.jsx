import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase'; // Ensure this points to your firebase config
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);

  // 1. Listen to Real-Time Favorites from Firestore
  useEffect(() => {
    if (!currentUser) {
        setFavorites([]);
        return;
    }

    const userRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFavorites(data.favorites || []);
      } else {
        // If user doc doesn't exist yet, create it
        setDoc(userRef, { favorites: [] }, { merge: true });
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 2. Toggle Favorite Function
  const toggleFavorite = async (station) => {
    if (!currentUser) return;
    
    const userRef = doc(db, 'users', currentUser.uid);
    // Check if it's already a favorite by comparing IDs (stationuuid)
    const isFav = favorites.some(f => f.stationuuid === station.stationuuid);

    try {
      if (isFav) {
        // Remove: We need to pass the EXACT object to arrayRemove, 
        // so we find the one in our state that matches the ID
        const stationToRemove = favorites.find(f => f.stationuuid === station.stationuuid);
        await updateDoc(userRef, {
          favorites: arrayRemove(stationToRemove)
        });
      } else {
        // Add: Save the essential data
        // We sanitize the object to avoid saving unnecessary UI state
        const stationToSave = {
            stationuuid: station.stationuuid,
            name: station.name,
            url_resolved: station.url_resolved || station.url,
            favicon: station.favicon || '',
            tags: station.tags || '',
            country: station.country || '',
            bitrate: station.bitrate || 0,
            // Save atmosphere color for UI consistency when playing from Favs
            color: station.color || 'from-gray-700 to-gray-900',
            atmosphere: station.atmosphere || 'Favorites'
        };
        await updateDoc(userRef, {
          favorites: arrayUnion(stationToSave)
        });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const isFavorite = (stationId) => {
    return favorites.some(f => f.stationuuid === stationId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};