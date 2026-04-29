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

const PAGE_SIZE = 20;

export async function ensureChannel(channelId: string, name: string, uid: string) {
  const channelRef = doc(db, "channels", channelId);
  const snap = await getDoc(channelRef);

  if (!snap.exists()) {
    await setDoc(channelRef, {
      name,
      description: `Channel ${name}`,
      createdAt: serverTimestamp(),
      createdBy: uid,
      isArchived: false,
    });
  }
}

export async function getChannels() {
  const channelsRef = collection(db, "channels");
  const q = query(channelsRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function sendMessage(params: {
  channelId: string;
  text: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
}) {
  const { channelId, text, senderId, senderEmail, senderName } = params;
  const trimmed = text.trim();
  if (!trimmed) return;

  const messagesRef = collection(db, "channels", channelId, "messages");

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

export async function getLatestMessages(channelId: string) {
  const messagesRef = collection(db, "channels", channelId, "messages");
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
  channelId: string,
  lastVisible: QueryDocumentSnapshot<DocumentData>
) {
  const messagesRef = collection(db, "channels", channelId, "messages");
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
  channelId: string,
  callback: (messages: ChatMessage[]) => void
) {
  const messagesRef = collection(db, "channels", channelId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "desc"), limit(PAGE_SIZE));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ChatMessage, "id">),
    }));

    callback(messages.reverse());
  });
}