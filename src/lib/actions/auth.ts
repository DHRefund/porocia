"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/server";

export async function createSessionCookieAction(idToken: string) {
  if (!idToken) {
    throw new Error("No token provided");
  }

  // Thiết lập cookie sống 5 ngày (đây là mốc chuẩn của Firebase Session Cookies)
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  
  try {
    // Dùng Admin SDK để tạo JWT session an toàn thay cho idToken
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const cookieStore = await cookies();
    cookieStore.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000, // maxAge của browser chuẩn là tính bằng giây
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating session cookie:", error);
    throw new Error("Internal Server Error");
  }
}

export async function removeSessionCookieAction() {
  const cookieStore = await cookies();
  cookieStore.delete("__session");
  return { success: true };
}
