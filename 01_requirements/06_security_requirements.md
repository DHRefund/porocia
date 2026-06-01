# Yêu cầu Bảo mật (Security Requirements)
**Dự án**: Porocia — Nền tảng Giao tiếp Nội bộ Doanh nghiệp
**Phiên bản tài liệu**: 1.0
**Ngày cập nhật**: 2026-05-29
**Trạng thái**: Draft

---

## 1. Tổng quan Bảo mật

Porocia là nền tảng nội bộ doanh nghiệp xử lý thông tin nhạy cảm: tin nhắn nội bộ, tài liệu công ty, thông tin nhân sự. Bảo mật phải được đảm bảo ở **nhiều tầng** — từ xác thực, phân quyền, truyền tải, đến lưu trữ dữ liệu.

### 1.1 Mô hình Bảo mật Tổng quan

```
┌────────────────────────────────────────────────────────┐
│  Tầng 1: Xác thực (Authentication)                     │
│  Firebase Auth + HTTP-only Session Cookie               │
├────────────────────────────────────────────────────────┤
│  Tầng 2: Phân quyền Route (Route Authorization)        │
│  Next.js Layout → verifySessionCookie (Admin SDK)       │
├────────────────────────────────────────────────────────┤
│  Tầng 3: Phân quyền Dữ liệu (Data Authorization)       │
│  Firestore Security Rules (⚠️ cần hoàn thiện)          │
├────────────────────────────────────────────────────────┤
│  Tầng 4: Bảo mật Truyền tải (Transport Security)       │
│  HTTPS/TLS bắt buộc toàn bộ; Secure Cookie             │
├────────────────────────────────────────────────────────┤
│  Tầng 5: Bảo mật Upload (Media Security)               │
│  Cloudinary Unsigned Upload với Upload Preset giới hạn  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Xác thực (Authentication Security)

### 2.1 Cơ chế Hiện tại

| Thành phần | Cài đặt | Mức độ bảo mật |
|-----------|---------|----------------|
| **Identity Provider** | Firebase Authentication | ✅ Cao — Google-managed |
| **Credential storage** | Firebase Auth (không lưu password trong app) | ✅ Cao |
| **Session mechanism** | HTTP-only Session Cookie | ✅ Cao — không thể truy cập từ JS |
| **Session duration** | 7 ngày | 🟡 Trung bình — cân nhắc rút ngắn nếu cần |
| **Token verification** | `adminAuth.verifySessionCookie(cookie, checkRevoked=true)` | ✅ Cao — kiểm tra revocation |

### 2.2 Luồng Tạo Session Cookie

```
Client                    Next.js Server            Firebase Admin
  │── idToken ──────────►│                              │
  │                       │── createSessionCookie() ──►│
  │                       │◄── sessionCookie ───────────│
  │◄── Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax ──│
