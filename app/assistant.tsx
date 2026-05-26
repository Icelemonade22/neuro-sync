import { auth } from "@/config/firebase";
import { askStudyAssistant } from "@/src/services/aiAssistantService";
import { getUserProfile } from "@/src/services/getUserProfile";
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
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      text: "Hi 👋 I'm your NeuroSync Study Assistant. Ask me anything about studying, focus, productivity, or motivation.",
    },
  ]);
  const [profile, setProfile] = useState<any>(null);
  const [thinking, setThinking] = useState(false);

  const handleSend = async () => {
    if (!question.trim() || thinking) return;

    const userQuestion = question;

    const userMessage = {
      role: "user",
      text: userQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setThinking(true);

    try {
      const answer = await askStudyAssistant(userQuestion, profile);

      const assistantMessage = {
        role: "assistant",
        text: answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.log("FULL AI ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, I could not generate a response right now. Please try again.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const data = await getUserProfile(user.uid);
      setProfile(data);
    };

    loadProfile();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title}>Study Assistant 🤖</Text>
      </View>

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
      </ScrollView>

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
