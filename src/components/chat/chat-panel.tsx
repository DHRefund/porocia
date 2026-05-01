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
    bottomRef,
  } = useChat(channelId, user, profile);

  if (authLoading || initializing) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-[--color-stone-gray]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[--color-border-warm] border-t-[--color-terracotta]" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden h-full relative">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-8 flex justify-center">
          {hasMore ? (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-full border border-[--color-border-cream] bg-[--color-ivory] px-6 py-2 text-xs font-semibold uppercase tracking-widest text-[--color-olive-gray] transition-colors hover:bg-[--color-border-cream] disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load older"}
            </button>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-widest text-[--color-stone-gray]">
              Beginning of channel
            </span>
          )}
        </div>

        <div className="space-y-8">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              msg={msg}
              isMine={msg.senderId === user?.uid}
              channelId={channelId}
              currentUserId={user?.uid}
            />
          ))}
        </div>

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 bg-background/95 backdrop-blur-sm border-t border-[--color-border-cream] p-4">
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
