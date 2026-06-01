# Đặc tả Use Case (Use Case Specifications)
**Dự án**: Porocia — Nền tảng Giao tiếp Nội bộ Doanh nghiệp
**Phiên bản tài liệu**: 1.0
**Ngày cập nhật**: 2026-05-29
**Trạng thái**: Draft

---

## 1. Quy ước Tài liệu

### 1.1 Cấu trúc mỗi Use Case

Mỗi Use Case được mô tả theo cấu trúc chuẩn:

| Trường | Mô tả |
|--------|-------|
| **ID** | Mã định danh duy nhất (UC-XXX-NN) |
| **Tên** | Tên ngắn gọn của Use Case |
| **Actor** | Tác nhân thực hiện hành động |
| **Tiền điều kiện** | Điều kiện phải đúng trước khi UC bắt đầu |
| **Hậu điều kiện** | Trạng thái hệ thống sau khi UC hoàn tất thành công |
| **Luồng chính** | Các bước thực hiện chính |
| **Luồng thay thế** | Xử lý các trường hợp ngoại lệ / lỗi |

### 1.2 Danh sách Actor

| Actor | Mô tả |
|-------|-------|
| **Member** | Nhân viên thông thường đã đăng nhập |
| **Admin** | Quản trị viên có role = "admin" |
| **System** | Hệ thống tự động (Firebase triggers, Server Actions) |

---

## 2. Module Xác thực (Authentication)

---

### UC-AUTH-01: Đăng nhập hệ thống

| | |
|---|---|
| **ID** | UC-AUTH-01 |
| **Tên** | Đăng nhập hệ thống |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Người dùng chưa đăng nhập; có tài khoản hợp lệ trong Firebase Auth |
| **Hậu điều kiện** | Session Cookie HTTP-only được tạo; người dùng được chuyển hướng về trang chủ |

**Luồng chính:**
1. Người dùng truy cập `/login`
2. Người dùng nhập email và mật khẩu
3. Client gọi `loginWithEmail(email, password)`
4. Firebase Auth xác thực và trả về credential
5. Client gọi `syncUserToFirestore(user)` — cập nhật `lastLoginAt`
6. Client lấy `idToken` từ credential
7. Client gọi Server Action `createSessionCookieAction(idToken)`
8. Server gọi `adminAuth.createSessionCookie()` — tạo cookie có hạn 7 ngày
9. Cookie HTTP-only "session" được set trên trình duyệt
10. Client chuyển hướng người dùng về `/`

**Luồng thay thế:**

| Bước | Tình huống | Xử lý |
|------|-----------|-------|
| 4 | Sai email/mật khẩu | Firebase trả về lỗi `auth/wrong-password` hoặc `auth/user-not-found` → Hiển thị thông báo lỗi trên form |
| 4 | Tài khoản bị vô hiệu hóa | Firebase trả về `auth/user-disabled` → Thông báo "Tài khoản bị khóa" |
| 7 | Server Action thất bại | Hiển thị lỗi toast; không tạo cookie; người dùng ở lại trang login |

---

### UC-AUTH-02: Đăng xuất

| | |
|---|---|
| **ID** | UC-AUTH-02 |
| **Tên** | Đăng xuất khỏi hệ thống |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Người dùng đã đăng nhập (có session cookie hợp lệ) |
| **Hậu điều kiện** | Session Cookie bị xóa; người dùng được chuyển hướng về `/login` |

**Luồng chính:**
1. Người dùng click nút "Đăng xuất" trên navigation
2. Client gọi `logout()`
3. Client gọi Server Action `removeSessionCookieAction()` — xóa cookie
4. Client gọi `signOut(auth)` — xóa phiên Firebase client-side
5. Chuyển hướng về `/login`

---

## 3. Module Chat

---

### UC-CHAT-01: Gửi tin nhắn vào kênh

