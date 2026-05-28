import { auth, db } from "@/config/firebase";
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getStreakMultiplier } from "./gamificationService";

function calculateLevel(xp: number) {
  if (xp >= 1000) return 5;
  if (xp >= 500) return 4;
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;

  return 1;
}

export async function rewardQuizXp(score: number) {
  const user = auth.currentUser;

  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return {
      xpEarned: 0,
      unlockedBadges: [],
    };
  }

  const data = userSnap.data();

  const streak = data.currentStreak ?? 1;
  const multiplier = getStreakMultiplier(streak);
  const xpEarned = Math.round(score * 10 * multiplier);

  const currentXp = data.xp ?? 0;
  const updatedXp = currentXp + xpEarned;

  const level = calculateLevel(updatedXp);

  const badges = data.badges ?? [];
  const newBadges = [...badges];

  if (!newBadges.includes("First Quiz Completed")) {
    newBadges.push("First Quiz Completed");
  }

  if (score === 5 && !newBadges.includes("Quiz Master")) {
    newBadges.push("Quiz Master");
  }

  await updateDoc(userRef, {
    xp: increment(xpEarned),
    weeklyXp: increment(xpEarned),
    totalQuizzesCompleted: increment(1),
    badges: newBadges,
    level,
    lastQuizAt: serverTimestamp(),
  });

  return {
    xpEarned,
    unlockedBadges: newBadges.filter(
      (badge: string) => !badges.includes(badge),
    ),
  };
}
