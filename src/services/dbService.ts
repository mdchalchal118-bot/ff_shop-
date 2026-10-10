import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  Product,
  Package,
  PublicSettings,
  PaymentSettings,
  Notice,
  Banner,
  Order,
} from '../types';
import {
  DEFAULT_PRODUCTS,
  DEFAULT_GUILD_PACKAGES,
  DEFAULT_DIAMOND_PACKAGES,
  DEFAULT_PUBLIC_SETTINGS,
  DEFAULT_PAYMENT_SETTINGS,
  DEFAULT_GUILD_RULES_NOTICE,
  DEFAULT_HERO_BANNERS,
} from './defaultData';

export const dbService = {
  // Subscribe to public settings
  subscribePublicSettings(
    callback: (settings: PublicSettings) => void
  ): () => void {
    const docPath = 'settings/public';
    const docRef = doc(db, 'settings', 'public');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as PublicSettings);
        } else {
          callback(DEFAULT_PUBLIC_SETTINGS);
        }
      },
      (error) => {
        console.warn('Public settings read issue, using defaults:', error);
        callback(DEFAULT_PUBLIC_SETTINGS);
      }
    );
  },

  // Subscribe to payment settings
  subscribePaymentSettings(
    callback: (settings: PaymentSettings) => void
  ): () => void {
    const docPath = 'settings/payment';
    const docRef = doc(db, 'settings', 'payment');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as PaymentSettings);
        } else {
          callback(DEFAULT_PAYMENT_SETTINGS);
        }
      },
      (error) => {
        console.warn('Payment settings read issue, using defaults:', error);
        callback(DEFAULT_PAYMENT_SETTINGS);
      }
    );
  },

  // Subscribe to products
  subscribeProducts(callback: (products: Product[]) => void): () => void {
    const colPath = 'products';
    const colRef = collection(db, 'products');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const products = snapshot.docs.map((d) => d.data() as Product);
          products.sort((a, b) => a.displayOrder - b.displayOrder);
          callback(products);
        } else {
          callback(DEFAULT_PRODUCTS);
        }
      },
      (error) => {
        console.warn('Products read issue, using default products:', error);
        callback(DEFAULT_PRODUCTS);
      }
    );
  },

  // Subscribe to packages for a product
  subscribePackages(
    productId: string,
    callback: (packages: Package[]) => void
  ): () => void {
    const subColPath = `products/${productId}/packages`;
    const colRef = collection(db, 'products', productId, 'packages');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const packages = snapshot.docs.map((d) => d.data() as Package);
          packages.sort((a, b) => a.displayOrder - b.displayOrder);
          callback(packages);
        } else {
          const defaults =
            productId === 'guild-glory'
              ? DEFAULT_GUILD_PACKAGES
              : DEFAULT_DIAMOND_PACKAGES;
          callback(defaults);
        }
      },
      (error) => {
        console.warn(`Packages read issue for ${productId}:`, error);
        const defaults =
          productId === 'guild-glory'
            ? DEFAULT_GUILD_PACKAGES
            : DEFAULT_DIAMOND_PACKAGES;
        callback(defaults);
      }
    );
  },

  // Subscribe to notices
  subscribeNotice(
    noticeId: string,
    callback: (notice: Notice) => void
  ): () => void {
    const docRef = doc(db, 'notices', noticeId);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as Notice);
        } else {
          if (noticeId === 'guild-rules') {
            callback(DEFAULT_GUILD_RULES_NOTICE);
          }
        }
      },
      (error) => {
        console.warn(`Notice read issue for ${noticeId}:`, error);
        if (noticeId === 'guild-rules') {
          callback(DEFAULT_GUILD_RULES_NOTICE);
        }
      }
    );
  },

  // Subscribe to banners
  subscribeBanners(callback: (banners: Banner[]) => void): () => void {
    const colRef = collection(db, 'banners');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const banners = snapshot.docs.map((d) => d.data() as Banner);
          banners.sort((a, b) => a.order - b.order);
          callback(banners);
        } else {
          callback(DEFAULT_HERO_BANNERS);
        }
      },
      (error) => {
        console.warn('Banners read issue, using default:', error);
        callback(DEFAULT_HERO_BANNERS);
      }
    );
  },

  // Customer: Submit Order
  async createOrder(
    orderData: Omit<Order, 'id' | 'createdAt' | 'paymentStatus' | 'serviceStatus'>
  ): Promise<Order> {
    const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newOrder: Order = {
      ...orderData,
      id,
      paymentStatus: 'pending',
      serviceStatus: 'processing',
      createdAt: new Date().toISOString(),
    };

    const docPath = `orders/${id}`;
    try {
      await setDoc(doc(db, 'orders', id), newOrder);
      return newOrder;
    } catch (error) {
      console.error('Failed to create order in Firestore:', error);
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  },

  // Admin: Subscribe to all orders
  subscribeOrders(
    callback: (orders: Order[]) => void,
    limitCount = 100
  ): () => void {
    const colRef = collection(db, 'orders');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const orders = snapshot.docs.map((d) => d.data() as Order);
        orders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        callback(orders);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    );
  },

  // Admin: Update Order
  async updateOrder(
    orderId: string,
    updates: Partial<Order>
  ): Promise<void> {
    const docPath = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  },

  // Admin: Delete Order
  async deleteOrder(orderId: string): Promise<void> {
    const docPath = `orders/${orderId}`;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  // Admin: Update public settings
  async savePublicSettings(settings: PublicSettings): Promise<void> {
    const docPath = 'settings/public';
    try {
      await setDoc(doc(db, 'settings', 'public'), {
        ...settings,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // Admin: Update payment settings
  async savePaymentSettings(settings: PaymentSettings): Promise<void> {
    const docPath = 'settings/payment';
    try {
      await setDoc(doc(db, 'settings', 'payment'), {
        ...settings,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // Admin: Update Notice
  async saveNotice(notice: Notice): Promise<void> {
    const docPath = `notices/${notice.id}`;
    try {
      await setDoc(doc(db, 'notices', notice.id), {
        ...notice,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // Admin: Save Product
  async saveProduct(product: Product): Promise<void> {
    const docPath = `products/${product.id}`;
    try {
      await setDoc(doc(db, 'products', product.id), {
        ...product,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // Admin: Save Package
  async savePackage(pkg: Package): Promise<void> {
    const docPath = `products/${pkg.productId}/packages/${pkg.id}`;
    try {
      await setDoc(doc(db, 'products', pkg.productId, 'packages', pkg.id), {
        ...pkg,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // Admin: Delete Package
  async deletePackage(productId: string, packageId: string): Promise<void> {
    const docPath = `products/${productId}/packages/${packageId}`;
    try {
      await deleteDoc(doc(db, 'products', productId, 'packages', packageId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  // Admin: Save Banner
  async saveBanner(banner: Banner): Promise<void> {
    const docPath = `banners/${banner.id}`;
    try {
      await setDoc(doc(db, 'banners', banner.id), {
        ...banner,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  // Admin: Delete Banner
  async deleteBanner(bannerId: string): Promise<void> {
    const docPath = `banners/${bannerId}`;
    try {
      await deleteDoc(doc(db, 'banners', bannerId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  // Admin Initializer / Seeder: Seeds database with defaults if empty
  async seedInitialData(): Promise<void> {
    try {
      // 1. Settings
      await setDoc(doc(db, 'settings', 'public'), DEFAULT_PUBLIC_SETTINGS);
      await setDoc(doc(db, 'settings', 'payment'), DEFAULT_PAYMENT_SETTINGS);
      await setDoc(doc(db, 'notices', 'guild-rules'), DEFAULT_GUILD_RULES_NOTICE);
      for (const banner of DEFAULT_HERO_BANNERS) {
        await setDoc(doc(db, 'banners', banner.id), banner);
      }

      // 2. Products
      for (const prod of DEFAULT_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }

      // 3. Guild Packages
      for (const pkg of DEFAULT_GUILD_PACKAGES) {
        await setDoc(doc(db, 'products', 'guild-glory', 'packages', pkg.id), pkg);
      }

      // 4. Diamond Packages
      for (const pkg of DEFAULT_DIAMOND_PACKAGES) {
        await setDoc(doc(db, 'products', 'weekly-monthly', 'packages', pkg.id), pkg);
      }
    } catch (e) {
      console.error('Error seeding initial data:', e);
      throw e;
    }
  },
};
