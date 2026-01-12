import React, { useState } from 'react';
import { FaCheck, FaTimes, FaCrown, FaCreditCard, FaRegCalendarAlt, FaInfinity, FaStar, FaLeaf } from 'react-icons/fa';
import { useAuth } from '../Context/AuthContext';
import { handleManageBilling } from '../utils/stripePayment';

const PricingModal = ({ onClose, onUpgrade }) => {
  const { isPro } = useAuth();
  
  // Default to 'lifetime' because it's the one we want them to buy!
  const [selectedPlan, setSelectedPlan] = useState('lifetime'); 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-brand/30 rounded-2xl max-w-3xl w-full p-8 relative shadow-2xl overflow-hidden">
        
        {/* Glow Effect */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none ${isPro ? 'bg-blue-500/10' : 'bg-brand/10'}`} />

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white z-20">
          <FaTimes size={20} />
        </button>

        {/* HEADER */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isPro ? "Manage Subscription" : "Choose Your Vibe"}
          </h2>
          <p className="text-slate-400">
            {isPro ? "You are currently a Pro member." : "Unlock unlimited streaming, country search, and premium quality."}
          </p>
        </div>

        {/* CONTENT */}
        {isPro ? (
            // === VIEW FOR PRO USERS ===
            <div className="max-w-sm mx-auto text-center space-y-6 relative z-10">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                    <div className="text-5xl mb-4">👑</div>
                    <h3 className="text-xl font-bold text-white mb-2">Pro Access Active</h3>
                    <p className="text-slate-400 text-sm">Thank you for supporting independent radio.</p>
                </div>
                <button onClick={handleManageBilling} className="w-full py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all font-bold">
                     Manage Billing on Stripe
                </button>
            </div>
        ) : (
            // === VIEW FOR FREE USERS (3 OPTIONS) ===
            <div className="space-y-4 relative z-10">
                
                {/* TOP ROW: SUBSCRIPTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* OPTION 1: MONTHLY */}
                    <div 
                        onClick={() => setSelectedPlan('monthly')}
                        className={`relative border rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.02] ${selectedPlan === 'monthly' ? 'bg-slate-800 border-brand ring-1 ring-brand' : 'bg-slate-800/30 border-white/10 hover:bg-slate-800'}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Monthly</span>
                            {selectedPlan === 'monthly' && <FaCheck className="text-brand" />}
                        </div>
                        <div className="text-2xl font-bold text-white">$0.50 <span className="text-sm text-slate-500 font-normal">/mo</span></div>
                        <p className="text-xs text-slate-400 mt-2">Flexible. Cancel anytime.</p>
                    </div>

                    {/* OPTION 2: ANNUAL */}
                    <div 
                        onClick={() => setSelectedPlan('annual')}
                        className={`relative border rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.02] ${selectedPlan === 'annual' ? 'bg-slate-800 border-brand ring-1 ring-brand' : 'bg-slate-800/30 border-white/10 hover:bg-slate-800'}`}
                    >
                        <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                            SAVE 17%
                        </div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-green-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><FaLeaf /> Annual</span>
                            {selectedPlan === 'annual' && <FaCheck className="text-brand" />}
                        </div>
                        <div className="text-2xl font-bold text-white">$5.00 <span className="text-sm text-slate-500 font-normal">/yr</span></div>
                        <p className="text-xs text-slate-400 mt-2">Best for ongoing support.</p>
                    </div>
                </div>

                {/* BOTTOM ROW: LIFETIME */}
                <div 
                    onClick={() => setSelectedPlan('lifetime')}
                    className={`relative border rounded-xl p-6 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-4 ${selectedPlan === 'lifetime' ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-amber-500 ring-1 ring-amber-500 shadow-lg shadow-amber-500/10' : 'bg-slate-800/30 border-white/10 hover:bg-slate-800'}`}
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><FaInfinity /> Lifetime Deal</span>
                            <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">MOST POPULAR</span>
                        </div>
                        <div className="text-3xl font-bold text-white">$10.00 <span className="text-sm text-slate-500 font-normal">one-time</span></div>
                        <p className="text-xs text-slate-400 mt-1">Pay once. Own it forever. No recurring fees.</p>
                    </div>
                    {selectedPlan === 'lifetime' && <div className="bg-amber-500/20 p-2 rounded-full text-amber-500"><FaCheck size={20} /></div>}
                </div>

                {/* ACTION BUTTON */}
<button 
    onClick={() => {
        // 1. Send the event to Google Analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'begin_checkout', {
                currency: 'USD',
                value: selectedPlan === 'lifetime' ? 10.00 : selectedPlan === 'annual' ? 5.00 : 0.50,
                items: [{
                    item_id: `plan_${selectedPlan}`,
                    item_name: `${selectedPlan} subscription`,
                    item_category: 'Upgrade'
                }]
            });
        }
        
        // 2. Run your existing upgrade logic
        onUpgrade(selectedPlan);
    }}
    className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-xl transition-all mt-4 transform active:scale-[0.98]
        ${selectedPlan === 'lifetime' 
            ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-amber-500/25' 
            : 'bg-brand hover:bg-brand-dark hover:shadow-brand/25'}`}
>
    {selectedPlan === 'lifetime' ? 'Get Lifetime Access - $10' : 
     selectedPlan === 'annual' ? 'Start Annual Plan - $5/yr' : 
     'Start Monthly Plan - $0.50/mo'}
</button>

                <p className="text-center text-xs text-slate-500 pt-2">
                    Secured by Stripe. 100% Money-back guarantee.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PricingModal;