import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Product,
  Package,
  PublicSettings,
  PaymentSettings,
  Notice,
  Banner,
} from '../types';
import { dbService } from '../services/dbService';
import {
  DEFAULT_PRODUCTS,
  DEFAULT_GUILD_PACKAGES,
  DEFAULT_DIAMOND_PACKAGES,
  DEFAULT_PUBLIC_SETTINGS,
  DEFAULT_PAYMENT_SETTINGS,
  DEFAULT_GUILD_RULES_NOTICE,
  DEFAULT_HERO_BANNERS,
} from '../services/defaultData';
import { testConnection } from '../firebase/config';

export type AppPage = 'home' | 'guild-glory' | 'weekly-monthly' | 'admin';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface AppContextType {
  currentPage: AppPage;
  navigateTo: (page: AppPage) => void;
  publicSettings: PublicSettings;
  paymentSettings: PaymentSettings;
  products: Product[];
  guildPackages: Package[];
  diamondPackages: Package[];
  guildRulesNotice: Notice;
  banners: Banner[];
  loading: boolean;
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType>({
  currentPage: 'home',
  navigateTo: () => {},
  publicSettings: DEFAULT_PUBLIC_SETTINGS,
  paymentSettings: DEFAULT_PAYMENT_SETTINGS,
  products: DEFAULT_PRODUCTS,
  guildPackages: DEFAULT_GUILD_PACKAGES,
  diamondPackages: DEFAULT_DIAMOND_PACKAGES,
  guildRulesNotice: DEFAULT_GUILD_RULES_NOTICE,
  banners: DEFAULT_HERO_BANNERS,
  loading: true,
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
});

// Helper to parse current page from URL hash or pathname
const getPageFromUrl = (): AppPage => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (hash === 'guild-glory' || hash === 'weekly-monthly' || hash === 'admin' || hash === 'home') {
    return hash as AppPage;
  }
  const path = window.location.pathname.replace(/^\//, '').trim().toLowerCase();
  if (path.startsWith('guild-glory')) return 'guild-glory';
  if (path.startsWith('weekly-monthly')) return 'weekly-monthly';
  if (path.startsWith('admin')) return 'admin';
  return 'home';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentPage, setCurrentPage] = useState<AppPage>(getPageFromUrl);
  const [publicSettings, setPublicSettings] = useState<PublicSettings>(DEFAULT_PUBLIC_SETTINGS);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [guildPackages, setGuildPackages] = useState<Package[]>(DEFAULT_GUILD_PACKAGES);
  const [diamondPackages, setDiamondPackages] = useState<Package[]>(DEFAULT_DIAMOND_PACKAGES);
  const [guildRulesNotice, setGuildRulesNotice] = useState<Notice>(DEFAULT_GUILD_RULES_NOTICE);
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_HERO_BANNERS);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (page: AppPage) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      if (page === 'home') {
        if (window.location.hash) {
          try {
            history.pushState(null, '', window.location.pathname + window.location.search);
          } catch {
            window.location.hash = '';
          }
        }
      } else {
        window.location.hash = page;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentPage(getPageFromUrl());
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    // Initial connection test according to Firebase skill
    testConnection();

    // Setup live real-time listeners
    const unsubPublic = dbService.subscribePublicSettings((settings) => {
      setPublicSettings(settings);
    });

    const unsubPayment = dbService.subscribePaymentSettings((settings) => {
      setPaymentSettings(settings);
    });

    const unsubProducts = dbService.subscribeProducts((prods) => {
      setProducts(prods);
    });

    const unsubGuildPkgs = dbService.subscribePackages('guild-glory', (pkgs) => {
      setGuildPackages(pkgs);
    });

    const unsubDiamondPkgs = dbService.subscribePackages('weekly-monthly', (pkgs) => {
      setDiamondPackages(pkgs);
    });

    const unsubNotice = dbService.subscribeNotice('guild-rules', (notice) => {
      setGuildRulesNotice(notice);
    });

    const unsubBanners = dbService.subscribeBanners((bns) => {
      setBanners(bns);
      setLoading(false);
    });

    return () => {
      unsubPublic();
      unsubPayment();
      unsubProducts();
      unsubGuildPkgs();
      unsubDiamondPkgs();
      unsubNotice();
      unsubBanners();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigateTo,
        publicSettings,
        paymentSettings,
        products,
        guildPackages,
        diamondPackages,
        guildRulesNotice,
        banners,
        loading,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
