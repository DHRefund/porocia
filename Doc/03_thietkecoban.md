# Tài liệu Thiết kế Cơ bản / 基本設計書 (Porocia Portal)

Tài liệu này trình bày chi tiết thiết kế cơ bản (Basic Design) của hệ thống cổng thông tin doanh nghiệp tích hợp **Porocia**. Tài liệu cung cấp cái nhìn toàn diện về mặt kỹ thuật: Kiến trúc hệ thống, Quy tắc UI/UX cao cấp, Cấu trúc thư mục, Mô tả chi tiết Cơ sở dữ liệu (Firestore Schema), Mô hình bảo mật, và Quy trình nghiệp vụ của từng phân hệ.

---

## 1. Kiến trúc Hệ thống / システムアーキテクチャ

Hệ thống được phát triển theo mô hình **Serverless Web Application** hiện đại, kết hợp sức mạnh kết xuất phía máy chủ của **Next.js (App Router)** và khả năng đồng bộ dữ liệu thời gian thực của **Firebase/Firestore**.

### 1.1 Thành phần Công nghệ (Tech Stack)
*   **Frontend Framework**: Next.js 16 (App Router) & React 19, TypeScript (Strict Mode).
*   **Kết xuất Trang (Rendering Strategy)**: Kết hợp linh hoạt:
    *   **React Server Components (RSC)**: Dùng cho các trang tĩnh hoặc cần lấy dữ liệu bảo mật từ server (ví dụ: danh sách tài liệu Admin-only, thông báo).
    *   **Client Components (RCC)**: Dùng cho các giao diện tương tác động và real-time (ví dụ: Chat, Lịch biểu, Modal bình luận).
*   **Styling**: Vanilla CSS (tùy chỉnh các token thiết kế cốt lõi) kết hợp **TailwindCSS** để dựng layout nhanh và nhất quán.
*   **Cơ sở dữ liệu (Database)**: Cloud Firestore (NoSQL, mô hình Document-Collection).
*   **Quản lý Ảnh & File**: Cloudinary SDK (Upload hình ảnh trong Chat, bài viết, và ảnh đại diện).
*   **Thư viện chính**:
    *   `react-big-calendar`: Calendar Engine mạnh mẽ, được custom CSS theo style Claude.
    *   `date-fns`: Thư viện xử lý ngày tháng, hỗ trợ bản địa hóa ngôn ngữ Nhật/Việt.
    *   `lucide-react`: Bộ icon tối giản vector.
    *   `sonner`: Quản lý thông báo dạng toast mượt mà.

---

## 2. Thiết kế Giao diện & Trải nghiệm (UI/UX Design System)

Porocia áp dụng ngôn ngữ thiết kế **Premium & Editorial** (lấy cảm hứng từ Claude AI của Anthropic): tĩnh lặng, tinh tế và gợi cảm giác của một cuốn sách hay tạp chí học thuật cao cấp.

### 2.1 Bảng màu và Vai trò (Color Tokens)

Hệ thống sử dụng bảng màu nóng trung tính (Warm Neutral) làm chủ đạo, tuyệt đối không dùng xám lạnh hoặc xanh lam công nghệ (ngoại trừ màu xanh Accessibility của vòng focus).

| Tên Token | Mã màu | Vai trò thiết kế |
|---|---|---|
| **Parchment** | `#f5f4ed` | Nền chính của toàn bộ trang (gợi cảm giác như giấy cao cấp). |
| **Ivory** | `#faf9f5` | Nền của các Card, Container nâng cao (tạo độ tương phản nhẹ). |
| **Pure White** | `#ffffff` | Nền của các button chính hoặc các thành phần cần độ sáng tối đa. |
| **Near Black** | `#141413` | Màu chữ chính, nền chế độ tối (màu đen ấm ngả olive, dịu mắt). |
| **Charcoal Warm** | `#4d4c48` | Màu chữ/icon trên các nút phụ. |
| **Olive Gray** | `#5e5d59` | Chữ mô tả phụ, thông tin phụ (secondary text). |
| **Stone Gray** | `#87867f` | Chữ siêu phụ, chú thích, ngày tháng (tertiary text). |
| **Terracotta Brand**| `#c96442` | Màu cam đất nung đặc trưng - dùng cho nút hành động chính (CTA). |
| **Border Cream** | `#f0eee6` | Màu viền phân cách mỏng nhẹ, tinh tế. |
| **Border Warm** | `#e8e6dc` | Màu viền nhấn cho các phần tử tương tác hoặc chia phần lớn. |
| **Focus Blue** | `#3898ec` | Viền focus khi người dùng click vào Input (đảm bảo tính Accessibility). |

