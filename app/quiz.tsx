import { generateQuiz } from "@/src/services/quizService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Button, Text } from "react-native-paper";

export default function QuizScreen() {
  const { title, subject } = useLocalSearchParams();

  const [quiz, setQuiz] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateQuiz = async () => {
    try {
      setLoading(true);

      const result = await generateQuiz(
        String(title ?? "Study Note"),
        String(subject ?? "General"),
      );

      setQuiz(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title}>AI Quiz Generator 🧠</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Note</Text>
        <Text style={styles.noteTitle}>{String(title ?? "Study Note")}</Text>

        <Text style={styles.label}>Subject</Text>
        <Text style={styles.subject}>{String(subject ?? "General")}</Text>
      </View>

      <Button
        mode="contained"
        style={styles.button}
        onPress={handleGenerateQuiz}
        disabled={loading}
        loading={loading}
      >
        Generate Quiz
      </Button>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Generating quiz...</Text>
        </View>
      )}

      {quiz ? (
        <View style={styles.quizBox}>
          <Text style={styles.quizTitle}>Generated Quiz</Text>
          <Text style={styles.quizText}>{quiz}</Text>
        </View>
      ) : null}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#F8F5FF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    color: "#999",
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 8,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B5CF6",
    marginTop: 6,
  },
  subject: {
    fontSize: 16,
    color: "#555",
    marginTop: 6,
  },
  button: {
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    paddingVertical: 6,
  },
  loadingBox: {
    marginTop: 24,
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: "#777",
  },
  quizBox: {
    marginTop: 24,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    padding: 18,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  quizText: {
    color: "#333",
    lineHeight: 22,
  },
});
