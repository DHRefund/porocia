"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChannels } from "@/hooks/use-channels";
import { useAuth } from "@/components/auth-provider";
import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({ initialChannels = [] }: { initialChannels?: any[] }) {
  const pathname = usePathname();
  const { channels, loading } = useChannels(initialChannels);
  const { user } = useAuth();

  return (
    <div className="w-64 border-r border-warm bg-ivory flex flex-col h-full">
      <div className="p-4 border-b border-warm/20">
        <h2 className="text-lg font-bold tracking-widest uppercase">Channels</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {loading ? (
          <div className="text-sm text-stone p-2">Loading channels...</div>
        ) : channels.length === 0 ? (
          <div className="text-sm text-stone p-2">No channels found.</div>
        ) : (
          channels.map((channel) => {
            const isActive = pathname === `/chat/${channel.id}`;
            const unreadCount: number =
              user?.uid ? (channel.unreadCount?.[user.uid] ?? 0) : 0;
            const hasUnread = unreadCount > 0;

            return (
              <Link
                key={channel.id}
                href={`/chat/${channel.id}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                  isActive
                    ? "bg-terracotta text-white"
                    : "text-stone hover:bg-cream hover:text-near-black"
                )}
              >
                <Hash className="w-4 h-4 opacity-70 flex-shrink-0" />

                {/* Channel name + unread badge */}
                <span className="flex-1 truncate">{channel.name}</span>

                {hasUnread && (
                  <span className={cn(
                    "flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[11px] font-bold leading-none",
                    isActive
                      ? "bg-white/30 text-white"
                      : "bg-red-500 text-white"
                  )}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
