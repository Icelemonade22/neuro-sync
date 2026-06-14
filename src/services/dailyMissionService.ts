import { auth, db } from "@/config/firebase";
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { createInAppNotification } from "./notificationCenterService";

const defaultMissions = [
  {
    id: "quiz",
    title: "Complete 1 Quiz",
    xp: 20,
    completed: false,
    claimed: false,
  },
  {
    id: "study",
    title: "Complete 1 Focus Session",
    xp: 30,
    completed: false,
    claimed: false,
  },
  {
    id: "note",
    title: "Upload 1 Note",
    xp: 40,
    completed: false,
    claimed: false,
  },
];

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

export async function initializeDailyMissions() {
  const user = auth.currentUser;

  if (!user) return;

  const ref = doc(db, "dailyMissions", user.uid);
  const snap = await getDoc(ref);

  const today = getTodayDateString();

  if (!snap.exists()) {
    await setDoc(ref, {
      missions: defaultMissions,
      lastResetDate: today,
      claimed: false,
      createdAt: new Date(),
    });

    return;
  }

  const data = snap.data();

  if (data.lastResetDate !== today) {
    await updateDoc(ref, {
      missions: defaultMissions,
      lastResetDate: today,
      claimed: false,
    });
  }
}

export function listenDailyMissions(
  callback: (data: { missions: any[]; claimed: boolean }) => void,
) {
  const user = auth.currentUser;

  if (!user) return () => {};

  const ref = doc(db, "dailyMissions", user.uid);

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    callback({
      missions: snap.data().missions ?? [],
      claimed: snap.data().claimed ?? false,
    });
  });
}

// Marks a mission as completed and sends an in-app notification if it was
// newly completed.
export async function completeMission(missionId: string) {
  // Get the current user.
  const user = auth.currentUser;

  // If no user is logged in, we can't complete a mission, so return false.
  if (!user) return false;

  // Ensure the daily missions are initialized for today.
  // This will create a new set of missions
  await initializeDailyMissions();

  // Get a reference to the user's daily missions document in Firestore and fetch it.
  const ref = doc(db, "dailyMissions", user.uid);
  // Get the document snapshot to access the current missions data.
  const snap = await getDoc(ref);

  // If the document doesn't exist, we can't complete a mission, so return false.
  if (!snap.exists()) return false;

  // Get the data from the snapshot, which includes the list of missions.
  const data = snap.data();

  // Find the mission that matches the provided missionId. If it doesn't exist,
  // mission will be undefined.
  const mission = (data.missions ?? defaultMissions).find(
    (m: any) => m.id === missionId,
  );

  // If the mission doesn't exist or is already completed, we can't complete
  // it again, so return false.
  const newlyCompleted = mission && !mission.completed;

  // Create an updated list of missions where the specified mission is marked as
  // completed. If the missionId doesn't match, the mission is returned unchanged.
  const updated = (data.missions ?? defaultMissions).map((mission: any) =>
    mission.id === missionId ? { ...mission, completed: true } : mission,
  );

  // Update the missions in Firestore with the new completed status.
  await updateDoc(ref, {
    missions: updated,
  });

  // If the mission was newly completed, send an in-app notification to the user.
  if (newlyCompleted) {
    await createInAppNotification({
      userId: user.uid,
      title: "🎯 Mission Completed",
      message: `${mission.title} is now completed. Claim your XP reward!`,
      type: "achievement",
    });
  }

  // Return whether the mission was newly completed, which can be used by the caller
  return newlyCompleted;
}

export async function updateDailyMissionClaimed() {
  const user = auth.currentUser;

  if (!user) return;

  const ref = doc(db, "dailyMissions", user.uid);

  await updateDoc(ref, {
    claimed: true,
  });
}

export async function markCompletedMissionsClaimed(missionIds: string[]) {
  const user = auth.currentUser;

  if (!user) return;

  const ref = doc(db, "dailyMissions", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  const updated = (data.missions ?? defaultMissions).map((mission: any) =>
    missionIds.includes(mission.id)
      ? {
          ...mission,
          claimed: true,
        }
      : mission,
  );

  await updateDoc(ref, {
    missions: updated,
  });
}

export async function getTodayDailyMissions() {
  const user = auth.currentUser;
  if (!user) return [];

  await initializeDailyMissions();

  const ref = doc(db, "dailyMissions", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return [];

  return snap.data().missions ?? [];
}
