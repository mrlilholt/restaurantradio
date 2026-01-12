import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FaStore, FaGlobeAmericas, FaSave, FaCheck, FaCreditCard, FaCrown, FaBuilding } from 'react-icons/fa';
import { useRadioBrowser } from '../hooks/useRadioBrowser';
import { startCheckout } from '../utils/stripePayment';
import confetti from 'canvas-confetti';
// 1. IMPORT YOUR MODAL
import PricingModal from '../components/PricingModal'; 
import { useSearchParams } from 'react-router-dom'; // Add this line

const Profile = () => {
  const { currentUser, isPro } = useAuth();
  const { countries } = useRadioBrowser();
  const [searchParams, setSearchParams] = useSearchParams(); // Add this line
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // 2. STATE FOR MODAL VISIBILITY
  const [showPricing, setShowPricing] = useState(false);

  const [formData, setFormData] = useState({
    restaurantName: '',
    cuisineType: '',
    country: '',
    city: ''
  });
// Celebration Effect for Stripe Success
useEffect(() => {
  if (searchParams.get('success') === 'true') {
    // 1. Fire the confetti!
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#ffffff'] // Gold and White theme
    });

    // 2. Clean up the URL so confetti doesn't fire again on refresh
    searchParams.delete('success');
    setSearchParams(searchParams, { replace: true });
  }
}, [searchParams, setSearchParams]);

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
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    }
    setLoading(false);
  };

  // 3. HANDLE UPGRADE ACTION
  // Update this section in your Profile component
const handleUpgradeClick = async (planType) => {
  // Pass the planType ('lifetime', 'monthly', etc.) to your utility
  await startCheckout(planType);
  setShowPricing(false); 
};

  return (
    <div className="max-w-4xl mx-auto px-4 pt-28 pb-32 space-y-8 relative">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400">Manage your restaurant details and subscription.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Profile Form */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <FaBuilding size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Restaurant Profile</h2>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Restaurant Name</label>
                    <div className="relative">
                    <FaStore className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        required
                        className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-all"
                        placeholder="e.g. The Golden Spoon"
                        value={formData.restaurantName}
                        onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Cuisine / Theme</label>
                    <select 
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-brand focus:outline-none transition-all"
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
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Country</label>
                        <div className="relative">
                        <FaGlobeAmericas className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select 
                            className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-brand focus:outline-none appearance-none transition-all"
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

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">City (Optional)</label>
                        <input 
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-brand focus:outline-none transition-all"
                        placeholder="e.g. New York"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                    <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-brand hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-brand/20 flex items-center gap-2 disabled:opacity-50"
                    >
                    {loading ? <span className="animate-spin">⏳</span> : <FaSave />}
                    Save Changes
                    </button>
                    
                    {success && (
                    <span className="text-green-400 flex items-center gap-2 animate-fadeIn font-medium">
                        <FaCheck /> Saved
                    </span>
                    )}
                </div>

                </form>
            </div>
        </div>

        {/* RIGHT COLUMN: Subscription Card */}
        <div className="space-y-6">
            <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                {isPro && <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-[50px] -mr-10 -mt-10 pointer-events-none"></div>}

                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4 relative z-10">
                    <div className={`p-2 rounded-lg ${isPro ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                        <FaCrown size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Subscription</h2>
                </div>

                <div className="relative z-10">
                    <div className="mb-4">
                        <p className="text-sm text-slate-400 mb-1">Current Plan</p>
                        {isPro ? (
                            <div className="text-2xl font-bold text-white flex items-center gap-2">
                                Pro Plan <span className="bg-brand text-white text-xs px-2 py-1 rounded-full uppercase tracking-wide">Active</span>
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-white flex items-center gap-2">
                                Free Plan
                            </div>
                        )}
                    </div>

                   {isPro ? (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-300">
                                You have full access to all premium stations and advanced filtering.
                            </p>
                            
                            {/* CONNECTED: Opens the same modal, but shows "Manage" view */}
                            <button 
                                onClick={() => setShowPricing(true)}
                                className="w-full py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                            >
                                <FaCreditCard /> Manage Billing
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-300">
                                Upgrade to unlock all premium stations and curate the perfect vibe.
                            </p>
                            
                            {/* CONNECTED: Opens modal in "Upgrade" view */}
                            <button 
                                onClick={() => setShowPricing(true)}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 font-bold"
                            >
                                <FaCrown /> Upgrade to Pro
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 shadow-xl">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Account</h3>
                 <div className="space-y-1">
                    <p className="text-xs text-slate-500">Email Address</p>
                    <p className="text-white font-medium truncate">{currentUser?.email}</p>
                 </div>
                 <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-500">User ID</p>
                    <p className="text-slate-400 font-mono text-xs truncate">{currentUser?.uid}</p>
                 </div>
            </div>
        </div>

      </div>

      {/* 5. RENDER THE MODAL CONDITIONALLY */}
      {showPricing && (
        <PricingModal 
            onClose={() => setShowPricing(false)} 
            onUpgrade={handleUpgradeClick}
        />
      )}

    </div>
  );
};

export default Profile;