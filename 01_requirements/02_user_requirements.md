# Yêu cầu Người dùng (User Requirements)
**Dự án**: Porocia — Nền tảng Giao tiếp Nội bộ Doanh nghiệp
**Phiên bản tài liệu**: 1.0
**Ngày cập nhật**: 2026-05-29
**Trạng thái**: Draft

---

## 1. Tổng quan

Tài liệu này mô tả các yêu cầu từ góc nhìn người dùng cuối (User Stories) cho hệ thống Porocia. Mỗi yêu cầu được viết theo định dạng chuẩn:

> **Với tư cách là** [vai trò], **tôi muốn** [hành động], **để** [mục đích].

Mức độ ưu tiên: 🔴 Cao — 🟡 Trung bình — 🟢 Thấp

---

## 2. Personas (Chân dung Người dùng)

### 👤 Persona 1: Nguyễn Lan — Nhân viên thông thường (Member)
- **Tuổi**: 27
- **Vị trí**: Kỹ sư phần mềm
- **Mục tiêu**: Nắm bắt thông tin nội bộ nhanh chóng, phối hợp với đồng nghiệp hiệu quả, tra cứu tài liệu kỹ thuật dễ dàng.
- **Điểm đau**: Thường xuyên bỏ lỡ thông báo quan trọng vì chúng nằm rải rác ở email và Slack. Mất thời gian tìm tài liệu quy trình nội bộ.

### 👤 Persona 2: Tanaka Hiroshi — Quản trị viên / HR Manager (Admin)
- **Tuổi**: 38
- **Vị trí**: HR Manager
- **Mục tiêu**: Phát thông báo toàn công ty, quản lý danh sách nhân viên và nhóm, kiểm soát lịch sự kiện công ty.
- **Điểm đau**: Phải dùng nhiều công cụ khác nhau để thực hiện các tác vụ quản trị. Khó biết ai đã đọc thông báo quan trọng.

### 👤 Persona 3: Trần Minh Khoa — Nhân viên mới (New Joinee)
- **Tuổi**: 23
- **Vị trí**: Designer (mới vào công ty)
- **Mục tiêu**: Nhanh chóng làm quen với quy trình công ty, biết liên hệ ai khi cần hỗ trợ, tiếp cận tài liệu onboarding dễ dàng.
- **Điểm đau**: Không biết tìm thông tin ở đâu, phải hỏi đi hỏi lại đồng nghiệp những câu hỏi lặp lại.

---

## 3. User Stories

### 3.1 Xác thực (Authentication)

| ID | User Story | Độ ưu tiên | Tiêu chí chấp nhận |
|----|------------|------------|-------------------|
| US-AUTH-01 | Với tư cách là **nhân viên**, tôi muốn **đăng nhập bằng email và mật khẩu**, để **truy cập vào hệ thống nội bộ công ty**. | 🔴 Cao | - Form có trường email và mật khẩu<br>- Báo lỗi rõ ràng khi thông tin sai<br>- Sau đăng nhập, chuyển hướng về trang chủ |
| US-AUTH-02 | Với tư cách là **nhân viên**, tôi muốn **hệ thống nhớ phiên đăng nhập**, để **không phải đăng nhập lại mỗi lần mở trình duyệt**. | 🔴 Cao | - Session Cookie HTTP-only tồn tại qua các lần reload<br>- Tự động đăng xuất sau khi hết hạn session |
| US-AUTH-03 | Với tư cách là **nhân viên**, tôi muốn **đăng xuất khỏi hệ thống**, để **bảo vệ tài khoản khi dùng máy tính chung**. | 🔴 Cao | - Nút đăng xuất dễ tìm thấy<br>- Sau đăng xuất, xóa session và chuyển về trang login |

---

### 3.2 Trang chủ (Homepage)

