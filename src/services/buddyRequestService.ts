import { db } from "@/config/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

export async function sendBuddyRequest({
  fromUserId,
  fromName,
  toUserId,
  toName,
  compatibility,
}: {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  compatibility: number;
}) {
  const existingQuery = query(
    collection(db, "buddyRequests"),
    where("fromUserId", "==", fromUserId),
    where("toUserId", "==", toUserId),
  );

  const existingSnap = await getDocs(existingQuery);

  if (!existingSnap.empty) {
    return {
      success: false,
      message: "Request already exists.",
    };
  }

  await addDoc(collection(db, "buddyRequests"), {
    fromUserId,
    fromName,
    toUserId,
    toName,
    compatibility,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return {
    success: true,
    message: "Request sent.",
  };
}

export async function getIncomingBuddyRequests(uid: string) {
  const q = query(
    collection(db, "buddyRequests"),
    where("toUserId", "==", uid),
    where("status", "==", "pending"),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function updateBuddyRequestStatus(
  requestId: string,
  status: "accepted" | "rejected",
) {
  const ref = doc(db, "buddyRequests", requestId);

  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function createStudyRoomFromRequest(request: any) {
  const existingRoomQuery = query(
    collection(db, "studyRooms"),
    where("requestId", "==", request.id),
  );

  const existingRoomSnap = await getDocs(existingRoomQuery);

  if (!existingRoomSnap.empty) {
    return {
      success: false,
      roomId: existingRoomSnap.docs[0].id,
      message: "Study room already exists.",
    };
  }

  const roomRef = doc(collection(db, "studyRooms"));

  await setDoc(roomRef, {
    participants: [request.fromUserId, request.toUserId],
    participantNames: [request.fromName, request.toName],
    requestId: request.id,
    status: "active",
    sessionType: "Pomodoro",
    createdAt: serverTimestamp(),
  });

  return {
    success: true,
    roomId: roomRef.id,
    message: "Study room created.",
  };
}

export async function getOutgoingBuddyRequests(uid: string) {
  const q = query(
    collection(db, "buddyRequests"),
    where("fromUserId", "==", uid),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}
