"use client";

import { useAuth } from "@/components/auth-provider";
import { useChat } from "@/hooks/use-chat";
import { ChatBubble } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";

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
  } = useChat(channelId, user, profile);

  if (authLoading || initializing) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-stone">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-warm border-t-terracotta" />
      </div>
    );
  }

  return (
    <div 
      className="flex w-full flex-1 flex-col overflow-hidden h-full relative"
      onClick={markAsRead}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-8 flex justify-center">
          {hasMore ? (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-full border border-cream bg-ivory px-6 py-2 text-xs font-semibold uppercase tracking-widest text-olive transition-colors hover:bg-cream disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load older"}
            </button>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-widest text-stone">
              Beginning of channel
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
                />
              );

              return elements;
            });
          })()}
        </div>

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 bg-background/95 backdrop-blur-sm border-t border-cream p-4">
        <ChatInput 
          input={input} 
          setInput={setInput} 
          handleSend={handleSend} 
          sending={sending} 
        />
      </div>
    </div>
  );
}
