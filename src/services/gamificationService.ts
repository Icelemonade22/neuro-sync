import { db } from "@/config/firebase";
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

function calculateLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayDateString() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

export async function updateStudyStreak(uid: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return 1;

  const userData = userSnap.data();

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const lastStudyDate = userData.lastStudyDate;
  const currentStreak = userData.streak ?? 0;
  const longestStreak = userData.longestStreak ?? 0;

  let newStreak = currentStreak;

  if (lastStudyDate === today) {
    return currentStreak || 1;
  }

  if (lastStudyDate === yesterday) {
    newStreak = currentStreak + 1;
  } else {
    newStreak = 1;
  }

  await updateDoc(userRef, {
    streak: newStreak,
    longestStreak: Math.max(longestStreak, newStreak),
    lastStudyDate: today,
    updatedAt: serverTimestamp(),
  });

  return newStreak;
}

export async function awardUserXP(uid: string, xpAmount: number) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const currentXP = userSnap.data().xp ?? 0;
  const newXP = currentXP + xpAmount;
  const newLevel = calculateLevel(newXP);

  await updateDoc(userRef, {
    xp: increment(xpAmount),
    weeklyXp: increment(xpAmount),
    level: newLevel,
    updatedAt: serverTimestamp(),
  });
}

export async function unlockBadge(uid: string, badgeName: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return false;

  const badges = userSnap.data().badges ?? [];

  if (badges.includes(badgeName)) return false;

  await updateDoc(userRef, {
    badges: [...badges, badgeName],
    updatedAt: serverTimestamp(),
  });

  return true;
}

export function getStreakMultiplier(streak: number) {
  if (streak >= 14) return 2;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.2;

  return 1;
}
