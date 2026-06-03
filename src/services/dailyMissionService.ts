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

export async function completeMission(missionId: string) {
  const user = auth.currentUser;
  if (!user) return false;

  await initializeDailyMissions();

  const ref = doc(db, "dailyMissions", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return false;

  const data = snap.data();

  const mission = (data.missions ?? defaultMissions).find(
    (m: any) => m.id === missionId,
  );

  const newlyCompleted = mission && !mission.completed;

  const updated = (data.missions ?? defaultMissions).map((mission: any) =>
    mission.id === missionId ? { ...mission, completed: true } : mission,
  );

  await updateDoc(ref, {
    missions: updated,
  });

  if (newlyCompleted) {
    await createInAppNotification({
      userId: user.uid,
      title: "🎯 Mission Completed",
      message: `${mission.title} is now completed. Claim your XP reward!`,
      type: "achievement",
    });
  }

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
