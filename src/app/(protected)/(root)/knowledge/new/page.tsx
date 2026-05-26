"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { useAuth } from "@/components/AuthProvider";
import { getAllGroups, Group } from "@/lib/firebase/members";
import { createArticle } from "@/lib/firebase/knowledge";
import { cn } from "@/lib/utils";

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

  const [step, setStep] = useState(1);

  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("hr");
  const [content, setContent] = useState("");

  const [scope, setScope] = useState<"all" | "group" | "admin">("all");

  const [allowedGroups, setAllowedGroups] = useState<string[]>([]);

  const [tagsInput, setTagsInput] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const data = await getAllGroups();
        setGroups(data);
      } catch (error) {
        console.error(error);
        toast.error("グループ一覧の取得に失敗しました。");
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

  const parsedTags = useMemo(() => {
    return tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [tagsInput]);

  const getReadTime = (text: string) => {
    const chars = text.replace(/\s/g, "").length;
    return Math.max(1, Math.ceil(chars / 500));
  };

  const catInfo = CATEGORIES.find((c) => c.id === category);

  const handleNextToPreview = () => {
    if (!title.trim()) {
      toast.warning("タイトルを入力してください。");
      return;
    }

    if (!content.trim()) {
      toast.warning("本文を入力してください。");
      return;
    }

    if (scope === "group" && allowedGroups.length === 0) {
      toast.warning("少なくとも1つのグループを選択してください。");
      return;
    }

    setStep(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePublish = async () => {
    if (!user) {
      toast.error("ログイン情報が見つかりません。");
      return;
    }

    try {
      setSaving(true);
      setStep(3);

      await createArticle({
        title: title.trim(),
        summary: summary.trim(),
        content,
        category,
        tags: parsedTags,
        scope,
        allowedGroups: scope === "group" ? allowedGroups : [],
        createdBy: user.uid,
        authorName:
          user.displayName ||
          user.email?.split("@")[0] ||
          "ユーザー",
        authorPhoto: user.photoURL || "",
      });

      toast.success("記事を正常に公開しました！");

      router.push("/knowledge");
    } catch (error) {
      console.error(error);

      toast.error("公開に失敗しました。");

      setStep(2);
    } finally {
      setSaving(false);
    }
  };

  const renderContent = (text: string) => {
    if (!text.trim()) {
      return (
        <p className="text-stone italic">
          プレビューするコンテンツはありません。
        </p>
      );
    }

    return (
      <div
        className={cn(
          "prose prose-stone max-w-none",
          "prose-headings:font-heading",
          "prose-headings:text-near-black",
          "prose-p:text-stone",
          "prose-p:leading-8",
          "prose-strong:text-near-black",
          "prose-li:text-stone",
          "prose-code:text-terracotta",
          "prose-code:before:content-none",
          "prose-code:after:content-none",
          "prose-pre:bg-[#1f1f1f]",
          "prose-pre:border",
          "prose-pre:border-neutral-700",
          "prose-pre:rounded-2xl",
          "prose-blockquote:border-terracotta",
          "prose-a:text-terracotta"
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="bg-[#faf8f4] min-h-[calc(100vh-5rem)] p-6 lg:p-12 text-near-black">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back Button */}
        <button
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            } else {
              router.push("/knowledge");
            }
          }}
          className="flex items-center gap-2 text-stone hover:text-near-black transition-colors text-xs font-bold"
        >
          <ArrowLeft size={16} />

          {step === 1
            ? "ナレッジベースに戻る"
            : "前のステップに戻る"}
        </button>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((s, idx) => {
            const StepIcon = s.icon;

            const isActive = step === s.id;
            const isCompleted = step > s.id;

            return (
              <div key={s.id} className="flex items-center">
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
                      isActive
                        ? "text-terracotta"
                        : isCompleted
                          ? "text-near-black"
                          : "text-stone/40"
                    )}
                  >
                    {s.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-20 h-0.5 mx-3 mb-5 rounded-full transition-colors duration-300",
                      step > s.id
                        ? "bg-terracotta"
                        : "bg-cream"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

            <div>
              <h1 className="text-3xl font-heading font-bold">
                記事を作成
              </h1>

              <p className="text-stone text-sm mt-1">
                内容を入力して次へ進んでください。
              </p>
            </div>

            {/* Main Form */}
            <div className="bg-white border border-cream rounded-3xl p-6 shadow-sm space-y-6">

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone uppercase tracking-widest">
                  記事タイトル
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="記事タイトルを入力..."
                  className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-sm"
                />
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone uppercase tracking-widest">
                  概要（任意）
                </label>

                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="概要を入力..."
                  className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-sm"
                />
              </div>

              {/* Category + Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone uppercase tracking-widest">
                    カテゴリー
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone uppercase tracking-widest flex items-center gap-1">
                    <TagIcon size={12} />
                    タグ
                  </label>

                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="React, Next.js, Firebase"
                    className="w-full px-4 py-3 bg-ivory/30 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-sm"
                  />
                </div>
              </div>

              {/* Scope */}
              <div className="space-y-2 border-t border-cream/50 pt-4">

                <label className="text-[10px] font-bold text-stone uppercase tracking-widest">
                  公開範囲
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                  <button
                    type="button"
                    onClick={() => setScope("all")}
                    className={cn(
                      "flex items-center gap-2 p-3.5 rounded-2xl border text-left transition-all font-bold text-xs",
                      scope === "all"
                        ? "border-terracotta bg-terracotta/[0.03]"
                        : "border-cream hover:bg-cream/20"
                    )}
                  >
                    <BookOpen size={14} />
                    全員に公開
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope("group")}
                    className={cn(
                      "flex items-center gap-2 p-3.5 rounded-2xl border text-left transition-all font-bold text-xs",
                      scope === "group"
                        ? "border-terracotta bg-terracotta/[0.03]"
                        : "border-cream hover:bg-cream/20"
                    )}
                  >
                    <Users size={14} />
                    グループ限定
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope("admin")}
                    className={cn(
                      "flex items-center gap-2 p-3.5 rounded-2xl border text-left transition-all font-bold text-xs",
                      scope === "admin"
                        ? "border-terracotta bg-terracotta/[0.03]"
                        : "border-cream hover:bg-cream/20"
                    )}
                  >
                    <Shield size={14} />
                    管理者のみ
                  </button>
                </div>

                {/* Groups */}
                {scope === "group" && (
                  <div className="p-4 bg-ivory/40 border border-cream rounded-2xl space-y-2 mt-2">

                    {loadingGroups ? (
                      <Loader2 className="w-4 h-4 animate-spin text-terracotta" />
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {groups.map((group) => {
                          const checked = allowedGroups.includes(group.id);

                          return (
                            <label
                              key={group.id}
                              className="flex items-center gap-2 text-xs cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  handleGroupToggle(group.id)
                                }
                                className="accent-terracotta"
                              />

                              {group.name}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Markdown Editor */}
              <div className="space-y-2">

                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-stone uppercase tracking-widest">
                    本文
                  </label>

                  <span className="text-[10px] text-stone">
                    Markdown対応
                  </span>
                </div>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`# タイトル

## サブタイトル

- リスト
- リスト

**太字**

\`\`\`ts
const hello = "world";
\`\`\`
`}
                  rows={18}
                  className={cn(
                    "w-full px-4 py-4",
                    "bg-ivory/30 border border-cream rounded-2xl",
                    "focus:outline-none focus:ring-2 focus:ring-terracotta/20",
                    "font-mono text-sm leading-7",
                    "resize-y"
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">

              <button
                type="button"
                onClick={() => router.push("/knowledge")}
                className="px-6 py-3 rounded-2xl border border-cream text-stone hover:bg-cream/40 text-xs font-bold transition-all"
              >
                キャンセル
              </button>

              <button
                type="button"
                onClick={handleNextToPreview}
                className="px-8 py-3 bg-terracotta text-white rounded-2xl text-xs font-bold hover:bg-[#bf5d3c] transition-all flex items-center gap-1.5"
              >
                次へ：プレビュー

                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

            <div>
              <h1 className="text-3xl font-heading font-bold">
                プレビュー
              </h1>

              <p className="text-stone text-sm mt-1">
                公開前に内容を確認してください。
              </p>
            </div>

            <div className="bg-white border border-cream rounded-[32px] p-8 lg:p-10 shadow-sm space-y-6">

              {/* Header */}
              <div className="border-b border-cream/50 pb-6 space-y-4">

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#f0ede6] border border-cream text-stone text-[10px] font-bold rounded-md">
                    {catInfo?.name}
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

                <h1 className="text-4xl font-extrabold font-heading leading-tight">
                  {title}
                </h1>

                {summary && (
                  <p className="text-xs text-stone/80 bg-ivory/30 border border-cream rounded-xl p-4 italic leading-relaxed">
                    {summary}
                  </p>
                )}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cream border border-cream overflow-hidden flex items-center justify-center">

                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={14} />
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold">
                        {user?.displayName ||
                          user?.email?.split("@")[0] ||
                          "ユーザー"}
                      </p>

                      <p className="text-[10px] text-stone">
                        公開予定
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-stone font-bold">
                    <Clock size={11} />

                    {getReadTime(content)}分
                  </div>
                </div>

                {parsedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {parsedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-cream/60 text-stone text-[9px] font-bold rounded-md border border-cream"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Markdown Preview */}
              <div className="min-h-[200px]">
                {renderContent(content)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">

              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-2xl border border-cream text-stone hover:bg-cream/40 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                編集に戻る
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="px-8 py-3 bg-terracotta text-white rounded-2xl text-xs font-bold hover:bg-[#bf5d3c] disabled:opacity-50 transition-all flex items-center gap-1.5"
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

        {/* STEP 3 */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-terracotta" />

            <p className="text-sm font-bold">
              記事を公開しています...
            </p>

            <p className="text-xs text-stone">
              しばらくお待ちください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}