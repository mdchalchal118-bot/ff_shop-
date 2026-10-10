import React from 'react';
import { useApp } from '../context/AppContext';
import { Send } from 'lucide-react';

export const TelegramButton: React.FC = () => {
  const { publicSettings } = useApp();

  if (!publicSettings.telegramEnabled || !publicSettings.telegramUrl) {
    return null;
  }

  const handleClick = () => {
    window.open(publicSettings.telegramUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      <button
        onClick={handleClick}
        aria-label="Join Official Telegram"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 via-cyan-400 to-blue-600 text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer cyber-glow-cyan"
      >
        {/* Radar Ring Animation */}
        <span className="absolute -inset-1 rounded-full bg-cyan-400/30 animate-ping pointer-events-none" />
        <span className="absolute -inset-2 rounded-full border border-cyan-400/40 pointer-events-none" />
        
        {/* Telegram icon */}
        <Send className="w-6 h-6 -ml-0.5 mt-0.5 fill-current text-white transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />

        {/* Hover Tooltip */}
        <span className="absolute right-16 px-3 py-1.5 rounded-lg bg-[#0b101f] border border-cyan-500/40 text-cyan-200 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
          Join Telegram Channel
        </span>
      </button>
    </div>
  );
};
