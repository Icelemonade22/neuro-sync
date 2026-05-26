import { db } from "@/config/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

export async function getLeaderboardUsers() {
  const q = query(
    collection(db, "users"),
    orderBy("weeklyXp", "desc"),
    limit(20),
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
