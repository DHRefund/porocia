"use client";

import { useEffect, useState } from "react";
import { 
  getAnnouncements, 
  deleteAnnouncement, 
  togglePinAnnouncement,
  Announcement 
} from "@/lib/firebase/announcements";
import { 
  Plus, 
  Pin, 
  Edit2, 
  Trash2, 
  Megaphone,
  MoreVertical,
  ExternalLink,
  Search,
  Filter
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("このお知らせを削除してもよろしいですか？")) {
      try {
        await deleteAnnouncement(id);
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      } catch (error) {
        alert("削除に失敗しました。");
      }
    }
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    try {
      await togglePinAnnouncement(id, currentPinned);
      setAnnouncements(prev => prev.map(a => 
        a.id === id ? { ...a, isPinned: !currentPinned } : a
      ).sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return 0;
      }));
    } catch (error) {
      alert("更新に失敗しました。");
    }
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-near-black">お知らせ管理</h1>
          <p className="text-stone mt-1">システム内のすべてのお知らせを表示、作成、管理します。</p>
        </div>
        <Link 
          href="/dashboard/announcements/new"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-terracotta text-ivory rounded-xl font-bold shadow-lg shadow-terracotta/20 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-5 h-5" />
          新しいお知らせを投稿
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone" />
          <input 
            type="text" 
            placeholder="お知らせを検索..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-cream rounded-xl text-olive font-medium hover:bg-ivory transition-colors">
          <Filter className="w-4 h-4" />
          タイプでフィルター
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-cream rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-stone">データを読み込み中...</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center text-stone">お知らせが見つかりませんでした。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ivory/50 text-xs font-bold uppercase tracking-widest text-stone border-b border-cream">
                  <th className="px-6 py-4">お知らせ</th>
                  <th className="px-6 py-4">投稿日</th>
                  <th className="px-6 py-4">投稿者</th>
                  <th className="px-6 py-4">ステータス</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {filteredAnnouncements.map((a) => (
                  <tr key={a.id} className="hover:bg-ivory/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          a.type === 'info' ? "bg-blue-50 text-blue-600" :
                          a.type === 'warning' ? "bg-amber-50 text-amber-600" :
                          a.type === 'success' ? "bg-emerald-50 text-emerald-600" :
                          "bg-terracotta/10 text-terracotta"
                        )}>
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-near-black flex items-center gap-2">
                            {a.title}
                            {a.isPinned && <Pin className="w-3.5 h-3.5 text-terracotta fill-terracotta" />}
                          </p>
                          <p className="text-xs text-stone truncate max-w-[200px]">{a.content}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-olive">
                        {a.createdAt ? format(a.createdAt.toDate(), "yyyy/MM/dd", { locale: ja }) : "..."}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm text-stone">{a.authorName}</td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        a.type === 'info' ? "bg-blue-100 text-blue-700" :
                        a.type === 'warning' ? "bg-amber-100 text-amber-700" :
                        a.type === 'success' ? "bg-emerald-100 text-emerald-700" :
                        "bg-rose-100 text-rose-700"
                      )}>
                        {a.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleTogglePin(a.id, a.isPinned)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            a.isPinned ? "text-terracotta bg-terracotta/10" : "text-stone hover:bg-cream"
                          )}
                          title={a.isPinned ? "ピン留めを解除" : "トップにピン留め"}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-stone hover:bg-cream rounded-lg transition-colors" title="編集">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(a.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" 
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility function (re-defined because I can't import from @/lib/utils in write_to_file easily if it's not exported)
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
