import React, { useState } from 'react';
import { Order } from '../types';
import { CheckCircle2, MessageCircle, Copy, Check, ExternalLink, X, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface OrderSuccessModalProps {
  order: Order;
  whatsAppUrl: string;
  whatsAppMessage: string;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  whatsAppUrl,
  whatsAppMessage,
  onClose,
}) => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsAppMessage);
      setCopied(true);
      showToast('success', 'সম্পূর্ণ অর্ডার মেসেজ কপি করা হয়েছে!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showToast('error', 'মেসেজ কপি করতে সমস্যা হয়েছে');
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0d1424] border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl cyber-glow-cyan overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/50 mb-3 text-cyan-400 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-2xl font-bold text-white font-orbitron tracking-wide">
            অর্ডার সফলভাবে গ্রহণ করা হয়েছে!
          </h3>
          <p className="text-sm text-cyan-300 mt-1 font-rajdhani text-base">
            আপনার অর্ডারটি সিস্টেমে সংরক্ষিত হয়েছে।
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="bg-[#090d18] border border-cyan-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>ORDER REFERENCE:</span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">RECEIVED</span>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-300 tracking-wider">
            {order.orderRef}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Package:</span>
              <div className="font-semibold text-white truncate">{order.packageName}</div>
            </div>
            <div>
              <span className="text-slate-400">Price:</span>
              <div className="font-bold text-cyan-300">৳{order.price.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-slate-400">TrxID:</span>
              <div className="font-mono text-slate-200 truncate">{order.bkashTransactionId}</div>
            </div>
            <div>
              <span className="text-slate-400">
                {order.orderType === 'guild_glory' ? 'Guild ID:' : 'Player UID:'}
              </span>
              <div className="font-mono text-slate-200 truncate">{order.targetId}</div>
            </div>
          </div>
        </div>

        {/* WhatsApp Send Instruction */}
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3.5 mb-6 text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">গুরুত্বপূর্ণ নির্দেশনা:</span>{' '}
            অর্ডারটি দ্রুত ভেরিফাই করার জন্য নিচে <strong>"WhatsApp-এ মেসেজ পাঠান"</strong> বাটনে ক্লিক করে prefilled মেসেজটি আমাদের পাঠিয়ে দিন।
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleOpenWhatsApp}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-950/50 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>WhatsApp-এ মেসেজ পাঠান</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={handleCopyMessage}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300">মেসেজ কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>মেসেজ কপি করুন (WhatsApp না খুললে)</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-center text-xs text-slate-400 hover:text-white transition-colors"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
