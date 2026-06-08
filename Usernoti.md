# Tổng quan tính năng thông báo

## Những gì đã được thêm
- Biểu tượng **chuông thông báo** trong thanh header của site, sử dụng component `Bell` từ `lucide-react`.
- Huy hiệu đếm số thông báo chưa đọc hiển thị trên chuông (được giới hạn tối đa là `9+`).
- Khi nhấp chuông, một **dropdown thông báo** sẽ mở ra, liệt kê các thông báo mới từ Firestore (tiêu đề, nội dung tùy chọn và liên kết).
- Được tích hợp với **nút avatar** hiện có; nhấp avatar mở menu hồ sơ, trong khi nhấp chuông sẽ đóng dropdown hồ sơ và ngược lại.
- Thêm quản lý trạng thái:
  - `notifOpen` theo dõi việc hiển thị của panel thông báo.
  - `setNotifOpen(false)` được gọi khi người dùng click ra ngoài dropdown (thông qua `dropdownRef` hiện có).
- Cập nhật kiểu dáng để phù hợp với thẩm mỹ ấm áp, cao cấp của dự án (cạnh bo tròn, màu terracotta, hiệu ứng hover nhẹ).

## Luồng tương tác
1. **Người dùng nhìn thấy chuông** với huy hiệu màu đỏ‑cam nếu có thông báo chưa đọc.
2. **Nhấp chuông** → panel thông báo trượt xuống, hiển thị danh sách các thông báo.
3. **Nhấp vào một thông báo** → chuyển tới trang liên kết và đóng panel.
4. **Nhấp avatar** → mở menu hồ sơ, và panel thông báo sẽ tự động đóng.
5. Nhấp ra ngoài bất kỳ dropdown nào đang mở sẽ đóng cả hai panel.

## Lưu ý kỹ thuật
- Sử dụng hook tùy chỉnh `useNotifications` để đăng ký lắng nghe `users/{uid}/notifications` trên Firestore.
- Nút chuông và avatar chia sẻ cùng `dropdownRef` để phát hiện click ra ngoài.
- Danh sách thông báo hiển thị thông báo dự phòng khi không có thông báo nào.
- Logic đếm số chưa đọc giới hạn hiển thị ở `9+` để dễ đọc.

Tính năng này mang lại trải nghiệm thông báo kiểu Facebook trên thanh header của ứng dụng, giúp người dùng nắm bắt nhanh các tin nhắn mới, bài đăng hoặc tag.