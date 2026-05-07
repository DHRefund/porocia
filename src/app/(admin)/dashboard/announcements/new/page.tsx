"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
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
        alert("Kích thước ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");
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
      throw new Error(errorData.error?.message || "Lỗi khi tải ảnh lên Cloudinary");
    }
    
    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("Vui lòng điền đầy đủ tiêu đề và nội dung!");
    if (!user) return alert("Bạn cần đăng nhập!");

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

      router.push("/dashboard/announcements");
    } catch (error) {
      console.error("Failed to create announcement:", error);
      alert("Đã có lỗi xảy ra!");
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
          <h1 className="text-3xl font-heading font-bold text-near-black">Đăng Thông báo mới</h1>
          <p className="text-stone">Tạo thông báo để gửi đến tất cả thành viên trong hệ thống.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-cream rounded-2xl p-8 shadow-sm space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone uppercase tracking-wider">Tiêu đề thông báo</label>
              <input 
                type="text" 
                placeholder="Nhập tiêu đề ngắn gọn, súc tích..."
                className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all text-lg font-bold text-near-black"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Type & Pin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone uppercase tracking-wider">Loại thông báo</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "info", icon: Info, label: "Thông tin" },
                    { val: "warning", icon: AlertTriangle, label: "Cảnh báo" },
                    { val: "success", icon: CheckCircle, label: "Thành công" },
                    { val: "event", icon: Calendar, label: "Sự kiện" },
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
                <label className="text-sm font-bold text-stone uppercase tracking-wider">Tùy chọn hiển thị</label>
                <label className="flex items-center gap-3 p-3 border border-cream rounded-xl bg-white cursor-pointer hover:bg-ivory/50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-cream text-terracotta focus:ring-terracotta"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                  />
                  <div>
                    <p className="font-bold text-near-black text-sm">Ghim lên đầu trang</p>
                    <p className="text-xs text-stone">Ưu tiên hiển thị ở vị trí cao nhất</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone uppercase tracking-wider">Nội dung chi tiết</label>
              <textarea 
                rows={8}
                placeholder="Nhập nội dung thông báo tại đây..."
                className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all text-[15px] leading-relaxed text-near-black"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone uppercase tracking-wider">Ảnh minh họa (Không bắt buộc)</label>
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
                      <p className="font-bold">Nhấn để tải ảnh lên</p>
                      <p className="text-xs">PNG, JPG, GIF lên đến 5MB</p>
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
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-terracotta text-ivory rounded-xl font-bold shadow-lg shadow-terracotta/20 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin"></div>
                  {uploadingImage ? "Đang tải ảnh..." : "Đang lưu..."}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Đăng thông báo
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
              Xem trước hiển thị
            </h3>
            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-xl border-l-4",
                type === 'info' ? "bg-blue-50 border-blue-500 text-blue-900" :
                type === 'warning' ? "bg-amber-50 border-amber-500 text-amber-900" :
                type === 'success' ? "bg-emerald-50 border-emerald-500 text-emerald-900" :
                "bg-rose-50 border-rose-500 text-rose-900"
              )}>
                <h4 className="font-bold text-sm mb-1">{title || "Tiêu đề mẫu"}</h4>
                <p className="text-xs opacity-80 line-clamp-3">{content || "Nội dung thông báo sẽ hiển thị tại đây..."}</p>
              </div>
              <p className="text-[11px] text-stone text-center italic">Đây là bản xem trước nhanh của thông báo.</p>
            </div>
          </div>

          <div className="bg-white border border-cream rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-near-black mb-3">Mẹo nhỏ</h3>
            <ul className="text-sm text-stone space-y-3">
              <li className="flex gap-2">
                <span className="text-terracotta">•</span>
                Ghim các thông báo quan trọng để mọi người không bỏ lỡ.
              </li>
              <li className="flex gap-2">
                <span className="text-terracotta">•</span>
                Sử dụng ảnh minh họa để bài đăng thu hút hơn.
              </li>
              <li className="flex gap-2">
                <span className="text-terracotta">•</span>
                Chọn đúng loại thông báo (Cảnh báo, Sự kiện...) để user dễ phân biệt.
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
