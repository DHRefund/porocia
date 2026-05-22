import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

type UserCache = Record<string, {
  displayName: string;
  photoURL: string;
  email: string;
}>;

let globalCache: UserCache = {};
let listeners: Set<(cache: UserCache) => void> = new Set();
let unsubscribe: (() => void) | null = null;

function startGlobalListener() {
  if (unsubscribe) return;

  const usersRef = collection(db, "users");
  unsubscribe = onSnapshot(usersRef, (snapshot) => {
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      globalCache[doc.id] = {
        displayName: data.displayName || data.email?.split("@")[0] || "Unknown",
        photoURL: data.photoURL || "",
        email: data.email || "",
      };
    });

    listeners.forEach(cb => cb({ ...globalCache }));
  });
}

export function useUsersCache() {
  const [cache, setCache] = useState<UserCache>(globalCache);

  useEffect(() => {
    startGlobalListener();
    listeners.add(setCache);

    return () => {
      listeners.delete(setCache);
    };
  }, []);

  const getUserName = (uid: string) => {
    return cache[uid]?.displayName || "Unknown User";
  };

  const getUserPhoto = (uid: string) => {
    return cache[uid]?.photoURL || "";
  };

  const getUser = (uid: string) => {
    return cache[uid] || null;
  };

  return { cache, getUserName, getUserPhoto, getUser };
}
