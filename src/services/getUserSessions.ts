import { db } from "@/config/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

// Fetch all study sessions for the current user
export async function getUserSessions(uid: string) {
  // Query study sessions filtered by user and sorted by creation date
  const q = query(
    collection(db, "studySessions"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
  );

  // Execute query and fetch matching documents
  const snapshot = await getDocs(q);

  // Return formatted session data including document IDs
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
