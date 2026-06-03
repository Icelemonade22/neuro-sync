import { auth } from "@/config/firebase";
import { listenNotes } from "@/src/services/noteService";
import { createReport } from "@/src/services/reportService";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Checkbox,
  Chip,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";

export default function NotesScreen() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportingNote, setReportingNote] = useState<any>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");

  const subjects = [
    "All",
    ...Array.from(new Set(notes.map((note) => note.subject).filter(Boolean))),
  ];

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      note.subject?.toLowerCase().includes(searchText.toLowerCase());

    const matchesSubject =
      selectedSubject === "All" || note.subject === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  const noteReportReasons = [
    "Inappropriate content",
    "Irrelevant study material",
    "Misleading or incorrect information",
    "Spam or duplicate note",
    "Copyright or ownership concern",
    "Other",
  ];

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((item) => item !== reason)
        : [...prev, reason],
    );
  };

  const handleReportNote = async (note: any) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "You must be logged in to report a note.");
      return;
    }

    if (selectedReasons.length === 0) {
      Alert.alert("Select Reason", "Please select at least one reason.");
      return;
    }

    try {
      await createReport({
        type: "Inappropriate Content",
        title: `Reported Note: ${note.title}`,
        description: `Reasons: ${selectedReasons.join(", ")}`,
        reasons: selectedReasons,
        reportedBy: user.email ?? "Student",
        relatedItemId: note.id,
        relatedItemType: "note",
      });

      Alert.alert("Reported", "This note has been reported to the admin.");

      setReportingNote(null);
      setSelectedReasons([]);
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Failed to report note.");
    }
  };

  useEffect(() => {
    const unsubscribe = listenNotes((data) => {
      setNotes(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <Text style={styles.title}>Study Notes 📚</Text>

      <TextInput
        label="Search notes"
        mode="outlined"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.input}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {subjects.map((subject) => (
          <Chip
            key={subject}
            selected={selectedSubject === subject}
            onPress={() => setSelectedSubject(subject)}
            style={styles.chip}
          >
            {subject}
          </Chip>
        ))}
      </ScrollView>

      <Button
        mode="contained"
        style={styles.uploadButton}
        onPress={() => router.push("/uploadNote")}
      >
        Upload Note
      </Button>

      {notes.length === 0 ? (
        <Text style={styles.empty}>No notes uploaded yet.</Text>
      ) : (
        filteredNotes.map((note) => (
          <View key={note.id} style={styles.card}>
            <TouchableOpacity onPress={() => Linking.openURL(note.fileUrl)}>
              <Text style={styles.noteTitle}>📄 {note.title}</Text>
              <Text style={styles.detail}>{note.subject}</Text>
              <Text style={styles.detail}>Uploaded by {note.uploadedBy}</Text>
            </TouchableOpacity>

            <Button
              mode="outlined"
              style={styles.quizButton}
              onPress={() =>
                router.push({
                  pathname: "/quiz",
                  params: {
                    title: note.title,
                    subject: note.subject,
                    content: note.content ?? "",
                  },
                })
              }
            >
              Generate Quiz
            </Button>
            <Button
              mode="text"
              textColor="#EF4444"
              onPress={() => {
                setReportingNote(note);
                setSelectedReasons([]);
              }}
            >
              Report Note
            </Button>
          </View>
        ))
      )}

      <Portal>
        <Modal
          visible={!!reportingNote}
          onDismiss={() => {
            setReportingNote(null);
            setSelectedReasons([]);
          }}
          contentContainerStyle={styles.reportModal}
        >
          <Text style={styles.reportTitle}>
            Report {reportingNote?.title ?? "Note"}
          </Text>

          {noteReportReasons.map((reason) => (
            <Checkbox.Item
              key={reason}
              label={reason}
              status={
                selectedReasons.includes(reason) ? "checked" : "unchecked"
              }
              onPress={() => toggleReason(reason)}
            />
          ))}

          <Button
            mode="contained"
            disabled={selectedReasons.length === 0}
            onPress={() => handleReportNote(reportingNote)}
            style={styles.submitReportButton}
          >
            Submit Report
          </Button>

          <Button
            mode="text"
            onPress={() => {
              setReportingNote(null);
              setSelectedReasons([]);
            }}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>
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
  center: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    marginBottom: 24,
  },
  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#F8F5FF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B5CF6",
  },
  detail: {
    color: "#777",
    marginTop: 6,
  },
  quizButton: {
    marginTop: 12,
    borderRadius: 18,
  },
  reportModal: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    margin: 24,
    borderRadius: 22,
  },

  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  submitReportButton: {
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: "#8B5CF6",
  },

  chipContainer: {
    marginBottom: 16,
  },

  input: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },

  chip: {
    marginRight: 8,
    marginBottom: 16,
  },
});
