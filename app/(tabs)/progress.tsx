import { auth } from "@/config/firebase";
import { getUserSessions } from "@/src/services/getUserSessions";
import { calculateAnalytics } from "@/src/utils/calculateAnalytics";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const user = auth.currentUser;

    if (!user) return;

    const sessions = await getUserSessions(user.uid);

    const result = calculateAnalytics(sessions);

    setAnalytics(result);
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
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Your Progress 📈</Text>

      <View style={styles.statsGrid}>
        <AnalyticsCard
          title="Focus Hours"
          value={`${analytics.totalHours}h`}
          subtitle="Total study time"
        />

        <AnalyticsCard
          title="Sessions"
          value={`${analytics.totalSessions}`}
          subtitle="Completed sessions"
        />

        <AnalyticsCard
          title="Focus Score"
          value={`${analytics.focusScore}`}
          subtitle="Productivity rating"
        />

        <AnalyticsCard
          title="Consistency"
          value={analytics.totalSessions >= 5 ? "Excellent" : "Improving"}
          subtitle="Weekly habit"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Study Insights</Text>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>
            {analytics.focusScore >= 80
              ? "Excellent Focus 🔥"
              : "Good Progress 👍"}
          </Text>

          <Text style={styles.insightText}>
            {analytics.totalSessions >= 5
              ? "You are maintaining consistent study habits."
              : "Complete more sessions to improve consistency."}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function AnalyticsCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    paddingTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 28,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  card: {
    width: "47%",
    backgroundColor: "#F8F5FF",
    borderRadius: 18,
    padding: 20,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8B5CF6",
  },
  cardTitle: {
    marginTop: 10,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubtitle: {
    marginTop: 6,
    color: "#777",
    fontSize: 12,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 18,
    padding: 20,
  },
  insightTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  insightText: {
    color: "#666",
    lineHeight: 22,
  },
});
