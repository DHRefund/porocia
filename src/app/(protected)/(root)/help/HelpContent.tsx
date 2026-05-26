"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Bell,
  Calendar,
  Users,
  BookOpen,
  User,
  Hash,
  Clock,
  BookOpenCheck,
  Sparkles,
  Info,
  ShieldAlert,
  Check,
  Lock,
  Layers,
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const sections = [
  { id: "chat", label: "チャット機能", icon: MessageSquare, num: "01" },
  { id: "announcements", label: "お知らせ", icon: Bell, num: "02" },
  { id: "calendar", label: "カレンダー", icon: Calendar, num: "03" },
  { id: "people", label: "メンバーディレクトリ", icon: Users, num: "04" },
  { id: "knowledge", label: "ナレッジベース", icon: BookOpen, num: "05" },
  { id: "profile", label: "プロフィール管理", icon: User, num: "06" },
];

export function HelpContent() {
  const [activeSection, setActiveSection] = useState("chat");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    const sectionElements = document.querySelectorAll("section[id]");
    sectionElements.forEach((el) => observer.observe(el));

    return () => {
      sectionElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    toast.success("リンクをコピーしました", {
      description: "セクションへの直接リンクがクリップボードに保存されました。",
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background md:flex-row font-sans">
      {/* ── Mobile Horizontal Navigation ── */}
      <div className="sticky top-0 z-30 flex gap-2 overflow-x-auto bg-ivory/95 backdrop-blur-md border-b border-cream px-4 py-3 md:hidden [scrollbar-width:none]">
        {sections.map((s) => {
          const isActive = activeSection === s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => {
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                isActive
                  ? "bg-terracotta text-ivory shadow-sm shadow-terracotta/10"
                  : "bg-cream/40 text-olive hover:bg-cream/70"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── Left Sidebar (Desktop Only) ── */}
      <aside className="hidden w-72 flex-shrink-0 border-r border-border bg-ivory md:block">
        <div className="sticky top-0 flex h-[calc(100vh-5rem)] flex-col overflow-y-auto px-6 py-10">
          <div className="mb-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-terracotta">
              User Documentation
            </span>
            <h3 className="mt-1 font-serif-jp text-xl font-bold tracking-tight text-near-black">
              Porocia ガイド
            </h3>
          </div>
          <nav className="flex-1 space-y-1">
            {sections.map((s) => {
              const isActive = activeSection === s.id;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium transition-all text-left cursor-pointer",
                    isActive
                      ? "bg-sand/40 text-near-black font-semibold shadow-[inset_0px_0px_0px_1px_#faf9f5]"
                      : "text-olive hover:bg-cream/40 hover:text-near-black"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3.5px] -translate-y-1/2 rounded-r-full bg-terracotta" />
                  )}
                  <Icon className={cn(
                    "h-[18px] w-[18px] transition-colors",
                    isActive ? "text-terracotta" : "text-stone group-hover:text-olive"
                  )} />
                  <span className="flex-1 leading-none">{s.label}</span>
                  <span className={cn(
                    "text-[10px] font-mono tracking-wider opacity-40",
                    isActive ? "text-terracotta font-semibold" : "text-stone"
                  )}>
                    {s.num}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 overflow-y-auto [scroll-behavior:smooth]">
        <article className="mx-auto max-w-3xl px-6 py-12 lg:px-14 lg:py-16">

          {/* Article Header */}
          <header className="mb-14">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-terracotta uppercase">
              <Sparkles className="h-3 w-3" />
              <span>Porocia Help Center</span>
            </div>
            <h1 className="mt-3 font-serif-jp text-4.5xl font-semibold tracking-tight text-near-black leading-tight sm:text-5xl">
              Porocia ユーザーガイド
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-olive max-w-2xl">
              Porociaは、チームのための共同ワークスペースです。同僚とメッセージのやり取りをしたり、知識を共有したり、お知らせを投稿したり、日々の業務をともに進めたり——すべてをひとつの場所で。
            </p>

            {/* Meta Row */}
            <div className="mt-8 flex flex-wrap items-center gap-6 border-b border-cream pb-8 text-[13px] text-stone font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-terracotta" />
                読了時間: 約 6 分
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpenCheck className="h-4 w-4 text-terracotta" />
                最終更新: 2026年5月
              </span>
              <span className="rounded-full bg-cream/50 px-2.5 py-0.5 text-xs text-olive">
                v1.2.0 Stable
              </span>
            </div>
          </header>

          {/* CHAT */}
          <section id="chat" className="scroll-mt-24 py-6">
            <SectionLabel num="01" />
            <SectionTitle id="chat" onCopy={handleCopyLink}>チャット機能</SectionTitle>

            <p className="mt-4 text-[15px] leading-relaxed text-olive">
              チームや個人とリアルタイムでやり取りできるチャット機能です。プロジェクトの相談から日常的な連絡まで、目的に合わせた3種類のチャットを使い分けることができます。
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-cream bg-ivory p-5 transition-all hover:shadow-[0px_8px_30px_rgba(201,100,66,0.05)] hover:border-terracotta/20 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-600 mb-4 transition-transform group-hover:scale-105">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-near-black text-[14.5px]">Public / 公開</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-olive">社内の誰でも参加・閲覧できるチャンネル。部署を超えた情報共有や全社向けの連絡に活用できます。</p>
              </div>

              <div className="rounded-2xl border border-cream bg-ivory p-5 transition-all hover:shadow-[0px_8px_30px_rgba(201,100,66,0.05)] hover:border-terracotta/20 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mb-4 transition-transform group-hover:scale-105">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-near-black text-[14.5px]">Private / 非公開</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-olive">招待されたメンバーだけが参加できるクローズドなチャンネル。特定のプロジェクトや機密性の高い議論に。</p>
              </div>

              <div className="rounded-2xl border border-cream bg-ivory p-5 transition-all hover:shadow-[0px_8px_30px_rgba(201,100,66,0.05)] hover:border-terracotta/20 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 mb-4 transition-transform group-hover:scale-105">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-near-black text-[14.5px]">DM / ダイレクト</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-olive">特定の相手と1対1でやり取りできるダイレクトメッセージ。気軽な相談や個別の連絡に便利です。</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[15px] font-bold text-near-black tracking-wide uppercase mb-4">主な機能</h3>
              <CheckedList items={[
                "<strong>リアルタイムでのメッセージ送受信</strong> — 送ったメッセージは相手の画面に即座に届きます。",
                "<strong>スレッド返信</strong> — 特定のメッセージに対して返信スレッドを立てることで、会話を整理しながら議論できます。",
                "<strong>絵文字リアクション</strong> — メッセージに絵文字で手軽にリアクションできます。",
                "<strong>既読確認</strong> — 自分のメッセージを誰がいつ読んだかを確認できます。",
                "<strong>過去ログの閲覧</strong> — 過去のやり取りをスクロールして遡ることができます。",
                "<strong>チャンネルの作成・管理</strong> — 必要に応じてチャンネルを作成・編集したり、メンバーを管理したりできます。"
              ]} />
            </div>
          </section>

          <hr className="border-cream/80 my-10" />

          {/* ANNOUNCEMENTS */}
          <section id="announcements" className="scroll-mt-24 py-6">
            <SectionLabel num="02" />
            <SectionTitle id="announcements" onCopy={handleCopyLink}>お知らせ機能</SectionTitle>

            <p className="mt-4 text-[15px] leading-relaxed text-olive">
              会社全体への重要な連絡や情報を発信するための掲示板です。管理者がカテゴリを選んでお知らせを投稿することで、全社員に情報を届けることができます。
            </p>

            <div className="mt-8">
              <h3 className="text-[15px] font-bold text-near-black tracking-wide uppercase mb-4">4つのお知らせ種別</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-cream bg-ivory p-3.5">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <Info className="h-4 w-4" />
                  </span>
                  <div>
                    <h5 className="font-semibold text-near-black text-[14px]">情報 (Info)</h5>
                    <p className="text-[12px] text-olive mt-0.5">制度の変更や定期報告など、一般的な全社向けのお知らせ。</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-cream bg-ivory p-3.5">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                    <ShieldAlert className="h-4 w-4" />
                  </span>
                  <div>
                    <h5 className="font-semibold text-near-black text-[14px]">警告 (Warning)</h5>
                    <p className="text-[12px] text-olive mt-0.5">メンテナンスや緊急時など、注意が必要な情報の周知に。</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-cream bg-ivory p-3.5">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <h5 className="font-semibold text-near-black text-[14px]">成功 (Success)</h5>
                    <p className="text-[12px] text-olive mt-0.5">目標達成の報告や社内の喜ばしいニュースのシェアに。</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-cream bg-ivory p-3.5">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <div>
                    <h5 className="font-semibold text-near-black text-[14px]">イベント (Event)</h5>
                    <p className="text-[12px] text-olive mt-0.5">社内行事やセミナー、懇親会などの告知と参加案内に。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[15px] font-bold text-near-black tracking-wide uppercase mb-4">主な機能</h3>
              <CheckedList items={[
                "<strong>ピン留め</strong> — 重要なお知らせを掲示板の一番上に固定して、見落としを防ぎます。",
                "<strong>画像の添付</strong> — お知らせに画像を添付して、内容をより分かりやすく伝えられます。",
                "<strong>いいね・コメント</strong> — お知らせに「いいね」をしたり、コメントで意見を交わしたりできます。",
                "<strong>直接リンク</strong> — 各お知らせへの固有リンクをコピーして、特定の投稿をすぐに共有できます。"
              ]} />
            </div>
          </section>

          <hr className="border-cream/80 my-10" />

          {/* CALENDAR */}
          <section id="calendar" className="scroll-mt-24 py-6">
            <SectionLabel num="03" />
            <SectionTitle id="calendar" onCopy={handleCopyLink}>カレンダー機能</SectionTitle>

            <p className="mt-4 text-[15px] leading-relaxed text-olive">
              会社全体・チーム・個人の予定をひとつの画面でまとめて確認できるカレンダーです。月・週・日・アジェンダの4種類の表示から、状況に合わせて切り替えてご利用いただけます。
            </p>

            <div className="mt-8">
              <Callout title="予定の公開範囲について" icon={Layers}>
                予定を作成するとき、誰に見せるかを以下の3段階から選べます。情報の機密性に応じて使い分けることができます。
              </Callout>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-cream bg-ivory p-5">
                <div className="flex items-center gap-2 text-terracotta mb-2">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="text-[13px] font-bold">全社員 (Company)</span>
                </div>
                <p className="text-[12.5px] leading-relaxed text-olive">祝日や全社イベントなど、社員全員に共有したい予定に。</p>
              </div>

              <div className="rounded-2xl border border-cream bg-ivory p-5">
                <div className="flex items-center gap-2 text-terracotta mb-2">
                  <Users className="h-4.5 w-4.5" />
                  <span className="text-[13px] font-bold">グループ (Group)</span>
                </div>
                <p className="text-[12.5px] leading-relaxed text-olive">特定のチームや部署内だけで共有したい会議やタスクに。</p>
              </div>

              <div className="rounded-2xl border border-cream bg-ivory p-5">
                <div className="flex items-center gap-2 text-terracotta mb-2">
                  <Lock className="h-4.5 w-4.5" />
                  <span className="text-[13px] font-bold">個人 (Personal)</span>
                </div>
                <p className="text-[12.5px] leading-relaxed text-olive">自分だけが確認できる予定。個人の作業予定やメモとして活用できます。</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[15px] font-bold text-near-black tracking-wide uppercase mb-4">その他の機能</h3>
              <CheckedList items={[
                "<strong>絞り込み表示</strong> — カテゴリや公開範囲で予定をフィルタリングして、見たい情報だけを表示できます。",
                "<strong>キーワード検索</strong> — 予定の名前でキーワード検索して、過去・未来の予定をすばやく見つけられます。",
                "<strong>かんたん予定作成</strong> — カレンダー上の日付をクリックするだけで、予定の作成・編集画面がすぐに開きます。"
              ]} />
            </div>
          </section>

          <hr className="border-cream/80 my-10" />

          {/* PEOPLE */}
          <section id="people" className="scroll-mt-24 py-6">
            <SectionLabel num="04" />
            <SectionTitle id="people" onCopy={handleCopyLink}>メンバーディレクトリ</SectionTitle>

            <p className="mt-4 text-[15px] leading-relaxed text-olive">
              社内のメンバー全員の情報を一覧で確認できるページです。他の部署のメンバーを探したり、連絡を取りたい相手をすぐに見つけたりするために活用できます。
            </p>

            <div className="mt-8">
              <h3 className="text-[15px] font-bold text-near-black tracking-wide uppercase mb-4">主な機能</h3>
              <CheckedList items={[
                "<strong>メンバーカード表示</strong> — 名前・自己紹介・所属・役割をカード形式でひと目で確認できます。",
                "<strong>名前・メールで検索</strong> — 名前やメールアドレスの一部を入力するだけで、目的の人物をすぐに見つけられます。",
                "<strong>グループで絞り込み</strong> — 部門やチーム単位でメンバーを絞り込んで表示できます。",
                "<strong>詳細プロフィールの確認</strong> — カードをクリックすると、自己紹介や所属グループの詳細を確認できます。",
                "<strong>ワンクリックでDM開始</strong> — メンバーのカードからチャットアイコンをクリックするだけで、その相手とのダイレクトメッセージがすぐに始められます。"
              ]} />
            </div>
          </section>

          <hr className="border-cream/80 my-10" />

          {/* KNOWLEDGE */}
          <section id="knowledge" className="scroll-mt-24 py-6">
            <SectionLabel num="05" />
            <SectionTitle id="knowledge" onCopy={handleCopyLink}>ナレッジベース</SectionTitle>

            <p className="mt-4 text-[15px] leading-relaxed text-olive">
              業務マニュアルや社内ルール、ノウハウなどをドキュメントとして蓄積・共有できる社内Wikiです。必要な情報をいつでも参照できるよう、チーム全体の知識を一か所にまとめておくことができます。
            </p>

            <div className="mt-8">
              <h3 className="text-[15px] font-bold text-near-black tracking-wide uppercase mb-4">カテゴリ分類</h3>
              <div className="flex flex-wrap gap-2">
                {["人事・総務 (HR / General)", "開発・技術 (Engineering)", "デザイン (Design)", "オンボーディング (Onboarding)", "営業・マーケ (Sales & Marketing)"].map((tag) => (
                  <span key={tag} className="rounded-xl border border-cream bg-ivory px-3 py-1.5 text-[13px] font-medium text-dark shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[15px] font-bold text-near-black tracking-wide uppercase mb-4">主な機能</h3>
              <CheckedList items={[
                "<strong>公開範囲の設定</strong> — ドキュメントごとに、全社員・特定グループ・管理者のみと公開先を選べます。",
                "<strong>閲覧数・いいね数の確認</strong> — ドキュメントがどれだけ読まれているかを確認できます。",
                "<strong>読了目安時間の表示</strong> — 記事の文量から自動で「読む時間の目安」が表示されるので、読む前に内容のボリュームが分かります。"
              ]} />
            </div>
          </section>

          <hr className="border-cream/80 my-10" />

          {/* PROFILE */}
          <section id="profile" className="scroll-mt-24 py-6">
            <SectionLabel num="06" />
            <SectionTitle id="profile" onCopy={handleCopyLink}>プロフィール管理</SectionTitle>

            <p className="mt-4 text-[15px] leading-relaxed text-olive">
              自分のプロフィール情報やアイコンを設定・変更できるページです。他のメンバーへの自己紹介として表示されるため、名前や自己紹介文を整えておくと、社内でのコミュニケーションがよりスムーズになります。
            </p>

            <div className="mt-8">
              <h3 className="text-[15px] font-bold text-near-black tracking-wide uppercase mb-4">変更できる項目</h3>
              <CheckedList items={[
                "<strong>表示名</strong> — チャットやメンバー一覧で他のメンバーに表示される名前を設定できます。",
                "<strong>自己紹介 (Bio)</strong> — 自分の専門分野や担当業務など、自由に自己紹介を書き添えることができます。",
                "<strong>プロフィール画像</strong> — 画像ファイルをアップロードしてアイコンを変更できます（上限 2MB）。アップロード後はその場でプレビューが確認できます。",
                "<strong>メールアドレス・権限（閲覧のみ）</strong> — ログインに使用するメールアドレスと、アカウントの権限種別（一般 / 管理者）を確認できます。これらはご自身では変更できません。"
              ]} />
            </div>
          </section>

        </article>
      </div>
    </div>
  );
}

/* ── Shared Subcomponents ── */

function SectionLabel({ num }: { num: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-terracotta font-mono uppercase">
      <span>Section {num}</span>
      <span className="h-px w-8 bg-cream" />
    </div>
  );
}

function SectionTitle({
  id,
  children,
  onCopy,
}: {
  id: string;
  children: React.ReactNode;
  onCopy: (id: string) => void;
}) {
  return (
    <h2 className="group relative mt-2 font-serif-jp text-3xl font-semibold tracking-tight text-near-black leading-tight flex items-center gap-2">
      {children}
      <button
        onClick={() => onCopy(id)}
        className="opacity-0 transition-opacity group-hover:opacity-100 text-stone hover:text-terracotta cursor-pointer"
        title="リンクをコピー"
      >
        <Hash className="h-5 w-5" />
      </button>
    </h2>
  );
}

function RouteTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <code className="inline-flex items-center gap-1.5 rounded-lg border border-cream bg-ivory px-3 py-1 font-mono text-[12.5px] text-stone shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
        {children}
      </code>
    </div>
  );
}

function Callout({
  title,
  children,
  icon: Icon = Info
}: {
  title: string;
  children: React.ReactNode;
  icon?: any
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-cream border-l-4 border-l-terracotta bg-ivory p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.01)]">
      <div className="flex items-center gap-2.5 mb-3">
        <Icon className="h-5 w-5 text-terracotta flex-shrink-0" />
        <h4 className="text-[13px] font-bold uppercase tracking-[0.12em] text-near-black">
          {title}
        </h4>
      </div>
      <div className="text-[14.5px] text-olive leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function CheckedList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3.5 text-[14.5px] leading-relaxed text-olive">
          <span className="mt-1 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  );
}