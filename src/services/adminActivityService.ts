import { db } from "@/config/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

// Retrieve recent platform activities for the admin dashboard
export async function getRecentAdminActivity() {
  const activities: any[] = [];

  // Retrieve the latest uploaded notes
  const notesQuery = query(
    collection(db, "notes"),
    orderBy("createdAt", "desc"),
    limit(5),
  );

  // Retrieve the latest submitted reports
  const reportsQuery = query(
    collection(db, "reports"),
    orderBy("createdAt", "desc"),
    limit(5),
  );

  // Retrieve the latest created study rooms
  const roomsQuery = query(
    collection(db, "studyRooms"),
    orderBy("createdAt", "desc"),
    limit(5),
  );

  // Retrieve the latest recorded study sessions
  const sessionsQuery = query(
    collection(db, "studySessions"),
    orderBy("createdAt", "desc"),
    limit(5),
  );

  // Execute all queries simultaneously for better performance
  const [notesSnap, reportsSnap, roomsSnap, sessionsSnap] = await Promise.all([
    getDocs(notesQuery),
    getDocs(reportsQuery),
    getDocs(roomsQuery),
    getDocs(sessionsQuery),
  ]);

  // Add note activities
  notesSnap.forEach((doc) => {
    const data = doc.data();

    activities.push({
      id: doc.id,
      type: "note",
      icon: "📚",
      title: "New note uploaded",
      description: data.title ?? "Untitled note",
      createdAt: data.createdAt,
    });
  });

  // Add report activities
  reportsSnap.forEach((doc) => {
    const data = doc.data();

    activities.push({
      id: doc.id,
      type: "report",
      icon: "🚨",
      title: "New report submitted",
      description: data.title ?? "Report submitted",
      createdAt: data.createdAt,
    });
  });

  // Add study room activities
  roomsSnap.forEach((doc) => {
    const data = doc.data();

    activities.push({
      id: doc.id,
      type: "room",
      icon: "🏠",
      title: "Study room created",
      description: data.name ?? data.title ?? "Study Room",
      createdAt: data.createdAt,
    });
  });

  // Add study session activities
  sessionsSnap.forEach((doc) => {
    const data = doc.data();

    activities.push({
      id: doc.id,
      type: "session",
      icon: "⏱️",
      title: "Study session recorded",
      description:
        data.duration != null
          ? `${data.duration} minutes`
          : "Session activity detected",
      createdAt: data.createdAt,
    });
  });

  // Sort all activities from newest to oldest
  activities.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
    const bTime = b.createdAt?.toDate?.()?.getTime?.() ?? 0;

    return bTime - aTime;
  });

  // Return the 8 most recent activities
  return activities.slice(0, 8);
}
