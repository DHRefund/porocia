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
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Chỉ loại sender ra khỏi danh sách (đồng bộ với ReadReceiptLabel).
  // currentUserId (viewer) được tính vào để nhất quán với số hiển thị ở label.
  const readerUids = readBy.filter((uid) => uid !== senderId);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;
    setLoading(true);
    getUserProfiles(readerUids).then((profiles) => {
      if (isMounted) {
        setReadProfiles(profiles);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
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

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-200"
    >
      <div 
        className="relative z-60 w-full max-w-sm overflow-hidden rounded-2xl border border-cream bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream px-5 py-4 bg-background/50">
          <h3 className="text-[15px] font-semibold text-near-black">
            既読者 ({readerUids.length})
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone transition-colors hover:bg-cream hover:text-near-black"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cream bg-cream/20">
          {(["read", "unread"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-all",
                tab === t
                  ? "border-b-2 border-terracotta text-terracotta bg-white"
                  : "text-stone hover:text-near-black hover:bg-cream/30"
              )}
            >
              {t === "read" ? `既読 (${readerUids.length})` : "未読"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto py-2 bg-white">
          {tab === "read" ? (
            loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-warm border-t-terracotta" />
              </div>
            ) : readProfiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="mb-3 rounded-full bg-cream p-3">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone">
                     <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                   </svg>
                </div>
                <p className="text-[13px] font-medium text-stone">まだ誰もこのメッセージを読んでいません。</p>
              </div>
            ) : (
              <ul className="divide-y divide-cream/30">
                {readProfiles.map((p) => (
                  <li key={p.uid} className="flex items-center gap-4 px-5 py-4 hover:bg-cream/20 transition-colors">
                    <AvatarFallback name={p.displayName} photoURL={p.photoURL} />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-near-black">
                        {p.displayName}
                      </p>
                      <p className="truncate text-[11px] font-medium text-olive/70 uppercase tracking-tight">
                        {p.role || "メンバー"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
               <p className="text-[13px] text-stone font-medium">未読トラッキングは現在無効になっています。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
