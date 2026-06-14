import { db, storage } from "@/config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { completeMission } from "./dailyMissionService";

// Utility function to convert a file URI to a Blob object,
// which can be uploaded to Firebase Storage.
const uriToBlob = (uri: string): Promise<Blob> => {
  // This function creates a new XMLHttpRequest to fetch the file from the given URI.
  return new Promise((resolve, reject) => {
    // Create a new XMLHttpRequest object to handle the file retrieval.
    const xhr = new XMLHttpRequest();

    // Set up the onload event handler to resolve the promise with the response blob
    xhr.onload = function () {
      resolve(xhr.response);
    };

    // Set up the onerror event handler to reject the promise if there's an
    // error during the file retrieval.
    xhr.onerror = function () {
      reject(new Error("Failed to convert file URI to blob."));
    };

    // Set the response type to "blob" so that the response will be a Blob object.
    xhr.responseType = "blob";
    // Open a GET request to the specified URI and send the request to retrieve the file.
    xhr.open("GET", uri, true);
    // Send the request to fetch the file from the URI. The response will be
    // handled by the onload and onerror event handlers defined above.
    xhr.send(null);
  });
};

// This function handles the process of uploading a note to
// Firebase Storage and Firestore.
export async function uploadNote(
  fileUri: string,
  fileName: string,
  title: string,
  subject: string,
  content: string,
  uploadedBy: string,
  userId: string,
) {
  // Convert the file URI to a Blob object, which can be uploaded to Firebase Storage.
  const blob = await uriToBlob(fileUri);

  // Sanitize the file name by replacing any characters that are not alphanumeric
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

  // Create a reference to the location in Firebase Storage where the file will
  // be uploaded.
  const storageRef = ref(storage, `notes/${Date.now()}-${safeFileName}`);

  // Upload the Blob to Firebase Storage with the appropriate content type.
  await uploadBytes(storageRef, blob, {
    contentType: "application/pdf",
  });

  // Get the download URL for the uploaded file, which will be stored in Firestore
  const fileUrl = await getDownloadURL(storageRef);

  // Add a new document to the "notes" collection in Firestore with the note's details
  await addDoc(collection(db, "notes"), {
    title,
    subject,
    content,
    userId,
    fileName,
    fileUrl,
    uploadedBy,
    createdAt: serverTimestamp(),
  });

  // Mark the "note" mission as complete for the user, which may involve updating
  // the user's progress
  await completeMission("note");
}

// This function sets up a real-time listener for changes to the "notes" collection
// in Firestore.
export function listenNotes(callback: (notes: any[]) => void) {
  // Create a query to retrieve notes from the "notes" collection,
  // ordered by creation time in descending order
  const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));

  // Set up a real-time listener using onSnapshot, which will call the provided callback
  return onSnapshot(q, (snapshot) => {
    // Map the snapshot documents to an array of note objects, including the document
    // ID and data
    const notes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Call the provided callback function with the array of notes whenever
    // there is a change
    callback(notes);
  });
}

// This function deletes a note from the "notes" collection in Firestore
// based on the provided note ID.
export async function deleteNote(noteId: string) {
  // Delete the document with the specified note ID from the "notes" collection in
  // Firestore.
  await deleteDoc(doc(db, "notes", noteId));
}
