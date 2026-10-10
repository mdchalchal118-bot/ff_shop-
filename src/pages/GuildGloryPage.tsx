import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, Order } from '../types';
import { dbService } from '../services/dbService';
import { OrderSuccessModal } from '../components/OrderSuccessModal';
import {
  Copy,
  Check,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Bot,
  Info,
  CheckCircle2,
  Send,
  Loader2,
} from 'lucide-react';

export const GuildGloryPage: React.FC = () => {
  const {
    guildPackages,
    paymentSettings,
    guildRulesNotice,
    navigateTo,
    showToast,
  } = useApp();

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Form State
  const [bkashTrxId, setBkashTrxId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [guildId, setGuildId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Success Modal
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [whatsAppData, setWhatsAppData] = useState<{ url: string; msg: string } | null>(null);

  const handleCopyPaymentNumber = async () => {
    try {
      await navigator.clipboard.writeText(paymentSettings.bkashNumber || '01794327542');
      setCopiedNumber(true);
      showToast('success', 'bKash নম্বরটি কপি করা হয়েছে!');
      setTimeout(() => setCopiedNumber(false), 3000);
    } catch {
      showToast('error', 'নম্বর কপি করতে ব্যর্থ হয়েছে');
    }
  };

  const validateForm = () => {
    const errs: { [key: string]: string } = {};

    if (!selectedPackage) {
      errs.package = 'অনুগ্রহ করে একটি প্যাকেজ নির্বাচন করুন';
    }

    const cleanTrx = bkashTrxId.trim();
    if (!cleanTrx) {
      errs.trx = 'bKash ট্রানজেকশন আইডি (TrxID) আবশ্যক';
    } else if (cleanTrx.length < 6 || cleanTrx.length > 25) {
      errs.trx = 'সঠিক ট্রানজেকশন আইডি দিন (৬-২৫ অক্ষর)';
    }

    const cleanPhone = senderPhone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      errs.phone = 'যে নম্বর থেকে টাকা পাঠিয়েছেন তা আবশ্যক';
    } else if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      errs.phone = 'সঠিক ১১ ডিজিটের bKash নম্বর দিন (যেমন: 017XXXXXXXX)';
    }

    const cleanGuild = guildId.trim();
    if (!cleanGuild) {
      errs.guildId = 'ফ্রি ফায়ার Guild ID আবশ্যক';
    } else if (!/^\d{5,15}$/.test(cleanGuild)) {
      errs.guildId = 'সঠিক সংখ্যামূলক Guild ID দিন (সাধারণত ৭-১২ ডিজিট)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedPackage || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const orderRef = `GLORY-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      // Construct WhatsApp message strictly as requested
      const waTemplate =
        paymentSettings.guildGloryWaTemplate ||
        `FF SHOP — NEW GUILD GLORY ORDER

Package: [Selected Package Name]
Package Price: ৳[Selected Price]
Payment Method: bKash Send Money
Payment Number: [Configured bKash Number]
Transaction ID: [Customer Transaction ID]
Sender's bKash Number: [Customer Phone Number]
Guild ID: [Customer Guild ID]
Order Type: Guild Glory Bot

Message: আমি পেমেন্ট সম্পন্ন করেছি। অনুগ্রহ করে আমার Guild Glory Bot অর্ডারটি যাচাই করে সার্ভিসটি প্রদান করুন।`;

      const formattedMessage = waTemplate
        .replace(/\[Selected Package Name\]/g, selectedPackage.name)
        .replace(/\[Selected Price\]/g, selectedPackage.price.toFixed(2))
        .replace(/\[Configured bKash Number\]/g, paymentSettings.bkashNumber || '01794327542')
        .replace(/\[Customer Transaction ID\]/g, bkashTrxId.trim().toUpperCase())
        .replace(/\[Customer Phone Number\]/g, senderPhone.trim())
        .replace(/\[Customer Guild ID\]/g, guildId.trim());

      const cleanWaNumber = (paymentSettings.whatsAppNumber || '01903982821').replace(/\D/g, '');
      const fullWaNumber = cleanWaNumber.startsWith('88') ? cleanWaNumber : `88${cleanWaNumber}`;
      const encodedMsg = encodeURIComponent(formattedMessage);
      const waUrl = `https://wa.me/${fullWaNumber}?text=${encodedMsg}`;

      // 1. Save order to Firestore
      const newOrder = await dbService.createOrder({
        orderRef,
        orderType: 'guild_glory',
        productId: 'guild-glory',
        productName: 'FF GUILD GLORY',
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        price: selectedPackage.price,
        bkashTransactionId: bkashTrxId.trim().toUpperCase(),
        senderPhone: senderPhone.trim(),
        targetId: guildId.trim(),
      });

      setSubmittedOrder(newOrder);
      setWhatsAppData({ url: waUrl, msg: formattedMessage });

      // Automatically open WhatsApp in new tab
      try {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Popup blocked, customer can use modal button', e);
      }

      showToast('success', 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!', orderRef);

      // Reset form
      setBkashTrxId('');
      setSenderPhone('');
      setGuildId('');
    } catch (err: unknown) {
      console.error('Order creation error:', err);
      showToast('error', 'অর্ডার সাবমিট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button & Title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 font-semibold mb-3 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>হোমে ফিরে যান</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-orbitron tracking-wide">
                FF GUILD GLORY BOT
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-rajdhani text-base">
                প্যাকেজ নির্বাচন করুন ও bKash Send Money-এর মাধ্যমে অর্ডার নিশ্চিত করুন
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 
        PACKAGE SELECTION CARDS:
        "On mobile devices, display the package options in two columns."
        "water-glass-inspired 3D cards with translucent glass surfaces, lighting and reflection, neon borders and subtle glow"
      */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white font-orbitron flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>SELECT GUILD GLORY PACKAGE</span>
          </h2>
          <span className="text-xs text-cyan-300 font-rajdhani">
            {guildPackages.filter((p) => p.enabled).length} টি প্যাকেজ উপলভ্য
          </span>
        </div>

        {/* 2-columns on mobile, 3-columns on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
          {guildPackages
            .filter((p) => p.enabled)
            .map((pkg) => {
              const isSelected = selectedPackage?.id === pkg.id;
              const isStockOut = pkg.inStock === false;

              return (
                <div
                  key={pkg.id}
                  onClick={() => {
                    if (isStockOut) {
                      showToast('error', `"${pkg.name}" প্যাকেজটি বর্তমানে স্টক আউট রয়েছে! অনুগ্রহ করে অন্য প্যাকেজ নির্বাচন করুন।`);
                      return;
                    }
                    setSelectedPackage(pkg);
                  }}
                  className={`water-glass-card rounded-xl p-2.5 sm:p-3.5 transition-all duration-200 flex flex-col justify-between ${
                    isStockOut
                      ? 'opacity-65 border-rose-900/60 bg-slate-950/80 cursor-not-allowed'
                      : isSelected
                      ? 'selected scale-[1.02] cursor-pointer'
                      : 'hover:border-cyan-400/60 cursor-pointer'
                  }`}
                >
                  {/* Top indicator */}
                  <div className="flex items-center justify-between mb-1.5">
                    {isStockOut ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-rose-300 font-sans">
                        স্টক আউট
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-sans">
                        ইন স্টক
                      </span>
                    )}

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isStockOut
                          ? 'border-rose-700 bg-rose-950/40 text-rose-400'
                          : isSelected
                          ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                          : 'border-slate-600 bg-slate-900/60'
                      }`}
                    >
                      {isStockOut ? (
                        <span className="text-[9px] font-bold">✕</span>
                      ) : isSelected ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : null}
                    </div>
                  </div>

                  {/* Package Name (Clear legible sans font) */}
                  <div className="my-1">
                    <h3
                      className={`text-xs sm:text-sm font-bold tracking-tight leading-snug font-sans truncate ${
                        isStockOut ? 'text-slate-400 line-through' : 'text-slate-100'
                      }`}
                    >
                      {pkg.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-400 font-sans">মূল্য:</span>
                    <span
                      className={`text-sm sm:text-base font-extrabold font-sans tracking-tight ${
                        isStockOut ? 'text-slate-500' : 'text-cyan-300'
                      }`}
                    >
                      ৳{pkg.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 
        DYNAMIC BKASH PAYMENT SYSTEM & GUILD GLORY ORDER FORM:
        "When a customer selects any package from either product dashboard,
        automatically open a payment and order form underneath the selected package."
      */}
      {selectedPackage && (
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#090e1b] border-2 border-cyan-500/50 p-5 sm:p-8 shadow-2xl cyber-glow-cyan">
            {/* Header: Selected Package Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b border-cyan-500/20">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                  নির্বাচিত প্যাকেজ
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white font-orbitron">
                  {selectedPackage.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">পরিশোধযোগ্য মূল্য:</span>
                <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-orbitron">
                  ৳{selectedPackage.price.toFixed(2)}
                </div>
              </div>
            </div>

            {/* bKash Payment Instructions Card */}
            <div className="my-6 rounded-xl bg-[#090d18] border border-cyan-500/30 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded bg-pink-900/60 border border-pink-500/50 text-pink-300 font-bold text-xs uppercase">
                      {paymentSettings.paymentMethodLabel || 'bKash (Send Money Only)'}
                    </span>
                    <span className="text-xs text-slate-400 font-rajdhani">
                      শুধুমাত্র সেন্ড মানি করুন
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-rajdhani text-base">
                    {paymentSettings.paymentInstructions ||
                      'নির্বাচিত প্যাকেজের সম্পূর্ণ নির্ধারিত মূল্য শুধুমাত্র bKash Send Money-এর মাধ্যমে নিচের নম্বরে পাঠান। এক টাকা কম বা বেশি পাঠাবেন না। টাকা পাঠানোর আগে নম্বরটি ভালোভাবে যাচাই করুন। ভুল নম্বরে টাকা পাঠালে FF SHOP তার জন্য দায়ী থাকবে না।'}
                  </p>
                </div>

                {/* Copyable Payment Number Block */}
                <div className="shrink-0 bg-slate-900/90 border border-cyan-400/40 rounded-xl p-3 sm:p-4 text-center">
                  <div className="text-[11px] text-slate-400 font-medium mb-1">
                    bKash Send Money নম্বর:
                  </div>
                  <div className="text-xl sm:text-2xl font-mono font-black text-cyan-300 tracking-wider mb-2 select-all">
                    {paymentSettings.bkashNumber || '01794327542'}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPaymentNumber}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-cyan-300" />
                        <span>কপি সম্পন্ন হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{paymentSettings.copyButtonText || 'নম্বর কপি করুন'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Warning Notice */}
              {paymentSettings.paymentWarning && (
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] sm:text-xs text-amber-300/90 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{paymentSettings.paymentWarning}</span>
                </div>
              )}
            </div>

            {/* Order Form */}
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              <h4 className="text-sm sm:text-base font-bold text-white font-orbitron tracking-wide border-l-2 border-cyan-400 pl-2">
                GUILD GLORY ORDER DETAILS
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Free Fire Guild ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Free Fire Guild ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100234567"
                    value={guildId}
                    onChange={(e) => setGuildId(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-colors ${
                      errors.guildId ? 'border-rose-500' : 'border-slate-700/80 focus:border-cyan-400'
                    }`}
                  />
                  {errors.guildId && (
                    <p className="mt-1 text-xs text-rose-400">{errors.guildId}</p>
                  )}
                  <p className="mt-1 text-[11px] text-slate-500 font-rajdhani">
                    যে গিল্ডে Glory Bot প্রবেশ করাতে চান তার সঠিক ID
                  </p>
                </div>

                {/* 2. Sender's bKash Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Sender's bKash Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 017XXXXXXXX"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-colors ${
                      errors.phone ? 'border-rose-500' : 'border-slate-700/80 focus:border-cyan-400'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>
                  )}
                  <p className="mt-1 text-[11px] text-slate-500 font-rajdhani">
                    যে নম্বর থেকে সেন্ড মানি করেছেন
                  </p>
                </div>

                {/* 3. bKash Transaction ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    bKash Transaction ID (TrxID) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BL9X4K2P9Q"
                    value={bkashTrxId}
                    onChange={(e) => setBkashTrxId(e.target.value.toUpperCase())}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border font-mono text-sm text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-colors ${
                      errors.trx ? 'border-rose-500' : 'border-slate-700/80 focus:border-cyan-400'
                    }`}
                  />
                  {errors.trx && (
                    <p className="mt-1 text-xs text-rose-400">{errors.trx}</p>
                  )}
                  <p className="mt-1 text-[11px] text-slate-500 font-rajdhani">
                    বিকাশ এসএমএস-এ প্রাপ্ত TrxID লিখুন
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right transition-all duration-300 text-white font-extrabold text-base tracking-wider font-orbitron shadow-xl cyber-glow-cyan cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>অর্ডার প্রসেস হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>ORDER NOW (৳{selectedPackage.price.toFixed(2)})</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-400 mt-2 font-rajdhani">
                  * সাবমিট বাটনে ক্লিক করলে আপনার অর্ডারটি সংরক্ষিত হবে এবং WhatsApp-এ স্বয়ংক্রিয় মেসেজ ওপেন হবে।
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        GUILD GLORY RULES & CONDITIONS NOTICE:
        "Display the following notice underneath the package list:
        Rules & Conditions
        1. 1 Basic কিনলে 8টা Bot গিল্ডে ঢুকাতে পারবেন।
        2. সঠিক Guild ID এবং গিল্ডের Rank/Level Default রেখে অর্ডার করবেন।
        3. ৩০ মিনিটের মধ্যে Glory দেওয়া শুরু না করলে Refund এর সুযোগ থাকবে।
        4. Guild Bot কত Glory দিবে তার কোনো গ্যারান্টি নেই (Luck dependent)।
        The entire notice must be editable through the Admin Panel."
      */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0c1322] to-[#070b14] border border-cyan-500/25 p-5 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2.5 mb-4">
          <Info className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg sm:text-xl font-bold text-white font-orbitron tracking-wide">
            {guildRulesNotice.title || 'Rules & Conditions'}
          </h3>
        </div>

        {guildRulesNotice.items && guildRulesNotice.items.length > 0 ? (
          <ol className="space-y-3 font-rajdhani text-base sm:text-lg text-slate-300">
            {guildRulesNotice.items.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{rule}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-sm text-slate-300 font-rajdhani whitespace-pre-line leading-relaxed">
            {guildRulesNotice.content ||
              `1. 1 Basic কিনলে 8টা Bot গিল্ডে ঢুকাতে পারবেন।
2. সঠিক Guild ID এবং গিল্ডের Rank/Level Default রেখে অর্ডার করবেন।
3. ৩০ মিনিটের মধ্যে Glory দেওয়া শুরু না করলে Refund এর সুযোগ থাকবে।
4. Guild Bot কত Glory দিবে তার কোনো গ্যারান্টি নেই (Luck dependent)।`}
          </div>
        )}
      </div>

      {/* Order Success Modal */}
      {submittedOrder && whatsAppData && (
        <OrderSuccessModal
          order={submittedOrder}
          whatsAppUrl={whatsAppData.url}
          whatsAppMessage={whatsAppData.msg}
          onClose={() => {
            setSubmittedOrder(null);
            setWhatsAppData(null);
          }}
        />
      )}
    </div>
  );
};
