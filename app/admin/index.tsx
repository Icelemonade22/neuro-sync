import { getAdminDashboardStats } from "@/src/services/adminService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await getAdminDashboardStats();
    setStats(data);
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
      <Text style={styles.title}>Admin Dashboard 🛠️</Text>
      <Text style={styles.subtitle}>
        System overview and platform activity.
      </Text>

      <View style={styles.grid}>
        <StatCard title="Users" value={stats.totalUsers} icon="👥" />
        <StatCard title="Study Rooms" value={stats.totalRooms} icon="🏠" />
        <StatCard title="Notes" value={stats.totalNotes} icon="📚" />
        <StatCard title="Sessions" value={stats.totalSessions} icon="⏱️" />
        <StatCard
          title="Quizzes"
          value={stats.totalQuizzesCompleted}
          icon="🧠"
        />
      </View>

      <Button
        mode="outlined"
        style={styles.button}
        onPress={() => router.push("/admin/users" as any)}
      >
        Manage Users
      </Button>

      <Button
        mode="outlined"
        style={styles.button}
        onPress={() => router.push("/admin/notes" as any)}
      >
        Manage Notes
      </Button>

      <Button
        mode="outlined"
        style={styles.button}
        onPress={() => router.push("/admin/rooms" as any)}
      >
        Monitor Study Rooms
      </Button>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() => router.back()}
      >
        Back
      </Button>
    </ScrollView>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
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
    fontSize: 30,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#777",
    marginTop: 8,
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  card: {
    width: "47%",
    backgroundColor: "#F8F5FF",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
  },
  icon: {
    fontSize: 30,
    marginBottom: 10,
  },
  value: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#8B5CF6",
  },
  cardTitle: {
    color: "#666",
    marginTop: 6,
    textAlign: "center",
  },
  button: {
    marginTop: 28,
    borderRadius: 22,
    backgroundColor: "#8B5CF6",
  },
});
