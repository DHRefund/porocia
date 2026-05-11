import 'server-only';
import { adminDb } from './server';
import { cacheLife } from 'next/cache';

export type Channel = {
  id: string;
  name: string;
  description: string;
  members: string[];
  unreadCount: Record<string, number>;
  createdAt: any;
};

/**
 * Fetch danh sách channels trên Server.
 * Loại bỏ "use cache" để tránh cache nhầm kết quả lỗi trên Vercel.
 */
export async function getChannelsServer() {
  try {
    const snapshot = await adminDb
      .collection('channels')
      .orderBy('createdAt', 'asc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    } as Channel));
  } catch (error) {
    console.error("Error fetching channels from Admin SDK:", error);
    return [];
  }
}

/**
 * Fetch thông tin chi tiết của một Channel.
 * Bỏ "use cache" để đảm bảo tính chính xác, tránh lỗi 404 giả do cache trên Vercel.
 */
export async function getChannelMetadataServer(channelId: string) {
  try {
    const doc = await adminDb.collection('channels').doc(channelId).get();
    if (!doc.exists) {
      console.warn(`Channel with ID ${channelId} not found in Firestore.`);
      return null;
    }

    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
    } as Channel;
  } catch (error) {
    console.error("Error fetching channel metadata for:", channelId, error);
    // Trả về null để trigger notFound() ở page, nhưng không cache kết quả này
    return null;
  }
}
