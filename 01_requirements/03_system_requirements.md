# Yêu cầu Hệ thống (System Requirements)
**Dự án**: Porocia — Nền tảng Giao tiếp Nội bộ Doanh nghiệp
**Phiên bản tài liệu**: 1.0
**Ngày cập nhật**: 2026-05-29
**Trạng thái**: Draft

---

## 1. Tổng quan

Tài liệu này mô tả các yêu cầu hệ thống ở mức kỹ thuật cho Porocia, bao gồm kiến trúc, các API nội bộ, cấu trúc dữ liệu, luồng xử lý và ràng buộc kỹ thuật. Tài liệu này là cầu nối giữa Business Requirements và Implementation.

---

## 2. Kiến trúc Hệ thống (System Architecture)

### 2.1 Sơ đồ Kiến trúc Tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│  Browser (Next.js App Router — React 19 Server Components)       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Page/Route │  │  Components │  │  Client Hooks           │  │
│  │  (RSC)      │  │  (CSR/SSR)  │  │  useChat, useChannels   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────────┘  │
└─────────┼────────────────┼───────────────────-─┼────────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                              │
│  Next.js Server Actions                                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Server Actions (auth, members)                           │  │
│  │  src/lib/actions/                                         │  │
│  │  └─────────────────────────────────────────────┬───────────┘  │
└────────────────────────────────────────────────┼────────────────┘
              │                                   │
              ▼                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE LAYER                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Firebase Auth  │  │   Firestore DB  │  │  Cloudinary CDN │  │
│  │  (Identity)     │  │   (Data Store)  │  │  (Image Upload) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Phân lớp Ứng dụng

| Lớp | Vị trí | Công nghệ | Mô tả |
|-----|--------|-----------|-------|
| **Routing / Pages** | `src/app/` | Next.js 16 App Router | Xử lý routing; Server Components mặc định |
| **UI Components** | `src/components/` | React 19, shadcn/ui | Các thành phần tái sử dụng |
| **Business Logic** | `src/lib/firebase/` | TypeScript | Helpers tương tác với Firebase |
| **Server Actions** | `src/lib/actions/` | Next.js Server Actions | Thao tác server-side an toàn |
| **Custom Hooks** | `src/hooks/` | React Hooks | Quản lý state client-side |
| **Validation** | `src/lib/validations/` | Zod | Schema validation cho forms |

---

## 3. Cấu trúc Route (Routing Architecture)

### 3.1 Phân nhóm Route

```
src/app/
├── (auth)/                    # Nhóm: Chưa xác thực
│   └── login/page.tsx         # GET /login
│
├── (protected)/               # Nhóm: Yêu cầu xác thực (Layout kiểm tra session)
│   ├── layout.tsx             # Protected layout — verifySessionCookie
│   │
│   ├── (root)/                # Nhóm: Giao diện người dùng thông thường
│   │   ├── layout.tsx         # Root layout với sidebar/nav
│   │   ├── page.tsx           # GET / — Trang chủ
│   │   ├── chat/
│   │   │   ├── layout.tsx     # Chat layout với sidebar kênh
│   │   │   ├── page.tsx       # GET /chat — Màn hình chọn kênh
│   │   │   └── [channelId]/   # GET /chat/{channelId}
│   │   ├── announcements/     # GET /announcements
│   │   ├── calendar/          # GET /calendar
│   │   ├── people/            # GET /people
│   │   ├── knowledge/
│   │   │   ├── page.tsx       # GET /knowledge
│   │   │   ├── new/           # GET /knowledge/new
│   │   │   └── [articleId]/   # GET /knowledge/{articleId}
│   │   ├── profile/           # GET /profile
│   │   └── help/              # GET /help
│   │
│   └── (admin)/               # Nhóm: Yêu cầu role=admin
│       └── dashboard/
│           ├── page.tsx       # GET /dashboard
│           ├── announcements/ # GET /dashboard/announcements
│           ├── members/       # GET /dashboard/members
│           ├── events/        # GET /dashboard/events (WIP)
│           └── settings/      # GET /dashboard/settings (WIP)

```

### 3.2 Bảo vệ Route (Route Guards)

| Điều kiện | Xử lý |
|-----------|-------|
| Truy cập route `(protected)` không có session | Redirect về `/login` |
| Truy cập route `(admin)` với role `member` | Redirect về `/` hoặc hiển thị 403 |
| Session Cookie hết hạn | Firebase Admin `verifySessionCookie` throw error → Redirect login |