| ID | User Story | Độ ưu tiên | Tiêu chí chấp nhận |
|----|------------|------------|-------------------|
| US-HOME-01 | Với tư cách là **nhân viên**, tôi muốn **thấy tổng quan những thông báo mới nhất khi vào trang chủ**, để **nắm bắt thông tin công ty mà không cần vào từng module**. | 🟡 Trung bình | - Hiển thị tối đa 3–5 thông báo gần nhất theo dạng Bento<br>- Thông báo ghim hiển thị ưu tiên |
| US-HOME-02 | Với tư cách là **nhân viên**, tôi muốn **thấy thông điệp hoặc câu trích dẫn của công ty**, để **cảm nhận văn hóa tổ chức mỗi khi mở ứng dụng**. | 🟢 Thấp | - Section hiển thị câu quote của công ty với thiết kế ấn tượng |

---

### 3.3 Nhắn tin (Chat)

| ID | User Story | Độ ưu tiên | Tiêu chí chấp nhận |
|----|------------|------------|-------------------|
| US-CHAT-01 | Với tư cách là **nhân viên**, tôi muốn **gửi tin nhắn văn bản vào kênh nhóm**, để **thảo luận công việc với đồng nghiệp theo thời gian thực**. | 🔴 Cao | - Tin nhắn xuất hiện ở phía nhận trong < 1 giây<br>- Hiển thị tên và avatar người gửi |
| US-CHAT-02 | Với tư cách là **nhân viên**, tôi muốn **biết kênh nào có tin nhắn chưa đọc**, để **không bỏ lỡ thảo luận quan trọng**. | 🔴 Cao | - Số badge đỏ hiển thị trên tên kênh trong sidebar<br>- Tự động reset về 0 khi mở kênh |
| US-CHAT-03 | Với tư cách là **nhân viên**, tôi muốn **trả lời trực tiếp vào một tin nhắn cụ thể (reply)**, để **giữ ngữ cảnh thảo luận rõ ràng**. | 🟡 Trung bình | - Nút Reply xuất hiện khi hover vào tin nhắn<br>- Tin nhắn trả lời hiển thị quote của tin gốc |
| US-CHAT-04 | Với tư cách là **nhân viên**, tôi muốn **thêm emoji reaction vào tin nhắn của đồng nghiệp**, để **bày tỏ phản hồi nhanh mà không cần gõ**. | 🟢 Thấp | - Picker emoji xuất hiện khi hover<br>- Số lượng reaction cập nhật tức thì |
| US-CHAT-05 | Với tư cách là **nhân viên**, tôi muốn **biết ai đã đọc tin nhắn của mình**, để **xác nhận thông tin đã được tiếp nhận**. | 🟡 Trung bình | - Hiển thị số/avatar người đã đọc dưới mỗi tin nhắn<br>- Modal xem danh sách đầy đủ người đã đọc |
| US-CHAT-06 | Với tư cách là **nhân viên**, tôi muốn **nhắn tin riêng (DM) với một đồng nghiệp cụ thể**, để **trao đổi thông tin mang tính cá nhân hoặc nhạy cảm**. | 🔴 Cao | - DM được tạo tự động lần đầu, tái sử dụng những lần sau<br>- Tên DM hiển thị tên đồng nghiệp, không phải ID |
| US-CHAT-07 | Với tư cách là **nhân viên**, tôi muốn **tải thêm tin nhắn cũ hơn khi cuộn lên đầu**, để **xem lại lịch sử thảo luận**. | 🟡 Trung bình | - Tự động tải thêm khi cuộn lên gần đầu danh sách |
| US-CHAT-08 | Với tư cách là **admin**, tôi muốn **tạo kênh chat mới và thêm thành viên**, để **tổ chức các nhóm làm việc có mục đích rõ ràng**. | 🔴 Cao | - Form tạo kênh với tên, mô tả, loại (public/private)<br>- Thêm thành viên vào kênh private |

---

### 3.4 Thông báo (Announcements)

