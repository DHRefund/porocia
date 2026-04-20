import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware này chạy trên Vercel Edge Network, siêu tốc!
export function proxy(request: NextRequest) {
  // Lấy giá trị cookie session Server-Side
  const session = request.cookies.get('__session')?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  // Xử lý ngược: Đã đăng nhập nhưng cố vào /login => đá về /
  if (isLoginPage) {
    if (session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Nếu KHÔNG có cookie => CHẶN NGAY LẬP TỨC (0ms) và trả về Login
  if (!session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Nếu CÓ cookie => Cho đi tiếp tới layout bọc (ProtectedLayout) để cho Admin SDK bóc vỏ.
  return NextResponse.next();
}

// Cấu hình áp dụng middleware cho các đường dẫn cụ thể (Bỏ qua login, register, api, static...)
export const config = {
  matcher: [
    '/login',
    '/chat/:path*',
    '/profile/:path*',
    '/people/:path*',
    '/knowledge/:path*',
    '/announcements/:path*',
  ],
};
