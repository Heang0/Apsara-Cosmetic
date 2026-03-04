import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

const getMissingFirebaseClientConfigKeys = () => {
  const requiredConfig: Record<string, string | undefined> = {
    NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
    NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,
  };

  return Object.entries(requiredConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);
};

export const hasFirebaseClientConfig = () => {
  return getMissingFirebaseClientConfigKeys().length === 0;
};

export const getFirebaseApp = (): FirebaseApp => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase client app is only available in browser');
  }

  if (!hasFirebaseClientConfig()) {
    const missingKeys = getMissingFirebaseClientConfigKeys();
    throw new Error(`Missing NEXT_PUBLIC Firebase configuration: ${missingKeys.join(', ')}`);
  }

  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }

  return app;
};

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }

  return auth;
};
