import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut as fbSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (password: string) => boolean;
  signOut: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithPassword: () => false,
  signOut: async () => {},
  authError: null,
});

// Authorized admin emails
const ADMIN_EMAILS = ['mdchalchal118@gmail.com'];
const ADMIN_SECRET_KEY = 'mrlala';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('ff_admin_auth') === 'true';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        const email = currentUser.email.toLowerCase();
        // Check primary admin email
        if (ADMIN_EMAILS.includes(email)) {
          setIsAdmin(true);
          sessionStorage.setItem('ff_admin_auth', 'true');
        } else {
          // Check Firestore admins collection
          try {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            if (adminDoc.exists()) {
              setIsAdmin(true);
              sessionStorage.setItem('ff_admin_auth', 'true');
            }
          } catch (e) {
            console.warn('Error verifying admin status:', e);
          }
        }
      } else {
        // If not signed in via Firebase, check if session was authenticated via password
        if (sessionStorage.getItem('ff_admin_auth') === 'true') {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithPassword = (pass: string): boolean => {
    setAuthError(null);
    if (pass === ADMIN_SECRET_KEY) {
      setIsAdmin(true);
      sessionStorage.setItem('ff_admin_auth', 'true');
      return true;
    } else {
      setAuthError('ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।');
      return false;
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email?.toLowerCase();
      if (email && ADMIN_EMAILS.includes(email)) {
        setIsAdmin(true);
        sessionStorage.setItem('ff_admin_auth', 'true');
      }
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : 'Login failed';
      if (typeof msg === 'string' && (msg.includes('unauthorized-domain') || msg.includes('auth/unauthorized-domain'))) {
        msg = 'এই হোস্টিং ডোমেইনটি Firebase Console-এ অথরাইজড করা নেই। আপনি ওপরের সিক্রেট পাসওয়ার্ড "mrlala" দিয়ে সহজেই সরাসরি লগইন করতে পারেন, অথবা Firebase Console -> Authentication -> Settings -> Authorized Domains-এ আপনার ওয়েবসাইট ডোমেইন যোগ করুন।';
      }
      setAuthError(msg);
      throw err;
    }
  };

  const signOut = async () => {
    setAuthError(null);
    sessionStorage.removeItem('ff_admin_auth');
    try {
      await fbSignOut(auth);
    } catch (err: unknown) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        signInWithGoogle,
        signInWithPassword,
        signOut,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
