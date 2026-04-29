"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChannels } from "@/hooks/use-channels";
import { Hash } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { channels, loading } = useChannels();

  return (
    <div className="w-64 border-r border-[--color-border-warm] bg-[--color-olive-black] text-[--color-ivory] flex flex-col h-full">
      <div className="p-4 border-b border-[--color-border-warm]/20">
        <h2 className="text-lg font-bold tracking-widest uppercase">Channels</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {loading ? (
          <div className="text-sm text-[--color-stone-gray] p-2">Loading channels...</div>
        ) : channels.length === 0 ? (
          <div className="text-sm text-[--color-stone-gray] p-2">No channels found.</div>
        ) : (
          channels.map((channel) => {
            const isActive = pathname === `/chat/${channel.id}`;
            return (
              <Link
                key={channel.id}
                href={`/chat/${channel.id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive 
                    ? "bg-[--color-terracotta] text-white" 
                    : "text-[--color-ivory]/80 hover:bg-[--color-olive-gray]/50 hover:text-[--color-ivory]"
                }`}
              >
                <Hash className="w-4 h-4 opacity-70" />
                {channel.name}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
