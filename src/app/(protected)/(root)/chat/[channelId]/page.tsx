"use client";

import { use, useState, useEffect, useMemo } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useChannels } from "@/hooks/useChannels";
import { useAuth } from "@/components/AuthProvider";
import { 
  Users, 
  X, 
  Plus, 
  Search, 
  UserMinus, 
  Shield, 
  Loader2 
} from "lucide-react";
import { 
  getUserProfiles, 
  addChannelMember, 
  removeChannelMember,
  UserProfile
} from "@/lib/firebase/chat";
import { getAllUsers } from "@/lib/firebase/members";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ChannelPage({ 
  params 
}: { 
  params: Promise<{ channelId: string }> 
}) {
  const { channelId } = use(params);
  const { channels, loading } = useChannels();
  const { user, profile } = useAuth();

  // Modal State
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [memberProfiles, setMemberProfiles] = useState<UserProfile[]>([]);
  const [allSystemUsers, setAllSystemUsers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [processingUid, setProcessingUid] = useState<string | null>(null);

  const channel = channels.find(c => c.id === channelId);

  // Fetch Member profiles and System users when modal opens or channel members array changes
  useEffect(() => {
    if (!isMembersModalOpen || !channel) return;

    async function loadMembersData() {
      setLoadingMembers(true);
      try {
        const uids = channel.members ?? [];
        const [profiles, systemUsers] = await Promise.all([
          getUserProfiles(uids),
          getAllUsers()
        ]);
        setMemberProfiles(profiles);
        setAllSystemUsers(systemUsers);
      } catch (err) {
        console.error("Failed to load channel members:", err);
        toast.error("メンバー情報の読み込みに失敗しました。");
      } finally {
        setLoadingMembers(false);
      }
    }

    loadMembersData();
  }, [isMembersModalOpen, channel?.members, channelId]);

  if (loading) {
    return <ChatPageSkeleton />;
  }

  if (!channel) {
    return (
      <div className="flex h-full items-center justify-center text-stone">
        Channel not found
      </div>
    );
  }

  const type = channel.type || (channel.id.startsWith("dm_") ? "dm" : "public");
  const isDM = type === "dm";
  const isPrivate = type === "private";

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

  // Filter lists based on tab & searchQuery
  const filteredMembersList = memberProfiles.filter((m) =>
    m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNonMembersList = allSystemUsers.filter((sysUser) => {
    // Cannot add self or someone who is already a member
    if (channel.members?.includes(sysUser.uid)) return false;
    
    return (
      sysUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sysUser.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Operations
  const handleAddMemberClick = async (targetUid: string, name: string) => {
    setProcessingUid(targetUid);
    try {
      await addChannelMember(channelId, targetUid);
      toast.success(`${name} さんをチャンネルに追加しました！`);
      
      // Update local state immediately to avoid layout flash
      setMemberProfiles((prev) => [
        ...prev,
        allSystemUsers.find((u) => u.uid === targetUid) as UserProfile
      ]);
    } catch (err) {
      console.error("Failed to add member:", err);
      toast.error("追加に失敗しました。");
    } finally {
      setProcessingUid(null);
    }
  };

  const handleRemoveMemberClick = async (targetUid: string, name: string) => {
    if (targetUid === channel.createdBy) {
      toast.warning("チャンネルの作成者は削除できません。");
      return;
    }

    setProcessingUid(targetUid);
    try {
      await removeChannelMember(channelId, targetUid);
      toast.success(`${name} さんをチャンネルから削除しました。`);
      
      // Update local state immediately
      setMemberProfiles((prev) => prev.filter((m) => m.uid !== targetUid));
    } catch (err) {
      console.error("Failed to remove member:", err);
      toast.error("削除に失敗しました。");
    } finally {
      setProcessingUid(null);
    }
  };

  // Check if current logged in user has rights to manage (is creator or admin)
  const canManageMembers = 
    channel.createdBy === user?.uid || 
    profile?.role === "admin";

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-warm/20 px-6 bg-background/95 backdrop-blur-sm z-20 shrink-0">
        <div className="flex items-center min-w-0">
          <h3 className="text-sm font-bold tracking-widest uppercase text-near-black flex items-center gap-2 truncate">
            <span className="text-terracotta opacity-50">
              {isDM ? "@" : isPrivate ? "🔒" : "#"}
            </span>
            {getChannelDisplayName()}
          </h3>
          <p className="ml-4 text-[11px] text-stone truncate max-w-md hidden md:block">
            {isDM 
              ? "ダイレクトメッセージ" 
              : isPrivate 
                ? `プライベートチャンネル — ${channel.description}` 
                : channel.description
            }
          </p>
        </div>

        {/* Member manager trigger button (Only for non-DM channels) */}
        {!isDM && (
          <button 
            onClick={() => {
              setActiveTab("list");
              setSearchQuery("");
              setIsMembersModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f0ede6]/60 border border-cream rounded-xl text-xs font-bold text-stone hover:text-near-black hover:bg-[#f0ede6] active:scale-[0.98] transition-all"
            title="メンバー管理"
          >
            <Users className="w-3.5 h-3.5 text-terracotta" />
            <span>{(channel.members ?? []).length}</span>
          </button>
        )}
      </div>

      {/* Chat messages */}
      <ChatPanel channelId={channelId} />

      {/* ── Channel Members Management Modal popup ── */}
      {isMembersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-near-black/30 backdrop-blur-sm"
            onClick={() => setIsMembersModalOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-background rounded-[32px] border border-cream shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-near-black flex flex-col h-[520px]">
            {/* Header section */}
            <div className="px-6 pt-6 pb-2 border-b border-cream/50 flex justify-between items-center bg-cream/10 shrink-0">
              <div>
                <h3 className="text-lg font-bold font-heading text-near-black">チャンネルメンバー管理</h3>
                <p className="text-[11px] text-stone">#{channel.name} に所属するメンバー</p>
              </div>
              <button
                onClick={() => setIsMembersModalOpen(false)}
                className="p-1.5 hover:bg-cream rounded-full text-stone transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab selection */}
            <div className="px-6 pt-3 flex gap-2 border-b border-cream/30 shrink-0 bg-cream/5">
              <button
                onClick={() => { setActiveTab("list"); setSearchQuery(""); }}
                className={cn(
                  "pb-2.5 px-2 text-xs font-bold transition-all border-b-2 text-stone",
                  activeTab === "list" 
                    ? "border-terracotta text-near-black" 
                    : "border-transparent hover:text-near-black"
                )}
              >
                メンバー一覧 ({(channel.members ?? []).length})
              </button>
              {canManageMembers && (
                <button
                  onClick={() => { setActiveTab("add"); setSearchQuery(""); }}
                  className={cn(
                    "pb-2.5 px-2 text-xs font-bold transition-all border-b-2 text-stone",
                    activeTab === "add" 
                      ? "border-terracotta text-near-black" 
                      : "border-transparent hover:text-near-black"
                  )}
                >
                  メンバーを追加
                </button>
              )}
            </div>

            {/* Search Input bar */}
            <div className="p-4 shrink-0 border-b border-cream/30 bg-ivory/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder={activeTab === "list" ? "メンバーを検索..." : "追加する同僚を検索..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black text-xs font-medium"
                />
              </div>
            </div>

            {/* List area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf8f4]">
              {loadingMembers ? (
                <div className="flex flex-col items-center justify-center h-full text-stone space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
                  <p className="text-xs">読み込み中...</p>
                </div>
              ) : activeTab === "list" ? (
                /* Tab 1: Member list */
                filteredMembersList.length === 0 ? (
                  <div className="text-center py-10 text-stone text-xs">メンバーが見つかりません。</div>
                ) : (
                  filteredMembersList.map((m) => {
                    const isCreator = m.uid === channel.createdBy;
                    const canRemove = canManageMembers && !isCreator && m.uid !== user?.uid;
                    
                    return (
                      <div key={m.uid} className="flex items-center justify-between p-3 bg-white border border-cream rounded-2xl shadow-sm hover:border-cream/80 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-cream border border-cream overflow-hidden flex items-center justify-center text-xs font-bold text-stone/80 shrink-0">
                            {m.photoURL ? (
                              <img src={m.photoURL} alt={m.displayName} className="w-full h-full object-cover" />
                            ) : (
                              m.displayName.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-near-black truncate flex items-center gap-1.5">
                              {m.displayName}
                              {isCreator && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">作成者</span>
                              )}
                              {m.role === "admin" && (
                                <Shield className="w-3 h-3 text-terracotta" />
                              )}
                            </p>
                            <p className="text-[10px] text-stone truncate">{m.email}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        {canRemove && (
                          <button
                            onClick={() => handleRemoveMemberClick(m.uid, m.displayName)}
                            disabled={processingUid === m.uid}
                            className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-stone transition-all active:scale-95 disabled:opacity-50"
                            title="メンバーから削除"
                          >
                            {processingUid === m.uid ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserMinus size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })
                )
              ) : (
                /* Tab 2: Add member */
                filteredNonMembersList.length === 0 ? (
                  <div className="text-center py-10 text-stone text-xs">追加可能なユーザーはいません。</div>
                ) : (
                  filteredNonMembersList.map((nonMem) => (
                    <div key={nonMem.uid} className="flex items-center justify-between p-3 bg-white border border-cream rounded-2xl shadow-sm hover:border-cream/80 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-cream border border-cream overflow-hidden flex items-center justify-center text-xs font-bold text-stone/80 shrink-0">
                          {nonMem.photoURL ? (
                            <img src={nonMem.photoURL} alt={nonMem.displayName} className="w-full h-full object-cover" />
                          ) : (
                            nonMem.displayName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-near-black truncate flex items-center gap-1">
                            {nonMem.displayName}
                            {nonMem.role === "admin" && (
                              <Shield className="w-3 h-3 text-terracotta" />
                            )}
                          </p>
                          <p className="text-[10px] text-stone truncate">{nonMem.email}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleAddMemberClick(nonMem.uid, nonMem.displayName)}
                        disabled={processingUid === nonMem.uid}
                        className="flex items-center gap-1 px-3 py-1 bg-terracotta text-ivory rounded-xl text-[10px] font-bold hover:bg-[#bf5d3c] disabled:opacity-50 active:scale-[0.98] transition-all shadow-md shadow-terracotta/10"
                      >
                        {processingUid === nonMem.uid ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Plus size={11} />
                            追加
                          </>
                        )}
                      </button>
                    </div>
                  ))
                )
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-cream/50 bg-cream/10 flex justify-end shrink-0">
              <button
                onClick={() => setIsMembersModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-stone text-ivory text-xs font-bold hover:bg-stone/90 transition-all active:scale-[0.98]"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
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