```

**Thuộc tính Cookie bắt buộc:**

| Thuộc tính | Giá trị | Lý do |
|-----------|---------|-------|
| `HttpOnly` | `true` | Ngăn XSS đọc cookie từ JavaScript |
| `Secure` | `true` (production) | Chỉ gửi qua HTTPS |
| `SameSite` | `Lax` hoặc `Strict` | Ngăn CSRF attacks |
| `Path` | `/` | Cookie áp dụng cho toàn app |
| `Max-Age` / `Expires` | 7 ngày | Session duration |

### 2.3 Yêu cầu Bảo mật Xác thực

| ID | Yêu cầu | Mức độ |
|----|---------|--------|
| SEC-AUTH-01 | Session Cookie PHẢI có thuộc tính `HttpOnly` và `Secure` | 🔴 Bắt buộc |
| SEC-AUTH-02 | Sử dụng `checkRevoked: true` khi verify session để phát hiện token bị thu hồi | 🔴 Bắt buộc |
| SEC-AUTH-03 | Không lưu trữ password người dùng ở bất kỳ đâu trong codebase | 🔴 Bắt buộc |
| SEC-AUTH-04 | Đăng xuất phải xóa cả session cookie phía server lẫn Firebase Auth state phía client | 🔴 Bắt buộc |
| SEC-AUTH-05 | Không expose Firebase Admin credentials (`FIREBASE_PRIVATE_KEY`) ra client bundle | 🔴 Bắt buộc |
| SEC-AUTH-06 | Rate limiting cho Server Action tạo/xác thực session để ngăn brute force | 🟡 Khuyến nghị |

---

## 3. Phân quyền Route (Route-Level Authorization)

### 3.1 Hierarchy Phân quyền Route

```
/login                   → Public (không cần auth)
/                        → Protected (cần session hợp lệ)
/chat/*                  → Protected
/announcements           → Protected
/calendar                → Protected
/people                  → Protected
/knowledge/*             → Protected
/profile                 → Protected
/dashboard/*             → Protected + role=admin bắt buộc
Server Actions (auth)    → Semi-public (nhận idToken để khởi tạo session cookie)
```

### 3.2 Cơ chế Bảo vệ Route

**Protected routes** (`src/app/(protected)/layout.tsx`):
```typescript
// Thực thi mỗi server request:
const sessionCookie = cookies().get("session")?.value;
if (!sessionCookie) redirect("/login");

const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
if (!decodedToken) redirect("/login");
```

**Admin routes** (`src/app/(protected)/(admin)/dashboard/`):
```typescript
// Thêm kiểm tra role sau khi verify session:
const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
if (userDoc.data()?.role !== "admin") redirect("/");
```

### 3.3 Yêu cầu Bảo mật Route

| ID | Yêu cầu | Mức độ |
|----|---------|--------|
| SEC-ROUTE-01 | Mọi route trong nhóm `(protected)` PHẢI được xác minh session trước khi render | 🔴 Bắt buộc |
| SEC-ROUTE-02 | Route `/dashboard/*` PHẢI kiểm tra `role=admin` ngoài session hợp lệ | 🔴 Bắt buộc |
| SEC-ROUTE-03 | Redirect về `/login` khi session không hợp lệ — không hiển thị nội dung trước | 🔴 Bắt buộc |
| SEC-ROUTE-04 | Không để lộ thông tin nhạy cảm trong error message khi auth thất bại | 🟡 Khuyến nghị |

---

## 4. Bảo mật Dữ liệu Firestore (Data-Level Security)

### 4.1 Firestore Security Rules — Yêu cầu

> ⚠️ **Trạng thái hiện tại**: Security Rules chưa được triển khai đầy đủ. Phân quyền hiện thực hiện chủ yếu ở tầng client (React component) và server route. Đây là rủi ro bảo mật cần giải quyết **trước khi production**.

**Nguyên tắc thiết kế Rules:**

```javascript
// Cấu trúc Rules mẫu cho Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─── Hàm helper ─────────────────────────────────────
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isOwner(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }

    function isMemberOfGroup(groupId) {
      return isAuthenticated() &&
        request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.members;
    }

    // ─── Collection: users ──────────────────────────────
    match /users/{uid} {
      allow read: if isAuthenticated();               // Mọi user đã login được đọc
      allow write: if isOwner(uid) || isAdmin();      // Chỉ chính chủ hoặc admin mới sửa

      match /readState/{channelId} {
        allow read, write: if isOwner(uid);           // Chỉ chính chủ
      }
    }

    // ─── Collection: channels ───────────────────────────
    match /channels/{channelId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin();                     // Chỉ admin tạo kênh
      allow update: if isAdmin() ||
        (isAuthenticated() && request.auth.uid in resource.data.members);
      allow delete: if isAdmin();

      match /messages/{messageId} {
        allow read: if isAuthenticated() &&
          (resource.data == null ||
           channelId.matches('.*') /* public */ ||
           request.auth.uid in get(/databases/$(database)/documents/channels/$(channelId)).data.members);
        allow create: if isAuthenticated();
        allow update: if isOwner(resource.data.senderId) || isAdmin();
        allow delete: if isAdmin();
      }
    }

    // ─── Collection: announcements ──────────────────────
    match /announcements/{announcementId} {
      allow read: if isAuthenticated();               // Mọi user đã login
      allow create, update, delete: if isAdmin();     // Chỉ admin

      match /comments/{commentId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();           // Mọi user comment được
        allow delete: if isOwner(resource.data.authorId) || isAdmin();
      }
    }

    // ─── Collection: events ────────────────────────────
    match /events/{eventId} {
      allow read: if isAuthenticated() && (
        resource.data.scope == 'company' ||
        isAdmin() ||
        (resource.data.scope == 'personal' && isOwner(resource.data.createdBy)) ||
        (resource.data.scope == 'group' && isMemberOfGroup(resource.data.groupId))
      );
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.createdBy) || isAdmin();
    }

    // ─── Collection: articles (Knowledge Base) ─────────
    match /articles/{articleId} {
      allow read: if isAuthenticated() && (
        resource.data.scope == 'all' ||
        isAdmin() ||
        (resource.data.scope == 'group' &&
          request.auth.uid in resource.data.allowedGroups.map(g =>
            get(/databases/$(database)/documents/groups/$(g)).data.members).flatten())
      );
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.createdBy) || isAdmin();
      allow delete: if isOwner(resource.data.createdBy) || isAdmin();

      match /comments/{commentId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated();
        allow delete: if isOwner(resource.data.userId) || isAdmin();
      }
    }

    // ─── Collection: groups ─────────────────────────────
    match /groups/{groupId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }
  }
}
```

### 4.2 Yêu cầu Bảo mật Dữ liệu

| ID | Yêu cầu | Mức độ |
|----|---------|--------|
| SEC-DATA-01 | Firestore Security Rules PHẢI được triển khai trước khi production | 🔴 Bắt buộc |
| SEC-DATA-02 | Sự kiện cá nhân (`scope=personal`) KHÔNG được đọc bởi người khác ở tầng Firestore | 🔴 Bắt buộc |
| SEC-DATA-03 | Bài viết KB scope `admin` KHÔNG được đọc bởi member ở tầng Firestore | 🔴 Bắt buộc |
| SEC-DATA-04 | Tin nhắn trong kênh private KHÔNG được đọc bởi người ngoài kênh | 🔴 Bắt buộc |
| SEC-DATA-05 | Chỉ admin mới được phép tạo/sửa/xóa thông báo và channel | 🔴 Bắt buộc |
| SEC-DATA-06 | Người dùng chỉ được sửa document `users/{uid}` của chính mình | 🔴 Bắt buộc |
| SEC-DATA-07 | Dùng Firebase Emulator Suite để test Security Rules trước khi deploy | 🟡 Khuyến nghị |

---

## 5. Bảo mật Biến Môi trường (Environment Variable Security)

### 5.1 Phân loại Biến Môi trường

| Prefix | Phạm vi | Quy tắc |
|--------|---------|---------|
| `NEXT_PUBLIC_*` | Client + Server | Có thể expose ra client bundle — chỉ dùng cho non-sensitive config |
| Không có prefix | Server only | KHÔNG bao giờ expose ra client |

### 5.2 Kiểm tra Phân loại Hiện tại

| Biến | Prefix | Đúng/Sai | Ghi chú |
|------|--------|---------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public | ✅ Đúng | API Key Firebase là public by design |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public | ✅ Đúng | |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Public | ✅ Đúng | |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Public | ✅ Đúng | Upload Preset kiểm soát qua Cloudinary settings |
| `FIREBASE_PROJECT_ID` | Server only | ✅ Đúng | Admin credential |
| `FIREBASE_CLIENT_EMAIL` | Server only | ✅ Đúng | Admin credential |
| `FIREBASE_PRIVATE_KEY` | Server only | ✅ Đúng | **Quan trọng nhất — KHÔNG được prefix NEXT_PUBLIC_** |

### 5.3 Yêu cầu Bảo mật Env Vars

| ID | Yêu cầu | Mức độ |
|----|---------|--------|
| SEC-ENV-01 | `FIREBASE_PRIVATE_KEY` KHÔNG được có prefix `NEXT_PUBLIC_` | 🔴 Bắt buộc |
| SEC-ENV-02 | File `.env.local` PHẢI được thêm vào `.gitignore` (đã có) | 🔴 Bắt buộc |
| SEC-ENV-03 | Không commit biến môi trường vào Git history | 🔴 Bắt buộc |
| SEC-ENV-04 | Dùng secret management (Vercel Env Vars / GitHub Secrets) cho production | 🟡 Khuyến nghị |
| SEC-ENV-05 | `server.ts` phải import `'server-only'` để ngăn bundle vào client (đã có) | 🔴 Bắt buộc |

---

## 6. Bảo mật Upload Media (Media Upload Security)

### 6.1 Upload Ảnh qua Cloudinary

**Cơ chế hiện tại**: Unsigned Upload với Upload Preset

```typescript
// src/lib/firebase/auth.ts — uploadAvatar()
formData.append("upload_preset", "porocia");  // Preset kiểm soát quyền upload
formData.append("folder", `porocia/avatars/${userId}`);
// → Upload trực tiếp từ client đến Cloudinary (không qua Next.js server)
```

**Rủi ro và Giải pháp:**

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| Bất kỳ ai biết upload preset đều có thể upload | 🟡 Trung bình | Cấu hình Cloudinary: giới hạn file type, size, folder |
| Không có virus scan | 🟡 Trung bình | Bật Cloudinary Auto Moderation |
| URL ảnh có thể đoán được | 🟢 Thấp | Dùng folder có uid để cá nhân hóa |

### 6.2 Yêu cầu Bảo mật Upload

| ID | Yêu cầu | Mức độ |
|----|---------|--------|
| SEC-MEDIA-01 | Giới hạn kích thước file ≤ 2MB được kiểm tra phía client TRƯỚC khi upload | 🔴 Bắt buộc |
| SEC-MEDIA-02 | Chỉ cho phép file types: `image/jpeg`, `image/png`, `image/webp`, `image/gif` | 🔴 Bắt buộc |
| SEC-MEDIA-03 | Cloudinary Upload Preset phải được cấu hình `unsigned=true` kèm giới hạn allowed_formats | 🔴 Bắt buộc |
| SEC-MEDIA-04 | Không lưu file vào server Next.js — luôn upload thẳng đến Cloudinary/Storage | 🟡 Khuyến nghị |
| SEC-MEDIA-05 | Xóa ảnh Cloudinary khi xóa article chứa ảnh đó (đã implement trong `deleteArticle`) | 🟡 Khuyến nghị |

---

## 7. Bảo mật Truyền tải (Transport Security)

| ID | Yêu cầu | Mức độ | Trạng thái |
|----|---------|--------|-----------|
| SEC-TLS-01 | Toàn bộ traffic PHẢI qua HTTPS — không cho phép HTTP | 🔴 Bắt buộc | ✅ Vercel tự enforce |
| SEC-TLS-02 | Session Cookie có thuộc tính `Secure` — chỉ gửi qua HTTPS | 🔴 Bắt buộc | Cần verify |
| SEC-TLS-03 | Firebase SDK luôn dùng HTTPS để kết nối Firestore | 🔴 Bắt buộc | ✅ Firebase default |
| SEC-TLS-04 | Cloudinary URL dùng `secure_url` (`https://`) — không dùng `http://` | 🔴 Bắt buộc | ✅ Code dùng `data.secure_url` |

