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
 * Fetch danh sách channels trên Server với Cache.
 */
export async function getChannelsServer() {
  "use cache";
  cacheLife('default'); // Mặc định revalidate sau 15 phút, stale 5 phút

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
 * Dùng để render tiêu đề Chat Panel ngay trên Server.
 */
export async function getChannelMetadataServer(channelId: string) {
  "use cache";
  cacheLife('default');

  try {
    const doc = await adminDb.collection('channels').doc(channelId).get();
    if (!doc.exists) return null;

    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
    } as Channel;
  } catch (error) {
    console.error("Error fetching channel metadata:", error);
    return null;
  }
}
