"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/firebase/auth"
import { useChannels } from "@/hooks/useChannels"
import { useAuth } from "@/components/AuthProvider"
import { useNotifications } from "@/hooks/useNotifications"
import type { Notification } from "@/hooks/useNotifications"
import { toast } from "sonner"
import { Bell, CheckCheck, Megaphone, CalendarDays, BookOpen } from "lucide-react"

const navItems = [
  { label: "ホーム", href: "/" },
  { label: "チャット", href: "/chat" },
  { label: "予定表", href: "/calendar" },
  { label: "メンバー一覧", href: "/people" },
  { label: "ナレッジベース", href: "/knowledge" },
  { label: "お知らせ", href: "/announcements" },
  { label: "マイページ", href: "/profile" },
  { label: "管理画面", href: "/dashboard" },
  { label: "サポート", href: "/help" },
];

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

function getTypeIcon(type: Notification["type"]) {
  switch (type) {
    case "announcement": return <Megaphone className="w-3.5 h-3.5" />;
    case "event":        return <CalendarDays className="w-3.5 h-3.5" />;
    case "knowledge":    return <BookOpen className="w-3.5 h-3.5" />;
  }
}

function getTypeBg(type: Notification["type"]) {
  switch (type) {
    case "announcement": return "bg-terracotta/10 text-terracotta";
    case "event":        return "bg-blue-500/10 text-blue-600";
    case "knowledge":    return "bg-emerald-500/10 text-emerald-600";
  }
}

function getActionLabel(type: Notification["type"]) {
  switch (type) {
    case "announcement": return "がお知らせを投稿しました";
    case "event":        return "がイベントを追加しました";
    case "knowledge":    return "が記事を投稿しました";
  }
}

