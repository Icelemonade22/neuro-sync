import { db } from "@/config/firebase";
import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

export async function saveChatMessage(
  userId: string,
  question: string,
  answer: string,
) {
  await addDoc(collection(db, "assistantChats"), {
    userId,
    question,
    answer,
    createdAt: serverTimestamp(),
  });
}

export async function getChatHistory(uid: string) {
  const q = query(
    collection(db, "assistantChats"),
    where("userId", "==", uid),
    orderBy("createdAt", "asc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data());
}