| ID | User Story | Độ ưu tiên | Tiêu chí chấp nhận |
|----|------------|------------|-------------------|
| US-ANN-01 | Với tư cách là **admin**, tôi muốn **đăng thông báo mới với loại phân biệt màu sắc**, để **nhân viên dễ nhận ra mức độ quan trọng của thông báo**. | 🔴 Cao | - Chọn loại: info / warning / success / event<br>- Mỗi loại có màu badge riêng biệt |
| US-ANN-02 | Với tư cách là **admin**, tôi muốn **ghim thông báo quan trọng lên đầu danh sách**, để **đảm bảo nhân viên không bỏ qua thông tin cấp thiết**. | 🔴 Cao | - Toggle ghim/bỏ ghim<br>- Thông báo ghim luôn nằm trên cùng |
| US-ANN-03 | Với tư cách là **admin**, tôi muốn **đính kèm ảnh vào thông báo**, để **minh họa thông tin và tăng sức thu hút**. | 🟡 Trung bình | - Upload ảnh, ảnh hiển thị full-width ở đầu thông báo |
| US-ANN-04 | Với tư cách là **nhân viên**, tôi muốn **bình luận hoặc thả reaction vào thông báo**, để **phản hồi và tương tác với nội dung của công ty**. | 🟡 Trung bình | - Section comment cuối mỗi thông báo<br>- Số reaction cập nhật realtime |
| US-ANN-05 | Với tư cách là **nhân viên**, tôi muốn **được truy cập thẳng đến một thông báo cụ thể qua link**, để **chia sẻ thông tin nhanh với đồng nghiệp**. | 🟢 Thấp | - URL dạng `/announcements#announcement-{id}` cuộn thẳng đến thông báo |

---

### 3.5 Lịch (Calendar)

| ID | User Story | Độ ưu tiên | Tiêu chí chấp nhận |
|----|------------|------------|-------------------|
| US-CAL-01 | Với tư cách là **nhân viên**, tôi muốn **xem tất cả sự kiện của tuần/tháng hiện tại**, để **lên kế hoạch công việc hợp lý**. | 🔴 Cao | - Lịch hiển thị chế độ tháng mặc định<br>- Chuyển đổi giữa Tháng / Tuần / Ngày / Lịch trình |
| US-CAL-02 | Với tư cách là **nhân viên**, tôi muốn **tạo sự kiện cá nhân chỉ mình tôi thấy**, để **theo dõi lịch riêng mà không ảnh hưởng người khác**. | 🔴 Cao | - Scope `personal` — chỉ người tạo thấy |
| US-CAL-03 | Với tư cách là **admin**, tôi muốn **tạo sự kiện toàn công ty**, để **thông báo lịch họp, ngày nghỉ lễ, và sự kiện doanh nghiệp cho tất cả nhân viên**. | 🔴 Cao | - Scope `company` — hiển thị với toàn bộ nhân viên đã đăng nhập |
| US-CAL-04 | Với tư cách là **nhân viên**, tôi muốn **tạo sự kiện chỉ hiển thị trong nhóm của mình**, để **phối hợp lịch trình nội bộ nhóm mà không làm lộn xộn lịch công ty**. | 🟡 Trung bình | - Scope `group` — chỉ thành viên nhóm và admin thấy |
| US-CAL-05 | Với tư cách là **nhân viên**, tôi muốn **chỉnh sửa hoặc xóa sự kiện mà mình đã tạo**, để **cập nhật khi có thay đổi kế hoạch**. | 🔴 Cao | - Nút Edit/Delete chỉ xuất hiện cho người tạo và admin |
| US-CAL-06 | Với tư cách là **nhân viên**, tôi muốn **tìm kiếm và lọc sự kiện theo loại hoặc phạm vi**, để **nhanh chóng tìm thấy sự kiện liên quan**. | 🟡 Trung bình | - Bộ lọc hoạt động tức thì không cần reload |

---

### 3.6 Thư mục Nhân sự (People Directory)