| | |
|---|---|
| **ID** | UC-CHAT-01 |
| **Tên** | Gửi tin nhắn vào kênh |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Đã đăng nhập; đang xem trang `/chat/{channelId}` |
| **Hậu điều kiện** | Tin nhắn được lưu vào Firestore; tất cả thành viên kênh thấy tin nhắn mới; unreadCount của người khác tăng lên 1 |

**Luồng chính:**
1. Người dùng gõ tin nhắn vào `ChatInput`
2. Người dùng nhấn Enter hoặc nút gửi
3. Client gọi `sendMessage({ channelId, text, senderId, senderName, ... })`
4. `sendMessage` thực hiện `writeBatch`:
   - `addDoc` vào `channels/{id}/messages` với `readBy: [senderId]`
   - `arrayUnion(senderId)` vào `channels/{id}.members`
   - `increment(1)` vào `channels/{id}.unreadCount[uid]` cho mỗi thành viên khác
5. `onSnapshot` listener trên tất cả client đang xem kênh kích hoạt → UI tự cập nhật
6. Sidebar của các thành viên khác hiển thị badge số chưa đọc

**Luồng thay thế:**

| Bước | Tình huống | Xử lý |
|------|-----------|-------|
| 2 | Tin nhắn rỗng hoặc chỉ có khoảng trắng | `sendMessage` kiểm tra `text.trim()` → return sớm; không gửi |
| 4 | Lỗi Firestore (network timeout) | Hiển thị toast lỗi; tin nhắn không được gửi |

---

### UC-CHAT-02: Đọc tin nhắn và đánh dấu đã đọc

| | |
|---|---|
| **ID** | UC-CHAT-02 |
| **Tên** | Mở kênh và đánh dấu đã đọc |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Đã đăng nhập; kênh tồn tại |
| **Hậu điều kiện** | `unreadCount[uid]` reset về 0; tin nhắn mới nhất được đánh dấu `readBy` bao gồm uid |

**Luồng chính:**
1. Người dùng click vào kênh trong sidebar
2. Client điều hướng đến `/chat/{channelId}`
3. `useChat` hook khởi động `listenLatestMessages(channelId)` — onSnapshot lắng nghe tin nhắn mới nhất
4. `markChannelAsRead(channelId, uid)` được gọi tự động khi trang load
5. `writeBatch` thực hiện:
   - `arrayUnion(uid)` vào `readBy` của tin nhắn mới nhất
   - `set` vào `users/{uid}/readState/{channelId}` — lưu trạng thái đọc
   - `update` `channels/{id}.unreadCount[uid] = 0`
6. Badge số trên sidebar của người dùng đó biến mất

---

### UC-CHAT-03: Nhắn tin trực tiếp (DM)

| | |
|---|---|
| **ID** | UC-CHAT-03 |
| **Tên** | Bắt đầu cuộc trò chuyện DM |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Đã đăng nhập; mục tiêu là thành viên khác |
| **Hậu điều kiện** | Kênh DM tồn tại (mới hoặc đã có); người dùng được điều hướng vào kênh DM |

**Luồng chính:**
1. Người dùng vào trang `/people` hoặc sidebar
2. Người dùng click "Nhắn tin" trên thẻ thành viên
3. Client gọi `ensureDirectChannel(userA, userB)`
4. Hệ thống tính `channelId = "dm_{sortedUid1}_{sortedUid2}"`
5. Kiểm tra Firestore: nếu kênh chưa tồn tại → `setDoc` tạo mới với `type: "dm"`
6. Trả về `channelId`
7. Client điều hướng đến `/chat/{channelId}`

**Luồng thay thế:**

| Bước | Tình huống | Xử lý |
|------|-----------|-------|
| 5 | Kênh DM đã tồn tại | Bỏ qua bước tạo mới; dùng kênh cũ → điều hướng vào |

---

### UC-CHAT-04: Trả lời tin nhắn (Reply)

