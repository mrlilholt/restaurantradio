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
  const searchStation = async (countryCode, tag) => {
    setLoading(true);
    try {
      // Build the query URL
      // If countryCode is provided, we filter by it. If not, we just use the tag.
      let url = `${BASE_URL}/stations/search?limit=20&hidebroken=true&order=votes&reverse=true&tag=${tag}`;
      
      if (countryCode) {
        url += `&countrycode=${countryCode}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      console.error("Station search failed:", err);
      setLoading(false);
      return [];
    }
  };

  return { countries, searchStation, loading, error };
};