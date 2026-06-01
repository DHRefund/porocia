# Yêu cầu Kinh doanh (Business Requirements)
**Dự án**: Porocia — Nền tảng Giao tiếp Nội bộ Doanh nghiệp
**Phiên bản tài liệu**: 1.0
**Ngày cập nhật**: 2026-05-29
**Trạng thái**: Draft

---

## 1. Tổng quan Dự án

| Mục | Nội dung |
|-----|----------|
| **Tên dự án** | Porocia |
| **Loại hình** | Nền tảng giao tiếp & quản lý nội bộ doanh nghiệp (B2B SaaS / Internal Tool) |
| **Đối tượng mục tiêu** | Doanh nghiệp Nhật Bản vừa và nhỏ (SMEs), đặc biệt các công ty có môi trường làm việc đa văn hóa |
| **Phiên bản hiện tại** | 0.1.0 (Beta) |
| **Môi trường triển khai** | Cloud (Firebase / Vercel) |

### 1.1 Mô tả Dự án

Porocia là một **cổng thông tin nội bộ doanh nghiệp tích hợp (Integrated Internal Portal)** được thiết kế cho các công ty. Hệ thống hợp nhất nhiều công cụ rời rạc — nhắn tin, thông báo, lịch, thư mục nhân sự, và kho tri thức — vào một nền tảng duy nhất, có giao diện cao cấp lấy cảm hứng từ triết lý thiết kế của Anthropic (ấm áp, tối giản, đặt con người làm trung tâm).

### 1.2 Vấn đề Kinh doanh cần Giải quyết

Các công ty hiện đang phải sử dụng quá nhiều công cụ tách biệt: chat, lịch, thông báo, quản lý công việc, quản lý tài liệu, và quản lý nhân sự... Điều này gây ra:

- **Phân tán thông tin**: Nhân viên phải chuyển đổi giữa nhiều ứng dụng, gây mất năng suất.
- **Thiếu nhất quán quyền hạn**: Mỗi công cụ có hệ thống phân quyền riêng, khó kiểm soát tập trung.
- **Chi phí bản quyền cao**: Doanh nghiệp phải trả tiền cho nhiều dịch vụ SaaS cùng lúc.

---

## 2. Mục tiêu Kinh doanh

| # | Mục tiêu | Mô tả chi tiết | KPI / Chỉ số Thành công |
|---|----------|----------------|------------------------|
| 1 | **Tập trung hóa giao tiếp nội bộ** | Thay thế email nội bộ và các công cụ chat rời rạc bằng một nền tảng duy nhất | Giảm 70% số lượng công cụ giao tiếp đang dùng |
| 2 | **Cải thiện tốc độ phổ biến thông tin** | Thông báo công ty đến toàn bộ nhân viên tức thời, không bị thất lạc | 100% nhân viên nhận thông báo quan trọng trong vòng 5 phút |
| 3 | **Xây dựng kho tri thức nội bộ** | Lưu trữ và tìm kiếm tài liệu, quy trình, hướng dẫn một cách có hệ thống | Giảm 50% thời gian nhân viên mới cần để onboarding |
| 4 | **Tăng cường phối hợp lịch trình** | Quản lý lịch cá nhân, nhóm, và toàn công ty tại một nơi | Giảm xung đột lịch họp xuống dưới 5% |
| 5 | **Nâng cao trải nghiệm nhân viên** | Cung cấp giao diện cao cấp, thân thiện, phù hợp văn hóa làm việc công ty | Tăng số lượng nhân viên sử dụng hệ thống |

---

## 3. Phạm vi Dự án

### 3.1 Phạm vi Bao gồm (In Scope)

