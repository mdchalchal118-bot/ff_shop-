import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentPage, navigateTo, showToast, publicSettings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const websiteName = (publicSettings?.websiteName || 'FF SHOP').trim();
  const nameParts = websiteName.split(' ');
  const firstWord = nameParts[0] || 'FF';
  const restWords = nameParts.slice(1).join(' ') || (nameParts.length === 1 ? '' : 'SHOP');
  const nameStyle = publicSettings?.nameStyle || 'gold';
  const hasCustomLogo = Boolean(publicSettings?.logoUrl && !logoError);

  // Reset logo error when logo URL changes
  useEffect(() => {
    setLogoError(false);
  }, [publicSettings?.logoUrl]);

  // Reliable 4-click / 4-tap detection for mobile & desktop (3000ms window)
  const clickCountRef = useRef(0);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clickCountRef.current += 1;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    // If 4 clicks reached -> Unlock admin panel!
    if (clickCountRef.current >= 4) {
      clickCountRef.current = 0;
      showToast('success', 'অ্যাডমিন প্যানেল এক্সেস আনলক হয়েছে!');
      navigateTo('admin');
      return;
    }

    // Helpful feedback on taps 2 and 3
    if (clickCountRef.current === 2) {
      showToast('info', 'অ্যাডমিন প্যানেলের জন্য আর ২ বার ট্যাপ করুন');
    } else if (clickCountRef.current === 3) {
      showToast('info', 'আর ১ বার ট্যাপ করুন...');
    }

    // If no more clicks after 2.5 seconds, reset
    resetTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        navigateTo('home');
      }
      clickCountRef.current = 0;
    }, 2500);
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'guild-glory', label: 'FF GUILD GLORY' },
    { id: 'weekly-monthly', label: 'WEEKLY/MONTHLY' },
  ];

  // Determine Title Color Styles based on settings
  const getFirstWordClass = () => {
    switch (nameStyle) {
      case 'cyan':
        return 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 drop-shadow-[0_2px_8px_rgba(6,182,212,0.5)]';
      case 'fire':
        return 'text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 drop-shadow-[0_2px_8px_rgba(249,115,22,0.5)]';
      case 'white':
        return 'text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]';
      case 'gold':
      default:
        return 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 drop-shadow-[0_2px_8px_rgba(234,179,8,0.5)]';
    }
  };

  const getRestWordsClass = () => {
    switch (nameStyle) {
      case 'cyan':
        return 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-200 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]';
      case 'fire':
        return 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]';
      case 'white':
        return 'text-cyan-300 drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)]';
      case 'gold':
      default:
        return 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-white drop-shadow-[0_2px_8px_rgba(254,240,138,0.5)]';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070a12]/95 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* 
            Brand Title & Configurable Logo:
            - Left: Admin-managed Logo (supports any size/aspect ratio, perfectly scaled, NO fake pattern when empty)
            - Center/Right: Bold, ultra-clear gaming typography (no blurry shadows, no VIP badge)
            - 4 Clicks on brand unlocks Admin Panel
          */}
          <div
            onClick={handleBrandClick}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none py-1"
            title="ট্যাপ করে হোমে যান (৪ বার ট্যাপে অ্যাডমিন প্যানেল)"
          >
            {/* Show Logo ONLY if uploaded by Admin (No weird fake shield pattern!) */}
            {hasCustomLogo && (
              <div className="relative flex items-center justify-center max-h-11 sm:max-h-13 max-w-[120px] sm:max-w-[150px] transition-transform duration-300 group-hover:scale-105 shrink-0">
                <img
                  src={publicSettings?.logoUrl}
                  alt={websiteName}
                  className="max-h-10 sm:max-h-12 w-auto object-contain filter drop-shadow select-none"
                  onError={() => setLogoError(true)}
                />
              </div>
            )}

            {/* Clear, Beautiful, Bold Gaming Typography (NO VIP badge) */}
            <div className="flex items-center select-none font-orbitron tracking-wider text-xl sm:text-2xl md:text-3xl font-black">
              <span className={getFirstWordClass()}>
                {firstWord}
              </span>
              {restWords && (
                <span className={`ml-2 ${getRestWordsClass()}`}>
                  {restWords}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Navigation (No admin button visible) */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => navigateTo(link.id as any)}
                  className={`relative px-4 py-2 rounded-lg font-rajdhani font-semibold text-base tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 cyber-glow-cyan'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle (No admin button shown publicly) */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (No admin button visible) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0f1d] border-b border-cyan-500/20 px-4 pt-2 pb-5 space-y-2 animate-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                navigateTo(link.id as any);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-rajdhani font-semibold text-lg tracking-wide transition-all ${
                currentPage === link.id
                  ? 'text-cyan-300 bg-cyan-950/70 border border-cyan-500/40'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