| ID | User Story | Độ ưu tiên | Tiêu chí chấp nhận |
|----|------------|------------|-------------------|
| US-PPL-01 | Với tư cách là **nhân viên**, tôi muốn **xem danh sách tất cả đồng nghiệp trong công ty**, để **biết mình đang làm việc cùng ai**. | 🔴 Cao | - Grid các thẻ thành viên với ảnh, tên, vai trò |
| US-PPL-02 | Với tư cách là **nhân viên mới**, tôi muốn **tìm kiếm đồng nghiệp theo tên hoặc email**, để **nhanh chóng tìm đúng người cần liên hệ**. | 🟡 Trung bình | - Ô tìm kiếm lọc realtime |
| US-PPL-03 | Với tư cách là **nhân viên**, tôi muốn **xem hồ sơ chi tiết của một đồng nghiệp**, để **biết thêm về vai trò, nhóm, và thông tin liên hệ của họ**. | 🟡 Trung bình | - Modal hoặc trang hiển thị: tên, email, bio, nhóm, vai trò |
| US-PPL-04 | Với tư cách là **nhân viên**, tôi muốn **bắt đầu nhắn tin với đồng nghiệp từ trang thư mục**, để **không phải thoát ra để tìm kênh DM**. | 🔴 Cao | - Nút "Nhắn tin" trên thẻ/modal thành viên — tạo DM và điều hướng ngay |

---

### 3.7 Kho Tri thức (Knowledge Base)

| ID | User Story | Độ ưu tiên | Tiêu chí chấp nhận |
|----|------------|------------|-------------------|
| US-KB-01 | Với tư cách là **nhân viên mới**, tôi muốn **tìm và đọc tài liệu onboarding**, để **nắm bắt quy trình công ty mà không cần hỏi đồng nghiệp liên tục**. | 🔴 Cao | - Bộ lọc danh mục "Onboarding" — nhanh chóng tìm thấy tài liệu liên quan |
| US-KB-02 | Với tư cách là **kỹ sư**, tôi muốn **viết và lưu tài liệu kỹ thuật bằng Markdown**, để **chia sẻ kiến thức với đồng đội một cách có cấu trúc**. | 🔴 Cao | - Editor hỗ trợ Markdown; preview realtime |
| US-KB-03 | Với tư cách là **nhân viên**, tôi muốn **tìm kiếm bài viết theo từ khóa**, để **nhanh chóng tra cứu thông tin cần thiết**. | 🟡 Trung bình | - Tìm kiếm theo tiêu đề, tóm tắt, và thẻ tag |
| US-KB-04 | Với tư cách là **nhân viên**, tôi muốn **chỉ thấy bài viết mà tôi có quyền đọc**, để **bảo mật thông tin nội bộ nhạy cảm**. | 🔴 Cao | - Bài scope `admin` ẩn với member; bài scope `group` ẩn với người ngoài nhóm |
| US-KB-05 | Với tư cách là **admin**, tôi muốn **đặt phạm vi truy cập cho từng bài viết**, để **kiểm soát ai được xem tài liệu nhạy cảm**. | 🔴 Cao | - Dropdown chọn scope khi tạo/sửa bài |
| US-KB-06 | Với tư cách là **nhân viên**, tôi muốn **biết bài viết mất bao lâu để đọc trước khi click vào**, để **lên kế hoạch thời gian hợp lý**. | 🟢 Thấp | - Hiển thị "⏱️ X phút đọc" trên thẻ bài viết |

---

### 3.8 Hồ sơ Cá nhân (Profile)

| ID | User Story | Độ ưu tiên | Tiêu chí chấp nhận |
|----|------------|------------|-------------------|
| US-PRF-01 | Với tư cách là **nhân viên**, tôi muốn **cập nhật tên hiển thị và tiểu sử của mình**, để **đồng nghiệp biết thêm về tôi**. | 🟡 Trung bình | - Form chỉnh sửa tên và bio; lưu thành công hiển thị toast |
| US-PRF-02 | Với tư cách là **nhân viên**, tôi muốn **upload ảnh đại diện**, để **đồng nghiệp nhận ra tôi qua avatar**. | 🟡 Trung bình | - Chọn ảnh từ máy (≤2MB); preview trước khi lưu; hiển thị ngay sau upload |