### 2.2 Quy tắc Typo & Hệ thống Shadow
*   **Typo Phân cấp**:
    *   *Tiêu đề (Headlines)*: Sử dụng font có chân sang trọng (`Anthropic Serif` hoặc `Georgia`), sử dụng duy nhất một độ dày chữ `weight: 500` để giữ tiếng nói biên tập nhất quán.
    *   *Giao diện & Nội dung (UI/Body)*: Sử dụng font không chân (`Inter` hoặc `Arial`), khoảng cách dòng (line-height) cho body text luôn giữ ở mức thông thoáng `1.60`.
*   **Hệ thống Bóng đổ (Shadow & Ring)**:
    *   Không sử dụng bóng đổ xám mờ truyền thống. Sử dụng **Ring-shadow** (`0px 0px 0px 1px`) màu xám ấm để bao quanh các phần tử khi hover.
    *   Sử dụng bóng siêu nhẹ **Whisper Shadow** (`rgba(20,20,19,0.04) 0px 4px 24px`) cho các container nổi trên bề mặt giấy.
*   **Bo góc (Border Radius Scale)**:
    *   `8px`: Nút bấm nhỏ, nhãn tag, card nhỏ.
    *   `12px`: Nút bấm lớn, Input form, thanh tìm kiếm.
    *   `16px` đến `32px`: Card tính năng nổi bật, container chính, video player, ảnh đại diện lớn.

---

## 3. Cấu trúc Thư mục Chi tiết / ディレクトリ構成

Mã nguồn Next.js được tổ chức rõ ràng theo kiến trúc phân lớp trong thư mục `/src`:

```
src/
├── app/                              # Route chính của Next.js (App Router)
│   ├── (auth)/                       # Nhóm xác thực (Authentication)
│   │   ├── login/                    # Màn hình Đăng nhập
│   │   └── register/                 # Màn hình Đăng ký nhân viên
│   ├── (protected)/                  # Nhóm yêu cầu đăng nhập trước khi vào
│   │   ├── layout.tsx                # Layout bọc bảo mật, thiết lập context
│   │   ├── (admin)/                  # Phân hệ dành riêng cho quản trị viên
│   │   │   └── admin/                # Dashboard admin, quản lý role, quản lý nhóm
│   │   └── (root)/                   # Phân hệ chức năng chính của người dùng
│   │       ├── layout.tsx            # Cung cấp Sidebar định tuyến, Header
│   │       ├── page.tsx              # Trang Dashboard chính (Home)
│   │       ├── announcements/        # Phân hệ Bảng tin Công ty
│   │       ├── calendar/             # Phân hệ Lịch biểu
│   │       ├── chat/                 # Phân hệ Nhắn tin Real-time
│   │       ├── knowledge/            # Phân hệ Thư viện tài liệu (Wiki)
│   │       ├── people/               # Phân hệ Danh bạ nhân viên
│   │       └── profile/              # Phân hệ Cập nhật hồ sơ cá nhân
│   ├── layout.tsx                    # Layout gốc toàn ứng dụng (Font, Toaster)
│   └── globals.css                   # Định nghĩa biến CSS và các class custom
├── components/                       # Các component tái sử dụng trong hệ thống
│   ├── ui/                           # Component cơ sở (Button, Input, Badge...)
│   ├── chat/                         # Component chuyên biệt cho Chat (Room, MessageItem...)
│   ├── calendar/                     # Component chuyên biệt cho Calendar (EventModal...)
│   └── knowledge/                    # Component chuyên biệt cho Knowledge (MarkdownEditor...)
├── hooks/                            # Custom hooks của React
│   ├── useAuth.ts                    # Hook lấy trạng thái đăng nhập
│   ├── useChat.ts                    # Hook lắng nghe tin nhắn của kênh
│   └── useChannels.ts                # Hook lắng nghe danh sách kênh
├── lib/                              # Thư viện ngoài và API Helpers
│   ├── utils.ts                      # Hàm tiện ích chung (trộn class CSS...)
│   └── firebase/                     # Tầng kết nối Firebase (Firebase Services)
│       ├── client.ts                 # Khởi tạo Firebase SDK phía Client
│       ├── server.ts                 # Khởi tạo Firebase Admin SDK phía Server
│       ├── auth.ts                   # Xử lý đăng nhập, đăng xuất, phân quyền
│       ├── chat.ts                   # Các hàm API cho Chat, DM, Read receipts, Reactions
│       ├── events.ts                 # Các hàm API cho Lịch biểu (CRUD, subscribe)
│       ├── knowledge.ts              # Các hàm API cho Wiki (Markdown, Views, Likes, Comments)
│       ├── announcements.ts          # Các hàm API cho Bảng tin (Pin, Reactions, Comments)
│       └── cloudinary.ts             # API Upload hình ảnh lên Cloudinary
└── proxy.ts                          # Proxy hỗ trợ kết nối hệ thống
```

