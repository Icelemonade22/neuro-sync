import { db } from "@/config/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

export async function getUserStudyRooms(uid: string) {
  const q = query(
    collection(db, "studyRooms"),
    where("participants", "array-contains", uid),
    orderBy("createdAt", "desc"),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}
