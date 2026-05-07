import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./client";
import { createSessionCookieAction, removeSessionCookieAction } from "@/lib/actions/auth";

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
  
  // Tạo server cookie session via Server Action
  const idToken = await credential.user.getIdToken();
  await createSessionCookieAction(idToken);

  return credential;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await syncUserToFirestore(credential.user);

  // Tạo server cookie session via Server Action
  const idToken = await credential.user.getIdToken();
  await createSessionCookieAction(idToken);

  return credential;
}

export async function logout() {
  await removeSessionCookieAction();
  return signOut(auth);
}

export function listenAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Upload avatar to Cloudinary and return download URL
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "porocia";

  if (!cloudName) {
    throw new Error("Missing Cloudinary Cloud Name in environment variables");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  // Tổ chức thư mục theo yêu cầu: porocia/avatars/{userId}
  formData.append("folder", `porocia/avatars/${userId}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to upload to Cloudinary");
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Update user profile in both Firestore and Firebase Auth
 */
export async function updateUserProfile(userId: string, data: { displayName?: string; photoURL?: string; bio?: string }) {
  const userRef = doc(db, "users", userId);
  
  // 1. Update Firestore
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });

  // 2. Update Firebase Auth (if displayName or photoURL is provided)
  if (auth.currentUser && (data.displayName || data.photoURL)) {
    await updateProfile(auth.currentUser, {
      displayName: data.displayName || auth.currentUser.displayName,
      photoURL: data.photoURL || auth.currentUser.photoURL,
    });
  }
}