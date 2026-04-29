@AGENTS.md

# Porocia Development Guide

## 1. Technology Stack
- **Framework:** Next.js 16.2.4 (App Router)
- **UI Library:** React 19, shadcn/ui, @base-ui/react, lucide-react
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) with custom CSS variables in `globals.css`
- **Backend & Database:** Firebase v12 (Client SDK) & Firebase Admin SDK v13 (Server-side)
- **Forms & Validation:** react-hook-form + zod

## 2. Design System & Aesthetics (Claude-Inspired)
The project strictly follows a custom, warm-toned design system inspired by Anthropic's Claude. **Refer to `DESIGN.md` for complete guidelines.**
- **Canvas:** Warm parchment (`#f5f4ed`) and Ivory (`#faf9f5`) — no pure white backgrounds.
- **Typography:** `Anthropic Serif` for headlines (weight 500 only), `Anthropic Sans` for UI, `Anthropic Mono` for code.
- **Brand Colors:** Terracotta (`#c96442`), Anthropic Near Black (`#141413`).
- **Neutrals:** Exclusively warm-toned (e.g., Olive Gray `#5e5d59`, Stone Gray `#87867f`). **No cool blue-grays.**
- **Depth & Shadows:** Use warm ring shadows (`0px 0px 0px 1px`) for borders/depth. Avoid heavy drop shadows.

## 3. Architecture & Key Modules
### Project Structure
```text
src/
├── app/
│   ├── (root)/
│   │   ├── chat/
│   │   └── layout.tsx
│   └── api/auth/session/
├── components/
│   ├── chat/
│   └── auth-provider.tsx
├── lib/
│   └── firebase/
│       ├── client.ts
│       ├── server.ts
│       ├── auth.ts
│       └── chat.ts
└── hooks/
    ├── use-chat.ts
    └── use-channels.ts
```

### Authentication Flow (Robust Server-Side Sessions)
- **Strategy:** Combines Firebase Client Auth with Secure Server-Side Cookies.
- **Implementation:** 
  - User signs in via Client SDK (`src/lib/firebase/auth.ts`).
  - Next.js API Route (`/api/auth/session`) generates an HTTP-only Session Cookie using Firebase Admin SDK.
  - Route Protection is handled strictly on the server via Layouts/Middleware (`src/app/(root)/layout.tsx`) using `adminAuth.verifySessionCookie`.
- **Profile Synchronization:** User data is synced to the Firestore `users` collection upon login. The `AuthProvider` (`src/components/auth-provider.tsx`) uses `onSnapshot` to provide real-time profile updates across the application without reloading.

### Chat Module Architecture
- **Structure:** App Router layout-based design (`src/app/(root)/chat/layout.tsx`) with a persistent `Sidebar`.
- **Data Fetching:** Handled via custom hooks (`use-chat.ts`, `use-channels.ts`) that interface with Firestore.
- **Features:** Real-time messaging using `onSnapshot`, infinite scrolling/pagination (`getOlderMessages`), and channel management.
- **Components:** Logic is modularized into `ChatPanel`, `ChatInput`, `ChatBubble`, and `Sidebar` under `src/components/chat/`.

### Firebase Configuration
- **Schema:** Refer to `DB_SCHEMA.md` for the complete Firestore database schema.
- **Client:** `src/lib/firebase/client.ts` (Uses `experimentalForceLongPolling` for stability).
- **Admin:** `src/lib/firebase/server.ts` (Server-only operations).
- **Helper Modules:** `auth.ts` and `chat.ts` contain abstracted Firestore and Auth operations.

## 4. Coding Conventions
- **App Router:** Adhere strictly to Next.js App Router paradigms (Server Components by default).
- **Client Components:** Use `"use client"` directive at the very top of the file only when using React hooks (useState, useEffect, context) or DOM event listeners.
- **Environment Variables:** Use `NEXT_PUBLIC_` for client-side Firebase keys. Keep Admin private keys secure on the server.
- **Styling:** Use Tailwind CSS utility classes and `cn()` from `src/lib/utils.ts` for conditional class merging. Leverage custom CSS variables defined in `globals.css` (e.g., `bg-[--color-terracotta]`).
