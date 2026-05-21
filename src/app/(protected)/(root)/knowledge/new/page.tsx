"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getAllGroups, Group } from "@/lib/firebase/members";
import { createArticle } from "@/lib/firebase/knowledge";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  Edit3,
  Tag as TagIcon,
  Lock,
  Users,
  Shield,
  Loader2,
  BookOpen,
  Check,
  User,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "hr", name: "人事・総務" },
  { id: "tech", name: "開発・技術" },
  { id: "design", name: "デザイン" },
  { id: "onboarding", name: "オンボーディング" },
  { id: "sales", name: "営業・マーケ" },
];

const STEPS = [
  { id: 1, label: "記事を作成", icon: Edit3 },
  { id: 2, label: "プレビュー", icon: Eye },
  { id: 3, label: "公開", icon: Save },
];

export default function NewArticlePage() {
  const router = useRouter();
  const { user } = useAuth();

  // Wizard step: 1 = edit, 2 = preview, 3 = publishing
  const [step, setStep] = useState(1);

  // System Groups
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Form States
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("hr");
  const [content, setContent] = useState("");
  const [scope, setScope] = useState<"all" | "group" | "admin">("all");
  const [allowedGroups, setAllowedGroups] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");

  const [saving, setSaving] = useState(false);

  // Fetch groups
  useEffect(() => {
    async function fetchGroups() {
      try {
        const allGroups = await getAllGroups();
        setGroups(allGroups);
      } catch (err) {
        console.error("Failed to load groups:", err);
      } finally {
        setLoadingGroups(false);
      }
    }
    fetchGroups();
  }, []);

  const handleGroupToggle = (groupId: string) => {
    setAllowedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Step 1 → Step 2 validation
  const handleNextToPreview = () => {
    if (!title.trim()) {
      toast.warning("タイトルを入力してください。");
      return;
    }
    if (!content.trim()) {
      toast.warning("本文を入力してください。");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 → Step 3 publish
  const handlePublish = async () => {
    if (!user) {
      toast.error("ログイン情報が見つかりません。");
      return;
    }

    setSaving(true);
    setStep(3);
    try {
      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await createArticle({
        title: title.trim(),
        content: content,
        summary: summary.trim(),
        category,
        tags: parsedTags,
        scope,
        allowedGroups: scope === "group" ? allowedGroups : [],
        createdBy: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "ユーザー",
        authorPhoto: user.photoURL || "",
      });

      toast.success("記事を正常に公開しました！");
      router.push("/knowledge");
    } catch (err) {
      console.error("Failed to publish article:", err);
      toast.error("公開に失敗しました。もう一度お試しください。");
      setStep(2); // go back to preview on failure
    } finally {
      setSaving(false);
    }
  };

  // Smart content renderer
  const renderContent = (text: string) => {
    if (!text) return <p className="text-stone italic">プレビューするコンテンツはありません。</p>;

    const hasMarkdown = /^\s*(#|\*|-|\d+\.)|\*\*/m.test(text);

    if (!hasMarkdown) {
      return (
        <div className="text-sm text-stone leading-relaxed whitespace-pre-wrap font-sans">
          {text}
        </div>
      );
    }

    const lines = text.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("# ")) {
        return <h1 key={index} className="text-3xl font-bold font-heading mt-6 mb-4 pb-2 border-b border-cream">{line.substring(2)}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={index} className="text-2xl font-bold font-heading mt-5 mb-3">{line.substring(3)}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={index} className="text-xl font-bold font-heading mt-4 mb-2">{line.substring(4)}</h3>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={index} className="ml-6 list-disc text-stone py-1 text-sm">{line.substring(2)}</li>;
      }
      if (/^\d+\.\s/.test(line)) {
        const cleanText = line.replace(/^\d+\.\s/, "");
        return <li key={index} className="ml-6 list-decimal text-stone py-1 text-sm">{cleanText}</li>;
      }
      if (line.trim() === "") {
        return <div key={index} className="h-3" />;
      }
      return (
        <p key={index} className="text-sm text-stone leading-relaxed py-1.5">
          {line.split("**").map((part, pIdx) => {
            if (pIdx % 2 === 1) return <strong key={pIdx} className="font-extrabold text-near-black">{part}</strong>;
            return part;
          })}
        </p>
      );
    });
  };

  const getReadTime = (text: string) => {
    const minutes = Math.ceil(text.length / 400);
    return minutes > 0 ? minutes : 1;
  };

  const catInfo = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="bg-[#faf8f4] min-h-[calc(100vh-5rem)] p-6 lg:p-12 text-near-black">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back navigation */}
        <button
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              router.push("/knowledge");
            }
          }}
          className="flex items-center gap-2 text-stone hover:text-near-black transition-colors text-xs font-bold"
        >
          <ArrowLeft size={16} />
          {step === 1 ? "ナレッジベースに戻る" : "前のステップに戻る"}
        </button>

        {/* ── Step Indicator Bar ── */}
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((s, idx) => {
            const StepIcon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;

            return (
              <div key={s.id} className="flex items-center">
                {/* Step circle + label */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isCompleted
                        ? "bg-terracotta border-terracotta text-white"
                        : isActive
                          ? "bg-white border-terracotta text-terracotta shadow-md shadow-terracotta/10"
                          : "bg-cream/40 border-cream text-stone/40"
                    )}
                  >
                    {isCompleted ? (
                      <Check size={16} strokeWidth={3} />
                    ) : (
                      <StepIcon size={16} />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold transition-colors",
                      isActive ? "text-terracotta" : isCompleted ? "text-near-black" : "text-stone/40"
                    )}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-20 h-0.5 mx-3 mb-5 rounded-full transition-colors duration-300",
                      step > s.id ? "bg-terracotta" : "bg-cream"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* STEP 1: Editor Form                         */}
        {/* ════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Page Title */}
            <div>
              <h1 className="text-3xl font-heading font-bold text-near-black">記事を作成</h1>
              <p className="text-stone text-sm mt-1">内容を入力して、次のステップへ進んでください。</p>
            </div>

            {/* Title & summary block */}
            <div className="bg-white border border-cream rounded-3xl p-6 shadow-sm space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone uppercase tracking-widest">記事タイトル</label>
                <input
                  type="text"
                  required
                  placeholder="記事のタイトルを入力してください"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black text-sm font-medium transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone uppercase tracking-widest">概要（任意）</label>
                <input
                  type="text"
                  placeholder="記事の概要を入力してください"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black text-xs font-medium transition-all"
                />
              </div>
            </div>

            {/* Category & Tags & Scope Configuration block */}
            <div className="bg-white border border-cream rounded-3xl p-6 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone uppercase tracking-widest">カテゴリー</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black text-sm font-bold transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone uppercase tracking-widest flex items-center gap-1">
                    <TagIcon size={12} />
                    タグ（カンマ区切り・任意）
                  </label>
                  <input
                    type="text"
                    placeholder="タグを入力してください"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black text-sm font-medium transition-all"
                  />
                </div>
              </div>

              {/* Scope/Privacy Selector */}
              <div className="space-y-2 border-t border-cream/50 pt-4">
                <label className="text-[10px] font-bold text-stone uppercase tracking-widest">公開範囲</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setScope("all")}
                    className={cn(
                      "flex items-center gap-2 p-3.5 rounded-2xl border text-left transition-all font-bold text-xs",
                      scope === "all"
                        ? "border-terracotta bg-terracotta/[0.03] text-near-black"
                        : "border-cream hover:bg-cream/20 bg-ivory/10 text-stone"
                    )}
                  >
                    <BookOpen size={14} className="text-terracotta" />
                    全員に公開
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope("group")}
                    className={cn(
                      "flex items-center gap-2 p-3.5 rounded-2xl border text-left transition-all font-bold text-xs",
                      scope === "group"
                        ? "border-terracotta bg-terracotta/[0.03] text-near-black"
                        : "border-cream hover:bg-cream/20 bg-ivory/10 text-stone"
                    )}
                  >
                    <Users size={14} className="text-terracotta" />
                    グループ限定
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope("admin")}
                    className={cn(
                      "flex items-center gap-2 p-3.5 rounded-2xl border text-left transition-all font-bold text-xs",
                      scope === "admin"
                        ? "border-terracotta bg-terracotta/[0.03] text-near-black"
                        : "border-cream hover:bg-cream/20 bg-ivory/10 text-stone"
                    )}
                  >
                    <Shield size={14} className="text-terracotta" />
                    管理者のみ
                  </button>
                </div>

                {/* Sub groups list checkboxes if group selected */}
                {scope === "group" && (
                  <div className="p-4 bg-ivory/40 border border-cream rounded-2xl space-y-2 mt-2 max-h-44 overflow-y-auto">
                    <p className="text-[10px] font-bold text-stone uppercase tracking-widest mb-2">閲覧を許可するグループを選択:</p>
                    {loadingGroups ? (
                      <Loader2 className="w-4 h-4 animate-spin text-terracotta" />
                    ) : groups.length === 0 ? (
                      <span className="text-xs text-stone italic">有効なグループが存在しません</span>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {groups.map((g) => {
                          const isChecked = allowedGroups.includes(g.id);
                          return (
                            <label key={g.id} className="flex items-center gap-2 cursor-pointer text-xs text-stone hover:text-near-black">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleGroupToggle(g.id)}
                                className="accent-terracotta rounded"
                              />
                              {g.name}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Document Content Textarea */}
            <div className="bg-white border border-cream rounded-3xl p-6 shadow-sm space-y-2">
              <label className="text-[10px] font-bold text-stone uppercase tracking-widest">本文</label>
              <textarea
                required
                placeholder="共有したい内容を入力してください..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="w-full px-4 py-4 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-near-black text-sm font-medium transition-all leading-relaxed"
              />
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => router.push("/knowledge")}
                className="px-6 py-3 rounded-2xl border border-cream text-stone hover:bg-cream/40 text-xs font-bold transition-all active:scale-[0.98]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleNextToPreview}
                className="px-8 py-3 bg-terracotta text-ivory rounded-2xl text-xs font-bold hover:bg-[#bf5d3c] transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-lg shadow-terracotta/15"
              >
                次へ：プレビュー
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* STEP 2: Preview                             */}
        {/* ════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Page Title */}
            <div>
              <h1 className="text-3xl font-heading font-bold text-near-black">プレビュー</h1>
              <p className="text-stone text-sm mt-1">公開前に内容を確認してください。問題がなければ「公開する」を押してください。</p>
            </div>

            {/* Preview Card */}
            <div className="bg-white border border-cream rounded-[32px] p-8 lg:p-10 shadow-sm space-y-6">
              {/* Header area */}
              <div className="border-b border-cream/50 pb-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#f0ede6] border border-cream text-stone text-[10px] font-bold rounded-md">
                    {catInfo?.name || category}
                  </span>

                  {scope === "admin" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-600 border border-red-200">
                      <Shield size={10} />
                      管理者のみ
                    </span>
                  )}
                  {scope === "group" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Lock size={10} />
                      限定公開
                    </span>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-extrabold font-heading text-near-black leading-tight">
                  {title || "（タイトル未入力）"}
                </h1>

                {summary && (
                  <p className="text-xs text-stone/80 bg-ivory/30 border border-cream rounded-xl p-4 italic leading-relaxed">
                    {summary}
                  </p>
                )}

                {/* Author row info */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cream border border-cream overflow-hidden flex items-center justify-center text-xs font-bold text-stone">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} className="text-stone/60" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-near-black">
                        {user?.displayName || user?.email?.split("@")[0] || "ユーザー"}
                      </p>
                      <p className="text-[10px] text-stone mt-0.5">公開予定</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-stone text-[10px] font-bold bg-[#f0ede6]/40 px-3 py-1.5 border border-cream/50 rounded-xl">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {getReadTime(content)}分
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {tagsInput.trim() && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tagsInput.split(",").map((tag, i) => tag.trim() && (
                      <span key={i} className="px-2 py-0.5 bg-cream/60 text-stone text-[9px] font-bold rounded-md border border-cream">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rendered content body */}
              <div className="prose max-w-none min-h-[200px]">
                {renderContent(content)}
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-6 py-3 rounded-2xl border border-cream text-stone hover:bg-cream/40 text-xs font-bold transition-all active:scale-[0.98] flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                編集に戻る
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="px-8 py-3 bg-terracotta text-ivory rounded-2xl text-xs font-bold hover:bg-[#bf5d3c] disabled:opacity-50 transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-lg shadow-terracotta/15"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    公開中...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    この内容で公開する
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* STEP 3: Publishing (loading state)          */}
        {/* ════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-terracotta" />
            <p className="text-sm font-bold text-near-black">記事を公開しています...</p>
            <p className="text-xs text-stone">しばらくお待ちください。</p>
          </div>
        )}

      </div>
    </div>
  );
}
