import { auth } from "@/config/firebase";
import { getUserProfile } from "@/src/services/getUserProfile";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";

export default function DashboardScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;

      if (!user) {
        router.replace("/auth");
        return;
      }

      const data = await getUserProfile(user.uid);
      setProfile(data);
      setLoading(false);
    };

    loadProfile();
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

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.greeting}>Hi {firstName} 👋</Text>

        <Text style={styles.streak}>🔥 5-day streak</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cardLabel}>NEXT SESSION</Text>
            <Text style={styles.time}>
              {sessionType === "Pomodoro" ? "25 MIN" : "60 MIN"}
            </Text>
          </View>

          <Text style={styles.subject}>{subject}</Text>
          <Text style={styles.smallText}>
            Recommended based on your study preferences
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

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.cardLabel}>TODAY'S GOAL</Text>
            <Text style={styles.check}>✅</Text>
          </View>

          <Text style={styles.goalText}>
            Complete {dailyGoal} minutes of study
          </Text>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "65%" }]} />
          </View>

          <Text style={styles.progressText}>78 / {dailyGoal} min</Text>
        </View>

        <Text style={styles.sectionTitle}>Your Study Buddy</Text>

        <View style={styles.card}>
          <Text style={styles.subject}>No active study buddy</Text>
          <Text style={styles.smallText}>
            Find students with similar focus levels and study goals:{" "}
            {accountabilityLevel}%
          </Text>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Find Compatible Buddy</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Your Progress</Text>

        <View style={styles.statsRow}>
          <StatBox value="24.5" label="Hours" sub="+12% this week" />
          <StatBox value="15" label="Sessions" sub="+3 today" />
          <StatBox value="79" label="Focus Score" sub="Excellent" />
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
    paddingTop: 20,
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
});
