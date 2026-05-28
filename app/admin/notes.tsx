import { deleteNote, getAllNotes } from "@/src/services/adminService";
import { Ionicons } from "@expo/vector-icons";
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
import { Text } from "react-native-paper";

export default function AdminNotesScreen() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const data = await getAllNotes();
    setNotes(data);
    setLoading(false);
  };

  const handleDelete = async (noteId: string) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNote(noteId);

          setNotes((prev) => prev.filter((note) => note.id !== noteId));
        },
      },
    ]);
  };

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
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#111" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Notes Moderation 📚</Text>
      <Text style={styles.subtitle}>Review uploaded study materials.</Text>

      {notes.map((note) => (
        <View key={note.id} style={styles.card}>
          <Text style={styles.noteTitle}>📄 {note.title}</Text>
          <Text style={styles.detail}>Subject: {note.subject}</Text>
          <Text style={styles.detail}>Uploaded by: {note.uploadedBy}</Text>

          <TouchableOpacity
            style={styles.openButton}
            onPress={() => Linking.openURL(note.fileUrl)}
          >
            <Text style={styles.openText}>Open PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(note.id)}
          >
            <Text style={styles.deleteText}>Delete Note</Text>
          </TouchableOpacity>
        </View>
      ))}
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
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#777",
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#F8F5FF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#8B5CF6",
  },
  detail: {
    color: "#666",
    marginTop: 6,
  },
  openButton: {
    marginTop: 14,
    backgroundColor: "#8B5CF6",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  openText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#EF4444",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  deleteText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
