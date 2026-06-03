import { getAdminPlatformInsights } from "./adminAnalyticsService";
import { getAdminDashboardStats } from "./adminService";

export async function getAdminRecommendations() {
  const stats = await getAdminDashboardStats();
  const insights = await getAdminPlatformInsights();

  const recommendations: string[] = [];

  // Moderation monitoring
  if (stats.pendingReports >= 5) {
    recommendations.push(
      "🚨 High moderation activity detected. Admin review is recommended.",
    );
  } else if (stats.pendingReports >= 2) {
    recommendations.push(
      "⚠️ Multiple pending reports detected. Monitor platform activity.",
    );
  } else {
    recommendations.push("✅ Moderation activity is currently stable.");
  }

  // Study behavior
  if (insights.mostActiveStudyTime === "Night") {
    recommendations.push(
      "🌙 Most students study at night. Consider promoting night focus sessions.",
    );
  }

  if (insights.mostActiveStudyTime === "Morning") {
    recommendations.push("☀️ Morning productivity is trending among students.");
  }

  // Subject trend
  if (insights.mostActiveSubject !== "No data") {
    recommendations.push(
      `📚 ${insights.mostActiveSubject} is currently the most active subject.`,
    );
  }

  // Room activity
  if (insights.totalActiveRooms >= 5) {
    recommendations.push("🏠 Study room activity is increasing significantly.");
  } else {
    recommendations.push("📈 Study room collaboration remains stable.");
  }

  // Platform health
  if (insights.platformHealth === "Healthy") {
    recommendations.push("🟢 Platform health status is healthy.");
  }

  if (insights.platformHealth === "Moderate") {
    recommendations.push("🟡 Platform activity requires moderate monitoring.");
  }

  if (insights.platformHealth === "Needs Attention") {
    recommendations.push(
      "🔴 Platform health requires immediate admin attention.",
    );
  }

  return recommendations;
}
