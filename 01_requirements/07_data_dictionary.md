# Từ điển Dữ liệu và Mô hình Lưu trữ (Data Dictionary & Storage Schema)
**Dự án**: Porocia — Nền tảng Giao tiếp Nội bộ Doanh nghiệp
**Phiên bản tài liệu**: 1.0
**Ngày cập nhật**: 2026-05-29
**Trạng thái**: Draft

---

## 1. Tổng quan

Đối với các ứng dụng xây dựng trên cơ sở dữ liệu NoSQL như **Google Cloud Firestore**, việc thiết kế và duy trì một mô hình dữ liệu thống nhất, chặt chẽ là vô cùng quan trọng để tránh tình trạng phân rã cấu trúc (schema drift).

Tài liệu này cung cấp đặc tả chi tiết về **Từ điển Dữ liệu (Data Dictionary)** của hệ thống Porocia, bao gồm:
- Quy ước đặt tên và kiểu dữ liệu.
- Cấu trúc các **Collection** chính và **Sub-collection** trong Firestore.
- Mô tả chi tiết từng trường dữ liệu (Tên trường, Kiểu dữ liệu, Bắt buộc/Tùy chọn, Mô tả, Ví dụ).
- Các yêu cầu về **Chỉ mục (Indices)** của Firestore để tối ưu hóa truy vấn.
- Cấu trúc lưu trữ tệp tin trên **Cloudinary CDN**.

---

## 2. Quy ước Thiết kế Cơ sở Dữ liệu

### 2.1 Quy ước Đặt tên (Naming Conventions)
- **Collection / Sub-collection**: Sử dụng chữ thường, dạng số nhiều, phân cách bằng dấu gạch ngang nếu cần (ví dụ: `users`, `channels`, `messages`, `announcements`).
- **Trường dữ liệu (Fields)**: Sử dụng kiểu **camelCase** (ví dụ: `displayName`, `photoURL`, `createdAt`).
- **Khóa chính (Document ID)**:
  - **Tự động sinh (Auto-generated)**: Dùng thuật toán của Firestore (20 ký tự ngẫu nhiên) cho các tài liệu như tin nhắn, thông báo, sự kiện, bài viết.
  - **Thủ công định nghĩa (Explicit ID)**:
    - `users/{uid}`: Sử dụng `uid` do Firebase Authentication cung cấp để đồng bộ tài khoản trực tiếp.
    - `channels/{channelId}`: Với Kênh trực tiếp (Direct Message - DM), ID được chuẩn hóa theo định dạng: `dm_${uid1}_${uid2}` (trong đó `uid1` và `uid2` được sắp xếp theo thứ tự bảng chữ cái để tránh trùng lặp kênh DM giữa cùng 2 người).

### 2.2 Kiểu dữ liệu Kỹ thuật (Technical Data Types)
- `string`: Chuỗi văn bản UTF-8.
- `number`: Số nguyên hoặc số thực.
- `boolean`: Giá trị logic (`true` / `false`).
- `Timestamp`: Kiểu thời gian đặc thù của Firestore (độ chính xác đến nano giây, lưu trữ giây và nano giây).
- `array`: Mảng danh sách các phần tử (ví dụ: `string[]` cho danh sách UIDs).
- `map` (Object): Cấu trúc khóa-giá trị lồng nhau (tương đương với `Record<string, any>` trong TypeScript).
- `null`: Đại diện cho dữ liệu trống hoặc chưa xác định.

---

## 3. Danh mục Collection và Sub-collection

Sơ đồ phân cấp thực thể trong Firestore:

```
Firestore Root
├── [C] users (Document ID: uid)
│    └── [SC] readState (Document ID: channelId)
├── [C] groups (Document ID: auto-gen)
├── [C] channels (Document ID: auto-gen hoặc dm_uid1_uid2)
│    └── [SC] messages (Document ID: auto-gen)
├── [C] announcements (Document ID: auto-gen)
│    └── [SC] comments (Document ID: auto-gen)
├── [C] events (Document ID: auto-gen)
└── [C] articles (Document ID: auto-gen)
     └── [SC] comments (Document ID: auto-gen)
```
*(Ghi chú: [C] = Collection, [SC] = Sub-collection)*

