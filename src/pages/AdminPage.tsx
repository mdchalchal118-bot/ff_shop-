import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Order, Product, Package, PublicSettings, PaymentSettings, Notice, Banner } from '../types';
import { DEFAULT_HERO_BANNERS, DEFAULT_LOGO_URL } from '../services/defaultData';
import { generateProjectZip, generateDeployableDistZip, downloadBlob } from '../utils/sourceExporter';
import {
  LayoutDashboard,
  Package as PackageIcon,
  ShoppingBag,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Send,
  Download,
  LogOut,
  LogIn,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  Plus,
  Trash2,
  Edit,
  Save,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Check,
  X,
  Database,
  Loader2,
  Upload,
  Palette,
  Sparkles,
  Flame,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'orders'
  | 'branding'
  | 'products'
  | 'payment'
  | 'notices'
  | 'banners'
  | 'telegram'
  | 'export';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, signInWithGoogle, signInWithPassword, signOut, loading: authLoading, authError } = useAuth();
  const {
    publicSettings,
    paymentSettings,
    products,
    guildPackages,
    diamondPackages,
    guildRulesNotice,
    banners,
    showToast,
    navigateTo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  // Form states for settings
  const [editPublic, setEditPublic] = useState<PublicSettings>(publicSettings);
  const [editPayment, setEditPayment] = useState<PaymentSettings>(paymentSettings);
  const [editNotice, setEditNotice] = useState<Notice>(guildRulesNotice);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingDist, setIsExportingDist] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Order filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Product & Package Editing
  const [selectedProductSlug, setSelectedProductSlug] = useState<'guild-glory' | 'weekly-monthly'>(
    'guild-glory'
  );
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [isNewPkg, setIsNewPkg] = useState(false);

  // 3 Hero Banners editing
  const [carouselBanners, setCarouselBanners] = useState<Banner[]>(() => {
    if (banners && banners.length >= 3) return banners.slice(0, 3);
    return DEFAULT_HERO_BANNERS;
  });

  // Sync state when context updates
  useEffect(() => {
    setEditPublic(publicSettings);
  }, [publicSettings]);

  useEffect(() => {
    setEditPayment(paymentSettings);
  }, [paymentSettings]);

  useEffect(() => {
    setEditNotice(guildRulesNotice);
  }, [guildRulesNotice]);

  useEffect(() => {
    if (banners && banners.length > 0) {
      // Ensure always 3 banners
      const b1 = banners[0] || DEFAULT_HERO_BANNERS[0];
      const b2 = banners[1] || DEFAULT_HERO_BANNERS[1];
      const b3 = banners[2] || DEFAULT_HERO_BANNERS[2];
      setCarouselBanners([b1, b2, b3]);
    }
  }, [banners]);

  // Subscribe to orders if user is authenticated/admin
  useEffect(() => {
    if (!isAdmin && !user) return;

    try {
      const unsub = dbService.subscribeOrders((liveOrders) => {
        setOrders(liveOrders);
        setLoadingOrders(false);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Orders subscription error:', e);
      setLoadingOrders(false);
    }
  }, [isAdmin, user]);

  // Handle Export Netlify / cPanel Ready Dist ZIP
  const handleExportDist = async () => {
    setIsExportingDist(true);
    try {
      const zipBlob = await generateDeployableDistZip();
      downloadBlob(zipBlob, 'ff-shop-netlify-dist.zip');
      showToast('success', 'Netlify Ready ZIP সফলভাবে তৈরি হয়েছে! এটি সরাসরি Netlify Drop এ ড্রপ করুন।');
    } catch (e) {
      console.error('Dist export failed:', e);
      showToast('error', 'Failed to generate Netlify dist ZIP');
    } finally {
      setIsExportingDist(false);
    }
  };

  // Handle Export ZIP
  const handleExportSource = async () => {
    setIsExporting(true);
    try {
      const zipBlob = await generateProjectZip();
      downloadBlob(zipBlob, 'ff-shop-v1.0.0-source.zip');
      showToast('success', 'Project Source Code ZIP downloaded successfully!');
    } catch (e) {
      console.error('Export failed:', e);
      showToast('error', 'Failed to generate source ZIP');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Initial Seed
  const handleSeedDatabase = async () => {
    if (!confirm('Are you sure you want to initialize/reset database with default products and settings?'))
      return;
    setIsSeeding(true);
    try {
      await dbService.seedInitialData();
      showToast('success', 'Initial database seeded successfully in Firestore!');
    } catch (e) {
      console.error('Seed error:', e);
      showToast('error', 'Failed to seed database');
    } finally {
      setIsSeeding(false);
    }
  };

  // Save Settings Handlers
  const handleSavePublicSettings = async () => {
    setIsSaving(true);
    try {
      await dbService.savePublicSettings(editPublic);
      showToast('success', 'Public settings saved successfully!');
    } catch (e) {
      showToast('error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Logo Upload with smart resize, optimization & auto-save
  const handleLogoUpload = (file: File) => {
    if (!file) return;

    const applyAndSave = async (dataUrl: string) => {
      const updated = { ...editPublic, logoUrl: dataUrl };
      setEditPublic(updated);
      try {
        await dbService.savePublicSettings(updated);
        showToast('success', 'লোগো সফলভাবে আপলোড ও সেভ করা হয়েছে!');
      } catch (err) {
        showToast('info', 'লোগো লোড হয়েছে। সেভ করতে "Save Changes" বাটনে চাপুন।');
      }
    };

    if (file.type === 'image/svg+xml' || file.size < 40000) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        applyAndSave(result);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Resize using Canvas so large files fit easily into Firestore
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(format, 0.9);
          applyAndSave(dataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSavePaymentSettings = async () => {
    setIsSaving(true);
    try {
      await dbService.savePaymentSettings(editPayment);
      showToast('success', 'Payment & WhatsApp settings updated!');
    } catch (e) {
      showToast('error', 'Failed to save payment settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotice = async () => {
    setIsSaving(true);
    try {
      await dbService.saveNotice(editNotice);
      showToast('success', 'Notice rules updated!');
    } catch (e) {
      showToast('error', 'Failed to save notice');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAllBanners = async () => {
    setIsSaving(true);
    try {
      for (const b of carouselBanners) {
        await dbService.saveBanner(b);
      }
      showToast('success', '৩টি স্লাইডার ব্যানার সফলভাবে সংরক্ষিত হয়েছে!');
    } catch (e) {
      showToast('error', 'ব্যানার সংরক্ষণ করতে ব্যর্থ হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  // Order status actions
  const handleUpdateOrderStatus = async (
    orderId: string,
    paymentStatus: 'pending' | 'verified' | 'rejected',
    serviceStatus: 'processing' | 'completed' | 'cancelled',
    notes?: string
  ) => {
    try {
      await dbService.updateOrder(orderId, {
        paymentStatus,
        serviceStatus,
        adminNotes: notes,
      });
      showToast('success', 'Order status updated');
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          paymentStatus,
          serviceStatus,
          adminNotes: notes,
        });
      }
    } catch (e) {
      showToast('error', 'Failed to update order');
    }
  };

  // Save Package Handler
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    try {
      await dbService.savePackage(editingPkg);
      showToast('success', isNewPkg ? 'Package created!' : 'Package updated!');
      setEditingPkg(null);
      setIsNewPkg(false);
    } catch (e) {
      showToast('error', 'Failed to save package');
    }
  };

  const handleDeletePackage = async (pkg: Package) => {
    if (!confirm(`Delete package "${pkg.name}"?`)) return;
    try {
      await dbService.deletePackage(pkg.productId, pkg.id);
      showToast('success', 'Package deleted');
    } catch (e) {
      showToast('error', 'Failed to delete package');
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      orderSearch === '' ||
      o.orderRef?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.bkashTransactionId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.senderPhone?.includes(orderSearch) ||
      o.targetId?.includes(orderSearch);

    const matchesStatus =
      orderStatusFilter === 'all' ||
      o.paymentStatus === orderStatusFilter ||
      o.serviceStatus === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending').length;
  const verifiedOrders = orders.filter((o) => o.paymentStatus === 'verified').length;
  const completedOrders = orders.filter((o) => o.serviceStatus === 'completed').length;
  const rejectedOrders = orders.filter((o) => o.paymentStatus === 'rejected').length;
  const activePackagesCount =
    guildPackages.filter((p) => p.enabled).length + diamondPackages.filter((p) => p.enabled).length;

  // If user is not authorized or not signed in
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="rounded-3xl bg-[#0c1222] border-2 border-purple-500/40 p-6 sm:p-10 shadow-2xl cyber-glow-purple">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-400/50 mb-5 text-purple-400">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-orbitron tracking-wide mb-2">
            ADMIN PANEL LOGIN
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-rajdhani text-base mb-6 leading-relaxed">
            অ্যাডমিন প্যানেল এক্সেস করতে গোপন পাসওয়ার্ড প্রদান করুন।
          </p>

          {authError && (
            <div className="p-3 mb-5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
              {authError}
            </div>
          )}

          {/* Secret Password Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const ok = signInWithPassword(adminPasswordInput);
              if (ok) {
                showToast('success', 'অ্যাডমিন প্যানেলে স্বাগতম!');
                setAdminPasswordInput('');
              }
            }}
            className="space-y-4 mb-6 text-left"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
                Admin Security Password:
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono tracking-widest text-center"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right text-slate-950 font-black text-sm tracking-wide font-orbitron transition-all duration-300 cursor-pointer shadow-lg cyber-glow-cyan"
            >
              পাসওয়ার্ড দিয়ে লগইন করুন
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#0c1222] px-3 text-[11px] text-slate-500 font-mono uppercase shrink-0">
              অথবা GOOGLE SIGN IN
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          <div className="space-y-3">
            <button
              onClick={signInWithGoogle}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-purple-400" />
              <span>Sign In with Google Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-cyan-500/20 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-purple-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ADMINISTRATOR CONTROL PANEL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-orbitron tracking-wide">
            FF SHOP MANAGEMENT
          </h1>
          <div className="text-xs text-slate-400 font-mono mt-0.5">
            Admin: <span className="text-cyan-300">{user?.email || 'Master Administrator'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 hover:bg-slate-800 text-cyan-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Seed default products & settings to Firestore"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            <span>Sync Defaults</span>
          </button>

          <button
            onClick={handleExportDist}
            disabled={isExportingDist}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500 text-teal-200 text-xs font-bold transition-colors cursor-pointer"
            title="Download Netlify Drop ready dist ZIP with index.html at root (Zero 404)"
          >
            {isExportingDist ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Netlify Ready ZIP</span>
          </button>

          <button
            onClick={handleExportSource}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500 text-purple-200 text-xs font-bold transition-colors cursor-pointer"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Source ZIP</span>
          </button>

          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'orders', label: `Orders (${totalOrders})`, icon: ShoppingBag },
          { id: 'branding', label: 'Logo & Branding', icon: Palette },
          { id: 'products', label: 'Products & Packages', icon: PackageIcon },
          { id: 'payment', label: 'Payment & WhatsApp', icon: CreditCard },
          { id: 'notices', label: 'Rules & Notices', icon: FileText },
          { id: 'banners', label: 'Ad Banners', icon: ImageIcon },
          { id: 'telegram', label: 'Telegram Button', icon: Send },
          { id: 'export', label: 'Source Export', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-rajdhani font-semibold text-sm whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 cyber-glow-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          {/* KPI Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-2xl bg-[#0d1424] border border-cyan-500/30 p-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Orders</span>
              <div className="text-3xl font-black text-white font-orbitron mt-2">{totalOrders}</div>
              <span className="text-[10px] text-cyan-400">All submissions</span>
            </div>

            <div className="rounded-2xl bg-[#0d1424] border border-amber-500/30 p-4">
              <span className="text-xs text-amber-400 font-semibold uppercase">Pending</span>
              <div className="text-3xl font-black text-amber-300 font-orbitron mt-2">{pendingOrders}</div>
              <span className="text-[10px] text-slate-400">Awaiting Trx verification</span>
            </div>

            <div className="rounded-2xl bg-[#0d1424] border border-emerald-500/30 p-4">
              <span className="text-xs text-emerald-400 font-semibold uppercase">Verified</span>
              <div className="text-3xl font-black text-emerald-300 font-orbitron mt-2">{verifiedOrders}</div>
              <span className="text-[10px] text-slate-400">Payment confirmed</span>
            </div>

            <div className="rounded-2xl bg-[#0d1424] border border-blue-500/30 p-4">
              <span className="text-xs text-blue-400 font-semibold uppercase">Completed</span>
              <div className="text-3xl font-black text-blue-300 font-orbitron mt-2">{completedOrders}</div>
              <span className="text-[10px] text-slate-400">Fulfilled services</span>
            </div>

            <div className="rounded-2xl bg-[#0d1424] border border-rose-500/30 p-4">
              <span className="text-xs text-rose-400 font-semibold uppercase">Rejected</span>
              <div className="text-3xl font-black text-rose-300 font-orbitron mt-2">{rejectedOrders}</div>
              <span className="text-[10px] text-slate-400">Invalid payments</span>
            </div>

            <div className="rounded-2xl bg-[#0d1424] border border-purple-500/30 p-4">
              <span className="text-xs text-purple-400 font-semibold uppercase">Active Packages</span>
              <div className="text-3xl font-black text-purple-300 font-orbitron mt-2">{activePackagesCount}</div>
              <span className="text-[10px] text-slate-400">Across 2 categories</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6">
            <h3 className="text-lg font-bold text-white font-orbitron mb-4">Quick Management Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('branding')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-cyan-400 text-left transition-colors cursor-pointer"
              >
                <Palette className="w-5 h-5 text-cyan-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Website Logo & Branding</h4>
                <p className="text-xs text-slate-400 mt-1">Upload or customize website logo</p>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-emerald-400 text-left transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Review Submitted Orders</h4>
                <p className="text-xs text-slate-400 mt-1">Verify TrxIDs and update fulfillment state</p>
              </button>

              <button
                onClick={() => setActiveTab('payment')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-pink-400 text-left transition-colors cursor-pointer"
              >
                <CreditCard className="w-5 h-5 text-pink-400 mb-2" />
                <h4 className="font-bold text-white text-sm">bKash & WhatsApp Setup</h4>
                <p className="text-xs text-slate-400 mt-1">Change payment numbers and message templates</p>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-purple-400 text-left transition-colors cursor-pointer"
              >
                <PackageIcon className="w-5 h-5 text-purple-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Package Pricing & Images</h4>
                <p className="text-xs text-slate-400 mt-1">Edit prices, stock out toggle, card thumbnails</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0f1d] p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by TrxID, Order Ref, Phone, ID..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Payment</option>
                <option value="verified">Verified Payment</option>
                <option value="rejected">Rejected Payment</option>
                <option value="processing">Processing Service</option>
                <option value="completed">Completed Service</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          {loadingOrders ? (
            <div className="text-center py-12 text-slate-400">Loading live orders from Firestore...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-[#0a0f1d] rounded-2xl border border-slate-800">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-slate-300 font-orbitron">No orders found</h4>
              <p className="text-xs text-slate-400 mt-1">Customer submitted orders will appear here automatically in real time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0a0f1d]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#0e1628] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order Ref / Time</th>
                    <th className="py-3 px-4">Type & Package</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">TrxID & Phone</th>
                    <th className="py-3 px-4">Target ID</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-rajdhani text-base">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-cyan-300 text-xs">{ord.orderRef}</div>
                        <div className="text-[11px] text-slate-400 font-sans">
                          {new Date(ord.createdAt).toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white leading-tight">{ord.packageName}</div>
                        <span className="text-[10px] uppercase font-bold text-cyan-400">
                          {ord.orderType === 'guild_glory' ? 'Guild Glory' : 'Diamond Top-Up'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-black text-cyan-300">
                        ৳{ord.price?.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs">
                        <div className="text-pink-300 font-bold tracking-wider">{ord.bkashTransactionId}</div>
                        <div className="text-slate-400">{ord.senderPhone}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-slate-200">
                        {ord.targetId}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase font-sans ${
                            ord.paymentStatus === 'verified'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : ord.paymentStatus === 'rejected'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase font-sans ${
                            ord.serviceStatus === 'completed'
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                              : ord.serviceStatus === 'cancelled'
                              ? 'bg-slate-900 text-slate-400 border border-slate-700'
                              : 'bg-purple-950 text-purple-300 border border-purple-500/40'
                          }`}
                        >
                          {ord.serviceStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Order Details & Action Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-xl bg-[#0c1222] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-cyan-400 font-mono font-bold">ORDER MANAGEMENT</span>
                    <h3 className="text-xl font-bold text-white font-orbitron">{selectedOrder.orderRef}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-4 space-y-3 text-xs sm:text-sm">
                  <div className="grid grid-cols-2 gap-3 bg-[#080d19] p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400">Package:</span>
                      <div className="font-bold text-white">{selectedOrder.packageName}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Price:</span>
                      <div className="font-bold text-cyan-300">৳{selectedOrder.price?.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">bKash TrxID:</span>
                      <div className="font-mono font-bold text-pink-300">{selectedOrder.bkashTransactionId}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Sender Phone:</span>
                      <div className="font-mono text-slate-200">{selectedOrder.senderPhone}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400">
                        {selectedOrder.orderType === 'guild_glory' ? 'Free Fire Guild ID:' : 'Player UID:'}
                      </span>
                      <div className="font-mono font-bold text-cyan-300 text-base">{selectedOrder.targetId}</div>
                    </div>
                  </div>

                  {/* Payment Verification Buttons */}
                  <div>
                    <span className="block font-semibold text-slate-300 mb-1.5 uppercase text-xs">
                      1. Payment Verification Status:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(
                            selectedOrder.id,
                            'verified',
                            selectedOrder.serviceStatus,
                            selectedOrder.adminNotes
                          )
                        }
                        className={`flex-1 py-2 rounded-lg font-bold text-xs border cursor-pointer ${
                          selectedOrder.paymentStatus === 'verified'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-900 text-emerald-400 border-emerald-900/60 hover:bg-slate-800'
                        }`}
                      >
                        ✓ Mark Verified
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(
                            selectedOrder.id,
                            'rejected',
                            'cancelled',
                            selectedOrder.adminNotes
                          )
                        }
                        className={`flex-1 py-2 rounded-lg font-bold text-xs border cursor-pointer ${
                          selectedOrder.paymentStatus === 'rejected'
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-slate-900 text-rose-400 border-rose-900/60 hover:bg-slate-800'
                        }`}
                      >
                        ✕ Mark Rejected
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(
                            selectedOrder.id,
                            'pending',
                            selectedOrder.serviceStatus,
                            selectedOrder.adminNotes
                          )
                        }
                        className={`py-2 px-3 rounded-lg text-xs border cursor-pointer ${
                          selectedOrder.paymentStatus === 'pending'
                            ? 'bg-amber-600 text-white border-amber-500'
                            : 'bg-slate-900 text-amber-400 border-amber-900/60'
                        }`}
                      >
                        Reset Pending
                      </button>
                    </div>
                  </div>

                  {/* Service Fulfillment Buttons */}
                  <div>
                    <span className="block font-semibold text-slate-300 mb-1.5 uppercase text-xs">
                      2. Service Fulfillment Status:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(
                            selectedOrder.id,
                            selectedOrder.paymentStatus,
                            'completed',
                            selectedOrder.adminNotes
                          )
                        }
                        className={`flex-1 py-2 rounded-lg font-bold text-xs border cursor-pointer ${
                          selectedOrder.serviceStatus === 'completed'
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-slate-900 text-blue-400 border-blue-900/60 hover:bg-slate-800'
                        }`}
                      >
                        ✓ Mark Completed
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderStatus(
                            selectedOrder.id,
                            selectedOrder.paymentStatus,
                            'processing',
                            selectedOrder.adminNotes
                          )
                        }
                        className={`flex-1 py-2 rounded-lg font-bold text-xs border cursor-pointer ${
                          selectedOrder.serviceStatus === 'processing'
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-slate-900 text-purple-400 border-purple-900/60 hover:bg-slate-800'
                        }`}
                      >
                        Processing
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRODUCTS & PACKAGES */}
      {activeTab === 'products' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Sub-tabs: FF GUILD GLORY vs WEEKLY/MONTHLY */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedProductSlug('guild-glory')}
              className={`px-5 py-2.5 rounded-xl font-orbitron font-bold text-sm transition-all cursor-pointer ${
                selectedProductSlug === 'guild-glory'
                  ? 'bg-cyan-500 text-slate-950 cyber-glow-cyan'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              1. FF GUILD GLORY
            </button>

            <button
              onClick={() => setSelectedProductSlug('weekly-monthly')}
              className={`px-5 py-2.5 rounded-xl font-orbitron font-bold text-sm transition-all cursor-pointer ${
                selectedProductSlug === 'weekly-monthly'
                  ? 'bg-purple-500 text-slate-950 cyber-glow-purple'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              2. WEEKLY/MONTHLY
            </button>
          </div>

          {/* Product Category Settings: Thumbnail & Title */}
          {(() => {
            const currentProd = products.find((p) => p.slug === selectedProductSlug) || {
              id: selectedProductSlug,
              slug: selectedProductSlug,
              name: selectedProductSlug === 'guild-glory' ? 'FF GUILD GLORY' : 'WEEKLY/MONTHLY',
              description: '',
              thumbnail: '',
              displayOrder: selectedProductSlug === 'guild-glory' ? 1 : 2,
              enabled: true,
            };

            return (
              <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 space-y-4">
                <h3 className="text-base font-bold text-white font-orbitron">
                  Category Card Customization & Thumbnail
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Thumbnail Preview */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 font-semibold">
                      Current Card Thumbnail Preview:
                    </label>
                    <div className="w-full aspect-[16/10] rounded-xl bg-slate-900 border border-slate-700 overflow-hidden relative">
                      {currentProd.thumbnail ? (
                        <img
                          src={currentProd.thumbnail}
                          alt={currentProd.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-xs text-slate-500">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail URL Input / Upload */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-xs text-slate-300 font-semibold mb-1">
                        Product Display Name:
                      </label>
                      <input
                        type="text"
                        value={currentProd.name}
                        onChange={(e) => {
                          const updated = { ...currentProd, name: e.target.value };
                          dbService.saveProduct(updated);
                        }}
                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 font-semibold mb-1">
                        Thumbnail Image URL / Data URI:
                      </label>
                      <input
                        type="text"
                        placeholder="https://... or data:image/..."
                        value={currentProd.thumbnail || ''}
                        onChange={(e) => {
                          const updated = { ...currentProd, thumbnail: e.target.value };
                          dbService.saveProduct(updated);
                        }}
                        className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Paste an image URL or upload an image file from your device below.
                      </p>
                    </div>

                    <div>
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-900/60 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Upload Image File from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64 = event.target?.result as string;
                                const updated = { ...currentProd, thumbnail: base64 };
                                dbService.saveProduct(updated);
                                showToast('success', 'Thumbnail updated from file!');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Package List for current category */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-orbitron">
                {selectedProductSlug === 'guild-glory' ? 'FF GUILD GLORY Packages' : 'WEEKLY/MONTHLY Packages'}
              </h3>
              <button
                onClick={() => {
                  setEditingPkg({
                    id: `pkg-${Date.now().toString(36)}`,
                    productId: selectedProductSlug,
                    name: '',
                    price: 100,
                    description: '',
                    displayOrder: 99,
                    enabled: true,
                  });
                  setIsNewPkg(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Package</span>
              </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(selectedProductSlug === 'guild-glory' ? guildPackages : diamondPackages).map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-xl bg-[#0a0f1d] border border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                        Order #{pkg.displayOrder}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={async () => {
                            const newStock = pkg.inStock === false ? true : false;
                            await dbService.savePackage({ ...pkg, inStock: newStock });
                            showToast('success', `${pkg.name} — ${newStock ? 'ইন স্টক করা হয়েছে' : 'স্টক আউট করা হয়েছে'}`);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer border ${
                            pkg.inStock !== false
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-500/50'
                              : 'bg-rose-950/80 text-rose-300 border-rose-500/50 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-500/50'
                          }`}
                          title="Click to toggle In Stock / Stock Out"
                        >
                          {pkg.inStock !== false ? 'ইন স্টক' : 'স্টক আউট'}
                        </button>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            pkg.enabled ? 'bg-slate-800 text-slate-300' : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {pkg.enabled ? 'Active' : 'Off'}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white font-orbitron">{pkg.name}</h4>
                    {pkg.description && (
                      <p className="text-xs text-slate-400 font-rajdhani mt-0.5 line-clamp-2">
                        {pkg.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xl font-bold font-orbitron text-cyan-300">
                      ৳{pkg.price.toFixed(2)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingPkg(pkg);
                          setIsNewPkg(false);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer"
                        title="Edit Package"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-400 cursor-pointer"
                        title="Delete Package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Package Edit Modal */}
          {editingPkg && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <form
                onSubmit={handleSavePackage}
                className="w-full max-w-md bg-[#0c1222] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-white font-orbitron">
                    {isNewPkg ? 'Add New Package' : 'Edit Package'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingPkg(null)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">Package Name:</label>
                  <input
                    type="text"
                    required
                    value={editingPkg.name}
                    onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">Price (৳ BDT):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingPkg.price}
                    onChange={(e) => setEditingPkg({ ...editingPkg, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-semibold">Description:</label>
                  <input
                    type="text"
                    value={editingPkg.description || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1 font-semibold">Display Order:</label>
                    <input
                      type="number"
                      value={editingPkg.displayOrder}
                      onChange={(e) => setEditingPkg({ ...editingPkg, displayOrder: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={editingPkg.enabled}
                        onChange={(e) => setEditingPkg({ ...editingPkg, enabled: e.target.checked })}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>Active / Published</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={editingPkg.inStock !== false}
                        onChange={(e) => setEditingPkg({ ...editingPkg, inStock: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span className={editingPkg.inStock !== false ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                        {editingPkg.inStock !== false ? 'ইন স্টক (In Stock)' : 'স্টক আউট (Stock Out)'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPkg(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Save Package
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB: WEBSITE LOGO & BRANDING */}
      {activeTab === 'branding' && (
        <div className="max-w-4xl space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-white font-orbitron border-l-2 border-cyan-400 pl-3">
                WEBSITE LOGO & BRANDING (লোগো ও সাইট নাম ডিজাইন)
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani text-base mt-1">
                ওয়েবসাইটের প্রধান নাম, ফন্ট ডিজাইন ও লোগো পরিচালনা করুন। যে কোনো সাইজের লোগো স্বয়ংক্রিয়ভাবে হেডারে ফিট হবে।
              </p>
            </div>
            <button
              onClick={handleSavePublicSettings}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs tracking-wide uppercase font-orbitron cursor-pointer shadow-lg cyber-glow-cyan shrink-0"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Branding Changes</span>
            </button>
          </div>

          {/* Live Preview Section */}
          <div className="rounded-2xl bg-[#0a0f1d] border border-cyan-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                LIVE NAVBAR PREVIEW (লাইভ প্রিভিউ)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                হেডারে ঠিক যেভাবে প্রদর্শিত হবে
              </span>
            </div>

            {/* Simulated Header Navbar */}
            <div className="rounded-xl bg-[#070a12] border border-cyan-500/20 p-4 sm:p-5 flex items-center justify-between shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Logo Frame - only if logo is present */}
                {editPublic.logoUrl && (
                  <div className="relative flex items-center justify-center max-h-12 max-w-[140px] shrink-0">
                    <img
                      src={editPublic.logoUrl}
                      alt="Logo Preview"
                      className="max-h-11 w-auto object-contain filter drop-shadow select-none"
                    />
                  </div>
                )}

                {/* Brand Name Typography */}
                <div className="flex items-center select-none font-orbitron tracking-wider text-2xl sm:text-3xl font-black">
                  {(() => {
                    const rawName = (editPublic.websiteName || 'FF SHOP').trim();
                    const parts = rawName.split(' ');
                    const first = parts[0] || 'FF';
                    const rest = parts.slice(1).join(' ');
                    const style = editPublic.nameStyle || 'gold';

                    let firstClass = 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 drop-shadow-[0_2px_8px_rgba(234,179,8,0.5)]';
                    let restClass = 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-white drop-shadow-[0_2px_8px_rgba(254,240,138,0.5)]';

                    if (style === 'cyan') {
                      firstClass = 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 drop-shadow-[0_2px_8px_rgba(6,182,212,0.5)]';
                      restClass = 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-200 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]';
                    } else if (style === 'fire') {
                      firstClass = 'text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 drop-shadow-[0_2px_8px_rgba(249,115,22,0.5)]';
                      restClass = 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]';
                    } else if (style === 'white') {
                      firstClass = 'text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]';
                      restClass = 'text-cyan-300 drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)]';
                    }

                    return (
                      <>
                        <span className={firstClass}>{first}</span>
                        {rest && <span className={`ml-2 ${restClass}`}>{rest}</span>}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Simulated Navigation items */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-rajdhani text-sm">
                <span className="text-cyan-300 font-bold px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40">Home</span>
                <span>FF GUILD GLORY</span>
                <span>WEEKLY/MONTHLY</span>
              </div>
            </div>

            <div className="bg-[#0c1326] p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>পারফেক্ট ফিট গ্যারান্টি:</strong> আপনার লোগো যেকোনো সাইজ বা রেজ্যুলেশন হলেও তা স্বয়ংক্রিয়ভাবে সমানুপাতিকভাবে হেডারে ফিট হবে। লোগো না দিলে কোনো নকল নকশা দেখাবে না, শুধু পরিচ্ছন্ন বোল্ড সাইট নাম দেখাবে।
              </span>
            </div>
          </div>

          {/* Website Name & Font Style Configuration */}
          <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 space-y-5">
            <h4 className="text-sm font-bold text-white font-orbitron flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>১. ওয়েবসাইটের নাম ও ফন্ট কালার ডিজাইন</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Website Name (ওয়েবসাইটের নাম):
                </label>
                <input
                  type="text"
                  value={editPublic.websiteName}
                  onChange={(e) => setEditPublic({ ...editPublic, websiteName: e.target.value })}
                  placeholder="FF SHOP"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                />
                <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                  যেমন: FF SHOP, BD TOPUP, GARENA FF ইত্যাদি
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  নামের কালার ও ডিজাইন থিম:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gold', label: 'সোনালী গোল্ড (Free Fire)', colorClass: 'text-amber-400 border-amber-500/50' },
                    { id: 'cyan', label: 'সাইবার সায়ান (Cyber Cyan)', colorClass: 'text-cyan-400 border-cyan-500/50' },
                    { id: 'fire', label: 'ফায়ার অরেঞ্জ (Flame Red)', colorClass: 'text-orange-400 border-orange-500/50' },
                    { id: 'white', label: 'সলিড হোয়াইট (Solid White)', colorClass: 'text-white border-white/50' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setEditPublic({ ...editPublic, nameStyle: style.id as any })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                        (editPublic.nameStyle || 'gold') === style.id
                          ? `${style.colorClass} bg-slate-800 shadow-md ring-1 ring-cyan-400`
                          : 'text-slate-400 border-slate-800 bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Logo Upload & URL Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Direct File Upload */}
            <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white font-orbitron flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>২. ডিভাইস থেকে সরাসরি লোগো আপলোড</span>
                </h4>
                <p className="text-xs text-slate-400 font-rajdhani text-base mb-4">
                  আপনার মোবাইল বা কম্পিউটার থেকে যে কোনো লোগো ফাইল নির্বাচন করুন (স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হয়ে যাবে):
                </p>

                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/70 rounded-2xl bg-cyan-950/10 hover:bg-cyan-950/20 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white font-rajdhani text-base">
                    লোগো ছবি নির্বাচন করতে ট্যাপ করুন
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono mt-1">
                    PNG, SVG, JPG, WEBP ফরম্যাট সমর্থিত
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                  />
                </label>
              </div>

              {editPublic.logoUrl && (
                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <span className="text-[11px] text-emerald-400 font-mono">✓ লোগো যুক্ত আছে</span>
                  <button
                    type="button"
                    onClick={async () => {
                      const updated = { ...editPublic, logoUrl: '' };
                      setEditPublic(updated);
                      try {
                        await dbService.savePublicSettings(updated);
                        showToast('info', 'লোগো মুছে ফেলা হয়েছে (শুধু সাইট নাম প্রদর্শিত হবে)');
                      } catch {
                        showToast('info', 'লোগো ক্লিয়ার করা হয়েছে। সেভ করতে Save বাটনে চাপুন।');
                      }
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    লোগো মুছে ফেলুন (রিমুভ)
                  </button>
                </div>
              )}
            </div>

            {/* Image URL Input & Presets */}
            <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 space-y-4">
              <h4 className="text-sm font-bold text-white font-orbitron flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-purple-400" />
                <span>৩. অনলাইন ইমেজ লিংক (URL)</span>
              </h4>
              <p className="text-xs text-slate-400 font-rajdhani text-base">
                ইন্টারনেটের কোনো ছবির সরাসরি লিংক থাকলে এখানে পেস্ট করতে পারেন:
              </p>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Logo Image URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/my-logo.png"
                    value={editPublic.logoUrl || ''}
                    onChange={(e) => setEditPublic({ ...editPublic, logoUrl: e.target.value })}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  {editPublic.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setEditPublic({ ...editPublic, logoUrl: '' })}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <span className="block text-xs text-slate-300 font-semibold mb-2">
                  অথবা রেডিমেড গেমিং লোগো প্রিসেট:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: 'Dragon Flame Crest',
                      url: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff0055"/><stop offset="100%" stop-color="#ff9900"/></linearGradient></defs><rect width="200" height="200" rx="40" fill="#0b0f1d"/><circle cx="100" cy="100" r="75" fill="none" stroke="url(#g1)" stroke-width="6"/><path d="M100 30 Q120 70 145 95 Q130 90 120 100 Q150 120 135 155 Q100 130 100 170 Q95 130 65 155 Q50 120 80 100 Q70 90 55 95 Q80 70 100 30 Z" fill="url(#g1)"/><text x="100" y="125" font-family="'Orbitron',sans-serif" font-weight="900" font-size="32" fill="#fff" text-anchor="middle">FF</text></svg>
`)}`,
                    },
                    {
                      label: 'Golden Trophy Shield',
                      url: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffe259"/><stop offset="100%" stop-color="#ffa751"/></linearGradient></defs><rect width="200" height="200" rx="40" fill="#080d19"/><polygon points="100,15 170,55 150,150 100,185 50,150 30,55" fill="none" stroke="url(#gold)" stroke-width="5"/><path d="M70 65 H130 V105 C130 125 100 135 100 135 C100 135 70 125 70 105 Z" fill="url(#gold)" opacity="0.85"/><text x="100" y="105" font-family="'Orbitron',sans-serif" font-weight="900" font-size="28" fill="#000" text-anchor="middle">FF</text></svg>
`)}`,
                    },
                    {
                      label: 'Neon Diamond Pass',
                      url: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="dm" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00f2fe"/><stop offset="100%" stop-color="#4facfe"/></linearGradient></defs><rect width="200" height="200" rx="40" fill="#070a14"/><polygon points="100,25 170,75 100,175 30,75" fill="none" stroke="url(#dm)" stroke-width="6"/><polygon points="100,45 150,85 100,155 50,85" fill="rgba(0,242,254,0.2)" stroke="#fff" stroke-width="2"/><text x="100" y="115" font-family="'Orbitron',sans-serif" font-weight="900" font-size="34" fill="#00f2fe" text-anchor="middle">FF</text></svg>
`)}`,
                    },
                    {
                      label: 'Cyber Skull Bot',
                      url: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="sk" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs><rect width="200" height="200" rx="40" fill="#050814"/><circle cx="100" cy="90" r="50" fill="none" stroke="url(#sk)" stroke-width="5"/><circle cx="85" cy="85" r="10" fill="#ec4899"/><circle cx="115" cy="85" r="10" fill="#ec4899"/><polygon points="100,105 92,118 108,118" fill="url(#sk)"/><rect x="85" y="130" width="30" height="15" rx="5" fill="url(#sk)"/></svg>
`)}`,
                    },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditPublic((prev) => ({ ...prev, logoUrl: preset.url }));
                        showToast('info', `${preset.label} নির্বাচন করা হয়েছে`);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-left text-xs text-slate-200 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <div className="w-5 h-5 rounded overflow-hidden shrink-0">
                        <img src={preset.url} alt="" className="w-full h-full object-contain" />
                      </div>
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSavePublicSettings}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-sm tracking-wider font-orbitron transition-all duration-300 cursor-pointer shadow-xl cyber-glow-cyan"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>SAVE BRANDING CHANGES</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT & WHATSAPP SETTINGS */}
      {activeTab === 'payment' && (
        <div className="max-w-3xl space-y-6 animate-in fade-in">
          <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 space-y-5">
            <h3 className="text-base font-bold text-white font-orbitron border-l-2 border-pink-400 pl-2">
              bKash Payment Gateway Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  bKash Payment Number:
                </label>
                <input
                  type="text"
                  value={editPayment.bkashNumber}
                  onChange={(e) => setEditPayment({ ...editPayment, bkashNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Payment Method Label:
                </label>
                <input
                  type="text"
                  value={editPayment.paymentMethodLabel}
                  onChange={(e) => setEditPayment({ ...editPayment, paymentMethodLabel: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Customer Payment Instructions:
              </label>
              <textarea
                rows={3}
                value={editPayment.paymentInstructions}
                onChange={(e) => setEditPayment({ ...editPayment, paymentInstructions: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 font-rajdhani text-base"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Warning Notice:
              </label>
              <input
                type="text"
                value={editPayment.paymentWarning}
                onChange={(e) => setEditPayment({ ...editPayment, paymentWarning: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-amber-300 focus:outline-none focus:border-cyan-400 font-rajdhani text-base"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 space-y-5">
            <h3 className="text-base font-bold text-white font-orbitron border-l-2 border-emerald-400 pl-2">
              WhatsApp Integration & Message Templates
            </h3>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                WhatsApp Contact Phone Number (e.g. 01903982821):
              </label>
              <input
                type="text"
                value={editPayment.whatsAppNumber}
                onChange={(e) => setEditPayment({ ...editPayment, whatsAppNumber: e.target.value })}
                className="w-full max-w-sm px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-emerald-300 font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Guild Glory WhatsApp Template:
              </label>
              <textarea
                rows={6}
                value={editPayment.guildGloryWaTemplate}
                onChange={(e) => setEditPayment({ ...editPayment, guildGloryWaTemplate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Diamond Top-Up WhatsApp Template:
              </label>
              <textarea
                rows={6}
                value={editPayment.diamondTopUpWaTemplate}
                onChange={(e) => setEditPayment({ ...editPayment, diamondTopUpWaTemplate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleSavePaymentSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm cursor-pointer shadow-lg hover:brightness-110"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Payment & WhatsApp Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RULES & NOTICES */}
      {activeTab === 'notices' && (
        <div className="max-w-3xl space-y-6 animate-in fade-in">
          <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 space-y-5">
            <h3 className="text-base font-bold text-white font-orbitron border-l-2 border-cyan-400 pl-2">
              Guild Glory Rules & Conditions Notice Editor
            </h3>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Notice Heading:</label>
              <input
                type="text"
                value={editNotice.title}
                onChange={(e) => setEditNotice({ ...editNotice, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400 font-orbitron"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs text-slate-300 font-semibold">Rules List Items:</label>
              {(editNotice.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(editNotice.items || [])];
                      newItems[idx] = e.target.value;
                      setEditNotice({ ...editNotice, items: newItems });
                    }}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 font-rajdhani text-base"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = (editNotice.items || []).filter((_, i) => i !== idx);
                      setEditNotice({ ...editNotice, items: newItems });
                    }}
                    className="p-2 text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setEditNotice({
                    ...editNotice,
                    items: [...(editNotice.items || []), 'নতুন নিয়ম যোগ করুন'],
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Rule Item</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveNotice}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm cursor-pointer shadow-lg"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Rules & Conditions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BANNER ADVERTISEMENT (UP TO 3 HERO CAROUSEL BANNERS) */}
      {activeTab === 'banners' && (
        <div className="max-w-4xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white font-orbitron border-l-2 border-cyan-400 pl-2">
                HOMEPAGE AUTO-SLIDING BANNERS (মোট ৩টি ব্যানার)
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani text-base mt-1">
                মেইন পেজের উপরে এই ৩টি ব্যানার নির্দিষ্ট সময় পর পর এক পাশ থেকে অন্য পাশে স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে।
              </p>
            </div>
            <button
              onClick={handleSaveAllBanners}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg cyber-glow-cyan"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save 3 Banners</span>
            </button>
          </div>

          <div className="space-y-6">
            {carouselBanners.map((banner, index) => (
              <div
                key={banner.id || index}
                className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold text-xs font-orbitron">
                    BANNER #{index + 1}
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={banner.enabled}
                      onChange={(e) => {
                        const updated = [...carouselBanners];
                        updated[index] = { ...updated[index], enabled: e.target.checked };
                        setCarouselBanners(updated);
                      }}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>সক্রিয় (Active)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Live Preview */}
                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1 font-semibold">
                      লাইভ প্রিভিউ:
                    </span>
                    <div className="w-full aspect-[21/9] rounded-xl bg-slate-900 border border-slate-700 overflow-hidden relative">
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={`Banner ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-xs text-slate-500">
                          ছবি নেই
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 p-2 flex flex-col justify-end pointer-events-none">
                        <span className="text-[10px] text-white font-bold font-orbitron line-clamp-1">
                          {banner.title || `Banner ${index + 1}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <label className="block text-xs text-slate-300 font-semibold mb-1">
                        ব্যানার শিরোনাম (Title):
                      </label>
                      <input
                        type="text"
                        value={banner.title || ''}
                        onChange={(e) => {
                          const updated = [...carouselBanners];
                          updated[index] = { ...updated[index], title: e.target.value };
                          setCarouselBanners(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400 font-orbitron"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 font-semibold mb-1">
                        ইমেজ URL অথবা ডিভাইস থেকে ছবি আপলোড:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://... or data:image/..."
                          value={banner.imageUrl || ''}
                          onChange={(e) => {
                            const updated = [...carouselBanners];
                            updated[index] = { ...updated[index], imageUrl: e.target.value };
                            setCarouselBanners(updated);
                          }}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                        />
                        <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/60 cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>আপলোড</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64 = event.target?.result as string;
                                  const updated = [...carouselBanners];
                                  updated[index] = { ...updated[index], imageUrl: base64 };
                                  setCarouselBanners(updated);
                                  showToast('success', `Banner #${index + 1} ছবি লোড হয়েছে`);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 font-semibold mb-1">
                        টার্গেট লিঙ্ক URL (ঐচ্ছিক):
                      </label>
                      <input
                        type="text"
                        placeholder="https://t.me/..."
                        value={banner.targetUrl || ''}
                        onChange={(e) => {
                          const updated = [...carouselBanners];
                          updated[index] = { ...updated[index], targetUrl: e.target.value };
                          setCarouselBanners(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveAllBanners}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right text-slate-950 font-black text-sm tracking-wide font-orbitron transition-all duration-300 cursor-pointer shadow-xl cyber-glow-cyan"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>SAVE ALL 3 HERO BANNERS</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: TELEGRAM BUTTON */}
      {activeTab === 'telegram' && (
        <div className="max-w-2xl space-y-6 animate-in fade-in">
          <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 p-6 space-y-5">
            <h3 className="text-base font-bold text-white font-orbitron border-l-2 border-sky-400 pl-2">
              Floating Telegram Button Settings
            </h3>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Telegram Channel / Support URL:
              </label>
              <input
                type="text"
                value={editPublic.telegramUrl}
                onChange={(e) => setEditPublic({ ...editPublic, telegramUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-sky-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tgEnabled"
                checked={editPublic.telegramEnabled}
                onChange={(e) => setEditPublic({ ...editPublic, telegramEnabled: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <label htmlFor="tgEnabled" className="text-sm text-slate-300 font-semibold cursor-pointer">
                Enable Floating Telegram Button on lower-right edge
              </label>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSavePublicSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm cursor-pointer shadow-lg"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Telegram Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SOURCE CODE & NETLIFY EXPORT */}
      {activeTab === 'export' && (
        <div className="max-w-4xl space-y-8 animate-in fade-in">
          {/* Netlify 404 Troubleshooting Banner */}
          <div className="rounded-2xl bg-teal-950/40 border-2 border-teal-500/50 p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-300 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white font-orbitron flex items-center gap-2">
                  <span>Netlify 404 Page Not Found সমস্যার স্থায়ী সমাধান</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400 text-teal-300 text-xs font-mono">SOLVED</span>
                </h3>
                <p className="text-sm text-teal-200/90 font-rajdhani text-base leading-relaxed">
                  Netlify সার্ভারে <strong>404 Page Not Found</strong> বা <strong>index.html খুঁজে না পাওয়ার</strong> প্রধান কারণ ছিল: Netlify Drop-এ বিল্ড ছাড়া কাঁচা সোর্স কোড ড্রপ করা, অথবা SPA রিফ্রেশ রুল (<code className="text-white bg-black/40 px-1 py-0.5 rounded">_redirects</code> / <code className="text-white bg-black/40 px-1 py-0.5 rounded">netlify.toml</code>) অনুপস্থিত থাকা।
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-rajdhani text-base text-slate-200">
                  <div className="bg-black/30 rounded-xl p-3 border border-teal-500/30">
                    <strong className="text-teal-300 block mb-1">⚡ পদ্ধতি ১: ১-ক্লিকে Netlify Drop (সবচেয়ে সহজ)</strong>
                    নিচের সবুজ <strong>"Netlify Ready ZIP (dist)"</strong> বাটনে চাপ দিন। ফাইলটি আনজিপ করে সরাসরি <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">app.netlify.com/drop</a> এ ড্র্যাগ করে ছেড়ে দিন!
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-teal-500/30">
                    <strong className="text-teal-300 block mb-1">🐙 পদ্ধতি ২: GitHub দিয়ে ডিপ্লয় (Auto Build)</strong>
                    আমরা প্রজেক্টে <code className="text-white bg-black/40 px-1 py-0.5 rounded">netlify.toml</code> যুক্ত করেছি। কোড পুশ করলে Netlify নিজে থেকেই <code className="text-cyan-300">npm run build</code> এবং <code className="text-cyan-300">dist</code> ডিরেক্টরি ডিটেক্ট করে লাইভ করে দেবে।
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TWO EXPORT OPTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OPTION 1: Netlify Ready dist ZIP */}
            <div className="rounded-2xl bg-[#0a151d] border-2 border-teal-500/50 p-6 space-y-5 shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/50 flex items-center justify-center text-teal-300">
                    <Download className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white font-orbitron">
                      Netlify / cPanel Ready Build
                    </h4>
                    <p className="text-xs text-teal-300 font-rajdhani">
                      সরাসরি আপলোড করার জন্য তৈরি ফাইল (Pre-built)
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  কোনো Node.js বা npm রান করতে হবে না। এই ZIP-এর মূল ফোল্ডারেই রয়েছে প্রোডাকশন <code className="text-teal-300">index.html</code>, <code className="text-teal-300">_redirects</code>, <code className="text-teal-300">.htaccess</code> এবং কম্পাইল করা <code className="text-teal-300">assets</code>।
                </p>

                <div className="bg-[#050e14] rounded-xl p-3 border border-teal-500/20 space-y-1 text-xs font-mono text-teal-200">
                  <div>✓ index.html (বিল্ড করা তৈরি ফাইল)</div>
                  <div>✓ _redirects (Netlify SPA 404 রোধ করে)</div>
                  <div>✓ .htaccess (cPanel / Apache রিরাইট রুল)</div>
                  <div>✓ assets/ (CSS এবং JS বান্ডেল)</div>
                </div>
              </div>

              <button
                onClick={handleExportDist}
                disabled={isExportingDist}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-sm tracking-wider font-orbitron shadow-lg cursor-pointer disabled:opacity-50 transition-all"
              >
                {isExportingDist ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Packaging Dist Files...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD NETLIFY READY ZIP</span>
                  </>
                )}
              </button>
            </div>

            {/* OPTION 2: Full Source Code ZIP */}
            <div className="rounded-2xl bg-[#0a0f1d] border-2 border-purple-500/40 p-6 space-y-5 shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white font-orbitron">
                      Complete Project Source Code
                    </h4>
                    <p className="text-xs text-purple-300 font-rajdhani">
                      GitHub রিপোজিটরি ও ডেভেলপারদের জন্য
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  GitHub-এ আপলোড করার জন্য সম্পূর্ণ প্রজেক্ট রিপোজিটরি: সম্পূর্ণ <code className="text-purple-300">src/</code> ফোল্ডার (সকল পেজ ও কম্পোনেন্ট), <code className="text-purple-300">package.json</code>, <code className="text-purple-300">package-lock.json</code>, <code className="text-purple-300">.github/workflows</code> (GitHub Pages অটো-বিল্ড), <code className="text-purple-300">netlify.toml</code>, <code className="text-purple-300">vercel.json</code> এবং তৈরি করা <code className="text-purple-300">dist/</code> ফাইল।
                </p>

                <div className="bg-[#080d19] rounded-xl p-3 border border-purple-500/20 space-y-1 text-xs font-mono text-purple-200">
                  <div>✓ সম্পূর্ণ src/ ফোল্ডার (সকল UI, লজিক ও স্টাইল)</div>
                  <div>✓ .github/workflows/deploy.yml (GitHub Pages অটোমেশন)</div>
                  <div>✓ package.json & package-lock.json (নির্ভুল ডিপেন্ডেন্সি)</div>
                  <div>✓ netlify.toml & vercel.json (১-ক্লিক ক্লাউড বিল্ড)</div>
                  <div>✓ server.js (Express Node.js হোস্টিং)</div>
                </div>
              </div>

              <button
                onClick={handleExportSource}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wider font-orbitron shadow-lg cursor-pointer disabled:opacity-50 transition-all"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Packaging Full Source Tree...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD GITHUB & SOURCE CODE (.ZIP)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* GitHub & Hosting Server Step-by-Step Instructions */}
          <div className="rounded-2xl bg-[#070b14] border border-cyan-500/30 p-6 space-y-4">
            <h4 className="text-base font-bold text-cyan-300 font-orbitron flex items-center gap-2">
              <span>📋 GitHub থেকে হোস্টিং সার্ভারে সাইট লাইভ করার সঠিক নিয়ম</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-rajdhani text-sm text-slate-300">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-base text-cyan-400">১. GitHub Pages</div>
                <p>কোড GitHub রিপোজিটরিতে পুশ করুন। এরপর <strong>Settings</strong> &gt; <strong>Pages</strong>-এ গিয়ে Build and deployment Source-এ <strong>"GitHub Actions"</strong> সিলেক্ট করুন। প্রজেক্টের সাথে যুক্ত <code className="text-cyan-300">deploy.yml</code> নিজে থেকেই সাইট লাইভ করে দেবে।</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-base text-teal-400">২. Netlify (GitHub কানেক্ট)</div>
                <p>Netlify-তে <strong>"Import from Git"</strong> দিয়ে রিপোজিটরি কানেক্ট করুন। প্রজেক্টের <code className="text-teal-300">netlify.toml</code> স্বয়ংক্রিয়ভাবে Build command: <code className="text-white">npm run build</code> এবং Publish directory: <code className="text-white">dist</code> সেট করে সাইট লাইভ করে দেবে।</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-base text-purple-400">৩. Vercel (GitHub কানেক্ট)</div>
                <p>Vercel-এ রিপোজিটরি ইমপোর্ট করুন। Framework হিসেবে <strong>Vite</strong> সিলেক্ট থাকবে এবং <code className="text-purple-300">vercel.json</code> ফাইলের সাহায্যে সব রিরাইট রুল সক্রিয় হয়ে ৪০৪ মুক্তভাবে সাইট চালু হবে।</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
