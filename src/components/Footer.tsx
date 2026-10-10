import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const { publicSettings, paymentSettings } = useApp();
  const hasCustomLogo = Boolean(publicSettings?.logoUrl);
  const websiteName = (publicSettings?.websiteName || 'FF SHOP').trim();

  return (
    <footer className="w-full bg-[#05070c] border-t border-cyan-500/15 text-slate-400 mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            {hasCustomLogo && (
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={publicSettings?.logoUrl}
                  alt={websiteName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
            <div className="flex items-center select-none font-orbitron font-black text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {websiteName}
            </div>
          </div>

          {/* Quick Support Links */}
          <div className="flex items-center gap-4 text-xs font-rajdhani text-sm">
            {paymentSettings.whatsAppNumber && (
              <a
                href={`https://wa.me/88${paymentSettings.whatsAppNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: {paymentSettings.whatsAppNumber}</span>
              </a>
            )}

            {publicSettings.telegramEnabled && publicSettings.telegramUrl && (
              <a
                href={publicSettings.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </a>
            )}
          </div>
        </div>

        {/* Minimal Copyright */}
        <div className="mt-6 pt-4 border-t border-slate-900 text-center text-xs text-slate-500 font-sans">
          &copy; {new Date().getFullYear()} {websiteName}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};
