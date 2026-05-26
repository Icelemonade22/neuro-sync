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

export async function sendRoomMessage(
  roomId: string,
  senderId: string,
  senderName: string,
  message: string,
) {
  if (!message.trim()) return;

  await addDoc(collection(db, "roomMessages"), {
    roomId,
    senderId,
    senderName,
    message,
    createdAt: serverTimestamp(),
  });
}

export function listenRoomMessages(
  roomId: string,
  callback: (messages: any[]) => void,
) {
  const q = query(
    collection(db, "roomMessages"),
    where("roomId", "==", roomId),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(messages);
  });
}
