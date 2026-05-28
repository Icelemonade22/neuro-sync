import { db, storage } from "@/config/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { completeMission } from "./dailyMissionService";

const uriToBlob = (uri: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
      resolve(xhr.response);
    };

    xhr.onerror = function () {
      reject(new Error("Failed to convert file URI to blob."));
    };

    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
};

export async function uploadNote(
  fileUri: string,
  fileName: string,
  title: string,
  subject: string,
  content: string,
  uploadedBy: string,
) {
  const blob = await uriToBlob(fileUri);

  const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

  const storageRef = ref(storage, `notes/${Date.now()}-${safeFileName}`);

  await uploadBytes(storageRef, blob, {
    contentType: "application/pdf",
  });

  const fileUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, "notes"), {
    title,
    subject,
    content,
    fileName,
    fileUrl,
    uploadedBy,
    createdAt: serverTimestamp(),
  });

  await completeMission("note");
}

export function listenNotes(callback: (notes: any[]) => void) {
  const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(notes);
  });
}
