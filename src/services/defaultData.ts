import { Product, Package, PublicSettings, PaymentSettings, Notice, Banner } from '../types';

export const DEFAULT_GUILD_THUMBNAIL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a101f"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#060913"/>
    </linearGradient>
    <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f2fe"/>
      <stop offset="100%" stop-color="#4facfe"/>
    </linearGradient>
    <linearGradient id="purple-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7928ca"/>
      <stop offset="100%" stop-color="#ff0080"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="600" height="360" fill="url(#bg)"/>
  <!-- Tech Grid Lines -->
  <g stroke="rgba(6,182,212,0.12)" stroke-width="1">
    <line x1="0" y1="90" x2="600" y2="90"/>
    <line x1="0" y1="180" x2="600" y2="180"/>
    <line x1="0" y1="270" x2="600" y2="270"/>
    <line x1="150" y1="0" x2="150" y2="360"/>
    <line x1="300" y1="0" x2="300" y2="360"/>
    <line x1="450" y1="0" x2="450" y2="360"/>
  </g>
  <!-- Cyber Shield / Crest -->
  <g transform="translate(300, 160)" filter="url(#glow)">
    <polygon points="0,-95 85,-40 70,70 0,110 -70,70 -85,-40" fill="rgba(8,145,178,0.2)" stroke="url(#cyan-glow)" stroke-width="4"/>
    <polygon points="0,-75 65,-30 55,55 0,85 -55,55 -65,-30" fill="rgba(15,23,42,0.85)" stroke="rgba(56,189,248,0.6)" stroke-width="2"/>
    <!-- Wings / Tech Blades -->
    <path d="M-85,-40 L-145,-15 L-110,35 L-70,70" fill="none" stroke="url(#cyan-glow)" stroke-width="3" stroke-linecap="round"/>
    <path d="M85,-40 L145,-15 L110,35 L70,70" fill="none" stroke="url(#cyan-glow)" stroke-width="3" stroke-linecap="round"/>
    <!-- Cyber Robot / Skull Center Emblem -->
    <circle cx="0" cy="-5" r="28" fill="#082f49" stroke="#00f2fe" stroke-width="3"/>
    <polygon points="-12,-10 -4,-10 -8,-2" fill="#00f2fe"/>
    <polygon points="12,-10 4,-10 8,-2" fill="#00f2fe"/>
    <path d="M-10,10 Q0,18 10,10" stroke="#38bdf8" stroke-width="3" fill="none"/>
    <polygon points="0,-45 12,-25 -12,-25" fill="url(#purple-glow)"/>
  </g>
  <!-- Cyber Badge Chips -->
  <rect x="235" y="290" width="130" height="28" rx="14" fill="rgba(6,182,212,0.15)" stroke="#00f2fe" stroke-width="1.5"/>
  <text x="300" y="309" fill="#38bdf8" font-size="12" font-family="'Orbitron', sans-serif" font-weight="bold" text-anchor="middle" letter-spacing="2">AUTOMATED BOT</text>
</svg>
`)}`;

export const DEFAULT_DIAMOND_THUMBNAIL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a101f"/>
      <stop offset="50%" stop-color="#140f28"/>
      <stop offset="100%" stop-color="#060913"/>
    </linearGradient>
    <linearGradient id="diamond-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
    <filter id="glow2" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="9" result="blur2" />
      <feComposite in="SourceGraphic" in2="blur2" operator="over" />
    </filter>
  </defs>
  <rect width="600" height="360" fill="url(#bg2)"/>
  <!-- Decorative Circuits -->
  <g stroke="rgba(168,85,247,0.15)" stroke-width="1">
    <line x1="0" y1="120" x2="600" y2="120"/>
    <line x1="0" y1="240" x2="600" y2="240"/>
    <circle cx="100" cy="80" r="40" fill="none"/>
    <circle cx="500" cy="280" r="40" fill="none"/>
  </g>
  <!-- 3D Glowing Diamond Crystal -->
  <g transform="translate(300, 160)" filter="url(#glow2)">
    <!-- Top Crown Facets -->
    <polygon points="0,-90 -65,-40 0,-30" fill="#bae6fd" opacity="0.95"/>
    <polygon points="0,-90 65,-40 0,-30" fill="#7dd3fc" opacity="0.9"/>
    <polygon points="-65,-40 -100,-40 -50,-10" fill="#38bdf8" opacity="0.8"/>
    <polygon points="65,-40 100,-40 50,-10" fill="#0284c7" opacity="0.8"/>
    <polygon points="-65,-40 0,-30 -50,-10" fill="#0ea5e9" opacity="0.85"/>
    <polygon points="65,-40 0,-30 50,-10" fill="#0284c7" opacity="0.85"/>
    <polygon points="-50,-10 0,-30 50,-10" fill="#e0f2fe" opacity="0.95"/>
    <!-- Pavilion / Bottom Facets -->
    <polygon points="0,95 -100,-40 -50,-10" fill="#2563eb" opacity="0.75"/>
    <polygon points="0,95 100,-40 50,-10" fill="#1d4ed8" opacity="0.75"/>
    <polygon points="0,95 -50,-10 0,-10" fill="#3b82f6" opacity="0.9"/>
    <polygon points="0,95 50,-10 0,-10" fill="#60a5fa" opacity="0.85"/>
  </g>
  <!-- Card VIP Badge -->
  <rect x="220" y="290" width="160" height="28" rx="14" fill="rgba(168,85,247,0.2)" stroke="#c084fc" stroke-width="1.5"/>
  <text x="300" y="309" fill="#e9d5ff" font-size="12" font-family="'Orbitron', sans-serif" font-weight="bold" text-anchor="middle" letter-spacing="2">WEEKLY / MONTHLY</text>
