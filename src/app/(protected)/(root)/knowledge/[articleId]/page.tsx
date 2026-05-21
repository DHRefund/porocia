"use client";

import {use, useEffect, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { 
  getArticle, 
  incrementViews, 
  toggleLikeArticle, 
  deleteArticle,
  addComment, 
  getComments, 
  Article, 
  Comment 
} from "@/lib/firebase/knowledge";
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  ThumbsUp, 
  Trash2, 
  MessageSquare, 
  User, 
  Send,
  Loader2,
  Lock,
  Shield,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "hr", name: "人事・総 vụ", jpName: "人事・総務" },
  { id: "tech", name: "開発・技術", jpName: "開発・技術" },
  { id: "design", name: "デザイン", jpName: "デザイン" },
  { id: "onboarding", name: "オンボーディング", jpName: "オンボーディング" },
  { id: "sales", name: "営業・マーケ", jpName: "営業・マーケ" },
];

export default function ArticleDetailPage({ 
  params 
}: { 
  params: Promise<{ articleId: string }> 
}) {
  const { articleId } = use(params);
  const router = useRouter();
  const { user, profile } = useAuth();

  // Data States
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction States
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load article, increment views, load comments
  useEffect(() => {
    async function loadArticleData() {
      try {
        const docData = await getArticle(articleId);
        if (!docData) {
          toast.error("記事が見つかりませんでした。");
          router.push("/knowledge");
          return;
        }
        
        setArticle(docData);
        setLikesCount(docData.likes?.length ?? 0);
        if (user && docData.likes?.includes(user.uid)) {
          setLiked(true);
        }

        // Parallel fetch comments and increment views
        const [commentsData] = await Promise.all([
          getComments(articleId),
          incrementViews(articleId)
        ]);
        setComments(commentsData);
      } catch (err) {
        console.error("Failed to load article detail:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadArticleData();
    }
  }, [articleId, router, user]);

  const handleLikeToggle = async () => {
    if (!user || !article) return;
    
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      await toggleLikeArticle(articleId, user.uid, wasLiked);
    } catch (err) {
      console.error("Failed to toggle like:", err);
      // Revert state if failed
      setLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !user || !article) return;

    setSubmittingComment(true);
    try {
      const commentId = await addComment(
        articleId,
        user.uid,
        user.displayName || user.email?.split("@")[0] || "ユーザー",
        user.photoURL || undefined,
        newCommentText
      );

      // Instantly append to UI
      const newComment: Comment = {
        id: commentId,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "ユーザー",
        userPhoto: user.photoURL || "",
        text: newCommentText.trim(),
        createdAt: undefined // will show 'たった今' or similar locally
      };
      
      setComments(prev => [...prev, newComment]);
      setNewCommentText("");
      toast.success("コメントを投稿しました。");
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error("コメントの投稿に失敗しました。");
    } finally {
      setSubmittingComment(false);
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteArticle = async () => {
    // Open the confirmation dialog instead of native confirm
    setIsDeleteDialogOpen(true);
  };

  const performDelete = async () => {
    setDeleting(true);
    try {
      await deleteArticle(articleId);
      toast.success("記事を削除しました。");
      router.push("/knowledge");
    } catch (err) {
      console.error("Failed to delete article:", err);
      toast.error("削除に失敗しました。");
    } finally {
      setDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Simple custom markdown-like renderer helper
  const renderSimpleMarkdown = (text: string) => {
    if (!text) return null;
    
    // Check if the content has any common Markdown tokens (Headers, Bold, Lists)
    const hasMarkdown = /^\s*(#|\*|-|\d+\.)|\*\*/m.test(text);
    
    if (!hasMarkdown) {
      return (
        <div className="text-sm text-stone leading-relaxed whitespace-pre-wrap font-sans">
          {text}
        </div>
      );
    }
    
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // H1 Header
      if (line.startsWith("# ")) {
        return <h1 key={index} className="text-3xl font-bold font-heading mt-6 mb-4 pb-2 border-b border-cream">{line.substring(2)}</h1>;
      }
      // H2 Header
      if (line.startsWith("## ")) {
        return <h2 key={index} className="text-2xl font-bold font-heading mt-5 mb-3">{line.substring(3)}</h2>;
      }
      // H3 Header
      if (line.startsWith("### ")) {
        return <h3 key={index} className="text-xl font-bold font-heading mt-4 mb-2">{line.substring(4)}</h3>;
      }
      // Bullet Points
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={index} className="ml-6 list-disc text-stone py-1 text-sm">{line.substring(2)}</li>;
      }
      // Numbered List
      if (/^\d+\.\s/.test(line)) {
        const cleanText = line.replace(/^\d+\.\s/, "");
        return <li key={index} className="ml-6 list-decimal text-stone py-1 text-sm">{cleanText}</li>;
      }
      // Empty line
      if (line.trim() === "") {
        return <div key={index} className="h-3" />;
      }
      
      // Standard Paragraph (inline bold parse)
      return (
        <p key={index} className="text-sm text-stone leading-relaxed py-1.5">
          {line.split("**").map((part, pIdx) => {
            if (pIdx % 2 === 1) return <strong key={pIdx} className="font-extrabold text-near-black">{part}</strong>;
            return part;
          })}
        </p>
      );
    });
  };

  // Read time calculation
  const getReadTime = (content: string) => {
    const words = content.length;
    const minutes = Math.ceil(words / 400);
    return minutes > 0 ? minutes : 1;
  };

  // Date formatter
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "たった今";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="bg-[#faf8f4] min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center text-stone gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        <p className="text-xs">記事をロード中...</p>
      </div>
    );
  }

  if (!article) return null;

  const readTime = getReadTime(article.content);
  const catInfo = CATEGORIES.find(c => c.id === article.category);
  const isAuthorOrAdmin = user?.uid === article.createdBy || profile?.role === "admin";

  return (
    <div className="bg-[#faf8f4] min-h-[calc(100vh-5rem)] p-6 lg:p-12 text-near-black">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Button & Admin operations */}
        <div className="flex items-center justify-between border-b border-cream/50 pb-5">
          <button
            onClick={() => router.push("/knowledge")}
            className="flex items-center gap-2 text-stone hover:text-near-black transition-colors text-xs font-bold"
          >
            <ArrowLeft size={16} />
            ナレッジベースに戻る
          </button>

          {isAuthorOrAdmin && (
            <button
              onClick={handleDeleteArticle}
              disabled={deleting}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all disabled:opacity-50 active:scale-95 border border-red-200"
            >
              {deleting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              この記事を削除
            </button>
          )}
        </div>

        {/* Outer Grid Panel: Main body vs Meta metrics */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main article reader body */}
          <div className="flex-1 w-full space-y-8">
            <div className="bg-white border border-cream rounded-[32px] p-8 lg:p-10 shadow-sm space-y-6">
              
              {/* Header metrics info */}
              <div className="border-b border-cream/50 pb-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#f0ede6] border border-cream text-stone text-[10px] font-bold rounded-md">
                    {catInfo?.jpName || article.category}
                  </span>
                  
                  {article.scope === "admin" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-600 border border-red-200">
                      <Shield size={10} />
                      管理者のみ
                    </span>
                  )}
                  {article.scope === "group" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Lock size={10} />
                      限定公開
                    </span>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-extrabold font-heading text-near-black leading-tight">
                  {article.title}
                </h1>

                <p className="text-xs text-stone/80 bg-ivory/30 border border-cream rounded-xl p-4 italic leading-relaxed">
                  {article.summary}
                </p>

                {/* Author row info */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cream border border-cream overflow-hidden flex items-center justify-center text-xs font-bold text-stone">
                      {article.authorPhoto ? (
                        <img src={article.authorPhoto} alt={article.authorName} className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} className="text-stone/60" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-near-black">{article.authorName}</p>
                      <p className="text-[10px] text-stone mt-0.5">{formatDate(article.createdAt)} に公開</p>
                    </div>
                  </div>

                  {/* Read statistics */}
                  <div className="flex items-center gap-3 text-stone text-[10px] font-bold bg-[#f0ede6]/40 px-3 py-1.5 border border-cream/50 rounded-xl">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {readTime}分
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={11} />
                      {article.views + 1}
                    </span>
                  </div>
                </div>

              </div>

              {/* Rendered content */}
              <div className="prose max-w-none min-h-[200px]">
                {renderSimpleMarkdown(article.content)}
              </div>

              {/* Like bar */}
              <div className="flex items-center justify-center pt-8 border-t border-cream/50">
                <button
                  onClick={handleLikeToggle}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold border transition-all active:scale-95 shadow-sm",
                    liked
                      ? "bg-terracotta border-transparent text-white"
                      : "bg-white border-cream text-stone hover:bg-cream/40"
                  )}
                >
                  <ThumbsUp size={14} className={liked ? "fill-white" : ""} />
                  <span>この記事がいいね！と思いました ({likesCount})</span>
                </button>
              </div>

            </div>

            {/* Comments discussion Section */}
            <div className="bg-white border border-cream rounded-[32px] p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-bold font-heading text-near-black flex items-center gap-2 border-b border-cream pb-4 shrink-0">
                <MessageSquare size={16} className="text-terracotta" />
                コメント・質問 ({comments.length})
              </h3>

              {/* List comments */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {comments.length === 0 ? (
                  <p className="text-xs text-stone italic text-center py-6">コメントはありません。最初のコメントを残しましょう！</p>
                ) : (
                  comments.map((comm) => (
                    <div key={comm.id} className="flex gap-3 items-start p-4 bg-ivory/10 border border-cream rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-cream border border-cream overflow-hidden flex items-center justify-center text-xs font-bold text-stone shrink-0">
                        {comm.userPhoto ? (
                          <img src={comm.userPhoto} alt={comm.userName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={13} className="text-stone/60" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-near-black">{comm.userName}</span>
                          <span className="text-[9px] text-stone">{formatDate(comm.createdAt)}</span>
                        </div>
                        <p className="text-xs text-stone leading-relaxed whitespace-pre-wrap">{comm.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment Form */}
              <form onSubmit={handleCommentSubmit} className="flex gap-3 items-end border-t border-cream/50 pt-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-stone uppercase tracking-widest">コメントを投稿する</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="質問、補足、または感想を入力してください..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full px-4 py-2.5 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black text-xs font-medium resize-none transition-all leading-normal"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingComment || !newCommentText.trim()}
                  className="px-4 py-3 bg-terracotta text-ivory rounded-xl text-xs font-bold hover:bg-[#bf5d3c] disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center h-10 w-10 shadow-md shadow-terracotta/10 shrink-0"
                  title="送信"
                >
                  {submittingComment ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>

          {/* Confirm Delete Dialog */}
          <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={performDelete}
            title="記事の削除確認"
            description="この記事を削除してもよろしいですか？この操作は取り消せません。"
            confirmText="削除する"
            cancelText="キャンセル"
            variant="destructive"
          />

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
