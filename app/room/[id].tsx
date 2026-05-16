import { auth, db } from "@/config/firebase";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function RoomDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoom();
  }, []);

  const loadRoom = async () => {
    if (!id || typeof id !== "string") return;

    const roomRef = doc(db, "studyRooms", id);
    const snap = await getDoc(roomRef);

    if (snap.exists()) {
      setRoom({ id: snap.id, ...snap.data() });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Room not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  const currentUser = auth.currentUser;
  const partnerNames = room.participantNames?.join(" & ") ?? "Study Room";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Room 📚</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Participants</Text>
        <Text style={styles.value}>{partnerNames}</Text>

        <Text style={styles.label}>Session Type</Text>
        <Text style={styles.value}>{room.sessionType ?? "Pomodoro"}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={styles.status}>{room.status ?? "active"}</Text>
      </View>

      <View style={styles.timerBox}>
        <Text style={styles.timer}>25:00</Text>
        <Text style={styles.timerSub}>Shared Pomodoro Session</Text>
      </View>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() => router.push(`/room/${room.id}/session`)}
      >
        Start Shared Session
      </Button>

      <Button mode="text" onPress={() => router.back()}>
        Back to Rooms
      </Button>
    </View>
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
  card: {
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  label: {
    color: "#999",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  status: {
    color: "#22C55E",
    fontWeight: "bold",
    marginTop: 4,
  },
  timerBox: {
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    marginBottom: 24,
  },
  timer: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  timerSub: {
    color: "#EDE9FE",
    marginTop: 8,
  },
  button: {
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    paddingVertical: 6,
  },
});
