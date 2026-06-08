"use server";

import { adminDb } from "@/lib/firebase/server";
import { validateSessionCookieAction } from "./auth";
import * as admin from "firebase-admin";

/**
 * Server Action: Create an announcement and fan-out notifications
 * to every user except the creator.
 *
 * Uses Firebase Admin SDK — runs exclusively on the server.
 */
export async function createAnnouncement(formData: FormData): Promise<
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
    const content = formData.get("content") as string;
    const type = (formData.get("type") as string) || "info";
    const isPinned = formData.get("isPinned") === "true";
    const imageURL = (formData.get("imageURL") as string) || null;
    const authorName = (formData.get("authorName") as string) || "Admin";
    const calendarEventId = (formData.get("calendarEventId") as string) || null;

    if (!title || !content) {
      return { success: false, error: "タイトルと内容は必須です。" };
    }

    // ── 3. Write announcement doc (Admin SDK) ──
    const announcementRef = await adminDb.collection("announcements").add({
      title,
      content,
      type,
      isPinned,
      imageURL,
      authorId: uid,
      authorName,
      calendarEventId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const announcementId = announcementRef.id;

    // ── 4. Fan-out notifications to all users ──
    const usersSnapshot = await adminDb.collection("users").get();

    const notificationPromises = usersSnapshot.docs
      .filter((doc) => doc.id !== uid) // skip the creator
      .map((userDoc) =>
        adminDb
          .collection("users")
          .doc(userDoc.id)
          .collection("notifications")
          .add({
            type: "announcement",
            title: `📢 ${title}`,
            body: content.slice(0, 100),
            link: `/announcements#announcement-${announcementId}`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          })
      );

    await Promise.all(notificationPromises);

    return { success: true, id: announcementId };
  } catch (error) {
    console.error("createAnnouncementAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました。",
    };
  }
}
