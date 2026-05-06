"use client";

import { useEffect, useState } from "react";
import { getAnnouncements, Announcement } from "@/lib/firebase/announcements";
import Link from "next/link";
import { ArrowUpRight, Megaphone } from "lucide-react";

export default function AnnouncementsBento() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopAnnouncements = async () => {
      try {
        const all = await getAnnouncements();
        setAnnouncements(all.slice(0, 3));
      } catch (error) {
        console.error("Error fetching bento announcements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopAnnouncements();
  }, []);

  if (loading) return null;
  if (announcements.length === 0) return null;

  return (
    <section className="py-24 bg-ivory">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-[10px] font-bold uppercase tracking-widest">
              <Megaphone className="w-3.5 h-3.5" />
              Cập nhật mới nhất
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-near-black">Thông báo nội bộ</h2>
          </div>
          <Link 
            href="/announcements" 
            className="group flex items-center gap-2 text-stone font-bold text-sm uppercase tracking-widest hover:text-terracotta transition-colors pb-2"
          >
            Xem tất cả
            <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-[600px] md:h-[700px]">
          {/* Main Large Item */}
          {announcements[0] && (
            <Link 
              href="/announcements" 
              className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[32px] bg-cream"
            >
              <img 
                src={announcements[0].imageURL || "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&q=80"} 
                alt={announcements[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 md:p-12 flex flex-col justify-end">
                <h3 className="text-2xl md:text-4xl font-heading font-bold text-white leading-tight">
                  {announcements[0].title}
                </h3>
              </div>
            </Link>
          )}

          {/* Smaller Item 1 */}
          {announcements[1] && (
            <Link 
              href="/announcements" 
              className="relative group overflow-hidden rounded-[32px] bg-cream"
            >
              <img 
                src={announcements[1].imageURL || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80"} 
                alt={announcements[1].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-6 flex flex-col justify-end">
                <h3 className="text-xl font-heading font-bold text-white leading-tight">
                  {announcements[1].title}
                </h3>
              </div>
            </Link>
          )}

          {/* Smaller Item 2 */}
          {announcements[2] && (
            <Link 
              href="/announcements" 
              className="relative group overflow-hidden rounded-[32px] bg-cream"
            >
              <img 
                src={announcements[2].imageURL || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80"} 
                alt={announcements[2].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-6 flex flex-col justify-end">
                <h3 className="text-xl font-heading font-bold text-white leading-tight">
                  {announcements[2].title}
                </h3>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