---

## 4. Đặc tả Chi tiết các Collection

### 4.1 Collection: `users`
- **Đường dẫn**: `/users/{uid}`
- **Mô tả**: Lưu trữ hồ sơ thông tin tài khoản người dùng được đồng bộ từ Firebase Auth và cập nhật bởi cá nhân/admin.
- **Document ID**: `uid` (Firebase Auth UID)

| Tên Trường (Field) | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả | Giá Trị Ví Dụ |
| :--- | :--- | :---: | :--- | :--- |
| `uid` | `string` | **Có** | ID định danh duy nhất của người dùng | `aB8cdEFgh9IJKLMNOPqRstu` |
| `email` | `string` | **Có** | Địa chỉ email đăng ký tài khoản | `employee@porocia.com` |
| `displayName` | `string` | **Có** | Tên hiển thị của người dùng trên hệ thống | `Nguyen Van A` |
| `photoURL` | `string` | Không | Đường dẫn ảnh đại diện (Cloudinary hoặc mặc định) | `https://res.cloudinary.com/...` |
| `bio` | `string` | Không | Phần giới thiệu ngắn về bản thân | `Kỹ sư phần mềm - Phòng Công nghệ` |
| `role` | `string` | **Có** | Vai trò hệ thống: `member` hoặc `admin` | `member` |
| `createdAt` | `Timestamp` | **Có** | Thời điểm tạo tài khoản trên hệ thống | `2026-05-29T15:47:04.000Z` |
| `lastLoginAt` | `Timestamp` | Không | Thời điểm đăng nhập gần nhất | `2026-05-29T15:47:04.000Z` |
| `updatedAt` | `Timestamp` | Không | Thời điểm cập nhật thông tin hồ sơ gần nhất | `2026-05-29T15:47:04.000Z` |

#### 4.1.1 Sub-collection: `users/{uid}/readState`
- **Đường dẫn**: `/users/{uid}/readState/{channelId}`
- **Mô tả**: Lưu trạng thái tin nhắn cuối cùng đã đọc của từng người dùng trong mỗi kênh chat để phục vụ hiển thị số tin chưa đọc.
- **Document ID**: `channelId` (ID của Kênh chat tương ứng)

| Tên Trường (Field) | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả | Giá Trị Ví Dụ |
| :--- | :--- | :---: | :--- | :--- |
| `lastReadAt` | `Timestamp` | **Có** | Thời điểm cuối cùng người dùng mở đọc kênh | `2026-05-29T15:45:00.000Z` |
| `lastReadMessageId` | `string` | **Có** | ID tin nhắn mới nhất trong kênh lúc họ đọc | `msg_12345abcde` |

---

### 4.2 Collection: `groups`
- **Đường dẫn**: `/groups/{groupId}`
- **Mô tả**: Quản lý các nhóm/phòng ban trong công ty phục vụ cho việc phân quyền xem tài liệu và hiển thị danh sách.
- **Document ID**: Tự động sinh bởi Firestore.

| Tên Trường (Field) | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả | Giá Trị Ví Dụ |
| :--- | :--- | :---: | :--- | :--- |
| `name` | `string` | **Có** | Tên phòng ban/nhóm | `Phòng Công nghệ Thông tin` |
| `description` | `string` | Không | Mô tả chức năng nhiệm vụ của nhóm | `Phát triển sản phẩm Porocia` |
| `members` | `array (string)`| **Có** | Danh sách các UIDs của thành viên trong nhóm | `["uid1", "uid2", "uid3"]` |
| `createdBy` | `string` | **Có** | UID người tạo nhóm | `admin_uid_123` |
| `createdAt` | `Timestamp` | **Có** | Thời điểm tạo nhóm | `2026-05-29T08:00:00.000Z` |
| `updatedAt` | `Timestamp` | Không | Thời điểm cập nhật thông tin nhóm gần nhất | `2026-05-29T10:30:00.000Z` |

---

### 4.3 Collection: `channels`
- **Đường dẫn**: `/channels/{channelId}`
- **Mô tả**: Quản lý các phòng chat (Kênh công khai, Kênh riêng tư, hoặc Kênh chat trực tiếp 1-1).
- **Document ID**: Tự động sinh bởi Firestore (với public/private) hoặc `dm_${uid1}_${uid2}` (với kênh DM).

