import { auth, db } from "@/config/firebase";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function RoomDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buddyStatus, setBuddyStatus] = useState<any>(null);
  const [buddyId, setBuddyId] = useState<string | null>(null);

  useEffect(() => {
    loadRoom();
  }, []);

  const loadRoom = async () => {
    if (!id || typeof id !== "string") return;

    const roomRef = doc(db, "studyRooms", id);
    const snap = await getDoc(roomRef);

    if (snap.exists()) {
      const roomData: any = {
        id: snap.id,
        ...snap.data(),
      };

      setRoom(roomData);

      const foundBuddyId = roomData.participants?.find(
        (participantId: string) => participantId !== auth.currentUser?.uid,
      );

      setBuddyId(foundBuddyId ?? null);

      const buddyId = roomData.participants?.find(
        (participantId: string) => participantId !== auth.currentUser?.uid,
      );

      if (buddyId) {
        const buddySnap = await getDoc(doc(db, "users", buddyId));

        if (buddySnap.exists()) {
          setBuddyStatus(buddySnap.data());
        }
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!buddyId) return;

    const unsubscribe = onSnapshot(doc(db, "users", buddyId), (snap) => {
      if (snap.exists()) {
        setBuddyStatus(snap.data());
      }
    });

    return unsubscribe;
  }, [buddyId]);

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

      <View style={styles.presenceRow}>
        <View
          style={[
            styles.presenceDot,
            {
              backgroundColor: buddyStatus?.online ? "#22C55E" : "#9CA3AF",
            },
          ]}
        />

        <Text style={styles.presenceText}>
          {buddyStatus?.online ? "Buddy Online" : "Buddy Offline"}
        </Text>
      </View>

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
  presenceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  presenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },

  presenceText: {
    color: "#6B7280",
    fontWeight: "600",
  },
});
