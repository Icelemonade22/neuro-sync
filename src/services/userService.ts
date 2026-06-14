// src/services/userService.ts
import { db } from "@/config/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

// User onboarding data model
export type OnboardingData = {
  uid: string;
  email: string;
  fullName: string;
  subject: string;
  studyLevel: string;
  sessionType: string;
  focusLevel: number;
  accountabilityLevel: number;
  mainGoal: string;
  dailyStudyMinutes: number;
  weeklyStudyDays: number;
  purpose: string[];
  preferredTime: string;
  availableDays: string[];
  communicationStyle: string;
  partnerPreference: string;
  groupPreference: string;
};

// Save onboarding data to Firestore
export async function saveOnboardingData(data: OnboardingData) {
  const userRef = doc(db, "users", data.uid);

  // Create or update the user profile
  await setDoc(
    userRef,
    {
      uid: data.uid,
      email: data.email,
      fullName: data.fullName,
      subject: data.subject,
      studyLevel: data.studyLevel,
      onboardingCompleted: true,

      // Store study preferences
      studyPreferences: {
        sessionType: data.sessionType,
        focusLevel: data.focusLevel,
        accountabilityLevel: data.accountabilityLevel,
      },

      // Store study goals
      studyGoals: {
        mainGoal: data.mainGoal,
        dailyStudyMinutes: data.dailyStudyMinutes,
        weeklyStudyDays: data.weeklyStudyDays,
        purpose: data.purpose,
      },

      // Store availability information
      availability: {
        preferredTime: data.preferredTime,
        availableDays: data.availableDays,
      },

      // Store study style preferences
      studyStyle: {
        communicationStyle: data.communicationStyle,
        partnerPreference: data.partnerPreference,
        groupPreference: data.groupPreference,
      },

      role: "user",
      xp: 0,
      weeklyXp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      badges: [],
      online: true,
      warningCount: 0,

      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}
