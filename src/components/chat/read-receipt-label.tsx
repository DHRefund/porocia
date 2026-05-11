"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ReadReceiptModal } from "@/components/chat/read-receipt-modal";
import { createPortal } from "react-dom";

interface ReadReceiptLabelProps {
  channelId: string;
  messageId: string;
  senderId: string;
  /** readBy array directly from the message document */
  readBy: string[];
  isMine: boolean;
  /** The currently logged-in user's UID — excluded from the count */
  currentUserId?: string;
}

/**
 * Inline read receipt label rendered below each message bubble.
 * Shows "◀ Read X" — counting readers that are neither the sender
 * nor the currently logged-in viewer.
 * Clicking opens the ReadReceiptModal.
 */
export function ReadReceiptLabel({
  channelId,
  messageId,
  senderId,
  readBy,
  isMine,
  currentUserId,
}: ReadReceiptLabelProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Exclude both the sender AND the current viewer from the count
  const readerCount = (readBy ?? []).filter(
    (uid) => uid !== senderId && uid !== currentUserId
  ).length;

  if (readerCount === 0) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setModalOpen(true);
        }}
        className={cn(
          "flex items-center gap-0.5 text-[11px] text-[#3b82f6] transition-colors hover:text-blue-600 relative z-10",
          isMine ? "justify-end" : "justify-start"
        )}
        title="See who read this"
      >
        <span className="font-semibold tracking-tighter">&lt;</span>
        <span className="font-semibold tracking-tight">
          Read {readerCount}
        </span>
      </button>

      {modalOpen && typeof document !== "undefined" && createPortal(
        <ReadReceiptModal
          channelId={channelId}
          messageId={messageId}
          readBy={readBy}
          senderId={senderId}
          currentUserId={currentUserId}
          onClose={() => setModalOpen(false)}
        />,
        document.body
      )}
    </>
  );
}
