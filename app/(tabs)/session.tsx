import AchievementModal from "@/components/achievementModal";
import { auth, db } from "@/config/firebase";
import { playSound, stopSound } from "@/src/services/audioService";
import { completeMission } from "@/src/services/dailyMissionService";
import {
  awardUserXP,
  getStreakMultiplier,
  unlockBadge,
  updateStudyStreak,
} from "@/src/services/gamificationService";
import { getUserProfile } from "@/src/services/getUserProfile";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";

const TEST_MODE = true; // Set to false for production (25/60 min sessions)

export default function SessionScreen() {
  const [sessionDuration, setSessionDuration] = useState(30);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [sessionType, setSessionType] = useState("Pomodoro");
  const [isRunning, setIsRunning] = useState(false);

  const [achievementVisible, setAchievementVisible] = useState(false);
  const [savingSession, setSavingSession] = useState(false);

  const [modalHeading, setModalHeading] = useState("Session Completed!");
  const [modalEmoji, setModalEmoji] = useState("✅");

  const [achievementData, setAchievementData] = useState({
    title: "",
    xp: 0,
  });

  useEffect(() => {
    const loadSessionPreference = async () => {
      const user = auth.currentUser;

      if (!user) return;

      const profile = await getUserProfile(user.uid);

      const preferredSessionType =
        profile?.studyPreferences?.sessionType ?? "Pomodoro";

      const duration = TEST_MODE
        ? 30
        : preferredSessionType === "Long Session"
          ? 60 * 60
          : 25 * 60;

      setSessionType(preferredSessionType);
      setSessionDuration(duration);
      setSecondsLeft(duration);
    };

    loadSessionPreference();
  }, []);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      completeSession();
      setSecondsLeft(sessionDuration);
    }
  }, [secondsLeft, isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const completeSession = async () => {
    if (savingSession) return;

    setSavingSession(true);

    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "No user found.");
      setSavingSession(false);
      return;
    }

    try {
      await addDoc(collection(db, "studySessions"), {
        userId: user.uid,
        sessionType: sessionType,
        //durationMinutes: sessionDuration / 60,
        durationMinutes: TEST_MODE
          ? sessionType === "Long Session"
            ? 60
            : 25
          : sessionDuration / 60,
        completed: true,
        createdAt: serverTimestamp(),
      });

      const streak = await updateStudyStreak(user.uid);

      const multiplier = getStreakMultiplier(streak);

      const earnedXp = Math.round(20 * multiplier);

      await awardUserXP(user.uid, earnedXp);

      const missionCompleted = await completeMission("study");

      const unlocked = await unlockBadge(user.uid, "First Focus Session");

      setModalHeading(
        missionCompleted
          ? "Mission Completed!"
          : unlocked
            ? "Achievement Unlocked!"
            : "Session Completed!",
      );

      setModalEmoji(missionCompleted ? "🎯" : unlocked ? "🎉" : "✅");

      setAchievementData({
        title: missionCompleted
          ? "Complete 1 Focus Session Mission Completed"
          : unlocked
            ? "First Focus Session"
            : "Focus Session Completed",
        xp: missionCompleted ? 30 : earnedXp,
      });

      setAchievementVisible(true);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to save session.");
    } finally {
      setSavingSession(false);
    }
  };

  const resetSession = () => {
    setIsRunning(false);
    setSecondsLeft(sessionDuration);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Focus Session</Text>
      <Text style={styles.subtitle}>{sessionType} Mode</Text>

      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
      </View>

      <Button
        mode="contained"
        style={styles.startButton}
        onPress={() => setIsRunning((prev) => !prev)}
        disabled={savingSession}
      >
        {savingSession ? "Saving..." : isRunning ? "Pause" : "Start"}
      </Button>

      <Button mode="text" onPress={resetSession}>
        Reset
      </Button>

      <Button mode="text" onPress={() => router.back()}>
        Back
      </Button>

      <Text style={styles.musicTitle}>Focus Music 🎵</Text>

      <View style={styles.musicGrid}>
        <TouchableOpacity
          style={styles.musicCard}
          onPress={() => playSound(require("@/assets/audio/rain.mp3"))}
        >
          <Text style={styles.musicEmoji}>🌧️</Text>
          <Text style={styles.musicName}>Rain</Text>
          <Text style={styles.musicDesc}>Calm focus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.musicCard}
          onPress={() => playSound(require("@/assets/audio/cafe.mp3"))}
        >
          <Text style={styles.musicEmoji}>☕</Text>
          <Text style={styles.musicName}>Cafe</Text>
          <Text style={styles.musicDesc}>Soft ambience</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.musicCard}
          onPress={() => playSound(require("@/assets/audio/ocean.mp3"))}
        >
          <Text style={styles.musicEmoji}>🌊</Text>
          <Text style={styles.musicName}>Ocean</Text>
          <Text style={styles.musicDesc}>Relaxing waves</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.musicCard}
          onPress={() => playSound(require("@/assets/audio/lofi.mp3"))}
        >
          <Text style={styles.musicEmoji}>🎹</Text>
          <Text style={styles.musicName}>Lo-fi</Text>
          <Text style={styles.musicDesc}>Study beats</Text>
        </TouchableOpacity>
      </View>

      <Button
        mode="contained"
        style={styles.stopMusicButton}
        onPress={stopSound}
      >
        Stop Music
      </Button>

      <AchievementModal
        visible={achievementVisible}
        heading={modalHeading}
        emoji={modalEmoji}
        title={achievementData.title}
        xp={achievementData.xp}
        onClose={() => {
          setAchievementVisible(false);
          router.replace("/(tabs)");
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 180,
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
    marginBottom: 30,
  },

  timerCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 9,
    borderColor: "#8B5CF6",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    marginTop: 10,
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
    marginBottom: 10,
  },

  musicTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 26,
    marginBottom: 16,
  },

  musicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  musicCard: {
    width: "47%",
    backgroundColor: "#F8F5FF",
    borderRadius: 18,
    padding: 18,
    minHeight: 130,
    justifyContent: "center",
  },

  musicEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },

  musicName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#8B5CF6",
  },

  musicDesc: {
    color: "#777",
    marginTop: 6,
    fontSize: 12,
  },

  stopMusicButton: {
    marginTop: 20,
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    paddingVertical: 6,
    marginBottom: 40,
  },
});
