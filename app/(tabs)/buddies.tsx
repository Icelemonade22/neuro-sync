import { auth } from "@/config/firebase";
import { sendBuddyRequest } from "@/src/services/buddyRequestService";
import { getStudyBuddies } from "@/src/services/getStudyBuddies";
import { getUserProfile } from "@/src/services/getUserProfile";
import { calculateCompatibility } from "@/src/utils/calculateCompatibility";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";

export default function BuddiesScreen() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const currentProfile = await getUserProfile(user.uid);
    const users = await getStudyBuddies(user.uid);

    const rankedMatches = users
      .map((otherUser: any) => ({
        ...otherUser,
        compatibility: calculateCompatibility(currentProfile, otherUser),
      }))
      .sort((a, b) => b.compatibility - a.compatibility);

    setMatches(rankedMatches);
    setLoading(false);
  };

  const handleConnect = async (buddy: any) => {
    const user = auth.currentUser;
    if (!user) return;

    const currentProfile = await getUserProfile(user.uid);

    await sendBuddyRequest({
      fromUserId: user.uid,
      fromName: currentProfile?.fullName ?? "Student",
      toUserId: buddy.uid,
      toName: buddy.fullName ?? "Student",
      compatibility: buddy.compatibility,
    });

    Alert.alert("Request Sent", `Buddy request sent to ${buddy.fullName}.`);
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
      <Text style={styles.title}>Find Study Buddy 🤝</Text>
      <Text style={styles.subtitle}>
        Matched based on subject, focus level, study style, and availability.
      </Text>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/requests")}
        >
          <Text style={styles.actionText}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/rooms")}
        >
          <Text style={styles.actionText}>Rooms</Text>
        </TouchableOpacity>
      </View>

      {matches.length === 0 ? (
        <Text style={styles.empty}>No study buddies found yet.</Text>
      ) : (
        matches.map((buddy) => (
          <View key={buddy.id} style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.name}>{buddy.fullName ?? "Student"}</Text>
                <Text style={styles.subject}>
                  {buddy.subject ?? "Unknown subject"}
                </Text>
              </View>

              <Text style={styles.score}>{buddy.compatibility}%</Text>
            </View>

            <Text style={styles.detail}>
              {buddy.studyPreferences?.sessionType ?? "Pomodoro"} •{" "}
              {buddy.availability?.preferredTime ?? "Anytime"}
            </Text>

            <Text style={styles.detail}>
              {buddy.studyStyle?.communicationStyle ?? "Study style not set"}
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleConnect(buddy)}
            >
              <Text style={styles.buttonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
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
  },
  subtitle: {
    color: "#777",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  empty: {
    color: "#999",
    marginTop: 40,
    textAlign: "center",
  },
  card: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subject: {
    color: "#666",
    marginTop: 4,
  },
  score: {
    color: "#8B5CF6",
    fontWeight: "bold",
    fontSize: 18,
  },
  detail: {
    color: "#777",
    marginTop: 10,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#8B5CF6",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  actionButton: {
    flex: 1,
    backgroundColor: "#F3E8FF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  actionText: {
    color: "#8B5CF6",
    fontWeight: "bold",
  },
});
