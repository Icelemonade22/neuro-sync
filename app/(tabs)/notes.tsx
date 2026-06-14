import { auth } from "@/config/firebase";
import { deleteNote, listenNotes } from "@/src/services/noteService";
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

  // Extract the unique subjects from the notes to create filter chips
  const subjects = [
    "All",
    ...Array.from(new Set(notes.map((note) => note.subject).filter(Boolean))),
  ];

  // Filter the notes based on the search text and selected subject.
  const filteredNotes = notes.filter((note) => {
    // Check if the note's title or subject includes the search text (case-insensitive).
    const matchesSearch =
      note.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      note.subject?.toLowerCase().includes(searchText.toLowerCase());

    // Check if the note's subject matches the selected subject, or if "All"
    // is selected.
    const matchesSubject =
      selectedSubject === "All" || note.subject === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  // Define the reasons that users can select when reporting a note for
  // inappropriate content.
  const noteReportReasons = [
    "Inappropriate content",
    "Irrelevant study material",
    "Misleading or incorrect information",
    "Spam or duplicate note",
    "Copyright or ownership concern",
    "Other",
  ];

  // This function toggles the selection of a report reason when the user taps on
  // it in the report modal.
  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((item) => item !== reason)
        : [...prev, reason],
    );
  };

  // This function handles the process of reporting a note for inappropriate content.
  const handleReportNote = async (note: any) => {
    const user = auth.currentUser;

    // Ensure that the user is logged in before allowing them to report a note.
    // This is important for accountability and to prevent abuse of the reporting system.
    if (!user) {
      Alert.alert("Error", "You must be logged in to report a note.");
      return;
    }

    // Ensure that at least one reason is selected before allowing the user
    // to submit the report.
    if (selectedReasons.length === 0) {
      Alert.alert("Select Reason", "Please select at least one reason.");
      return;
    }

    try {
      // Create a report in Firestore with the selected reasons and note details.
      // The admin can review these reports to take appropriate action.
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

  // Handle note deletion for the note owner only
  const handleDeleteNote = (note: any) => {
    // Get the currently logged-in user
    const user = auth.currentUser;

    // Stop if no user is logged in
    if (!user) return;

    // Allow deletion only if the note belongs to the current user
    if (note.userId !== user.uid) {
      Alert.alert("Not Allowed", "You can only delete your own notes.");
      return;
    }

    // Ask for confirmation before deleting the note.
    Alert.alert(
      "Delete Note",
      `Are you sure you want to delete "${note.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete the note from Firestore/Storage through the service function
              await deleteNote(note.id);
              Alert.alert("Deleted", "Your note has been deleted.");

              // The real-time listener updates the notes list automatically
            } catch (error: any) {
              Alert.alert("Error", error?.message ?? "Failed to delete note.");
            }
          },
        },
      ],
    );
  };

  // Set up a listener to fetch notes from Firestore in real-time when the component
  // mounts.
  useEffect(() => {
    const start = Date.now();

    const unsubscribe = listenNotes((data) => {
      setNotes(data);
      setLoading(false);

      const end = Date.now();

      console.log(`Notes Load Time: ${end - start} ms`);
    });

    // Clean up the listener when the component unmounts to prevent memory leaks and
    // unnecessary updates.
    return unsubscribe;
  }, []);

  // Show a loading indicator while the notes are being fetched from Firestore.
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
      contentContainerStyle={{ paddingBottom: 210 }}
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

            {note.userId === auth.currentUser?.uid && (
              <Button
                mode="text"
                textColor="#EF4444"
                onPress={() => handleDeleteNote(note)}
              >
                Delete Note
              </Button>
            )}
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
