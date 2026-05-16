import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return null;

  return snap.data();
}