function formatRelativeTime(ts: import("firebase/firestore").Timestamp | undefined): string {
  if (!ts) return "";
  const diffMs = Date.now() - ts.toMillis();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return "今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `${diffH}時間前`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7)    return `${diffD}日前`;
  return ts.toDate().toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { channels } = useChannels();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const markAllRead = useCallback(() => {
    notifications.forEach((n) => markAsRead(n.id));
  }, [notifications, markAsRead]);

  const displayName = profile?.displayName || user?.email?.split("@")[0] || "ユーザー";

  const hasChatUnread =
    !!user &&
    channels.some((ch) => (ch.unreadCount?.[user.uid] ?? 0) > 0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    toast.success("ログアウトしました", {
      description: "セッションが安全に終了されました。またのご利用をお待ちしております。",
    });
    router.push("/login");
  };

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

        {/* Left — logo + nav */}
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="font-heading text-[1.9rem] leading-none tracking-[-0.03em] text-near-black"
          >
            POROCIA
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const showUnreadDot = item.href === "/chat" && hasChatUnread && !isActive;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative inline-block whitespace-nowrap text-[15px] font-medium transition-colors duration-300",
                    "after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full",
                    "after:origin-left after:scale-x-0 after:bg-terracotta after:transition-transform after:duration-300",
                    "hover:after:scale-x-100 hover:text-near-black",
                    isActive
                      ? "text-near-black font-semibold after:scale-x-100"
                      : "text-olive"
                  )}
                >
                  {item.label}
                  {showUnreadDot && (
                    <span className="absolute -right-2 -top-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right — bell + avatar + dropdowns */}
        <div ref={dropdownRef} className="relative hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-xl bg-cream" />
          ) : user ? (
            <>
              {/* Bell button */}
              <button
                onClick={() => { setNotifOpen(v => !v); setOpen(false); }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#2a2a27] transition-opacity hover:opacity-80 focus:outline-none"
              >
                <Bell className="w-5 h-5 text-ivory" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-ivory">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Avatar button */}
              <button
                onClick={() => { setOpen(v => !v); setNotifOpen(false); }}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#2a2a27] text-xs font-bold text-ivory transition-opacity hover:opacity-80 focus:outline-none"
                title={displayName}
              >
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  getInitials(displayName)
                )}
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="absolute right-10 top-[calc(100%+10px)] z-50 w-96 overflow-hidden rounded-2xl border border-[#e8e2d9] bg-[#faf8f4] shadow-[0_16px_48px_rgba(0,0,0,0.16)]">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-cream px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-near-black">通知</span>
                      {unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1.5 text-[10px] font-bold text-ivory">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-stone transition-colors hover:bg-cream hover:text-near-black"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        全て既読
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-[420px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 px-4 py-10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream">
                          <Bell className="w-5 h-5 text-stone" />
                        </div>
                        <p className="text-sm text-stone">通知はありません</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.link}
                          onClick={() => { markAsRead(n.id); setNotifOpen(false); }}
                          className="group flex gap-3 border-b border-cream/60 px-4 py-3.5 transition-colors hover:bg-cream/60 last:border-b-0"
                        >
                          {/* Actor avatar */}
                          <div className="relative mt-0.5 shrink-0">
                            {n.actorPhotoURL ? (
                              <img
                                src={n.actorPhotoURL}
                                alt={n.actorName || ""}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a2a27] text-[11px] font-bold text-ivory">
                                {getInitials(n.actorName || "?")}
                              </div>
                            )}
                            {/* Type badge */}
                            <span className={cn(
                              "absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-[#faf8f4]",
                              getTypeBg(n.type)
                            )}>
                              {getTypeIcon(n.type)}
                            </span>
                          </div>

                          {/* Text */}
                          <div className="min-w-0 flex-1">
                            {n.actorName && (
                              <p className="text-[12px] text-stone leading-snug">
                                <span className="font-semibold text-near-black">{n.actorName}</span>
                                {getActionLabel(n.type)}
                              </p>
                            )}
                            <p className="mt-0.5 text-[13px] font-semibold text-near-black leading-snug line-clamp-1 group-hover:text-terracotta transition-colors">
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="mt-0.5 text-[12px] text-stone leading-snug line-clamp-2">
                                {n.body}
                              </p>
                            )}
                            <p className="mt-1 text-[11px] text-warm-silver">
                              {formatRelativeTime(n.createdAt)}
                            </p>
                          </div>

                          {/* Unread dot */}
                          <div className="mt-2 shrink-0">
                            <span className="block h-2 w-2 rounded-full bg-terracotta" />
                          </div>
                        </Link>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="border-t border-cream">
                      <Link
                        href="/announcements"
                        onClick={() => setNotifOpen(false)}
                        className="block px-4 py-2.5 text-center text-[12px] font-medium text-stone transition-colors hover:bg-cream hover:text-near-black"
                      >
                        すべての通知を見る →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Profile dropdown */}
              {open && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-[#e8e2d9] bg-[#faf8f4] shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
                  <div className="border-b border-cream px-4 py-3">
                    <p className="text-[13px] font-semibold text-near-black">{displayName}</p>
                    <p className="text-[11px] text-stone">{user.email}</p>
                  </div>

                  <div className="py-1.5">
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[14px] text-dark transition-colors hover:bg-cream"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone">
                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                      プロフィールを表示
                    </Link>

                    <Link
                      href="/chat"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[14px] text-dark transition-colors hover:bg-cream"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      チャットへ移動
                    </Link>
                  </div>

                  <div className="border-t border-cream py-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[14px] text-dark transition-colors hover:bg-[#fef0e4] hover:text-terracotta"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
                      </svg>
                      ログアウト
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 text-[15px] font-medium text-olive hover:text-near-black"
              >
                ログイン
              </Link>
              <Link
                href="/login"
                className="ml-2 inline-flex h-11 items-center justify-center rounded-xl border border-terracotta bg-terracotta px-5 text-[15px] font-medium text-ivory hover:bg-[#bf5d3c]"
              >
                今すぐ始める
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}