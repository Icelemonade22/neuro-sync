import { db } from "@/config/firebase";
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { createInAppNotification } from "./notificationCenterService";

// Calculate user level based on total XP
function calculateLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

// Get today's date in YYYY-MM-DD format
function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

// Get yesterday's date in YYYY-MM-DD format
function getYesterdayDateString() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

// Update the user's daily study streak
export async function updateStudyStreak(uid: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  // Stop if user document does not exist
  if (!userSnap.exists()) return 1;

  const userData = userSnap.data();

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const lastStudyDate = userData.lastStudyDate;
  const currentStreak = userData.streak ?? 0;
  const longestStreak = userData.longestStreak ?? 0;

  let newStreak = currentStreak;

  // Keep the same streak if user already studied today
  if (lastStudyDate === today) {
    return currentStreak || 1;
  }

  // Increase streak if user studied yesterday, otherwise reset to 1
  if (lastStudyDate === yesterday) {
    newStreak = currentStreak + 1;
  } else {
    newStreak = 1;
  }

  // Save updated streak information
  await updateDoc(userRef, {
    streak: newStreak,
    longestStreak: Math.max(longestStreak, newStreak),
    lastStudyDate: today,
    updatedAt: serverTimestamp(),
  });

  return newStreak;
}

// Award XP to user and handle level up logic
export async function awardUserXP(uid: string, xpAmount: number) {
  // Get user data
  const userRef = doc(db, "users", uid);
  // Get current XP and level
  const userSnap = await getDoc(userRef);

  // If user doesn't exist, exit early
  if (!userSnap.exists()) return;

  // Calculate new XP and level
  const currentXP = userSnap.data().xp ?? 0;
  const currentLevel = userSnap.data().level ?? calculateLevel(currentXP);

  // Update XP and level in Firestore
  const newXP = currentXP + xpAmount;
  const newLevel = calculateLevel(newXP);

  // Update user document with new XP and level
  await updateDoc(userRef, {
    xp: increment(xpAmount),
    weeklyXp: increment(xpAmount),
    level: newLevel,
    updatedAt: serverTimestamp(),
  });

  // If user leveled up, create an in-app notification
  if (newLevel > currentLevel) {
    await createInAppNotification({
      userId: uid,
      title: "🎉 Level Up!",
      message: `You reached Level ${newLevel}. Keep going!`,
      type: "achievement",
    });
  }
}

// Unlock a badge for the user and send an in-app notification if it's newly unlocked.
export async function unlockBadge(uid: string, badgeName: string) {
  // Get user data
  const userRef = doc(db, "users", uid);
  // Get current badges
  const userSnap = await getDoc(userRef);

  // If user doesn't exist, exit early
  if (!userSnap.exists()) return false;

  // Check if the badge is already unlocked
  const badges = userSnap.data().badges ?? [];

  // If the badge is already unlocked, exit early
  if (badges.includes(badgeName)) return false;

  // Update user document with new badge
  await updateDoc(userRef, {
    badges: [...badges, badgeName],
    updatedAt: serverTimestamp(),
  });

  // Create an in-app notification for the newly unlocked badge
  await createInAppNotification({
    userId: uid,
    title: "🏆 Achievement Unlocked",
    message: `You earned the "${badgeName}" badge.`,
    type: "achievement",
  });

  // Return true to indicate the badge was newly unlocked
  return true;
}

// Calculate XP multiplier based on study streak
export function getStreakMultiplier(streak: number) {
  if (streak >= 14) return 2;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.2;

  return 1;
}
