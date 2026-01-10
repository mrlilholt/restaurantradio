import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { db } from '../utils/firebase'; // Ensure path is correct
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FaStore, FaGlobeAmericas, FaSave, FaCheck } from 'react-icons/fa';
import { useRadioBrowser } from '../hooks/useRadioBrowser'; // Re-use this to get country list!

const Profile = () => {
  const { currentUser } = useAuth();
  const { countries } = useRadioBrowser(); // Get countries list for dropdown
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    restaurantName: '',
    cuisineType: '',
    country: '',
    city: ''
  });

  // 1. Load existing data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            restaurantName: data.restaurantName || '',
            cuisineType: data.cuisineType || '',
            country: data.country || '',
            city: data.city || ''
          });
        }
      }
    };
    loadProfile();
  }, [currentUser]);

  // 2. Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const docRef = doc(db, 'users', currentUser.uid);
      await updateDoc(docRef, {
        restaurantName: formData.restaurantName,
        cuisineType: formData.cuisineType,
        country: formData.country,
        city: formData.city,
        // We can add "updatedAt" later if needed
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3s
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Restaurant Profile</h2>
        <p className="text-slate-400 mb-8">Customize your experience and get better station recommendations.</p>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Restaurant Name */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Restaurant Name</label>
            <div className="relative">
              <FaStore className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                required
                className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="e.g. The Golden Spoon"
                value={formData.restaurantName}
                onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
              />
            </div>
          </div>

          {/* Cuisine Type */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Cuisine / Theme</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-brand focus:outline-none"
              value={formData.cuisineType}
              onChange={(e) => setFormData({...formData, cuisineType: e.target.value})}
            >
              <option value="">Select a type...</option>
              <option value="Cafe">Coffee Shop / Cafe</option>
              <option value="Fine Dining">Fine Dining</option>
              <option value="Casual">Casual Dining</option>
              <option value="Bar">Bar / Lounge</option>
              <option value="Fast Food">Fast Casual</option>
              <option value="Bakery">Bakery</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Country Select */}
             <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Country</label>
                <div className="relative">
                  <FaGlobeAmericas className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select 
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-brand focus:outline-none appearance-none"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  >
                    <option value="">Select Location...</option>
                    {countries.map(c => (
                      <option key={c.iso_3166_1} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
             </div>

             {/* City (Optional) */}
             <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">City (Optional)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-brand focus:outline-none"
                  placeholder="e.g. New York"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
             </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-brand hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-brand/20 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <span className="animate-spin">⏳</span> : <FaSave />}
              Save Profile
            </button>
            
            {success && (
              <span className="text-green-400 flex items-center gap-2 animate-fadeIn font-medium">
                <FaCheck /> Saved Successfully
              </span>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default Profile;