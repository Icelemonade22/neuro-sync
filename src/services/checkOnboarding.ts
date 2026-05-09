import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function checkOnboardingCompleted(uid: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return false;

  return userSnap.data().onboardingCompleted === true;
}