| Module | Tính năng chính | Trạng thái |
|--------|----------------|------------|
| **Xác thực (Authentication)** | Đăng nhập/đăng xuất bằng Email+Password, quản lý phiên bảo mật (Session Cookie) | ✅ Hoàn thành |
| **Trang chủ (Homepage)** | Dashboard với thông báo nổi bật, quotes công ty, liên kết nhanh | ✅ Hoàn thành |
| **Nhắn tin (Chat)** | Chat kênh công khai/riêng tư, DM 1-1, phản ứng (reaction), trả lời (reply), trạng thái đọc | ✅ Hoàn thành |
| **Thông báo (Announcements)** | Đăng thông báo có ảnh, chia loại (info/warning/success/event), ghim thông báo, bình luận, reaction | ✅ Hoàn thành |
| **Lịch (Calendar)** | Quản lý sự kiện cá nhân/nhóm/toàn công ty, nhiều chế độ xem (tháng/tuần/ngày/lịch trình) | ✅ Hoàn thành |
| **Thư mục Nhân sự (People Directory)** | Danh sách thành viên, tìm kiếm, xem hồ sơ, bắt đầu DM trực tiếp | ✅ Hoàn thành |
| **Kho Tri thức (Knowledge Base)** | Viết/đọc tài liệu nội bộ bằng Markdown, phân loại, phân quyền, tìm kiếm | ✅ Hoàn thành |
| **Hồ sơ Cá nhân (Profile)** | Xem/sửa thông tin, upload ảnh đại diện | ✅ Hoàn thành |
| **Bảng quản trị (Admin Dashboard)** | Quản lý thành viên, nhóm, thông báo; xem thống kê hệ thống | ✅ Hoàn thành (một phần) |

### 3.2 Phạm vi Ngoại trừ (Out of Scope — Giai đoạn sau)

- Tích hợp bên thứ ba (Google Calendar, Slack, Microsoft Teams)
- Ứng dụng di động Native (iOS/Android)
- Hệ thống thông báo đẩy (Push Notifications / Email reminders)
- Kéo & Thả lịch (Drag & Drop calendar)
- Thanh toán & Quản lý đăng ký SaaS
- Báo cáo & Phân tích nâng cao (Advanced Analytics)
- Chế độ Offline (Offline Mode)

---

## 4. Các Bên Liên quan (Stakeholders)

| Vai trò | Mô tả | Trách nhiệm chính |
|---------|-------|-------------------|
| **Chủ dự án (Product Owner)** | Người ra quyết định chiến lược sản phẩm | Định hướng roadmap, phê duyệt yêu cầu |
| **Quản trị viên hệ thống (Admin)** | Nhân viên HR hoặc IT được cấp quyền admin | Quản lý thành viên, nhóm, thông báo, dashboard |
| **Nhân viên công ty (Member)** | Toàn bộ nhân viên được cấp tài khoản | Dùng chat, lịch, thông báo, knowledge base |
| **Kỹ sư phát triển** | Đội dev xây dựng và bảo trì hệ thống | Thiết kế, triển khai, bảo trì kỹ thuật |
| **Nhân viên mới (New Joinee)** | Người dùng đặc biệt trong giai đoạn onboarding | Xem tài liệu onboarding, làm quen hệ thống |

---

## 5. Yêu cầu Chức năng Chi tiết (Functional Requirements)

### 5.1 Xác thực & Bảo mật Phiên

| ID | Yêu cầu | Độ ưu tiên |
|----|---------|------------|
| FR-AUTH-01 | Nhân viên đăng nhập bằng email và mật khẩu được cấp bởi admin | Cao |
| FR-AUTH-02 | Hệ thống tạo HTTP-only Session Cookie để duy trì phiên đăng nhập an toàn | Cao |
| FR-AUTH-03 | Hồ sơ người dùng tự động đồng bộ vào Firestore `users` collection khi đăng nhập | Cao |
| FR-AUTH-04 | Đăng xuất xóa Session Cookie và chuyển hướng về trang đăng nhập | Cao |
| FR-AUTH-05 | Các route được bảo vệ, từ chối truy cập nếu không có phiên hợp lệ | Cao |

### 5.2 Nhắn tin Thời gian Thực (Chat)

