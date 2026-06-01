# Sơ đồ Luồng Nghiệp vụ / Hệ thống (Porocia Portal)

Tài liệu này tổng hợp toàn bộ các luồng nghiệp vụ và luồng xử lý dữ liệu cốt lõi của hệ thống **Porocia**. Bạn có thể sao chép trực tiếp mã **Mermaid** của từng sơ đồ dưới đây để dán vào **Draw.io** (chức năng **`+` (Insert) -> Advanced -> Mermaid...**) để tạo ra các sơ đồ tuần tự (Sequence Diagrams) có thể chỉnh sửa giao diện.

---

## 1. Luồng Xác thực & Cấp phát Session Cookie (Auth & Session Cookie Flow)
Mô tả quy trình đăng nhập phía Client, sinh mã Token, gọi Server Action để tạo HTTP-only Session Cookie và cơ chế kiểm soát Route của Middleware/Server Guard.

```mermaid
sequenceDiagram
    autonumber
    actor User as Nhân viên (User)
    participant Client as Web App (Client/Browser)
    participant FB_Auth as Firebase Auth (Client SDK)
    participant ServerAction as Server Action (Next.js Server)
    participant FB_Admin as Firebase Admin SDK (Server)
    participant Store as Next.js Cookie Store
    participant Proxy as Proxy/Middleware (Server)

    Note over User, Client: PHẦN 1: ĐĂNG NHẬP & CẤP PHÁT SESSION COOKIE (HTTP-ONLY)
    User->>Client: Nhập Email/Password & click Đăng nhập
    Client->>FB_Auth: signInWithEmailAndPassword()
    FB_Auth-->>Client: Xác thực thành công (Trả về Auth User)
    Client->>FB_Auth: authUser.getIdToken()
    FB_Auth-->>Client: Trả về ID Token (Client-side)
    
    Client->>ServerAction: Gọi createSessionCookieAction(idToken)
    ServerAction->>FB_Admin: adminAuth.createSessionCookie(idToken, { expiresIn: 5 ngày })
    FB_Admin-->>ServerAction: Tạo thành công Session Cookie dạng mã hóa
    ServerAction->>Store: cookieStore.set("__session", sessionCookie, { httpOnly: true, secure: true })
    Store-->>Client: Trình duyệt lưu cookie __session bảo mật
    Client-->>User: Điều hướng vào trang Dashboard (/)

    Note over User, Proxy: PHẦN 2: TRUY CẬP TRANG & KIỂM TRA COOKIE TRÊN SERVER
    User->>Proxy: Yêu cầu truy cập trang Protected (/) hoặc trang Admin (/admin)
    Proxy->>Store: Lấy giá trị cookie '__session'
    alt Trường hợp 1: Không có Cookie '__session'
        Proxy-->>User: Chặn lập tức (0ms) & Redirect về màn /login
    else Trường hợp 2: Có Cookie '__session'
        Proxy->>FB_Admin: adminAuth.verifySessionCookie(sessionCookie, checkRevoked: true)
        alt Cookie đã hết hạn hoặc bị thu hồi
            FB_Admin-->>Proxy: Trả về lỗi xác thực
            Proxy-->>User: Xóa cookie cũ & Redirect về màn /login
        else Cookie hợp lệ
            FB_Admin-->>Proxy: Trả về Decoded ID Token (Chứa UID & Role)
            Proxy-->>User: Cho phép tải trang & hiển thị giao diện tương ứng
        end
    end
```

---

## 2. Luồng Gửi Tin nhắn & Cập nhật số Tin nhắn chưa đọc (Message Sending & Unread Flow)
Mô tả quy trình gửi tin nhắn, cập nhật danh sách thành viên kênh và tự động tăng số lượng tin nhắn chưa đọc của đối phương bằng một transaction/Batch ghi nguyên tử (Atomic).

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Người gửi (User A)
    participant UI as Chat UI (ChatInput/ChatPanel)
    participant SDK as Firestore Client SDK
    participant Batch as Firestore WriteBatch
    participant Firestore as Cloud Firestore
    participant UserB as Người nhận (User B)

    UserA->>UI: Nhập tin nhắn & nhấn "Gửi"
    UI->>UI: Loại bỏ khoảng trắng (Trim), kiểm tra rỗng
    
    UI->>SDK: Gọi hàm sendMessage(channelId, text, replyTo, ...)
    SDK->>Firestore: Lấy danh sách thành viên hiện tại của kênh (members)
    Firestore-->>SDK: Trả về danh sách members (Ví dụ: [User A, User B])
    
    SDK->>Batch: Khởi tạo db.writeBatch()
    
    Note over SDK, Batch: 1. Tạo tài liệu tin nhắn mới:<br/>channels/{id}/messages/{msgId}
    SDK->>Batch: batch.set(MsgDoc, { text, readBy: [UserA], readAt: { UserA: now } })
    
    Note over SDK, Batch: 2. Thêm User A vào thành viên kênh (nếu chưa có)
    SDK->>Batch: batch.update(ChannelDoc, { members: arrayUnion(UserA) })
    
    Note over SDK, Batch: 3. Tăng unreadCount của User B thêm 1
    SDK->>Batch: batch.update(ChannelDoc, { unreadCount.UserB: increment(1) })
    
    SDK->>Batch: Thực thi batch.commit()
    Batch->>Firestore: Ghi đồng thời dữ liệu (Atomic Write)
    
    Note over Firestore: Trực tiếp đẩy cập nhật qua Listener (onSnapshot)
    Firestore-->>UI: Cập nhật tin nhắn phía User A (Render bóng chat mới)
    Firestore-->>UserB: Đẩy tin nhắn mới đến màn hình User B qua useChat()
    
    alt Trường hợp 1: User B đang mở sẵn cuộc trò chuyện này
        Note over UserB: Tự động kích hoạt markChannelAsRead()
        UserB->>Firestore: Cập nhật readBy += User B & reset unreadCount.UserB = 0
    else Trường hợp 2: User B đang ở màn hình khác hoặc offline
        Note over UserB: Hiển thị chấm đỏ/số lượng tin nhắn chưa đọc (>0) ở danh sách kênh
    end
