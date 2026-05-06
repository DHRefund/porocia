import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  getDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot 
} from "firebase/firestore";
import { db } from "./client";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "event";
  imageURL?: string | null;
  authorId: string;
  authorName: string;
  isPinned: boolean;
  reactions?: Record<string, string[]>; // { "heart": ["uid1", "uid2"], "like": [] }
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface AnnouncementComment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string | null;
  createdAt: Timestamp;
}

export async function createAnnouncement(data: Omit<Announcement, "id" | "createdAt" | "updatedAt">) {
  const coll = collection(db, "announcements");
  const docRef = await addDoc(coll, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAnnouncements() {
  const coll = collection(db, "announcements");
  const q = query(coll, orderBy("isPinned", "desc"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
}

export async function updateAnnouncement(id: string, data: Partial<Announcement>) {
  const docRef = doc(db, "announcements", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAnnouncement(id: string) {
  const docRef = doc(db, "announcements", id);
  await deleteDoc(docRef);
}

export async function togglePinAnnouncement(id: string, currentPinned: boolean) {
  const docRef = doc(db, "announcements", id);
  await updateDoc(docRef, {
    isPinned: !currentPinned,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleReaction(announcementId: string, userId: string) {
  const docRef = doc(db, "announcements", announcementId);
  const { arrayUnion, arrayRemove, getDoc } = await import("firebase/firestore");
  
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  const likes = data?.likes || [];
  
  if (likes.includes(userId)) {
    await updateDoc(docRef, {
      likes: arrayRemove(userId),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(docRef, {
      likes: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function getCommentCount(announcementId: string) {
  const coll = collection(db, "announcements", announcementId, "comments");
  const { getCountFromServer } = await import("firebase/firestore");
  const snapshot = await getCountFromServer(coll);
  return snapshot.data().count;
}

export async function addComment(announcementId: string, comment: Omit<AnnouncementComment, "id" | "createdAt">) {
  const coll = collection(db, "announcements", announcementId, "comments");
  await addDoc(coll, {
    ...comment,
    createdAt: serverTimestamp(),
  });
}

export function listenComments(announcementId: string, callback: (comments: AnnouncementComment[]) => void) {
  const coll = collection(db, "announcements", announcementId, "comments");
  const q = query(coll, orderBy("createdAt", "asc"));
  
  return onSnapshot(q, (snapshot: any) => {
    const comments = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    } as AnnouncementComment));
    callback(comments);
  });
}
