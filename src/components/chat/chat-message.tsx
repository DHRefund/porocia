import { ChatMessage } from "@/lib/firebase/chat";
import { ReadReceiptLabel } from "@/components/chat/read-receipt-label";
import { UserProfile } from "@/lib/firebase/chat";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  onToggleReaction
}: ChatBubbleProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const displayName = currentUserProfile?.displayName || msg.senderName;
  const avatarUrl = currentUserProfile?.photoURL || msg.senderPhotoURL;
  const initials = getInitials(formatSenderName(displayName));

  const ReplyPreview = () => {
    if (!msg.replyTo) return null;
    return (
      <div className={cn(
        "mb-4 flex flex-col gap-2.5 rounded-xl px-4 py-3 transition-all hover:bg-black/5 cursor-pointer border-l-[3px]",
        isMine ? "bg-black/[0.04] border-terracotta/40" : "bg-black/[0.04] border-stone/30"
      )}>
        {/* Header: Avatar + Name + Time */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-5 w-5 rounded-full bg-stone/20 overflow-hidden shrink-0 border border-white/50">
              <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-stone uppercase">
                {msg.replyTo.senderName.substring(0, 1)}
              </div>
            </div>
            <p className="truncate text-[12.5px] font-bold tracking-tight text-near-black">
              {msg.replyTo.senderName}
            </p>
          </div>
          <span className="shrink-0 text-[10.5px] font-medium text-stone/50">
            {formatTime(msg.createdAt)}
          </span>
        </div>
        
        {/* Content Preview */}
        <p className="line-clamp-2 text-[13px] leading-relaxed text-stone/70 italic pl-1">
          {msg.replyTo.text}
        </p>
      </div>
    );
  };

  const ReactionList = () => {
    if (!msg.reactions || Object.keys(msg.reactions).length === 0) return null;

    return (
      <div className={cn(
        "flex flex-wrap gap-1 mt-1",
        isMine ? "justify-end" : "justify-start"
      )}>
        {Object.entries(msg.reactions).map(([emoji, uids]) => {
          if (!uids || uids.length === 0) return null;
          const hasReacted = currentUserId && uids.includes(currentUserId);
          return (
            <button
              key={emoji}
              onClick={() => onToggleReaction?.(msg.id, emoji)}
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
    <div className={cn(
      "absolute bottom-full mb-2 z-50 flex items-center gap-1 rounded-full bg-white p-1.5 shadow-xl border border-cream animate-in fade-in zoom-in duration-200",
      isMine ? "right-0" : "left-0"
    )}>
      {EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => {
            onToggleReaction?.(msg.id, emoji);
            setShowEmojiPicker(false);
          }}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-cream transition-colors text-lg hover:scale-125 duration-200"
        >
          {emoji}
        </button>
      ))}
    </div>
  );

  const ActionButtons = () => (
    <div className={cn(
      "opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0 relative",
      isMine ? "order-first" : ""
    )}>
      {showEmojiPicker && <ReactionPicker />}
      
      {/* Reaction Button */}
      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="p-2 rounded-full hover:bg-cream/50 text-stone hover:text-terracotta transition-colors"
        title="Add reaction"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
      </button>

      {/* Reply Button */}
      <button
        onClick={() => onReply?.(msg)}
        className="p-2 rounded-full hover:bg-cream/50 text-stone hover:text-terracotta transition-colors"
        title="Reply"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
      </button>
    </div>
  );

  if (isMine) {
    return (
      <div className="group flex flex-col items-end gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2 mr-1">
            <span className="text-[11px] font-medium tracking-wide text-stone">
              {formatTime(msg.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 max-w-[85%]">
          <ActionButtons />
          <div className="relative w-full rounded-2xl bg-[#fdf2e9] border border-[#f5e6d3] px-5 py-3 shadow-sm">
            <ReplyPreview />
            <div className="whitespace-pre-wrap break-words text-[15px] leading-[1.6] text-near-black">
               {msg.text}
            </div>
          </div>
        </div>
        <ReactionList />
        <ReadReceiptLabel
          channelId={channelId}
          messageId={msg.id}
          senderId={msg.senderId}
          readBy={latestReadBy ?? []}
          isMine={true}
          currentUserId={currentUserId}
        />
      </div>
    );
  }

  return (
    <div className="group flex flex-row items-start gap-4">
      <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#2a2a27] text-sm font-bold text-ivory">
        {avatarUrl ? (
          <img src={avatarUrl} alt={msg.senderName} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="flex flex-col gap-1 flex-1 overflow-hidden">
        <div className="flex items-baseline gap-2 ml-1">
          <span className="text-[13px] font-semibold text-near-black">
            {formatSenderName(displayName)}
          </span>
          <span className="text-[11px] font-medium tracking-wide text-stone">
            {formatTime(msg.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-2 w-full">
          <div className="max-w-[85%] rounded-2xl border border-[#e8e2d9] bg-white px-5 py-3 shadow-sm">
            <ReplyPreview />
            <div className="whitespace-pre-wrap break-words text-[15px] leading-[1.6] text-near-black">
              {msg.text}
            </div>
          </div>
          <ActionButtons />
        </div>
        <ReactionList />
        <ReadReceiptLabel
          channelId={channelId}
          messageId={msg.id}
          senderId={msg.senderId}
          readBy={latestReadBy ?? []}
          isMine={false}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
