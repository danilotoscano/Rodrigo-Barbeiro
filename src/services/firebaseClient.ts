import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  runTransaction, 
  query, 
  where 
} from 'firebase/firestore';
import { FirebaseCustomConfig } from '../types';

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export function getActiveFirebaseConfig(): FirebaseCustomConfig | null {
  try {
    const saved = localStorage.getItem('rodrigo_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read firebase config from storage', e);
  }

  // Check env vars as fallback
  const envApiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  const envProjectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;
  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseCustomConfig): void {
  localStorage.setItem('rodrigo_firebase_config', JSON.stringify(config));
  // Reset cached instances to re-initialize
  cachedApp = null;
  cachedDb = null;
}

export function initializeFirebase(): { app: FirebaseApp | null; db: Firestore | null; isLive: boolean } {
  const config = getActiveFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, db: null, isLive: false };
  }

  try {
    if (!cachedApp) {
      const apps = getApps();
      cachedApp = apps.length > 0 ? apps[0] : initializeApp(config, 'rodrigo-barbeiro-app');
    }
    if (!cachedDb && cachedApp) {
      cachedDb = getFirestore(cachedApp);
    }
    return { app: cachedApp, db: cachedDb, isLive: true };
  } catch (err) {
    console.error('Failed to initialize Firebase instance:', err);
    return { app: null, db: null, isLive: false };
  }
}
