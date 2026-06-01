# Yêu cầu UI/UX (UI/UX Requirements)
**Dự án**: Porocia — Nền tảng Giao tiếp Nội bộ Doanh nghiệp
**Phiên bản tài liệu**: 1.0
**Ngày cập nhật**: 2026-05-29
**Trạng thái**: Draft

> Tài liệu này mô tả hệ thống thiết kế (Design System) và các yêu cầu trải nghiệm người dùng cho Porocia, dựa trực tiếp vào `DESIGN.md` và codebase `globals.css`.

---

## 1. Triết lý Thiết kế (Design Philosophy)

Porocia theo đuổi ngôn ngữ thiết kế **"Warm & Literary"** lấy cảm hứng từ giao diện của Anthropic Claude. Giao diện không cố tạo cảm giác lạnh lẽo, hiện đại kiểu tech — mà cố tình truyền tải sự **ấm áp, đáng tin cậy, và đặt con người làm trung tâm**, phù hợp với văn hóa làm việc Nhật Bản.

### 1.1 Ba Nguyên tắc Cốt lõi

| Nguyên tắc | Mô tả |
|-----------|-------|
| **Warmth First** | Mọi màu sắc đều có undertone vàng-nâu ấm; không dùng màu gray lạnh (cool blue-gray) |
| **Editorial Rhythm** | Khoảng cách rộng rãi, typography serif tạo nhịp đọc như đọc tạp chí cao cấp |
| **Depth via Rings** | Chiều sâu thể hiện qua ring shadow (`0px 0px 0px 1px`), không dùng drop shadow nặng |

---

## 2. Hệ thống Màu sắc (Color System)

### 2.1 CSS Custom Properties (từ `globals.css`)

```css
:root {
  /* Core Palette */
  --parchment:   #f5f4ed;   /* Nền trang chính — warm cream */
  --ivory:       #faf9f5;   /* Card/container nâng cao */
  --near-black:  #141413;   /* Text chính và nền dark */
  --dark-warm:   #3d3d3a;   /* Text đậm phụ */
  --olive-gray:  #5e5d59;   /* Text phụ */
  --stone-gray:  #87867f;   /* Text mờ, metadata */
  --warm-sand:   #e8e6dc;   /* Nền button secondary, input */
  --border-cream:#f0eee6;   /* Border nhẹ */
  --border-warm: #e8e6dc;   /* Border rõ hơn */
  --terracotta:  #c96442;   /* Brand accent — CTA chính */
  --warm-silver: #b0aea5;   /* Text trên nền tối */
}
```

### 2.2 Bảng Sử dụng Màu

| Màu | Hex | Sử dụng |
|-----|-----|---------|
| **Parchment** | `#f5f4ed` | Nền trang chính (`--background`) |
| **Ivory** | `#faf9f5` | Nền card, popover, sidebar (`--card`) |
| **Near Black** | `#141413` | Text tiêu đề, icon chính (`--foreground`) |
| **Olive Gray** | `#5e5d59` | Text body phụ (`--muted-foreground`) |
| **Stone Gray** | `#87867f` | Metadata, placeholder |
| **Warm Sand** | `#e8e6dc` | Button secondary, input border (`--secondary`) |
| **Terracotta** | `#c96442` | Button CTA, link active, badge (`--primary`) |
| **Border Cream** | `#f0eee6` | Border card nhẹ (`--border`) |
| **Destructive** | `#b53333` | Trạng thái lỗi, nút xóa (`--destructive`) |
| **Focus Blue** | `#3898ec` | Focus ring input (accessibility) (`--ring`) |

### 2.3 Dark Mode

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `#f5f4ed` | `#141413` |
| `--foreground` | `#141413` | `#faf9f5` |
| `--card` | `#faf9f5` | `#22221f` |
| `--border` | `#f0eee6` | `#30302e` |
| `--muted-foreground` | `#5e5d59` | `#b0aea5` |
| `--primary` | `#c96442` | `#faf9f5` |

