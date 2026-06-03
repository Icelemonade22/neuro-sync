import { auth } from "@/config/firebase";
import { getUserProfile } from "@/src/services/getUserProfile";
import { getUserSessions } from "@/src/services/getUserSessions";
import { calculateAnalytics } from "@/src/utils/calculateAnalytics";
import { calculateWeeklyActivity } from "@/src/utils/calculateWeeklyActivity";
import { generateAISummary } from "@/src/utils/generateAISummary";
import { generateAnalyticsInsights } from "@/src/utils/generateAnalyticsInsights";
import { generateStudyForecast } from "@/src/utils/generateStudyForecast";
import { generateWeeklyStudyReport } from "@/src/utils/generateWeeklyStudyReport";
import { getNextAchievement } from "@/src/utils/getNextAchievement";
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
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [insights, setInsights] = useState<any>(null);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [nextAchievement, setNextAchievement] = useState<any>(null);

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

    const profile = await getUserProfile(user.uid);
    setProfile(profile);

    const sessions = await getUserSessions(user.uid);

    const result = calculateAnalytics(sessions, profile?.streak ?? 0);
    setAnalytics(result);

    const weekly = calculateWeeklyActivity(sessions);
    const smartInsights = generateAnalyticsInsights(sessions);
    setInsights(smartInsights);

    const forecastData = generateStudyForecast(result, smartInsights);
    setForecast(forecastData);

    const summary = generateAISummary(result, smartInsights, forecastData);
    setAiSummary(summary);

    const achievementData = getNextAchievement(profile, result);
    setNextAchievement(achievementData);

    const report = generateWeeklyStudyReport(result, smartInsights, profile);

    setWeeklyReport(report);

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
      contentContainerStyle={{ paddingBottom: 180 }}
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

      <View style={styles.breakdownCard}>
        <Text style={styles.insightTitle}>🎯 Focus Score Breakdown</Text>

        <Text style={styles.insightText}>
          Session Score: {analytics.sessionScore}
        </Text>

        <Text style={styles.insightText}>
          Consistency Score: {analytics.consistencyScore}
        </Text>

        <Text style={styles.insightText}>
          Streak Score: {analytics.streakScore}
        </Text>
      </View>

      {weeklyReport && (
        <View style={styles.weeklyReportCard}>
          <Text style={styles.weeklyReportTitle}>{weeklyReport.title}</Text>

          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Study Time</Text>
            <Text style={styles.reportValue}>{weeklyReport.studyTime}</Text>
          </View>

          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Sessions</Text>
            <Text style={styles.reportValue}>{weeklyReport.sessions}</Text>
          </View>

          <View style={styles.reportRow}>
            <Text style={styles.reportLabel}>Focus Score</Text>
            <Text style={styles.reportValue}>{weeklyReport.focusScore}</Text>
          </View>

          <View style={styles.reportDivider} />

          <Text style={styles.reportSectionTitle}>Strength</Text>
          <Text style={styles.reportText}>{weeklyReport.strength}</Text>

          <Text style={styles.reportSectionTitle}>Recommendation</Text>
          <Text style={styles.reportText}>{weeklyReport.recommendation}</Text>

          <Text style={styles.reportSectionTitle}>Outlook</Text>
          <Text style={styles.reportText}>{weeklyReport.outlook}</Text>
        </View>
      )}

      {forecast && (
        <View style={styles.forecastCard}>
          <Text style={styles.forecastTitle}>{forecast.title}</Text>

          <Text style={styles.forecastSubtitle}>
            Based on your current weekly pace
          </Text>

          <View style={styles.forecastGrid}>
            <View style={styles.forecastItem}>
              <Text style={styles.forecastValue}>
                {forecast.projectedHours}h
              </Text>
              <Text style={styles.forecastLabel}>Expected Time</Text>
            </View>

            <View style={styles.forecastItem}>
              <Text style={styles.forecastValue}>
                {forecast.projectedSessions}
              </Text>
              <Text style={styles.forecastLabel}>Expected Sessions</Text>
            </View>

            <View style={styles.forecastItem}>
              <Text style={styles.forecastValue}>
                {forecast.projectedFocusScore}
              </Text>
              <Text style={styles.forecastLabel}>Projected Score</Text>
            </View>
          </View>

          <View style={styles.forecastStatusBox}>
            <Text style={styles.forecastStatusLabel}>Status</Text>
            <Text style={styles.forecastStatusValue}>{forecast.status}</Text>
          </View>
        </View>
      )}

      {aiSummary ? (
        <View style={styles.aiSummaryCard}>
          <Text style={styles.aiSummaryTitle}>AI Weekly Summary 🤖</Text>

          <Text style={styles.aiSummaryText}>{aiSummary}</Text>
        </View>
      ) : null}

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

      {profile?.badges?.length > 0 ? (
        profile.badges.slice(0, 3).map((badge: string) => (
          <View key={badge} style={styles.achievementCard}>
            <Text style={styles.achievementText}>🏅 {badge}</Text>
          </View>
        ))
      ) : (
        <View style={styles.achievementCard}>
          <Text style={styles.achievementText}>
            No achievements unlocked yet.
          </Text>
        </View>
      )}

      {nextAchievement && (
        <View style={styles.nextAchievementCard}>
          <Text style={styles.nextAchievementTitle}>🏆 Next Achievement</Text>

          <Text style={styles.nextAchievementName}>
            {nextAchievement.title}
          </Text>

          <Text style={styles.nextAchievementMessage}>
            {nextAchievement.message}
          </Text>

          <View style={styles.achievementProgressBar}>
            <View
              style={[
                styles.achievementProgressFill,
                {
                  width: `${Math.min(
                    (nextAchievement.progress / nextAchievement.target) * 100,
                    100,
                  )}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.nextAchievementReward}>
            Reward: {nextAchievement.reward}
          </Text>
        </View>
      )}

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
    paddingTop: 60,
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

  weeklyReportCard: {
    backgroundColor: "#F8F5FF",
    borderRadius: 22,
    padding: 20,
    marginTop: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  weeklyReportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6D28D9",
    marginBottom: 16,
  },

  reportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  reportLabel: {
    color: "#6B7280",
    fontWeight: "600",
  },

  reportValue: {
    color: "#8B5CF6",
    fontWeight: "bold",
  },

  reportDivider: {
    height: 1,
    backgroundColor: "#DDD6FE",
    marginVertical: 14,
  },

  reportSectionTitle: {
    fontWeight: "bold",
    color: "#6D28D9",
    marginBottom: 6,
    marginTop: 8,
  },

  reportText: {
    color: "#4B5563",
    lineHeight: 20,
  },

  forecastCard: {
    backgroundColor: "#F8F5FF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  forecastTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6D28D9",
  },

  forecastSubtitle: {
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 16,
  },

  forecastGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  forecastItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },

  forecastValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B5CF6",
  },

  forecastLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 5,
    textAlign: "center",
  },

  forecastStatusBox: {
    backgroundColor: "#EDE9FE",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },

  forecastStatusLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "bold",
  },

  forecastStatusValue: {
    color: "#6D28D9",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 4,
  },

  aiSummaryCard: {
    backgroundColor: "#F8F5FF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  aiSummaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6D28D9",
    marginBottom: 14,
  },

  aiSummaryText: {
    color: "#4B5563",
    lineHeight: 24,
    fontSize: 15,
  },

  nextAchievementCard: {
    backgroundColor: "#F8F5FF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  nextAchievementTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6D28D9",
    marginBottom: 12,
  },

  nextAchievementName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  nextAchievementMessage: {
    color: "#4B5563",
    marginTop: 8,
    lineHeight: 20,
  },

  achievementProgressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    marginTop: 14,
    overflow: "hidden",
  },

  achievementProgressFill: {
    height: 8,
    backgroundColor: "#8B5CF6",
    borderRadius: 999,
  },

  nextAchievementReward: {
    color: "#6D28D9",
    fontWeight: "bold",
    marginTop: 10,
  },

  breakdownCard: {
    backgroundColor: "#F8F5FF",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
});
