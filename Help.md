# Porocia - 社内コミュニケーションプラットフォーム

Porociaは日本企業向けの統合型社内コミュニケーション・管理プラットフォームです。

---

## 📋 目次

1. [認証システム](#1-認証システム)
2. [ホームページ](#2-ホームページ)
3. [チャット機能](#3-チャット機能)
4. [お知らせ機能](#4-お知らせ機能)
5. [カレンダー機能](#5-カレンダー機能)
6. [メンバーディレクトリ](#6-メンバーディレクトリ)
7. [ナレッジベース](#7-ナレッジベース)
8. [プロフィール管理](#8-プロフィール管理)
9. [管理者ダッシュボード](#9-管理者ダッシュボード)

---

## 1. 認証システム

### 概要
Firebase Authentication + セッションCookieによる堅牢なサーバーサイド認証を実装。

### 主な機能
- **ログイン/ログアウト**: メールアドレスとパスワードによる認証
- **セッション管理**: HTTP-only Cookieによる安全なセッション保持
- **プロフィール同期**: ログイン時にFirestore `users` コレクションへ自動同期
- **リアルタイム更新**: `AuthProvider` が `onSnapshot` でプロフィール変更を即座に反映

### 技術詳細
- **クライアント**: Firebase Client SDK (`src/lib/firebase/auth.ts`)
- **サーバー**: Firebase Admin SDK (`src/lib/firebase/server.ts`)
- **セッションAPI**: `/api/auth/session` でセッションCookie生成
- **保護ルート**: Layout/Middlewareで `adminAuth.verifySessionCookie` による検証

---

## 2. ホームページ

**ルート**: `/`

### 概要
会社のダッシュボード的な役割を果たすランディングページ。

### セクション構成
- **HeroSection**: ウェルカムメッセージとビジュアル
- **AnnouncementsBento**: 最新のお知らせをBentoレイアウトで表示（Suspense対応）
- **EditorialQuoteSection**: 会社のビジョンや引用文
- **NewsCultureSection**: ニュース・企業文化（コメントアウト中）
- **QuickLinksSection**: クイックリンク（コメントアウト中）
- **Footer**: フッター（コメントアウト中）

### 技術詳細
- Server Component（デフォルト）
- Suspenseによる段階的レンダリング
- 各セクションは `src/components/sections/` に分離

---

## 3. チャット機能

**ルート**: `/chat` および `/chat/[channelId]`

### 概要
リアルタイムメッセージング機能。パブリックチャンネル、プライベートチャンネル、ダイレクトメッセージ（DM）をサポート。

### 主な機能
- **リアルタイムメッセージング**: Firestore `onSnapshot` による即時同期
- **チャンネルタイプ**:
  - `public`: 全員が閲覧可能
  - `private`: 特定メンバーのみ
  - `dm`: 1対1のダイレクトメッセージ（形式: `dm_{uid1}_{uid2}`）
- **メッセージ機能**:
  - テキストメッセージ送信
  - 返信機能（スレッド）
  - リアクション追加
  - 既読管理（ReadReceipt）
  - 無限スクロール/ページネーション
- **チャンネル管理**:
  - チャンネル作成・編集・削除
  - メンバー追加・削除
  - チャンネル名・説明変更

### コンポーネント構成
- **Layout**: `src/app/(protected)/(root)/chat/layout.tsx` - Sidebarを常時表示
- **Sidebar**: `src/components/chat/sidebar.tsx` - チャンネル一覧、DM名表示
- **ChatPanel**: `src/components/chat/ChatPanel.tsx` - メッセージ表示エリア
- **ChatInput**: `src/components/chat/ChatInput.tsx` - メッセージ入力フォーム
- **ChatBubble**: `src/components/chat/ChatBubble.tsx` - 個別メッセージ表示
- **ReadReceiptLabel/Modal**: 既読者表示とモーダル

### カスタムフック
- `useChat`: メッセージ取得・送信・リアクション管理
- `useChannels`: チャンネル一覧取得・作成・管理
- `useUsersCache`: 全ユーザープロフィールをメモリキャッシュ（DM名表示バグ修正用）

### 技術詳細
- **データフェッチ**: `onSnapshot` によるリアルタイム同期
- **DM名表示**: `channelId` から UID をパースし、`useUsersCache` でユーザー名取得
- **既読管理**: `readBy` 配列で既読者を追跡（送信者自身は除外）

---

## 4. お知らせ機能

**ルート**: `/announcements`

### 概要
会社全体への重要なお知らせを投稿・閲覧できる掲示板機能。

### 主な機能
- **お知らせ投稿**: 管理者が新規お知らせを作成
- **お知らせタイプ**:
  - `info`: 情報
  - `warning`: 警告
  - `success`: 成功・達成
  - `event`: イベント告知
- **ピン留め機能**: 重要なお知らせを上部固定
- **画像添付**: お知らせに画像を添付可能
- **リアクション**: いいね・コメント機能（`AnnouncementActions`）
- **リアルタイム更新**: `onSnapshot` でいいね数・コメント数が即座に反映
- **アンカーリンク**: URL ハッシュ（`#announcement-{id}`）で特定お知らせへ直接ジャンプ

### コンポーネント構成
- **PublicAnnouncementsPage**: メインページ（`src/app/(protected)/(root)/announcements/page.tsx`）
- **AnnouncementActions**: リアクション・コメント管理（`src/components/announcements/AnnouncementActions.tsx`）

### 技術詳細
- **データ取得**: `onSnapshot` + `orderBy("isPinned", "desc")` でピン留め優先表示
- **日付フォーマット**: `date-fns` + `ja` ロケール
- **画像表示**: フルワイド画像ヘッダー（最大高さ600px）

---

## 5. カレンダー機能

**ルート**: `/calendar`

### 概要
会社全体・グループ・個人のイベントを管理できるカレンダーシステム。

### 主な機能
- **イベント作成・編集・削除**: モーダルUIで直感的に操作
- **イベントスコープ**:
  - `company`: 全社員が閲覧可能
  - `group`: 特定グループのみ閲覧可能
  - `personal`: 作成者のみ閲覧可能
- **イベントタイプ**:
  - `event`: 通常イベント
  - `success`: 成功・達成
  - `warning`: 注意・警告
  - `info`: 情報
- **ビュー切り替え**: 月・週・日・アジェンダビュー
- **フィルタリング**:
  - カテゴリーフィルター
  - スコープフィルター
  - 検索機能
- **権限管理**:
  - 個人イベントは作成者のみ閲覧
  - グループイベントはメンバーまたは管理者のみ閲覧
  - 管理者は全イベント閲覧可能

### コンポーネント構成
- **CalendarPage**: メインページ（`src/app/(protected)/(root)/calendar/page.tsx`）
- **PorociaCalendar**: カレンダー本体（`react-big-calendar` ベース）
- **MiniCalendar**: サイドバーのミニカレンダー + フィルター
- **AddEventModal**: イベント作成・編集モーダル
- **EventDetailModal**: イベント詳細表示モーダル

### 技術詳細
- **ライブラリ**: `react-big-calendar` + `date-fns`
- **データ同期**: `subscribeToEvents` で Firestore リアルタイム同期
- **読み取り時間計算**: コンテンツ長から自動算出（400文字/分）

---

## 6. メンバーディレクトリ

**ルート**: `/people`

### 概要
社内メンバーのプロフィール閲覧とダイレクトチャット開始機能。

### 主な機能
- **メンバー一覧**: 全社員のプロフィールカード表示
- **検索機能**: 名前・メールアドレスで検索
- **グループフィルター**: 特定グループのメンバーのみ表示
- **プロフィール詳細モーダル**:
  - 表示名・メールアドレス
  - 自己紹介（Bio）
  - 所属グループ
  - ロール（管理者/メンバー）
- **ダイレクトチャット開始**: ワンクリックでDMチャンネル作成・遷移
- **アバター表示**: プロフィール画像またはイニシャル

### コンポーネント構成
- **PeopleDirectoryPage**: メインページ（`src/app/(protected)/(root)/people/page.tsx`）

### 技術詳細
- **データ取得**: `getAllUsers()` + `getAllGroups()` で一括取得
- **DM作成**: `ensureDirectChannel()` で既存チャンネル確認または新規作成
- **フィルタリング**: `useMemo` で検索・グループフィルターを最適化
- **自分を除外**: ログインユーザー自身は一覧から除外

---

## 7. ナレッジベース

**ルート**: `/knowledge` および `/knowledge/[articleId]`

### 概要
社内の業務マニュアル、技術ガイド、規則などのドキュメント管理システム。

### 主な機能
- **記事作成・編集・削除**: Markdown対応のリッチエディタ
- **カテゴリー分類**:
  - すべて
  - 人事・総務（HR / General Affairs）
  - 開発・技術（Engineering / Technical）
  - デザイン（Design）
  - オンボーディング（Onboarding）
  - 営業・マーケ（Sales & Marketing）
- **公開範囲設定**:
  - `company`: 全社員が閲覧可能
  - `group`: 特定グループのみ閲覧可能
  - `admin`: 管理者のみ閲覧可能
- **検索機能**: タイトル・概要・タグで検索
- **統計情報**:
  - 閲覧数（Views）
  - いいね数（Likes）
  - 読む時間（自動計算）
- **タグ機能**: 記事に複数タグを付与可能

### コンポーネント構成
- **KnowledgeBasePage**: 記事一覧ページ（`src/app/(protected)/(root)/knowledge/page.tsx`）
- **ArticleDetailPage**: 記事詳細ページ（`src/app/(protected)/(root)/knowledge/[articleId]/page.tsx`）
- **NewArticlePage**: 記事作成ページ（`src/app/(protected)/(root)/knowledge/new/page.tsx`）

### 技術詳細
- **権限チェック**: `useMemo` で閲覧権限を動的に判定
- **読み取り時間**: コンテンツ長 ÷ 400文字/分
- **日付フォーマット**: `toLocaleDateString("ja-JP")`

---

## 8. プロフィール管理

**ルート**: `/profile`

### 概要
ログインユーザー自身のプロフィール情報を閲覧・編集できるページ。

### 主な機能
- **プロフィール表示**:
  - メールアドレス（読み取り専用）
  - ロール（管理者/メンバー）
  - 表示名
  - 自己紹介（Bio）
- **プロフィール編集**:
  - 表示名変更
  - 自己紹介編集
- **アバター画像アップロード**:
  - 画像ファイル選択（最大2MB）
  - Firebase Storageへアップロード
  - リアルタイムプレビュー

### コンポーネント構成
- **ProfilePage**: メインページ（`src/app/(protected)/(root)/profile/page.tsx`）

### 技術詳細
- **データ取得**: `getDoc(doc(db, "users", uid))` で現在のプロフィール取得
- **画像アップロード**: `uploadAvatar()` で Firebase Storage へアップロード
- **プロフィール更新**: `updateUserProfile()` で Firestore 更新
- **バリデーション**: 画像サイズ2MB制限

---

## 9. 管理者ダッシュボード

**ルート**: `/dashboard` および `/dashboard/*`

### 概要
管理者専用の管理画面。システム全体の統計情報と管理機能へのアクセス。

### 主な機能

#### 9.1 ダッシュボードホーム (`/dashboard`)
- **統計情報**:
  - 新着お知らせ数
  - 今後のイベント数
  - 総ユーザー数（サーバーサイドで取得）
- **クイックアクション**:
  - 新しいお知らせを投稿
  - 新しいイベントを作成

#### 9.2 お知らせ管理 (`/dashboard/announcements`)
- お知らせ一覧表示
- 新規お知らせ作成 (`/dashboard/announcements/new`)
- お知らせ編集・削除
- ピン留め設定

#### 9.3 メンバー & グループ管理 (`/dashboard/members`)
- **メンバー管理**:
  - 全メンバー一覧
  - ロール変更（管理者/メンバー）
  - メンバー削除
- **グループ管理**:
  - グループ作成・編集・削除
  - メンバー追加・削除
  - グループ名・説明変更

#### 9.4 イベント管理 (`/dashboard/events`)
- **現在のステータス**: 開発中（プレースホルダーページ）
- **予定機能**: 会社全体のイベント作成、編集、削除、参加者管理

#### 9.5 システム設定 (`/dashboard/settings`)
- **現在のステータス**: 開発中（プレースホルダーページ）
- **予定機能**: アプリケーション全体の設定、通知設定、セキュリティオプション

### 技術詳細
- **認証**: Server Component で `verifySessionCookie` による検証
- **権限チェック**: `profile?.role === 'admin'` で管理者判定（現在コメントアウト中）
- **統計取得**: Firebase Admin SDK の `count()` API でユーザー数取得
- **プレースホルダーページ**: 開発中機能は温かみのあるデザインで「Coming Soon」表示

---

## 🎨 デザインシステム

### カラーパレット
- **Canvas**: Parchment (`#f5f4ed`), Ivory (`#faf9f5`)
- **ブランドカラー**: Terracotta (`#c96442`), Near Black (`#141413`)
- **ニュートラル**: Olive Gray (`#5e5d59`), Stone Gray (`#87867f`), Cream (`#e8e4d9`)

### タイポグラフィ
- **見出し**: Anthropic Serif (weight 500)
- **UI**: Anthropic Sans
- **コード**: Anthropic Mono

### デザイン原則
- 温かみのあるトーン（クールな青灰色は使用しない）
- 温かみのあるリングシャドウ（`0px 0px 0px 1px`）
- 重いドロップシャドウは避ける
- 詳細は `DESIGN.md` を参照

---

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 16.2.4 (App Router)
- **UI**: React 19, shadcn/ui, @base-ui/react, lucide-react
- **スタイリング**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **バックエンド**: Firebase v12 (Client SDK) + Firebase Admin SDK v13
- **フォーム**: react-hook-form + zod
- **日付処理**: date-fns
- **通知**: sonner

---

## 📁 プロジェクト構造

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (protected)/
│   │   ├── (root)/
│   │   │   ├── chat/
│   │   │   ├── announcements/
│   │   │   ├── calendar/
│   │   │   ├── people/
│   │   │   ├── knowledge/
│   │   │   └── profile/
│   │   └── (admin)/
│   │       └── dashboard/
│   └── api/
│       └── auth/session/
├── components/
│   ├── chat/
│   ├── calendar/
│   ├── announcements/
│   ├── sections/
│   └── ui/
├── lib/
│   └── firebase/
│       ├── client.ts
│       ├── server.ts
│       ├── auth.ts
│       ├── chat.ts
│       ├── announcements.ts
│       ├── events.ts
│       ├── knowledge.ts
│       └── members.ts
└── hooks/
    ├── use-chat.ts
    ├── use-channels.ts
    └── useUsersCache.ts
```

---

## 🔐 セキュリティ

- **認証**: Firebase Authentication + HTTP-only Session Cookie
- **権限管理**: ロールベース（admin/member）+ スコープベース（company/group/personal）
- **データ保護**: Firestore Security Rules による細かいアクセス制御
- **画像アップロード**: ファイルサイズ制限（2MB）+ Firebase Storage

---

## 📚 参考ドキュメント

- **プロジェクトガイド**: `CLAUDE.md`
- **デザインガイド**: `DESIGN.md`
- **データベーススキーマ**: `DB_SCHEMA.md`
- **エージェント設定**: `AGENTS.md`

---

**最終更新**: 2026年5月22日