---

## 4. Thiết kế Cơ sở Dữ liệu / データベース設計 (Firestore Schema)

Cơ sở dữ liệu được tổ chức dưới dạng NoSQL trên **Google Cloud Firestore**. Dưới đây là đặc tả chi tiết kiểu dữ liệu của các Collection gốc và Sub-collection.

### 4.1 Collection `users`
Lưu trữ hồ sơ cá nhân của toàn bộ nhân viên.
*   **Document ID**: Trùng khớp với Firebase Auth `uid` (để tối ưu hóa liên kết).
*   **Fields**:
    ```typescript
    interface UserProfile {
      uid: string;                    // UID từ Firebase Auth
      email: string;                  // Địa chỉ email nhân viên
      displayName: string;            // Tên hiển thị (mặc định lấy tiền tố email)
      photoURL: string;               // Link ảnh đại diện (avatar) lưu trên Cloudinary
      bio: string;                    // Trạng thái / Giới thiệu bản thân
      role: 'admin' | 'member';       // Vai trò phân quyền trong hệ thống
      createdAt: Timestamp;           // Ngày tham gia hệ thống
      lastLoginAt: Timestamp;         // Lần cuối cùng đăng nhập
    }
    ```

#### Sub-collection `readState` (Nằm trong từng `users/{uid}`)
Theo dõi trạng thái đã đọc của từng nhân viên đối với các kênh chat.
*   **Document ID**: `channelId` (ID của kênh chat).
*   **Fields**:
    ```typescript
    interface ReadState {
      lastReadAt: Timestamp;          // Thời gian cuối mở xem kênh chat này
      lastReadMessageId: string;      // ID của tin nhắn cuối cùng đã đọc tại kênh này
    }
    ```

---

### 4.2 Collection `channels`
Quản lý các phòng chat (kênh công khai, nhóm dự án, tin nhắn 1-1).
*   **Document ID**: Tự động sinh ra bởi Firestore (hoặc chuỗi định dạng cho DM).
*   **Fields**:
    ```typescript
    interface Channel {
      id: string;                     // ID kênh chat
      name: string;                   // Tên phòng chat (Ví dụ: "Hội kỹ thuật")
      description: string;            // Mô tả mục đích của phòng
      type: 'public' | 'private' | 'dm'; // Loại phòng: công khai, nhóm kín, tin nhắn 1-1
      createdBy: string;              // UID người tạo kênh
      isArchived: boolean;            // Trạng thái lưu trữ (ẩn kênh)
      members: string[];              // Mảng các UID thành viên trong phòng chat
      unreadCount: Record<string, number>; // Map UID -> Số tin nhắn chưa đọc trong kênh này
      createdAt: Timestamp;           // Ngày tạo kênh
    }
    ```

