import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/server";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lấy promise của cookies nhưng không 'await' nó ở đây để tránh blocking render toàn bộ layout
  const cookiePromise = cookies();

  return (
    <Suspense fallback={null}>
      <AuthGuard cookiePromise={cookiePromise}>
        {children}
      </AuthGuard>
    </Suspense>
  );
}

async function AuthGuard({ 
  children, 
  cookiePromise 
}: { 
  children: React.ReactNode; 
  cookiePromise: Promise<any> 
}) {
  const cookieStore = await cookiePromise;
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    // Xác thực cookie trên Server
    await adminAuth.verifySessionCookie(sessionCookie, true);
    return <>{children}</>;
  } catch (error) {
    console.error("Phiên đăng nhập không hợp lệ hoặc đã hết hạn:", error);
    redirect("/login");
  }
}
