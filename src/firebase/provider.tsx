'use client';
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  useEffect,
  useState,
} from 'react';

import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { initializeFirebase } from '.';

type FirebaseContextValue = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

type FirebaseProviderProps = {
  children: ReactNode;
};

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);

  useEffect(() => {
    const { firebaseApp, auth, firestore } = initializeFirebase();
    setFirebaseApp(firebaseApp);
    setAuth(auth);
    setFirestore(firestore);
  }, []);

  const contextValue = useMemo(
    () => ({ firebaseApp, auth, firestore }),
    [firebaseApp, auth, firestore]
  );

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase().firebaseApp;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useFirestore() {
  return useFirebase().firestore;
}
