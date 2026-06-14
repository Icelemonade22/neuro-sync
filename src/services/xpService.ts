import { auth, db } from "@/config/firebase";
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getStreakMultiplier } from "./gamificationService";

// This function calculates the user's level based on their total XP.
function calculateLevel(xp: number) {
  if (xp >= 1000) return 5;
  if (xp >= 500) return 4;
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;
  // For XP less than 100, the user is at level 1.
  return 1;
}

// This function rewards the user with XP and badges based on their quiz score.
export async function rewardQuizXp(score: number) {
  // Get the currently authenticated user from Firebase Authentication.
  const user = auth.currentUser;

  // If there is no authenticated user, return early since we cannot reward XP or badges.
  if (!user) return;

  // Get a reference to the user's document in the "users" collection in Firestore.
  const userRef = doc(db, "users", user.uid);

  // Retrieve the user's document from Firestore to access their current XP, badges,
  // and streak information.
  const userSnap = await getDoc(userRef);

  // If the user document does not exist, return early with default values for XP
  // earned and unlocked badges.
  if (!userSnap.exists()) {
    return {
      xpEarned: 0,
      unlockedBadges: [],
    };
  }

  // Extract the user's current streak, XP, and badges from the document data.
  const data = userSnap.data();

  // Calculate the XP earned based on the quiz score, applying a multiplier for
  // the user's current streak.
  const streak = data.currentStreak ?? 1;

  // Get the multiplier for the user's current streak using the getStreakMultiplier
  // function.
  const multiplier = getStreakMultiplier(streak);

  const xpEarned = Math.round(score * 10 * multiplier);

  const currentXp = data.xp ?? 0;
  const updatedXp = currentXp + xpEarned;

  // Calculate the user's new level based on their updated total XP.
  const level = calculateLevel(updatedXp);

  const badges = data.badges ?? [];
  const newBadges = [...badges];

  // Check if the user has earned any new badges based on their quiz score and add them
  if (!newBadges.includes("First Quiz Completed")) {
    newBadges.push("First Quiz Completed");
  }

  // Award the "Quiz Master" badge if the user achieves a perfect score of 5
  // and doesn't already have it.
  if (score === 5 && !newBadges.includes("Quiz Master")) {
    newBadges.push("Quiz Master");
  }

  // Update the user's document in Firestore with the new XP, badges, level, and
  // the timestamp of their last quiz attempt.
  await updateDoc(userRef, {
    xp: increment(xpEarned),
    weeklyXp: increment(xpEarned),
    totalQuizzesCompleted: increment(1),
    badges: newBadges,
    level,
    lastQuizAt: serverTimestamp(),
  });

  // Return the XP earned from the quiz and any new badges that were unlocked as a
  // result
  return {
    xpEarned,
    unlockedBadges: newBadges.filter(
      (badge: string) => !badges.includes(badge),
    ),
  };
}
