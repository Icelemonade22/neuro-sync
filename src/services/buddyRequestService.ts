// src/services/buddyRequestService.ts
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

// Service functions for managing buddy requests, including sending requests
export async function sendBuddyRequest({
  // The ID and name of the user sending the request, the ID and name of the
  // user receiving the request, and the compatibility score between them.
  fromUserId,
  fromName,
  toUserId,
  toName,
  compatibility,
}: {
  // The ID of the user sending the buddy request.
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

  // Check if a buddy request already exists between the two users to prevent
  // duplicate requests. If a request already exists, return a message indicating
  // that the request has already been sent.
  const existingSnap = await getDocs(existingQuery);

  if (!existingSnap.empty) {
    return {
      success: false,
      message: "Request already exists.",
    };
  }

  // If no existing request is found, create a new buddy request document in the
  // "buddyRequests" collection in Firestore with the provided information and a
  // status of "pending". The createdAt field is set to the current server
  // timestamp to track when the request was sent.
  await addDoc(collection(db, "buddyRequests"), {
    fromUserId,
    fromName,
    toUserId,
    toName,
    compatibility,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  // Return a success message indicating that the buddy request has been sent.
  return {
    success: true,
    message: "Request sent.",
  };
}

// Function to retrieve incoming buddy requests for a specific user, filtering for
// requests that are still pending. This allows the user to see who has sent them
// buddy requests and decide whether to accept or reject them.
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

// Function to update the status of a buddy request, allowing the recipient to
// accept or reject the request.
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

// Function to create a study room based on an accepted buddy request.
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

// Function to retrieve outgoing buddy requests sent by a specific user, allowing
// the user to see the status of their sent requests and manage them accordingly.
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
