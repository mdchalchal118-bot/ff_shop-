import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, ChevronRight, ChevronLeft } from 'lucide-react';
import { DEFAULT_GUILD_THUMBNAIL, DEFAULT_DIAMOND_THUMBNAIL } from '../services/defaultData';

export const HomePage: React.FC = () => {
  const { products, banners, navigateTo } = useApp();

  // Active hero banners (up to 3)
  const activeBanners = (banners || []).filter((b) => b.enabled).slice(0, 3);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto sliding carousel effect - rotates smoothly every 4 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  };

  // Find products or use fallback order: 1st FF GUILD GLORY, 2nd WEEKLY/MONTHLY
  const guildProduct =
    products.find((p) => p.slug === 'guild-glory') ||
    products.find((p) => p.name.includes('GUILD')) ||
    products[0];

  const diamondProduct =
    products.find((p) => p.slug === 'weekly-monthly') ||
    products.find((p) => p.name.includes('WEEKLY')) ||
    products[1];

  const displayProducts = [
    {
      prod: guildProduct,
      defaultName: 'FF GUILD GLORY',
      slug: 'guild-glory',
      fallbackImg: DEFAULT_GUILD_THUMBNAIL,
      badge: 'TOP SELLING BOT',
      badgeColor: 'border-cyan-400 text-cyan-300 bg-cyan-950/80',
      description: 'Automated 24/7 Guild Glory Bot. Boost guild score and unlock maximum tournament rewards.',
    },
    {
      prod: diamondProduct,
      defaultName: 'WEEKLY/MONTHLY',
      slug: 'weekly-monthly',
      fallbackImg: DEFAULT_DIAMOND_THUMBNAIL,
      badge: 'INSTANT UID PASS',
      badgeColor: 'border-purple-400 text-purple-300 bg-purple-950/80',
      description: 'Official Free Fire Diamond Membership top-up passes delivered via Player UID.',
    },
  ];

  return (
    <div className="w-full">
      {/* 
        HERO SLIDING BANNER CAROUSEL:
        Replaces cluttered text hero with a sleek, automated banner slider.
        Sliding horizontally from side to side at intervals.
        Supports up to 3 banners.
      */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-2">
        {activeBanners.length > 0 && (
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[28/9] min-h-[145px] sm:min-h-[190px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#0a0f1d] shadow-2xl cyber-glow-cyan group">
            {/* Slides container */}
            <div
              className="flex w-full h-full transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {activeBanners.map((banner, index) => (
                <div
                  key={banner.id || index}
                  className="min-w-full h-full relative shrink-0 cursor-pointer"
                  onClick={() => {
                    if (banner.targetUrl) {
                      window.open(banner.targetUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || `Banner ${index + 1}`}
                    className="w-full h-full object-cover object-center filter brightness-95"
                    loading="lazy"
                  />
                  {/* Neon overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                  {/* Banner Title overlay */}
                  {banner.title && (
                    <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 right-12 z-10">
                      <span className="inline-block text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40 mb-1">
                        OFFICIAL PROMOTION
                      </span>
                      <h3 className="text-xs sm:text-lg md:text-xl font-extrabold text-white font-orbitron drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-1">
                        {banner.title}
                      </h3>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            {activeBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevSlide();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 border border-cyan-500/40 text-white flex items-center justify-center transition-all cursor-pointer opacity-70 group-hover:opacity-100 z-20"
                  aria-label="Previous Banner"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextSlide();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 border border-cyan-500/40 text-white flex items-center justify-center transition-all cursor-pointer opacity-70 group-hover:opacity-100 z-20"
                  aria-label="Next Banner"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-2.5 right-3 z-20 flex items-center gap-1.5">
                  {activeBanners.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        currentSlide === idx
                          ? 'w-6 bg-cyan-400 cyber-glow-cyan'
                          : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Product Category Cards Section (Kept completely intact and well-organized) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron flex items-center gap-2">
              <Trophy className="w-5 h-5 text-cyan-400" />
              <span>SELECT SERVICE CATEGORY</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-rajdhani text-base">
              প্যাকেজ দেখতে নিচের যে কোনো সার্ভিস কার্ডে ক্লিক করুন
            </p>
          </div>
        </div>

        {/* 
          Product category cards:
          Exactly two columns on mobile and two columns on desktop.
          FF GUILD GLORY first, WEEKLY/MONTHLY second.
        */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8">
          {displayProducts.map((item, index) => {
            const prodName = item.prod?.name || item.defaultName;
            const prodImg = item.prod?.thumbnail || item.fallbackImg;
            const targetPage = item.slug as 'guild-glory' | 'weekly-monthly';

            return (
              <div
                key={item.slug}
                onClick={() => navigateTo(targetPage)}
                className="group relative flex flex-col rounded-2xl bg-gradient-to-b from-[#0f172a]/95 to-[#080d19]/95 border border-cyan-500/30 hover:border-cyan-400 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/20 hover:shadow-2xl cursor-pointer active:scale-[0.98] select-none overflow-hidden"
              >
                {/* Top Corner Badge */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                  <span
                    className={`text-[9px] sm:text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${item.badgeColor} shadow-md`}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Product Card Image Container */}
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[#050811] overflow-hidden">
                  <img
                    src={prodImg}
                    alt={prodName}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
                </div>

                {/* Product Name & Details BELOW the image */}
                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between bg-[#0b1122]">
                  <div>
                    <h3 className="text-sm sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors font-orbitron tracking-wide mb-1">
                      {prodName}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-rajdhani line-clamp-2 leading-relaxed hidden sm:block">
                      {item.prod?.description || item.description}
                    </p>
                  </div>

                  <div className="mt-2.5 sm:mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-semibold">
                    <span className="text-cyan-400 font-rajdhani font-bold flex items-center gap-1 text-xs sm:text-sm">
                      <span>প্যাকেজ দেখুন</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
                      {index === 0 ? '3 PACKAGES' : '7 PACKAGES'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