</svg>
`)}`;

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'guild-glory',
    name: 'FF GUILD GLORY',
    slug: 'guild-glory',
    description: 'High-speed automated Guild Glory bot system to boost tournament scores and glory rewards.',
    thumbnail: DEFAULT_GUILD_THUMBNAIL,
    displayOrder: 1,
    enabled: true,
  },
  {
    id: 'weekly-monthly',
    name: 'WEEKLY/MONTHLY',
    slug: 'weekly-monthly',
    description: 'Official Diamond Membership passes delivered directly to your Free Fire Player UID.',
    thumbnail: DEFAULT_DIAMOND_THUMBNAIL,
    displayOrder: 2,
    enabled: true,
  },
];

export const DEFAULT_GUILD_PACKAGES: Package[] = [
  {
    id: 'pkg-gg-1',
    productId: 'guild-glory',
    name: '1 BASIC (4 BOT)',
    price: 130,
    description: '4 Bots automated guild invite & glory push',
    displayOrder: 1,
    enabled: true,
    inStock: true,
  },
  {
    id: 'pkg-gg-2',
    productId: 'guild-glory',
    name: '2 BASIC (8 BOT)',
    price: 250,
    description: '8 Bots high-capacity automated glory push',
    displayOrder: 2,
    enabled: true,
    inStock: true,
  },
  {
    id: 'pkg-gg-3',
    productId: 'guild-glory',
    name: '5 BASIC (20 BOT)',
    price: 600,
    description: '20 Bots turbo power for maximum guild tournament rank',
    displayOrder: 3,
    enabled: true,
    inStock: true,
  },
];

export const DEFAULT_DIAMOND_PACKAGES: Package[] = [
  {
    id: 'pkg-dm-1',
    productId: 'weekly-monthly',
    name: 'WEEKLY',
    price: 158,
    description: '1x Weekly Diamond Membership Pass',
    displayOrder: 1,
    enabled: true,
    inStock: true,
  },
  {
    id: 'pkg-dm-2',
    productId: 'weekly-monthly',
    name: '2X WEEKLY',
    price: 316,
    description: '2x Weekly Diamond Membership Passes',
    displayOrder: 2,
    enabled: true,
    inStock: true,
  },
  {
    id: 'pkg-dm-3',
    productId: 'weekly-monthly',
    name: '3X WEEKLY',
    price: 474,
    description: '3x Weekly Diamond Membership Passes',
    displayOrder: 3,
    enabled: true,
    inStock: true,
  },
  {
    id: 'pkg-dm-4',
    productId: 'weekly-monthly',
    name: 'MONTHLY',
    price: 790,
    description: '1x Monthly Diamond Membership Pass',
    displayOrder: 4,
    enabled: true,
    inStock: true,
  },
  {
    id: 'pkg-dm-5',
    productId: 'weekly-monthly',
    name: '2X MONTHLY',
    price: 1580,
    description: '2x Monthly Diamond Membership Passes',
    displayOrder: 5,
    enabled: true,
    inStock: true,
  },
  {
    id: 'pkg-dm-6',
    productId: 'weekly-monthly',
    name: '1X WEEKLY+1X MONTHLY',
    price: 948,
    description: 'Mega Combo Pass (1 Weekly + 1 Monthly)',
    displayOrder: 6,
    enabled: true,
    inStock: true,
  },
  {
    id: 'pkg-dm-7',
    productId: 'weekly-monthly',
    name: '3X WEEKLY+1X MONTHLY',
    price: 1265,
    description: 'Ultimate Power Bundle (3 Weekly + 1 Monthly)',
    displayOrder: 7,
    enabled: true,
    inStock: true,
  },
];

