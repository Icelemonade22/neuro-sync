import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getStudyBuddies(currentUserId: string) {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((user: any) => user.uid !== currentUserId);
}
