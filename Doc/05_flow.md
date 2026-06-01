# システムフロー図 / 業務フロー一覧 (Porocia Portal)

本書は、**Porocia** システムにおける全ての主要な業務フローおよびデータ処理フローを網羅的にまとめたものです。各フローの **Mermaid** コードをそのまま **Draw.io** にコピー＆ペーストし（**`+` (Insert) → Advanced → Mermaid...**）、編集可能なシーケンス図として出力できます。

---

## 1. 認証およびセッションCookie発行フロー (Auth & Session Cookie Flow)
クライアント側でのログイン処理、IDトークンの取得、Server Actionを介したHTTP-onlyセッションCookieの発行、およびMiddleware/Serverによるルートガードの検証プロセスを示します。

```mermaid
sequenceDiagram
    autonumber
    actor User as 社員 (User)
    participant Client as Webアプリ (Client/Browser)
    participant FB_Auth as Firebase Auth (Client SDK)
    participant ServerAction as Server Action (Next.js Server)
    participant FB_Admin as Firebase Admin SDK (Server)
    participant Store as Next.js Cookie Store
    participant Proxy as Proxy/Middleware (Server)

    Note over User, Client: パート1: ログインおよびセッションCookie発行 (HTTP-ONLY)
    User->>Client: メールアドレス/パスワードを入力し「ログイン」をクリック
    Client->>FB_Auth: signInWithEmailAndPassword()
    FB_Auth-->>Client: 認証成功 (Auth Userを返却)
    Client->>FB_Auth: authUser.getIdToken()
    FB_Auth-->>Client: IDトークンを返却 (クライアント側)
    
    Client->>ServerAction: createSessionCookieAction(idToken) を呼び出す
    ServerAction->>FB_Admin: adminAuth.createSessionCookie(idToken, { expiresIn: 5日間 })
    FB_Admin-->>ServerAction: 暗号化済みセッションCookieを生成完了
    ServerAction->>Store: cookieStore.set("__session", sessionCookie, { httpOnly: true, secure: true })
    Store-->>Client: ブラウザに __session Cookieを安全に保存
    Client-->>User: ダッシュボード (/) へリダイレクト

    Note over User, Proxy: パート2: ページアクセスおよびサーバー側Cookie検証
    User->>Proxy: 保護ページ (/) または管理者ページ (/admin) へアクセス要求
    Proxy->>Store: Cookie '__session' の値を取得
    alt ケース1: '__session' Cookieが存在しない
        Proxy-->>User: 即座にブロック (0ms) し /login へリダイレクト
    else ケース2: '__session' Cookieが存在する
        Proxy->>FB_Admin: adminAuth.verifySessionCookie(sessionCookie, checkRevoked: true)
        alt Cookieが期限切れまたは取り消し済み
            FB_Admin-->>Proxy: 認証エラーを返却
            Proxy-->>User: 古いCookieを削除し /login へリダイレクト
        else Cookieが有効
            FB_Admin-->>Proxy: デコード済みIDトークンを返却 (UID・Roleを含む)
            Proxy-->>User: ページ読み込みを許可し、対応する画面を表示
        end
    end
```

---

## 2. メッセージ送信および未読数更新フロー (Message Sending & Unread Flow)
メッセージ送信、チャネルメンバーリストの更新、およびFirestoreのアトミックBatch書き込みによる未読カウンターの自動増加処理を示します。

```mermaid
sequenceDiagram
    autonumber
    actor UserA as 送信者 (User A)
    participant UI as Chat UI (ChatInput/ChatPanel)
    participant SDK as Firestore Client SDK
    participant Batch as Firestore WriteBatch
    participant Firestore as Cloud Firestore
    participant UserB as 受信者 (User B)

    UserA->>UI: メッセージを入力し「送信」をクリック
    UI->>UI: 空白除去 (Trim)、空文字チェック
    
    UI->>SDK: sendMessage(channelId, text, replyTo, ...) を呼び出す
    SDK->>Firestore: チャネルの現在のメンバーリスト (members) を取得
    Firestore-->>SDK: メンバーリストを返却 (例: [User A, User B])
    
    SDK->>Batch: db.writeBatch() を初期化
    
    Note over SDK, Batch: 1. 新規メッセージドキュメントを作成:<br/>channels/{id}/messages/{msgId}
    SDK->>Batch: batch.set(MsgDoc, { text, readBy: [UserA], readAt: { UserA: now } })
    
    Note over SDK, Batch: 2. User Aをチャネルメンバーに追加 (未登録の場合)
    SDK->>Batch: batch.update(ChannelDoc, { members: arrayUnion(UserA) })
    
    Note over SDK, Batch: 3. User Bの未読数を1増加
    SDK->>Batch: batch.update(ChannelDoc, { unreadCount.UserB: increment(1) })
    
    SDK->>Batch: batch.commit() を実行
    Batch->>Firestore: データを同時に書き込む (アトミック書き込み)
    
    Note over Firestore: リスナー (onSnapshot) を介してリアルタイム更新をプッシュ
    Firestore-->>UI: User A側のメッセージを更新 (新しいチャットバブルを描画)
    Firestore-->>UserB: useChat() を介してUser Bの画面に新規メッセージをプッシュ
    
    alt ケース1: User Bがこのチャットルームを開いている
        Note over UserB: markChannelAsRead() を自動実行
        UserB->>Firestore: readBy += User B を更新し、unreadCount.UserB = 0 にリセット
    else ケース2: User Bが別の画面にいるかオフライン
        Note over UserB: チャネル一覧に赤いバッジ/未読件数 (>0) を表示
    end
```