| Tên Trường (Field) | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả | Giá Trị Ví Dụ |
| :--- | :--- | :---: | :--- | :--- |
| `name` | `string` | **Có** | Tên của kênh chat (với DM là tên 2 người ghép lại) | `General` |
| `description` | `string` | Không | Mô tả mục đích của kênh chat | `Kênh thảo luận chung cho toàn bộ công ty` |
| `type` | `string` | **Có** | Phân loại kênh: `public`, `private`, hoặc `dm` | `public` |
| `createdBy` | `string` | **Có** | UID của người tạo kênh | `employee_uid_456` |
| `createdAt` | `Timestamp` | **Có** | Thời điểm tạo kênh | `2026-05-29T08:00:00.000Z` |
| `isArchived` | `boolean` | **Có** | Trạng thái lưu trữ (kênh đã đóng/ẩn đi) | `false` |
| `members` | `array (string)`| **Có** | Danh sách UIDs các thành viên có quyền truy cập | `["uid1", "uid2", "uid4"]` |
| `unreadCount` | `map (number)` | **Có** | Bản đồ đếm tin nhắn chưa đọc của từng thành viên | `{ "uid1": 0, "uid2": 5 }` |

#### 4.3.1 Sub-collection: `channels/{channelId}/messages`
- **Đường dẫn**: `/channels/{channelId}/messages/{messageId}`
- **Mô tả**: Lưu trữ chi tiết tất cả tin nhắn trong một kênh cụ thể.
- **Document ID**: Tự động sinh bởi Firestore.

| Tên Trường (Field) | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả | Giá Trị Ví Dụ |
| :--- | :--- | :---: | :--- | :--- |
| `text` | `string` | **Có** | Nội dung tin nhắn văn bản gửi đi | `Chào buổi sáng cả nhóm!` |
| `senderId` | `string` | **Có** | UID người gửi tin nhắn | `uid1` |
| `senderEmail` | `string` | **Có** | Email người gửi (để hiển thị nhanh) | `sender@company.com` |
| `senderName` | `string` | **Có** | Tên hiển thị người gửi | `Nguyen Van A` |
| `senderPhotoURL` | `string` | Không | Ảnh đại diện người gửi | `https://res.cloudinary.com/...` |
| `type` | `string` | **Có** | Kiểu tin nhắn (mặc định hiện tại: `text`) | `text` |
| `createdAt` | `Timestamp` | **Có** | Thời điểm gửi tin nhắn | `2026-05-29T09:15:30.000Z` |
| `updatedAt` | `Timestamp` | Không | Thời điểm sửa tin (nếu có, mặc định `null`) | `null` |
| `readBy` | `array (string)`| **Có** | Danh sách UIDs những người đã xem tin này | `["uid1", "uid2"]` |
| `readAt` | `map (Timestamp)`| **Có** | Bản đồ ghi lại thời điểm từng UID đã đọc tin này | `{ "uid1": Timestamp, "uid2": Timestamp }` |
| `replyTo` | `map` (Object) | Không | Dữ liệu tin nhắn gốc nếu đây là tin nhắn trả lời | Xem cấu trúc chi tiết bên dưới |
| `reactions` | `map (array)` | Không | Bản đồ lưu emoji và danh sách UIDs tương tác | `{ "👍": ["uid1", "uid2"], "❤️": ["uid3"] }` |

##### Cấu trúc chi tiết trường lồng `replyTo`:
```typescript
replyTo?: {
  messageId: string;       // ID tin nhắn gốc được trả lời
  senderId: string;        // UID người gửi tin nhắn gốc
  senderName: string;      // Tên người gửi tin nhắn gốc
  senderPhotoURL?: string; // Ảnh đại diện người gửi gốc
  text: string;            // Nội dung tin nhắn gốc (rút gọn)
} | null
```

---

### 4.4 Collection: `announcements`
- **Đường dẫn**: `/announcements/{announcementId}`
- **Mô tả**: Quản lý các thông báo quan trọng do ban giám đốc hoặc admin đăng tải lên bảng tin chung.
- **Document ID**: Tự động sinh bởi Firestore.

