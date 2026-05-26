// src/lib/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/server";

/**
 * Create a Firebase session cookie from a client ID token.
 * Called only after a successful sign‑in or when we need to sync a missing cookie.
 */
export async function createSessionCookieAction(idToken: string) {
  if (!idToken) {
    throw new Error("No token provided");
  }

  // 5 days = 5 * 24h * 60m * 60s * 1000ms
  const expiresIn = 5 * 24 * 60 * 60 * 1000;

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn,
  });

  const cookieStore = await cookies();
  cookieStore.set("__session", sessionCookie, {
    maxAge: expiresIn / 1000, // seconds for the browser
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return { ok: true };
}

/** Delete the session cookie – used on logout. */
export async function removeSessionCookieAction() {
  const cookieStore = await cookies();
  cookieStore.delete("__session");
  return { ok: true };
}

/**
 * Validate the session cookie sent by the browser.
 * Returns the UID if valid, otherwise null.
 */
export async function validateSessionCookieAction(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded.uid;
  } catch (e) {
    // Invalid / expired cookie
    return null;
  }
}

/**
 * Silent session recovery – if the session cookie is missing or invalid but
 * we still have a client‑side Firebase user (and thus a fresh ID token),
 * create a new cookie.
 */
export async function syncSessionIfNeededAction(idToken: string) {
  // First, check whether we already have a valid cookie.
  const uid = await validateSessionCookieAction();
  if (uid) {
    return { ok: true, alreadySynced: true };
  }

  // No valid cookie → create a new one.
  await createSessionCookieAction(idToken);
  return { ok: true, alreadySynced: false };
}
