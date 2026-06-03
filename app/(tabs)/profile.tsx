import { useAuth } from "@/config/auth-context";
import { auth } from "@/config/firebase";
import { getUserProfile } from "@/src/services/getUserProfile";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);

    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const data = await getUserProfile(user.uid);
    setProfile(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  const handleResetPassword = async () => {
    const email = auth.currentUser?.email;

    if (!email) {
      Alert.alert("Error", "No email found.");
      return;
    }

    await sendPasswordResetEmail(auth, email);
    Alert.alert("Password Reset", "A reset email has been sent.");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/auth");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const getNextLevelXp = (level: number) => {
    if (level === 1) return 100;
    if (level === 2) return 250;
    if (level === 3) return 500;
    if (level === 4) return 1000;

    return 1500;
  };

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const nextLevelXp = getNextLevelXp(level);
  const progressPercent = Math.min((xp / nextLevelXp) * 100, 100);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 240 }}
    >
      <LinearGradient
        colors={["#8B5CF6", "#A78BFA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <Text style={styles.gradientTitle}>Profile</Text>

        <Text style={styles.gradientSubtitle}>
          Manage your study identity and productivity journey.
        </Text>
      </LinearGradient>

      <View style={[styles.card, styles.cardShadow]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.fullName?.charAt(0) ?? "S"}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.fullName ?? "Student"}</Text>
        <Text style={styles.email}>
          {profile?.email ?? auth.currentUser?.email}
        </Text>
        <Text style={styles.detail}>
          {profile?.subject ?? "No subject set"}
        </Text>
        <Text style={styles.detail}>
          {profile?.studyLevel ?? "No study level set"}
        </Text>
      </View>

      <Button
        mode="contained"
        style={styles.primaryButton}
        onPress={() => router.push("/editProfile")}
      >
        Edit Profile
      </Button>

      <Text style={styles.sectionTitle}>📘 Study Preferences</Text>

      <View style={[styles.card, styles.cardShadow]}>
        <Text style={styles.detail}>
          Session Type: {profile?.studyPreferences?.sessionType ?? "Pomodoro"}
        </Text>
        <Text style={styles.detail}>
          Focus Level: {profile?.studyPreferences?.focusLevel ?? 0}%
        </Text>
        <Text style={styles.detail}>
          Accountability Level:{" "}
          {profile?.studyPreferences?.accountabilityLevel ?? 0}%
        </Text>
      </View>

      <Text style={styles.sectionTitle}>🎯 Goals</Text>

      <View style={[styles.card, styles.cardShadow]}>
        <Text style={styles.detail}>
          Daily Goal: {profile?.studyGoals?.dailyStudyMinutes ?? 0} minutes
        </Text>
        <Text style={styles.detail}>
          Weekly Study Days: {profile?.studyGoals?.weeklyStudyDays ?? 0}
        </Text>
        <Text style={styles.detail}>
          Main Goal: {profile?.studyGoals?.mainGoal ?? "Not set"}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>🏆 Gamification</Text>

      <View style={[styles.card, styles.cardShadow]}>
        <Text style={styles.levelTitle}>Level {profile?.level ?? 1}</Text>

        <Text style={styles.xpText}>{profile?.xp ?? 0} XP</Text>

        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${progressPercent}%` }]} />
        </View>

        <Text style={styles.xpProgressText}>
          {xp} / {nextLevelXp} XP to next level
        </Text>

        <Text style={styles.detail}>
          Current Streak: {profile?.streak ?? 0} days
        </Text>
        <Text style={styles.detail}>
          Longest Streak: {profile?.longestStreak ?? 0} days
        </Text>
        <View style={{ marginTop: 10 }}>
          {profile?.badges?.map((badge: string) => (
            <View key={badge} style={styles.badgeChip}>
              <Text style={styles.badgeChipText}>🏅 {badge}</Text>
            </View>
          ))}
        </View>
      </View>

      <Button
        mode="contained"
        icon="robot-excited"
        style={styles.primaryButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.primaryButtonLabel}
        onPress={() => router.push("/assistant")}
      >
        Open Study Assistant
      </Button>

      <Button
        mode="outlined"
        icon="book-open-page-variant"
        style={styles.secondaryButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.secondaryButtonLabel}
        onPress={() => router.push("/(tabs)/notes")}
      >
        Study Notes
      </Button>

      <Button
        mode="outlined"
        icon="trophy-outline"
        style={styles.secondaryButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.secondaryButtonLabel}
        onPress={() => router.push("/leaderboard")}
      >
        View Leaderboard
      </Button>

      <Button
        mode="outlined"
        icon="target"
        style={styles.secondaryButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.secondaryButtonLabel}
        onPress={() => router.push("/dailyMissions")}
      >
        Daily Missions
      </Button>

      {profile?.role === "admin" && (
        <Button
          mode="contained"
          icon="shield-crown-outline"
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.primaryButtonLabel}
          onPress={() => router.push("/admin" as any)}
        >
          Admin Dashboard
        </Button>
      )}

      <Button
        mode="outlined"
        icon="lock-reset"
        style={styles.secondaryButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.secondaryButtonLabel}
        onPress={handleResetPassword}
      >
        Send Password Reset Email
      </Button>

      <Button
        mode="outlined"
        icon="message-alert-outline"
        style={styles.secondaryButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.secondaryButtonLabel}
        onPress={() => router.push("/feedback" as any)}
      >
        Feedback & Reports
      </Button>

      <Button
        mode="contained"
        icon="logout"
        style={styles.dangerButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.dangerButtonLabel}
        onPress={handleLogout}
      >
        Logout
      </Button>
    </ScrollView>
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 22,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#F8F5FF",
    borderRadius: 20,
    padding: 18,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  email: {
    color: "#777",
    marginTop: 6,
    marginBottom: 10,
  },
  detail: {
    color: "#555",
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: "#8B5CF6",
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B5CF6",
  },

  xpText: {
    marginTop: 6,
    color: "#777",
  },
  badgeChip: {
    backgroundColor: "#EDE9FE",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: "flex-start",
  },

  badgeChipText: {
    color: "#6D28D9",
    fontWeight: "bold",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  xpBar: {
    height: 10,
    backgroundColor: "#EDE9FE",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 6,
  },

  xpFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 20,
  },

  xpProgressText: {
    color: "#777",
    fontSize: 12,
    marginBottom: 12,
  },

  primaryButton: {
    borderRadius: 20,
    marginTop: 18,
    backgroundColor: "#8B5CF6",
    elevation: 4,
  },

  secondaryButton: {
    borderRadius: 20,
    marginTop: 14,
    borderColor: "#8B5CF6",
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
  },

  dangerButton: {
    borderRadius: 20,
    marginTop: 18,
    backgroundColor: "#EF4444",
    elevation: 4,
  },

  buttonContent: {
    paddingVertical: 8,
  },

  primaryButtonLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  secondaryButtonLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#8B5CF6",
  },

  dangerButtonLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
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

  gradientHeader: {
    borderRadius: 28,
    paddingTop: 36,
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginBottom: 20,
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

  gradientTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  gradientSubtitle: {
    color: "#EDE9FE",
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
});
