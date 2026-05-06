"use client";

import { useAuth } from "@/components/auth-provider";
import { 
  Megaphone, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  Users,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const coll = collection(db, "users");
        const snapshot = await getCountFromServer(coll);
        setUserCount(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };
    fetchUserCount();
  }, []);

  // Role check logic (commented out for testing as requested)
  /*
  if (profile?.role !== 'admin') {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-near-black">Truy cập bị từ chối</h1>
        <p className="text-stone mt-2">Bạn không có quyền truy cập vào khu vực quản trị.</p>
        <Link href="/" className="mt-6 text-terracotta font-medium hover:underline">Quay lại trang chủ</Link>
      </div>
    );
  }
  */

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-near-black">Chào mừng trở lại, {profile?.displayName || "Admin"}!</h1>
        <p className="text-stone mt-2">Dưới đây là tổng quan về hoạt động hệ thống hôm nay.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Thông báo mới", value: "12", icon: Megaphone, color: "bg-terracotta" },
          { label: "Sự kiện sắp tới", value: "05", icon: Calendar, color: "bg-olive" },
          { label: "Tổng số User", value: userCount !== null ? userCount.toString() : "...", icon: Users, color: "bg-stone" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-cream p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-bold text-stone uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-heading font-bold text-near-black mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-5 h-5 text-ivory" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              <span>+12% so với tuần trước</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-near-black mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-terracotta" />
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/dashboard/announcements/new"
            className="group flex items-center justify-between p-6 bg-cream/30 border border-cream rounded-2xl hover:bg-cream/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl border border-cream">
                <Megaphone className="w-6 h-6 text-terracotta" />
              </div>
              <div>
                <p className="font-bold text-near-black">Đăng thông báo mới</p>
                <p className="text-sm text-stone">Thông báo cho toàn bộ thành viên</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-stone group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            href="/dashboard/events/new"
            className="group flex items-center justify-between p-6 bg-cream/30 border border-cream rounded-2xl hover:bg-cream/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl border border-cream">
                <Calendar className="w-6 h-6 text-olive" />
              </div>
              <div>
                <p className="font-bold text-near-black">Tạo sự kiện mới</p>
                <p className="text-sm text-stone">Lên lịch họp hoặc hoạt động chung</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-stone group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="bg-white border border-cream rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-cream bg-ivory/30 flex items-center justify-between">
          <h3 className="font-bold text-near-black">Hoạt động gần đây</h3>
          <button className="text-xs font-bold text-terracotta uppercase tracking-wider hover:underline">Xem tất cả</button>
        </div>
        <div className="divide-y divide-cream">
          {[1, 2, 3].map((item) => (
            <div key={item} className="px-6 py-4 flex items-center gap-4 hover:bg-cream/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center font-bold text-stone">
                {item}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-near-black">Hệ thống đã tự động sao lưu dữ liệu thành công.</p>
                <p className="text-xs text-stone mt-0.5">2 giờ trước</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
