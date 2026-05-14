"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { listenAuthState } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase/client";

// Kiểu dữ liệu profile từ Firestore collection `users`
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
  profile: UserProfile | null;  // Firestore profile
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = listenAuthState(async (firebaseUser) => {
      // Hủy listener Firestore cũ nếu user đổi
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        // ĐỒNG BỘ SESSION: Nếu có user ở client, đảm bảo server cũng có cookie
        // Điều này giúp fix lỗi "Header hiện user nhưng vào chat bị redirect về login"
        // try {
        //   const idToken = await firebaseUser.getIdToken();
        //   await fetch("/api/auth/session", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ idToken }),
        //   });
        // } catch (err) {
        //   console.error("Failed to sync auth session to server:", err);
        // }

        // Dùng onSnapshot để profile tự cập nhật realtime
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
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}