import { auth } from "@/config/firebase";
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/src/services/notificationCenterService";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const data = await getUserNotifications(user.uid);
    setNotifications(data);
    setLoading(false);
  };

  const handleMarkAllRead = async () => {
    const user = auth.currentUser;

    if (!user) return;

    await markAllNotificationsAsRead(user.uid);
    loadNotifications();
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, []),
  );

  const handleRead = async (id: string) => {
    await markNotificationAsRead(id);
    loadNotifications();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const formatNotificationTime = (createdAt: any) => {
    if (!createdAt?.toDate) return "";

    const date = createdAt.toDate();
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;

    return date.toLocaleDateString();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title}>Notifications 🔔</Text>
      </View>

      {notifications.some((item) => !item.read) && (
        <Button
          mode="outlined"
          style={styles.markAllButton}
          onPress={handleMarkAllRead}
        >
          Mark All as Read
        </Button>
      )}

      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet.</Text>
      ) : (
        notifications.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, !item.read && styles.unreadCard]}
            onPress={() => handleRead(item.id)}
          >
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>

            <Text style={styles.status}>
              {formatNotificationTime(item.createdAt)}
            </Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#F8F5FF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  unreadCard: {
    borderWidth: 1.5,
    borderColor: "#8B5CF6",
  },
  notificationTitle: {
    fontWeight: "bold",
    color: "#6D28D9",
    fontSize: 16,
  },
  message: {
    color: "#4B5563",
    marginTop: 6,
    lineHeight: 20,
  },
  status: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 10,
  },
  markAllButton: {
    borderRadius: 20,
    marginBottom: 18,
    borderColor: "#8B5CF6",
  },
});
