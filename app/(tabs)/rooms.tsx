import { auth } from "@/config/firebase";
import { getUserStudyRooms } from "@/src/services/studyRoomService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Text } from "react-native-paper";

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
