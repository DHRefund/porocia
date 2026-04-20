import { ChatMessage } from "@/lib/firebase/chat";

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

export function ChatBubble({ msg, isMine }: { msg: ChatMessage; isMine: boolean }) {
  if (isMine) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-medium tracking-wide text-[--color-stone-gray]">
              {formatTime(msg.createdAt)}
            </span>
            <span className="text-[14px] font-semibold text-[--color-near-black]">
              You
            </span>
          </div>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[--color-border-warm] text-[11px] font-bold text-[--color-dark-warm]">
            {getInitials(formatSenderName(msg.senderName))}
          </div>
        </div>
        <div className="relative max-w-[85%] rounded-[24px] border border-[#b8d4f0] bg-[#deeeff] px-6 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="whitespace-pre-wrap text-[15px] leading-[1.6] text-[--color-dark-warm]">
            {msg.text}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-start gap-4">
      <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#2a2a27] text-sm font-bold text-[--color-ivory]">
        {getInitials(formatSenderName(msg.senderName))}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[14px] font-semibold text-[--color-near-black]">
            {formatSenderName(msg.senderName)}
          </span>
          <span className="text-[11px] font-medium tracking-wide text-[--color-stone-gray]">
            {formatTime(msg.createdAt)}
          </span>
        </div>
        <div className="max-w-[85%] rounded-[24px] border border-[#f5cdb0] bg-[#fef0e4] px-6 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="whitespace-pre-wrap text-[15px] leading-[1.6] text-[--color-dark-warm]">
          {msg.text}
        </div>
        </div>
      </div>
    </div>
  );
}
