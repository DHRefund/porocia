import {
  addDoc,
  arrayUnion,
  arrayRemove,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  writeBatch,
  updateDoc,
  deleteField,
  QueryDocumentSnapshot,
  DocumentData,
  FieldValue,
} from "firebase/firestore";
import { db } from "./client";

export type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderPhotoURL?: string;
  type: "text";
  createdAt?: any;
  updatedAt?: any | null;
  /** UIDs who have read this message */
  readBy?: string[];
  /** uid → Firestore Timestamp when they read */
  readAt?: Record<string, any>;
  // Thêm trường replyTo
  replyTo?: {
    messageId: string;
    senderId: string;
    senderName: string;
    senderPhotoURL?: string;
    text: string;
  };
  // Thêm trường reactions: emoji -> [uids]
  reactions?: Record<string, string[]>;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  bio: string;
  role: string;
};

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Channel helpers
// ---------------------------------------------------------------------------

export async function ensureChannel(channelId: string, name: string, uid: string) {
  const channelRef = doc(db, "channels", channelId);
  const snap = await getDoc(channelRef);

  if (!snap.exists()) {
    await setDoc(channelRef, {
      name,
      description: `Channel ${name}`,
      type: "public",
      createdAt: serverTimestamp(),
      createdBy: uid,
      isArchived: false,
      members: [uid],
      unreadCount: {},
    });
  }
}

export async function createChannel(
  name: string,
  description: string,
  uid: string,
  type: "public" | "private" = "public"
): Promise<string> {
  const channelsRef = collection(db, "channels");
  const docRef = await addDoc(channelsRef, {
    name: name.trim(),
    description: description.trim() || `Channel ${name}`,
    type,
    createdAt: serverTimestamp(),
    createdBy: uid,
    isArchived: false,
    members: [uid],
    unreadCount: {},
  });
  return docRef.id;
}