| Tên Trường (Field) | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả | Giá Trị Ví Dụ |
| :--- | :--- | :---: | :--- | :--- |
| `title` | `string` | **Có** | Tiêu đề của thông báo | `Thông báo Nghỉ lễ Quốc khánh` |
| `content` | `string` | **Có** | Nội dung thông báo chi tiết (hỗ trợ định dạng RichText) | `Kính gửi toàn thể nhân viên...` |
| `type` | `string` | **Có** | Phân loại thông báo: `info`, `warning`, `success`, `event` | `info` |
| `imageURL` | `string` | Không | Đường dẫn ảnh đính kèm (lưu trữ trên Cloudinary) | `https://res.cloudinary.com/...` |
| `authorId` | `string` | **Có** | UID của admin đăng tải thông báo | `admin_uid_789` |
| `authorName` | `string` | **Có** | Tên của admin đăng tải thông báo | `Trần Thị B` |
| `isPinned` | `boolean` | **Có** | Đánh dấu ghim thông báo lên trên đầu bảng tin | `true` |
| `likes` | `array (string)`| Không | Danh sách UIDs người dùng thích thông báo | `["uid1", "uid2", "uid5"]` |
| `calendarEventId` | `string` | Không | ID sự kiện lịch liên kết (nếu loại thông báo là event)| `evt_987654321` |
| `createdAt` | `Timestamp` | **Có** | Thời điểm tạo thông báo | `2026-05-29T08:00:00.000Z` |
| `updatedAt` | `Timestamp` | **Có** | Thời điểm cập nhật thông báo gần nhất | `2026-05-29T10:00:00.000Z` |

#### 4.4.1 Sub-collection: `announcements/{announcementId}/comments`
- **Đường dẫn**: `/announcements/{announcementId}/comments/{commentId}`
- **Mô tả**: Lưu trữ các bình luận thảo luận dưới mỗi thông báo.
- **Document ID**: Tự động sinh bởi Firestore.

| Tên Trường (Field) | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả | Giá Trị Ví Dụ |
| :--- | :--- | :---: | :--- | :--- |
| `text` | `string` | **Có** | Nội dung bình luận văn bản | `Đã nhận thông tin, cảm ơn ban giám đốc.` |
| `authorId` | `string` | **Có** | UID người viết bình luận | `uid2` |
| `authorName` | `string` | **Có** | Tên hiển thị người bình luận | `Nguyen Van A` |
| `authorPhotoURL` | `string` | Không | Ảnh đại diện người bình luận | `https://res.cloudinary.com/...` |
| `createdAt` | `Timestamp` | **Có** | Thời điểm gửi bình luận | `2026-05-29T10:15:00.000Z` |

---

### 4.5 Collection: `events`
- **Đường dẫn**: `/events/{eventId}`
- **Mô tả**: Quản lý lịch biểu và các sự kiện chung của công ty hoặc của từng cá nhân/nhóm.
- **Document ID**: Tự động sinh bởi Firestore.

| Tên Trường (Field) | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả | Giá Trị Ví Dụ |
| :--- | :--- | :---: | :--- | :--- |
| `title` | `string` | **Có** | Tên/Tiêu đề sự kiện | `Họp Giao ban Hàng tuần` |
| `start` | `Timestamp` | **Có** | Thời điểm bắt đầu sự kiện | `2026-06-01T09:00:00.000Z` |
| `end` | `Timestamp` | **Có** | Thời điểm kết thúc sự kiện | `2026-06-01T10:30:00.000Z` |
| `type` | `string` | **Có** | Phân loại loại sự kiện (holiday, meeting, event, v.v.)| `meeting` |
| `scope` | `string` | **Có** | Phạm vi hiển thị: `company`, `group`, hoặc `personal` | `company` |
| `groupId` | `string` | Không | ID nhóm áp dụng (nếu scope là `group`) | `grp_it_department_001` |
| `groupName` | `string` | Không | Tên nhóm áp dụng (nếu scope là `group`) | `Phòng Công nghệ Thông tin` |
| `createdBy` | `string` | **Có** | UID người tạo sự kiện | `admin_uid_789` |
| `creatorName` | `string` | **Có** | Tên người tạo sự kiện | `Trần Thị B` |
| `createdAt` | `Timestamp` | **Có** | Thời điểm lưu sự kiện vào hệ thống | `2026-05-29T15:47:00.000Z` |

