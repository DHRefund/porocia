import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./client";

/**
 * Tự động đồng bộ / khởi tạo dữ liệu của người dùng vào collection `users`
 * Được gọi tự động mỗi khi register hoặc login
 */
export async function syncUserToFirestore(user: User) {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // Chưa có trong DB -> Khởi tạo profile
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split("@")[0] || "Unknown",
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      role: "member", // Gắn quyền mặc định
      bio: "",
    });
  } else {
    // Đã có -> Chỉ cập nhật thời gian đăng nhập gần nhất
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
  }
}

export async function registerWithEmail(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await syncUserToFirestore(credential.user);
  
  // Tạo server cookie session
  const idToken = await credential.user.getIdToken();
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });

  return credential;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await syncUserToFirestore(credential.user);

  // Tạo server cookie session
  const idToken = await credential.user.getIdToken();
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });

  return credential;
}

export async function logout() {
  await fetch("/api/auth/session", { method: "DELETE" });
  return signOut(auth);
}

export function listenAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}