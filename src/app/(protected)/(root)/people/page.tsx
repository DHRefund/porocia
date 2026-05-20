"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getAllUsers, getAllGroups, UserProfile, Group } from "@/lib/firebase/members";
import { ensureDirectChannel } from "@/lib/firebase/chat";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Users, 
  MessageSquare, 
  Mail, 
  Calendar, 
  User, 
  Loader2, 
  X, 
  Shield,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PeopleDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Data States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("all");
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [chatStarting, setChatStarting] = useState<string | null>(null);

  // Fetch users and groups on load
  useEffect(() => {
    async function loadData() {
      try {
        const [allUsers, allGroups] = await Promise.all([
          getAllUsers(),
          getAllGroups()
        ]);
        setUsers(allUsers);
        setGroups(allGroups);
      } catch (err) {
        console.error("Failed to load directory data:", err);
        toast.error("メンバー一覧の読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Don't show current logged in user in standard directory to make it easier to see colleagues,
      // or keep them. In a standard directory it's very helpful to see colleagues, so hiding self or showing is fine.
      // Usually showing everyone is good, but let's hide self so we don't try to chat with ourselves!
      if (u.uid === user?.uid) return false;

      const matchesSearch = 
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedGroupId === "all") return matchesSearch;
      
      const targetGroup = groups.find((g) => g.id === selectedGroupId);
      const isMemberOfSelectedGroup = targetGroup?.members.includes(u.uid) ?? false;
      return matchesSearch && isMemberOfSelectedGroup;
    });
  }, [users, searchQuery, selectedGroupId, groups, user?.uid]);

  // Start direct chat helper
  const handleStartChat = async (targetUser: UserProfile) => {
    if (!user) {
      toast.error("チャットを開始するにはログインが必要です。");
      return;
    }
    
    setChatStarting(targetUser.uid);
    try {
      const userA = { uid: user.uid, displayName: user.displayName || "自分" };
      const userB = { uid: targetUser.uid, displayName: targetUser.displayName };
      
      const channelId = await ensureDirectChannel(userA, userB);
      toast.success(`${targetUser.displayName} さんとのチャットルームを開きます`);
      router.push(`/chat/${channelId}`);
    } catch (err) {
      console.error("Failed to start direct message:", err);
      toast.error("チャットの開始に失敗しました。");
    } finally {
      setChatStarting(null);
    }
  };

  // Extract initials for fallback avatars
  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Helper to get user's groups
  const getUserGroups = (userId: string) => {
    return groups.filter((g) => g.members.includes(userId));
  };

  return (
    <div className="bg-[#faf8f4] min-h-[calc(100vh-5rem)] p-6 lg:p-12 text-near-black">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-near-black">メンバー</h1>
            <p className="text-stone mt-2">社内メンバーのプロフィール閲覧や直接チャットを開始できます。</p>
          </div>
          <div className="flex items-center gap-2 text-stone text-sm bg-cream/40 border border-cream px-4 py-2 rounded-2xl w-fit">
            <Users size={16} className="text-terracotta" />
            <span className="font-bold">{users.length - 1 > 0 ? users.length - 1 : 0}</span> 人の同僚
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between border-b border-cream/50 pb-6">
          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/50 w-5 h-5" />
            <input
              type="text"
              placeholder="名前またはメールアドレスで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-cream rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black transition-all text-sm font-medium shadow-sm placeholder:text-stone/40"
            />
          </div>

          {/* Group Filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedGroupId("all")}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200",
                selectedGroupId === "all"
                  ? "bg-terracotta border-transparent text-white shadow-sm"
                  : "bg-white border-cream text-stone hover:bg-cream/40"
              )}
            >
              すべて
            </button>
            {groups.map((group) => {
              const isActive = selectedGroupId === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200",
                    isActive
                      ? "bg-terracotta border-transparent text-white shadow-sm"
                      : "bg-white border-cream text-stone hover:bg-cream/40"
                  )}
                >
                  {group.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-cream rounded-3xl p-6 h-56 animate-pulse space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-cream rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-cream rounded w-2/3" />
                    <div className="h-3 bg-cream rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-cream rounded-xl" />
                <div className="flex gap-2">
                  <div className="h-9 bg-cream rounded-xl flex-1" />
                  <div className="h-9 bg-cream rounded-xl flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white border border-cream rounded-3xl p-8 max-w-md mx-auto shadow-sm">
            <Users className="w-12 h-12 text-stone/30 mx-auto mb-4" />
            <h3 className="font-bold text-near-black">メンバーが見つかりません</h3>
            <p className="text-stone text-sm mt-1.5">検索条件を変更するか、別のグループを選択してください。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((colleague) => {
              const userGroups = getUserGroups(colleague.uid);
              const isUserAdmin = colleague.role === "admin";
              
              return (
                <div 
                  key={colleague.uid}
                  className="bg-white border border-cream rounded-3xl p-6 shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-terracotta/20 transition-all duration-300 flex flex-col justify-between h-[270px]"
                >
                  {/* Top Profile Card */}
                  <div>
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-cream border border-cream overflow-hidden shrink-0 flex items-center justify-center text-lg font-bold text-stone/70">
                        {colleague.photoURL ? (
                          <img src={colleague.photoURL} alt={colleague.displayName} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(colleague.displayName)
                        )}
                      </div>
                      
                      {/* Name & Role */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-near-black text-base truncate flex items-center gap-1.5">
                          {colleague.displayName}
                          {isUserAdmin && (
                            <span title="管理者">
                              <Shield className="w-3.5 h-3.5 text-terracotta fill-terracotta/10 shrink-0" />
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-stone truncate mt-0.5">{colleague.email}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-stone/80 line-clamp-2 mt-4 min-h-[32px] italic leading-relaxed">
                      {colleague.bio ? `「${colleague.bio}」` : "自己紹介は登録されていません。"}
                    </p>
                  </div>

                  {/* Badges & Actions */}
                  <div className="space-y-4">
                    {/* Groups badgse */}
                    <div className="flex flex-wrap gap-1.5 overflow-hidden h-[24px]">
                      {userGroups.length === 0 ? (
                        <span className="text-[10px] text-stone/40 italic">所属グループなし</span>
                      ) : (
                        userGroups.map((g) => (
                          <span 
                            key={g.id}
                            className="px-2 py-0.5 bg-[#f0ede6] border border-cream text-stone text-[10px] font-bold rounded-md"
                          >
                            {g.name}
                          </span>
                        ))
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2 border-t border-cream/50">
                      <button
                        onClick={() => setSelectedUser(colleague)}
                        className="flex-1 py-2 rounded-xl border border-cream hover:bg-cream/40 text-stone text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                      >
                        <FileText size={13} />
                        詳細
                      </button>
                      <button
                        onClick={() => handleStartChat(colleague)}
                        disabled={chatStarting === colleague.uid}
                        className="flex-1 py-2 bg-terracotta text-ivory rounded-xl text-xs font-bold hover:bg-[#bf5d3c] disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-md shadow-terracotta/10"
                      >
                        {chatStarting === colleague.uid ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <>
                            <MessageSquare size={13} />
                            チャット
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Colleague Profile Details Modal ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-near-black/30 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          />

          {/* Modal content */}
          <div className="relative w-full max-w-md bg-background rounded-[32px] border border-cream shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Banner block */}
            <div className="h-24 bg-gradient-to-r from-cream via-ivory to-cream border-b border-cream/50" />
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full text-stone transition-all shadow-sm border border-cream/50"
            >
              <X size={16} />
            </button>

            <div className="px-8 pb-8 pt-0 relative">
              {/* Overlapping Avatar */}
              <div className="w-20 h-20 rounded-3xl bg-white border-2 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center text-2xl font-bold text-stone/80 absolute -top-10 left-8">
                {selectedUser.photoURL ? (
                  <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  getInitials(selectedUser.displayName)
                )}
              </div>

              {/* Identity & Basic Info */}
              <div className="pt-14 space-y-6">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-near-black flex items-center gap-2">
                    {selectedUser.displayName}
                    {selectedUser.role === "admin" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-terracotta/10 text-terracotta border border-terracotta/20">
                        <Shield size={10} />
                        管理者
                      </span>
                    )}
                  </h2>
                  <p className="text-stone text-xs mt-1.5 flex items-center gap-1.5">
                    <Mail size={13} className="text-stone/60" />
                    {selectedUser.email}
                  </p>
                </div>

                {/* Biography */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-stone uppercase tracking-widest">自己紹介 (Bio)</p>
                  <div className="p-4 bg-ivory/40 border border-cream rounded-2xl text-stone text-sm leading-relaxed min-h-[60px] italic">
                    {selectedUser.bio ? selectedUser.bio : "自己紹介文は未登録です。"}
                  </div>
                </div>

                {/* Groups */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-stone uppercase tracking-widest">所属グループ (Groups)</p>
                  <div className="flex flex-wrap gap-2">
                    {getUserGroups(selectedUser.uid).length === 0 ? (
                      <span className="text-xs text-stone/50 italic">グループに所属していません</span>
                    ) : (
                      getUserGroups(selectedUser.uid).map((g) => (
                        <span 
                          key={g.id}
                          className="px-3 py-1 bg-[#f0ede6] border border-cream text-stone text-xs font-bold rounded-lg"
                        >
                          {g.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-cream/50 justify-end">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-5 py-2.5 rounded-2xl border border-cream text-stone hover:bg-cream/40 text-xs font-bold transition-all active:scale-[0.98]"
                  >
                    閉じる
                  </button>
                  <button
                    onClick={() => {
                      const u = selectedUser;
                      setSelectedUser(null);
                      handleStartChat(u);
                    }}
                    className="px-6 py-2.5 bg-terracotta text-ivory rounded-2xl text-xs font-bold hover:bg-[#bf5d3c] transition-all active:scale-[0.98] flex items-center gap-2 shadow-lg shadow-terracotta/15 animate-in fade-in"
                  >
                    <MessageSquare size={13} />
                    チャットを開始
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
