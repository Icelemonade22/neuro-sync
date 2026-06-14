// src/services/getStudyBuddies.ts
import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";

// This function retrieves a list of study buddies from the Firestore database,
export async function getStudyBuddies(currentUserId: string) {
  const snapshot = await getDocs(collection(db, "users"));

  // Map the Firestore documents to an array of user objects,
  // including the document ID.
  return (
    snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // Filter out the current user from the list of study buddies
      .filter((user: any) => user.uid !== currentUserId)
  );
}