| | |
|---|---|
| **ID** | UC-CHAT-04 |
| **Tên** | Trả lời một tin nhắn cụ thể |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Đang xem kênh chat; có ít nhất 1 tin nhắn |
| **Hậu điều kiện** | Tin nhắn reply được lưu với trường `replyTo` chứa thông tin tin gốc |

**Luồng chính:**
1. Người dùng hover chuột vào tin nhắn
2. Nút "Reply" xuất hiện
3. Người dùng click "Reply"
4. `ChatInput` hiển thị preview quote của tin nhắn gốc
5. Người dùng gõ nội dung và gửi
6. `sendMessage()` được gọi với trường `replyTo: { messageId, senderId, senderName, text }`
7. Tin nhắn mới hiển thị kèm quote tin gốc phía trên

---

### UC-CHAT-05: Thêm Reaction vào tin nhắn

| | |
|---|---|
| **ID** | UC-CHAT-05 |
| **Tên** | Toggle emoji reaction |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Đang xem kênh; có ít nhất 1 tin nhắn |
| **Hậu điều kiện** | Trường `reactions[emoji]` trong Firestore được cập nhật (thêm hoặc xóa uid) |

**Luồng chính:**
1. Người dùng hover vào tin nhắn
2. Emoji picker xuất hiện
3. Người dùng chọn emoji
4. `toggleMessageReaction({ channelId, messageId, uid, emoji, isRemoving })` được gọi
5. Nếu người dùng chưa react: `arrayUnion(uid)` vào `reactions[emoji]`
6. Nếu đã react: `arrayRemove(uid)` → nếu mảng rỗng thì `deleteField()` để xóa key
7. UI cập nhật số lượng reaction tức thì

---

## 4. Module Thông báo (Announcements)

---

### UC-ANN-01: Đăng thông báo mới

| | |
|---|---|
| **ID** | UC-ANN-01 |
| **Tên** | Admin đăng thông báo mới |
| **Actor** | Admin |
| **Tiền điều kiện** | Đã đăng nhập với role = "admin"; ở trang `/dashboard/announcements/new` |
| **Hậu điều kiện** | Thông báo mới được lưu vào collection `announcements`; hiển thị ngay trên trang `/announcements` |

**Luồng chính:**
1. Admin điền form: tiêu đề, nội dung, loại (info/warning/success/event)
2. (Tùy chọn) Admin upload ảnh qua `ImageUploaderClient` → Cloudinary trả về URL
3. (Tùy chọn) Admin bật toggle "Ghim thông báo"
4. Admin click "Đăng"
5. `createAnnouncement({ title, content, type, isPinned, imageURL, authorId, authorName })` được gọi
6. `addDoc` lưu vào Firestore với `createdAt: serverTimestamp()`
7. Thông báo xuất hiện ngay trên trang `/announcements` cho toàn bộ nhân viên

**Luồng thay thế:**

| Bước | Tình huống | Xử lý |
|------|-----------|-------|
| 2 | Upload ảnh vượt quá giới hạn kích thước | Hiển thị thông báo lỗi; không upload |
| 5 | Thiếu trường bắt buộc (title, content) | Zod validation fail → Hiển thị lỗi inline trên form |

---

### UC-ANN-02: Ghim / Bỏ ghim thông báo

| | |
|---|---|
| **ID** | UC-ANN-02 |
| **Tên** | Toggle trạng thái ghim của thông báo |
| **Actor** | Admin |
| **Tiền điều kiện** | Đã đăng nhập với role = "admin"; thông báo tồn tại |
| **Hậu điều kiện** | `isPinned` trong Firestore được đảo ngược; thứ tự hiển thị cập nhật ngay |

**Luồng chính:**
1. Admin click icon ghim trên thông báo
2. `togglePinAnnouncement(id, currentPinned)` được gọi
3. `updateDoc` với `isPinned: !currentPinned`
4. Query `orderBy("isPinned", "desc")` tự động đưa thông báo ghim lên đầu

