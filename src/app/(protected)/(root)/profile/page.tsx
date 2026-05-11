"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth-provider";
import { uploadAvatar, updateUserProfile } from "@/lib/firebase/auth";
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
  const [uploading, setUploading] = useState(false);

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
      await updateUserProfile(user.uid, {
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Giới hạn dung lượng 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh quá lớn", { description: "Vui lòng chọn ảnh dưới 2MB." });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadAvatar(user.uid, file);
      await updateUserProfile(user.uid, { photoURL: url });
      setProfile((prev: any) => ({ ...prev, photoURL: url }));
      toast.success("Đã cập nhật ảnh đại diện!");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải ảnh lên");
    } finally {
      setUploading(false);
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-warm border-t-terracotta" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-[calc(100vh-80px)] w-full max-w-2xl flex-col bg-background p-6 pt-12">
      <div className="rounded-[32px] border border-cream bg-ivory p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        
        {/* Header: Avatar & Title */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#2a2a27] text-3xl font-semibold text-ivory shadow-inner">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                getInitials(profile?.displayName || user?.email)
              )}
            </div>
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-[-0.02em] text-near-black">
              Your Profile
            </h1>
            <p className="mt-1 text-[15px] text-olive">
              Manage your personal information and preferences.
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          
          {/* Thông tin Email (Read only) */}
          <div>
            <label className="text-[13px] font-bold uppercase tracking-widest text-stone">
              Tài khoản Email
            </label>
            <div className="mt-2 text-[16px] font-medium text-dark">
              {profile?.email || user?.email}
            </div>
          </div>

          {/* Vai trò */}
          <div>
            <label className="text-[13px] font-bold uppercase tracking-widest text-stone">
              Vai trò (Role)
            </label>
            <div className="mt-2 inline-flex items-center rounded-full bg-sand px-4 py-1 text-[13px] font-semibold uppercase tracking-wider text-dark">
              {profile?.role || "Member"}
            </div>
          </div>

          <hr className="border-t border-cream" />

          {/* Editable Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-near-black">Thông tin hiển thị</h2>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="rounded-full border-warm bg-transparent text-dark hover:bg-sand"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-5 rounded-2xl border border-warm bg-parchment/50 p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Tên hiển thị</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 rounded-xl border-cream bg-ivory focus-visible:ring-terracotta"
                    placeholder="Nhập tên hiển thị..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">Tiểu sử (Bio)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-xl border border-cream bg-ivory p-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-terracotta"
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
                    className="rounded-xl text-olive hover:bg-cream"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-terracotta text-white hover:bg-[#bf5d3c]"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-widest text-stone">Tên hiển thị</p>
                  <p className="mt-1 text-[16px] font-medium text-near-black">
                    {profile?.displayName || "Chưa thiết lập"}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-widest text-stone">Tiểu sử</p>
                  <p className="mt-1 max-w-prose whitespace-pre-wrap text-[15px] leading-relaxed text-dark">
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
