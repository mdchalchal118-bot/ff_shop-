export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  displayOrder: number;
  enabled: boolean;
  updatedAt?: string;
}

export interface Package {
  id: string;
  productId: string;
  name: string;
  price: number;
  description?: string;
  displayOrder: number;
  enabled: boolean;
  inStock?: boolean;
  updatedAt?: string;
}

export interface PublicSettings {
  websiteName: string;
  tagline: string;
  logoUrl?: string;
  nameStyle?: 'gold' | 'cyan' | 'white' | 'fire';
  telegramUrl: string;
  telegramEnabled: boolean;
  footerNotice: string;
  updatedAt?: string;
}

export interface PaymentSettings {
  bkashNumber: string;
  paymentInstructions: string;
  paymentWarning: string;
  paymentMethodLabel: string;
  copyButtonText: string;
  whatsAppNumber: string;
  guildGloryWaTemplate: string;
  diamondTopUpWaTemplate: string;
  updatedAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  content?: string;
  items?: string[];
  updatedAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: string;
  order: number;
  enabled: boolean;
  updatedAt?: string;
}

export interface Order {
  id: string;
  orderRef: string;
  orderType: 'guild_glory' | 'diamond_topup';
  productId?: string;
  productName: string;
  packageId?: string;
  packageName: string;
  price: number;
  bkashTransactionId: string;
  senderPhone: string;
  targetId: string; // Guild ID or Player UID
  paymentStatus: 'pending' | 'verified' | 'rejected';
  serviceStatus: 'processing' | 'completed' | 'cancelled';
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'owner';
  createdAt: string;
}
