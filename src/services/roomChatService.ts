import { db } from "@/config/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

// Send a chat message to a shared study room
export async function sendRoomMessage(
  roomId: string,
  senderId: string,
  senderName: string,
  message: string,
) {
  // Prevent empty messages from being stored
  if (!message.trim()) return;

  // Save the message to Firestore with sender information and timestamp
  await addDoc(collection(db, "roomMessages"), {
    roomId,
    senderId,
    senderName,
    message,
    createdAt: serverTimestamp(),
  });
}

// Listen for real-time chat messages in a specific study room
export function listenRoomMessages(
  roomId: string,
  callback: (messages: any[]) => void,
) {
  // Retrieve messages belonging to the selected room,
  // ordered from oldest to newest
  const q = query(
    collection(db, "roomMessages"),
    where("roomId", "==", roomId),
    orderBy("createdAt", "asc"),
  );

  // Subscribe to message updates and return the latest chat history
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(messages);
  });
}
