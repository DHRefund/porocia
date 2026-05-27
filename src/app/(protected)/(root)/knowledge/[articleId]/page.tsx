"use client";

import { use, useEffect, useState } from "react";
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
  Comment,
} from "@/lib/firebase/knowledge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "hr", jpName: "人事・総務" },
  { id: "tech", jpName: "開発・技術" },
  { id: "design", jpName: "デザイン" },
  { id: "onboarding", jpName: "オンボーディング" },
  { id: "sales", jpName: "営業・マーケ" },
];

// Sanitize schema that explicitly allows <img> with common attributes
// (rehype-sanitize's defaultSchema already permits img, but we spell it out
//  to make sure width/height/title survive and nothing gets stripped.)
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: ["src", "alt", "title", "width", "height", "loading"],
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
  },
  // Allow https:// and data: URLs for images
  protocols: {
    ...defaultSchema.protocols,
    src: ["https", "http", "data"],
  },
};

export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = use(params);
  const router = useRouter();
  const { user, profile } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
        if (user && docData.likes?.includes(user.uid)) setLiked(true);

        const [commentsData] = await Promise.all([
          getComments(articleId),
          incrementViews(articleId),
        ]);
        setComments(commentsData);
      } catch (err) {
        console.error("Failed to load article detail:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) loadArticleData();
  }, [articleId, router, user]);

  const handleLikeToggle = async () => {
    if (!user || !article) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    try {
      await toggleLikeArticle(articleId, user.uid, wasLiked);
    } catch {
      setLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
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
      const newComment: Comment = {
        id: commentId,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "ユーザー",
        userPhoto: user.photoURL || "",
        text: newCommentText.trim(),
        createdAt: undefined,
      };
      setComments((prev) => [...prev, newComment]);
      setNewCommentText("");
      toast.success("コメントを投稿しました。");
    } catch {
      toast.error("コメントの投稿に失敗しました。");
    } finally {
      setSubmittingComment(false);
    }
  };

  const performDelete = async () => {
    setDeleting(true);
    try {
      await deleteArticle(articleId);
      toast.success("記事を削除しました。");
      router.push("/knowledge");
    } catch {
      toast.error("削除に失敗しました。");
    } finally {
      setDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const getReadTime = (content: string) =>
    Math.max(1, Math.ceil(content.length / 400));

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "たった今";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
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
  const catInfo = CATEGORIES.find((c) => c.id === article.category);
  const isAuthorOrAdmin =
    user?.uid === article.createdBy || profile?.role === "admin";

  return (
    <div className="bg-[#faf8f4] min-h-[calc(100vh-5rem)] p-6 lg:p-12 text-near-black">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header bar */}
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
              onClick={() => setIsDeleteDialogOpen(true)}
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

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-8">

            {/* Article card */}
            <div className="bg-white border border-cream rounded-[32px] p-8 lg:p-10 shadow-sm space-y-6">

              {/* Meta header */}
              <div className="border-b border-cream/50 pb-6 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
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

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cream border border-cream overflow-hidden flex items-center justify-center text-xs font-bold text-stone">
                      {article.authorPhoto ? (
                        <img
                          src={article.authorPhoto}
                          alt={article.authorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={14} className="text-stone/60" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-near-black">
                        {article.authorName}
                      </p>
                      <p className="text-[10px] text-stone mt-0.5">
                        {formatDate(article.createdAt)} に公開
                      </p>
                    </div>
                  </div>

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

              {/* Markdown content — react-markdown handles images, tables, GFM */}
              <div className="prose prose-sm max-w-none min-h-[200px]
                prose-headings:font-extrabold prose-headings:text-near-black prose-headings:font-heading
                prose-h1:text-3xl prose-h1:border-b prose-h1:border-cream prose-h1:pb-2
                prose-h2:text-2xl prose-h3:text-xl
                prose-p:text-stone prose-p:leading-relaxed prose-p:text-sm
                prose-li:text-stone prose-li:text-sm
                prose-strong:text-near-black prose-strong:font-extrabold
                prose-a:text-terracotta prose-a:underline hover:prose-a:opacity-80
                prose-blockquote:border-l-terracotta prose-blockquote:text-stone prose-blockquote:italic
                prose-code:bg-[#f0ede6] prose-code:text-near-black prose-code:px-1 prose-code:rounded prose-code:text-xs
                prose-pre:bg-[#f0ede6] prose-pre:rounded-xl prose-pre:border prose-pre:border-cream
                prose-img:rounded-xl prose-img:border prose-img:border-cream prose-img:my-4 prose-img:max-w-full
                prose-table:text-xs prose-table:border-collapse
                prose-th:bg-[#f0ede6] prose-th:font-bold prose-th:text-near-black prose-th:border prose-th:border-cream prose-th:px-3 prose-th:py-2
                prose-td:border prose-td:border-cream prose-td:px-3 prose-td:py-2 prose-td:text-stone
                prose-hr:border-cream
              ">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
                >
                  {article.content}
                </ReactMarkdown>
              </div>

              {/* Like button */}
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
                  <ThumbsUp
                    size={14}
                    className={liked ? "fill-white" : ""}
                  />
                  <span>この記事がいいね！と思いました ({likesCount})</span>
                </button>
              </div>
            </div>

            {/* Comments section */}
            <div className="bg-white border border-cream rounded-[32px] p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-bold font-heading text-near-black flex items-center gap-2 border-b border-cream pb-4">
                <MessageSquare size={16} className="text-terracotta" />
                コメント・質問 ({comments.length})
              </h3>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {comments.length === 0 ? (
                  <p className="text-xs text-stone italic text-center py-6">
                    コメントはありません。最初のコメントを残しましょう！
                  </p>
                ) : (
                  comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="flex gap-3 items-start p-4 bg-ivory/10 border border-cream rounded-2xl"
                    >
                      <div className="w-8 h-8 rounded-full bg-cream border border-cream overflow-hidden flex items-center justify-center text-xs font-bold text-stone shrink-0">
                        {comm.userPhoto ? (
                          <img
                            src={comm.userPhoto}
                            alt={comm.userName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={13} className="text-stone/60" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-near-black">
                            {comm.userName}
                          </span>
                          <span className="text-[9px] text-stone">
                            {formatDate(comm.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-stone leading-relaxed whitespace-pre-wrap">
                          {comm.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment form */}
              <form
                onSubmit={handleCommentSubmit}
                className="flex gap-3 items-end border-t border-cream/50 pt-4"
              >
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-stone uppercase tracking-widest">
                    コメントを投稿する
                  </label>
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
            </div>

          </div>
        </div>
      </div>

      {/* Delete confirm dialog */}
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
  );
}