#### Sub-collection `messages` (Nằm trong từng `channels/{channelId}`)
Chứa toàn bộ nội dung tin nhắn thời gian thực của kênh chat.
*   **Document ID**: Tự động sinh ra (Auto-generated).
*   **Fields**:
    ```typescript
    interface ChatMessage {
      id: string;                     // ID tin nhắn
      text: string;                   // Nội dung văn bản của tin nhắn
      senderId: string;               // UID người gửi
      senderEmail: string;            // Email người gửi (để hiển thị nhanh)
      senderName: string;             // Tên người gửi tại thời điểm nhắn
      senderPhotoURL?: string;        // Ảnh đại diện người gửi tại thời điểm nhắn
      type: 'text';                   // Loại tin nhắn (hiện tại hỗ trợ text)
      createdAt: Timestamp;           // Thời điểm gửi tin nhắn
      updatedAt: Timestamp | null;    // Thời điểm sửa tin nhắn (nếu có)
      readBy: string[];               // Mảng các UID đã đọc tin nhắn này
      readAt: Record<string, Timestamp>; // Map UID -> Thời điểm đọc tin nhắn này
      replyTo?: {                     // Dữ liệu phản hồi tin nhắn khác (nếu có)
        messageId: string;
        senderId: string;
        senderName: string;
        senderPhotoURL?: string;
        text: string;
      } | null;
      reactions?: Record<string, string[]>; // Map Emoji -> Mảng UID thả cảm xúc (Ví dụ: {"❤️": ["uid1", "uid2"]})
    }
    ```

---

### 4.3 Collection `articles`
Kho lưu trữ tài liệu nghiệp vụ, quy trình (Knowledge Base - Wiki).
*   **Document ID**: Tự động sinh ra.
*   **Fields**:
    ```typescript
    interface Article {
      id: string;                     // ID bài viết
      title: string;                  // Tiêu đề tài liệu
      content: string;                // Nội dung chi tiết định dạng Markdown
      summary: string;                // Tóm tắt ngắn hiển thị ngoài danh sách
      category: 'hr' | 'engineering' | 'design' | 'onboarding' | 'sales'; // Danh mục bài viết
      tags: string[];                 // Các tag tìm kiếm phụ (ví dụ: ['nextjs', 'sop'])
      scope: 'all' | 'group' | 'admin'; // Phạm vi phân quyền truy cập tài liệu
      allowedGroups?: string[];       // Danh sách ID nhóm được xem nếu scope === 'group'
      views: number;                  // Tổng số lượt xem tài liệu
      likes: string[];                // Mảng các UID của người thích tài liệu
      createdBy: string;              // UID tác giả tạo bài viết
      authorName: string;             // Tên tác giả bài viết
      authorPhoto?: string;           // Ảnh đại diện tác giả
      createdAt: Timestamp;           // Thời gian xuất bản
      updatedAt: Timestamp;           // Thời gian cập nhật gần nhất
    }
    ```

#### Sub-collection `comments` (Nằm trong từng `articles/{articleId}`)
Bình luận thảo luận chuyên môn dưới chân bài viết.
*   **Document ID**: Tự động sinh ra.
*   **Fields**:
    ```typescript
    interface ArticleComment {
      id: string;                     // ID bình luận
      userId: string;                 // UID người bình luận
      userName: string;               // Tên người bình luận
      userPhoto?: string;             // Ảnh người bình luận
      text: string;                   // Nội dung bình luận
      createdAt: Timestamp;           // Thời gian viết bình luận
    }
    ```

---

### 4.4 Collection `events`
Lưu trữ toàn bộ sự kiện lịch biểu cá nhân, nhóm và công ty.
*   **Document ID**: Tự động sinh ra.
*   **Fields**:
    ```typescript
    interface CalendarEvent {
      id: string;                     // ID sự kiện
      title: string;                  // Tiêu đề sự kiện
      description?: string;           // Chi tiết sự kiện lịch
      start: Timestamp;               // Thời gian bắt đầu sự kiện
      end: Timestamp;                 // Thời gian kết thúc sự kiện
      type: 'meeting' | 'out' | 'deadline' | 'event'; // Phân loại màu sắc hiển thị
      scope: 'company' | 'group' | 'personal'; // Phạm vi lịch biểu
      groupId?: string;               // ID của nhóm được liên kết (nếu scope === 'group')
      groupName?: string;             // Tên của nhóm liên kết
      createdBy: string;              // UID của người tạo sự kiện lịch
      creatorName: string;            // Tên người tạo sự kiện lịch
      createdAt: Timestamp;           // Thời gian tạo
    }
    ```

