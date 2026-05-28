import { getAllStudyRooms } from "@/src/services/adminService";
import { Ionicons } from "@expo/vector-icons";
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

export default function AdminRoomsScreen() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    const data = await getAllStudyRooms();
    setRooms(data);
    setLoading(false);
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
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#111" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Study Room Monitoring 🏠</Text>
      <Text style={styles.subtitle}>Monitor active collaboration spaces.</Text>

      {rooms.map((room) => (
        <View key={room.id} style={styles.card}>
          <Text style={styles.roomTitle}>Study Room</Text>

          <Text style={styles.detail}>
            Participants: {room.participantNames?.join(" & ") ?? "Unknown"}
          </Text>

          <Text style={styles.detail}>
            Session Type: {room.sessionType ?? "Pomodoro"}
          </Text>

          <Text style={styles.status}>Status: {room.status ?? "active"}</Text>
        </View>
      ))}
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
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#777",
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#F8F5FF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B5CF6",
  },
  detail: {
    color: "#666",
    marginTop: 8,
  },
  status: {
    marginTop: 8,
    color: "#22C55E",
    fontWeight: "bold",
  },
});
