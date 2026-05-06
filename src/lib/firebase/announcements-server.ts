import 'server-only';
import { adminDb } from './server';
import { Announcement } from './announcements';

export async function getAnnouncementsServer() {
  try {
    const snapshot = await adminDb
      .collection('announcements')
      .orderBy('isPinned', 'desc')
      .orderBy('createdAt', 'desc')
      .limit(3) // Lấy đúng 3 cái cho Bento luôn
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Chuyển đổi Firestore Timestamp sang JS Date hoặc string để an toàn khi pass qua Client nếu cần
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || null,
      } as unknown as Announcement;
    });
  } catch (error) {
    console.error("Error fetching announcements from Admin SDK:", error);
    throw error;
  }
}
