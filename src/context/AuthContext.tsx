'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirebaseAuth, hasFirebaseClientConfig } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  telegramChatId?: string;
}

interface TelegramStoredProfile {
  name?: string;
  email?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  telegramChatId: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [telegramChatId, setTelegramChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe = () => {};

    if (!hasFirebaseClientConfig()) {
      setUser(null);
      setTelegramChatId(null);
      setLoading(false);
      return () => {};
    }

    try {
      const firebaseAuth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
        if (firebaseUser) {
          const storedTelegramChatId =
            typeof window !== 'undefined' ? localStorage.getItem('telegramChatId') : null;
          const storedTelegramProfileRaw =
            typeof window !== 'undefined' ? localStorage.getItem('telegramUserProfile') : null;
          let storedTelegramProfile: TelegramStoredProfile | null = null;

          if (storedTelegramProfileRaw) {
            try {
              storedTelegramProfile = JSON.parse(storedTelegramProfileRaw) as TelegramStoredProfile;
            } catch {
              storedTelegramProfile = null;
            }
          }

          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || storedTelegramProfile?.name || firebaseUser.email?.split('@')[0] || '',
            email: firebaseUser.email || storedTelegramProfile?.email || '',
            phone: firebaseUser.phoneNumber || '',
            photoURL: firebaseUser.photoURL || storedTelegramProfile?.photoURL || '',
            telegramChatId: storedTelegramChatId || undefined,
          });
          setTelegramChatId(storedTelegramChatId || null);
        } else {
          setUser(null);
          setTelegramChatId(null);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Firebase auth initialization error:', error);
      setUser(null);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      if (!hasFirebaseClientConfig()) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('telegramChatId');
          localStorage.removeItem('telegramUserProfile');
        }
        router.push('/');
        return;
      }
      const firebaseAuth = getFirebaseAuth();
      await firebaseSignOut(firebaseAuth);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('telegramChatId');
        localStorage.removeItem('telegramUserProfile');
      }
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      telegramChatId,
      loading,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
