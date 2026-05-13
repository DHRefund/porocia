"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createAnnouncement } from "@/lib/firebase/announcements";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  X, 
  Info,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Eye
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success" | "event">("info");
  const [isPinned, setIsPinned] = useState(false);
  
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning("画像サイズが大きすぎます", {
          description: "5MB以下の画像を選択してください。",
        });
        e.target.value = ""; // Reset input
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "porocia");
    formData.append("folder", `porocia/announcements/${user?.uid}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Cloudinaryへの画像アップロード中にエラーが発生しました");
    }
    
    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.warning("入力内容が不足しています", {
        description: "タイトルと内容をすべて入力してください。",
      });
      return;
    }
    if (!user) {
      toast.error("ログインが必要です", {
        description: "操作を続けるにはログインしてください。",
      });
      return;
    }

    setLoading(true);
    try {
      let imageURL = null;
      if (image) {
        setUploadingImage(true);
        imageURL = await uploadToCloudinary(image);
        setUploadingImage(false);
      }

      await createAnnouncement({
        title,
        content,
        type,
        isPinned,
        imageURL,
        authorId: user.uid,
        authorName: profile?.displayName || user.email?.split("@")[0] || "Admin",
      });

      // Clear form
      setTitle("");
      setContent("");
      setType("info");
      setIsPinned(false);
      setImage(null);
      setImagePreview(null);

      toast.success(type === "event" ? "イベントを投稿しました" : "お知らせを投稿しました", {
        description: "メンバー全員に通知が送信されました。",
      });

      router.push("/dashboard/announcements");
    } catch (error) {
      console.error("Failed to create announcement:", error);
      toast.error("投稿に失敗しました", {
        description: "エラーが発生しました。もう一度お試しください。",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/announcements" 
          className="p-2 hover:bg-cream rounded-xl transition-colors text-stone"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-near-black">新しいお知らせを投稿</h1>
          <p className="text-stone">システム内のすべてのメンバーに送信されるお知らせを作成します。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-cream rounded-2xl p-8 shadow-sm space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone uppercase tracking-wider">お知らせのタイトル</label>
              <input 
                type="text" 
                placeholder="簡潔で分かりやすいタイトルを入力..."
                className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all text-lg font-bold text-near-black"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Type & Pin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone uppercase tracking-wider">お知らせのタイプ</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "info", icon: Info, label: "情報" },
                    { val: "warning", icon: AlertTriangle, label: "警告" },
                    { val: "success", icon: CheckCircle, label: "成功" },
                    { val: "event", icon: Calendar, label: "イベント" },
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setType(t.val as any)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all",
                        type === t.val 
                          ? "border-terracotta bg-terracotta/5 text-terracotta font-bold" 
                          : "border-cream bg-white text-stone hover:border-terracotta/50"
                      )}
                    >
                      <t.icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone uppercase tracking-wider">表示オプション</label>
                <label className="flex items-center gap-3 p-3 border border-cream rounded-xl bg-white cursor-pointer hover:bg-ivory/50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-cream text-terracotta focus:ring-terracotta"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                  />
                  <div>
                    <p className="font-bold text-near-black text-sm">トップにピン留め</p>
                    <p className="text-xs text-stone">最上部に優先的に表示します</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone uppercase tracking-wider">詳細内容</label>
              <textarea 
                rows={8}
                placeholder="お知らせの内容を入力してください..."
                className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all text-[15px] leading-relaxed text-near-black"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone uppercase tracking-wider">画像（任意）</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-cream rounded-2xl bg-ivory/10 hover:bg-ivory/30 hover:border-terracotta/30 cursor-pointer transition-all"
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full p-2">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setImage(null); setImagePreview(null); }}
                        className="absolute top-4 right-4 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-stone group-hover:text-terracotta transition-colors">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <p className="font-bold">クリックして画像をアップロード</p>
                      <p className="text-xs">PNG, JPG, GIF (最大5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Link 
              href="/dashboard/announcements"
              className="px-6 py-3 text-stone font-bold hover:text-near-black transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-terracotta text-ivory rounded-xl font-bold shadow-lg shadow-terracotta/20 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin"></div>
                  {uploadingImage ? "画像をアップロード中..." : "保存中..."}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  お知らせを投稿
                </>
              )}
            </button>
          </div>
        </form>

        {/* Sidebar / Tips */}
        <div className="space-y-6">
          <div className="bg-ivory/50 border border-cream rounded-2xl p-6">
            <h3 className="font-bold text-near-black flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-terracotta" />
              プレビュー
            </h3>
            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-xl border-l-4",
                type === 'info' ? "bg-blue-50 border-blue-500 text-blue-900" :
                type === 'warning' ? "bg-amber-50 border-amber-500 text-amber-900" :
                type === 'success' ? "bg-emerald-50 border-emerald-500 text-emerald-900" :
                "bg-rose-50 border-rose-500 text-rose-900"
              )}>
                <h4 className="font-bold text-sm mb-1">{title || "タイトルのプレビュー"}</h4>
                <p className="text-xs opacity-80 line-clamp-3">{content || "ここにお知らせの内容が表示されます..."}</p>
              </div>
              <p className="text-[11px] text-stone text-center italic">※これはクイックプレビューです。</p>
            </div>
          </div>

          <div className="bg-white border border-cream rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-near-black mb-3">ヒント</h3>
            <ul className="text-sm text-stone space-y-3">
              <li className="flex gap-2">
                <span className="text-terracotta">•</span>
                重要なニュースはピン留めして、見逃されないようにしましょう。
              </li>
              <li className="flex gap-2">
                <span className="text-terracotta">•</span>
                画像を使用すると、投稿がより目立ちやすくなります。
              </li>
              <li className="flex gap-2">
                <span className="text-terracotta">•</span>
                ユーザーが判別しやすいよう、適切なタイプ（警告、イベントなど）を選択してください。
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