```

---

## 3. Luồng Tải ảnh trực tiếp lên Cloudinary từ Wiki (Wiki Image Upload Flow)
Mô tả quá trình tải tệp ảnh từ Client lên Cloudinary bằng Unsigned Preset và chèn Token Markdown vào vị trí con trỏ của trình soạn thảo kèm các thông báo Toast.

```mermaid
sequenceDiagram
    autonumber
    actor User as Tác giả (User)
    participant UI as Wiki Editor UI
    participant Input as Input File (hidden)
    participant Cloudinary as Cloudinary API
    
    User->>UI: Click nút "画像を追加" (Thêm ảnh)
    UI->>Input: Trigger click() chọn ảnh từ thiết bị
    User->>Input: Chọn tệp ảnh (image.png)
    Input-->>UI: File selected
    UI->>UI: Hiển thị Toast Loading "画像をアップロード中..."
    UI->>Cloudinary: POST /image/upload (FormData: file + upload_preset="porocia")
    Cloudinary-->>UI: Trả về trạng thái 200 OK (chứa secure_url)
    UI->>UI: Chèn token Markdown `![image](secure_url)` vào vị trí con trỏ trong Textarea
    UI->>UI: Cập nhật Toast thành Success "画像のアップロードに成功しました"
    UI-->>User: Cập nhật nội dung editor và hiển thị hình ảnh trong Preview
```

---

## 4. Luồng Xóa bài viết & Dọn dẹp ảnh Cloudinary (Wiki Deletion Cleanup Flow)
Mô tả quá trình phân tích nội dung Markdown của bài viết Wiki trước khi xóa để tìm và dọn dẹp các tệp ảnh đính kèm đã lưu trên Cloudinary nhằm tối ưu hóa dung lượng.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client (User)
    participant UI as Wiki UI
    participant API as Knowledge API (deleteArticle)
    participant DB as Cloud Firestore
    participant Cloudinary as Cloudinary REST API

    Client->>UI: Click nút "Xóa bài viết"
    UI->>API: deleteArticle(articleId) được kích hoạt
    API->>DB: getDoc(doc(db, "articles", articleId))
    DB-->>API: Trả về nội dung tài liệu (Markdown text)
    
    Note over API: Quét tìm ảnh Cloudinary bằng Regex:<br>/!\[.*?\]\((https?:\/\/res\.cloudinary\.com\/[^)]+)\)/g
    
    alt Tìm thấy các link ảnh Cloudinary phù hợp
        loop Đối với từng ảnh tìm thấy
            Note over API: Phân tách URL lấy public_id
            API->>Cloudinary: POST /image/destroy (Signed request kèm API Key & Secret)
            Cloudinary-->>API: Trả về trạng thái xóa (success / failed)
        end
    end

    API->>DB: deleteDoc(doc(db, "articles", articleId))
    DB-->>UI: Xác nhận xóa bài viết thành công
    UI-->>Client: Thông báo và chuyển hướng về trang /knowledge
```

---

