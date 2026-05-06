import { ReactNode, Suspense } from "react";
import { Sidebar } from "@/components/chat/sidebar";
import { getChannelsServer } from "@/lib/firebase/chat-server";

export default async function ChatLayout({ children }: { children: ReactNode }) {
  // Fetch channels trên server để có Instant Navigation
  const channelsPromise = getChannelsServer();

  return (
    <main className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-background">
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarWrapper channelsPromise={channelsPromise} />
      </Suspense>
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </main>
  );
}

async function SidebarWrapper({ channelsPromise }: { channelsPromise: Promise<any[]> }) {
  const channels = await channelsPromise;
  return <Sidebar initialChannels={channels} />;
}

function SidebarSkeleton() {
  return (
    <div className="w-64 border-r border-warm bg-ivory flex flex-col h-full animate-pulse">
      <div className="p-4 border-b border-warm/20">
        <div className="h-6 w-24 bg-cream rounded" />
      </div>
      <div className="flex-1 p-3 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-full bg-cream rounded-md" />
        ))}
      </div>
    </div>
  );
}