---

## 4. Hệ thống Xác thực (Authentication System)

### 4.1 Luồng Đăng nhập

```
Client                    Next.js Server            Firebase
  │                            │                       │
  │─── loginWithEmail() ──────►│                       │
  │     (email, password)      │                       │
  │                            │──signInWithEmailAndPassword()─►│
  │                            │◄── credential ────────│
  │                            │──getIdToken() ────────►│
  │                            │◄── idToken ───────────│
  │                            │                       │
  │◄── createSessionCookie() ──│                       │
  │    (Server Action)         │──adminAuth.createSessionCookie()─►│
  │                            │◄── sessionCookie ─────│
  │                            │                       │
  │    HTTP-only Cookie set ───│                       │
  │◄──────────────────────────│                       │
```

### 4.2 Xác minh Phiên (Session Verification)

```typescript
// src/app/(protected)/layout.tsx — Thực hiện mỗi request
const sessionCookie = cookies().get("session")?.value;
const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
// → checkRevoked = true: kiểm tra token bị thu hồi
```

### 4.3 Đồng bộ Hồ sơ Người dùng

Sau mỗi lần đăng nhập, `syncUserToFirestore()` được gọi để:
1. **Tạo mới** document `users/{uid}` nếu chưa tồn tại (với role mặc định `member`)
2. **Cập nhật** `lastLoginAt` nếu đã tồn tại

---

## 5. Cấu trúc Cơ sở Dữ liệu (Database Schema)

### 5.1 Collection `users`

```typescript
interface UserDocument {
  uid: string;                    // Firebase Auth UID
  email: string | null;
  displayName: string;            // Tên hiển thị (mặc định: email prefix)
  photoURL: string;               // Cloudinary URL hoặc ""
  bio: string;                    // Tiểu sử
  role: "member" | "admin";       // Mặc định: "member"
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  updatedAt?: Timestamp;          // Khi chỉnh sửa hồ sơ
}

// Sub-collection: users/{uid}/readState/{channelId}
interface ReadStateDocument {
  lastReadAt: Timestamp;
  lastReadMessageId: string;
}
```

### 5.2 Collection `channels`

```typescript
interface ChannelDocument {
  name: string;
  description: string;
  type: "public" | "private" | "dm";
  createdBy: string;              // UID
  createdAt: Timestamp;
  isArchived: boolean;
  members: string[];              // Mảng UID
  unreadCount: Record<string, number>; // { uid: count }
}

// Sub-collection: channels/{id}/messages/{messageId}
interface MessageDocument {
  text: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderPhotoURL?: string;
  type: "text";
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  readBy: string[];               // Mảng UID đã đọc
  readAt: Record<string, Timestamp>; // { uid: timestamp }
  replyTo?: {
    messageId: string;
    senderId: string;
    senderName: string;
    senderPhotoURL?: string;
    text: string;
  } | null;
  reactions?: Record<string, string[]>; // { emoji: [uid] }
}
```

### 5.3 Collection `announcements`

```typescript
interface AnnouncementDocument {
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "event";
  isPinned: boolean;
  imageUrl?: string;              // Cloudinary URL
  createdBy: string;             // UID của admin
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  likes?: string[];              // Mảng UID đã like
  // Comments: sub-collection hoặc field
}
```

### 5.4 Collection `events`

```typescript
interface EventDocument {
  title: string;
  description?: string;
  type: "event" | "success" | "warning" | "info";
  scope: "company" | "group" | "personal";
  groupId?: string;              // Nếu scope = "group"
  createdBy: string;
  createdAt: Timestamp;
  startDate: Timestamp;
  endDate: Timestamp;
  allDay?: boolean;
}
```

### 5.5 Collection `articles` (Knowledge Base)