export const DEFAULT_LOGO_URL = '';

export const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  websiteName: 'FF SHOP',
  tagline: 'Premium Free Fire Guild Glory & Diamond Top-Up Portal',
  logoUrl: '',
  nameStyle: 'gold',
  telegramUrl: 'https://t.me/freefire_bd_glory',
  telegramEnabled: true,
  footerNotice: 'FF SHOP is an independent gaming service platform. Free Fire is a trademark of Garena International.',
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  bkashNumber: '01794327542',
  paymentInstructions:
    'নির্বাচিত প্যাকেজের সম্পূর্ণ নির্ধারিত মূল্য শুধুমাত্র bKash Send Money-এর মাধ্যমে নিচের নম্বরে পাঠান। এক টাকা কম বা বেশি পাঠাবেন না। টাকা পাঠানোর আগে নম্বরটি ভালোভাবে যাচাই করুন। ভুল নম্বরে টাকা পাঠালে FF SHOP তার জন্য দায়ী থাকবে না।',
  paymentWarning:
    'সতর্কতা: শুধুমাত্র bKash Send Money প্রযোজ্য। Cash Out বা Mobile Recharge করবেন না। ট্রানজেকশন আইডি (TrxID) সঠিকভাবে প্রদান করুন।',
  paymentMethodLabel: 'bKash (Send Money Only)',
  copyButtonText: 'কপি করুন',
  whatsAppNumber: '01903982821',
  guildGloryWaTemplate: `FF SHOP — NEW GUILD GLORY ORDER

Package: [Selected Package Name]
Package Price: ৳[Selected Price]
Payment Method: bKash Send Money
Payment Number: [Configured bKash Number]
Transaction ID: [Customer Transaction ID]
Sender's bKash Number: [Customer Phone Number]
Guild ID: [Customer Guild ID]
Order Type: Guild Glory Bot

Message: আমি পেমেন্ট সম্পন্ন করেছি। অনুগ্রহ করে আমার Guild Glory Bot অর্ডারটি যাচাই করে সার্ভিসটি প্রদান করুন।`,
  diamondTopUpWaTemplate: `FF SHOP — NEW DIAMOND TOP-UP ORDER

Package: [Selected Package Name]
Package Price: ৳[Selected Price]
Payment Method: bKash Send Money
Payment Number: [Configured bKash Number]
Transaction ID: [Customer Transaction ID]
Sender's bKash Number: [Customer Phone Number]
Free Fire Player UID: [Customer Player UID]
Order Type: Diamond Top-Up

Message: আমি পেমেন্ট সম্পন্ন করেছি। অনুগ্রহ করে আমার পেমেন্ট যাচাই করে নির্বাচিত Diamond Top-Up সার্ভিসটি প্রদান করুন।`,
};

export const DEFAULT_GUILD_RULES_NOTICE: Notice = {
  id: 'guild-rules',
  title: 'Rules & Conditions',
  items: [
    '1 Basic কিনলে 8টা Bot গিল্ডে ঢুকাতে পারবেন।',
    'সঠিক Guild ID এবং গিল্ডের Rank/Level Default রেখে অর্ডার করবেন।',
    '৩০ মিনিটের মধ্যে Glory দেওয়া শুরু না করলে Refund এর সুযোগ থাকবে।',
    'Guild Bot কত Glory দিবে তার কোনো গ্যারান্টি নেই (Luck dependent)।',
  ],
};

export const DEFAULT_HERO_BANNERS: Banner[] = [
  {
    id: 'hero-banner-1',
    title: 'FF GUILD GLORY BOT — 100% BAN SAFE & AUTO TOURNAMENT PUSH',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    targetUrl: '',
    placement: 'hero',
    order: 1,
    enabled: true,
  },
  {
    id: 'hero-banner-2',
    title: 'WEEKLY & MONTHLY DIAMOND PASS — INSTANT UID TOP-UP',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    targetUrl: '',
    placement: 'hero',
    order: 2,
    enabled: true,
  },
  {
    id: 'hero-banner-3',
    title: 'FASTEST BKASH SEND MONEY & 24/7 WHATSAPP VERIFICATION',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    targetUrl: '',
    placement: 'hero',
    order: 3,
    enabled: true,
  },
];

export const DEFAULT_BANNER: Banner = DEFAULT_HERO_BANNERS[0];

