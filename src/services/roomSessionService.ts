import { db } from "@/config/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export async function createRoomSession(
  roomId: string,
  participants: string[],
  hostId: string,
) {
  const ref = await addDoc(collection(db, "roomSessions"), {
    roomId,
    participants,
    hostId,
    durationMinutes: 25,
    secondsLeft: 25 * 60,
    isRunning: false,
    completed: false,
    createdAt: serverTimestamp(),
    startedAt: null,
    endedAt: null,
  });

  return ref.id;
}

export async function getLatestRoomSession(roomId: string) {
  const q = query(
    collection(db, "roomSessions"),
    where("roomId", "==", roomId),
    orderBy("createdAt", "desc"),
    limit(1),
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export function listenRoomSession(
  sessionId: string,
  callback: (data: any) => void,
) {
  const ref = doc(db, "roomSessions", sessionId);

  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    }
  });
}

export async function updateRoomSession(sessionId: string, data: any) {
  const ref = doc(db, "roomSessions", sessionId);
  await updateDoc(ref, data);
}

export async function completeRoomSession(sessionId: string) {
  const ref = doc(db, "roomSessions", sessionId);

  await updateDoc(ref, {
    isRunning: false,
    completed: true,
    endedAt: serverTimestamp(),
  });
}

export async function updateParticipantPresence(
  sessionId: string,
  uid: string,
  data: any,
) {
  const ref = doc(db, "roomSessions", sessionId);

  await updateDoc(ref, {
    [`presence.${uid}`]: data,
  });
}
