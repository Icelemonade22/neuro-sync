import { db } from "@/config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export type ReportStatus = "Pending" | "In Review" | "Resolved" | "Dismissed";

export type ReportPriority = "Low" | "Medium" | "High";

export type ReportType =
  | "Bug"
  | "Inappropriate Content"
  | "Suggestion"
  | "User Report";

export async function createReport(data: {
  type: ReportType;
  title: string;
  description: string;
  reportedBy: string;
  reasons?: string[];
  relatedItemId?: string;
  relatedItemType?: "note" | "room" | "user" | "general";
}) {
  await addDoc(collection(db, "reports"), {
    ...data,
    status: "Pending",
    priority: "Medium",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function listenReports(callback: (reports: any[]) => void) {
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(reports);
  });
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
) {
  const reportRef = doc(db, "reports", reportId);

  await updateDoc(reportRef, {
    status,
    resolvedAt: status === "Resolved" ? serverTimestamp() : null,
    dismissedAt: status === "Dismissed" ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}

export async function updateReportPriority(
  reportId: string,
  priority: ReportPriority,
) {
  const reportRef = doc(db, "reports", reportId);

  await updateDoc(reportRef, {
    priority,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteReport(reportId: string) {
  await deleteDoc(doc(db, "reports", reportId));
}
