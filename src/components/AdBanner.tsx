import React from 'react';
import { useApp } from '../context/AppContext';
import { ExternalLink, Sparkles } from 'lucide-react';

export const AdBanner: React.FC = () => {
  const { banners } = useApp();
  const activeBanner = banners.find((b) => b.enabled);

  if (!activeBanner) return null;

  return (
    <div className="w-full my-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative group overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0d1326] shadow-2xl transition-all duration-300 hover:border-cyan-400">
        <a
          href={activeBanner.targetUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative overflow-hidden"
        >
          {/* Ad Image / Banner */}
          <div className="relative w-full h-32 sm:h-44 md:h-52 bg-slate-900 overflow-hidden">
            <img
              src={activeBanner.imageUrl}
              alt={activeBanner.title || 'Advertisement Banner'}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
              loading="lazy"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            
            {/* Banner Content */}
            <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-center max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider w-fit mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sponsored Partner</span>
              </div>
              <h4 className="text-lg sm:text-2xl font-bold text-white tracking-wide font-orbitron group-hover:text-cyan-300 transition-colors">
                {activeBanner.title || 'Official Community Promotion'}
              </h4>
              <div className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-cyan-400 font-medium font-rajdhani">
                <span>Click here to explore details</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};
