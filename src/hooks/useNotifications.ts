import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";

export interface Notification {
  id: string;
  type: "announcement" | "event" | "knowledge";
  title: string;
  body?: string;
  link: string;
  read: boolean;
  createdAt: Timestamp;
  actorName?: string;
  actorPhotoURL?: string;
}

/**
 * Hook to listen to the current user's unread notifications in realtime.
 *
 * - Listens via `onSnapshot` on `users/{uid}/notifications`
 * - Filters `read == false`, ordered by `createdAt desc`, limited to 20
 * - Shows a sonner toast for every *new* notification
 * - Exposes `markAsRead(notifId)` to flag a notification as read
 */
export function useNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Track known notification IDs so we can detect genuinely new arrivals
  // and avoid re-toasting on mount or reconnect.
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      knownIdsRef.current.clear();
      isInitialLoadRef.current = true;
      return;
    }

    const notifRef = collection(db, "users", user.uid, "notifications");
    // We query without orderBy to avoid requiring a composite index.
    const q = query(
      notifRef,
      where("read", "==", false),
      limit(100)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const notifs = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Notification)
        );

        // Sort by createdAt desc in memory
        notifs.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

        // Limit to 20 notifications
        const slicedNotifs = notifs.slice(0, 20);
        setNotifications(slicedNotifs);

        // On the initial load we just seed the known IDs — no toasts.
        if (isInitialLoadRef.current) {
          knownIdsRef.current = new Set(slicedNotifs.map((n) => n.id));
          isInitialLoadRef.current = false;
          return;
        }

        // Detect new notifications (IDs we haven't seen before).
        for (const n of slicedNotifs) {
          if (!knownIdsRef.current.has(n.id)) {
            knownIdsRef.current.add(n.id);
            toast(n.title, {
              description: n.body,
              action: {
                label: "表示",
                onClick: () => {
                  markAsRead(n.id);
                  router.push(n.link);
                },
              },
            });
          }
        }
      },
      (error) => {
        console.error("Firestore onSnapshot error in useNotifications:", error);
        toast.error("通知の取得に失敗しました", {
          description: error.message,
        });
      }
    );

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /**
   * Mark a single notification as read (client SDK).
   */
  const markAsRead = useCallback(
    async (notifId: string) => {
      if (!user) return;
      const notifDoc = doc(
        db,
        "users",
        user.uid,
        "notifications",
        notifId
      );
      await updateDoc(notifDoc, { read: true });
    },
    [user]
  );

  const unreadCount = notifications.length;

  return { notifications, unreadCount, markAsRead };
}