---

### UC-ANN-03: Bình luận dưới thông báo

| | |
|---|---|
| **ID** | UC-ANN-03 |
| **Tên** | Nhân viên bình luận dưới thông báo |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Đã đăng nhập; đang xem trang `/announcements` |
| **Hậu điều kiện** | Comment được lưu vào sub-collection `announcements/{id}/comments` |

**Luồng chính:**
1. Người dùng click vào khu vực bình luận của thông báo
2. Form nhập comment hiển thị
3. Người dùng nhập nội dung và gửi
4. `addComment(announcementId, { authorId, authorName, text })` được gọi
5. Comment được lưu với `createdAt: serverTimestamp()`
6. `listenComments` onSnapshot cập nhật danh sách comment tức thì

---

## 5. Module Lịch (Calendar)

---

### UC-CAL-01: Tạo sự kiện

| | |
|---|---|
| **ID** | UC-CAL-01 |
| **Tên** | Tạo sự kiện mới trên lịch |
| **Actor** | Member (cá nhân/nhóm), Admin (toàn công ty) |
| **Tiền điều kiện** | Đã đăng nhập; đang ở trang `/calendar` |
| **Hậu điều kiện** | Sự kiện được lưu vào collection `events`; hiển thị ngay trên lịch của những người có quyền xem |

**Luồng chính:**
1. Người dùng click vào ngày trên lịch hoặc nút "Tạo sự kiện"
2. Modal `AddEventModal` xuất hiện
3. Người dùng điền: tiêu đề, thời gian bắt đầu/kết thúc, loại, mô tả, phạm vi (scope)
4. Nếu scope = "group": Người dùng chọn nhóm
5. Người dùng click "Lưu"
6. `addCalendarEvent({ title, start, end, type, scope, groupId, createdBy, creatorName })` được gọi
7. `addDoc` lưu vào Firestore; `start` và `end` được convert sang `Timestamp`
8. `subscribeToEvents` onSnapshot kích hoạt → Lịch tự cập nhật

**Luồng thay thế:**

| Bước | Tình huống | Xử lý |
|------|-----------|-------|
| 3 | Thiếu tiêu đề hoặc ngày giờ | Hiển thị lỗi validation; không cho submit |
| 3 | Thời gian kết thúc < thời gian bắt đầu | Hiển thị cảnh báo |
| 4 | scope = "group" nhưng không chọn nhóm | Validation bắt buộc chọn nhóm |

---

### UC-CAL-02: Lọc sự kiện theo phạm vi

| | |
|---|---|
| **ID** | UC-CAL-02 |
| **Tên** | Lọc hiển thị sự kiện theo phạm vi và loại |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Đã đăng nhập; đang ở trang `/calendar`; có sự kiện trong hệ thống |
| **Hậu điều kiện** | Chỉ hiển thị sự kiện phù hợp với bộ lọc đang chọn |

**Luồng chính:**
1. Người dùng chọn bộ lọc trên `MiniCalendar` sidebar (loại hoặc scope)
2. Client lọc danh sách sự kiện bằng `useMemo`:
   - `company`: Hiển thị cho tất cả
   - `group`: Hiển thị nếu user là thành viên nhóm đó hoặc admin
   - `personal`: Chỉ hiển thị nếu `createdBy === uid`
3. Lịch re-render với danh sách đã lọc

---

### UC-CAL-03: Xóa sự kiện

| | |
|---|---|
| **ID** | UC-CAL-03 |
| **Tên** | Xóa sự kiện khỏi lịch |
| **Actor** | Người tạo sự kiện, Admin |
| **Tiền điều kiện** | Người dùng là người tạo sự kiện hoặc admin |
| **Hậu điều kiện** | Sự kiện bị xóa khỏi Firestore và biến mất khỏi lịch của tất cả người dùng |

