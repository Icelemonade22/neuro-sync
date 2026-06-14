import { auth } from "@/config/firebase";
import {
  createStudyRoomFromRequest,
  getIncomingBuddyRequests,
  updateBuddyRequestStatus,
} from "@/src/services/buddyRequestService";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";

export default function RequestsScreen() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  // Function to load incoming buddy requests for the current user, allowing them
  // to see any pending requests that have been sent to them.
  const loadRequests = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const data = await getIncomingBuddyRequests(user.uid);
    setRequests(data);
    setLoading(false);
  };

  // Load incoming buddy requests when the component mounts, allowing the user to see
  // any pending requests that have been sent to them.
  useEffect(() => {
    loadRequests();
  }, []);

  // Function to handle the user's response to a buddy request, allowing them to
  // accept or reject the request.
  const handleResponse = async (
    request: any,
    status: "accepted" | "rejected",
  ) => {
    // Update the status of the buddy request based on the user's response
    // (accept or reject).
    await updateBuddyRequestStatus(request.id, status);

    // If the request was accepted, attempt to create a study room based on the request.
    if (status === "accepted") {
      const result = await createStudyRoomFromRequest(request);

      Alert.alert(
        "Request Accepted",
        result.success
          ? "A study room has been created."
          : "A study room already exists.",
      );
    } else {
      Alert.alert("Request Rejected");
    }

    // Refresh the list of requests after responding to ensure the UI reflects
    // the latest state, such as removing the handled request from the list of
    // pending requests.
    loadRequests();
  };

  // Show a loading indicator while buddy requests are being fetched.
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Buddy Requests</Text>

      {requests.length === 0 ? (
        <Text style={styles.empty}>No pending buddy requests.</Text>
      ) : (
        requests.map((request) => (
          <View key={request.id} style={styles.card}>
            <Text style={styles.name}>{request.fromName}</Text>
            <Text style={styles.detail}>
              Compatibility: {request.compatibility}%
            </Text>

            <View style={styles.row}>
              <Button
                mode="contained"
                onPress={() => handleResponse(request, "accepted")}
              >
                Accept
              </Button>

              <Button
                mode="outlined"
                onPress={() => handleResponse(request, "rejected")}
              >
                Reject
              </Button>
            </View>
          </View>
        ))
      )}
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
  empty: {
    color: "#999",
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detail: {
    color: "#777",
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
});
