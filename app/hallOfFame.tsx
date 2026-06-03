import { getHallOfFame } from "@/src/services/hallOfFameService";
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
import { Text } from "react-native-paper";

export default function HallOfFameScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHallOfFame = async () => {
    const data = await getHallOfFame();
    setEntries(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadHallOfFame();
    }, []),
  );

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title}>Hall of Fame 🏆</Text>
      </View>

      <Text style={styles.subtitle}>Celebrate previous weekly champions.</Text>

      {entries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No champions saved yet.</Text>
        </View>
      ) : (
        entries.map((entry, index) => (
          <View key={entry.id} style={styles.card}>
            <Text style={styles.rank}>🏆 #{index + 1}</Text>

            <View style={styles.info}>
              <Text style={styles.name}>{entry.fullName}</Text>
              <Text style={styles.detail}>
                {entry.weeklyXp ?? 0} XP • Level {entry.level ?? 1}
              </Text>
              <Text style={styles.streak}>
                🔥 {entry.streak ?? 0}-day streak
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#777",
    marginBottom: 24,
  },
  emptyCard: {
    backgroundColor: "#F8F5FF",
    padding: 20,
    borderRadius: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F5FF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  rank: {
    fontSize: 22,
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  detail: {
    color: "#8B5CF6",
    marginTop: 4,
    fontWeight: "600",
  },
  streak: {
    color: "#6B7280",
    marginTop: 4,
  },
});