---

### 4.5 Collection `announcements`
Quản lý các thông báo chung và các bài đăng tin tức của doanh nghiệp.
*   **Document ID**: Tự động sinh ra.
*   **Fields**:
    ```typescript
    interface Announcement {
      id: string;                     // ID thông báo
      title: string;                  // Tiêu đề thông báo
      content: string;                // Nội dung bài viết thông báo
      type: 'info' | 'warning' | 'success' | 'event'; // Loại cảnh báo/thiết kế hiển thị
      imageURL?: string | null;       // Link ảnh minh họa đính kèm
      authorId: string;               // UID người đăng
      authorName: string;             // Tên người đăng
      isPinned: boolean;              // Trạng thái ghim trên cùng bảng tin
      likes: string[];                // Mảng các UID đã thích bài thông báo
      calendarEventId?: string | null; // ID sự kiện liên kết tự động trên Lịch (nếu có)
      createdAt: Timestamp;           // Thời gian đăng
      updatedAt: Timestamp;           // Thời gian cập nhật gần nhất
    }
    ```

#### Sub-collection `comments` (Nằm trong từng `announcements/{announcementId}`)
Cho phép thảo luận và hỏi đáp thời gian thực dưới các bản tin nội bộ.
*   **Document ID**: Tự động sinh ra.
*   **Fields**:
    ```typescript
    interface AnnouncementComment {
      id: string;                     // ID bình luận thông báo
      text: string;                   // Nội dung bình luận
      authorId: string;               // UID người viết
      authorName: string;             // Tên người viết
      authorPhotoURL?: string | null; // Ảnh đại diện người viết
      createdAt: Timestamp;           // Thời gian viết bình luận
    }
    ```

---

### 4.6 Collection `groups`
Quản lý danh sách các phòng ban hoặc nhóm dự án nội bộ.
*   **Document ID**: Tự động sinh ra.
*   **Fields**:
    ```typescript
    interface Group {
      id: string;                     // ID nhóm
      name: string;                   // Tên nhóm (ví dụ: "Nhóm Phát Triển")
      description: string;            // Mô tả chức năng của nhóm
      members: string[];              // Mảng các UID thành viên của nhóm
      createdBy: string;              // UID người tạo ra nhóm
      createdAt: Timestamp;           // Thời gian thành lập nhóm
    }
    ```

---

## 5. Thiết kế Bảo mật & Phân quyền / 権限 & セキュリティ

Porocia quản lý bảo mật 2 lớp:
1.  **Lớp Client (Middleware & Routing)**: Chặn người dùng chưa đăng nhập, chuyển hướng thích hợp, và ẩn các UI quản trị với tài khoản thông thường.
2.  **Lớp Serverless Database (Firestore Security Rules)**: Lớp chốt chặn cuối cùng bảo vệ dữ liệu ở mức nguyên tử ngay trên Firebase Cloud.

