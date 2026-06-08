import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./client";

/**
 * Notification payload structure.
 */
export interface NotificationPayload {
  /** Short title for the notification */
  title: string;
  /** Optional detailed body */
  body?: string;
  /** URL or route the notification should navigate to */
  link: string;
  /** Timestamp when created – stored as Firestore Timestamp */
  createdAt?: Timestamp;
  /** Read flag – defaults to false */
  read?: boolean;
}

/**
 * Sends a notification to a specific user.
 * The notification is stored in the sub‑collection
 * `users/{uid}/notifications`.
 */
export async function sendNotification(
  uid: string,
  payload: NotificationPayload
): Promise<void> {
  const notifRef = collection(db, "users", uid, "notifications");
  await addDoc(notifRef, {
    title: payload.title,
    body: payload.body ?? "",
    link: payload.link,
    read: false,
    createdAt: payload.createdAt ?? serverTimestamp(),
  });
}
