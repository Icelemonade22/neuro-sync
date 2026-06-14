import { auth } from "@/config/firebase";
import { getUserProfile } from "@/src/services/getUserProfile";
import { getUserSessions } from "@/src/services/getUserSessions";
import { listenUnreadNotificationCount } from "@/src/services/notificationCenterService";
import { getUserActiveRoom } from "@/src/services/roomService";
import { calculateAnalytics } from "@/src/utils/calculateAnalytics";
import { calculateTodayMinutes } from "@/src/utils/calculateTodayMinutes";
import { detectBurnout } from "@/src/utils/detectBurnout";
import { generateStudyRecommendation } from "@/src/utils/generateStudyRecommendation";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";

export default function DashboardScreen() {
  // State variables to hold user data, loading status, and analytics
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [burnoutWarning, setBurnoutWarning] = useState<any>(null);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadProfile = async () => {
    const user = auth.currentUser;

    if (!user) {
      router.replace("/auth");
      return;
    }

    const data = await getUserProfile(user.uid);
    setProfile(data);

    const sessions = await getUserSessions(user.uid);
    const analyticsResult = calculateAnalytics(sessions);
    setAnalytics(analyticsResult);

    const minutesToday = calculateTodayMinutes(sessions);
    setTodayMinutes(minutesToday);

    const burnout = detectBurnout(sessions);
    setBurnoutWarning(burnout);

    const smartRecommendation = generateStudyRecommendation(
      data,
      sessions,
      analyticsResult,
      minutesToday,
      burnout,
    );
    setRecommendation(smartRecommendation);

    const room = await getUserActiveRoom();
    setActiveRoom(room);

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) return;

    const unsubscribe = listenUnreadNotificationCount(user.uid, setUnreadCount);

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const firstName = profile?.fullName?.split(" ")[0] ?? "Student";
  const sessionType = profile?.studyPreferences?.sessionType ?? "Pomodoro";
  const focusLevel = profile?.studyPreferences?.focusLevel ?? 80;
  const accountabilityLevel =
    profile?.studyPreferences?.accountabilityLevel ?? 70;
  const dailyGoal = profile?.studyGoals?.dailyStudyMinutes ?? 120;
  const subject = profile?.subject ?? "Study Session";

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const badges = profile?.badges ?? [];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 180 }}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/notifications")}
        >
          <Text style={styles.notificationButtonText}>🔔 Notifications</Text>

          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTextNumber}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <LinearGradient
          colors={["#8B5CF6", "#A78BFA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroGreeting}>Hi {firstName} 👋</Text>

          <Text style={styles.heroRecommendationTitle}>
            {recommendation?.title}
          </Text>

          <Text style={styles.heroRecommendationMessage}>
            {recommendation?.message}
          </Text>

          <View style={styles.heroDivider} />

          <View style={styles.heroStatsRow}>
            <Text style={styles.heroStat}>Level {level}</Text>
            <Text style={styles.heroStat}>{xp} XP</Text>
            <Text style={styles.heroStat}>
              🔥 {profile?.streak ?? 0}-day streak
            </Text>
          </View>

          {badges.length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeChip}>🏅 {badges[0]}</Text>
            </View>
          )}
          <Text style={styles.heroSmallText}>
            Best streak: {profile?.longestStreak ?? 0} days
          </Text>
        </LinearGradient>
        <View style={styles.communityCard}>
          <Text style={styles.communityTitle}>Community Standing</Text>

          <Text style={styles.communityStatus}>
            {(profile?.warningCount ?? 0) >= 3
              ? "🔴 Community Warning"
              : (profile?.warningCount ?? 0) >= 1
                ? "🟡 Under Review"
                : "🟢 Good Standing"}
          </Text>

          <Text style={styles.communityText}>
            Warnings: {profile?.warningCount ?? 0}
          </Text>
        </View>
        {burnoutWarning && (
          <View style={styles.burnoutCard}>
            <Text style={styles.burnoutTitle}>{burnoutWarning.title}</Text>

            <Text style={styles.burnoutMessage}>{burnoutWarning.message}</Text>
          </View>
        )}
        <View style={[styles.card, styles.cardShadow]}>
          <View style={styles.row}>
            <Text style={styles.cardLabel}>NEXT SESSION</Text>
            <Text style={styles.time}>
              {sessionType === "Pomodoro" ? "25 MIN" : "60 MIN"}
            </Text>
          </View>

          <Text style={styles.subject}>{subject}</Text>
          <Text style={styles.smallText}>
            Best subject based on recent study activity
          </Text>
        </View>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => router.push("/session")}
        >
          <Text style={styles.quickIcon}>⚡</Text>
          <Text style={styles.quickTitle}>Start Quick Session</Text>
          <Text style={styles.quickSub}>
            {sessionType} mode • Focus level {focusLevel}%
          </Text>
        </TouchableOpacity>

        {/*Daily Goal Card*/}
        <View style={[styles.card, styles.cardShadow]}>
          <View style={styles.row}>
            <Text style={styles.cardLabel}>TODAY'S GOAL</Text>
            <Text style={styles.check}>✅</Text>
          </View>

          <Text style={styles.goalText}>
            Complete {dailyGoal} minutes of study
          </Text>

          {/*Progress Bar*/}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  // Cap at 100% fill if user exceeds daily goal
                  width: `${Math.min((todayMinutes / dailyGoal) * 100, 100)}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.progressText}>
            {/* }Show minutes studied today vs goal */}
            {todayMinutes} / {dailyGoal} min
          </Text>
        </View>
        <Text style={styles.sectionTitle}>Your Study Buddy</Text>
        <View style={[styles.card, styles.cardShadow]}>
          {activeRoom ? (
            <>
              <Text style={styles.subject}>Active Study Room</Text>
              <Text style={styles.smallText}>
                {activeRoom.participantNames?.join(" & ")}
              </Text>

              <Text style={styles.onlineText}>
                {activeRoom.buddy?.online
                  ? "🟢 Buddy online"
                  : "⚪ Buddy offline"}
              </Text>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push(`/room/${activeRoom.id}`)}
              >
                <Text style={styles.secondaryText}>Continue Room</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.subject}>No active study buddy</Text>
              <Text style={styles.smallText}>
                Find students with similar focus levels and study goals:{" "}
                {accountabilityLevel}%
              </Text>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push("/buddies")}
              >
                <Text style={styles.secondaryText}>Find Compatible Buddy</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsRow}>
          <StatBox
            value={`${analytics?.totalHours ?? 0}`}
            label="Hours"
            sub="Total study time"
          />

          <StatBox
            value={`${analytics?.totalSessions ?? 0}`}
            label="Sessions"
            sub="Completed"
          />

          <StatBox
            value={`${analytics?.focusScore ?? 0}`}
            label="Focus Score"
            sub={
              (analytics?.focusScore ?? 0) >= 80
                ? "Excellent"
                : (analytics?.focusScore ?? 0) >= 60
                  ? "Good"
                  : "Improving"
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}

function StatBox({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
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
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  streak: {
    color: "#8B5CF6",
    marginBottom: 28,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLabel: {
    fontSize: 12,
    color: "#999",
    fontWeight: "bold",
  },
  time: {
    color: "#8B5CF6",
    fontWeight: "bold",
  },
  subject: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  smallText: {
    color: "#999",
    marginTop: 6,
    fontSize: 12,
  },
  quickButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  quickIcon: {
    fontSize: 28,
    color: "#FFFFFF",
  },
  quickTitle: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: 8,
  },
  quickSub: {
    color: "#EDE9FE",
    fontSize: 12,
    marginTop: 4,
  },
  goalText: {
    marginTop: 10,
    marginBottom: 12,
  },
  check: {
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#8B5CF6",
    borderRadius: 10,
  },
  progressText: {
    textAlign: "right",
    color: "#999",
    fontSize: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  secondaryButton: {
    marginTop: 14,
    backgroundColor: "#F3E8FF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: "#8B5CF6",
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#777",
    fontSize: 12,
    marginTop: 4,
  },
  statSub: {
    color: "#22C55E",
    fontSize: 10,
    marginTop: 4,
  },
  levelText: {
    color: "#8B5CF6",
    fontWeight: "bold",
    marginBottom: 6,
  },

  badgeText: {
    color: "#555",
    marginBottom: 12,
  },
  recommendationCard: {
    backgroundColor: "#F8F5FF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },

  recommendationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B5CF6",
  },

  recommendationMessage: {
    marginTop: 6,
    color: "#666",
    lineHeight: 20,
  },

  burnoutCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },

  burnoutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#B45309",
  },

  burnoutMessage: {
    marginTop: 6,
    color: "#92400E",
    lineHeight: 20,
  },
  aiCard: {
    backgroundColor: "#F3E8FF",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },

  aiTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6D28D9",
    marginBottom: 8,
  },

  aiMessage: {
    color: "#555",
    lineHeight: 22,
  },
  onlineText: {
    color: "#666",
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  heroCard: {
    borderRadius: 30,
    paddingTop: 28,
    paddingHorizontal: 22,
    paddingBottom: 20,
    marginBottom: 22,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },

  heroGreeting: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },

  heroRecommendationTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },

  heroRecommendationMessage: {
    color: "#EDE9FE",
    lineHeight: 21,
    marginBottom: 18,
  },

  heroStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  heroStat: {
    flex: 1,
    marginHorizontal: 4,
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    color: "#FFFFFF",
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "bold",
    overflow: "hidden",
  },

  heroBadge: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginTop: 2,
    marginBottom: 6,
  },

  heroSmallText: {
    color: "#EDE9FE",
    fontSize: 12,
  },

  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 12,
  },

  badgeContainer: {
    marginTop: 8,
    marginBottom: 6,
  },

  badgeChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    color: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "600",
  },

  notificationButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 8,
  },

  badge: {
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,

    justifyContent: "center",
    alignItems: "center",
  },

  badgeTextNumber: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    lineHeight: 12,
  },

  notificationButtonText: {
    color: "#8B5CF6",
    fontWeight: "bold",
    fontSize: 13,
  },

  communityCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  communityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },

  communityStatus: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
  },

  communityText: {
    marginTop: 6,
    color: "#6B7280",
  },
});
