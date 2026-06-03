import { getRecentAdminActivity } from "@/src/services/adminActivityService";
import { getAdminPlatformInsights } from "@/src/services/adminAnalyticsService";
import { getAdminRecommendations } from "@/src/services/adminRecommendationService";
import { getAdminDashboardStats } from "@/src/services/adminService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await getAdminDashboardStats();
    const insightData = await getAdminPlatformInsights();
    const recommendationData = await getAdminRecommendations();
    const activityData = await getRecentAdminActivity();

    setStats(data);
    setInsights(insightData);
    setRecommendations(recommendationData);
    setActivities(activityData);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <Text style={styles.title}>Admin Dashboard 🛠️</Text>
      <Text style={styles.subtitle}>
        System overview and platform activity.
      </Text>

      <View style={styles.grid}>
        <StatCard title="Users" value={stats.totalUsers} icon="👥" />
        <StatCard title="Study Rooms" value={stats.totalRooms} icon="🏠" />
        <StatCard title="Notes" value={stats.totalNotes} icon="📚" />
        <StatCard title="Sessions" value={stats.totalSessions} icon="⏱️" />
        <StatCard
          title="Quizzes"
          value={stats.totalQuizzesCompleted}
          icon="🧠"
        />
        <StatCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon="🚨"
        />
        <StatCard
          title="Resolved Reports"
          value={stats.resolvedReports}
          icon="✅"
        />
      </View>

      <View style={styles.insightBox}>
        <Text style={styles.sectionTitle}>Platform Insights 🧠</Text>

        <Text style={styles.insightText}>
          Most Active Subject: {insights?.mostActiveSubject}
        </Text>

        <Text style={styles.insightText}>
          Most Common Report: {insights?.mostCommonReportType}
        </Text>

        <Text style={styles.insightText}>
          Most Active Study Time: {insights?.mostActiveStudyTime}
        </Text>

        <Text style={styles.insightText}>
          Active Rooms: {insights?.totalActiveRooms}
        </Text>

        <Text style={styles.insightText}>
          Platform Health: {insights?.platformHealth}
        </Text>
      </View>

      <View
        style={[
          styles.statusBox,
          insights?.platformHealth === "Healthy" && styles.healthyBox,
          insights?.platformHealth === "Moderate" && styles.moderateBox,
          insights?.platformHealth === "Needs Attention" && styles.dangerBox,
        ]}
      >
        <Text style={styles.sectionTitle}>Platform Status</Text>
        <Text style={styles.statusText}>
          {insights?.platformHealth === "Healthy" && "🟢 Platform is healthy"}
          {insights?.platformHealth === "Moderate" &&
            "🟡 Moderate monitoring needed"}
          {insights?.platformHealth === "Needs Attention" &&
            "🔴 Immediate admin attention required"}
        </Text>
      </View>

      <View style={styles.recommendationBox}>
        <Text style={styles.sectionTitle}>Smart Admin Recommendations 🤖</Text>

        {recommendations.map((item, index) => (
          <Text key={index} style={styles.recommendationText}>
            {item}
          </Text>
        ))}
      </View>

      <View style={styles.activityBox}>
        <Text style={styles.sectionTitle}>Live Platform Activity 📡</Text>

        {activities.length === 0 ? (
          <Text style={styles.insightText}>No recent activity found.</Text>
        ) : (
          activities.map((activity) => (
            <View
              key={`${activity.type}-${activity.id}`}
              style={styles.activityItem}
            >
              <Text style={styles.activityIcon}>{activity.icon}</Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>
                  {activity.description}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Button
        mode="outlined"
        icon="account-group"
        style={styles.secondaryButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        onPress={() => router.push("/admin/users" as any)}
      >
        Manage Users
      </Button>

      <Button
        mode="outlined"
        icon="book-open-page-variant"
        style={styles.secondaryButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        onPress={() => router.push("/admin/notes" as any)}
      >
        Manage Notes
      </Button>

      <Button
        mode="outlined"
        icon="monitor-dashboard"
        style={styles.secondaryButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        onPress={() => router.push("/admin/rooms" as any)}
      >
        Monitor Study Rooms
      </Button>

      <Button
        mode="contained"
        icon="alert-circle"
        style={styles.primaryButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.primaryButtonLabel}
        onPress={() => router.push("/admin/reports" as any)}
      >
        Reports & Feedback
      </Button>

      <Button
        mode="contained"
        icon="arrow-left"
        style={styles.backButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.backButtonLabel}
        onPress={() => router.back()}
      >
        Back
      </Button>
    </ScrollView>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#777",
    marginTop: 8,
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  card: {
    width: "47%",
    backgroundColor: "#F8F5FF",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
  },
  icon: {
    fontSize: 30,
    marginBottom: 10,
  },
  value: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#8B5CF6",
  },
  cardTitle: {
    color: "#666",
    marginTop: 6,
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },

  insightBox: {
    backgroundColor: "#F8F5FF",
    borderRadius: 20,
    padding: 18,
    marginTop: 24,
    marginBottom: 10,
  },

  insightText: {
    color: "#4B5563",
    marginBottom: 8,
    fontSize: 14,
  },

  statusBox: {
    borderRadius: 20,
    padding: 18,
    marginTop: 14,
  },

  healthyBox: {
    backgroundColor: "#DCFCE7",
  },

  moderateBox: {
    backgroundColor: "#FEF3C7",
  },

  dangerBox: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },

  recommendationBox: {
    backgroundColor: "#F8F5FF",
    borderRadius: 20,
    padding: 18,
    marginTop: 14,
    marginBottom: 10,
  },

  recommendationText: {
    color: "#4B5563",
    marginBottom: 10,
    lineHeight: 20,
    fontSize: 14,
  },

  activityBox: {
    backgroundColor: "#F8F5FF",
    borderRadius: 20,
    padding: 18,
    marginTop: 14,
    marginBottom: 10,
  },

  activityItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 14,
  },

  activityIcon: {
    fontSize: 24,
  },

  activityTitle: {
    fontWeight: "bold",
    color: "#111827",
  },

  activityDescription: {
    color: "#6B7280",
    marginTop: 3,
    fontSize: 13,
  },

  primaryButton: {
    borderRadius: 20,
    marginTop: 16,
    backgroundColor: "#8B5CF6",
    elevation: 4,
  },

  primaryButtonLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  secondaryButton: {
    borderRadius: 20,
    marginTop: 14,
    borderColor: "#8B5CF6",
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    borderRadius: 20,
    marginTop: 18,
    backgroundColor: "#E5E7EB",
  },

  buttonContent: {
    paddingVertical: 8,
  },

  buttonLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#8B5CF6",
  },

  backButtonLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
  },
});
