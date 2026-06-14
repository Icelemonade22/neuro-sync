import { db } from "@/config/firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

// Retrieve dashboard statistics for the admin panel
export async function getAdminDashboardStats() {
  const usersSnap = await getDocs(collection(db, "users"));
  const roomsSnap = await getDocs(collection(db, "studyRooms"));
  const notesSnap = await getDocs(collection(db, "notes"));
  const sessionsSnap = await getDocs(collection(db, "studySessions"));
  const reportsSnap = await getDocs(collection(db, "reports"));

  let totalQuizzesCompleted = 0;

  // Calculate total quizzes completed by all users
  usersSnap.forEach((doc) => {
    totalQuizzesCompleted += doc.data().totalQuizzesCompleted ?? 0;
  });

  // Count pending reports
  const pendingReports = reportsSnap.docs.filter(
    (doc) => doc.data().status === "Pending",
  ).length;

  // Count resolved reports
  const resolvedReports = reportsSnap.docs.filter(
    (doc) => doc.data().status === "Resolved",
  ).length;

  // Return dashboard summary statistics
  return {
    totalUsers: usersSnap.size,
    totalRooms: roomsSnap.size,
    totalNotes: notesSnap.size,
    totalSessions: sessionsSnap.size,
    totalQuizzesCompleted,
    pendingReports,
    resolvedReports,
  };
}

// Retrieve all registered users
export async function getAllUsers() {
  const usersSnap = await getDocs(collection(db, "users"));

  return usersSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Retrieve all uploaded study notes
export async function getAllNotes() {
  const notesSnap = await getDocs(collection(db, "notes"));

  return notesSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Delete a study note from Firestore
export async function deleteNote(noteId: string) {
  await deleteDoc(doc(db, "notes", noteId));
}

// Retrieve all study rooms
export async function getAllStudyRooms() {
  const roomsSnap = await getDocs(collection(db, "studyRooms"));

  return roomsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