### 2.4 Quy tắc Màu sắc Bắt buộc

- ✅ **Luôn dùng** undertone ấm cho mọi màu gray
- ✅ **Terracotta** chỉ dùng cho CTA quan trọng nhất và brand moment
- ❌ **Không dùng** cool blue-gray bất kỳ đâu (ngoại trừ focus ring accessibility)
- ❌ **Không dùng** màu bão hoà cao ngoài Terracotta

---

## 3. Typography System

### 3.1 Font Family

| Vai trò | Font | Fallback |
|---------|------|---------|
| **Heading (h1–h6)** | `var(--font-heading)` (Anthropic Sans / hệ thống) | `Georgia, serif` |
| **Body / UI** | Font Sans hệ thống | `system-ui, Arial` |
| **Serif accent** | `var(--font-noto-serif-jp)` | `Georgia` |
| **Code** | Monospace | `monospace` |

> **Lưu ý**: Theo `globals.css`, heading dùng `var(--font-heading)` với `letter-spacing: -0.02em` — tạo nét serif thu gọn phù hợp UI.

### 3.2 Typography Scale

| Role | Size | Weight | Line Height | Ghi chú |
|------|------|--------|------------|---------|
| Display / Hero | 4rem (64px) | 500 | 1.10 | Trang chủ hero |
| Section Heading (h1) | 3.25rem (52px) | 500 | 1.20 | Tiêu đề section lớn |
| Page Title (h2) | 2rem (32px) | 500 | 1.10 | Tiêu đề trang |
| Sub-heading (h3) | 1.6rem (25.6px) | 500 | 1.20 | Tiêu đề card, nhóm |
| Feature Title (h4) | 1.3rem (20.8px) | 500 | 1.20 | Tiêu đề tính năng |
| Body Large | 1.25rem (20px) | 400 | 1.60 | Mô tả intro |
| Body Standard | 1rem (16px) | 400–500 | 1.60 | Nội dung chat, bài viết |
| Body Small | 0.94rem (15px) | 400 | 1.60 | Text phụ compact |
| Caption | 0.88rem (14px) | 400 | 1.43 | Timestamp, metadata |
| Label | 0.75rem (12px) | 400–500 | 1.60 | Badge, tag, nhãn nhỏ |

### 3.3 Nguyên tắc Typography

- **Serif heading** — tạo trọng lực và uy quyền như tiêu đề sách
- **Line-height 1.60** cho body — trải nghiệm đọc như tạp chí, không phải dashboard
- **letter-spacing: -0.02em** cho heading — thu gọn, hiện đại
- **Font weight 500** cho serif heading — KHÔNG dùng bold (700+) trên serif

---

## 4. Spacing & Layout System

### 4.1 Spacing Base Unit

- **Base**: `8px`
- **Scale**: `3px`, `4px`, `6px`, `8px`, `10px`, `12px`, `16px`, `20px`, `24px`, `30px`, `32px`

### 4.2 Border Radius Scale (từ `globals.css`)

```css
--radius: 0.875rem;  /* 14px — base radius */

--radius-sm:  calc(var(--radius) * 0.6)   /* ~8px  — button nhỏ */
--radius-md:  calc(var(--radius) * 0.85)  /* ~12px — input, card thường */
--radius-lg:  var(--radius)               /* 14px  — card chính */
--radius-xl:  calc(var(--radius) * 1.35)  /* ~19px — container lớn */
--radius-2xl: calc(var(--radius) * 1.8)   /* ~25px — modal */
--radius-3xl: calc(var(--radius) * 2.4)   /* ~34px — featured card */
--radius-4xl: calc(var(--radius) * 3)     /* 42px  — hero container */
```

### 4.3 Grid & Container

| Bố cục | Mô tả |
|--------|-------|
| **Max container** | ~1200px centered |
| **Chat layout** | Sidebar cố định (250–300px) + main area fill |
| **Dashboard layout** | Sidebar admin + main content area |
| **Card grid** | 2–3 cột trên desktop, 1 cột trên mobile |
| **Section padding** | `80–120px` top/bottom giữa các section lớn |

