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

export type CalendarScope = 'company' | 'group' | 'personal';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  scope: CalendarScope;
  groupId?: string;
  groupName?: string;
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
        scope: (data.scope as CalendarScope) || 'company',
        groupId: data.groupId || "",
        groupName: data.groupName || "",
        createdBy: data.createdBy || "unknown",
        creatorName: data.creatorName || "Unknown User",
        createdAt: data.createdAt?.toDate() || new Date(),
      } as CalendarEvent;
    });
    callback(events);
  });
};

/**
 * Cập nhật sự kiện hiện có
 */
export const updateCalendarEvent = async (id: string, updates: Partial<Omit<CalendarEvent, "id" | "createdAt">>) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, id);
    const dataToUpdate: any = { ...updates };
    
    if (updates.start) dataToUpdate.start = Timestamp.fromDate(updates.start);
    if (updates.end) dataToUpdate.end = Timestamp.fromDate(updates.end);

    await updateDoc(eventRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating event: ", error);
    throw error;
  }
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
