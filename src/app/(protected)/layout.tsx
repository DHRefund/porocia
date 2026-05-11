import { SiteHeader } from "@/components/layout/site-header";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Suspense fallback={<HeaderSkeleton />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1 min-h-0 overflow-y-auto">
        {children}
      </main>
    </div>
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
