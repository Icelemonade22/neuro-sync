//app/room/[id]/session.tsx
import AchievementModal from "@/components/achievementModal";
import { auth, db } from "@/config/firebase";
import {
  awardUserXP,
  unlockBadge,
  updateStudyStreak,
} from "@/src/services/gamificationService";
import { createInAppNotification } from "@/src/services/notificationCenterService";
import {
  listenRoomMessages,
  sendRoomMessage,
} from "@/src/services/roomChatService";
import {
  listenRoomFiles,
  uploadRoomFile,
} from "@/src/services/roomFileService";
import {
  completeRoomSession,
  createRoomSession,
  getLatestRoomSession,
  listenRoomSession,
  updateParticipantPresence,
  updateRoomSession,
} from "@/src/services/roomSessionService";
import * as DocumentPicker from "expo-document-picker";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

//const SESSION_DURATION = 25 * 60; // 25 minutes in seconds
const SESSION_DURATION = 30;

export default function SharedRoomSessionScreen() {
  // Shared study room session screen.
  // Allows users to:
  // - Participate in a synchronized study session
  // - Chat with study partners
  // - Share PDF study materials
  // - Join a video meeting
  // - Earn XP, badges, and streak rewards
  const { id } = useLocalSearchParams();
  const roomId = typeof id === "string" ? id : "";

  const [room, setRoom] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");

  const [files, setFiles] = useState<any[]>([]);

  const [achievementVisible, setAchievementVisible] = useState(false);

  const [rewardShown, setRewardShown] = useState(false);

  const [achievementData, setAchievementData] = useState({
    title: "",
    xp: 0,
  });

  const [activeTab, setActiveTab] = useState("chat");

  // Load room and session data when the screen opens
  useEffect(() => {
    loadRoomAndSession();
  }, []);

  // Listen for real-time session updates from Firestore.
  // Keeps the timer synchronized across all participants.
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = listenRoomSession(sessionId, (data) => {
      setSession(data);
    });

    return unsubscribe;
  }, [sessionId]);

  useEffect(() => {
    if (!session?.completed || rewardShown) return;

    setRewardShown(true);
    rewardSharedSession();
  }, [session?.completed]);

  // Session countdown timer.
  // Only the host updates the timer to prevent multiple users
  // from changing the countdown at the same time.
  useEffect(() => {
    const currentUserId = auth.currentUser?.uid;

    // Stop execution when:
    // - the session is not running
    // - the countdown has already finished
    // - there is no active session ID
    // - the current user is not the session host
    if (
      !session?.isRunning ||
      session.secondsLeft <= 0 ||
      !sessionId ||
      session.hostId !== currentUserId
    ) {
      return;
    }

    // Execute every second to update the countdown timer
    const timer = setInterval(async () => {
      const nextSeconds = session.secondsLeft - 1;

      // When the timer reaches zero,
      // mark the session as completed and record the end time
      if (nextSeconds <= 0) {
        await updateRoomSession(sessionId, {
          secondsLeft: 0,
          isRunning: false,
          completed: true,
          endedAt: serverTimestamp(),
        });

        // Trigger session completion logic
        await completeRoomSession(sessionId);
        return;
      }

      // Update the remaining time in Firestore
      // so all participants receive synchronized timer updates
      await updateRoomSession(sessionId, {
        secondsLeft: nextSeconds,
      });
    }, 1000);

    // Clean up the timer when the component re-renders
    // or when the user leaves the screen
    return () => clearInterval(timer);
  }, [session?.isRunning, session?.secondsLeft, sessionId]);

  // Track participant presence in the room.
  // Marks the current user as online when they enter
  // and offline when they leave.
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!sessionId || !currentUser) return;

    updateParticipantPresence(sessionId, currentUser.uid, {
      name: currentUser.email ?? "Student",
      status: "ready",
      online: true,
    });

    return () => {
      updateParticipantPresence(sessionId, currentUser.uid, {
        name: currentUser.email ?? "Student",
        status: "offline",
        online: false,
      });
    };
  }, [sessionId]);

  // Listen for real-time chat messages in the study room
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = listenRoomMessages(roomId, (msgs) => {
      setMessages(msgs);
    });

    return unsubscribe;
  }, [roomId]);

  // Listen for PDF files shared by room participants
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = listenRoomFiles(roomId, (roomFiles) => {
      setFiles(roomFiles);
    });

    return unsubscribe;
  }, [roomId]);

  // Load room information and retrieve the latest active session.
  // If no active session exists, create a new shared study session.
  const loadRoomAndSession = async () => {
    if (!roomId) return;

    const roomRef = doc(db, "studyRooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      setLoading(false);
      return;
    }

    const roomData: any = {
      id: roomSnap.id,
      ...roomSnap.data(),
    };
    setRoom(roomData);

    const latestSession: any = await getLatestRoomSession(roomId);

    if (latestSession && !latestSession.completed) {
      setSessionId(latestSession.id);
      setSession(latestSession);
    } else {
      const newSessionId = await createRoomSession(
        roomId,
        roomData.participants ?? [],
        auth.currentUser?.uid ?? "",
      );

      setSessionId(newSessionId);

      setSession({
        id: newSessionId,
        roomId,
        participants: roomData.participants ?? [],
        hostId: auth.currentUser?.uid ?? "",
        durationMinutes: 25,
        secondsLeft: SESSION_DURATION,
        isRunning: false,
        completed: false,
      });
    }

    setLoading(false);
  };

  // Convert seconds into MM:SS format for the countdown timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Start or pause the shared study session.
  const handleStartPause = async () => {
    if (!sessionId || !session) return;

    const isStarting = !session.isRunning;
    const currentUser = auth.currentUser;

    console.log("SESSION START CLICKED");
    console.log("isStarting:", isStarting);
    console.log("currentUser:", currentUser?.uid);
    console.log("room participants:", room?.participants);

    await updateRoomSession(sessionId, {
      isRunning: isStarting,
      startedAt: session.startedAt ?? serverTimestamp(),
    });

    // Notifies other participants when the session starts.
    if (isStarting && room?.participants?.length > 0) {
      const targetUsers = room.participants.filter(
        (userId: string) => userId !== currentUser?.uid,
      );

      console.log("notification targets:", targetUsers);

      await Promise.all(
        targetUsers.map((userId: string) =>
          createInAppNotification({
            userId,
            title: "Shared session started 🎯",
            message: `${
              currentUser?.email ?? "A study partner"
            } started a shared study session.`,
            type: "session",
          }),
        ),
      );

      console.log("notifications created");
    }
  };

  // Reset the current study session to its initial state
  const handleReset = async () => {
    // Stop if there is no active session
    if (!sessionId) return;

    // Restore the original session duration and clear completion status
    await updateRoomSession(sessionId, {
      secondsLeft: SESSION_DURATION,
      isRunning: false,
      completed: false,
      endedAt: null,
    });
  };

  // Complete the study session before the timer reaches zero
  const handleCompleteEarly = async () => {
    if (!sessionId) return;

    await completeRoomSession(sessionId);
  };

  // Display a loading indicator while room and session data are being retrieved
  if (loading || !session) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  // Format participant names for display in the shared study room
  const participantNames = room?.participantNames?.join(" & ") ?? "Study Room";

  // Send a chat message to the shared study room
  const handleSendMessage = async () => {
    // Prevent sending empty messages or messages from unauthenticated users
    if (!auth.currentUser || !messageText.trim()) return;

    // Save the message to Firestore so all participants can see it in real time
    await sendRoomMessage(
      roomId,
      auth.currentUser.uid,
      auth.currentUser.email ?? "Student",
      messageText,
    );

    // Notify other room participants about the new message
    if (room?.participants?.length > 0) {
      await Promise.all(
        room.participants
          .filter((userId: string) => userId !== auth.currentUser?.uid)
          .map((userId: string) =>
            createInAppNotification({
              userId,
              title: "💬 New Room Message",
              message: `${
                auth.currentUser?.email ?? "A study partner"
              } sent a message in your study room.`,
              type: "message",
            }),
          ),
      );
    }

    // Clear the message input after successful delivery
    setMessageText("");
  };

  // Upload a PDF study resource to the shared study room
  const handleUploadFile = async () => {
    // Open the device file picker and allow PDF files only
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    // Stop if the user cancels file selection
    if (result.canceled) return;

    const file = result.assets[0];

    // Get the currently logged-in user
    const user = auth.currentUser;

    // Stop if no authenticated user is found
    if (!user) return;

    // Upload the selected PDF file to the shared room
    await uploadRoomFile(roomId, file.uri, file.name, user.email ?? "Student");
  };

  // Format chat message timestamps into a readable HH:MM format
  const formatMessageTime = (createdAt: any) => {
    // Return an empty string if the timestamp is unavailable
    if (!createdAt) return "";

    // Convert Firestore timestamp into a JavaScript Date object
    const date = createdAt.toDate();

    // Display only hours and minutes in the chat interface
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const rewardSharedSession = async () => {
    const user = auth.currentUser;

    if (!user) return;

    await awardUserXP(user.uid, 30);
    await updateStudyStreak(user.uid);

    const unlocked = await unlockBadge(user.uid, "Collaborative Learner");

    setAchievementData({
      title: unlocked ? "Collaborative Learner" : "Shared Session Completed",
      xp: 30,
    });

    setAchievementVisible(true);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Shared Study Session</Text>
      <Text style={styles.subtitle}>{participantNames}</Text>

      {/* PARTICIPANTS PRESENCE */}
      <View style={styles.presenceContainer}>
        {session?.presence &&
          Object.entries(session.presence).map(([uid, user]: any) => (
            <View key={uid} style={styles.presenceCard}>
              <Text style={styles.presenceName}>
                {user.online ? "🟢" : "⚪"} {user.name}
              </Text>

              <Text style={styles.presenceStatus}>{user.status}</Text>
            </View>
          ))}
      </View>

      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{formatTime(session.secondsLeft)}</Text>
        <Text style={styles.statusText}>
          {session.secondsLeft <= 0
            ? "Session completed 🎉"
            : session.isRunning
              ? "Studying together..."
              : "Paused"}
        </Text>
      </View>

      <View style={styles.meetingCard}>
        <Text style={styles.meetingTitle}>📹 Online Meeting</Text>

        <Text style={styles.meetingSubtitle}>
          Join a live video call with your study partner during this shared
          session.
        </Text>

        <Button
          mode="contained"
          icon="video"
          style={styles.meetingButton}
          onPress={() => {
            {
              /* Generate a unique Jitsi meeting room name based on the study room name */
            }
            const meetingName =
              room?.name?.replace(/\s+/g, "-").toLowerCase() ??
              `room-${roomId}`;

            {
              /* Open the shared video meeting for room participants */
            }
            Linking.openURL(`https://meet.jit.si/neurosync-${meetingName}`);
          }}
        >
          Join Meeting
        </Button>
      </View>

      {/* <Button
        mode="contained"
        style={styles.mainButton}
        onPress={session.secondsLeft <= 0 ? handleReset : handleStartPause}
      >
        {session.secondsLeft <= 0
          ? "Start New Session"
          : session.isRunning
            ? "Pause Session"
            : "Start Session"}
      </Button> */}

      {session.secondsLeft <= 0 ? (
        <Button
          mode="contained"
          style={styles.mainButton}
          onPress={handleReset}
        >
          Start New Session
        </Button>
      ) : (
        <Button
          mode="contained"
          style={styles.mainButton}
          onPress={handleStartPause}
        >
          {session.isRunning ? "Pause Session" : "Start Session"}
        </Button>
      )}

      {session.secondsLeft > 0 && (
        <>
          <Button
            mode="outlined"
            style={styles.outlineButton}
            onPress={handleReset}
          >
            Reset
          </Button>
          {/*<Button mode="text" onPress={handleCompleteEarly}>
            Complete Session
          </Button>*/}
        </>
      )}

      <Button mode="text" onPress={() => router.back()}>
        Back to Room
      </Button>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "chat" && styles.activeTab]}
          onPress={() => setActiveTab("chat")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "chat" && styles.activeTabText,
            ]}
          >
            Chat 💬
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "notes" && styles.activeTab]}
          onPress={() => setActiveTab("notes")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "notes" && styles.activeTabText,
            ]}
          >
            Notes 📄
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "chat" && (
        <View style={styles.chatContainer}>
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {messages.map((msg) => {
              const isMine = msg.senderId === auth.currentUser?.uid;

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageWrapper,
                    isMine
                      ? styles.myMessageWrapper
                      : styles.otherMessageWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMine
                        ? styles.myMessageBubble
                        : styles.otherMessageBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageSender,
                        isMine && { color: "#FFFFFF" },
                      ]}
                    >
                      {msg.senderName}
                    </Text>

                    <Text
                      style={[
                        styles.messageText,
                        isMine && { color: "#FFFFFF" },
                      ]}
                    >
                      {msg.message}
                    </Text>

                    <Text
                      style={[
                        styles.messageTime,
                        isMine && { color: "#EDE9FE" },
                      ]}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <TextInput
            mode="outlined"
            placeholder="Type message..."
            value={messageText}
            onChangeText={setMessageText}
            style={styles.chatInput}
          />

          <Button
            mode="contained"
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            Send
          </Button>
        </View>
      )}

      {activeTab === "notes" && (
        <View>
          <Button
            mode="contained"
            style={styles.uploadButton}
            onPress={handleUploadFile}
          >
            Upload PDF
          </Button>

          <View style={styles.filesContainer}>
            {files.map((file) => (
              <TouchableOpacity
                key={file.id}
                style={styles.fileCard}
                onPress={() => Linking.openURL(file.fileUrl)}
              >
                <Text style={styles.fileName}>📄 {file.fileName}</Text>

                <Text style={styles.fileUploader}>
                  Uploaded by {file.uploadedBy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <AchievementModal
        visible={achievementVisible}
        title={achievementData.title}
        xp={achievementData.xp}
        onClose={() => {
          setAchievementVisible(false);
          router.replace("/(tabs)/rooms");
        }}
      />
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
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    marginTop: 8,
    marginBottom: 40,
  },
  timerCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#8B5CF6",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  timerText: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statusText: {
    color: "#EDE9FE",
    marginTop: 8,
  },
  mainButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    paddingVertical: 6,
    marginBottom: 12,
  },
  outlineButton: {
    borderRadius: 24,
    marginBottom: 8,
  },
  presenceContainer: {
    marginBottom: 24,
  },

  presenceCard: {
    backgroundColor: "#F5F3FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  presenceName: {
    fontWeight: "bold",
  },

  presenceStatus: {
    color: "#777",
    marginTop: 4,
  },

  chatContainer: {
    marginTop: 10,
    paddingBottom: 30,
  },

  chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  messagesContainer: {
    maxHeight: 220,
    marginBottom: 16,
  },

  chatInput: {
    marginBottom: 12,
  },

  sendButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 20,
    marginBottom: 10,
    paddingVertical: 4,
  },

  messageWrapper: {
    marginBottom: 12,
    flexDirection: "row",
  },

  myMessageWrapper: {
    justifyContent: "flex-end",
  },

  otherMessageWrapper: {
    justifyContent: "flex-start",
  },

  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "80%",
  },

  myMessageBubble: {
    backgroundColor: "#8B5CF6",
    borderBottomRightRadius: 4,
  },

  otherMessageBubble: {
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 4,
  },

  messageSender: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 12,
  },

  messageText: {
    fontSize: 15,
  },

  filesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 16,
  },

  uploadButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 20,
    marginBottom: 18,
  },

  filesContainer: {
    gap: 12,
    marginBottom: 40,
  },

  fileCard: {
    backgroundColor: "#F8F5FF",
    borderRadius: 16,
    padding: 16,
  },

  fileName: {
    fontWeight: "bold",
    color: "#8B5CF6",
  },

  fileUploader: {
    color: "#777",
    marginTop: 6,
    fontSize: 12,
  },

  messageTime: {
    fontSize: 10,
    color: "#999",
    marginTop: 6,
    alignSelf: "flex-end",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 4,
    marginTop: 30,
    marginBottom: 20,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#8B5CF6",
  },

  tabText: {
    color: "#6B7280",
    fontWeight: "600",
  },

  activeTabText: {
    color: "#FFFFFF",
  },

  meetingCard: {
    backgroundColor: "#F8F5FF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  meetingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6D28D9",
    marginBottom: 8,
  },

  meetingSubtitle: {
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 14,
  },

  meetingButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 20,
  },
});
