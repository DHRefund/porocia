import { db } from "./client";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp
} from "firebase/firestore";

export interface Article {
  id?: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  scope: "all" | "group" | "admin";
  allowedGroups?: string[];
  views: number;
  likes: string[];
  createdBy: string;
  authorName: string;
  authorPhoto?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Comment {
  id?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt?: Timestamp;
}

// ---------------------------------------------------------------------------
// Article CRUD & Queries
// ---------------------------------------------------------------------------

/**
 * Tạo một bài viết mới
 */
export async function createArticle(data: Omit<Article, "views" | "likes" | "createdAt" | "updatedAt">): Promise<string> {
  const articlesRef = collection(db, "articles");
  const docRef = await addDoc(articlesRef, {
    ...data,
    views: 0,
    likes: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Cập nhật bài viết
 */
export async function updateArticle(articleId: string, data: Partial<Omit<Article, "id" | "views" | "likes" | "createdAt" | "updatedAt">>): Promise<void> {
  const articleRef = doc(db, "articles", articleId);
  await updateDoc(articleRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Xóa bài viết
 */
export async function deleteArticle(articleId: string): Promise<void> {
  const articleRef = doc(db, "articles", articleId);
  await deleteDoc(articleRef);
}

/**
 * Lấy thông tin chi tiết của 1 bài viết
 */
export async function getArticle(articleId: string): Promise<Article | null> {
  const articleRef = doc(db, "articles", articleId);
  const snap = await getDoc(articleRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Article;
}

/**
 * Lấy tất cả bài viết trong hệ thống
 */
export async function getAllArticles(): Promise<Article[]> {
  const articlesRef = collection(db, "articles");
  const q = query(articlesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
}

/**
 * Tăng số lượt xem của bài viết
 */
export async function incrementViews(articleId: string): Promise<void> {
  const articleRef = doc(db, "articles", articleId);
  await updateDoc(articleRef, {
    views: increment(1)
  });
}

/**
 * Thích hoặc Bỏ thích bài viết
 */
export async function toggleLikeArticle(articleId: string, uid: string, isLiked: boolean): Promise<void> {
  const articleRef = doc(db, "articles", articleId);
  await updateDoc(articleRef, {
    likes: isLiked ? arrayRemove(uid) : arrayUnion(uid)
  });
}

// ---------------------------------------------------------------------------
// Comments Helpers
// ---------------------------------------------------------------------------

/**
 * Thêm một bình luận dưới bài viết
 */
export async function addComment(
  articleId: string,
  userId: string,
  userName: string,
  userPhoto: string | undefined,
  text: string
): Promise<string> {
  const commentsRef = collection(db, "articles", articleId, "comments");
  const docRef = await addDoc(commentsRef, {
    userId,
    userName,
    userPhoto: userPhoto || "",
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Lấy danh sách bình luận dưới bài viết (sắp xếp theo thời gian tăng dần)
 */
export async function getComments(articleId: string): Promise<Comment[]> {
  const commentsRef = collection(db, "articles", articleId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
}
