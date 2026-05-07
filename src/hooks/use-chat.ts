import { useState, useEffect, useRef } from "react";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import {
  ensureChannel,
  getLatestMessages,
  getOlderMessages,
  listenLatestMessages,
  markChannelAsRead,
  sendMessage,
  getUserProfiles,
  toggleMessageReaction,
} from "@/lib/firebase/chat";
import { User } from "firebase/auth";
import { UserProfile } from "@/components/auth-provider";

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
  readBy?: string[];
  readAt?: Record<string, any>;
  // Thêm trường replyTo
  replyTo?: {
    messageId: string;
    senderName: string;
    text: string;
  };
  // Thêm trường reactions: emoji -> [uids]
  reactions?: Record<string, string[]>;
};

export function useChat(channelId: string, user: User | null, profile: UserProfile | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [senderProfiles, setSenderProfiles] = useState<Record<string, UserProfile>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);
  const lastScrollHeightRef = useRef<number>(0);
  const lastChannelIdRef = useRef<string | null>(null);
  const isScrollPreserveActive = useRef(false);

  useEffect(() => {
    if (!user || !channelId) {
      setInitializing(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    initializedRef.current = false;
    setInitializing(true);
    setMessages([]);

    const init = async () => {
      await ensureChannel(channelId, channelId, user.uid);

      const firstPage = await getLatestMessages(channelId);
      setMessages(firstPage.messages);
      setLastVisible(firstPage.lastVisible);
      setHasMore(firstPage.messages.length >= 20);
      setInitializing(false);
      
      // Mark channel as read khi mở phòng
      await markChannelAsRead(channelId, user.uid);

      const lastMessageIdRef = { 
        current: firstPage.messages.length > 0 ? firstPage.messages[firstPage.messages.length - 1].id : "" 
      };

      unsubscribe = listenLatestMessages(channelId, (latestMessages) => {
        setMessages((prev) => {
          const olderPart =
            prev.length > latestMessages.length
              ? prev.slice(0, prev.length - latestMessages.length)
              : [];
          const merged = [...olderPart, ...latestMessages];
          const uniqueMap = new Map(merged.map((msg) => [msg.id, msg]));
          const newMessages = Array.from(uniqueMap.values());
          return newMessages;
        });

        // Nếu có tin nhắn mới, kiểm tra xem có nên cuộn xuống không
        const lastMsg = latestMessages[latestMessages.length - 1];
        if (lastMsg) {
          const isNewMessage = lastMsg.id !== lastMessageIdRef.current;
          lastMessageIdRef.current = lastMsg.id;

          if (isNewMessage) {
            const isMine = lastMsg.senderId === user.uid;
            const container = scrollContainerRef.current;
            
            if (container) {
              const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
              if (isMine || isNearBottom) {
                setTimeout(() => {
                  bottomRef.current?.scrollIntoView({ behavior: isMine ? "smooth" : "auto" });
                }, 100);
              }
            }
          }
        }
      });
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, channelId]);

  // Cuộn xuống dưới cùng khi mới vào phòng hoặc đổi phòng (Initial Scroll)
  useEffect(() => {
    if (!initializing && messages.length > 0 && !initializedRef.current) {
      const scrollDown = () => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: "instant" as any });
          initializedRef.current = true;
        }
      };
      
      // Đợi một frame để đảm bảo DOM đã render xong
      requestAnimationFrame(() => {
        scrollDown();
        // Một số trường hợp cần thêm chút delay do ảnh hoặc nội dung chưa render hết
        setTimeout(scrollDown, 100);
      });
    }
  }, [initializing, messages, channelId]);

  // Logic giữ vị trí cuộn khi Load More
  useEffect(() => {
    if (loadingMore && scrollContainerRef.current) {
      lastScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
      isScrollPreserveActive.current = true;
    }
  }, [loadingMore]);

  useEffect(() => {
    if (
      !loadingMore &&
      isScrollPreserveActive.current &&
      lastScrollHeightRef.current > 0 &&
      scrollContainerRef.current
    ) {
      const newHeight = scrollContainerRef.current.scrollHeight;
      const heightDifference = newHeight - lastScrollHeightRef.current;
      scrollContainerRef.current.scrollTop = heightDifference;
      lastScrollHeightRef.current = 0;
      isScrollPreserveActive.current = false;
    }
  }, [messages, loadingMore]);

  // Logic Infinite Scroll
  useEffect(() => {
    if (!topRef.current || !hasMore || loadingMore || initializing) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [topRef.current, hasMore, loadingMore, initializing]);

  const handleLoadMore = async () => {
    if (!lastVisible || loadingMore) return;

    try {
      setLoadingMore(true);
      const result = await getOlderMessages(channelId, lastVisible);

      setMessages((prev) => {
        const merged = [...result.messages, ...prev];
        const uniqueMap = new Map(merged.map((msg) => [msg.id, msg]));
        return Array.from(uniqueMap.values());
      });

      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    if (!user || !input.trim()) return;

    try {
      setSending(true);
      await sendMessage({
        channelId,
        text: input,
        senderId: user.uid,
        senderEmail: user.email || "",
        senderName:
          profile?.displayName ||
          user.displayName ||
          user.email?.split("@")[0] ||
          "Unknown User",
        senderPhotoURL: profile?.photoURL || user.photoURL || "",
        // Đính kèm thông tin reply nếu có
        replyTo: replyingTo ? {
          messageId: replyingTo.id,
          senderName: replyingTo.senderName,
          text: replyingTo.text,
        } : undefined,
      });
      setInput("");
      setReplyingTo(null); // Reset trạng thái reply sau khi gửi
      
      // Cuộn xuống mượt sau khi gửi tin nhắn
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } finally {
      setSending(false);
    }
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!user || !channelId) return;
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;

    // 1. Tìm xem user đã có reaction nào trên tin nhắn này chưa
    let existingEmoji: string | null = null;
    if (msg.reactions) {
      for (const [e, uids] of Object.entries(msg.reactions)) {
        if (uids.includes(user.uid)) {
          existingEmoji = e;
          break;
        }
      }
    }

    try {
      // 2. Nếu đã có reaction và nó KHÁC với cái vừa bấm:
      // Gỡ cái cũ trước
      if (existingEmoji && existingEmoji !== emoji) {
        await toggleMessageReaction({
          channelId,
          messageId,
          uid: user.uid,
          emoji: existingEmoji,
          isRemoving: true,
        });
      }

      // 3. Thực hiện toggle cho cái vừa bấm
      const isRemoving = existingEmoji === emoji;
      await toggleMessageReaction({
        channelId,
        messageId,
        uid: user.uid,
        emoji,
        isRemoving,
      });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    }
  };

  const markAsRead = async () => {
    if (!user || !channelId || messages.length === 0) return;
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.senderId !== user.uid) {
      const hasRead = latestMessage.readBy?.includes(user.uid);
      if (!hasRead) {
        try {
          await markChannelAsRead(channelId, user.uid);
        } catch (error) {
          console.error("Failed to mark as read:", error);
        }
      }
    }
  };

  useEffect(() => {
    if (!initializedRef.current) return;
    if (document.hasFocus()) {
      markAsRead();
    }
  }, [messages]);

  useEffect(() => {
    const onFocus = () => {
      markAsRead();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, channelId, messages]);

  // Fetch profiles cho các sender
  useEffect(() => {
    if (messages.length === 0) return;
    const uids = Array.from(new Set(messages.map((m) => m.senderId)));
    const missingUids = uids.filter((uid) => !senderProfiles[uid]);
    
    if (missingUids.length === 0) return;

    const fetchProfiles = async () => {
      try {
        const profiles = await getUserProfiles(missingUids);
        setSenderProfiles((prev) => {
          const newMap = { ...prev };
          profiles.forEach((p) => {
            newMap[p.uid] = p;
          });
          return newMap;
        });
      } catch (error) {
        console.error("Failed to fetch sender profiles:", error);
      }
    };
    fetchProfiles();
  }, [messages, senderProfiles]);

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
    handleToggleReaction,
    markAsRead,
    bottomRef,
    topRef,
    scrollContainerRef,
    senderProfiles,
    replyingTo,
    setReplyingTo,
  };
}
