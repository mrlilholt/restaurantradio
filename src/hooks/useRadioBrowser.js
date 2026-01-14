import { useState, useEffect } from 'react';

// We hardcode a reliable server to avoid the "502 Bad Gateway" on the discovery service.
// If de1 goes down, we can swap to 'at1' (Austria) or 'nl1' (Netherlands).
const BASE_URL = 'https://de1.api.radio-browser.info/json';

export const getFlagEmoji = (countryCode) => {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const useRadioBrowser = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // We fetch directly from the German server
        const response = await fetch(`${BASE_URL}/countries`);
        const data = await response.json();
        
        const sorted = data
          .filter(c => c.stationcount > 10) // Note: API returns 'stationcount' lowercase
          .sort((a, b) => a.name.localeCompare(b.name));
          
        setCountries(sorted);
      } catch (err) {
        console.error("Country fetch failed:", err);
        setError(err);
      }
    };
    fetchCountries();
  }, []);

  // 2. Search Stations
  const searchStation = async (countryCode, tag, city = "") => {
  try {
    const api = new RadioBrowserApi(fetch.bind(window), 'My App Name');
    
    const stations = await api.searchStations({
      countryCode: countryCode, // The 2-letter code (e.g., 'US', 'FR')
      tag: tag,                 // e.g., 'jazz'
      state: city,              // 'state' matches cities/regions loosely in RadioBrowser
      limit: 30,
      hidebroken: true,
      order: 'votes',
      reverse: true
    });
    
    return stations;
  } catch (error) {
    console.error(error);
    return [];
  }
  };

  return { countries, searchStation, loading, error };
};