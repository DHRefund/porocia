"use client";

import { useState, useRef, useEffect } from "react";

import { useAuth } from "@/components/AuthProvider";
import { useChat } from "@/hooks/useChat";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";

interface ChatPanelProps {
  channelId: string;
}

export function ChatPanel({ channelId }: ChatPanelProps) {
  const { user, profile, loading: authLoading } = useAuth();

  const {
    messages,
    input,
    setInput,
    sending,
    loadingMore,
    initializing,
    hasMore,
    handleLoadMore,
    handleSend,
    markAsRead,
    bottomRef,
    topRef,
    scrollContainerRef,
    senderProfiles,
    replyingTo,
    setReplyingTo,
    handleToggleReaction,
  } = useChat(channelId, user, profile);

  const overscrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentOffsetRef = useRef(0);

  // Cleanup memory leak khi unmount
  useEffect(() => {
    return () => {
      if (overscrollTimeoutRef.current) {
        clearTimeout(overscrollTimeoutRef.current);
      }
    };
  }, []);

  // Logic Elastic Overscroll (Direct DOM Manipulation cho 60fps)
  const handleWheel = (e: React.WheelEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isAtTop = container.scrollTop <= 0;
    const isAtBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 2;

    if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
      // Tắt transition khi đang kéo để bám sát tay
      container.style.transition = "none";
      
      const resistance = 0.4;
      currentOffsetRef.current = Math.max(-60, Math.min(60, currentOffsetRef.current - e.deltaY * resistance));
      
      // Cập nhật trực tiếp vào CSS Variable
      container.style.setProperty("--overscroll-y", `${currentOffsetRef.current}px`);

      if (overscrollTimeoutRef.current) clearTimeout(overscrollTimeoutRef.current);
      overscrollTimeoutRef.current = setTimeout(() => {
        // Bật lại transition khi nảy về
        container.style.transition = "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        currentOffsetRef.current = 0;
        container.style.setProperty("--overscroll-y", "0px");
      }, 50);
    } else if (currentOffsetRef.current !== 0) {
      currentOffsetRef.current = 0;
      container.style.setProperty("--overscroll-y", "0px");
    }
  };

  // Nếu đang initializing hoặc chưa có auth, chúng ta trả về null 
  // để Suspense ở Page tiếp tục hiển thị Skeleton cho đến khi sẵn sàng.
  if (authLoading || initializing) {
    return null;
  }

  return (
    <div 
      className="flex w-full flex-1 flex-col overflow-hidden h-full relative"
      onWheel={handleWheel}
    >
      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ 
          transform: `translateY(var(--overscroll-y, 0px))`,
          overscrollBehavior: "contain"
        }}
      >
        <div className="mb-8 flex justify-center" ref={topRef}>
          {hasMore ? (
            <div className="flex items-center gap-2 text-stone">
               <div className="h-4 w-4 animate-spin rounded-full border-2 border-warm border-t-terracotta" />
               <span className="text-xs font-semibold uppercase tracking-widest">過去のメッセージを読み込み中...</span>
            </div>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-widest text-stone">
              これ以上、過去のメッセージはありません
            </span>
          )}
        </div>

        <div className="space-y-8">
          {(() => {
            const latestReads: Record<string, string> = {};
            messages.forEach((msg) => {
              (msg.readBy || []).forEach((uid) => {
                latestReads[uid] = msg.id;
              });
            });

            const getDateString = (timestamp: any) => {
              if (!timestamp?.toDate) return null;
              const date = timestamp.toDate();
              const month = date.toLocaleDateString("en-US", { month: "short" });
              const day = date.getDate();
              const year = date.getFullYear();
              const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
              return `${month} ${day}, ${year} (${weekday})`;
            };

            let lastDateString: string | null = null;

            return messages.flatMap((msg) => {
              const isMine = msg.senderId === user?.uid;
              const latestReadBy = (msg.readBy || []).filter(
                (uid) => latestReads[uid] === msg.id
              );

              const currentDateString = getDateString(msg.createdAt);
              const showDateSeparator = currentDateString && currentDateString !== lastDateString;
              if (showDateSeparator) {
                lastDateString = currentDateString;
              }

              const elements = [];

              if (showDateSeparator) {
                elements.push(
                  <div
                    key={`date-${currentDateString}`}
                    className="sticky top-2 z-10 mx-auto mb-4 mt-8 flex w-fit items-center justify-center rounded-full border border-cream bg-background/95 px-4 py-1.5 text-xs font-medium text-olive shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm first:mt-0"
                  >
                    {currentDateString}
                  </div>
                );
              }

              elements.push(
                <ChatBubble
                  key={msg.id}
                  msg={msg}
                  isMine={msg.senderId === user?.uid}
                  channelId={channelId}
                  currentUserId={user?.uid}
                  latestReadBy={latestReadBy}
                  currentUserProfile={isMine ? (profile as any) : senderProfiles[msg.senderId]}
                  onReply={setReplyingTo}
                  onToggleReaction={handleToggleReaction}
                />
              );

              return elements;
            });
          })()}
        </div>

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 bg-background/95 backdrop-blur-sm border-t border-cream">
        <ChatInput 
          input={input} 
          setInput={setInput} 
          handleSend={handleSend} 
          sending={sending}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
        />
      </div>
    </div>
  );
}