---

## 8. Bảo mật Injection & XSS

| Loại tấn công | Cơ chế bảo vệ | Trạng thái |
|--------------|--------------|-----------|
| **XSS (Cross-Site Scripting)** | React tự động escape HTML; Cookie HttpOnly | ✅ Được bảo vệ |
| **Markdown XSS** | `rehype-sanitize` khi render Markdown trong Knowledge Base | ✅ Được bảo vệ |
| **SQL Injection** | Không dùng SQL; Firestore API tự escape | ✅ N/A |
| **CSRF** | Session Cookie với `SameSite=Lax`; Server Actions không dùng GET | ✅ Được bảo vệ |
| **Path Traversal** | Next.js App Router chuẩn hóa paths; Firestore document IDs auto-generated | ✅ Được bảo vệ |

### 8.1 Yêu cầu Chống XSS/Injection

| ID | Yêu cầu | Mức độ |
|----|---------|--------|
| SEC-XSS-01 | Tất cả nội dung Markdown render PHẢI dùng `rehype-sanitize` để loại bỏ script tags | 🔴 Bắt buộc |
| SEC-XSS-02 | Không dùng `dangerouslySetInnerHTML` trừ khi đã sanitize kỹ | 🔴 Bắt buộc |
| SEC-XSS-03 | Input từ người dùng (chat, comments) PHẢI được trim và validate trước khi lưu | 🟡 Khuyến nghị |