**Luồng chính:**
1. Người dùng click vào sự kiện → `EventDetailModal` hiển thị
2. Nút "Xóa" chỉ hiển thị nếu `createdBy === uid || isAdmin`
3. Người dùng click "Xóa" → Dialog xác nhận xuất hiện
4. Người dùng xác nhận → `deleteCalendarEvent(id)` được gọi
5. `deleteDoc` xóa document khỏi Firestore
6. onSnapshot kích hoạt → Lịch tự cập nhật, sự kiện biến mất

---

## 6. Module Kho Tri thức (Knowledge Base)

---

### UC-KB-01: Tạo bài viết mới

| | |
|---|---|
| **ID** | UC-KB-01 |
| **Tên** | Tạo bài viết mới trong Knowledge Base |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Đã đăng nhập; ở trang `/knowledge/new` |
| **Hậu điều kiện** | Bài viết được lưu vào collection `articles`; hiển thị trong danh sách theo phân quyền |

**Luồng chính:**
1. Người dùng điền form: tiêu đề, tóm tắt, nội dung (Markdown), danh mục, thẻ tag
2. Người dùng chọn phạm vi: `all` (toàn công ty) / `group` / `admin`
3. Nếu scope = "group": Chọn nhóm được phép xem (`allowedGroups`)
4. Người dùng click "Đăng bài"
5. `createArticle({ title, content, summary, category, tags, scope, allowedGroups, createdBy, authorName })` được gọi
6. `addDoc` lưu vào Firestore với `views: 0, likes: []`
7. Người dùng được điều hướng về `/knowledge`

**Luồng thay thế:**

| Bước | Tình huống | Xử lý |
|------|-----------|-------|
| 1 | Thiếu tiêu đề hoặc nội dung | Validation fail → hiển thị lỗi |
| 2 | scope = "admin" nhưng user không phải admin | Tùy chọn "admin" bị ẩn hoặc disabled với member |

---

### UC-KB-02: Đọc bài viết

| | |
|---|---|
| **ID** | UC-KB-02 |
| **Tên** | Xem chi tiết bài viết |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Đã đăng nhập; có quyền xem bài viết đó |
| **Hậu điều kiện** | `views` của bài viết tăng lên 1 |

**Luồng chính:**
1. Người dùng click vào thẻ bài viết trong danh sách `/knowledge`
2. Client điều hướng đến `/knowledge/{articleId}`
3. Server load bài viết bằng `getArticle(articleId)`
4. `incrementViews(articleId)` được gọi — `views += 1`
5. Nội dung Markdown được render bằng `react-markdown` + `remark-gfm`
6. Danh sách bình luận được load bằng `getComments(articleId)`

**Luồng thay thế:**

| Bước | Tình huống | Xử lý |
|------|-----------|-------|
| 3 | Bài viết không tồn tại | Hiển thị trang 404 |
| 3 | Người dùng không có quyền xem (scope mismatch) | Redirect hoặc hiển thị "403 - Không có quyền truy cập" |

---

### UC-KB-03: Xóa bài viết (kèm cleanup ảnh)

| | |
|---|---|
| **ID** | UC-KB-03 |
| **Tên** | Xóa bài viết và dọn dẹp ảnh Cloudinary |
| **Actor** | Người tạo bài viết, Admin |
| **Tiền điều kiện** | Người dùng là người tạo hoặc admin |
| **Hậu điều kiện** | Document bị xóa khỏi Firestore; ảnh nhúng trong nội dung bị xóa khỏi Cloudinary |

**Luồng chính:**
1. Admin/Author click "Xóa" trên bài viết
2. `deleteArticle(articleId)` được gọi
3. Hệ thống quét nội dung Markdown tìm URL Cloudinary bằng regex
4. Với mỗi URL Cloudinary tìm thấy: gọi `deleteImageByUrl(url)` để xóa khỏi Cloudinary
5. `deleteDoc` xóa document khỏi Firestore
6. Bài viết biến mất khỏi danh sách

