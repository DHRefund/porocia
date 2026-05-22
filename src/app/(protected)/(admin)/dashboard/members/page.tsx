"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { 
  getAllUsers, 
  updateUserRole, 
  getAllGroups, 
  createGroup, 
  updateGroupDetails, 
  deleteGroup, 
  addMemberToGroup, 
  removeMemberFromGroup,
  UserProfile,
  Group
} from "@/lib/firebase/members";
import { 
  Users, 
  Shield, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  FolderPlus, 
  X, 
  UserCheck, 
  Check, 
  ChevronRight,
  UserPlus,
  Eye,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function MembersDashboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"members" | "groups">("members");
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupFormName, setGroupFormName] = useState("");
  const [groupFormDesc, setGroupFormDesc] = useState("");
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false);
  const [viewingGroupMembers, setViewingGroupMembers] = useState<UserProfile[]>([]);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      const allGroups = await getAllGroups();
      setUsers(allUsers);
      setGroups(allGroups);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update user role
  const handleRoleChange = async (uid: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    
    // Prevent self-demotion
    if (uid === user?.uid) {
      toast.error("自分自身の管理者権限を解除することはできません。");
      return;
    }

    try {
      await updateUserRole(uid, newRole);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      toast.success("権限を更新しました", {
        description: `ユーザーの権限が ${newRole === "admin" ? "管理者" : "一般メンバー"} に変更されました。`
      });
    } catch (error) {
      toast.error("権限の更新に失敗しました");
    }
  };

  // Group creation & editing
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormName.trim()) {
      toast.error("グループ名を入力してください");
      return;
    }

    try {
      if (selectedGroup) {
        // Edit mode
        await updateGroupDetails(selectedGroup.id, groupFormName.trim(), groupFormDesc.trim());
        toast.success("グループを更新しました");
      } else {
        // Create mode
        if (!user) return;
        const newGroupId = await createGroup(groupFormName.trim(), groupFormDesc.trim(), user.uid);
        toast.success("グループを作成しました");
      }
      setIsGroupModalOpen(false);
      await fetchData();
    } catch (error) {
      toast.error("グループの保存に失敗しました");
    }
  };

  // Open edit group modal
  const openEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setGroupFormName(group.name);
    setGroupFormDesc(group.description);
    setIsGroupModalOpen(true);
  };

  // Open create group modal
  const openCreateGroup = () => {
    setSelectedGroup(null);
    setGroupFormName("");
    setGroupFormDesc("");
    setIsGroupModalOpen(true);
  };

  // Delete group
  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("このグループを削除してもよろしいですか？メンバーの所属も解除されます。")) return;

    try {
      await deleteGroup(groupId);
      toast.success("グループを削除しました");
      await fetchData();
    } catch (error) {
      toast.error("グループの削除に失敗しました");
    }
  };

  // Open user group assignment modal
  const openAssignGroups = (member: UserProfile) => {
    setSelectedUser(member);
    setIsAssignModalOpen(true);
  };

  // Check if user is in group
  const isUserInGroup = (uid: string, group: Group) => {
    return group.members.includes(uid);
  };

  // Toggle user group membership
  const handleToggleGroupMembership = async (group: Group) => {
    if (!selectedUser) return;
    const inGroup = isUserInGroup(selectedUser.uid, group);

    try {
      if (inGroup) {
        await removeMemberFromGroup(group.id, selectedUser.uid);
        toast.success(`${selectedUser.displayName} をグループ ${group.name} から削除しました`);
      } else {
        await addMemberToGroup(group.id, selectedUser.uid);
        toast.success(`${selectedUser.displayName} をグループ ${group.name} に追加しました`);
      }
      await fetchData();
    } catch (error) {
      toast.error("グループ所属の変更に失敗しました");
    }
  };

  // View group members
  const openViewGroupMembers = (group: Group) => {
    setSelectedGroup(group);
    const members = users.filter(u => group.members.includes(u.uid));
    setViewingGroupMembers(members);
    setIsViewMembersOpen(true);
  };

  // Remove member from group inside group view modal
  const handleRemoveMemberFromGroupView = async (memberUid: string) => {
    if (!selectedGroup) return;
    try {
      await removeMemberFromGroup(selectedGroup.id, memberUid);
      setViewingGroupMembers(prev => prev.filter(m => m.uid !== memberUid));
      toast.success("メンバーをグループから削除しました");
      await fetchData();
    } catch (error) {
      toast.error("メンバーの削除に失敗しました");
    }
  };

  // Filters
  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-near-black">メンバー & グループ管理</h1>
          <p className="text-stone mt-1">一般メンバーのロール変更や所属グループの割り当て、新規グループの作成が行えます。</p>
        </div>
        {activeTab === "groups" && (
          <button 
            onClick={openCreateGroup}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-terracotta text-ivory rounded-xl font-bold shadow-lg shadow-terracotta/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            グループを新規作成
          </button>
        )}
      </div>

      {/* ── Navigation Tabs & Search Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between border-b border-cream pb-4">
        <div className="flex bg-cream/30 p-1.5 rounded-xl border border-cream/50">
          <button
            onClick={() => { setActiveTab("members"); setSearchTerm(""); }}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "members"
                ? "bg-white text-near-black shadow-sm ring-1 ring-black/5"
                : "text-stone hover:text-near-black"
            )}
          >
            <Users className="w-4 h-4" />
            メンバー一覧 ({users.length})
          </button>
          <button
            onClick={() => { setActiveTab("groups"); setSearchTerm(""); }}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "groups"
                ? "bg-white text-near-black shadow-sm ring-1 ring-black/5"
                : "text-stone hover:text-near-black"
            )}
          >
            <FolderPlus className="w-4 h-4" />
            グループ管理 ({groups.length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
          <input 
            type="text" 
            placeholder={activeTab === "members" ? "ユーザー名、メールで検索..." : "グループ名、説明で検索..."}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-cream rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/10 transition-all text-near-black placeholder:text-stone/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Dashboard Content area ── */}
      {loading ? (
        <div className="bg-white border border-cream rounded-2xl p-16 text-center text-stone shadow-sm">
          <div className="h-8 w-8 border-4 border-terracotta border-t-transparent animate-spin rounded-full mx-auto mb-4" />
          データを読み込み中...
        </div>
      ) : activeTab === "members" ? (
        // ── Tab 1: Members List Table ──
        <div className="bg-white border border-cream rounded-2xl overflow-hidden shadow-sm">
          {filteredUsers.length === 0 ? (
            <div className="p-16 text-center text-stone">該当するメンバーが見つかりませんでした。</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ivory/50 text-[11px] font-bold uppercase tracking-wider text-stone border-b border-cream">
                    <th className="px-6 py-4">ユーザー</th>
                    <th className="px-6 py-4">所属グループ</th>
                    <th className="px-6 py-4">システムロール</th>
                    <th className="px-6 py-4 text-right">グループ割り当て</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream">
                  {filteredUsers.map((member) => {
                    // Find all groups this member belongs to
                    const memberGroups = groups.filter(g => g.members.includes(member.uid));
                    
                    return (
                      <tr key={member.uid} className="hover:bg-ivory/20 transition-colors group">
                        {/* Member identity */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-near-black text-ivory flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                              {member.photoURL ? (
                                <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                              ) : (
                                member.displayName.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-near-black truncate flex items-center gap-1.5">
                                {member.displayName}
                                {member.role === "admin" && (
                                  <span title="管理者">
                                    <Shield className="w-3.5 h-3.5 text-terracotta fill-terracotta/10" />
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-stone truncate max-w-[200px]">{member.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Groups member is in */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                            {memberGroups.length === 0 ? (
                              <span className="text-xs text-stone/40 italic">未割り当て</span>
                            ) : (
                              memberGroups.map(g => (
                                <span key={g.id} className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                  {g.name}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        {/* Role toggle button */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRoleChange(member.uid, member.role)}
                            className={cn(
                              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all border",
                              member.role === "admin"
                                ? "bg-terracotta/8 border-terracotta/20 text-terracotta"
                                : "bg-white border-cream text-stone hover:bg-cream/40"
                            )}
                          >
                            <Shield className="w-3 h-3" />
                            {member.role === "admin" ? "管理者" : "一般メンバー"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openAssignGroups(member)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cream/30 text-stone border border-cream rounded-xl text-xs font-bold hover:bg-cream/70 hover:text-near-black transition-colors"
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                            グループ設定
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // ── Tab 2: Groups Card Layout Grid ──
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.length === 0 ? (
            <div className="col-span-full bg-white border border-cream rounded-2xl p-16 text-center text-stone shadow-sm">
              該当するグループが見つかりませんでした。
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.id} className="bg-white border border-cream p-6 rounded-[24px] shadow-sm flex flex-col justify-between hover:shadow-md hover:border-cream/80 transition-all group">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-heading text-lg font-bold text-near-black leading-tight group-hover:text-terracotta transition-colors">{group.name}</h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {group.members.length} 人
                    </span>
                  </div>
                  <p className="text-xs text-stone mt-2.5 line-clamp-2 min-h-[2rem] leading-relaxed">
                    {group.description || "説明はありません。"}
                  </p>
                </div>

                <div className="border-t border-cream/50 mt-6 pt-4 flex items-center justify-between">
                  <button
                    onClick={() => openViewGroupMembers(group)}
                    className="flex items-center gap-1.5 text-xs font-bold text-stone hover:text-near-black transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone" />
                    メンバーを表示
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditGroup(group)}
                      className="p-2 text-stone hover:bg-cream rounded-lg transition-all"
                      title="グループ詳細の編集"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      title="グループの削除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Modal 1: Create or Edit Group Modal ── */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-near-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsGroupModalOpen(false)} />
          <div className="relative w-full max-w-md bg-background border border-cream shadow-2xl rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-5 border-b border-cream">
              <h2 className="font-heading text-lg font-bold text-near-black">
                {selectedGroup ? "グループを編集" : "新しいグループ"}
              </h2>
              <button onClick={() => setIsGroupModalOpen(false)} className="p-1.5 hover:bg-cream rounded-full text-stone transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveGroup} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone uppercase tracking-wider px-0.5">グループ名</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="例: 開発チーム, 営業部"
                  className="w-full bg-ivory/30 border border-cream rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black placeholder:text-stone/40"
                  value={groupFormName}
                  onChange={(e) => setGroupFormName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone uppercase tracking-wider px-0.5">グループの説明</label>
                <textarea
                  placeholder="グループの目的や役割について説明を追加..."
                  rows={3}
                  className="w-full bg-ivory/30 border border-cream rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black placeholder:text-stone/40 resize-none leading-relaxed"
                  value={groupFormDesc}
                  onChange={(e) => setGroupFormDesc(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream/50">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-stone hover:text-near-black transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="bg-terracotta text-ivory px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-terracotta/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {selectedGroup ? "変更を保存" : "作成する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Assign Groups Modal for a Specific Member ── */}
      {isAssignModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-near-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsAssignModalOpen(false)} />
          <div className="relative w-full max-w-md bg-background border border-cream shadow-2xl rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-5 border-b border-cream">
              <div>
                <h2 className="font-heading text-lg font-bold text-near-black">グループの割り当て</h2>
                <p className="text-xs text-stone mt-0.5">{selectedUser.displayName} ({selectedUser.email})</p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="p-1.5 hover:bg-cream rounded-full text-stone transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-stone uppercase tracking-wider">所属するグループを選択:</p>
                {groups.length === 0 ? (
                  <div className="text-center py-6 text-stone border border-dashed border-cream rounded-xl text-sm">
                    グループが作成されていません。
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {groups.map(group => {
                      const belongs = isUserInGroup(selectedUser.uid, group);
                      return (
                        <button
                          key={group.id}
                          onClick={() => handleToggleGroupMembership(group)}
                          className={cn(
                            "w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 group/item",
                            belongs
                              ? "bg-blue-50/50 border-blue-200 text-blue-900"
                              : "bg-white border-cream text-stone hover:bg-cream/40"
                          )}
                        >
                          <div>
                            <span className="text-sm font-bold">{group.name}</span>
                            <span className="text-[10px] text-stone/40 block mt-0.5 line-clamp-1">{group.description || "説明なし"}</span>
                          </div>
                          
                          <div className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0",
                            belongs
                              ? "bg-blue-600 border-transparent text-white"
                              : "border-cream bg-white group-hover/item:border-stone/40"
                          )}>
                            {belongs && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-cream/50">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="bg-near-black text-ivory px-6 py-2.5 rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 3: View Group Members Detail Modal ── */}
      {isViewMembersOpen && selectedGroup && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-near-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsViewMembersOpen(false)} />
          <div className="relative w-full max-w-md bg-background border border-cream shadow-2xl rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-5 border-b border-cream">
              <div>
                <h2 className="font-heading text-lg font-bold text-near-black">{selectedGroup.name}</h2>
                <p className="text-xs text-stone mt-0.5">所属メンバーの一覧 ({viewingGroupMembers.length} 名)</p>
              </div>
              <button onClick={() => setIsViewMembersOpen(false)} className="p-1.5 hover:bg-cream rounded-full text-stone transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 space-y-4">
              {viewingGroupMembers.length === 0 ? (
                <div className="text-center py-8 text-stone border border-dashed border-cream rounded-2xl text-sm">
                  このグループにはまだメンバーが追加されていません。
                </div>
              ) : (
                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                  {viewingGroupMembers.map(member => (
                    <div key={member.uid} className="flex items-center justify-between bg-cream/10 border border-cream/30 p-3 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-near-black text-ivory flex items-center justify-center font-bold text-xs overflow-hidden flex-shrink-0 animate-in zoom-in-50">
                          {member.photoURL ? (
                            <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                          ) : (
                            member.displayName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-near-black truncate leading-none mb-1">{member.displayName}</p>
                          <p className="text-[10px] text-stone truncate leading-none">{member.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveMemberFromGroupView(member.uid)}
                        className="p-1.5 text-stone/50 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="グループから削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-cream/50">
                <button
                  onClick={() => setIsViewMembersOpen(false)}
                  className="bg-near-black text-ivory px-6 py-2.5 rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
