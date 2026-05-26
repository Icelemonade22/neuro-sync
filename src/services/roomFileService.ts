import { db, storage } from "@/config/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export async function uploadRoomFile(
  roomId: string,
  fileUri: string,
  fileName: string,
  uploadedBy: string,
) {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const storageRef = ref(
    storage,
    `roomFiles/${roomId}/${Date.now()}-${fileName}`,
  );

  await uploadBytes(storageRef, blob);

  const fileUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, "roomFiles"), {
    roomId,
    fileName,
    fileUrl,
    uploadedBy,
    createdAt: serverTimestamp(),
  });
}

export function listenRoomFiles(
  roomId: string,
  callback: (files: any[]) => void,
) {
  const q = query(
    collection(db, "roomFiles"),
    where("roomId", "==", roomId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    const files = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(files);
  });
}
