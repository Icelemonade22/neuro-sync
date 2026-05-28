import { auth, db } from "@/config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export async function getUserActiveRoom() {
  const user = auth.currentUser;

  if (!user) return null;

  const q = query(
    collection(db, "studyRooms"),
    where("participants", "array-contains", user.uid),
    where("status", "==", "active"),
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  const roomDoc = snap.docs[0];
  const roomData = roomDoc.data();

  const buddyId = roomData.participants.find((id: string) => id !== user.uid);

  let buddy = null;

  if (buddyId) {
    const buddySnap = await getDoc(doc(db, "users", buddyId));

    if (buddySnap.exists()) {
      buddy = buddySnap.data();
    }
  }

  return {
    id: roomDoc.id,
    ...roomData,
    buddy,
  };
}
