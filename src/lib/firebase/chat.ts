import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./client";

export type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  type: "text";
  createdAt?: any;
  updatedAt?: any | null;
};

const CHANNEL_ID = "main";
const PAGE_SIZE = 20;

export async function ensureMainChannel(uid: string) {
  const channelRef = doc(db, "channels", CHANNEL_ID);
  const snap = await getDoc(channelRef);

  if (!snap.exists()) {
    await setDoc(channelRef, {
      name: "general",
      description: "Main channel for all team members",
      createdAt: serverTimestamp(),
      createdBy: uid,
      isArchived: false,
    });
  }
}

export async function sendMessage(params: {
  text: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
}) {
  const { text, senderId, senderEmail, senderName } = params;
  const trimmed = text.trim();
  if (!trimmed) return;

  const messagesRef = collection(db, "channels", CHANNEL_ID, "messages");

  await addDoc(messagesRef, {
    text: trimmed,
    senderId,
    senderEmail,
    senderName,
    type: "text",
    createdAt: serverTimestamp(),
    updatedAt: null,
  });
}

export async function getLatestMessages() {
  const messagesRef = collection(db, "channels", CHANNEL_ID, "messages");
  const q = query(messagesRef, orderBy("createdAt", "desc"), limit(PAGE_SIZE));
  const snapshot = await getDocs(q);

  const messages = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<ChatMessage, "id">),
  }));

  return {
    messages: messages.reverse(),
    lastVisible: snapshot.docs[snapshot.docs.length - 1] ?? null,
  };
}

export async function getOlderMessages(
  lastVisible: QueryDocumentSnapshot<DocumentData>
) {
  const messagesRef = collection(db, "channels", CHANNEL_ID, "messages");
  const q = query(
    messagesRef,
    orderBy("createdAt", "desc"),
    startAfter(lastVisible),
    limit(PAGE_SIZE)
  );

  const snapshot = await getDocs(q);

  const messages = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<ChatMessage, "id">),
  }));

  return {
    messages: messages.reverse(),
    lastVisible: snapshot.docs[snapshot.docs.length - 1] ?? null,
    hasMore: snapshot.docs.length === PAGE_SIZE,
  };
}

/**
 * Nghe các tin nhắn mới nhất.
 * MVP: nghe page mới nhất thôi.
 */
export function listenLatestMessages(
  callback: (messages: ChatMessage[]) => void
) {
  const messagesRef = collection(db, "channels", CHANNEL_ID, "messages");
  const q = query(messagesRef, orderBy("createdAt", "desc"), limit(PAGE_SIZE));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ChatMessage, "id">),
    }));

    callback(messages.reverse());
  });
}