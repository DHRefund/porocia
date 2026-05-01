import { ChatMessage } from "@/lib/firebase/chat";
import { ReadReceiptLabel } from "@/components/chat/read-receipt-label";

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

// Tin nhắn cũ có thể lưu email đầy đủ làm senderName
// → tự động cắt lấy phần trước @ để hiện thị gọn
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
}

export function ChatBubble({ msg, isMine, channelId, currentUserId, latestReadBy }: ChatBubbleProps) {
  if (isMine) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2 mr-1">
            <span className="text-[11px] font-medium tracking-wide text-stone">
              {formatTime(msg.createdAt)}
            </span>
          </div>
          {/* <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-warm text-[11px] font-bold text-dark">
            {getInitials(formatSenderName(msg.senderName))}
          </div> */}
        </div>
        <div className="relative max-w-[60%] rounded-2xl bg-terracotta px-5 py-2.5 shadow-sm">
          <div className="whitespace-pre-wrap break-words text-[15px] leading-[1.6] text-white">{msg.text}</div>
        </div>
        {/* Read receipt — right-aligned for own messages */}
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
    <div className="flex flex-row items-start gap-4">
      <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#2a2a27] text-sm font-bold text-ivory">
        {getInitials(formatSenderName(msg.senderName))}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2 ml-1">
          <span className="text-[13px] font-semibold text-near-black">
            {formatSenderName(msg.senderName)}
          </span>
          <span className="text-[11px] font-medium tracking-wide text-stone">
            {formatTime(msg.createdAt)}
          </span>
        </div>
        <div className="max-w-[60%] rounded-2xl border border-cream bg-white px-5 py-2.5 shadow-sm">
          <div className="whitespace-pre-wrap break-words text-[15px] leading-[1.6] text-near-black">{msg.text}</div>
        </div>
        {/* Read receipt — left-aligned for others' messages */}
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
