"use server";

import { adminDb } from "@/lib/firebase/server";
import { validateSessionCookieAction } from "./auth";
import * as admin from "firebase-admin";

/**
 * Server Action: Create an article in the knowledge base and
 * fan-out notifications to every user except the creator.
 *
 * Uses Firebase Admin SDK — runs exclusively on the server.
 */
export async function createArticle(formData: FormData): Promise<
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
    const summary = formData.get("summary") as string || "";
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const tagsJson = (formData.get("tags") as string) || "[]";
    const scope = (formData.get("scope") as string || "all") as "all" | "group" | "admin";
    const allowedGroupsJson = (formData.get("allowedGroups") as string) || "[]";
    const authorName = (formData.get("authorName") as string) || "ユーザー";
    const authorPhoto = (formData.get("authorPhoto") as string) || "";

    if (!title || !content) {
      return { success: false, error: "タイトルと内容は必須です。" };
    }

    const tags = JSON.parse(tagsJson) as string[];
    const allowedGroups = JSON.parse(allowedGroupsJson) as string[];

    // ── 3. Write article doc (Admin SDK) ──
    const articleRef = await adminDb.collection("articles").add({
      title,
      summary,
      content,
      category,
      tags,
      scope,
      allowedGroups,
      views: 0,
      likes: [],
      createdBy: uid,
      authorName,
      authorPhoto,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const articleId = articleRef.id;

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
            type: "knowledge",
            title,
            body: summary || content.slice(0, 120),
            link: `/knowledge/${articleId}`,
            read: false,
            actorName: authorName,
            actorPhotoURL: authorPhoto,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          })
      );

    await Promise.all(notificationPromises);

    return { success: true, id: articleId };
  } catch (error) {
    console.error("createArticle error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました。",
    };
  }
}
