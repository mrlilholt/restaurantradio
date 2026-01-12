import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-white/5 bg-slate-900/30 px-6 py-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex gap-6 text-xs text-slate-500">
          <Link to="/legal" className="hover:text-brand transition-colors">
            Licensing & Legal
          </Link>
          <p>© 2026 Restaurant Radio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;