---

## 7. Module Thư mục Nhân sự (People Directory)

---

### UC-PPL-01: Xem và lọc danh sách thành viên

| | |
|---|---|
| **ID** | UC-PPL-01 |
| **Tên** | Xem và tìm kiếm thành viên |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Đã đăng nhập |
| **Hậu điều kiện** | Hiển thị danh sách thành viên phù hợp với tiêu chí lọc |

**Luồng chính:**
1. Người dùng truy cập `/people`
2. Server load `getAllUsers()` và `getAllGroups()`
3. Bản thân người dùng được tự động loại khỏi danh sách hiển thị
4. Người dùng gõ vào ô tìm kiếm → `useMemo` lọc theo `displayName` hoặc `email`
5. Người dùng click bộ lọc nhóm → lọc theo `groupId`
6. Kết quả hiển thị dưới dạng grid card với avatar, tên, role

---

### UC-PPL-02: Xem hồ sơ thành viên và bắt đầu DM

| | |
|---|---|
| **ID** | UC-PPL-02 |
| **Tên** | Mở hồ sơ thành viên và nhắn tin |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Đang ở trang `/people`; người được xem là thành viên khác |
| **Hậu điều kiện** | Modal hồ sơ hiển thị; nếu click DM → điều hướng vào kênh DM |

**Luồng chính:**
1. Người dùng click vào thẻ thành viên
2. Modal hiển thị: avatar, tên, email, bio, nhóm, role
3. Người dùng click "Nhắn tin"
4. `ensureDirectChannel(currentUser, targetUser)` được gọi (xem UC-CHAT-03)
5. Điều hướng đến `/chat/{dmChannelId}`

---

## 8. Module Quản trị (Admin Dashboard)

---

### UC-ADM-01: Quản lý thành viên

| | |
|---|---|
| **ID** | UC-ADM-01 |
| **Tên** | Admin thay đổi role thành viên |
| **Actor** | Admin |
| **Tiền điều kiện** | Đã đăng nhập với role = "admin"; ở trang `/dashboard/members` |
| **Hậu điều kiện** | `users/{uid}.role` được cập nhật; quyền truy cập của thành viên thay đổi |

**Luồng chính:**
1. Admin xem danh sách thành viên
2. Admin click dropdown role bên cạnh thành viên → chọn "admin" hoặc "member"
3. `updateUserRole(uid, newRole)` được gọi
4. `updateDoc` cập nhật `role` trong Firestore
5. Thay đổi có hiệu lực ở lần request tiếp theo của thành viên đó

---

### UC-ADM-02: Quản lý nhóm (Groups)

| | |
|---|---|
| **ID** | UC-ADM-02 |
| **Tên** | Admin tạo và quản lý nhóm |
| **Actor** | Admin |
| **Tiền điều kiện** | Đã đăng nhập với role = "admin"; ở trang `/dashboard/members` |
| **Hậu điều kiện** | Nhóm được tạo/sửa/xóa; phân quyền nội dung theo nhóm có hiệu lực |

**Luồng tạo nhóm:**
1. Admin click "Tạo nhóm"
2. Điền tên và mô tả nhóm
3. `createGroup(name, description, creatorUid)` được gọi
4. `addDoc` tạo document trong collection `groups` với `members: []`
5. Admin thêm thành viên bằng `addMemberToGroup(groupId, uid)` → `arrayUnion(uid)`

**Luồng xóa nhóm:**
1. Admin click "Xóa nhóm"
2. Dialog xác nhận xuất hiện
3. Admin xác nhận → `deleteGroup(groupId)` → `deleteDoc`
4. Nhóm bị xóa; nội dung có `allowedGroups` chứa groupId vẫn tồn tại nhưng không ai ngoài admin xem được

---

## 9. Module Hồ sơ Cá nhân (Profile)

---

