import { db } from "@/config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";

function getCurrentWeekId() {
  const now = new Date();
  const year = now.getFullYear();

  const start = new Date(year, 0, 1);
  const days = Math.floor(
    (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
  );

  const week = Math.ceil((days + start.getDay() + 1) / 7);

  return `${year}-W${week}`;
}

export async function saveWeeklyChampion(champion: any) {
  const weekId = getCurrentWeekId();

  const ref = doc(db, "hallOfFame", weekId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    throw new Error("This week's champion has already been saved.");
  }

  await setDoc(ref, {
    weekId,
    userId: champion.id,
    fullName: champion.fullName ?? "Student",
    weeklyXp: champion.weeklyXp ?? 0,
    level: champion.level ?? 1,
    streak: champion.streak ?? 0,
    savedAt: serverTimestamp(),
  });
}

export async function getHallOfFame() {
  const q = query(
    collection(db, "hallOfFame"),
    orderBy("savedAt", "desc"),
    limit(20),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