---

## 3. Wiki画像の直接アップロードフロー (Wiki Image Upload Flow)
クライアントからCloudinaryへのUnsigned Presetを使用した直接ファイルアップロード、およびエディタのカーソル位置へのMarkdownトークン挿入プロセスをToast通知とともに示します。

```mermaid
sequenceDiagram
    autonumber
    actor User as 執筆者 (User)
    participant UI as Wiki Editor UI
    participant Input as Input File (hidden)
    participant Cloudinary as Cloudinary API
    
    User->>UI: 「画像を追加」ボタンをクリック
    UI->>Input: click() をトリガーし、デバイスから画像を選択
    User->>Input: 画像ファイルを選択 (image.png)
    Input-->>UI: ファイル選択完了
    UI->>UI: Loadingトーストを表示「画像をアップロード中...」
    UI->>Cloudinary: POST /image/upload (FormData: file + upload_preset="porocia")
    Cloudinary-->>UI: ステータス200 OK を返却 (secure_urlを含む)
    UI->>UI: Markdownトークン `![image](secure_url)` をTextareaのカーソル位置に挿入
    UI->>UI: トーストをSuccessに更新「画像のアップロードに成功しました」
    UI-->>User: エディタ内容を更新し、プレビューに画像を表示
```

---

## 4. Wiki記事削除時の画像クリーンアップフロー (Wiki Deletion Cleanup Flow)
Wiki記事のMarkdown本文を解析し、Cloudinaryに保存されている添付画像を特定・削除することでストレージの最適化を行うプロセスを示します。

```mermaid
sequenceDiagram
    autonumber
    actor Client as クライアント (User)
    participant UI as Wiki UI
    participant API as Knowledge API (deleteArticle)
    participant DB as Cloud Firestore
    participant Cloudinary as Cloudinary REST API

    Client->>UI: 「記事を削除」ボタンをクリック
    UI->>API: deleteArticle(articleId) を実行
    API->>DB: getDoc(doc(db, "articles", articleId))
    DB-->>API: ドキュメント内容を返却 (Markdownテキスト)
    
    Note over API: 正規表現でCloudinary画像URLを検出:<br>/!\[.*?\]\((https?:\/\/res\.cloudinary\.com\/[^)]+)\)/g
    
    alt Cloudinary画像リンクが見つかった場合
        loop 検出された各画像に対して
            Note over API: URLからpublic_idを抽出
            API->>Cloudinary: POST /image/destroy (API Key & Secretによる署名付きリクエスト)
            Cloudinary-->>API: 削除結果を返却 (success / failed)
        end
    end

    API->>DB: deleteDoc(doc(db, "articles", articleId))
    DB-->>UI: 記事の削除成功を確認
    UI-->>Client: 通知を表示し /knowledge ページへリダイレクト
```

---

## 5. カレンダーイベント作成および表示スコープフィルタリングフロー (Calendar Event Visibility Flow)
異なるScope（公開範囲）でのカレンダーイベント作成と、個人情報・グループ情報の機密性を保護するためのクライアント側フィルタリングメカニズムを示します。

