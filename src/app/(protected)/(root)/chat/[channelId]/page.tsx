"use client";

import { use } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useChannels } from "@/hooks/useChannels";
import { useAuth } from "@/components/AuthProvider";

export default function ChannelPage({ 
  params 
}: { 
  params: Promise<{ channelId: string }> 
}) {
  const { channelId } = use(params);
  const { channels, loading } = useChannels();
  const { user, profile } = useAuth();

  if (loading) {
    return <ChatPageSkeleton />;
  }

  const channel = channels.find(c => c.id === channelId);

  if (!channel) {
    return (
      <div className="flex h-full items-center justify-center text-stone">
        Channel not found
      </div>
    );
  }

  const isDM = channel.id.startsWith("dm_");
  const getChannelDisplayName = () => {
    if (!isDM) return channel.name;
    const parts = channel.name.split(" & ");
    if (parts.length === 2) {
      const myName = profile?.displayName || user?.email?.split("@")[0] || "";
      if (parts[0] === myName) return parts[1];
      if (parts[1] === myName) return parts[0];
    }
    return channel.name;
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-warm/20 px-6 bg-background/95 backdrop-blur-sm z-20">
        <h3 className="text-sm font-bold tracking-widest uppercase text-near-black flex items-center gap-2">
          <span className="text-terracotta opacity-50">{isDM ? "@" : "#"}</span>
          {getChannelDisplayName()}
        </h3>
        <p className="ml-4 text-[11px] text-stone truncate max-w-md hidden md:block">
          {isDM ? "ダイレクトメッセージ" : channel.description}
        </p>
      </div>

      {/* Chat messages */}
      <ChatPanel channelId={channelId} />
    </div>
  );
}

function ChatPageSkeleton() {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header skeleton */}
      <div className="flex h-16 items-center border-b border-warm/20 px-6 bg-background/95 backdrop-blur-sm z-20">
        <div className="h-4 w-32 bg-cream rounded animate-pulse" />
      </div>
      <ChatPanelSkeleton />
    </div>
  );
}

function ChatPanelSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6 animate-pulse overflow-hidden bg-background">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 items-start">
          <div className="h-10 w-10 rounded-full bg-cream shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-cream rounded" />
            <div className="h-12 w-full bg-cream rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
