import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    // Xác thực cookie trên Server (không màng đến Client JS)
    // Cực kì an toàn, chống giả mạo token
    await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Nếu pass => render thẳng Layout và Child
    return <>{children}</>;
  } catch (error) {
    console.error("Phiên đăng nhập không hợp lệ hoặc đã hết hạn:", error);
    redirect("/login");
  }
}