| ID | Yêu cầu | Độ ưu tiên |
|----|---------|------------|
| FR-CHAT-01 | Nhân viên gửi và nhận tin nhắn văn bản theo thời gian thực | Cao |
| FR-CHAT-02 | Hỗ trợ 3 loại kênh: Công khai (`public`), Riêng tư (`private`), Nhắn tin trực tiếp (`dm`) | Cao |
| FR-CHAT-03 | Nhân viên trả lời tin nhắn (Reply/Thread) | Trung bình |
| FR-CHAT-04 | Nhân viên thêm biểu cảm (Emoji Reaction) vào tin nhắn | Thấp |
| FR-CHAT-05 | Hệ thống theo dõi trạng thái đã đọc (Read Receipt) và hiển thị số tin chưa đọc | Cao |
| FR-CHAT-06 | Tải thêm tin nhắn cũ theo phân trang vô hạn (Infinite Scroll) | Trung bình |
| FR-CHAT-07 | Admin tạo, chỉnh sửa, xóa kênh; thêm/xóa thành viên khỏi kênh riêng tư | Cao |
| FR-CHAT-08 | Hệ thống tự động tạo kênh DM khi một nhân viên nhắn tin cho người khác từ thư mục | Cao |

### 5.3 Thông báo Công ty (Announcements)

| ID | Yêu cầu | Độ ưu tiên |
|----|---------|------------|
| FR-ANN-01 | Admin đăng thông báo với tiêu đề, nội dung, loại (info/warning/success/event), và ảnh đính kèm | Cao |
| FR-ANN-02 | Admin ghim thông báo quan trọng để hiển thị ưu tiên ở đầu danh sách | Cao |
| FR-ANN-03 | Nhân viên xem danh sách thông báo theo thứ tự ưu tiên (ghim trước, mới nhất sau) | Cao |
| FR-ANN-04 | Nhân viên bày tỏ cảm xúc (Like/Reaction) và bình luận dưới thông báo | Trung bình |
| FR-ANN-05 | Các thông báo nổi bật hiển thị trên trang chủ dưới dạng Bento Layout | Trung bình |
| FR-ANN-06 | Truy cập thẳng đến thông báo cụ thể bằng anchor URL (`#announcement-{id}`) | Thấp |
| FR-ANN-07 | Thông báo có sự kiện được tự động đồng bộ lên Lịch công ty | Trung bình |

### 5.4 Quản lý Lịch (Calendar)

| ID | Yêu cầu | Độ ưu tiên |
|----|---------|------------|
| FR-CAL-01 | Nhân viên tạo sự kiện với tiêu đề, thời gian bắt đầu/kết thúc, mô tả, và loại | Cao |
| FR-CAL-02 | Sự kiện có 3 phạm vi: Toàn công ty (`company`), Nhóm (`group`), Cá nhân (`personal`) | Cao |
| FR-CAL-03 | Sự kiện cá nhân chỉ hiển thị với người tạo; sự kiện nhóm chỉ hiển thị với thành viên nhóm | Cao |
| FR-CAL-04 | Chỉ người tạo hoặc Admin mới có thể sửa/xóa sự kiện | Cao |
| FR-CAL-05 | Hỗ trợ 4 chế độ xem: Tháng, Tuần, Ngày, Lịch trình (Agenda) | Trung bình |
| FR-CAL-06 | Tìm kiếm và lọc sự kiện theo loại và phạm vi | Trung bình |
| FR-CAL-07 | Mini-calendar ở sidebar đồng bộ ngày đang xem với lịch chính | Thấp |

### 5.5 Thư mục Nhân sự (People Directory)

| ID | Yêu cầu | Độ ưu tiên |
|----|---------|------------|
| FR-PPL-01 | Nhân viên xem danh sách toàn bộ thành viên của công ty | Cao |
| FR-PPL-02 | Tìm kiếm thành viên theo tên hoặc email | Trung bình |
| FR-PPL-03 | Lọc thành viên theo nhóm | Trung bình |
| FR-PPL-04 | Xem thông tin chi tiết hồ sơ: tên, email, bio, nhóm, vai trò | Cao |
| FR-PPL-05 | Bắt đầu cuộc trò chuyện DM với thành viên bằng một cú click từ trang thư mục | Cao |

### 5.6 Kho Tri thức (Knowledge Base)

