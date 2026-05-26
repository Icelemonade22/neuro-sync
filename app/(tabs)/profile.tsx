import { useAuth } from "@/config/auth-context";
import { auth } from "@/config/firebase";
import { getUserProfile } from "@/src/services/getUserProfile";
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
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
        style={styles.logoutButton}
        onPress={() => router.push("/editProfile")}
      >
        Edit Profile
      </Button>

      <Text style={styles.sectionTitle}>Study Preferences</Text>

      <View style={styles.card}>
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

      <Text style={styles.sectionTitle}>Goals</Text>

      <View style={styles.card}>
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

      <Text style={styles.sectionTitle}>Gamification</Text>

      <View style={styles.card}>
        <Text style={styles.levelTitle}>Level {profile?.level ?? 1}</Text>

        <Text style={styles.xpText}>{profile?.xp ?? 0} XP</Text>
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
        style={styles.logoutButton}
        onPress={() => router.push("/assistant")}
      >
        Open Study Assistant
      </Button>

      <Button
        mode="outlined"
        style={styles.button}
        onPress={() => router.push("/(tabs)/notes")}
      >
        Study Notes
      </Button>

      <Button
        mode="outlined"
        style={styles.button}
        onPress={() => router.push("/leaderboard")}
      >
        View Leaderboard
      </Button>

      <Button
        mode="outlined"
        style={styles.button}
        onPress={handleResetPassword}
      >
        Send Password Reset Email
      </Button>

      <Button
        mode="contained"
        style={styles.logoutButton}
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
    paddingTop: 30,
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
    borderRadius: 18,
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
  button: {
    marginTop: 28,
    borderRadius: 20,
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
});
