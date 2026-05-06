import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Geist, Noto_Serif_JP } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  weight: ["400","700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-jp",
  preload: false,
  display: "swap",
});

export default function RootLayout({children,}: { children: React.ReactNode;}) {
  return (
    <html lang="en" className={`${geistSans.variable}  ${notoSerifJP.variable}`}>
      <body>
        <AuthProvider>
          <div className="flex h-screen flex-col overflow-hidden bg-background">
            <Suspense fallback={<HeaderSkeleton />}>
              <SiteHeader />
            </Suspense>
            <main className="flex-1 min-h-0 overflow-y-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

function HeaderSkeleton() {
  return (
    <header className="w-full border-b border-border bg-background h-20">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-10">
        <div className="h-8 w-32 bg-cream rounded animate-pulse" />
        <div className="flex gap-4">
          <div className="h-9 w-9 bg-cream rounded-xl animate-pulse" />
        </div>
      </div>
    </header>
  );
}