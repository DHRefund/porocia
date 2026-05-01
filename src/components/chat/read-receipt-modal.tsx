"use client";

import { useEffect, useRef, useState } from "react";
import { getUserProfiles, UserProfile } from "@/lib/firebase/chat";
import { cn } from "@/lib/utils";

interface ReadReceiptModalProps {
  channelId: string;
  messageId: string;
  readBy: string[];
  senderId: string;
  currentUserId?: string;
  onClose: () => void;
}

type Tab = "read" | "unread";

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

function AvatarFallback({ name, photoURL }: { name: string; photoURL?: string }) {
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2a2a27] text-xs font-bold text-ivory">
      {getInitials(name)}
    </div>
  );
}

export function ReadReceiptModal({
  channelId,
  messageId,
  readBy,
  senderId,
  currentUserId,
  onClose,
}: ReadReceiptModalProps) {
  const [tab, setTab] = useState<Tab>("read");
  const [readProfiles, setReadProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Filter out the sender and current user from readBy for the count
  const readerUids = readBy.filter((uid) => uid !== senderId && uid !== currentUserId);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getUserProfiles(readerUids).then((profiles) => {
      if (mounted) {
        setReadProfiles(profiles);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readBy.join(","), senderId]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-cream bg-card shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream px-5 py-4">
          <h3 className="text-[15px] font-semibold text-near-black">
            Read By ({readerUids.length})
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone transition-colors hover:bg-cream hover:text-near-black"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cream">
          {(["read", "unread"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-3 text-[13px] font-semibold uppercase tracking-widest transition-colors",
                tab === t
                  ? "border-b-2 border-terracotta text-terracotta"
                  : "text-stone hover:text-near-black"
              )}
            >
              {t === "read" ? `Read (${readerUids.length})` : "Unread"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto py-2">
          {tab === "read" ? (
            loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-warm border-t-terracotta" />
              </div>
            ) : readProfiles.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-stone">
                No one has read this message yet.
              </p>
            ) : (
              <ul>
                {readProfiles.map((p) => (
                  <li key={p.uid} className="flex items-center gap-3 px-5 py-3 hover:bg-cream/40">
                    <AvatarFallback name={p.displayName} photoURL={p.photoURL} />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-near-black">
                        {p.displayName}
                      </p>
                      <p className="truncate text-[12px] text-olive">
                        {p.role} · {p.email}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className="py-8 text-center text-[13px] text-stone">
              Unread tracking requires a channel members list.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
