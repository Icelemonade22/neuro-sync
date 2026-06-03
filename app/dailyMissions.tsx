import AchievementModal from "@/components/achievementModal";
import {
  initializeDailyMissions,
  listenDailyMissions,
  markCompletedMissionsClaimed,
} from "@/src/services/dailyMissionService";
import { rewardMissionXp } from "@/src/services/missionService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Checkbox, Text } from "react-native-paper";

export default function DailyMissionsScreen() {
  const [missions, setMissions] = useState<any[]>([]);

  const [claimed, setClaimed] = useState(false);
  const [achievementVisible, setAchievementVisible] = useState(false);
  const [achievementData, setAchievementData] = useState({
    title: "",
    xp: 0,
  });

  const toggleMission = (id: number) => {
    setMissions((prev) =>
      prev.map((mission) =>
        mission.id === id
          ? {
              ...mission,
              completed: !mission.completed,
            }
          : mission,
      ),
    );
  };

  const completedCount = missions.filter((m) => m.completed).length;

  const handleClaimRewards = async () => {
    const claimableMissions = missions.filter(
      (mission) => mission.completed && !mission.claimed,
    );

    const totalXp = claimableMissions.reduce(
      (sum, mission) => sum + mission.xp,
      0,
    );

    if (totalXp <= 0) return;

    await rewardMissionXp(totalXp);

    await markCompletedMissionsClaimed(
      claimableMissions.map((mission) => mission.id),
    );

    setAchievementData({
      title: "Daily Mission Rewards",
      xp: totalXp,
    });

    setAchievementVisible(true);
  };

  useEffect(() => {
    initializeDailyMissions();

    const unsubscribe = listenDailyMissions((data) => {
      setMissions(data.missions);
      setClaimed(data.claimed);
    });

    return unsubscribe;
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Daily Missions 🎯</Text>

      <Text style={styles.subtitle}>Complete missions to earn bonus XP.</Text>

      <View style={styles.progressCard}>
        <Text style={styles.progressText}>
          {completedCount}/{missions.length} missions completed
        </Text>
      </View>

      {missions.map((mission) => (
        <TouchableOpacity
          key={mission.id}
          style={styles.card}
          onPress={() => {}}
        >
          <Checkbox status={mission.completed ? "checked" : "unchecked"} />

          <View style={{ flex: 1 }}>
            <Text style={styles.missionTitle}>{mission.title}</Text>

            <Text style={styles.xp}>✨ +{mission.xp} XP</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Button
        mode="contained"
        style={styles.button}
        onPress={handleClaimRewards}
        disabled={
          !missions.some((mission) => mission.completed && !mission.claimed)
        }
      >
        {missions.some((mission) => mission.completed && !mission.claimed)
          ? "Claim Rewards"
          : "No Rewards to Claim"}
      </Button>

      <AchievementModal
        visible={achievementVisible}
        heading="Reward Claimed!"
        emoji="✨"
        title={achievementData.title}
        xp={achievementData.xp}
        onClose={() => setAchievementVisible(false)}
      />
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

  back: {
    fontSize: 18,
    marginBottom: 18,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111",
  },

  subtitle: {
    color: "#777",
    marginTop: 8,
    marginBottom: 24,
  },

  progressCard: {
    backgroundColor: "#F3E8FF",
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
  },

  progressText: {
    color: "#8B5CF6",
    fontWeight: "bold",
    fontSize: 16,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F5FF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },

  missionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  xp: {
    color: "#8B5CF6",
    marginTop: 4,
  },

  button: {
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: "#8B5CF6",
  },
});
