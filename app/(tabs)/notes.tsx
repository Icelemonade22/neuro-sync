import { listenNotes } from "@/src/services/noteService";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";

export default function NotesScreen() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        notes.map((note) => (
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
                    content: note.content,
                  },
                })
              }
            >
              Generate Quiz
            </Button>
          </View>
        ))
      )}
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
});
