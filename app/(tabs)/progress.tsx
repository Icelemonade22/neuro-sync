import { auth } from "@/config/firebase";
import { getUserSessions } from "@/src/services/getUserSessions";
import { calculateAnalytics } from "@/src/utils/calculateAnalytics";
import { calculateWeeklyActivity } from "@/src/utils/calculateWeeklyActivity";
import { generateAnalyticsInsights } from "@/src/utils/generateAnalyticsInsights";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Text } from "react-native-paper";

const screenWidth = Dimensions.get("window").width;

export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [insights, setInsights] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, []),
  );

  const loadAnalytics = async () => {
    setLoading(true);

    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const sessions = await getUserSessions(user.uid);
    const result = calculateAnalytics(sessions);
    const weekly = calculateWeeklyActivity(sessions);
    const smartInsights = generateAnalyticsInsights(sessions);
    setInsights(smartInsights);

    setAnalytics(result);
    setWeeklyData(weekly);
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

      <Text style={styles.sectionTitle}>Weekly Study Activity</Text>

      <BarChart
        data={{
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              data: weeklyData,
            },
          ],
        }}
        width={screenWidth - 48}
        height={220}
        yAxisLabel=""
        yAxisSuffix="m"
        chartConfig={{
          backgroundGradientFrom: "#FFFFFF",
          backgroundGradientTo: "#FFFFFF",
          decimalPlaces: 0,
          color: () => "#8B5CF6",
          labelColor: () => "#777",
          propsForBackgroundLines: {
            strokeDasharray: "",
            stroke: "#EEEEEE",
          },
        }}
        style={styles.chart}
      />

      {insights && (
        <>
          <Text style={styles.sectionTitle}>Smart Insights 🧠</Text>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>📈 Weekly Study Time</Text>
            <Text style={styles.insightText}>
              You studied {Math.round(insights.totalMinutes / 60)} hours this
              week.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>🔥 Best Study Day</Text>
            <Text style={styles.insightText}>
              Your most productive day is {insights.bestStudyDay}.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>🧠 Consistency</Text>
            <Text style={styles.insightText}>
              Your weekly consistency is {insights.consistency}.
            </Text>
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Recent Achievements</Text>

      <View style={styles.achievementCard}>
        <Text style={styles.achievementText}>🏅 First Focus Session</Text>
      </View>

      <View style={styles.achievementCard}>
        <Text style={styles.achievementText}>🤝 Collaborative Learner</Text>
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
    backgroundColor: "#F8F5FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  insightTitle: {
    fontWeight: "bold",
    color: "#8B5CF6",
    marginBottom: 6,
    fontSize: 16,
  },

  insightText: {
    color: "#555",
    lineHeight: 20,
  },
  chart: {
    marginVertical: 16,
    borderRadius: 16,
  },

  achievementCard: {
    backgroundColor: "#F8F5FF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  achievementText: {
    fontWeight: "bold",
    color: "#333",
  },
});
