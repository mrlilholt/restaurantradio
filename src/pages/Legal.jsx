import React from 'react';
import { FaScaleBalanced, FaMusic, FaShieldHalved, FaCircleInfo } from 'react-icons/fa6';

const Legal = () => {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Legal & Licensing</h1>
          <p className="text-slate-400 italic">Last Updated: January 2026</p>
        </div>

        <div className="space-y-12">
          {/* Section 1: Public Performance */}
          <section className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-4 text-brand-light">
              <FaMusic className="text-xl" />
              <h2 className="text-xl font-bold text-white">Public Performance Licensing</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                Restaurant Radio is a technical aggregator of publicly available radio streams. 
                Streaming music in a commercial environment (restaurants, cafes, retail, etc.) is 
                legally defined as a <strong>"Public Performance."</strong>
              </p>
              <div className="bg-brand/10 border-l-4 border-brand p-4 my-6">
                <p className="text-sm font-medium text-white">
                  <strong>CRITICAL:</strong> You are solely responsible for obtaining necessary 
                  licenses (e.g., ASCAP, BMI, SESAC, GMR in the US; PRS/PPL in the UK) to 
                  broadcast music in your business. Restaurant Radio does NOT provide these 
                  licenses as part of any subscription.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Technical Service */}
          <section className="px-4">
            <div className="flex items-center gap-3 mb-4 text-slate-400">
              <FaScaleBalanced />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Service Limitation</h2>
            </div>
            <p className="text-slate-400 text-sm">
              Our service provides the interface and connectivity to globally available streams. 
              We do not host or own the music content. Links to external streams are provided 
              "as-is" and we cannot guarantee the uptime or content accuracy of any third-party 
              broadcaster.
            </p>
          </section>

          {/* Section 3: Liability */}
          <section className="px-4">
             <div className="flex items-center gap-3 mb-4 text-slate-400">
              <FaShieldHalved />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Limitation of Liability</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Under no circumstances shall Resturant Radio be liable for any legal action, 
              fines, or fees incurred by the user for failing to maintain proper public 
              performance licensing. Use of this application constitutes agreement that you 
              hold the service providers harmless for any licensing disputes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Legal;