---

## 9. Quản lý Bí mật & Credential (Secrets Management)

### 9.1 Danh sách Credential Nhạy cảm

| Credential | Vị trí lưu trữ | Người có quyền |
|-----------|--------------|---------------|
| Firebase Private Key (`FIREBASE_PRIVATE_KEY`) | `.env.local` / Vercel Env | DevOps / Project Owner |
| Firebase Client Email (`FIREBASE_CLIENT_EMAIL`) | `.env.local` / Vercel Env | DevOps / Project Owner |
| Cloudinary API Secret | Không dùng trong app (unsigned upload) | Cloudinary dashboard |

### 9.2 Rotation Policy (Khuyến nghị)

| Credential | Tần suất rotation | Ghi chú |
|-----------|------------------|---------|
| Firebase Service Account Key | Mỗi 6 tháng hoặc khi nghi ngờ lộ | Xóa key cũ ngay sau khi tạo key mới |
| Session Cookie duration | Review nếu có sự cố bảo mật | Hiện tại 7 ngày |

---

## 10. Tuân thủ Quy định (Compliance)

### 10.1 Luật Bảo vệ Dữ liệu Nhật Bản (個人情報保護法 — APPI)

| Yêu cầu APPI | Trạng thái trong Porocia |
|-------------|------------------------|
| Thu thập thông tin cá nhân có mục đích rõ ràng | 🟡 Cần bổ sung Privacy Policy |
| Bảo vệ thông tin cá nhân khỏi truy cập trái phép | ✅ Firebase Auth + Session Cookie + Firestore Rules (cần hoàn thiện) |
| Quyền xóa thông tin cá nhân (Right to Erasure) | ❌ Chưa implement — cần tính năng "Xóa tài khoản" |
| Thông báo khi có data breach | ❌ Chưa có cơ chế — cần kế hoạch incident response |