## 5. Luồng Tạo sự kiện Lịch & Bộ lọc Phạm vi hiển thị (Calendar Event Visibility Flow)
Mô tả quy trình tạo sự kiện lịch với các Scope khác nhau và cơ chế lọc hiển thị an toàn ở tầng Client để đảm bảo thông tin cá nhân/nhóm được bảo mật.

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng (User)
    participant UI as Calendar UI
    participant SDK as Firestore SDK (Client)
    participant DB as Cloud Firestore (events)
    
    Note over User, UI: PHẦN 1: TẠO SỰ KIỆN LỊCH
    User->>UI: Soạn sự kiện & chọn Scope (company / group / personal)
    UI->>SDK: Gọi addCalendarEvent(eventData)
    SDK->>DB: addDoc(collection(db, "events"), event)
    DB-->>UI: Trả về Event ID mới
    
    Note over User, UI: PHẦN 2: TẢI & LỌC HIỂN THỊ LỊCH
    User->>UI: Mở trang Lịch biểu (/calendar)
    UI->>SDK: Đăng ký lắng nghe subscribeToEvents()
    SDK->>DB: Lắng nghe real-time qua onSnapshot()
    DB-->>SDK: Trả về danh sách toàn bộ events
    
    Note over SDK, UI: Áp dụng bộ lọc bảo mật trên Client
    loop Với mỗi Event
        alt event.scope == 'company'
            SDK->>UI: Cho phép hiển thị (Ai cũng thấy)
        else event.scope == 'group'
            alt User là thành viên của Group đó hoặc là Admin
                SDK->>UI: Cho phép hiển thị
            else User KHÔNG thuộc Group đó
                SDK->>UI: Lọc bỏ sự kiện
            end
        else event.scope == 'personal'
            alt event.createdBy == user.uid (Chính chủ)
                SDK->>UI: Cho phép hiển thị
            else
                SDK->>UI: Lọc bỏ sự kiện (Riêng tư tuyệt đối)
            end
        end
    end
    UI-->>User: Render các sự kiện hợp lệ lên lưới Lịch
```

---

## 6. Luồng Đồng bộ Thông báo & Lịch biểu (Announcement & Calendar Event Sync Flow)
Mô tả quy trình liên kết đồng bộ giữa việc tạo bài thông báo (Announcement) và tạo sự kiện trên lịch biểu (Calendar Event), bao gồm cả cơ chế cập nhật và xóa chéo.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản trị viên (Admin)
    participant UI as Announcement Page
    participant Action as Firestore API (announcements)
    participant DB as Cloud Firestore (announcements & events)
    
    Admin->>UI: Soạn thông báo & tick chọn "Đồng bộ lên lịch biểu"
    UI->>Action: Gọi createAnnouncement()
    
    Note over Action, DB: Bước 1: Ghi thông tin sự kiện vào collection 'events'
    Action->>DB: addDoc(collection(db, "events"), eventData)
    DB-->>Action: Trả về calendarEventId
    
    Note over Action, DB: Bước 2: Ghi thông báo và lưu calendarEventId liên kết
    Action->>DB: addDoc(collection(db, "announcements"), { ..., calendarEventId })
    DB-->>UI: Đăng thông báo thành công
    UI-->>Admin: Hiển thị thông báo trên Bảng tin & Lịch biểu đồng bộ

    Note over Admin, DB: KHI XÓA HOẶC SỬA THÔNG BÁO
    Admin->>UI: Click "Xóa thông báo"
    UI->>Action: Gọi deleteAnnouncement(announcementId)
    Action->>DB: Lấy tài liệu thông báo để đọc calendarEventId
    DB-->>Action: Trả về calendarEventId
    Action->>DB: deleteDoc(events/{calendarEventId}) (Xóa sự kiện trên lịch)
    Action->>DB: deleteDoc(announcements/{announcementId}) (Xóa thông báo)
    DB-->>UI: Hoàn tất xóa chéo
    UI-->>Admin: Cập nhật Bảng tin và Lịch biểu đồng bộ
```

---

## 7. Luồng Thiết lập Kênh nhắn tin trực tiếp 1-1 (Direct Messaging 1-1 Provisioning Flow)
Mô tả luồng kiểm tra và tự động khởi tạo phòng chat 1-1 (DM) giữa hai nhân viên khi thực hiện truy cập từ trang cá nhân hoặc danh bạ.

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Người dùng A
    participant UI as People Directory UI
    participant SDK as Firestore API (ensureDirectChannel)
    participant DB as Cloud Firestore (channels)
    
    UserA->>UI: Tra cứu & Click nút "Gửi tin nhắn" tại profile Người dùng B
    UI->>SDK: Gọi ensureDirectChannel(UserA, UserB)
    
    Note over SDK: Sắp xếp UID theo bảng chữ cái để tạo ID kênh duy nhất:<br/>channelId = "dm_" + sort(uidA, uidB)
    
    SDK->>DB: getDoc(channels/{channelId}) để kiểm tra sự tồn tại
    
    alt Kênh DM chưa tồn tại (Chat lần đầu)
        SDK->>DB: setDoc(channels/{channelId}, { type: "dm", members: [uidA, uidB] })
        DB-->>SDK: Khởi tạo kênh thành công
    else Kênh DM đã tồn tại từ trước
        DB-->>SDK: Trả về thông tin kênh hiện tại
    end
    
    SDK-->>UI: Trả về channelId
    UI->>UI: Chuyển hướng route: router.push('/chat?channelId=' + channelId)
    UI-->>UserA: Mở giao diện chat 1-1 với Người dùng B
```

---
*Tài liệu luồng hệ thống được cập nhật vào ngày 2026-06-01*
