import { db } from "@/config/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

export async function createInAppNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: "room" | "session" | "message" | "achievement" | "system";
}) {
  await addDoc(collection(db, "notifications"), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function getUserNotifications(userId: string) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

export async function markNotificationAsRead(notificationId: string) {
  await updateDoc(doc(db, "notifications", notificationId), {
    read: true,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false),
  );

  const snapshot = await getDocs(q);

  return snapshot.size;
}

export function listenUnreadNotificationCount(
  userId: string,
  callback: (count: number) => void,
) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false),
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false),
  );

  const snapshot = await getDocs(q);

  const batch = writeBatch(db);

  snapshot.docs.forEach((docSnap) => {
    batch.update(doc(db, "notifications", docSnap.id), {
      read: true,
    });
  });

  await batch.commit();
}
