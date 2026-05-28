import { auth, db } from "@/config/firebase";
import { doc, increment, serverTimestamp, updateDoc } from "firebase/firestore";

export async function rewardMissionXp(totalXp: number) {
  const user = auth.currentUser;

  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  await updateDoc(userRef, {
    xp: increment(totalXp),
    weeklyXp: increment(totalXp),
    lastMissionClaimAt: serverTimestamp(),
  });

  return totalXp;
}
