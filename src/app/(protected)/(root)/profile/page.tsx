"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/AuthProvider";
import { uploadAvatar, updateUserProfile } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, User } from "lucide-react";

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
        toast.error("プロフィールの読み込みに失敗しました", {
          description: "しばらくしてから再度お試しください。",
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
      toast.success("プロフィールを更新しました", {
        description: "プロフィールが正常に更新されました。",
      });
    } catch (e) {
      toast.error("プロフィールの保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("画像サイズが大きすぎます", { 
        description: "2MB 以下の画像を選択してください。" 
      });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadAvatar(user.uid, file);
      await updateUserProfile(user.uid, { photoURL: url });
      setProfile((prev: any) => ({ ...prev, photoURL: url }));
      toast.success("アバター画像を更新しました");
    } catch (error) {
      console.error(error);
      toast.error("画像のアップロードに失敗しました");
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
                <img src={profile.photoURL} alt="アバター" className="h-full w-full object-cover" />
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
              マイプロフィール
            </h1>
            <p className="mt-1 text-[15px] text-olive">
              個人情報や設定を管理できます。
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          
          {/* Email (Read only) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone/80">
              メールアドレス
            </label>
            <div className="mt-2.5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0ede6] text-stone">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-[15px] font-medium text-dark">
                {profile?.email || user?.email}
              </span>
            </div>
          </div>

          {/* Role - Improved styling */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone/80">
              ロール
            </label>
            <div className="mt-2.5">
              {profile?.role === "admin" ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-50 to-amber-50 px-4 py-1.5 text-[13px] font-semibold text-red-700 border border-red-200 shadow-sm">
                  <Shield className="h-3.5 w-3.5 text-red-500" />
                  管理者
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f0ede6] to-ivory px-4 py-1.5 text-[13px] font-semibold text-stone border border-cream shadow-sm">
                  <User className="h-3.5 w-3.5 text-olive" />
                  メンバー
                </span>
              )}
            </div>
          </div>

          <hr className="border-t border-cream/60" />

          {/* Editable Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-near-black">表示情報</h2>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="rounded-full border-warm bg-transparent text-dark hover:bg-sand transition-all duration-200"
                >
                  編集する
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-5 rounded-2xl border border-warm bg-parchment/50 p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">表示名</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 rounded-xl border-cream bg-ivory focus-visible:ring-terracotta transition-all"
                    placeholder="表示名を入力..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-dark">自己紹介</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-xl border border-cream bg-ivory p-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-terracotta transition-all"
                    placeholder="自分について簡単に記入してください..."
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
                    className="rounded-xl text-olive hover:bg-cream transition-all"
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-terracotta text-white hover:bg-[#bf5d3c] disabled:opacity-70 transition-all"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        保存中...
                      </span>
                    ) : (
                      "変更を保存"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone/80">表示名</p>
                  <p className="mt-2.5 text-[16px] font-medium text-near-black">
                    {profile?.displayName || "未設定"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone/80">自己紹介</p>
                  <p className="mt-2.5 max-w-prose whitespace-pre-wrap text-[15px] leading-relaxed text-dark">
                    {profile?.bio || "自己紹介はまだありません。"}
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