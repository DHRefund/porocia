import { useState, useEffect, useRef } from "react";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import {
  ChatMessage,
  ensureMainChannel,
  getLatestMessages,
  getOlderMessages,
  listenLatestMessages,
  sendMessage,
} from "@/lib/firebase/chat";
import { User } from "firebase/auth";
import { UserProfile } from "@/components/auth-provider";

export function useChat(user: User | null, profile: UserProfile | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setInitializing(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      await ensureMainChannel(user.uid);

      const firstPage = await getLatestMessages();
      setMessages(firstPage.messages);
      setLastVisible(firstPage.lastVisible);
      setHasMore(firstPage.messages.length >= 20);
      setInitializing(false);
      initializedRef.current = true;

      unsubscribe = listenLatestMessages((latestMessages) => {
        setMessages((prev) => {
          const olderPart = prev.length > latestMessages.length 
            ? prev.slice(0, prev.length - latestMessages.length) 
            : [];
          const merged = [...olderPart, ...latestMessages];
          const uniqueMap = new Map(merged.map((msg) => [msg.id, msg]));
          return Array.from(uniqueMap.values());
        });
      });
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!initializedRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLoadMore = async () => {
    if (!lastVisible || loadingMore) return;

    try {
      setLoadingMore(true);
      const result = await getOlderMessages(lastVisible);

      setMessages((prev) => {
        const merged = [...result.messages, ...prev];
        const uniqueMap = new Map(merged.map((msg) => [msg.id, msg]));
        return Array.from(uniqueMap.values());
      });

      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    if (!user || !input.trim()) return;

    try {
      setSending(true);

      await sendMessage({
        text: input,
        senderId: user.uid,
        senderEmail: user.email || "",
        senderName: profile?.displayName || user.displayName || user.email?.split("@")[0] || "Unknown User",
      });

      setInput("");
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    sending,
    loadingMore,
    initializing,
    hasMore,
    handleLoadMore,
    handleSend,
    bottomRef,
  };
}
