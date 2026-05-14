# 📅 Porocia Premium Calendar Module

Tài liệu tóm tắt quá trình xây dựng, công nghệ sử dụng và lộ trình phát triển của hệ thống Lịch quản lý sự kiện cho dự án Porocia.

---

## 🛠 Công nghệ sử dụng (Tech Stack)

Hệ thống được xây dựng trên nền tảng hiện đại, đảm bảo hiệu suất và trải nghiệm người dùng cao nhất:

*   **Framework**: Next.js 16 (App Router).
*   **Calendar Engine**: `react-big-calendar` - Thư viện lịch mạnh mẽ, hỗ trợ nhiều chế độ xem.
*   **Real-time Database**: Firebase Firestore - Đồng bộ dữ liệu tức thời giữa các người dùng.
*   **Styling**: Vanilla CSS (Customized) & TailwindCSS - Kết hợp để tạo ra giao diện "Premium & Airy".
*   **Icons**: `lucide-react` - Bộ icon hiện đại, tối giản.
*   **Date Processing**: `date-fns` - Xử lý thời gian chính xác, hỗ trợ đa ngôn ngữ (Japanese/English).
*   **Notifications**: `sonner` - Hệ thống thông báo toast mượt mà.

---

## ✨ Các tính năng đã hoàn thiện (Features)

1.  **Giao diện 2 cột cao cấp**: 
    *   **Sidebar**: Chứa Mini-Calendar đồng bộ và bộ lọc thông minh.
    *   **Main Grid**: Lưới lịch chính với thiết kế thoáng đãng, hỗ trợ chế độ xem Tháng, Tuần, Ngày, Lịch trình.
2.  **Quản lý sự kiện Real-time (CRUD)**:
    *   **Thêm mới**: Hỗ trợ bôi đen vùng chọn trên lịch để tạo sự kiện nhanh.
    *   **Xem chi tiết**: Modal hiển thị đầy đủ thông tin: Tiêu đề, Thời gian, Người tạo, Danh mục.
    *   **Chỉnh sửa**: Cập nhật thông tin sự kiện đã tồn tại một cách linh hoạt.
    *   **Xóa**: Tích hợp hệ thống Confirm Dialog chuyên nghiệp.
3.  **Hệ thống Phân quyền**: 
    *   Chỉ người tạo (Creator) hoặc Admin mới có quyền Chỉnh sửa/Xóa sự kiện.
4.  **Bộ lọc & Tìm kiếm thông minh**:
    *   Lọc theo từ khóa (Search) thời gian thực.
    *   Lọc theo danh mục (Categories): 会議, 来客 / 外出, 締切, イベント.
5.  **UX/UI Tối ưu**:
    *   Tự động gom nhóm sự kiện (Popup) khi một ngày có quá nhiều sự kiện.
    *   Highlight ngày hiện tại (Today) đồng bộ giữa lịch chính và lịch mini.
    *   Phân biệt màu sắc ngày cuối tuần (Sat/Sun) và làm mờ các ngày ngoài tháng.

---

## 🚀 Tính năng dự kiến trong tương lai (Future Roadmap)

Để nâng tầm module Lịch này lên mức "Enterprise", các tính năng sau sẽ được ưu tiên phát triển:

1.  **Kéo & Thả (Drag and Drop)**: Cho phép người dùng thay đổi thời gian sự kiện bằng cách kéo thả trực tiếp trên lưới lịch.
2.  **Đồng bộ Thông báo (Announcements Sync)**: Tự động đưa các thông báo có thời hạn từ hệ thống lên lịch chung.
3.  **Nhắc nhở (Reminders)**: Tích hợp hệ thống thông báo đẩy (Push Notifications) hoặc Email khi sắp đến giờ sự kiện.
4.  **Lịch cá nhân vs Lịch chung**: Phân tách luồng sự kiện cá nhân của mỗi User và sự kiện chung của toàn công ty.
5.  **Tương tác nhóm**: Cho phép "Tag" hoặc mời người dùng khác tham gia vào một sự kiện cụ thể.
6.  **Chế độ Offline**: Hỗ trợ xem lịch ngay cả khi mất kết nối mạng (Sử dụng Firestore Offline Persistence).

---
*Cập nhật lần cuối: 14/05/2026*
