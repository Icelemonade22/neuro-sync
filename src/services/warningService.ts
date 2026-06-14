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

// Issue a warning to a user after an admin reviews a report
export async function issueUserWarning(data: {
  userId: string;
  reportId: string;
  message: string;
}) {
  // Save the warning record in Firestore
  await addDoc(collection(db, "warnings"), {
    userId: data.userId,
    reportId: data.reportId,
    message: data.message,
    issuedBy: "Admin",
    createdAt: serverTimestamp(),
  });

  // Notify the user about the warning
  await createInAppNotification({
    userId: data.userId,
    title: "⚠️ Account Warning",
    message: data.message,
    type: "system",
  });

  // Increase the user's warning count
  await updateDoc(doc(db, "users", data.userId), {
    warningCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}

// Remove one warning count from a user
export async function removeUserWarning(userId: string) {
  await updateDoc(doc(db, "users", userId), {
    warningCount: increment(-1),
    updatedAt: serverTimestamp(),
  });
}
