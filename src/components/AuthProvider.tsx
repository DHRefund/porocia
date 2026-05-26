// src/components/AuthProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { listenAuthState } from "@/lib/firebase/auth";
import { db, auth } from "@/lib/firebase/client";
import { syncSessionIfNeededAction, validateSessionCookieAction, removeSessionCookieAction } from "@/lib/actions/auth";

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  bio: string;
  role: string;
  createdAt?: any;
  lastLoginAt?: any;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  sessionReady: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  sessionReady: false,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionReady, setSessionReady] = useState<boolean>(false);

  const logout = async () => {
    try {
      // Remove server-side session first to avoid race conditions
      await removeSessionCookieAction();
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setSessionReady(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    // On mount, check whether a valid session cookie already exists
    (async () => {
      const uid = await validateSessionCookieAction();
      setSessionReady(!!uid);
    })();

    const unsubscribeAuth = listenAuthState(async (firebaseUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const { alreadySynced } = await syncSessionIfNeededAction(idToken);
          setSessionReady(true);
        } catch (err) {
          console.error("Failed to sync auth session to server:", err);
          setSessionReady(false);
        }

        unsubscribeSnapshot = onSnapshot(
          doc(db, "users", firebaseUser.uid),
          (snap) => {
            if (snap.exists()) {
              setProfile(snap.data() as UserProfile);
            } else {
              setProfile(null);
            }
            setLoading(false);
          },
          () => {
            setLoading(false);
          }
        );
      } else {
        setProfile(null);
        setLoading(false);
        setSessionReady(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, sessionReady, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}