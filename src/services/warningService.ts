import { db } from "@/config/firebase";
import { createInAppNotification } from "@/src/services/notificationCenterService";
import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export async function issueUserWarning(data: {
  userId: string;
  reportId: string;
  message: string;
}) {
  await addDoc(collection(db, "warnings"), {
    userId: data.userId,
    reportId: data.reportId,
    message: data.message,
    issuedBy: "Admin",
    createdAt: serverTimestamp(),
  });

  await createInAppNotification({
    userId: data.userId,
    title: "⚠️ Account Warning",
    message: data.message,
    type: "system",
  });

  await updateDoc(doc(db, "users", data.userId), {
    warningCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}
