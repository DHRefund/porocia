import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./client";

export function listenAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}