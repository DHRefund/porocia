"use server";

import { adminDb } from "@/lib/firebase/server";
import { validateSessionCookieAction } from "./auth";
import * as admin from "firebase-admin";

/**
 * Server Action: Create a calendar event and fan-out notifications
 * to every user except the creator.
 *
 * Uses Firebase Admin SDK — runs exclusively on the server.
 */
export async function createEvent(formData: FormData): Promise<
  { success: true; id: string } | { success: false; error: string }
> {
  try {
    // ── 1. Authenticate via session cookie ──
    const uid = await validateSessionCookieAction();
    if (!uid) {
      return { success: false, error: "認証されていません。再ログインしてください。" };
    }

    // ── 2. Parse form data ──
    const title = formData.get("title") as string;
    const startISO = formData.get("start") as string;
    const endISO = formData.get("end") as string;
    const type = (formData.get("type") as string) || "event";
    const scope = (formData.get("scope") as string) || "company";
    const groupId = (formData.get("groupId") as string) || "";
    const groupName = (formData.get("groupName") as string) || "";
    const creatorName = (formData.get("creatorName") as string) || "Unknown User";

    if (!title || !startISO || !endISO) {
      return { success: false, error: "タイトル、開始日時、終了日時は必須です。" };
    }

    const startDate = new Date(startISO);
    const endDate = new Date(endISO);

    // ── 3. Write event doc (Admin SDK) ──
    const eventRef = await adminDb.collection("events").add({
      title,
      start: admin.firestore.Timestamp.fromDate(startDate),
      end: admin.firestore.Timestamp.fromDate(endDate),
      type,
      scope,
      groupId,
      groupName,
      createdBy: uid,
      creatorName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const eventId = eventRef.id;

    // ── 4. Fan-out notifications to all users ──
    const usersSnapshot = await adminDb.collection("users").get();

    const formattedDate = startDate.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });

    const notificationPromises = usersSnapshot.docs
      .filter((doc) => doc.id !== uid) // skip the creator
      .map((userDoc) =>
        adminDb
          .collection("users")
          .doc(userDoc.id)
          .collection("notifications")
          .add({
            type: "event",
            title: `📅 ${title}`,
            body: formattedDate,
            link: "/calendar",
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          })
      );

    await Promise.all(notificationPromises);

    return { success: true, id: eventId };
  } catch (error) {
    console.error("createEventAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました。",
    };
  }
}