| ID | Yêu cầu | Độ ưu tiên |
|----|---------|------------|
| FR-KB-01 | Nhân viên được phép viết và chỉnh sửa bài viết nội bộ bằng Markdown | Cao |
| FR-KB-02 | Bài viết được phân loại: HR, Kỹ thuật, Thiết kế, Onboarding, Sales & Marketing | Cao |
| FR-KB-03 | Phạm vi truy cập bài viết: Toàn công ty (`company`), Nhóm (`group`), Admin (`admin`) | Cao |
| FR-KB-04 | Tìm kiếm bài viết theo tiêu đề, tóm tắt, và thẻ tag | Trung bình |
| FR-KB-05 | Hiển thị thống kê lượt xem, lượt thích, và thời gian đọc ước tính | Thấp |
| FR-KB-06 | Nhân viên có thể thêm thẻ tag để phân loại chi tiết bài viết | Thấp |

### 5.7 Hồ sơ Cá nhân (Profile)

| ID | Yêu cầu | Độ ưu tiên |
|----|---------|------------|
| FR-PRF-01 | Nhân viên xem thông tin hồ sơ cá nhân (email, vai trò, tên, bio) | Cao |
| FR-PRF-02 | Nhân viên chỉnh sửa tên hiển thị và tiểu sử (bio) | Cao |
| FR-PRF-03 | Nhân viên tải lên ảnh đại diện (tối đa 2MB, lưu trên Cloudinary) | Trung bình |

### 5.8 Bảng Quản trị Admin (Admin Dashboard)

| ID | Yêu cầu | Độ ưu tiên |
|----|---------|------------|
| FR-ADM-01 | Admin xem tổng quan: số thông báo mới, sự kiện sắp tới, tổng số người dùng | Cao |
| FR-ADM-02 | Admin tạo, chỉnh sửa, xóa, và ghim thông báo | Cao |
| FR-ADM-03 | Admin xem danh sách toàn bộ thành viên và thay đổi vai trò (admin/member) | Cao |
| FR-ADM-04 | Admin tạo, chỉnh sửa, xóa nhóm (Groups); thêm và xóa thành viên khỏi nhóm | Cao |
| FR-ADM-05 | Admin xóa tài khoản thành viên | Cao |

---

## 6. Yêu cầu Phi chức năng (Non-Functional Requirements)

| Danh mục | Yêu cầu | Chỉ số mục tiêu |
|----------|---------|----------------|
| **Hiệu năng (Performance)** | Thời gian phản hồi giao diện | < 200ms cho hành động người dùng thông thường |
| **Hiệu năng** | Thời gian tải trang đầu tiên (FCP) | < 2 giây trên kết nối 4G |
| **Tính khả dụng (Availability)** | Uptime hệ thống | ≥ 99.5% trong giờ làm việc |
| **Bảo mật (Security)** | Xác thực & phân quyền | Session Cookie HTTP-only; Firestore Security Rules |
| **Bảo mật** | Dữ liệu nhạy cảm | Không lưu mật khẩu; Firebase Auth quản lý credential |
| **Khả năng mở rộng (Scalability)** | Hỗ trợ người dùng đồng thời | ≥ 500 người dùng đồng thời (giai đoạn SME) |
| **Khả năng dùng (Usability)** | Responsive Design | Tương thích Desktop (≥992px) và Tablet (768–991px) |
| **Bảo trì (Maintainability)** | Cấu trúc code | TypeScript strict mode; App Router; Server Components ưu tiên |
| **Tuân thủ (Compliance)** | Quyền riêng tư dữ liệu | Tuân thủ luật bảo vệ dữ liệu cá nhân Nhật Bản (個人情報保護法) |

---

## 7. Hệ thống Phân quyền (Authorization Model)

### 7.1 Vai trò Người dùng

| Vai trò | Mã | Quyền hạn |
|---------|----|-----------|
| **Thành viên** | `member` | Dùng chat, lịch cá nhân, đọc thông báo, xem knowledge base được phép, chỉnh sửa hồ sơ cá nhân |
| **Quản trị viên** | `admin` | Toàn bộ quyền của Member + quản lý thành viên, nhóm, thông báo, sự kiện toàn công ty, tài liệu Admin-only |

### 7.2 Phân quyền theo Phạm vi Nội dung

| Phạm vi | Mã | Ai được xem |
|---------|----|-------------|
| Toàn công ty | `company` / `public` | Tất cả nhân viên đã đăng nhập |
| Theo nhóm | `group` / `private` | Thành viên của nhóm đó + Admin |
| Cá nhân | `personal` | Chỉ người tạo |
| Chỉ Admin | `admin` | Chỉ người có role `admin` |