### UC-PRF-01: Cập nhật hồ sơ và ảnh đại diện

| | |
|---|---|
| **ID** | UC-PRF-01 |
| **Tên** | Chỉnh sửa hồ sơ cá nhân và upload avatar |
| **Actor** | Member, Admin |
| **Tiền điều kiện** | Đã đăng nhập; ở trang `/profile` |
| **Hậu điều kiện** | `users/{uid}` trong Firestore và Firebase Auth profile được cập nhật; ảnh mới hiển thị ngay |

**Luồng chính (cập nhật thông tin):**
1. Người dùng chỉnh sửa tên hoặc bio trên form
2. Click "Lưu"
3. `updateUserProfile(uid, { displayName, bio })` được gọi
4. `updateDoc` cập nhật Firestore; `updateProfile(authUser)` cập nhật Firebase Auth
5. `AuthProvider` nhận update → UI cập nhật tên trên toàn app

**Luồng upload avatar:**
1. Người dùng chọn ảnh từ máy tính
2. Client kiểm tra file size ≤ 2MB; nếu vượt → hiển thị lỗi và dừng
3. `uploadAvatar(userId, file)` gọi Cloudinary API
4. Form data: `{ file, upload_preset: "porocia", folder: "porocia/avatars/{uid}" }`
5. Cloudinary trả về `secure_url`
6. `updateUserProfile(uid, { photoURL: secure_url })` cập nhật Firestore + Auth
7. Avatar mới hiển thị ngay lập tức trên trang profile và toàn app

**Luồng thay thế:**

| Bước | Tình huống | Xử lý |
|------|-----------|-------|
| 2 | File ảnh > 2MB | Hiển thị lỗi "Ảnh quá lớn (tối đa 2MB)"; không upload |
| 3 | Upload Cloudinary thất bại (network/config error) | Toast lỗi; `photoURL` không thay đổi |

---

## 10. Ma trận Actor — Use Case

| Use Case | Member | Admin | System |
|----------|:------:|:-----:|:------:|
| UC-AUTH-01: Đăng nhập | ✅ | ✅ | |
| UC-AUTH-02: Đăng xuất | ✅ | ✅ | |
| UC-CHAT-01: Gửi tin nhắn | ✅ | ✅ | |
| UC-CHAT-02: Đọc & đánh dấu đã đọc | ✅ | ✅ | ✅ |
| UC-CHAT-03: DM | ✅ | ✅ | |
| UC-CHAT-04: Reply tin nhắn | ✅ | ✅ | |
| UC-CHAT-05: Reaction | ✅ | ✅ | |
| UC-ANN-01: Đăng thông báo | | ✅ | |
| UC-ANN-02: Ghim/bỏ ghim | | ✅ | |
| UC-ANN-03: Bình luận thông báo | ✅ | ✅ | |
| UC-CAL-01: Tạo sự kiện | ✅ | ✅ | |
| UC-CAL-02: Lọc sự kiện | ✅ | ✅ | |
| UC-CAL-03: Xóa sự kiện | ✅ (chỉ của mình) | ✅ | |
| UC-KB-01: Tạo bài viết | ✅ | ✅ | |
| UC-KB-02: Đọc bài viết | ✅ | ✅ | |
| UC-KB-03: Xóa bài viết (+ cleanup) | ✅ (chỉ của mình) | ✅ | |
| UC-PPL-01: Xem thư mục nhân sự | ✅ | ✅ | |
| UC-PPL-02: Xem hồ sơ + DM | ✅ | ✅ | |
| UC-ADM-01: Quản lý role thành viên | | ✅ | |
| UC-ADM-02: Quản lý nhóm | | ✅ | |
| UC-PRF-01: Cập nhật hồ sơ | ✅ | ✅ | |

---

*Tài liệu Use Case Specifications được viết dựa trên phân tích codebase thực tế của Porocia v0.1.0.*

*最終更新: 2026年05月29日*