---

## 5. Shadow & Elevation System

### 5.1 Bảng Độ Nâng

| Level | CSS | Dùng cho |
|-------|-----|---------|
| **Flat (0)** | Không có shadow | Nền Parchment, text inline |
| **Contained (1)** | `1px solid #f0eee6` | Card thường, section border |
| **Ring (2)** | `0px 0px 0px 1px #d1cfc5` | Nút hover, card interactive |
| **Whisper (3)** | `rgba(0,0,0,0.05) 0px 4px 24px` | Card nổi bật, screenshot product |
| **Inset (4)** | `inset 0px 0px 0px 1px` | Nút đang được nhấn |

### 5.2 Quy tắc Shadow

- ✅ **Ring shadow** (`0px 0px 0px 1px`) cho interactive states
- ✅ **Whisper shadow** (`rgba(0,0,0,0.05)`) cho card elevated
- ❌ **Không dùng** drop shadow nặng (`box-shadow: 0 10px 30px rgba(0,0,0,0.3)`)

---

## 6. Component Specifications

### 6.1 Buttons

| Loại | Background | Text | Radius | Dùng khi |
|------|-----------|------|--------|---------|
| **Primary (Terracotta)** | `#c96442` | `#faf9f5` | 8–12px | CTA quan trọng nhất |
| **Secondary (Warm Sand)** | `#e8e6dc` | `#4d4c48` | 8px | Action phụ |
| **Ghost / Outline** | Transparent | `#141413` | 8px | Action ít quan trọng |
| **Destructive** | `#b53333` | `#faf9f5` | 8px | Xóa, hủy nguy hiểm |
| **Dark** | `#30302e` | `#faf9f5` | 8px | Trên nền tối |

**Padding chuẩn**: `0px 12px 0px 8px` (asymmetric icon-first) hoặc `8px 16px` (balanced)

### 6.2 Cards

- **Background**: `--ivory` (`#faf9f5`) trên nền Parchment
- **Border**: `1px solid var(--border-cream)` (`#f0eee6`)
- **Border-radius**: `--radius-lg` (14px) cho card thường; `--radius-2xl` cho card featured
- **Shadow**: Whisper `rgba(0,0,0,0.05) 0px 4px 24px`
- **Hover**: Ring shadow xuất hiện + subtle background shift

### 6.3 Input Fields & Forms

- **Background**: Transparent / `--warm-sand`
- **Border**: `1px solid var(--input)` (`#e8e6dc`)
- **Border-radius**: `--radius-md` (~12px)
- **Focus ring**: `3px solid #3898ec` (Focus Blue — màu cool DUY NHẤT cho accessibility)
- **Padding**: `8px 12px`
- **Placeholder**: `--stone-gray` (`#87867f`)

### 6.4 Navigation / Sidebar

- **Background Sidebar**: `--ivory` (`#faf9f5`)
- **Border**: `1px solid var(--border-cream)`
- **Active item**: Background `--warm-sand`, text `--near-black`, icon `--terracotta`
- **Badge count (unread)**: Background `--terracotta`, text `#fff`, size nhỏ tròn
- **Hover**: Text đậm hơn, không có gạch chân

### 6.5 Custom Scrollbar

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(135,134,127,0.2); border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background: rgba(135,134,127,0.4); }
```

### 6.6 Badges / Tags (Announcement Types)

| Loại | Màu nền gợi ý | Màu text | Dùng cho |
|------|-------------|---------|---------|
| `info` | `#e8e6dc` (warm sand) | `#5e5d59` | Thông tin thông thường |
| `warning` | `#fef3c7` (amber light) | `#92400e` | Cảnh báo |
| `success` | `#d1fae5` (green light) | `#065f46` | Thành công, hoàn thành |
| `event` | `#ede9fe` (purple light) | `#5b21b6` | Sự kiện, thông báo lịch |

