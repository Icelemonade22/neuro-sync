import { getLeaderboardUsers } from "@/src/services/leaderboardService";
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

export default function LeaderboardScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const data = await getLeaderboardUsers();
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
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title}>Leaderboard 🏆</Text>
      </View>

      <Text style={styles.subtitle}>
        Compete with friends through weekly study XP.
      </Text>

      <View style={styles.topCard}>
        <Text style={styles.topTitle}>🏆 Weekly Champion</Text>
        <Text style={styles.topName}>{users[0]?.fullName ?? "No data"}</Text>
        <Text style={styles.topXp}>{users[0]?.weeklyXp ?? 0} XP this week</Text>
      </View>

      {users.map((user, index) => (
        <View
          key={user.id}
          style={[
            styles.card,
            index === 0 && styles.goldCard,
            index === 1 && styles.silverCard,
            index === 2 && styles.bronzeCard,
          ]}
        >
          <Text style={styles.rank}>
            {index === 0
              ? "🥇"
              : index === 1
                ? "🥈"
                : index === 2
                  ? "🥉"
                  : `#${index + 1}`}
          </Text>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.fullName?.charAt(0) ?? "S"}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>{user.fullName ?? "Student"}</Text>

            <Text style={styles.detail}>
              Level {user.level ?? 1} • {user.weeklyXp ?? 0} weekly XP
            </Text>

            <Text style={styles.streak}>🔥 {user.streak ?? 0}-day streak</Text>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 12,
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F5FF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },
  rank: {
    fontSize: 28,
    fontWeight: "bold",
    width: 50,
    textAlign: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
  },
  detail: {
    color: "#777",
    marginTop: 4,
  },
  topCard: {
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,

    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },

  topTitle: {
    color: "#EDE9FE",
    fontWeight: "600",
    marginBottom: 8,
  },

  topName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  topXp: {
    color: "#EDE9FE",
    marginTop: 6,
  },

  streak: {
    color: "#F97316",
    marginTop: 4,
    fontWeight: "600",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 20,
  },

  subtitle: {
    color: "#777",
    marginBottom: 24,
    marginTop: -10,
  },

  goldCard: {
    backgroundColor: "#FFF7D6",
    borderWidth: 1,
    borderColor: "#FACC15",
  },

  silverCard: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },

  bronzeCard: {
    backgroundColor: "#FDF2E9",
    borderWidth: 1,
    borderColor: "#FB923C",
  },
});
