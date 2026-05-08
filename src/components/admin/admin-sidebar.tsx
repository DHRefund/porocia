"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Megaphone, 
  Calendar, 
  Users, 
  Settings,
  ChevronRight
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "概要", href: "/dashboard" },
  { icon: Megaphone, label: "お知らせ", href: "/dashboard/announcements" },
  { icon: Calendar, label: "イベント", href: "/dashboard/events" },
  { icon: Users, label: "メンバー", href: "/dashboard/members" },
  { icon: Settings, label: "設定", href: "/dashboard/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-cream bg-ivory flex flex-col h-full">
      <div className="p-6 border-b border-cream">
        <h2 className="text-xs font-bold uppercase tracking-widest text-stone">Admin Control</h2>
        <p className="mt-1 text-near-black font-semibold">管理パネル</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-terracotta text-ivory shadow-lg shadow-terracotta/20"
                  : "text-olive hover:bg-cream hover:text-near-black"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-ivory" : "text-stone group-hover:text-terracotta")} />
              <span className="flex-1 font-medium">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 text-ivory/70" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-cream">
        <Link 
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold uppercase tracking-wider text-stone hover:text-terracotta transition-colors"
        >
          システムホーム
        </Link>
      </div>
    </aside>
  );
}