---

### 4.6 Collection: `articles` (Knowledge Base)
- **Đường dẫn**: `/articles/{articleId}`
- **Mô tả**: Lưu trữ các bài viết, tài liệu, quy trình hướng dẫn nghiệp vụ (Wiki nội bộ) của công ty.
- **Document ID**: Tự động sinh bởi Firestore.

| Tên Trường (Field) | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả | Giá Trị Ví Dụ |
| :--- | :--- | :---: | :--- | :--- |
| `title` | `string` | **Có** | Tiêu đề bài viết tri thức | `Hướng dẫn Setup Môi trường Dev` |
| `content` | `string` | **Có** | Nội dung bài viết định dạng **Markdown** đầy đủ | `# Bắt đầu\nĐể cài đặt dự án, chạy...` |
| `summary` | `string` | **Có** | Tóm tắt ngắn gọn nội dung bài viết | `Tài liệu hướng dẫn nhân viên mới cài đặt dự án` |
| `category` | `string` | **Có** | Chuyên mục tài liệu: `hr`, `engineering`, `design`, `onboarding` | `engineering` |
| `tags` | `array (string)`| **Có** | Danh sách thẻ từ khóa tìm kiếm | `["nextjs", "setup", "git"]` |
| `scope` | `string` | **Có** | Phạm vi truy cập: `all` (toàn bộ), `group` (nhóm), `admin` | `all` |
| `allowedGroups` | `array (string)`| Không | Danh sách các IDs nhóm được phép xem nếu scope = `group` | `["grp_it_department_001"]` |
| `views` | `number` | **Có** | Bộ đếm lượt xem bài viết | `42` |
| `likes` | `array (string)`| **Có** | Danh sách UIDs người thích bài viết | `["uid1", "uid3"]` |
| `createdBy` | `string` | **Có** | UID tác giả bài viết | `employee_uid_456` |
| `authorName` | `string` | **Có** | Tên tác giả hiển thị | `Nguyễn Văn A` |
| `authorPhoto` | `string` | Không | Ảnh đại diện tác giả bài viết | `https://res.cloudinary.com/...` |
| `createdAt` | `Timestamp` | **Có** | Thời điểm xuất bản tài liệu | `2026-05-29T08:00:00.000Z` |
| `updatedAt` | `Timestamp` | **Có** | Thời điểm cập nhật tài liệu gần nhất | `2026-05-29T11:00:00.000Z` |

#### 4.6.1 Sub-collection: `articles/{articleId}/comments`
- **Đường dẫn**: `/articles/{articleId}/comments/{commentId}`
- **Mô tả**: Lưu trữ bình luận đóng góp ý kiến dưới bài viết tri thức.
- **Document ID**: Tự động sinh bởi Firestore.

| Tên Trường (Field) | Kiểu Dữ Liệu | Bắt Buộc | Mô Tả | Giá Trị Ví Dụ |
| :--- | :--- | :---: | :--- | :--- |
| `text` | `string` | **Có** | Nội dung ý kiến đóng góp | `Phần cài đặt Nodejs cần update lên v20.` |
| `userId` | `string` | **Có** | UID người bình luận | `uid3` |
| `userName` | `string` | **Có** | Tên hiển thị người bình luận | `Kỹ sư B` |
| `userPhoto` | `string` | Không | Ảnh đại diện người bình luận | `https://res.cloudinary.com/...` |
| `createdAt` | `Timestamp` | **Có** | Thời điểm gửi bình luận đóng góp | `2026-05-29T12:00:00.000Z` |

---

## 5. Danh sách Chỉ mục Firestore Yêu cầu (Firestore Indexing)

Để thực hiện các truy vấn nâng cao có sắp xếp và lọc cùng lúc trong Firestore mà không gây ra lỗi `FAILED_PRECONDITION`, hệ thống cần cấu hình các chỉ mục sau:

