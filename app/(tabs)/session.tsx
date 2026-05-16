import { auth, db } from "@/config/firebase";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function SessionScreen() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) {
      setIsRunning(false);
      completeSession();
    }
  }, [secondsLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const completeSession = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "No user found.");
      return;
    }

    await addDoc(collection(db, "studySessions"), {
      userId: user.uid,
      sessionType: "Pomodoro",
      durationMinutes: 25,
      completed: true,
      createdAt: serverTimestamp(),
    });

    Alert.alert("Session Completed 🎉", "Great job staying focused!", [
      {
        text: "Back to Dashboard",
        onPress: () => router.replace("/(tabs)"),
      },
    ]);
  };

  const resetSession = () => {
    setIsRunning(false);
    setSecondsLeft(25 * 60);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focus Session</Text>
      <Text style={styles.subtitle}>Pomodoro Mode</Text>

      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
      </View>

      <Button
        mode="contained"
        style={styles.startButton}
        onPress={() => setIsRunning((prev) => !prev)}
      >
        {isRunning ? "Pause" : "Start"}
      </Button>

      <Button mode="text" onPress={resetSession}>
        Reset
      </Button>

      <Button mode="text" onPress={() => router.back()}>
        Back
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#888",
    marginTop: 8,
    marginBottom: 40,
  },
  timerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 10,
    borderColor: "#8B5CF6",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#8B5CF6",
  },
  startButton: {
    borderRadius: 24,
    paddingVertical: 6,
    backgroundColor: "#8B5CF6",
  },
});