---

## 7. Responsive Design Requirements

### 7.1 Breakpoints

| Tên | Chiều rộng | Thay đổi chính |
|-----|-----------|---------------|
| Mobile | < 640px | Layout 1 cột; sidebar thu gọn/ẩn; font scale nhỏ hơn |
| Tablet | 640–991px | 2 cột grid; nav condensed |
| Desktop | ≥ 992px | Full layout; sidebar cố định; grid 3 cột |

### 7.2 Yêu cầu Responsive theo Module

| Module | Mobile | Tablet | Desktop |
|--------|--------|--------|---------|
| **Homepage** | Stack sections dọc | 2 cột bento | 3 cột bento |
| **Chat** | Sidebar ẩn, chỉ xem kênh hiện tại | Sidebar thu nhỏ | Sidebar + chat panel |
| **Announcements** | 1 cột card | 2 cột card | 2–3 cột card |
| **Calendar** | Chế độ agenda mặc định | Month view thu gọn | Full month/week/day |
| **People** | 2 cột card nhỏ | 3 cột card | 4–5 cột card |
| **Knowledge Base** | 1 cột danh sách | 2 cột grid | 3 cột grid |
| **Dashboard** | Stacked sections | 2 cột | Sidebar admin + main |

### 7.3 Touch Targets

- **Minimum**: 44×44px cho mọi element interactive
- Button padding tối thiểu: `8px` dọc
- Card surface hoạt động như touch target lớn

---

## 8. Micro-animations & Interactions

### 8.1 Transitions Chuẩn

| Element | Property | Duration | Easing |
|---------|---------|---------|--------|
| Buttons hover | `background-color`, `box-shadow` | 150ms | `ease-in-out` |
| Links | `color` | 100ms | `ease` |
| Cards hover | `box-shadow`, `transform` | 200ms | `ease-out` |
| Sidebar items | `background-color` | 120ms | `ease` |
| Toast (Sonner) | `opacity`, `transform` | 200ms | `spring` |
| Modal open | `opacity`, `scale` | 200ms | `ease-out` |

### 8.2 Loading States

| State | Component | Hiển thị |
|-------|-----------|---------|
| **Loading bài viết** | Knowledge Base, Chat | Skeleton card với shimmer animation |
| **Upload ảnh** | Avatar, Announcement image | Progress indicator + spinner |
| **Gửi tin nhắn** | ChatInput | Optimistic UI — tin nhắn hiện ngay, confirm sau |
| **Submit form** | Mọi form | Nút submit disabled + loading spinner |

### 8.3 Feedback Notifications (Sonner Toast)

| Loại | Màu | Icon | Dùng khi |
|------|-----|------|---------|
| `success` | Green | ✓ | Lưu thành công, gửi thành công |
| `error` | `#b53333` | ✗ | Lỗi network, validation fail |
| `info` | Warm sand | ℹ | Thông tin trung tính |
| `warning` | Amber | ⚠ | Cảnh báo hành động |

---

## 9. Accessibility Requirements

| Yêu cầu | Chuẩn | Thực hiện |
|---------|-------|----------|
| **Color contrast** | WCAG 2.1 AA (4.5:1 text, 3:1 UI) | Near Black trên Parchment đạt ≥ 7:1 |
| **Focus indicator** | Visible focus ring | Focus Blue `#3898ec` ring trên mọi element interactive |
| **Keyboard navigation** | Tab, Enter, Escape | shadcn/ui + @base-ui/react hỗ trợ sẵn |
| **Screen reader** | ARIA labels | Semantic HTML5; ARIA roles trên icon-only buttons |
| **Touch target** | 44×44px minimum | Padding đủ lớn trên mobile |
| **Responsive font** | Không nhỏ hơn 14px | Caption minimum `0.88rem` |

---

## 10. Page-level UX Requirements

### 10.1 Trang Chủ (`/`)

