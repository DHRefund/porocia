import { useState, useEffect } from "react";
import { listenMessageReadReceipt } from "@/lib/firebase/chat";
import { UserProfile } from "@/components/auth-provider";

interface ReadReceiptResult {
  readUsers: UserProfile[];
  unreadUsers: UserProfile[];
  readCount: number;
  loading: boolean;
}

/**
 * Real-time hook for read receipt data on a single message.
 * @param channelId  The channel this message belongs to.
 * @param messageId  The message document ID.
 * @param senderId   The message sender's UID — excluded from read/unread counts.
 * @param members    Full member list of the channel (UserProfile[]).
 */
export function useReadReceipt(
  channelId: string,
  messageId: string,
  senderId: string,
  members: UserProfile[]
): ReadReceiptResult {
  const [readBy, setReadBy] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId || !messageId) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenMessageReadReceipt(channelId, messageId, (rb) => {
      setReadBy(rb);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [channelId, messageId]);

  const others = members.filter((m) => m.uid !== senderId);
  const readUsers = others.filter((m) => readBy.includes(m.uid));
  const unreadUsers = others.filter((m) => !readBy.includes(m.uid));

  return {
    readUsers,
    unreadUsers,
    readCount: readUsers.length,
    loading,
  };
}
