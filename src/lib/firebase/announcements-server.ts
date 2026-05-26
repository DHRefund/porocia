import 'server-only';
import { connection } from 'next/server';

import { adminDb } from './server';
import { Announcement } from './announcements';

export async function getAnnouncementsServer() {
  try {
    // IMPORTANT:
    // Tell Next.js this function depends on request/runtime data
    // to avoid static prerender issues with Firebase Admin SDK.
    await connection();

    const snapshot = await adminDb
      .collection('announcements')
      .orderBy('isPinned', 'desc')
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || null,
      } as unknown as Announcement;
    });
  } catch (error) {
    console.error('Error fetching announcements from Admin SDK:', error);
    throw error;
  }
}