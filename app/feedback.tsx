import { auth } from "@/config/firebase";
import { createReport, ReportType } from "@/src/services/reportService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function FeedbackScreen() {
  const [type, setType] = useState<ReportType>("Suggestion");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const types: ReportType[] = [
    "Bug",
    "Suggestion",
    "Inappropriate Content",
    "User Report",
  ];

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user || !title || !description) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);

      await createReport({
        type,
        title,
        description,
        reportedBy: user.email ?? "Student",
        relatedItemType: "general",
      });

      Alert.alert("Submitted", "Your feedback has been sent to the admin.");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
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

        <Text style={styles.title}>Feedback & Reports 🚨</Text>
      </View>

      <Text style={styles.subtitle}>
        Send feedback, report bugs, or notify admins about platform issues.
      </Text>

      <Text style={styles.label}>Report Type</Text>

      <View style={styles.typeRow}>
        {types.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.typeChip, type === item && styles.activeChip]}
            onPress={() => setType(item)}
          >
            <Text
              style={type === item ? styles.activeChipText : styles.chipText}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        label="Title"
        mode="outlined"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        label="Description"
        mode="outlined"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={6}
        style={styles.descriptionInput}
      />

      <Button
        mode="contained"
        style={styles.submitButton}
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting}
      >
        Submit Feedback
      </Button>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  subtitle: {
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  typeChip: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  activeChip: {
    backgroundColor: "#8B5CF6",
  },
  chipText: {
    color: "#333",
    fontWeight: "600",
  },
  activeChipText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 14,
  },
  descriptionInput: {
    marginBottom: 20,
    minHeight: 140,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    paddingVertical: 6,
  },
});