### 5.1 Quy tắc Firestore Security Rules mẫu
Hệ thống triển khai kiểm soát quyền truy cập chặt chẽ dựa trên vai trò (`role`) và phạm vi dữ liệu (`scope`). Dưới đây là logic thiết kế quy tắc bảo mật:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Hàm phụ trợ: Kiểm tra người dùng đã đăng nhập chưa
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Hàm phụ trợ: Lấy thông tin role của người dùng hiện tại
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Hàm phụ trợ: Kiểm tra xem người dùng có phải Admin không
    function isAdmin() {
      return isSignedIn() && getUserRole() == 'admin';
    }

    // 1. Bảo mật collection users
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      
      // Sub-collection readState: Chỉ chủ sở hữu mới được đọc và ghi
      match /readState/{channelId} {
        allow read, write: if isSignedIn() && request.auth.uid == userId;
      }
    }

    // 2. Bảo mật collection channels & messages
    match /channels/{channelId} {
      allow read: if isSignedIn() && (
        resource.data.type == 'public' || 
        request.auth.uid in resource.data.members || 
        isAdmin()
      );
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && (
        request.auth.uid == resource.data.createdBy || 
        isAdmin()
      );
      
      match /messages/{messageId} {
        // Chỉ thành viên của kênh chat mới được đọc/ghi tin nhắn
        allow read, write: if isSignedIn() && (
          request.auth.uid in get(/databases/$(database)/documents/channels/$(channelId)).data.members || 
          isAdmin()
        );
      }
    }

    // 3. Bảo mật collection articles (Knowledge Base)
    match /articles/{articleId} {
      allow read: if isSignedIn() && (
        resource.data.scope == 'all' ||
        isAdmin() ||
        (resource.data.scope == 'group' && hasGroupAccess(resource.data.allowedGroups))
      );
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && (
        request.auth.uid == resource.data.createdBy || 
        isAdmin()
      );
    }
    
    // Hàm kiểm tra quyền xem bài viết nhóm kín
    function hasGroupAccess(allowedGroups) {
      // Thực hiện kiểm tra xem UID của người dùng có nằm trong bất kỳ group nào được phép không
      return isSignedIn(); // Triển khai logic kiểm tra chéo thực tế qua groups collection
    }
  }
}
```

---

## 6. Thiết kế Quy trình & Các Phân hệ chính / 機能設計

### 6.1 Phân hệ Chat Real-time & Read Receipt
*   **Quy trình Gửi Tin Nhắn (Batch Write)**:
    Khi người dùng gửi tin nhắn, một phiên làm việc atomic (Batch) được thực hiện để tránh xung đột dữ liệu:
    1.  Tạo tài liệu mới trong sub-collection `messages` với mảng `readBy` chứa sẵn UID người gửi.
    2.  Cập nhật mảng `members` của `channels` thông qua `arrayUnion` (đảm bảo người gửi là thành viên).
    3.  Tăng biến `unreadCount[memberUid]` lên `1` đối với tất cả thành viên khác trong nhóm chat (sử dụng Firestore `increment(1)` để tránh tranh chấp ghi).
*   **Quy trình Đánh dấu đã đọc (Mark as Read)**:
    Khi người dùng click mở một cuộc trò chuyện:
    1.  Truy vấn tin nhắn mới nhất trong `messages`.
    2.  Thêm UID người dùng vào mảng `readBy` và lưu thời gian đọc vào map `readAt[uid]` của tin nhắn mới nhất đó.
    3.  Ghi đè hoặc cập nhật tài liệu trạng thái đọc của người dùng tại `users/{uid}/readState/{channelId}`.
    4.  Đặt ngược biến `unreadCount[uid]` của kênh chat đó về bằng `0`.
*   **Nhắn tin trực tiếp (DM - Direct Message)**:
    Kênh DM được tự động quản lý thông qua ID định danh duy nhất ghép từ UID của hai thành viên theo thứ tự bảng chữ cái: `dm_uidA_uidB`. Hàm `ensureDirectChannel` sẽ tự động kiểm tra và khởi tạo kênh nếu chưa từng tồn tại giữa hai người.

### 6.2 Phân hệ Lịch biểu (Calendar)
*   **Quản lý Lịch 2 Cột**:
    *   *Sidebar*: Chứa Mini Calendar phục vụ định vị nhanh ngày tháng và hiển thị các bộ lọc thông minh theo danh mục và phạm vi.
    *   *Lưới chính (Main Grid)*: Kết xuất sự kiện theo Tháng/Tuần/Ngày trực quan.
*   **Phân quyền hiển thị sự kiện**:
    Sự kiện hiển thị trên lịch của một người dùng phụ thuộc vào trường `scope`:
    *   `company`: Hiển thị cho toàn bộ nhân viên.
    *   `group`: Chỉ hiển thị cho nhân viên nếu `groupId` của sự kiện thuộc một trong các Nhóm mà người dùng đó tham gia.
    *   `personal`: Bị lọc trực tiếp ở tầng dữ liệu Firestore. Chỉ có UID người tạo trùng khớp với tài khoản hiện tại mới được hiển thị sự kiện này.

### 6.3 Phân hệ Kho Tri thức (Knowledge Base)
*   **Soạn thảo & Đọc Markdown**:
    *   Tích hợp bộ soạn thảo chia đôi màn hình (Split-screen) thời gian thực.
    *   Tự động phân tích cấu trúc bài viết (quét các thẻ `H2`, `H3`) để dựng Menu mục lục (Table of Contents) động trượt theo màn hình đọc của độc giả ở cột bên phải.
    *   Tự động đếm số từ và tính toán thời gian đọc trung bình (`Số từ / 200 = Số phút đọc`).
*   **Xử lý Hình ảnh với Cloudinary**:
    *   Người dùng có thể click nút "Thêm ảnh" (`ImageUploaderClient`) ngay phía trên trình soạn thảo.
    *   Quá trình upload được thực hiện **trực tiếp từ Client (Direct client-side upload)** lên Cloudinary API (`https://api.cloudinary.com/v1_1/.../image/upload`) thông qua một **Unsigned Upload Preset** (`porocia`), không đi qua server nhằm tối ưu tốc độ và giảm tải cho hạ tầng serverless.
    *   Mã Markdown dạng `![image](cloudinary_url)` sẽ tự động được chèn chính xác tại vị trí con trỏ (selection pointer) trong thẻ `<textarea>` của trình soạn thảo.
    *   Khi xóa một bài viết, hệ thống sử dụng Regex quét toàn bộ nội dung để tìm link Cloudinary và gọi hàm xóa ảnh (signed delete) ở phía Server trong `src/lib/firebase/cloudinary.ts` để giải phóng dung lượng.

