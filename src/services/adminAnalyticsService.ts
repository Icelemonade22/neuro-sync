import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";

// Find the most frequent value in a list
function getMostCommon(items: string[]) {
  // Return fallback text if there is no data
  if (items.length === 0) return "No data";

  const countMap: Record<string, number> = {};

  // Count how many times each item appears
  items.forEach((item) => {
    countMap[item] = (countMap[item] || 0) + 1;
  });

  // Return the item with the highest count
  return Object.entries(countMap).sort((a, b) => b[1] - a[1])[0][0];
}

// Generate platform insights for the admin dashboard
export async function getAdminPlatformInsights() {
  const usersSnap = await getDocs(collection(db, "users"));
  const reportsSnap = await getDocs(collection(db, "reports"));
  const roomsSnap = await getDocs(collection(db, "studyRooms"));

  const subjects: string[] = [];
  const reportTypes: string[] = [];
  const preferredTimes: string[] = [];

  // Collect user subjects and preferred study times
  usersSnap.forEach((doc) => {
    const data = doc.data();

    if (data.subject) {
      subjects.push(data.subject);
    }

    if (data.availability?.preferredTime) {
      preferredTimes.push(data.availability.preferredTime);
    }
  });

  // Collect report types for moderation insights
  reportsSnap.forEach((doc) => {
    const data = doc.data();

    if (data.type) {
      reportTypes.push(data.type);
    }
  });

  // Count pending reports to estimate platform health
  const pendingReports = reportsSnap.docs.filter(
    (doc) => doc.data().status === "Pending",
  ).length;

  let platformHealth = "Healthy";

  // Determine platform health based on unresolved reports
  if (pendingReports >= 5) {
    platformHealth = "Needs Attention";
  } else if (pendingReports >= 2) {
    platformHealth = "Moderate";
  }

  // Determine platform health based on unresolved reports
  return {
    mostActiveSubject: getMostCommon(subjects),
    mostCommonReportType: getMostCommon(reportTypes),
    mostActiveStudyTime: getMostCommon(preferredTimes),
    totalActiveRooms: roomsSnap.size,
    platformHealth,
  };
}
