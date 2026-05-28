import { db } from "@/config/firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

export async function getAdminDashboardStats() {
  const usersSnap = await getDocs(collection(db, "users"));
  const roomsSnap = await getDocs(collection(db, "studyRooms"));
  const notesSnap = await getDocs(collection(db, "notes"));
  const sessionsSnap = await getDocs(collection(db, "studySessions"));

  let totalQuizzesCompleted = 0;

  usersSnap.forEach((doc) => {
    totalQuizzesCompleted += doc.data().totalQuizzesCompleted ?? 0;
  });

  return {
    totalUsers: usersSnap.size,
    totalRooms: roomsSnap.size,
    totalNotes: notesSnap.size,
    totalSessions: sessionsSnap.size,
    totalQuizzesCompleted,
  };
}

export async function getAllUsers() {
  const usersSnap = await getDocs(collection(db, "users"));

  return usersSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getAllNotes() {
  const notesSnap = await getDocs(collection(db, "notes"));

  return notesSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function deleteNote(noteId: string) {
  await deleteDoc(doc(db, "notes", noteId));
}

export async function getAllStudyRooms() {
  const roomsSnap = await getDocs(collection(db, "studyRooms"));

  return roomsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
