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

// Define the possible statuses for a user/admin report
export type ReportStatus = "Pending" | "In Review" | "Resolved" | "Dismissed";

// Define the possible priority levels for a report
export type ReportPriority = "Low" | "Medium" | "High";

// Define the different report categories supported by the system
export type ReportType =
  | "Bug"
  | "Inappropriate Content"
  | "Suggestion"
  | "User Report";

// Create a new report document in Firestore
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

    // New reports start as pending with medium priority by default
    status: "Pending",
    priority: "Medium",

    // Store creation and update timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Listen to reports in real time for the admin reports screen
export function listenReports(callback: (reports: any[]) => void) {
  // Query reports ordered from newest to oldest
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    // Convert Firestore documents into usable report objects
    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Send the updated reports list back to the screen
    callback(reports);
  });
}

// Update the status of a selected report
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
) {
  const reportRef = doc(db, "reports", reportId);

  await updateDoc(reportRef, {
    status,

    // Record when a report is resolved or dismissed
    resolvedAt: status === "Resolved" ? serverTimestamp() : null,
    dismissedAt: status === "Dismissed" ? serverTimestamp() : null,

    // Update modified timestamp
    updatedAt: serverTimestamp(),
  });
}

// Update the priority level of a selected report
export async function updateReportPriority(
  reportId: string,
  priority: ReportPriority,
) {
  const reportRef = doc(db, "reports", reportId);

  await updateDoc(reportRef, {
    priority,

    // Update modified timestamp
    updatedAt: serverTimestamp(),
  });
}

// Delete a report document from Firestore
export async function deleteReport(reportId: string) {
  await deleteDoc(doc(db, "reports", reportId));
}
