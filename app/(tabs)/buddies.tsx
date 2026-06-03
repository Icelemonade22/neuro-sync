import { auth } from "@/config/firebase";
import {
  getOutgoingBuddyRequests,
  sendBuddyRequest,
} from "@/src/services/buddyRequestService";
import { getStudyBuddies } from "@/src/services/getStudyBuddies";
import { getUserProfile } from "@/src/services/getUserProfile";
import { createReport } from "@/src/services/reportService";
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
import { Button, Text } from "react-native-paper";

export default function BuddiesScreen() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
  const [connectedBuddyIds, setConnectedBuddyIds] = useState<string[]>([]);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const outgoingRequests = await getOutgoingBuddyRequests(user.uid);

    const pendingIds = outgoingRequests
      .filter((request: any) => request.status === "pending")
      .map((request: any) => request.toUserId);

    const acceptedIds = outgoingRequests
      .filter((request: any) => request.status === "accepted")
      .map((request: any) => request.toUserId);

    setSentRequestIds(pendingIds);
    setConnectedBuddyIds(acceptedIds);

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

    try {
      setConnectingId(buddy.id);

      const currentProfile = await getUserProfile(user.uid);

      const result = await sendBuddyRequest({
        fromUserId: user.uid,
        fromName: currentProfile?.fullName ?? "Student",
        toUserId: buddy.uid,
        toName: buddy.fullName ?? "Student",
        compatibility: buddy.compatibility,
      });

      if (!result.success) {
        Alert.alert("Already Sent", result.message);
        setSentRequestIds((prev) => [...prev, buddy.uid]);
        return;
      }

      setSentRequestIds((prev) => [...prev, buddy.uid]);

      Alert.alert("Request Sent", `Buddy request sent to ${buddy.fullName}.`);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to send buddy request.");
    } finally {
      setConnectingId(null);
    }
  };

  const handleReportUser = async (buddy: any) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "You must be logged in to report a user.");
      return;
    }

    try {
      await createReport({
        type: "User Report",
        title: `Reported User: ${buddy.fullName ?? buddy.email ?? "User"}`,
        description: `The user "${
          buddy.fullName ?? buddy.email ?? "User"
        }" was reported by another user.`,
        reportedBy: user.email ?? "Student",
        relatedItemId: buddy.uid ?? buddy.id,
        relatedItemType: "user",
      });

      Alert.alert("Reported", "This user has been reported to the admin.");
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Failed to report user.");
    }
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
        matches.map((buddy) => {
          const alreadySent = sentRequestIds.includes(buddy.uid);
          const connected = connectedBuddyIds.includes(buddy.uid);

          return (
            <View key={buddy.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(buddy.fullName ?? "S").charAt(0)}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{buddy.fullName ?? "Student"}</Text>
                  <Text style={styles.subject}>
                    {buddy.subject ?? "Unknown subject"}
                  </Text>
                </View>

                <Text style={styles.score}>{buddy.compatibility}%</Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>🌟 Best Match</Text>
              </View>

              <View style={styles.compatibilityBar}>
                <View
                  style={[
                    styles.compatibilityFill,
                    { width: `${buddy.compatibility}%` },
                  ]}
                />
              </View>

              <Text style={styles.matchReason}>
                Matched by subject, focus level, accountability, and study time.
              </Text>

              <Text style={styles.detail}>
                {buddy.studyPreferences?.sessionType ?? "Pomodoro"} •{" "}
                {buddy.availability?.preferredTime ?? "Anytime"}
              </Text>

              <Text style={styles.detail}>
                {buddy.studyStyle?.communicationStyle ?? "Study style not set"}
              </Text>

              <TouchableOpacity
                style={[
                  styles.button,
                  (connectingId === buddy.id || alreadySent || connected) && {
                    opacity: 0.6,
                  },
                  connected && {
                    backgroundColor: "#22C55E",
                  },
                ]}
                disabled={connectingId === buddy.id || alreadySent || connected}
                onPress={() => handleConnect(buddy)}
              >
                <Text style={styles.buttonText}>
                  {connected
                    ? "Connected ✅"
                    : alreadySent
                      ? "Request Sent"
                      : connectingId === buddy.id
                        ? "Sending..."
                        : "Connect"}
                </Text>
              </TouchableOpacity>
              <Button
                mode="text"
                textColor="#EF4444"
                onPress={() => handleReportUser(buddy)}
              >
                Report User
              </Button>
            </View>
          );
        })
      )}
    </ScrollView>
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

  compatibilityBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginTop: 14,
    overflow: "hidden",
  },

  compatibilityFill: {
    height: 8,
    backgroundColor: "#8B5CF6",
    borderRadius: 10,
  },

  matchReason: {
    color: "#777",
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },

  badge: {
    backgroundColor: "#F3E8FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 14,
  },

  badgeText: {
    color: "#8B5CF6",
    fontWeight: "bold",
    fontSize: 12,
  },
});
