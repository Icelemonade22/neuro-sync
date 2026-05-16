import { db } from "@/config/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export async function getUserSessions(uid: string) {
  const q = query(
    collection(db, "studySessions"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
