"use client";

import { useEffect, useState } from "react";
import { getAnnouncements, Announcement } from "@/lib/firebase/announcements";
import { 
  Megaphone, 
  Pin, 
  Calendar, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  User,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AnnouncementActions } from "@/components/announcements/announcement-actions";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function PublicAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use onSnapshot for real-time updates so likes/comments count update instantly
    const coll = collection(db, "announcements");
    const q = query(coll, orderBy("isPinned", "desc"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      setAnnouncements(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-cream w-1/3 rounded-lg"></div>
        <div className="space-y-10">
          {[1, 2].map(i => (
            <div key={i} className="h-[500px] bg-cream/30 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-12 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-[10px] font-bold uppercase tracking-widest">
          <Megaphone className="w-3.5 h-3.5" />
          Bảng tin Porocia
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-near-black">Thông báo mới nhất</h1>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-12">
        {announcements.length === 0 ? (
          <div className="text-center py-20 bg-ivory/30 rounded-3xl border border-dashed border-cream">
            <Megaphone className="w-12 h-12 text-stone mx-auto mb-4 opacity-20" />
            <p className="text-stone font-medium">Hiện chưa có thông báo nào mới.</p>
          </div>
        ) : (
          announcements.map((a) => (
            <article 
              key={a.id} 
              className={cn(
                "group bg-white border border-cream rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-terracotta/5 transition-all duration-500",
                a.isPinned && "ring-1 ring-terracotta/30 shadow-lg shadow-terracotta/5"
              )}
            >
              {/* Image Header - Full Width Top */}
              {a.imageURL && (
                <div className="aspect-video w-full overflow-hidden relative">
                  <img 
                    src={a.imageURL} 
                    alt={a.title} 
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" 
                  />
                  {a.isPinned && (
                    <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-terracotta text-ivory rounded-full text-[10px] font-bold uppercase tracking-wider z-10 shadow-xl shadow-terracotta/20">
                      <Pin className="w-3 h-3 fill-ivory" />
                      Đang Ghim
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 md:p-10 space-y-6">
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-stone uppercase tracking-widest">
                  {!a.imageURL && a.isPinned && (
                    <div className="flex items-center gap-1 text-terracotta">
                      <Pin className="w-3 h-3 fill-terracotta" />
                      Ghim
                    </div>
                  )}
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
                    a.type === 'info' ? "bg-blue-50 text-blue-600" :
                    a.type === 'warning' ? "bg-amber-50 text-amber-600" :
                    a.type === 'success' ? "bg-emerald-50 text-emerald-600" :
                    "bg-terracotta/10 text-terracotta"
                  )}>
                    {a.type}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {a.createdAt ? format(a.createdAt.toDate(), "dd/MM/yyyy", { locale: vi }) : "..."}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    {a.authorName}
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-near-black leading-tight">
                    {a.title}
                  </h2>
                  <div className="text-stone/90 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                    {a.content}
                  </div>
                </div>

                {/* Actions (Reactions & Comments) at the bottom */}
                <AnnouncementActions announcement={a} />
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
