// app/(tabs)/buddies.tsx
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
import { Button, Checkbox, Modal, Portal, Text } from "react-native-paper";

// Study buddy matching screen.
// Displays compatible study partners and allows users
// to connect, manage requests, and report users.
export default function BuddiesScreen() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
  const [connectedBuddyIds, setConnectedBuddyIds] = useState<string[]>([]);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [reportingUser, setReportingUser] = useState<any>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const userReportReasons = [
    "Inappropriate behaviour",
    "Harassment or rude language",
    "Spam or repeated unwanted messages",
    "Fake or misleading profile",
    "Disruptive study behaviour",
    "Other",
  ];

  // Add or remove a selected report reason.
  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((item) => item !== reason)
        : [...prev, reason],
    );
  };

  // Load study buddy matches when the screen opens.
  useEffect(() => {
    loadMatches();
  }, []);

  // Retrieve user profile, buddy requests,
  // and compatible study buddy matches.
  const loadMatches = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Get existing buddy requests sent by the user.
    const outgoingRequests = await getOutgoingBuddyRequests(user.uid);

    // Store users with pending requests.
    const pendingIds = outgoingRequests
      .filter((request: any) => request.status === "pending")
      .map((request: any) => request.toUserId);

    // Store users already connected as study buddies.
    const acceptedIds = outgoingRequests
      .filter((request: any) => request.status === "accepted")
      .map((request: any) => request.toUserId);

    // Update pending request list.
    setSentRequestIds(pendingIds);

    // Update connected buddy list.
    setConnectedBuddyIds(acceptedIds);

    // Load current user profile and warning count.
    const profile = await getUserProfile(user.uid);
    setCurrentProfile(profile);

    // Retrieve potential study buddy matches.
    const users = await getStudyBuddies(user.uid);

    // Rank users based on compatibility score.
    const rankedMatches = users
      .map((otherUser: any) => ({
        ...otherUser,
        compatibility: calculateCompatibility(profile, otherUser),
      }))
      .sort((a, b) => b.compatibility - a.compatibility);

    // Update the displayed buddy matches.
    setMatches(rankedMatches);
    setLoading(false);
  };

  // Send a study buddy request to a matched user.
  const handleConnect = async (buddy: any) => {
    const user = auth.currentUser;
    if (!user) return;

    // Validate the user's warning count before allowing them to send a
    // buddy request.
    try {
      setConnectingId(buddy.id);

      // Fetch the current user's profile to check their warning count
      // and ensure they appear
      const profile = await getUserProfile(user.uid);

      // Update the current user's online status in Firestore to ensure
      // they appear
      setCurrentProfile(profile);

      // Restrict buddy matching for users with multiple warnings.
      if ((currentProfile?.warningCount ?? 0) >= 3) {
        Alert.alert(
          "Restricted",
          "Buddy matching is temporarily unavailable due to multiple warnings.",
        );
        return;
      }

      // Create a buddy request with compatibility data.
      const result = await sendBuddyRequest({
        fromUserId: user.uid,
        fromName: currentProfile?.fullName ?? "Student",
        toUserId: buddy.uid,
        toName: buddy.fullName ?? "Student",
        compatibility: buddy.compatibility,
      });

      // If the request was not successful (e.g., already sent),
      // show an alert and optimistically add the buddy ID to the
      // sentRequestIds to update the UI accordingly.
      if (!result.success) {
        Alert.alert("Already Sent", result.message);
        setSentRequestIds((prev) => [...prev, buddy.uid]);
        return;
      }

      // Update the UI after sending the request.
      setSentRequestIds((prev) => [...prev, buddy.uid]);

      Alert.alert("Request Sent", `Buddy request sent to ${buddy.fullName}.`);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to send buddy request.");
    } finally {
      setConnectingId(null);
    }
  };

  // Report a user to the admin for review.
  const handleReportUser = async (buddy: any) => {
    const user = auth.currentUser;

    // Ensure the user is logged in.
    if (!user) {
      Alert.alert("Error", "You must be logged in to report a user.");
      return;
    }

    // Require at least one report reason.
    if (selectedReasons.length === 0) {
      Alert.alert("Select Reason", "Please select at least one reason.");
      return;
    }

    // Submit the user report to Firestore.
    try {
      await createReport({
        type: "User Report",
        title: `Reported User: ${buddy.fullName ?? buddy.email ?? "User"}`,
        description: `Reasons: ${selectedReasons.join(", ")}`,
        reasons: selectedReasons,
        reportedBy: user.email ?? "Student",
        relatedItemId: buddy.uid ?? buddy.id,
        relatedItemType: "user",
      });

      Alert.alert("Reported", "This user has been reported to the admin.");

      // Clear report selections.
      setReportingUser(null);
      setSelectedReasons([]);
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Failed to report user.");
    }
  };

  // Display loading indicator while data is loading.
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
      contentContainerStyle={{ paddingBottom: 200 }}
    >
      <Text style={styles.title}>Find Study Buddy 🤝</Text>
      <Text style={styles.subtitle}>
        Matched based on subject, focus level, study style, and availability.
      </Text>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            (currentProfile?.warningCount ?? 0) >= 3 && styles.disabledButton,
          ]}
          onPress={() => {
            if ((currentProfile?.warningCount ?? 0) >= 3) {
              Alert.alert(
                "Restricted",
                "Buddy requests are temporarily unavailable due to multiple warnings.",
              );
              return;
            }

            router.push("/requests");
          }}
        >
          <Text style={styles.actionText}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            (currentProfile?.warningCount ?? 0) >= 3 && styles.disabledButton,
          ]}
          onPress={() => {
            if ((currentProfile?.warningCount ?? 0) >= 3) {
              Alert.alert(
                "Restricted",
                "Study rooms are temporarily unavailable due to multiple warnings.",
              );
              return;
            }

            router.push("/rooms");
          }}
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

                  (connectingId === buddy.id ||
                    alreadySent ||
                    connected ||
                    (currentProfile?.warningCount ?? 0) >= 3) && {
                    opacity: 0.6,
                  },

                  connected && {
                    backgroundColor: "#22C55E",
                  },

                  (currentProfile?.warningCount ?? 0) >= 3 && {
                    backgroundColor: "#EF4444",
                  },
                ]}
                disabled={
                  connectingId === buddy.id ||
                  alreadySent ||
                  connected ||
                  (currentProfile?.warningCount ?? 0) >= 3
                }
                onPress={() => handleConnect(buddy)}
              >
                <Text style={styles.buttonText}>
                  {(currentProfile?.warningCount ?? 0) >= 3
                    ? "Restricted 🚫"
                    : connected
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
                onPress={() => {
                  setReportingUser(buddy);
                  setSelectedReasons([]);
                }}
              >
                Report User
              </Button>
            </View>
          );
        })
      )}
      <Portal>
        <Modal
          visible={!!reportingUser}
          onDismiss={() => {
            setReportingUser(null);
            setSelectedReasons([]);
          }}
          contentContainerStyle={styles.reportModal}
        >
          <Text style={styles.reportTitle}>
            Report {reportingUser?.fullName ?? "User"}
          </Text>

          {userReportReasons.map((reason) => (
            <Checkbox.Item
              key={reason}
              label={reason}
              status={
                selectedReasons.includes(reason) ? "checked" : "unchecked"
              }
              onPress={() => toggleReason(reason)}
            />
          ))}

          <Button
            mode="contained"
            disabled={selectedReasons.length === 0}
            onPress={() => handleReportUser(reportingUser)}
            style={styles.submitReportButton}
          >
            Submit Report
          </Button>

          <Button
            mode="text"
            onPress={() => {
              setReportingUser(null);
              setSelectedReasons([]);
            }}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>
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

  reportBox: {
    backgroundColor: "#F8F5FF",
    padding: 18,
    borderRadius: 18,
    marginTop: 20,
  },

  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  reportModal: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    margin: 24,
    borderRadius: 22,
  },

  submitReportButton: {
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: "#8B5CF6",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