### 10.2 Yêu cầu Tuân thủ

| ID | Yêu cầu | Mức độ |
|----|---------|--------|
| SEC-COMP-01 | Cung cấp tính năng "Xóa tài khoản" để tuân thủ quyền xóa dữ liệu | 🔴 Bắt buộc (trước production) |
| SEC-COMP-02 | Viết và hiển thị Privacy Policy rõ ràng cho người dùng | 🔴 Bắt buộc |
| SEC-COMP-03 | Lưu audit log cho các hành động admin quan trọng (xóa user, thay đổi role) | 🟡 Khuyến nghị |
| SEC-COMP-04 | Dữ liệu người dùng được lưu trên Firebase (Google) — xác nhận data residency phù hợp | 🟡 Khuyến nghị |

---

## 11. Ma trận Rủi ro Bảo mật

| Rủi ro | Khả năng xảy ra | Mức độ ảnh hưởng | Điểm Rủi ro | Trạng thái |
|--------|---------------|-----------------|-------------|-----------|
| Firestore Rules chưa hoàn thiện | Cao | Cao | 🔴 Nguy hiểm | ⚠️ Cần xử lý ngay |
| Session cookie bị đánh cắp (nếu thiếu Secure flag) | Thấp | Cao | 🟡 Trung bình | Cần verify |
| Cloudinary upload preset bị lạm dụng | Trung bình | Thấp | 🟢 Thấp | Cần cấu hình |
| Admin credential lộ trong Git | Rất thấp | Rất cao | 🔴 Nguy hiểm | ✅ .gitignore đã có |
| XSS trong Markdown content | Thấp | Trung bình | 🟢 Thấp | ✅ rehype-sanitize |

---

## 12. Checklist Trước Khi Production

- [ ] **[CRITICAL]** Viết và deploy Firestore Security Rules đầy đủ
- [ ] **[CRITICAL]** Verify Session Cookie có `Secure` flag trong production
- [ ] **[CRITICAL]** Kiểm tra không có Admin credentials trong client bundle
- [ ] **[HIGH]** Test Security Rules với Firebase Emulator Suite
- [ ] **[HIGH]** Cấu hình Cloudinary Upload Preset: giới hạn file type và size
- [ ] **[HIGH]** Implement tính năng xóa tài khoản (APPI compliance)
- [ ] **[MEDIUM]** Viết Privacy Policy
- [ ] **[MEDIUM]** Review và rotate Firebase Service Account Key
- [ ] **[LOW]** Setup monitoring/alerting cho authentication failures

---

*Tài liệu Security Requirements này được viết dựa trên phân tích codebase Porocia v0.1.0. Bảo mật là trách nhiệm liên tục — cần review định kỳ.*

*最終更新: 2026年05月29日*
