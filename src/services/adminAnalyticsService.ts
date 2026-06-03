import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";

function getMostCommon(items: string[]) {
  if (items.length === 0) return "No data";

  const countMap: Record<string, number> = {};

  items.forEach((item) => {
    countMap[item] = (countMap[item] || 0) + 1;
  });

  return Object.entries(countMap).sort((a, b) => b[1] - a[1])[0][0];
}

export async function getAdminPlatformInsights() {
  const usersSnap = await getDocs(collection(db, "users"));
  const reportsSnap = await getDocs(collection(db, "reports"));
  const roomsSnap = await getDocs(collection(db, "studyRooms"));

  const subjects: string[] = [];
  const reportTypes: string[] = [];
  const preferredTimes: string[] = [];

  usersSnap.forEach((doc) => {
    const data = doc.data();

    if (data.subject) {
      subjects.push(data.subject);
    }

    if (data.availability?.preferredTime) {
      preferredTimes.push(data.availability.preferredTime);
    }
  });

  reportsSnap.forEach((doc) => {
    const data = doc.data();

    if (data.type) {
      reportTypes.push(data.type);
    }
  });

  const pendingReports = reportsSnap.docs.filter(
    (doc) => doc.data().status === "Pending",
  ).length;

  let platformHealth = "Healthy";

  if (pendingReports >= 5) {
    platformHealth = "Needs Attention";
  } else if (pendingReports >= 2) {
    platformHealth = "Moderate";
  }

  return {
    mostActiveSubject: getMostCommon(subjects),
    mostCommonReportType: getMostCommon(reportTypes),
    mostActiveStudyTime: getMostCommon(preferredTimes),
    totalActiveRooms: roomsSnap.size,
    platformHealth,
  };
}