---

## 8. Kiến trúc Công nghệ Tổng quan (High-Level Tech Architecture)

| Tầng | Công nghệ | Ghi chú |
|------|-----------|---------|
| **Frontend** | Next.js 16.2.4 (App Router), React 19 | Server Components mặc định; Client Components khi cần |
| **UI Components** | shadcn/ui, @base-ui/react, lucide-react | Tailwind CSS v4 + CSS Variables |
| **Backend / API** | Next.js Server Actions, Firebase Admin SDK v13 | Server-side session management |
| **Database** | Firebase Firestore | Real-time với `onSnapshot`; batched writes |
| **Authentication** | Firebase Authentication + HTTP-only Session Cookie | Server Action để tạo Cookie |
| **Storage** | Cloudinary | Ảnh đại diện, ảnh thông báo |
| **Forms & Validation** | react-hook-form + Zod | Type-safe form validation |
| **Deployment** | Vercel | Edge-compatible Next.js deployment |

---

## 9. Cấu trúc Dữ liệu Chính (Key Data Collections)

| Collection Firestore | Mô tả |
|---------------------|-------|
| `users` | Hồ sơ người dùng (uid, email, displayName, photoURL, bio, role) |
| `channels` | Kênh chat (name, type, members, unreadCount) |
| `channels/{id}/messages` | Tin nhắn trong kênh (text, senderId, readBy, reactions) |
| `announcements` | Thông báo công ty (title, content, type, isPinned, imageUrl) |
| `events` | Sự kiện lịch (title, startDate, endDate, scope, createdBy) |
| `articles` | Bài viết Knowledge Base (title, content, category, scope, tags) |
| `groups` | Nhóm người dùng (name, description, memberIds) |

---

## 10. Tiêu chí Chấp nhận (Acceptance Criteria)

| # | Tiêu chí | Phương pháp kiểm tra |
|---|----------|---------------------|
| AC-01 | Nhân viên đăng nhập thành công và truy cập toàn bộ module trong vòng 5 giây | Kiểm thử tay / E2E test |
| AC-02 | Tin nhắn chat xuất hiện ở phía nhận trong vòng 1 giây sau khi gửi | Kiểm thử thời gian thực với 2 tài khoản |
| AC-03 | Thông báo ghim hiển thị ở đầu danh sách, cả trên trang thông báo lẫn trang chủ | Kiểm thử tay |
| AC-04 | Nhân viên không thuộc nhóm A không thể thấy sự kiện/tài liệu phạm vi nhóm A | Kiểm thử phân quyền |
| AC-05 | Admin thay đổi vai trò thành viên và thay đổi có hiệu lực ngay ở lần làm mới tiếp theo | Kiểm thử tay |
| AC-06 | Bài viết Knowledge Base hiển thị đúng định dạng Markdown | Kiểm thử tay với nhiều loại nội dung |
| AC-07 | Giao diện hiển thị đúng và sử dụng được trên màn hình ≥ 768px | Kiểm thử responsive trên Desktop & Tablet |
| AC-08 | Toàn bộ dữ liệu nhạy cảm (session, admin credentials) không bị lộ ra phía client | Code review + Security audit |

---


## 11. Lộ trình Phát triển (Development Roadmap)

### Giai đoạn 1 — MVP ✅ (Đã hoàn thành)
- Xác thực (Authentication)
- Chat cơ bản (Channels + DM)
- Thông báo (Announcements)
- Lịch (Calendar)
- Thư mục nhân sự (People Directory)
- Knowledge Base cơ bản
- Hồ sơ cá nhân (Profile)
- Dashboard admin cơ bản

### Giai đoạn 2 — Củng cố (Đang phát triển)
- Hoàn thiện Firestore Security Rules
- Quản lý sự kiện trong Admin Dashboard
- Cài đặt hệ thống (System Settings)
- Tối ưu hiệu năng & UX

### Giai đoạn 3 — Mở rộng (Kế hoạch)
- Push Notifications & Email Reminders
- Kéo & Thả lịch (Drag & Drop Calendar)
- Tích hợp bên thứ ba
- Báo cáo & Phân tích nâng cao
- Ứng dụng di động

---



*最終更新: 2026年05月29日*
