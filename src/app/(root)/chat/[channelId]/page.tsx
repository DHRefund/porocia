import { Suspense } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { getChannelMetadataServer } from "@/lib/firebase/chat-server";
import { notFound } from "next/navigation";

export default async function ChannelPage({ 
  params 
}: { 
  params: Promise<{ channelId: string }> 
}) {
  const { channelId } = await params;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header + ChatPanel đều nằm trong dynamic stream, tránh lỗi PPR cache "not found" */}
      <Suspense fallback={<ChatPageSkeleton />}>
        <ChannelContent channelId={channelId} />
      </Suspense>
    </div>
  );
}

async function ChannelContent({ channelId }: { channelId: string }) {
  const channel = await getChannelMetadataServer(channelId);

  if (!channel) {
    notFound();
  }

  return (
    <>
      {/* Header */}
      <div className="flex h-16 items-center border-b border-warm/20 px-6 bg-background/95 backdrop-blur-sm z-20">
        <h3 className="text-sm font-bold tracking-widest uppercase text-near-black flex items-center gap-2">
          <span className="text-terracotta opacity-50">#</span>
          {channel.name}
        </h3>
        <p className="ml-4 text-[11px] text-stone truncate max-w-md hidden md:block">
          {channel.description}
        </p>
      </div>

      {/* Chat messages */}
      <Suspense fallback={<ChatPanelSkeleton />}>
        <ChatPanel channelId={channelId} />
      </Suspense>
    </>
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
