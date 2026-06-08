# Porocia Development Guide
See [AGENTS.md](file:///g:/porocia/porocia/AGENTS.md) for Next.js agent rules.
## 1. Technology Stack

- **Framework:** Next.js 16.2.4 (App Router)
- **UI Library:** React 19, shadcn/ui, @base-ui/react, lucide-react
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) with custom CSS variables defined in `globals.css`.
- **Backend & Database:** Firebase v12 (Client SDK) & Firebase Admin SDK v13 (Server-side)
- **Forms & Validation:** react-hook-form + Zod

## 2. Design System & Aesthetics (Claude‑Inspired)

Porocia は Anthropic の「Claude」インターフェースにインスパイアされた **プレミアム＆エディトリアル** デザインシステムを採用しています。以下に主要なカラートークン、タイポグラフィ規則、シャドウシステムを示します。

### カラーパレット

| トークン名 | カラーコード | デザイン上の役割 |
|---|---|---|
| **Parchment** | `#f5f4ed` | メイン背景色 |
| **Ivory** | `#faf9f5` | カード・コンテナ背景 |
| **Pure White** | `#ffffff` | アクションボタン・高コントラスト要素 |
| **Near Black** | `#141413` | プライマリテキスト・ダークテーマ背景 |
| **Charcoal Warm** | `#4d4c48` | セカンダリアクションテキスト・アイコン |
| **Olive Gray** | `#5e5d59` | メタ情報・サブテキスト |
| **Stone Gray** | `#87867f` | 補助テキスト・脚注 |
| **Terracotta Brand** | `#c96442` | 重要CTA |
| **Border Cream** | `#f0eee6` | 薄い境界線 |
| **Border Warm** | `#e8e6dc` | インタラクティブ要素区切り線 |
| **Focus Blue** | `#3898ec` | フォーカスリング（アクセシビリティ） |

### タイポグラフィ

- **見出し (Headlines)** – Anthropic Serif または Georgia、ウェイトは `500` に統一。
- **本文・UI (Body/UI)** – Inter または Arial、行高は `1.60`。
- **コード** – Anthropic Mono。

### 深度・シャドウ

- 従来の暗いドロップシャドウは使用せず、 **Ring‑shadow** (`0px 0px 0px 1px`) をホバー時に適用。
- 浮遊コンテナは薄い **Whisper Shadow** (`rgba(20,20,19,0.04) 0px 4px 24px`) を使用。

## 3. ディレクトリ構成 / Directory Structure

Next.js App Routerの標準に準拠し、ソースコードは `/src` ディレクトリ以下に整理されています。

```
src/
├── app/                              # Next.js App Routerのメインディレクトリ
│   ├── (auth)/                       # 認証関連のルートグループ
│   │   ├── login/                    # ログイン画面
│   │   └── register/                 # 新規社員登録画面
│   ├── (protected)/                  # ログイン必須のプライベートルート
│   │   ├── layout.tsx                # セキュリティガード、AuthContextの設定
│   │   ├── (admin)/                  # 管理者専用機能
│   │   │   └── admin/                # 管理者ダッシュボード、ロール管理、グループ管理
│   │   └── (root)/                   # 一般ユーザー向け主要機能
│   │       ├── layout.tsx            # ナビゲーションサイドバー、ヘッダーの配置
│   │       ├── page.tsx              # ホームダッシュボード
│   │       ├── announcements/        # 社内掲示板モジュール
│   │       ├── calendar/             # カレンダー・スケジュールモジュール
│   │       ├── chat/                 # リアルタイムチャットモジュール
│   │       ├── knowledge/            # ナベッジベース（Wiki）モジュール
│   │       ├── people/               # 社員名簿・プロフィール検索モジュール
│   │       └── profile/              # プロフィール自己管理モジュール
│   ├── layout.tsx                    # ルート共通レイアウト（フォント、Toaster設定）
│   └── globals.css                   # CSS変数、カスタムユーティリティの定義
├── components/                       # 再利用可能なReactコンポーネント
│   ├── ui/                           # 基本ボタン、インプット、バッジなどの共通UI
│   ├── chat/                         # チャット専用コンポーネント（チャットルーム、メッセージ項目）
│   ├── calendar/                     # カレンダー専用コンポーネント（予定作成モーダル）
│   └── knowledge/                    # ナレッジ用コンポーネント（Markdownエディタ等）
├── hooks/                            # カスタムReactフック
│   ├── useAuth.ts                    # ログイン状態およびユーザープロフィール管理フック
│   ├── useChat.ts                    # 特定チャットルームのメッセージ監視フック
│   └── useChannels.ts                # チャットルーム一覧監視フック
├── lib/                              # 外部ライブラリおよびAPIヘルパー
│   ├── utils.ts                      # スタイリング結合（cn）等の共通ユーティリティ
│   └── firebase/                     # Firebase SDKの初期化およびデータアクセス層
│       ├── client.ts                 # クライアント側Firebase SDK初期化
│       ├── server.ts                 # サーバー側Firebase Admin SDK初期化
│       ├── auth.ts                   # ログイン、ログアウト、権限管理API
│       ├── chat.ts                   # チャット、DM、既読状態、リアクション制御API
│       ├── events.ts                 # カレンダー予定（CRUD、リアルタイム同期）API
│       ├── knowledge.ts              # ナレッジ（Markdown保存、閲覧数、いいね、コメント）API
│       ├── announcements.ts          # 掲示板（ピン留め、リアクション、コメント）API
│       └── cloudinary.ts             # サーバー側Cloudinary画像削除処理API
└── proxy.ts                          # プロキシ設定
```

### Authentication Flow

- **Strategy:** Firebase Client Auth combined with secure server‑side session cookies.
- **Implementation:**
  - User signs in via the Client SDK (`src/lib/firebase/auth.ts`).
  - Next.js Server Actions (`src/lib/actions/auth.ts`) manage the HTTP‑only session cookie (`__session`) using the Admin SDK.
  - Middleware/Layout (`src/app/(root)/layout.tsx`) protects routes by verifying the session cookie.
- **Profile Sync:** User data is stored in the `users` Firestore collection and kept in sync via the `AuthProvider` component.

### Chat Module

- **Layout:** App Router layout (`src/app/(root)/chat/layout.tsx`) with a persistent sidebar.
- **Data Layer:** Custom hooks (`use-chat.ts`, `use-channels.ts`) interface with Firestore for real‑time messaging, pagination, and channel management.
- **Components:** `ChatPanel`, `ChatInput`, `ChatBubble`, `Sidebar` under `src/components/chat/`.

### Firebase Configuration

- **Client:** `src/lib/firebase/client.ts` (uses `experimentalForceLongPolling` for reliability).
- **Server:** `src/lib/firebase/server.ts` for admin‑only operations.
- **Helpers:** `auth.ts` and `chat.ts` abstract Firestore and authentication logic.

## 4. Coding Conventions

- **App Router:** Prefer Server Components; add `"use client"` only when needed.
- **TypeScript:** Strict mode enabled; use interfaces/types for all props and data structures.
- **Styling:** Tailwind utility classes combined with `cn()` from `src/lib/utils.ts`. Custom CSS variables are defined in `globals.css`.
- **Environment Variables:** Prefix client‑side Firebase keys with `NEXT_PUBLIC_`; keep admin credentials server‑only.
- **Naming:** Follow PascalCase for components, camelCase for functions and hooks, and kebab‑case for file names.

---

*This guide is version‑controlled; keep it up to date with any architectural changes.*
