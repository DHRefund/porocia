# Porocia Development Guide
See [AGENTS.md](file:///g:/porocia/porocia/AGENTS.md) for Next.js agent rules.
## 1. Technology Stack

- **Framework:** Next.js 16.2.4 (App Router)
- **UI Library:** React 19, shadcn/ui, @base-ui/react, lucide-react
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) with custom CSS variables defined in `globals.css`.
- **Backend & Database:** Firebase v12 (Client SDK) & Firebase Admin SDK v13 (Server-side)
- **Forms & Validation:** react-hook-form + Zod

## 2. Design System & Aesthetics (Claude‑Inspired)

The project follows a warm‑toned design system inspired by Anthropic's Claude. See `DESIGN.md` for full specifications.

- **Palette:** Warm parchment (`#f5f4ed`), Ivory (`#faf9f5`), Terracotta (`#c96442`), Near Black (`#141413`), Olive Gray (`#5e5d59`), Stone Gray (`#87867f`). No cool blues.
- **Typography:** Anthropic Serif for headings, Anthropic Sans for UI, Anthropic Mono for code.
- **Depth:** Subtle warm ring shadows (`0px 0px 0px 1px`) instead of heavy drop shadows.

## 3. Architecture & Key Modules

### Project Structure

```
src/
├── app/
│   ├── (root)/
│   │   ├── chat/
│   │   └── layout.tsx
│
├── components/
│   ├── chat/
│   └── auth-provider.tsx
│   └── ImageUploaderClient.tsx
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

### Authentication Flow

- **Strategy:** Firebase Client Auth combined with secure server‑side session cookies.
- **Implementation:**
  - User signs in via the Client SDK (`src/lib/firebase/auth.ts`).
  - A Next.js API route (`/api/auth/session`) creates an HTTP‑only session cookie using the Admin SDK.
  - Middleware/Layout (`src/app/(root)/layout.tsx`) protects routes by verifying the session cookie.
- **Profile Sync:** User data is stored in the `users` Firestore collection and kept in sync via the `AuthProvider` component.

### Chat Module

- **Layout:** App Router layout (`src/app/(root)/chat/layout.tsx`) with a persistent sidebar.
- **Data Layer:** Custom hooks (`use-chat.ts`, `use-channels.ts`) interface with Firestore for real‑time messaging, pagination, and channel management.
- **Components:** `ChatPanel`, `ChatInput`, `ChatBubble`, `Sidebar` under `src/components/chat/`.

### Firebase Configuration

- **Client:** `src/lib/firebase/client.ts` (uses `experimentalForceLongPolling` for reliability).
- **Server:** `src/lib/firebase/server.ts` for admin‑only operations.
- **Helpers:** `auth.ts` and `chat.ts` abstract Firestore and authentication logic.

## 4. Coding Conventions

- **App Router:** Prefer Server Components; add `"use client"` only when needed.
- **TypeScript:** Strict mode enabled; use interfaces/types for all props and data structures.
- **Styling:** Tailwind utility classes combined with `cn()` from `src/lib/utils.ts`. Custom CSS variables are defined in `globals.css`.
- **Environment Variables:** Prefix client‑side Firebase keys with `NEXT_PUBLIC_`; keep admin credentials server‑only.
- **Naming:** Follow PascalCase for components, camelCase for functions and hooks, and kebab‑case for file names.

---

*This guide is version‑controlled; keep it up to date with any architectural changes.*