```typescript
interface ArticleDocument {
  title: string;
  content: string;               // Nội dung Markdown
  summary: string;
  category: "hr" | "engineering" | "design" | "onboarding" | "sales";
  tags: string[];
  scope: "company" | "group" | "admin";
  allowedGroups?: string[];      // IDs nhóm nếu scope = "group"
  views: number;
  likes: string[];               // Mảng UID
  createdBy: string;
  authorName: string;
  authorPhoto?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5.6 Collection `groups`

```typescript
interface GroupDocument {
  name: string;
  description: string;
  memberIds: string[];           // Mảng UID
  createdBy: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

---

## 6. Các Server Actions Nội bộ (Internal Server Actions)

### 6.1 Server Actions: Session & Authentication

Dự án sử dụng Next.js Server Actions thay vì API Route Handlers để quản lý session và xác thực an toàn ở phía server.

| Action | File | Mô tả | Arguments | Response |
|--------|------|-------|-----------|----------|
| `createSessionCookieAction` | `src/lib/actions/auth.ts` | Tạo session cookie `__session` từ Firebase ID Token | `idToken: string` | `{ ok: boolean }` + Set-Cookie |
| `removeSessionCookieAction` | `src/lib/actions/auth.ts` | Xóa session cookie `__session` khi đăng xuất | — | `{ ok: boolean }` + Clear Cookie |
| `validateSessionCookieAction` | `src/lib/actions/auth.ts` | Xác minh session cookie gửi từ trình duyệt | — | `Promise<string \| null>` (UID hoặc null) |
| `syncSessionIfNeededAction` | `src/lib/actions/auth.ts` | Tự động đồng bộ cookie nếu thiếu nhưng client vẫn đăng nhập | `idToken: string` | `{ ok: boolean, alreadySynced: boolean }` |

**Cơ chế hoạt động của `createSessionCookieAction`:**
```
1. Nhận idToken gửi từ Client SDK
2. Gọi adminAuth.createSessionCookie(idToken, { expiresIn }) tạo cookie có thời hạn 5 ngày
3. Thiết lập cookie HTTP-only, Secure (trong môi trường production), sameSite: "lax", tên cookie là __session
```

---

## 7. Luồng Dữ liệu Thời gian Thực (Real-time Data Flow)

### 7.1 Chat Message Flow

```
User gửi tin nhắn
│
├─ 1. Client gọi sendMessage()
│   └─ writeBatch gồm:
│       ├─ addDoc vào channels/{id}/messages  (tin nhắn mới)
│       ├─ update channels/{id}.members (arrayUnion senderId)
│       └─ update channels/{id}.unreadCount (increment cho mỗi thành viên khác)
│
├─ 2. listenLatestMessages() onSnapshot kích hoạt trên tất cả client đang xem kênh
│   └─ UI tự động cập nhật — không cần reload
│
└─ 3. listenChannels() onSnapshot kích hoạt trên sidebar tất cả thành viên
    └─ Badge unread count cập nhật tức thì
```

### 7.2 Read Receipt Flow

```
User mở kênh
│
└─ markChannelAsRead(channelId, uid) gọi writeBatch gồm:
    ├─ update messages/{latestId}.readBy (arrayUnion uid)
    ├─ update messages/{latestId}.readAt[uid] = now
    ├─ set users/{uid}/readState/{channelId}
    └─ update channels/{id}.unreadCount[uid] = 0
```

---

## 8. Hệ thống Phân quyền Kỹ thuật (Authorization Implementation)

### 8.1 Role-Based Access Control (RBAC)

| Kiểm tra | Vị trí | Cách thực hiện |
|---------|--------|----------------|
| Route admin | `(admin)/dashboard/layout.tsx` | `verifySessionCookie` + kiểm tra `users/{uid}.role === "admin"` |
| Hiển thị nút Edit/Delete | Component level | `profile?.role === "admin" || item.createdBy === uid` |
| Lọc bài viết Knowledge Base | `useMemo` trong page | Lọc theo `scope` + `allowedGroups` |
| Lọc sự kiện Calendar | `subscribeToEvents` | Firebase query + client-side filter theo `scope` và `groupId` |

### 8.2 Content Scope Filtering (Knowledge Base & Calendar)

```typescript
// Client-side filter — ví dụ knowledge.ts
articles.filter(article => {
  if (article.scope === "company") return true;
  if (article.scope === "admin") return isAdmin;
  if (article.scope === "group") {
    return isAdmin || article.allowedGroups?.some(g => userGroups.includes(g));
  }
  return false;
});
```

> **Lưu ý quan trọng**: Việc lọc hiện tại thực hiện một phần ở client-side. Cần bổ sung Firestore Security Rules để đảm bảo bảo mật ở tầng data trước khi production.

---

## 9. Tích hợp Dịch vụ Bên ngoài (External Integrations)

### 9.1 Cloudinary (Image CDN)

| Tác vụ | Cách thực hiện |
|--------|----------------|
| Upload ảnh đại diện | Client upload trực tiếp đến Cloudinary bằng Upload Preset (`porocia`) |
| Upload ảnh thông báo | Qua `ImageUploaderClient.tsx` — Cloudinary unsigned upload |
| Thư mục tổ chức | `porocia/avatars/{uid}` cho avatar; `porocia/announcements/` cho ảnh thông báo |
| Truy cập URL | `data.secure_url` từ Cloudinary API response |

**Biến môi trường:**
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=porocia
```

### 9.2 Firebase (Toàn bộ Backend)

| Dịch vụ | Sử dụng |
|---------|---------|
| Firebase Auth | Xác thực người dùng, quản lý credential |
| Firestore | Toàn bộ data store — realtime với onSnapshot |
| Firebase Admin SDK | Server-side: tạo/xác minh session cookie, đọc dữ liệu admin |
| Firebase Storage | (Đã cấu hình nhưng hiện dùng Cloudinary cho ảnh) |

**Cấu hình Client** (`src/lib/firebase/client.ts`):
```typescript
experimentalForceLongPolling: true  // Tăng độ tin cậy kết nối WebChannel
```

---

## 10. Ràng buộc Kỹ thuật (Technical Constraints)

| Ràng buộc | Giá trị | Lý do |
|-----------|---------|-------|
| Kích thước ảnh upload tối đa | 2 MB | Giới hạn Cloudinary free tier & UX |
| Số tin nhắn tải mỗi lần (PAGE_SIZE) | 20 tin nhắn | Cân bằng hiệu năng & UX |
| Session Cookie thời hạn | 7 ngày | Cân bằng bảo mật & tiện lợi |
| Firebase Auth Token | 1 giờ | Mặc định Firebase; session cookie dài hơn |
| Thời gian đọc KB | content.length ÷ 400 ký tự/phút | Công thức ước tính đơn giản |
| TypeScript mode | Strict | Bắt buộc trong `tsconfig.json` |

---

## 11. Môi trường và Cấu hình (Environment Configuration)

### 11.1 Biến Môi trường Yêu cầu

| Biến | Phạm vi | Mô tả |
|------|---------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client | Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client | Firebase App ID |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client | Cloudinary Cloud Name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Client | Cloudinary Upload Preset |
| `FIREBASE_ADMIN_PROJECT_ID` | Server only | Firebase Admin Project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Server only | Firebase Admin Service Account |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Server only | Firebase Admin Private Key |

### 11.2 Scripts

| Script | Lệnh | Mô tả |
|--------|------|-------|
| Development | `npm run dev` | Chạy Next.js với Turbopack tại port 3000 |
| Build | `npm run build` | Build production bundle |
| Start | `npm run start` | Chạy production server |
| Lint | `npm run lint` | Kiểm tra ESLint |

---

## 12. Yêu cầu Không thể Phá vỡ (Hard Requirements)

| # | Yêu cầu | Mức độ |
|---|---------|--------|
| HR-01 | `"use client"` chỉ được dùng khi thực sự cần (không được dùng trên layout/page mặc định) | Bắt buộc |
| HR-02 | Toàn bộ admin credential (`FIREBASE_ADMIN_*`) phải là server-only, không được prefix `NEXT_PUBLIC_` | Bắt buộc |
| HR-03 | Mọi thao tác ghi Firestore quan trọng phải dùng `writeBatch` để đảm bảo atomicity | Khuyến nghị |
| HR-04 | `onSnapshot` listener phải được cleanup (unsubscribe) khi component unmount | Bắt buộc |
| HR-05 | Không hardcode credential trong source code; sử dụng `.env.local` | Bắt buộc |
| HR-06 | Firestore Security Rules phải được viết và kiểm thử trước khi deploy production | Bắt buộc |

---

## 13. Kế hoạch Kiểm thử Hệ thống (System Test Plan)

| Loại kiểm thử | Phạm vi | Công cụ |
|--------------|---------|---------|
| **Unit Test** | Hàm helper Firebase, Zod schema | Jest / Vitest |
| **Integration Test** | API routes, Server Actions | Jest + testing-library |
| **E2E Test** | Luồng đăng nhập, gửi tin, xem thông báo | Playwright |
| **Security Test** | Firestore Security Rules | Firebase Emulator Suite |
| **Performance Test** | Thời gian tải trang, realtime latency | Lighthouse, Chrome DevTools |
| **Manual Test** | UI/UX trên Desktop và Tablet | Kiểm tra tay |

---

*Tài liệu System Requirements này được tổng hợp từ phân tích codebase thực tế của Porocia v0.1.0. Cần cập nhật song song với mỗi thay đổi kiến trúc.*

*最終更新: 2026年05月29日*
