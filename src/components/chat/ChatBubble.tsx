import { ChatMessage } from "@/lib/firebase/chat";
import { ReadReceiptLabel } from "@/components/chat/ReadReceiptLabel";
import { UserProfile } from "@/lib/firebase/chat";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const formatTime = (timestamp: any) => {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getInitials = (name: string) => {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatSenderName = (name: string) => {
  if (!name) return "Unknown";
  if (name.includes("@")) return name.split("@")[0];
  return name;
};

interface ChatBubbleProps {
  msg: ChatMessage;
  isMine: boolean;
  channelId: string;
  /** UID of the currently logged-in user — passed to ReadReceiptLabel */
  currentUserId?: string;
  /** Filtered list of UIDs whose latest read message is this one */
  latestReadBy?: string[];
  /** Profile of the currently logged-in user to show latest avatar for own messages */
  currentUserProfile?: UserProfile | null;
  onReply?: (msg: ChatMessage) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  /** All known sender profiles in this channel */
  senderProfiles?: Record<string, UserProfile>;
}

const EMOJIS = ["❤️", "👍", "😂", "🔥", "😮", "😢"];

export function ChatBubble({ 
  msg, 
  isMine, 
  channelId, 
  currentUserId, 
  latestReadBy, 
  currentUserProfile,
  onReply,
  onToggleReaction,
  senderProfiles
}: ChatBubbleProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const displayName = currentUserProfile?.displayName || msg.senderName;
  const avatarUrl = currentUserProfile?.photoURL || msg.senderPhotoURL;
  const initials = getInitials(formatSenderName(displayName));

  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showEmojiPicker]);

  const ReplyPreview = () => {
    if (!msg.replyTo) return null;
    
    // Ưu tiên lấy ảnh từ senderProfiles (luôn là ảnh mới nhất)
    // Fallback về senderPhotoURL lưu trong tin nhắn (cho tin nhắn cũ)
    const replySenderProfile = senderProfiles?.[msg.replyTo.senderId];
    const replyPhoto = replySenderProfile?.photoURL || msg.replyTo.senderPhotoURL;
    
    return (
      <div 
        className={cn(
          "mb-2.5 -mx-5 -mt-3 flex items-start gap-2.5 border-b px-5 pt-3 pb-2.5 cursor-pointer transition-colors",
          isMine ? "border-[#e6d5c3] hover:bg-black/5" : "border-[#e8e2d9] hover:bg-black/5"
        )}
      >
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone/20 text-[9px] font-bold uppercase text-stone">
          {replyPhoto ? (
            <img src={replyPhoto} alt={msg.replyTo.senderName} className="h-full w-full object-cover" />
          ) : (
            getInitials(formatSenderName(msg.replyTo.senderName))
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <p className="truncate text-[12px] font-bold text-near-black leading-tight mb-0.5">
            {msg.replyTo.senderName}
          </p>
          <p className="truncate text-[13px] text-stone/80 leading-snug">
            {msg.replyTo.text}
          </p>
        </div>
      </div>
    );
  };

  const ReactionList = () => {
    if (!msg.reactions || Object.keys(msg.reactions).length === 0) return null;

    const entries = Object.entries(msg.reactions)
      .filter(([, uids]) => uids && uids.length > 0);

    if (entries.length === 0) return null;

    return (
      <div className={cn(
        "flex flex-wrap gap-1 mt-1 relative z-10",
        isMine ? "justify-end" : "justify-start"
      )}>
        {entries.map(([emoji, uids]) => {
          const hasReacted = currentUserId && uids.includes(currentUserId);
          return (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation();
                onToggleReaction?.(msg.id, emoji);
              }}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-all border",
                hasReacted 
                  ? "bg-terracotta/10 border-terracotta text-terracotta scale-105" 
                  : "bg-cream/40 border-cream text-stone hover:bg-cream"
              )}
            >
              <span>{emoji}</span>
              <span className="font-bold">{uids.length}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const ReactionPicker = () => (
    <div 
      ref={pickerRef}
      className={cn(
        "absolute bottom-full mb-3 z-30 flex flex-row items-center gap-1 rounded-full bg-white p-1.5 shadow-2xl border border-cream animate-in fade-in zoom-in origin-bottom duration-200 whitespace-nowrap w-max",
        isMine ? "right-0" : "left-0"
      )}>
      {EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={(e) => {
            e.stopPropagation();
            onToggleReaction?.(msg.id, emoji);
            setShowEmojiPicker(false);
          }}
          className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-cream transition-colors text-lg hover:scale-125 duration-200"
        >
          {emoji}
        </button>
      ))}
    </div>
  );

  const ActionButtons = ({ className }: { className?: string }) => (
    <div className={cn(
      "z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 whitespace-nowrap",
      className
    )}>
      {showEmojiPicker && <ReactionPicker />}
      
      {isMine && (
        <button className="p-1 rounded-full hover:bg-stone/10 text-stone transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      )}

      {/* Reaction Button */}
      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="p-1 rounded-full hover:bg-stone/10 text-stone transition-colors"
        title="リアクションを追加"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
      </button>

      {/* Reply Button */}
      <button
        onClick={() => onReply?.(msg)}
        className="p-1 rounded-full hover:bg-stone/10 text-stone transition-colors"
        title="返信"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
      </button>
    </div>
  );

  if (isMine) {
    return (
      <div className="group flex flex-col items-end relative w-full mb-1">
        <div className="flex items-end gap-1.5 w-full justify-end max-w-full">
          
          {/* Left Metadata Container */}
          <div className="flex items-end gap-1 shrink-0 pb-0.5">
            {/* Actions */}
            <div className="relative h-full flex items-end pb-0.5">
              <ActionButtons className="flex-row-reverse" />
            </div>

            {/* Read receipt & Time */}
            <div className="flex flex-col items-end justify-end leading-none gap-1">
              <div onClick={(e) => e.stopPropagation()}>
                <ReadReceiptLabel
                  channelId={channelId}
                  messageId={msg.id}
                  senderId={msg.senderId}
                  readBy={latestReadBy ?? []}
                  isMine={true}
                  currentUserId={currentUserId}
                />
              </div>
              <span className="text-[11px] font-medium text-stone tracking-tight">
                {formatTime(msg.createdAt)}
              </span>
            </div>
          </div>

          {/* Bubble */}
          <div className="relative max-w-[30%] shrink-0">
            <div className="relative z-10 w-full rounded-2xl rounded-tr-sm bg-[#cbefff] px-3.5 py-2.5 shadow-sm overflow-hidden text-near-black">
              <ReplyPreview />
              <div className="whitespace-pre-wrap break-words text-[15px] leading-[1.6]">
                 {msg.text}
              </div>
            </div>
          </div>
        </div>
        {/* Reactions placed outside so they don't push metadata down */}
        <ReactionList />
      </div>
    );
  }

  return (
    <div className="group flex flex-row items-start gap-2 relative mb-1 w-full">
      <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#2a2a27] text-sm font-bold text-ivory">
        {avatarUrl ? (
          <img src={avatarUrl} alt={msg.senderName} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-baseline ml-1 mb-1">
          <span className="text-[13px] font-semibold text-near-black">
            {formatSenderName(displayName)}
          </span>
        </div>
        <div className="flex items-end gap-1.5 w-full">
          {/* Bubble */}
          <div className="relative max-w-[30%] shrink-0">
            <div className="relative z-10 w-full rounded-2xl rounded-tl-sm border border-[#e8e2d9] bg-white px-3.5 py-2.5 shadow-sm overflow-hidden">
              <ReplyPreview />
              <div className="whitespace-pre-wrap break-words text-[15px] leading-[1.6] text-near-black">
                {msg.text}
              </div>
            </div>
          </div>

          {/* Right Metadata Container */}
          <div className="flex items-end gap-1 shrink-0 pb-0.5">
            {/* Time & Read receipt */}
            <div className="flex flex-col items-start justify-end leading-none gap-1">
              <div onClick={(e) => e.stopPropagation()}>
                <ReadReceiptLabel
                  channelId={channelId}
                  messageId={msg.id}
                  senderId={msg.senderId}
                  readBy={latestReadBy ?? []}
                  isMine={false}
                  currentUserId={currentUserId}
                />
              </div>
              <span className="text-[11px] font-medium text-stone tracking-tight">
                {formatTime(msg.createdAt)}
              </span>
            </div>

            {/* Actions */}
            <div className="relative h-full flex items-end pb-0.5">
              <ActionButtons />
            </div>
          </div>
        </div>
        {/* Reactions placed outside so they don't push metadata down */}
        <ReactionList />
      </div>
    </div>
  );
}
