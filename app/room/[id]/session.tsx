import { db } from "@/config/firebase";
import {
    completeRoomSession,
    createRoomSession,
    getLatestRoomSession,
    listenRoomSession,
    updateRoomSession,
} from "@/src/services/roomSessionService";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function SharedRoomSessionScreen() {
  const { id } = useLocalSearchParams();
  const roomId = typeof id === "string" ? id : "";

  const [room, setRoom] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoomAndSession();
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = listenRoomSession(sessionId, (data) => {
      setSession(data);
    });

    return unsubscribe;
  }, [sessionId]);

  useEffect(() => {
    if (!session?.isRunning || session.secondsLeft <= 0 || !sessionId) return;

    const timer = setInterval(async () => {
      const newSeconds = session.secondsLeft - 1;

      await updateRoomSession(sessionId, {
        secondsLeft: newSeconds,
      });

      if (newSeconds <= 0) {
        await completeRoomSession(sessionId);
        Alert.alert("Session Completed 🎉", "Great job studying together!");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.isRunning, session?.secondsLeft, sessionId]);

  const loadRoomAndSession = async () => {
    if (!roomId) return;

    const roomRef = doc(db, "studyRooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      setLoading(false);
      return;
    }

    const roomData = { id: roomSnap.id, ...roomSnap.data() };
    setRoom(roomData);

    const latestSession: any = await getLatestRoomSession(roomId);

    if (latestSession && !latestSession.completed) {
      setSessionId(latestSession.id);
      setSession(latestSession);
    } else {
      const newSessionId = await createRoomSession(
        roomId,
        roomData.participants ?? [],
      );
      setSessionId(newSessionId);
    }

    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleStartPause = async () => {
    if (!sessionId || !session) return;

    await updateRoomSession(sessionId, {
      isRunning: !session.isRunning,
      startedAt: session.startedAt ?? serverTimestamp(),
    });
  };

  const handleReset = async () => {
    if (!sessionId) return;

    await updateRoomSession(sessionId, {
      secondsLeft: 25 * 60,
      isRunning: false,
      completed: false,
      endedAt: null,
    });
  };

  const handleCompleteEarly = async () => {
    if (!sessionId) return;

    await completeRoomSession(sessionId);
    Alert.alert(
      "Session Saved",
      "Your shared study session has been completed.",
    );
    router.replace("/(tabs)/rooms");
  };

  if (loading || !session) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const participantNames = room?.participantNames?.join(" & ") ?? "Study Room";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shared Study Session</Text>
      <Text style={styles.subtitle}>{participantNames}</Text>

      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{formatTime(session.secondsLeft)}</Text>
        <Text style={styles.statusText}>
          {session.isRunning ? "Studying together..." : "Paused"}
        </Text>
      </View>

      <Button
        mode="contained"
        style={styles.mainButton}
        onPress={handleStartPause}
      >
        {session.isRunning ? "Pause Session" : "Start Session"}
      </Button>

      <Button
        mode="outlined"
        style={styles.outlineButton}
        onPress={handleReset}
      >
        Reset
      </Button>

      <Button mode="text" onPress={handleCompleteEarly}>
        Complete Session
      </Button>

      <Button mode="text" onPress={() => router.back()}>
        Back to Room
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
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    marginTop: 8,
    marginBottom: 40,
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#8B5CF6",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  timerText: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statusText: {
    color: "#EDE9FE",
    marginTop: 8,
  },
  mainButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    paddingVertical: 6,
    marginBottom: 12,
  },
  outlineButton: {
    borderRadius: 24,
    marginBottom: 8,
  },
});
