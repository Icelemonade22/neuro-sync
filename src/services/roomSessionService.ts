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

// Create a new shared study room session
export async function createRoomSession(
  roomId: string,
  participants: string[],
  hostId: string,
) {
  // Add a new session document to the roomSessions collection
  const ref = await addDoc(collection(db, "roomSessions"), {
    roomId,
    participants,
    hostId,

    // Default session duration is 25 minutes
    durationMinutes: 25,
    secondsLeft: 25 * 60,

    // Session starts in paused and incomplete state
    isRunning: false,
    completed: false,

    // Store session timestamps
    createdAt: serverTimestamp(),
    startedAt: null,
    endedAt: null,
  });

  // Return the created session document ID
  return ref.id;
}

// Get the most recent study session for a room
export async function getLatestRoomSession(roomId: string) {
  // Query the latest session created for this room
  const q = query(
    collection(db, "roomSessions"),
    where("roomId", "==", roomId),
    orderBy("createdAt", "desc"),
    limit(1),
  );

  const snap = await getDocs(q);

  // Return null if the room has no existing sessions
  if (snap.empty) return null;

  // Return session data together with the document ID
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// Listen to real-time updates for a specific room session
export function listenRoomSession(
  sessionId: string,
  callback: (data: any) => void,
) {
  const ref = doc(db, "roomSessions", sessionId);

  // Subscribe to session changes such as timer updates and status changes
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    }
  });
}

// Update selected fields of a room session
export async function updateRoomSession(sessionId: string, data: any) {
  const ref = doc(db, "roomSessions", sessionId);
  await updateDoc(ref, data);
}

// Mark a shared room session as completed
export async function completeRoomSession(sessionId: string) {
  const ref = doc(db, "roomSessions", sessionId);

  await updateDoc(ref, {
    isRunning: false,
    completed: true,
    endedAt: serverTimestamp(),
  });
}

// Update a participant's presence status in a session
export async function updateParticipantPresence(
  sessionId: string,
  uid: string,
  data: any,
) {
  const ref = doc(db, "roomSessions", sessionId);

  // Store presence under presence.{uid}, for example:
  // presence.user123 = { name, status, online }
  await updateDoc(ref, {
    [`presence.${uid}`]: data,
  });
}
