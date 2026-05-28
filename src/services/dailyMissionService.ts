import { auth, db } from "@/config/firebase";
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";

const defaultMissions = [
  {
    id: "quiz",
    title: "Complete 1 Quiz",
    xp: 20,
    completed: false,
  },
  {
    id: "study",
    title: "Complete 1 Focus Session",
    xp: 30,
    completed: false,
  },
  {
    id: "note",
    title: "Upload 1 Note",
    xp: 40,
    completed: false,
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

export function listenDailyMissions(callback: (missions: any[]) => void) {
  const user = auth.currentUser;

  if (!user) return () => {};

  const ref = doc(db, "dailyMissions", user.uid);

  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) return;

    callback(snap.data().missions ?? []);
  });
}

export async function completeMission(missionId: string) {
  const user = auth.currentUser;

  if (!user) return;

  const ref = doc(db, "dailyMissions", user.uid);

  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  const updated = data.missions.map((mission: any) =>
    mission.id === missionId ? { ...mission, completed: true } : mission,
  );

  await updateDoc(ref, {
    missions: updated,
  });
}
