import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";
import { db } from "./client";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  createdBy: string;
  creatorName: string;
  createdAt: Date;
}

const EVENTS_COLLECTION = "events";

/**
 * Thêm sự kiện mới vào Firestore
 */
export const addCalendarEvent = async (event: Omit<CalendarEvent, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...event,
      start: Timestamp.fromDate(event.start),
      end: Timestamp.fromDate(event.end),
      createdAt: Timestamp.now(),
      createdBy: event.createdBy,
      creatorName: event.creatorName,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding event: ", error);
    throw error;
  }
};

/**
 * Lắng nghe thay đổi sự kiện thời gian thực
 */
export const subscribeToEvents = (callback: (events: CalendarEvent[]) => void) => {
  const q = query(collection(db, EVENTS_COLLECTION), orderBy("start", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        start: data.start.toDate(),
        end: data.end.toDate(),
        type: data.type,
        createdBy: data.createdBy || "unknown",
        creatorName: data.creatorName || "Unknown User",
        createdAt: data.createdAt?.toDate() || new Date(),
      } as CalendarEvent;
    });
    callback(events);
  });
};

/**
 * Xóa sự kiện
 */
export const deleteCalendarEvent = async (id: string) => {
  try {
    await deleteDoc(doc(db, EVENTS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting event: ", error);
    throw error;
  }
};
