import { auth } from "@/config/firebase";
import { createReport } from "@/src/services/reportService";
import { getUserStudyRooms } from "@/src/services/studyRoomService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Button, Text } from "react-native-paper";

export default function RoomsScreen() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const data = await getUserStudyRooms(user.uid);
    setRooms(data);
    setLoading(false);
  };

  const handleReportRoom = async (room: any) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "You must be logged in to report a room.");
      return;
    }

    try {
      await createReport({
        type: "Inappropriate Content",
        title: `Reported Room: ${room.name ?? room.title ?? "Study Room"}`,
        description: `The study room "${
          room.name ?? room.title ?? "Study Room"
        }" was reported by a user.`,
        reportedBy: user.email ?? "Student",
        relatedItemId: room.id,
        relatedItemType: "room",
      });

      Alert.alert(
        "Reported",
        "This study room has been reported to the admin.",
      );
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Failed to report room.");
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Study Rooms</Text>
      <Text style={styles.subtitle}>
        Join rooms created with your accepted study buddies.
      </Text>

      {rooms.length === 0 ? (
        <Text style={styles.empty}>No study rooms yet.</Text>
      ) : (
        rooms.map((room) => (
          <View key={room.id} style={styles.card}>
            <Text style={styles.roomTitle}>Pomodoro Study Room</Text>

            <Text style={styles.detail}>
              Participants: {room.participantNames?.join(" & ")}
            </Text>

            <Text style={styles.detail}>Status: {room.status}</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push(`/room/${room.id}`)}
            >
              <Text style={styles.buttonText}>Join Room</Text>
            </TouchableOpacity>
            <Button
              mode="text"
              textColor="#EF4444"
              onPress={() => handleReportRoom(room)}
            >
              Report Room
            </Button>
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
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    color: "#777",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
  },
  card: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detail: {
    marginTop: 8,
    color: "#777",
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
});