export async function getChannels() {
  const channelsRef = collection(db, "channels");
  const q = query(channelsRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Real-time channel list — used by useChannels hook */
export function listenChannels(callback: (channels: DocumentData[]) => void) {
  const channelsRef = collection(db, "channels");
  const q = query(channelsRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ---------------------------------------------------------------------------
// Message helpers
// ---------------------------------------------------------------------------

export async function sendMessage(params: {
  channelId: string;
  text: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderPhotoURL?: string;
  replyTo?: {
    messageId: string;
    senderId: string;
    senderName: string;
    senderPhotoURL?: string;
    text: string; 
  };
}) {
  const { channelId, text, senderId, senderEmail, senderName, senderPhotoURL } = params;
  const trimmed = text.trim();
  if (!trimmed) return;

  const channelRef = doc(db, "channels", channelId);
  const channelSnap = await getDoc(channelRef);
  const currentMembers = (channelSnap.data()?.members ?? []) as string[];

  const batch = writeBatch(db);

  // Add the new message — sender is pre-marked as read
  const newMsgRef = doc(collection(db, "channels", channelId, "messages"));
  batch.set(newMsgRef, {
    text: trimmed,
    senderId,
    senderEmail,
    senderName,
    senderPhotoURL: senderPhotoURL || "",
    type: "text",
    createdAt: serverTimestamp(),
    updatedAt: null,
    readBy: [senderId],
    readAt: { [senderId]: serverTimestamp() },
    replyTo: params.replyTo || null,
  });

  // Register sender as a channel member (idempotent)
  batch.update(channelRef, { members: arrayUnion(senderId) });

  // Increment unread count for all OTHER current members
  const others = currentMembers.filter((uid) => uid !== senderId);
  if (others.length > 0) {
    const unreadUpdates: Record<string, FieldValue> = {};
    others.forEach((uid) => {
      unreadUpdates[`unreadCount.${uid}`] = increment(1);
    });
    batch.update(channelRef, unreadUpdates);
  }

  await batch.commit();
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

/** Real-time listener for latest messages (MVP: last PAGE_SIZE only) */
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

// ---------------------------------------------------------------------------
// Read Receipts
// ---------------------------------------------------------------------------

/**
 * Mark the latest message in a channel as read by the given user.
 * - Updates `readBy` / `readAt` on the latest message doc.
 * - Writes `users/{uid}/readState/{channelId}`.
 * - Resets `channels/{channelId}.unreadCount[uid]` to 0.
 */
export async function markChannelAsRead(channelId: string, uid: string) {
  const messagesRef = collection(db, "channels", channelId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);

  const channelRef = doc(db, "channels", channelId);
  const batch = writeBatch(db);

  if (!snapshot.empty) {
    const latestDoc = snapshot.docs[0];
    const latestData = latestDoc.data();
    const alreadyRead = (latestData.readBy as string[] | undefined)?.includes(uid);

    if (!alreadyRead) {
      // Mark message as read
      const msgRef = doc(db, "channels", channelId, "messages", latestDoc.id);
      batch.update(msgRef, {
        readBy: arrayUnion(uid),
        [`readAt.${uid}`]: serverTimestamp(),
      });

      // Update readState for user
      const readStateRef = doc(db, "users", uid, "readState", channelId);
      batch.set(readStateRef, {
        lastReadAt: serverTimestamp(),
        lastReadMessageId: latestDoc.id,
      });
    }
  }

  // Always reset unread counter
  batch.update(channelRef, { [`unreadCount.${uid}`]: 0 });

  await batch.commit();
}

/**
 * Subscribe to real-time read receipt updates for a single message.
 */
export function listenMessageReadReceipt(
  channelId: string,
  messageId: string,
  callback: (readBy: string[], readAt: Record<string, any>) => void
) {
  const msgRef = doc(db, "channels", channelId, "messages", messageId);
  return onSnapshot(msgRef, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    callback(data.readBy ?? [], data.readAt ?? {});
  });
}

/**
 * Fetch user profiles for a list of UIDs (used in ReadReceiptModal).
 */
export async function getUserProfiles(uids: string[]): Promise<UserProfile[]> {
  if (uids.length === 0) return [];
  const results = await Promise.all(
    uids.map(async (uid) => {
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) return null;
      return snap.data() as UserProfile;
    })
  );
  return results.filter((p): p is UserProfile => p !== null);
}

/**
 * Toggle a reaction on a message.
 */
export async function toggleMessageReaction(params: {
  channelId: string;
  messageId: string;
  uid: string;
  emoji: string;
  isRemoving: boolean;
}) {
  const { channelId, messageId, uid, emoji, isRemoving } = params;
  const msgRef = doc(db, "channels", channelId, "messages", messageId);

  if (isRemoving) {
    await setDoc(msgRef, {
      reactions: {
        [emoji]: arrayRemove(uid)
      }
    }, { merge: true });

    // Sau khi remove, kiểm tra nếu mảng rỗng thì xóa hẳn key khỏi map
    const snap = await getDoc(msgRef);
    const reactions = snap.data()?.reactions ?? {};
    if (reactions[emoji] && reactions[emoji].length === 0) {
      await updateDoc(msgRef, {
        [`reactions.${emoji}`]: deleteField()
      });
    }
  } else {
    await setDoc(msgRef, {
      reactions: {
        [emoji]: arrayUnion(uid)
      }
    }, { merge: true });
  }
}

/**
 * Đảm bảo tồn tại một Channel nhắn tin trực tiếp (DM) giữa hai người dùng
 */
export async function ensureDirectChannel(
  userA: { uid: string; displayName: string },
  userB: { uid: string; displayName: string }
): Promise<string> {
  const uids = [userA.uid, userB.uid].sort();
  const channelId = `dm_${uids[0]}_${uids[1]}`;
  
  const channelRef = doc(db, "channels", channelId);
  const snap = await getDoc(channelRef);
  
  if (!snap.exists()) {
    await setDoc(channelRef, {
      name: `${userA.displayName} & ${userB.displayName}`,
      description: `ダイレクトメッセージ (${userA.displayName} & ${userB.displayName})`,
      type: "dm",
      createdAt: serverTimestamp(),
      createdBy: userA.uid,
      isArchived: false,
      members: [userA.uid, userB.uid],
      unreadCount: {},
    });
  }
  return channelId;
}

/**
 * Thêm một thành viên vào Kênh chat
 */
export async function addChannelMember(channelId: string, memberUid: string) {
  const channelRef = doc(db, "channels", channelId);
  await updateDoc(channelRef, {
    members: arrayUnion(memberUid)
  });
}

/**
 * Xóa một thành viên khỏi Kênh chat
 */
export async function removeChannelMember(channelId: string, memberUid: string) {
  const channelRef = doc(db, "channels", channelId);
  await updateDoc(channelRef, {
    members: arrayRemove(memberUid),
    [`unreadCount.${memberUid}`]: deleteField()
  });
}