### 6.4 Phân hệ Bảng tin (Announcements)
*   **Đăng và Ghim tin (Pinning Logic)**:
    *   Quản trị viên (Admin) có quyền ghim bài thông báo quan trọng.
    *   Truy vấn lấy danh sách thông báo được sắp xếp ưu tiên theo `isPinned DESC` trước, sau đó mới đến `createdAt DESC` để đảm bảo bài viết ghim luôn ở trên cùng giao diện.
*   **Tương tác Lịch biểu tự động**:
    *   Khi tạo một thông báo có tính chất sự kiện (ví dụ: "Tiệc cuối năm"), hệ thống cho phép tạo song song một sự kiện lịch tương ứng.
    *   ID của sự kiện lịch này được lưu trữ trong trường `calendarEventId` của thông báo để đồng bộ hóa việc cập nhật hoặc xóa chéo giữa hai phân hệ.

---

## 7. Kế hoạch Kiểm thử & Xác thực / テest & 検証計画

Để đảm bảo các thiết kế trên hoạt động chính xác trong thực tế, các quy trình kiểm thử sau đây được áp dụng:

### 7.1 Kiểm thử Tự động (Automated Tests)
1.  **Unit Tests (Quy trình Firestore & API)**:
    *   Sử dụng thư viện mô phỏng Firestore Emulator để chạy các kịch bản đọc/ghi bảo mật.
    *   Xác minh các hàm: Gửi tin nhắn đồng thời cập nhật `unreadCount`, chuyển trạng thái đã đọc tin nhắn, đăng và xóa bài viết kèm dọn dẹp ảnh trên Cloudinary.
2.  **Integration Tests (Next.js & Routing)**:
    *   Chạy kiểm thử bằng Playwright hoặc Cypress kiểm tra hành vi định tuyến của Middleware khi người dùng chưa đăng nhập cố tình truy cập vào `/admin` hoặc `/calendar`.

### 7.2 Kiểm thử Thủ công (Manual Verification)
1.  **Xác thực Real-time trên nhiều Thiết bị**:
    *   Mở hai trình duyệt khác nhau đăng nhập vào hai tài khoản (một Admin, một Member) để kiểm thử chat 1-1, kiểm tra xem tin nhắn hiển thị tức thời hay không và số lượng tin nhắn chưa đọc (`unreadCount`) của đối phương có tăng/giảm chính xác không.
2.  **Kiểm tra tính Responsive**:
    *   Sử dụng công cụ Chrome DevTools giả lập kích thước Tablet (768px - 991px) và Desktop lớn để xác nhận bố cục 2 cột của Lịch biểu và Thư viện tài liệu chuyển đổi mượt mà, không bị tràn hay lỗi hiển thị chữ.

---
*Tài liệu được thiết kế chi tiết và phê duyệt vào ngày 2026-06-01*