- Hero section với welcome message và ảnh minh họa
- Bento layout hiển thị 3–5 thông báo mới nhất (Suspense boundary cho loading)
- Editorial quote section với typography serif ấn tượng
- Chuyển tiếp mượt mà giữa các section

### 10.2 Chat (`/chat/[channelId]`)

- Sidebar kênh cố định bên trái; scroll độc lập với main chat
- Tin nhắn mới nhất ở dưới cùng (auto-scroll khi có tin mới)
- Avatar + tên sender rõ ràng; timestamp ở góc nhỏ
- Bubble style: người gửi bên phải (khác màu), người khác bên trái
- Nút Reaction và Reply hiện khi hover, ẩn khi không hover (micro-interaction)
- Input chat đặt ở dưới cùng, sticky; Enter gửi; Shift+Enter xuống dòng

### 10.3 Announcements (`/announcements`)

- Thông báo ghim có visual indicator rõ ràng (icon ghim + border highlight)
- Badge màu sắc theo loại (info/warning/success/event) dễ phân biệt
- Ảnh thông báo full-width với max-height 600px
- Comments section collapsible ở cuối mỗi thông báo
- Anchor link tự động scroll đến đúng thông báo khi vào từ URL hash

### 10.4 Calendar (`/calendar`)

- Mini-calendar sidebar đồng bộ với main calendar
- Today được highlight rõ ràng trên cả 2 lịch
- Màu sự kiện theo loại type; scope được hiển thị qua badge nhỏ
- Khi quá nhiều sự kiện trong 1 ngày: "+N more" popup
- Modal tạo/xem sự kiện rõ ràng, có confirm dialog khi xóa

### 10.5 Knowledge Base (`/knowledge`)

- Ô tìm kiếm lớn ở trên cùng, search realtime
- Filter pills theo danh mục (horizontal scrollable trên mobile)
- Card bài viết: tiêu đề, tóm tắt, avatar tác giả, số view, thời gian đọc
- Trang đọc: typography tối ưu (max-width ~700px), line-height 1.6
- Markdown render đẹp: heading hierarchy, code block highlight, table

### 10.6 People Directory (`/people`)

- Grid card avatar tròn, tên, role badge
- Search realtime ngay khi gõ
- Modal xem hồ sơ có nút "Nhắn tin" nổi bật
- Loại bỏ bản thân khỏi danh sách (UX tốt)

---

## 11. Error States & Empty States

| Tình huống | UI hiển thị |
|-----------|------------|
| Danh sách rỗng (chưa có dữ liệu) | Illustration ấm + text hướng dẫn hành động tiếp theo |
| Lỗi mạng / Firestore | Toast lỗi + nút Retry |
| 403 Không có quyền | Page thân thiện: icon khóa + thông báo rõ ràng + nút về trang chủ |
| 404 Không tìm thấy | Page 404 với tone warm + link hữu ích |
| Form validation lỗi | Inline error message dưới field; border input đổi màu destructive |

---

## 12. Design Tokens Reference (CSS Variables)

```css
/* Dùng trong code: luôn ưu tiên CSS variables thay vì hardcode hex */

/* Backgrounds */
background: var(--background);     /* #f5f4ed — parchment */
background: var(--card);           /* #faf9f5 — ivory */

/* Text */
color: var(--foreground);          /* #141413 — near black */
color: var(--muted-foreground);    /* #5e5d59 — olive gray */

/* Brand */
background: var(--primary);        /* #c96442 — terracotta */
color: var(--primary-foreground);  /* #faf9f5 — ivory */

/* Border */
border-color: var(--border);       /* #f0eee6 — border cream */

/* Interactive */
outline-color: var(--ring);        /* #3898ec — focus blue */
```

---

*Tài liệu UI/UX Requirements được viết dựa trên `DESIGN.md`, `globals.css`, và phân tích component thực tế của Porocia v0.1.0.*

*最終更新: 2026年05月29日*