---

### 3.9 Quản trị Hệ thống (Admin Dashboard)

| ID | User Story | Độ ưu tiên | Tiêu chí chấp nhận |
|----|------------|------------|-------------------|
| US-ADM-01 | Với tư cách là **admin**, tôi muốn **xem tổng quan hệ thống trên một dashboard**, để **nắm bắt sức khỏe và hoạt động của nền tảng**. | 🔴 Cao | - Hiển thị: tổng người dùng, thông báo mới, sự kiện sắp tới |
| US-ADM-02 | Với tư cách là **admin**, tôi muốn **thay đổi vai trò của thành viên (member ↔ admin)**, để **cấp hoặc thu hồi quyền quản trị khi cần**. | 🔴 Cao | - Dropdown chọn role ngay trong danh sách thành viên |
| US-ADM-03 | Với tư cách là **admin**, tôi muốn **tạo và quản lý các nhóm (Groups)**, để **tổ chức nhân viên theo phòng ban hoặc dự án và áp dụng phân quyền nội dung**. | 🔴 Cao | - CRUD nhóm; thêm/xóa thành viên trong nhóm |
| US-ADM-04 | Với tư cách là **admin**, tôi muốn **xóa tài khoản của nhân viên đã nghỉ việc**, để **giữ danh sách thành viên luôn chính xác**. | 🟡 Trung bình | - Xác nhận trước khi xóa; xóa xong cập nhật danh sách ngay |

---

## 4. Use Case Diagram (Tóm tắt)

```
Porocia System
│
├── [Nhân viên (Member)]
│   ├── Đăng nhập / Đăng xuất
│   ├── Xem & Gửi tin nhắn kênh/DM
│   ├── Xem Thông báo & Phản hồi
│   ├── Quản lý Lịch cá nhân & Nhóm
│   ├── Tìm kiếm Đồng nghiệp & Bắt đầu DM
│   ├── Đọc & Viết Tài liệu (Knowledge Base)
│   └── Chỉnh sửa Hồ sơ Cá nhân
│
└── [Quản trị viên (Admin)]
    ├── Toàn bộ quyền của Member
    ├── Đăng & Quản lý Thông báo
    ├── Tạo & Quản lý Kênh Chat
    ├── Tạo Sự kiện Toàn công ty
    ├── Quản lý Thành viên & Nhóm
    └── Xem Dashboard Thống kê
```

---

## 5. Luồng Người dùng Chính (Key User Flows)

### Flow 1: Nhân viên mới bắt đầu (Onboarding Flow)
```
Nhận tài khoản → Đăng nhập → Xem Trang chủ → Vào People Directory 
→ Làm quen đồng nghiệp → Vào Knowledge Base → Đọc tài liệu Onboarding 
→ Join kênh Chat phòng ban → Bắt đầu làm việc
```

### Flow 2: Admin phát thông báo khẩn (Urgent Announcement Flow)
```
Vào Dashboard → Tạo thông báo mới → Chọn loại "warning" → Nhập nội dung 
→ Upload ảnh (nếu cần) → Bật "Ghim" → Đăng → Thông báo hiển thị ưu tiên 
trên trang chủ và trang Announcements
```

### Flow 3: Nhân viên nhắn tin trực tiếp đồng nghiệp (DM Flow)
```
Vào People Directory → Tìm tên đồng nghiệp → Click "Nhắn tin" 
→ Hệ thống tạo kênh DM → Chuyển hướng vào kênh DM → Bắt đầu nhắn tin
```

---

*Tài liệu User Requirements này phản ánh trạng thái hệ thống Porocia v0.1.0. Cần cập nhật khi có thêm tính năng mới.*

*最終更新: 2026年05月29日*