### 5.1 Chỉ mục Đơn trường (Single-Field Indices)
Mặc định Firestore tự động tạo chỉ mục đơn cho từng trường. 
Tuy nhiên, cần cấu hình **Bỏ qua (Exemptions)** đối với:
- Trường `unreadCount` trong `channels` để tránh tạo ra quá nhiều chỉ mục dư thừa khi số lượng thành viên tăng lên.
- Trường `readAt` trong `messages`.

### 5.2 Chỉ mục Hợp phần (Composite Indices)
Các chỉ mục phức hợp dưới đây bắt buộc phải được tạo trong Firestore Console hoặc file `firestore.indexes.json` để ứng dụng hoạt động chính xác:

| Collection | Thuộc tính (Các trường tham gia) | Hướng sắp xếp (Sort Order) | Lý do truy vấn |
| :--- | :--- | :---: | :--- |
| `announcements` | `isPinned` <br> `createdAt` | `DESCENDING` <br> `DESCENDING` | Lấy danh sách thông báo, hiển thị tin ghim trước, tin mới xếp sau. |
| `channels/{channelId}/messages` | `createdAt` | `DESCENDING` | Lấy tin nhắn mới nhất trong kênh (phân trang và realtime). |
| `events` | `start` | `ASCENDING` | Tải danh sách sự kiện xếp theo thời gian bắt đầu tăng dần. |
| `articles` | `createdAt` | `DESCENDING` | Tải danh sách bài viết kiến thức mới nhất trước. |

---

## 6. Sơ đồ Lưu trữ trên Cloudinary (Cloudinary Storage Architecture)

Porocia sử dụng dịch vụ Cloudinary CDN để lưu trữ và phân phối tệp đa phương tiện (ảnh đại diện, hình ảnh đính kèm trong thông báo và bài viết).

### 6.1 Cấu trúc Thư mục Lưu trữ (Folder Structure)
Mọi tệp tin tải lên Cloudinary được tổ chức phân cấp trong thư mục gốc `porocia`:

```
porocia/
├── avatars/
│    └── {uid}.jpg         # Ảnh đại diện của người dùng (tên file trùng UID để quản lý ghi đè)
├── announcements/
│    └── {uuid}.png        # Ảnh đính kèm trong thông báo (định danh ngẫu nhiên)
└── articles/
     └── {uuid}.png        # Ảnh nhúng trong bài viết tri thức (định danh ngẫu nhiên)
```

### 6.2 Cấu hình Tải lên (Upload Config)
- **Upload Preset**: Sử dụng preset không bảo mật (`unsigned upload`) tên là `porocia` với các thiết lập:
  - Cho phép định dạng: `png`, `jpg`, `jpeg`, `gif`, `webp`.
  - Giới hạn dung lượng: **2 MB**.
  - **Tự động tối ưu hóa**: Định dạng xuất ra tự động (`f_auto`) và chất lượng tự động (`q_auto`) để giảm băng thông tải trang.

---

## 7. Ràng buộc Toàn vẹn Dữ liệu (Data Integrity Constraints)

Để đảm bảo an toàn dữ liệu ở tầng cơ sở dữ liệu trước khi được đưa vào Firestore, các Server Actions và API phải tuân thủ schema validation thông qua thư viện **Zod** tại `src/lib/validations/`:

1. **Email người dùng**: Phải đúng định dạng email doanh nghiệp (kết thúc bằng `@company.com` hoặc tên miền doanh nghiệp được cấu hình).
2. **Kênh chat**: Tên kênh không được chứa ký tự đặc biệt gây lỗi URL (chỉ cho phép chữ, số, dấu gạch ngang và gạch dưới). Độ dài từ 3 đến 30 ký tự.
3. **Tiêu đề thông báo / Tri thức**: Không được để trống, tối thiểu 5 ký tự và tối đa 100 ký tự.
4. **Khoảng thời gian sự kiện**: Sự kiện bắt đầu (`start`) phải luôn nhỏ hơn sự kiện kết thúc (`end`).

---

*Tài liệu Từ điển Dữ liệu này được xây dựng dựa trên việc phân tích thực tế mã nguồn cơ sở dữ liệu của dự án Porocia. Mọi thay đổi về cấu trúc trường trong mã nguồn phải được cập nhật song song vào tài liệu này.*

*最終更新: 2026年05月29日*
