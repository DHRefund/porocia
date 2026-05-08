import { 
  Megaphone, 
  Calendar, 
  ArrowRight,
  Users,
  Activity
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase/server";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  let decodedClaims;
  try {
    decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    redirect("/login");
  }

  const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();
  const profile = userDoc.data();

  let userCount = -1;
  try {
    const snapshot = await adminDb.collection("users").count().get();
    userCount = snapshot.data().count;
  } catch (error) {
    console.error("Error fetching user count from server:", error);
  }

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
        <h1 className="text-3xl font-heading font-bold text-near-black">お帰りなさい、{profile?.displayName || "Admin"}！</h1>
        <p className="text-stone mt-2">本日のシステムアクティビティの概要です。</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "新着お知らせ", value: "12", icon: Megaphone, color: "bg-terracotta" },
          { label: "今後のイベント", value: "05", icon: Calendar, color: "bg-olive" },
          { label: "総ユーザー数", value: userCount === -1 ? "システムエラー" : userCount.toString(), icon: Users, color: "bg-stone" },
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
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-near-black mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-terracotta" />
          クイックアクション
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
                <p className="font-bold text-near-black">新しいお知らせを投稿</p>
                <p className="text-sm text-stone">全メンバーに通知を送信します</p>
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
                <p className="font-bold text-near-black">新しいイベントを作成</p>
                <p className="text-sm text-stone">会議や共通のアクティビティをスケジュールします</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-stone group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
