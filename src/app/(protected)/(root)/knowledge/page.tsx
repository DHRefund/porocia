"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getAllArticles, Article } from "@/lib/firebase/knowledge";
import { getAllGroups, Group } from "@/lib/firebase/members";
import { 
  Search, 
  Plus, 
  BookOpen, 
  Tag, 
  Clock, 
  Eye, 
  ThumbsUp, 
  Lock, 
  Shield, 
  FileText, 
  ChevronRight,
  User
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", name: "すべて", jpName: "すべて" },
  { id: "hr", name: "HR / General Affairs", jpName: "人事・総務" },
  { id: "tech", name: "Engineering / Technical", jpName: "開発・技術" },
  { id: "design", name: "Design", jpName: "デザイン" },
  { id: "onboarding", name: "Onboarding", jpName: "オンボーディング" },
  { id: "sales", name: "Sales & Marketing", jpName: "営業・マーケ" },
];

export default function KnowledgeBasePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  
  // Data States
  const [articles, setArticles] = useState<Article[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Load articles & groups
  useEffect(() => {
    async function loadData() {
      try {
        const [allArticles, allGroups] = await Promise.all([
          getAllArticles(),
          getAllGroups()
        ]);
        setArticles(allArticles);
        setGroups(allGroups);
      } catch (err) {
        console.error("Failed to load knowledge base:", err);
        toast.error("ナレッジベースの読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Determine user groups
  const userGroupIds = useMemo(() => {
    if (!user) return [];
    return groups
      .filter((g) => g.members.includes(user.uid))
      .map((g) => g.id);
  }, [groups, user]);

  const isAdmin = profile?.role === "admin";

  // Filter Articles based on permissions & inputs
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // 1. Permission Check
      if (!isAdmin) {
        if (article.scope === "admin") return false; // Admin only
        if (article.scope === "group") {
          const hasOverlap = article.allowedGroups?.some((gid) => userGroupIds.includes(gid));
          if (!hasOverlap) return false; // Restricted to other groups
        }
      }

      // 2. Category Filter
      if (selectedCategory !== "all" && article.category !== selectedCategory) {
        return false;
      }

      // 3. Search Query Filter
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.tags.some((t) => t.toLowerCase().includes(query));

      return matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery, userGroupIds, isAdmin]);

  // Read time helper
  const getReadTime = (content: string) => {
    const words = content.length; // rough character count for Japanese / English
    const minutes = Math.ceil(words / 400); // assume 400 chars/min reading speed
    return minutes > 0 ? minutes : 1;
  };

  // Date formatter
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="bg-[#faf8f4] min-h-[calc(100vh-5rem)] p-6 lg:p-12 text-near-black">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-near-black">ナレッジベース</h1>
            <p className="text-stone mt-2">社内の業務マニュアル、技術ガイド、規則などのドキュメントを閲覧できます。</p>
          </div>
          
          {/* Create Button (Visible to everyone, but writing permissions will check inside the route) */}
          <button
            onClick={() => router.push("/knowledge/new")}
            className="flex items-center gap-1.5 px-5 py-3 bg-terracotta hover:bg-[#bf5d3c] active:scale-[0.98] text-ivory rounded-2xl text-sm font-bold shadow-md shadow-terracotta/10 transition-all w-fit shrink-0"
          >
            <Plus size={16} />
            記事を作成
          </button>
        </div>

        {/* Outer Split Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar - Categories List */}
          <div className="w-full lg:w-64 bg-white border border-cream rounded-3xl p-5 shadow-sm space-y-2 shrink-0">
            <h3 className="text-xs font-bold text-stone uppercase tracking-widest px-2 mb-3">カテゴリー</h3>
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 lg:shrink text-left w-auto lg:w-full",
                      isActive
                        ? "bg-terracotta text-white shadow-sm"
                        : "text-stone hover:bg-cream/40 hover:text-near-black"
                    )}
                  >
                    <span>{cat.jpName}</span>
                    <ChevronRight size={13} className={cn("hidden lg:block opacity-60", isActive && "text-white")} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Panel */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Search Input bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/50 w-5 h-5" />
              <input
                type="text"
                placeholder="記事のタイトル、概要、タグで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-white border border-cream rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black transition-all text-sm font-medium shadow-sm placeholder:text-stone/40"
              />
            </div>

            {/* List layout */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white border border-cream rounded-3xl p-6 h-56 animate-pulse space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-cream rounded w-1/4" />
                      <div className="h-6 bg-cream rounded w-3/4" />
                    </div>
                    <div className="h-12 bg-cream rounded-xl" />
                    <div className="flex items-center justify-between pt-4 border-t border-cream/50">
                      <div className="h-6 w-16 bg-cream rounded" />
                      <div className="h-6 w-16 bg-cream rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-20 bg-white border border-cream rounded-3xl p-8 max-w-md mx-auto shadow-sm">
                <BookOpen className="w-12 h-12 text-stone/30 mx-auto mb-4" />
                <h3 className="font-bold text-near-black">ドキュメントが見つかりません</h3>
                <p className="text-stone text-sm mt-1.5">検索ワードを変更するか、別のカテゴリーを選択してください。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.map((article) => {
                  const readTime = getReadTime(article.content);
                  const isPrivate = article.scope === "group";
                  const isAdminOnly = article.scope === "admin";
                  
                  const catInfo = CATEGORIES.find(c => c.id === article.category);

                  return (
                    <div
                      key={article.id}
                      onClick={() => router.push(`/knowledge/${article.id}`)}
                      className="bg-white border border-cream rounded-[28px] p-6 shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-terracotta/20 transition-all duration-300 flex flex-col justify-between cursor-pointer group h-[260px]"
                    >
                      {/* Top Header Card Info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          {/* Category Badge */}
                          <span className="px-2.5 py-0.5 bg-[#f0ede6] border border-cream text-stone text-[10px] font-bold rounded-md">
                            {catInfo?.jpName || article.category}
                          </span>

                          {/* Visibility badge */}
                          {isAdminOnly && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-600 border border-red-200">
                              <Shield size={10} />
                              管理者のみ
                            </span>
                          )}
                          {isPrivate && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Lock size={10} />
                              限定公開
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-near-black text-lg line-clamp-1 group-hover:text-terracotta transition-colors">
                          {article.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-xs text-stone/80 line-clamp-3 min-h-[48px] leading-relaxed">
                          {article.summary || article.content.substring(0, 100) + "..."}
                        </p>
                      </div>

                      {/* Bottom Meta Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-cream/50 shrink-0">
                        {/* Author info */}
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-cream border border-cream overflow-hidden flex items-center justify-center text-[10px] font-bold text-stone">
                            {article.authorPhoto ? (
                              <img src={article.authorPhoto} alt={article.authorName} className="w-full h-full object-cover" />
                            ) : (
                              <User size={12} className="text-stone/60" />
                            )}
                          </div>
                          <span className="text-[10px] text-stone font-bold truncate max-w-[80px]">
                            {article.authorName}
                          </span>
                          <span className="text-[10px] text-stone/50">
                            {formatDate(article.createdAt)}
                          </span>
                        </div>

                        {/* Stats block */}
                        <div className="flex items-center gap-3 text-stone text-[10px] font-bold">
                          <span className="flex items-center gap-1" title="読む時間">
                            <Clock size={11} className="text-stone/60" />
                            {readTime}分
                          </span>
                          <span className="flex items-center gap-1" title="閲覧数">
                            <Eye size={11} className="text-stone/60" />
                            {article.views}
                          </span>
                          <span className="flex items-center gap-1" title="いいね数">
                            <ThumbsUp size={10} className="text-stone/60" />
                            {article.likes?.length ?? 0}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
