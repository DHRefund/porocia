"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // States cho form update
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setDisplayName(data.displayName || "");
          setBio(data.bio || "");
        }
      } catch (e) {
        toast.error("Chưa tải được hồ sơ", {
          description: "Vui lòng thử lại sau.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        bio,
      });
      setProfile((prev: any) => ({ ...prev, displayName, bio }));
      setIsEditing(false);
      toast.success("Đã cập nhật hồ sơ!", {
        description: "Profile của bạn đã được thay đổi thành công.",
      });
    } catch (e) {
      toast.error("Lỗi khi lưu hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <main className="flex h-[calc(100vh-80px)] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[--color-border-warm] border-t-[--color-terracotta]" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-[calc(100vh-80px)] w-full max-w-2xl flex-col bg-background p-6 pt-12">
      <div className="rounded-[32px] border border-[--color-border-cream] bg-[--color-ivory] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        
        {/* Header: Avatar & Title */}
        <div className="flex items-center gap-6">
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-[#2a2a27] text-3xl font-semibold text-[--color-ivory] shadow-inner">
            {getInitials(profile?.displayName || user?.email)}
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-[-0.02em] text-[--color-near-black]">
              Your Profile
            </h1>
            <p className="mt-1 text-[15px] text-[--color-olive-gray]">
              Manage your personal information and preferences.
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          
          {/* Thông tin Email (Read only) */}
          <div>
            <label className="text-[13px] font-bold uppercase tracking-widest text-[--color-stone-gray]">
              Tài khoản Email
            </label>
            <div className="mt-2 text-[16px] font-medium text-[--color-dark-warm]">
              {profile?.email || user?.email}
            </div>
          </div>

          {/* Vai trò */}
          <div>
            <label className="text-[13px] font-bold uppercase tracking-widest text-[--color-stone-gray]">
              Vai trò (Role)
            </label>
            <div className="mt-2 inline-flex items-center rounded-full bg-[--color-warm-sand] px-4 py-1 text-[13px] font-semibold uppercase tracking-wider text-[--color-dark-warm]">
              {profile?.role || "Member"}
            </div>
          </div>

          <hr className="border-t border-[--color-border-cream]" />

          {/* Editable Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[--color-near-black]">Thông tin hiển thị</h2>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="rounded-full border-[--color-border-warm] bg-transparent text-[--color-dark-warm] hover:bg-[--color-warm-sand]"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-5 rounded-2xl border border-[--color-border-warm] bg-[--color-parchment]/50 p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[--color-dark-warm]">Tên hiển thị</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 rounded-xl border-[--color-border-cream] bg-[--color-ivory] focus-visible:ring-[--color-terracotta]"
                    placeholder="Nhập tên hiển thị..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[--color-dark-warm]">Tiểu sử (Bio)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-xl border border-[--color-border-cream] bg-[--color-ivory] p-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[--color-terracotta]"
                    placeholder="Viết một vài dòng về bản thân..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(profile?.displayName || "");
                      setBio(profile?.bio || "");
                    }}
                    variant="ghost"
                    className="rounded-xl text-[--color-olive-gray] hover:bg-[--color-border-cream]"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-[--color-terracotta] text-white hover:bg-[#bf5d3c]"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-widest text-[--color-stone-gray]">Tên hiển thị</p>
                  <p className="mt-1 text-[16px] font-medium text-[--color-near-black]">
                    {profile?.displayName || "Chưa thiết lập"}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-widest text-[--color-stone-gray]">Tiểu sử</p>
                  <p className="mt-1 max-w-prose whitespace-pre-wrap text-[15px] leading-relaxed text-[--color-dark-warm]">
                    {profile?.bio || "Chưa có tiểu sử."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
