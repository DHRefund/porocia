"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useChannels } from "@/hooks/useChannels";
import { useAuth } from "@/components/AuthProvider";
import { Hash, User, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createChannel } from "@/lib/firebase/chat";
import { toast } from "sonner";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { channels, loading } = useChannels();
  const { user, profile } = useAuth();

  // Create Channel Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) {
      toast.warning("チャンネル名を入力してください。");
      return;
    }
    if (!user) {
      toast.error("ログインが必要です。");
      return;
    }

    setCreating(true);
    try {
      const channelId = await createChannel(
        newChannelName,
        newChannelDesc,
        user.uid
      );
      toast.success(`チャンネル「#${newChannelName}」を作成しました！`);
      
      // Reset form & close modal
      setNewChannelName("");
      setNewChannelDesc("");
      setIsModalOpen(false);

      // Auto navigate to new channel
      router.push(`/chat/${channelId}`);
    } catch (error) {
      console.error("Failed to create channel:", error);
      toast.error("チャンネルの作成に失敗しました。もう一度お試しください。");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-64 border-r border-warm bg-ivory flex flex-col h-full animate-pulse">
        <div className="p-4 border-b border-warm/20 flex justify-between items-center">
          <div className="h-6 w-24 bg-cream rounded" />
          <div className="h-6 w-6 bg-cream rounded-md" />
        </div>
        <div className="flex-1 p-3 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-full bg-cream rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-64 border-r border-warm bg-ivory flex flex-col h-full">
        {/* Sidebar Header with Plus Button */}
        <div className="p-4 border-b border-warm/20 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-widest uppercase text-near-black">Channels</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-1 hover:bg-cream rounded-md text-stone hover:text-near-black transition-colors"
            title="新しいチャンネルを作成"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {channels.length === 0 ? (
            <div className="text-sm text-stone p-2">No channels found.</div>
          ) : (
            channels.map((channel) => {
              const isActive = pathname === `/chat/${channel.id}`;
              const unreadCount: number =
                user?.uid ? (channel.unreadCount?.[user.uid] ?? 0) : 0;
              const hasUnread = unreadCount > 0;

              const isDM = channel.id.startsWith("dm_");
              const Icon = isDM ? User : Hash;

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
                  <Icon className="w-4 h-4 opacity-70 flex-shrink-0" />

                  {/* Channel name + unread badge */}
                  <span className="flex-1 truncate">{getChannelDisplayName()}</span>

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

      {/* Create Channel Modal popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-near-black/30 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content Card */}
          <div className="relative w-full max-w-md bg-background rounded-[32px] border border-cream shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-200 text-near-black">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-cream/40 rounded-full text-stone transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold font-heading mb-6 text-near-black">新しいチャンネルを作成</h3>
            
            <form onSubmit={handleCreateChannel} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone uppercase tracking-widest">チャンネル名</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/50 font-bold text-sm">#</span>
                  <input
                    type="text"
                    required
                    placeholder="例: プロジェクトa"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone uppercase tracking-widest">説明（任意）</label>
                <textarea
                  placeholder="このチャンネルの目的やトピックについて入力してください..."
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black text-sm font-medium transition-all leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-cream/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-cream text-stone hover:bg-cream/40 text-xs font-bold transition-all active:scale-[0.98]"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-terracotta text-ivory rounded-2xl text-xs font-bold hover:bg-[#bf5d3c] disabled:opacity-50 transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-lg shadow-terracotta/15"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      作成中...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      チャンネルを作成
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
