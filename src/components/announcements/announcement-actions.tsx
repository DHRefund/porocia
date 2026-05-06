"use client";

import { useState, useEffect } from "react";
import { 
  Heart, 
  MessageSquare, 
  Send, 
  Smile,
  MoreHorizontal
} from "lucide-react";
import { 
  AnnouncementComment, 
  toggleReaction, 
  addComment, 
  listenComments,
  getCommentCount
} from "@/lib/firebase/announcements";
import { useAuth } from "@/components/auth-provider";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function AnnouncementActions({ announcement }: { announcement: any }) {
  const { user, profile } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<AnnouncementComment[]>([]);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Likes logic
  const likes = announcement.likes || [];
  const isLiked = user ? likes.includes(user.uid) : false;
  const likeCount = likes.length;

  useEffect(() => {
    // Initial comment count
    const fetchCount = async () => {
      const count = await getCommentCount(announcement.id);
      setCommentCount(count);
    };
    fetchCount();

    if (showComments) {
      const unsubscribe = listenComments(announcement.id, (data) => {
        setComments(data);
        setCommentCount(data.length);
      });
      return () => unsubscribe();
    }
  }, [showComments, announcement.id]);

  const handleToggleLike = async () => {
    if (!user) return alert("Vui lòng đăng nhập để tương tác!");
    try {
      await toggleReaction(announcement.id, user.uid);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(announcement.id, {
        text: newComment.trim(),
        authorId: user.uid,
        authorName: profile?.displayName || user.email?.split("@")[0] || "User",
        authorPhotoURL: profile?.photoURL || null,
      });
      setNewComment("");
      if (!showComments) setCommentCount(prev => prev + 1);
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-6 space-y-6">
      {/* Interaction Bar - Simple & Clean */}
      <div className="flex items-center gap-8">
        {/* Like Button */}
        <button 
          onClick={handleToggleLike}
          className="flex items-center gap-2 group"
        >
          <div className={cn(
            "p-2 rounded-full transition-colors",
            isLiked ? "bg-rose-50 text-rose-500" : "text-stone group-hover:bg-ivory group-hover:text-rose-500"
          )}>
            <Heart className={cn("w-5 h-5", isLiked && "fill-rose-500")} />
          </div>
          <span className={cn(
            "text-sm font-bold",
            isLiked ? "text-rose-500" : "text-stone"
          )}>
            {likeCount > 0 ? likeCount : ""}
          </span>
        </button>

        {/* Comment Toggle Button */}
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 group"
        >
          <div className={cn(
            "p-2 rounded-full transition-colors",
            showComments ? "bg-blue-50 text-blue-500" : "text-stone group-hover:bg-ivory group-hover:text-blue-500"
          )}>
            <MessageSquare className={cn("w-5 h-5", showComments && "fill-blue-500")} />
          </div>
          <span className={cn(
            "text-sm font-bold",
            showComments ? "text-blue-500" : "text-stone"
          )}>
            {commentCount > 0 ? commentCount : ""}
          </span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-6 pt-6 border-t border-cream animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Comment List */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.length === 0 ? (
              <p className="text-center py-4 text-xs text-stone italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cream flex-shrink-0 overflow-hidden border border-cream">
                    {c.authorPhotoURL ? (
                      <img src={c.authorPhotoURL} alt={c.authorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-stone">
                        {c.authorName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 bg-ivory/50 p-3 rounded-2xl rounded-tl-none border border-cream/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-bold text-near-black">{c.authorName}</span>
                      <span className="text-[10px] text-stone">
                        {c.createdAt ? formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true, locale: vi }) : "..."}
                      </span>
                    </div>
                    <p className="text-sm text-near-black leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-terracotta/10 flex-shrink-0 flex items-center justify-center">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Me" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Smile className="w-4 h-4 text-terracotta" />
              )}
            </div>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Viết bình luận của bạn..."
                className="w-full pl-4 pr-12 py-3 bg-white border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all text-sm"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors disabled:opacity-30"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
