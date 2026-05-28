import AchievementModal from "@/components/achievementModal";
import { completeMission } from "@/src/services/dailyMissionService";
import { generateQuiz } from "@/src/services/quizService";
import { rewardQuizXp } from "@/src/services/xpService";
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
  const { title, subject, content } = useLocalSearchParams();

  const [questions, setQuestions] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState("Medium");
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [achievementVisible, setAchievementVisible] = useState(false);
  const [achievementData, setAchievementData] = useState({
    title: "",
    xp: 0,
  });

  const handleGenerateQuiz = async () => {
    try {
      setLoading(true);

      const result = await generateQuiz(
        String(title ?? "Study Note"),
        String(subject ?? "General"),
        String(content ?? ""),
        difficulty,
      );

      setQuestions(result);
      setSelectedAnswers({});
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const score = questions.reduce((total, q, index) => {
    return selectedAnswers[index] === q.answerIndex ? total + 1 : total;
  }, 0);

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

      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginBottom: 18,
        }}
      >
        {["Easy", "Medium", "Hard"].map((level) => (
          <TouchableOpacity
            key={level}
            onPress={() => setDifficulty(level)}
            style={{
              backgroundColor: difficulty === level ? "#8B5CF6" : "#EEE",
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: difficulty === level ? "#FFF" : "#333",
                fontWeight: "bold",
              }}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
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

      {questions.length > 0 ? (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.quizTitle}>Generated Quiz</Text>

          {questions.map((q, qIndex) => (
            <View key={qIndex} style={styles.quizBox}>
              <Text style={styles.question}>
                {qIndex + 1}. {q.question}
              </Text>

              {q.options.map((option: string, oIndex: number) => {
                const isSelected = selectedAnswers[qIndex] === oIndex;
                const isCorrect = q.answerIndex === oIndex;

                return (
                  <TouchableOpacity
                    key={oIndex}
                    style={[
                      styles.optionButton,
                      isSelected && styles.selectedOption,
                      submitted &&
                        isCorrect && {
                          backgroundColor: "#DCFCE7",
                          borderColor: "#22C55E",
                        },
                    ]}
                    onPress={() => {
                      if (!submitted) {
                        setSelectedAnswers({
                          ...selectedAnswers,
                          [qIndex]: oIndex,
                        });
                      }
                    }}
                  >
                    <Text>{option}</Text>
                  </TouchableOpacity>
                );
              })}

              {submitted && (
                <Text style={styles.explanation}>💡 {q.explanation}</Text>
              )}
            </View>
          ))}

          {!submitted ? (
            <Button
              mode="contained"
              style={styles.button}
              onPress={async () => {
                setSubmitted(true);

                const reward = await rewardQuizXp(score);

                await completeMission("quiz");

                setAchievementData({
                  title:
                    reward?.unlockedBadges?.[0] ??
                    `Quiz Completed: ${score}/${questions.length}`,
                  xp: reward?.xpEarned ?? score * 10,
                });

                setAchievementVisible(true);
              }}
            >
              Submit Quiz
            </Button>
          ) : (
            <View style={styles.scoreBox}>
              <Text style={styles.scoreText}>
                Your Score: {score}/{questions.length}
              </Text>

              <Text style={{ color: "#8B5CF6", marginTop: 8 }}>
                🎉 You earned {score * 10} XP
              </Text>
            </View>
          )}
        </View>
      ) : null}

      <AchievementModal
        visible={achievementVisible}
        title={achievementData.title}
        xp={achievementData.xp}
        onClose={() => setAchievementVisible(false)}
      />
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
  question: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
  },

  optionButton: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },

  selectedOption: {
    borderColor: "#8B5CF6",
    backgroundColor: "#F3E8FF",
  },

  explanation: {
    marginTop: 10,
    color: "#555",
    lineHeight: 20,
  },

  scoreBox: {
    backgroundColor: "#F8F5FF",
    padding: 18,
    borderRadius: 18,
    marginTop: 16,
    alignItems: "center",
  },

  scoreText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B5CF6",
  },
});
