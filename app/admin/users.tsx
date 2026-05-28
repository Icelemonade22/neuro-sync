import { getAllUsers } from "@/src/services/adminService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Text } from "react-native-paper";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
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

      <Text style={styles.title}>User Management 👥</Text>
      <Text style={styles.subtitle}>
        Monitor users, XP, streaks, and activity.
      </Text>

      {users.map((user) => (
        <View key={user.id} style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>{user.fullName ?? "Student"}</Text>
              <Text style={styles.email}>{user.email ?? "No email"}</Text>
            </View>

            <Text style={styles.status}>
              {user.online ? "🟢 Online" : "⚪ Offline"}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.stat}>Level {user.level ?? 1}</Text>
            <Text style={styles.stat}>{user.xp ?? 0} XP</Text>
            <Text style={styles.stat}>🔥 {user.streak ?? 0}</Text>
          </View>

          <Text style={styles.role}>Role: {user.role ?? "user"}</Text>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111",
  },
  email: {
    color: "#777",
    marginTop: 4,
  },
  status: {
    fontWeight: "600",
    color: "#555",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  stat: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    color: "#8B5CF6",
    fontWeight: "bold",
  },
  role: {
    marginTop: 12,
    color: "#666",
  },
});
