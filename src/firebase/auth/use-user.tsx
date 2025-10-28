'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '../provider';

const UserContext = createContext<User | null | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    if (!auth) {
      setUser(undefined);
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  return useContext(UserContext);
};