```mermaid
sequenceDiagram
    autonumber
    actor User as ユーザー (User)
    participant UI as Calendar UI
    participant SDK as Firestore SDK (Client)
    participant DB as Cloud Firestore (events)
    
    Note over User, UI: パート1: カレンダーイベントの作成
    User->>UI: イベントを作成し、Scopeを選択 (company / group / personal)
    UI->>SDK: addCalendarEvent(eventData) を呼び出す
    SDK->>DB: addDoc(collection(db, "events"), event)
    DB-->>UI: 新規イベントIDを返却
    
    Note over User, UI: パート2: カレンダーの読み込みとフィルタリング
    User->>UI: カレンダーページ (/calendar) を開く
    UI->>SDK: subscribeToEvents() でリスナーを登録
    SDK->>DB: onSnapshot() によるリアルタイム監視
    DB-->>SDK: 全イベントリストを返却
    
    Note over SDK, UI: クライアント側でセキュリティフィルタを適用
    loop 各イベントに対して
        alt event.scope == 'company'
            SDK->>UI: 表示を許可 (全員閲覧可能)
        else event.scope == 'group'
            alt ユーザーがそのグループのメンバーまたは管理者
                SDK->>UI: 表示を許可
            else ユーザーがそのグループに所属していない
                SDK->>UI: イベントを除外
            end
        else event.scope == 'personal'
            alt event.createdBy == user.uid (本人)
                SDK->>UI: 表示を許可
            else
                SDK->>UI: イベントを除外 (完全にプライベート)
            end
        end
    end
    UI-->>User: 有効なイベントのみをカレンダーグリッドに描画
```

---

## 6. お知らせとカレンダー連携フロー (Announcement & Calendar Event Sync Flow)
お知らせ（Announcement）の作成とカレンダーイベント（Calendar Event）の自動連携、および更新・削除時の双方向同期メカニズムを示します。

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 管理者 (Admin)
    participant UI as Announcement Page
    participant Action as Firestore API (announcements)
    participant DB as Cloud Firestore (announcements & events)
    
    Admin->>UI: お知らせを作成し「カレンダーと同期」オプションを選択
    UI->>Action: createAnnouncement() を呼び出す
    
    Note over Action, DB: ステップ1: eventsコレクションにイベント情報を書き込む
    Action->>DB: addDoc(collection(db, "events"), eventData)
    DB-->>Action: calendarEventId を返却
    
    Note over Action, DB: ステップ2: お知らせを書き込み、calendarEventIdを紐付け保存
    Action->>DB: addDoc(collection(db, "announcements"), { ..., calendarEventId })
    DB-->>UI: お知らせの投稿成功
    UI-->>Admin: 掲示板とカレンダーに同期表示

    Note over Admin, DB: お知らせの削除または編集時
    Admin->>UI: 「お知らせを削除」をクリック
    UI->>Action: deleteAnnouncement(announcementId) を呼び出す
    Action->>DB: お知らせドキュメントを取得し calendarEventId を読み取る
    DB-->>Action: calendarEventId を返却
    Action->>DB: deleteDoc(events/{calendarEventId}) (カレンダーイベントを削除)
    Action->>DB: deleteDoc(announcements/{announcementId}) (お知らせを削除)
    DB-->>UI: 双方向削除完了
    UI-->>Admin: 掲示板とカレンダーの同期更新を反映
```

---

## 7. 1対1ダイレクトメッセージチャネル確立フロー (Direct Messaging 1-1 Provisioning Flow)
社員名簿やプロフィールページからDMチャネルを自動確認・初期化し、1対1のチャット画面へ遷移するプロセスを示します。

```mermaid
sequenceDiagram
    autonumber
    actor UserA as ユーザーA
    participant UI as People Directory UI
    participant SDK as Firestore API (ensureDirectChannel)
    participant DB as Cloud Firestore (channels)
    
    UserA->>UI: ユーザーBのプロフィールで「メッセージを送る」ボタンをクリック
    UI->>SDK: ensureDirectChannel(UserA, UserB) を呼び出す
    
    Note over SDK: UIDをアルファベット順にソートして一意のチャネルIDを生成:<br/>channelId = "dm_" + sort(uidA, uidB)
    
    SDK->>DB: getDoc(channels/{channelId}) で存在確認
    
    alt DMチャネルが存在しない (初めてのチャット)
        SDK->>DB: setDoc(channels/{channelId}, { type: "dm", members: [uidA, uidB] })
        DB-->>SDK: チャネル作成成功
    else DMチャネルが既に存在する
        DB-->>SDK: 既存チャネル情報を返却
    end
    
    SDK-->>UI: channelId を返却
    UI->>UI: ルート遷移: router.push('/chat?channelId=' + channelId)
    UI-->>UserA: ユーザーBとの1対1チャット画面を表示
```

---
*システムフロー図更新日: 2026年06月01日*
