import { auth } from "@/config/firebase";
import { uploadNote } from "@/src/services/noteService";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function UploadNoteScreen() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    setFile(result.assets[0]);
  };

  const handleUpload = async () => {
    const user = auth.currentUser;

    if (!user || !file || !title || !subject) {
      Alert.alert(
        "Missing Information",
        "Please fill all fields and select a PDF.",
      );
      return;
    }

    try {
      setUploading(true);

      await uploadNote(
        file.uri,
        file.name,
        title,
        subject,
        user.email ?? "Student",
      );

      Alert.alert("Uploaded", "Your note has been uploaded.");
      router.back();
    } catch (error: any) {
      console.log("UPLOAD ERROR:", JSON.stringify(error, null, 2));
      console.log("UPLOAD ERROR RAW:", error);

      Alert.alert("Error", error?.message ?? "Failed to upload note.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Upload Note</Text>

      <TextInput
        label="Note Title"
        mode="outlined"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        label="Subject"
        mode="outlined"
        value={subject}
        onChangeText={setSubject}
        style={styles.input}
      />

      <Button mode="outlined" style={styles.button} onPress={pickFile}>
        {file ? `Selected: ${file.name}` : "Choose PDF"}
      </Button>

      <Button
        mode="contained"
        style={styles.uploadButton}
        onPress={handleUpload}
        loading={uploading}
        disabled={uploading}
      >
        Upload
      </Button>

      <Button mode="text" onPress={() => router.back()}>
        Cancel
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    marginBottom: 14,
  },
  button: {
    borderRadius: 20,
    marginBottom: 18,
  },
  uploadButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    marginBottom: 14,
  },
});
