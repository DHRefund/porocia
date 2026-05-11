import { ReactNode } from "react";
import { Sidebar } from "@/components/chat/sidebar";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </main>
  );
}
