import { auth } from "@/config/firebase";
import { askStudyAssistant } from "@/src/services/aiAssistantService";
import {
  getChatHistory,
  saveChatMessage,
} from "@/src/services/chatHistoryService";
import { getUserProfile } from "@/src/services/getUserProfile";
import { getUserSessions } from "@/src/services/getUserSessions";
import { calculateAnalytics } from "@/src/utils/calculateAnalytics";
import { generateAnalyticsInsights } from "@/src/utils/generateAnalyticsInsights";
import { generateStudyForecast } from "@/src/utils/generateStudyForecast";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function AssistantScreen() {
  // Store the user's current question input
  const [question, setQuestion] = useState("");

  // Store chat messages between the user and study assistant
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      text: "Hi 👋 I'm your NeuroSync Study Assistant. Ask me anything about studying, focus, productivity, or motivation.",
    },
  ]);

  // Store user profile and progress data for personalized AI responses
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);

  // Control loading state while the AI is generating an answer
  const [thinking, setThinking] = useState(false);

  // Send the user's question to the AI assistant
  const handleSend = async () => {
    // Prevent empty messages or duplicate requests while AI is responding
    //if (!question.trim() || thinking) return;

    if (!question.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Please ask a question.",
        },
      ]);
      return;
    }

    if (thinking) return;

    const userQuestion = question;

    // Create a user message object for the chat UI
    const userMessage = {
      role: "user",
      text: userQuestion,
    };

    // Display the user's message immediately
    setMessages((prev) => [...prev, userMessage]);

    // Clear input field and show thinking indicator
    setQuestion("");
    setThinking(true);

    try {
      // Request an AI response using the question and student progress data
      const answer = await askStudyAssistant(
        userQuestion,
        profile,
        analytics,
        insights,
        forecast,
      );

      // Create assistant message object from AI response
      const assistantMessage = {
        role: "assistant",
        text: answer,
      };

      // Display AI response in the chat
      setMessages((prev) => [...prev, assistantMessage]);

      const user = auth.currentUser;

      // Save the conversation to Firebase for chat history
      if (user) {
        await saveChatMessage(user.uid, userQuestion, answer);
      }
    } catch (error) {
      // Log error for debugging and show fallback message to user
      console.log("FULL AI ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I could not generate a response right now. Please try again.",
        },
      ]);
    } finally {
      // Stop thinking indicator after request completes
      setThinking(false);
    }
  };

  useEffect(() => {
    // Load user data, progress analytics, and previous chat history
    const loadProfile = async () => {
      const user = auth.currentUser;

      // Stop loading if no authenticated user is found
      if (!user) return;

      // Retrieve previous assistant chat history from Firebase
      const history = await getChatHistory(user.uid);

      if (history.length > 0) {
        const restoredMessages: any[] = [];

        // Rebuild chat messages from saved question-answer history
        history.forEach((item: any) => {
          restoredMessages.push({
            role: "user",
            text: item.question,
          });

          restoredMessages.push({
            role: "assistant",
            text: item.answer,
          });
        });

        setMessages(restoredMessages);
      }

      // Retrieve user profile for personalized assistant responses
      const profileData = await getUserProfile(user.uid);
      setProfile(profileData);

      // Retrieve study sessions and calculate progress analytics
      const sessions = await getUserSessions(user.uid);

      const analyticsResult = calculateAnalytics(sessions);
      setAnalytics(analyticsResult);

      // Generate study insights and forecast for AI context
      const insightResult = generateAnalyticsInsights(sessions);
      setInsights(insightResult);

      const forecastResult = generateStudyForecast(
        analyticsResult,
        insightResult,
      );

      setForecast(forecastResult);
    };

    loadProfile();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header with back button, title, and clear chat button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title}>Study Assistant 🤖</Text>

        <TouchableOpacity
          onPress={() =>
            setMessages([
              {
                role: "assistant",
                text: "Hi 👋 I'm your NeuroSync Study Assistant. Ask me anything about studying, focus, productivity, or motivation.",
              },
            ])
          }
        >
          <Ionicons name="trash-outline" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Chat message list */}
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";

          return (
            <View
              key={index}
              style={[
                styles.messageWrapper,
                isUser ? styles.userWrapper : styles.assistantWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[styles.messageText, isUser && { color: "#FFFFFF" }]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Temporary message shown while AI is generating a response */}
        {thinking && (
          <View style={styles.assistantWrapper}>
            <View style={styles.assistantBubble}>
              <Text style={styles.messageText}>
                🤖 NeuroSync is thinking...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick suggestion chips for common study-related questions */}
      <View style={styles.suggestionRow}>
        {[
          "Improve focus",
          "Create study plan",
          "I feel tired",
          "Exam tips",
        ].map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.suggestionChip}
            onPress={() => setQuestion(item)}
          >
            <Text style={styles.suggestionText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input area for typing and sending questions */}
      <View style={styles.inputRow}>
        <TextInput
          mode="outlined"
          placeholder="Ask something..."
          value={question}
          onChangeText={setQuestion}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSend}
          style={styles.sendButton}
          loading={thinking}
          disabled={thinking}
        >
          {thinking ? "..." : "Send"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    flex: 1,
  },

  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  messageWrapper: {
    marginBottom: 14,
    flexDirection: "row",
  },

  userWrapper: {
    justifyContent: "flex-end",
  },

  assistantWrapper: {
    justifyContent: "flex-start",
  },

  messageBubble: {
    padding: 14,
    borderRadius: 18,
    maxWidth: "85%",
  },

  userBubble: {
    backgroundColor: "#8B5CF6",
    borderBottomRightRadius: 4,
  },

  assistantBubble: {
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 10,
  },

  input: {
    flex: 1,
  },

  sendButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 14,
  },

  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },

  suggestionChip: {
    backgroundColor: "#F3E8FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  suggestionText: {
    color: "#8B5CF6",
    fontWeight: "bold",
    fontSize: 12,
  },
});
