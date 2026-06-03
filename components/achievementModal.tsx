import { Modal, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

type Props = {
  visible: boolean;
  title: string;
  xp: number;
  heading?: string;
  emoji?: string;
  onClose: () => void;
};

export default function AchievementModal({
  visible,
  title,
  xp,
  heading = "Achievement Unlocked!",
  emoji = "🎉",
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.emoji}>{emoji}</Text>

          <Text style={styles.title}>{heading}</Text>

          <Text style={styles.badge}>{title}</Text>

          {xp > 0 && <Text style={styles.xp}>+{xp} XP</Text>}

          <Button mode="contained" onPress={onClose} style={styles.button}>
            Awesome
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 30,
    alignItems: "center",
  },

  emoji: {
    fontSize: 52,
    marginBottom: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  badge: {
    fontSize: 20,
    color: "#8B5CF6",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 14,
  },

  xp: {
    fontSize: 18,
    color: "#444",
    marginBottom: 24,
  },

  button: {
    backgroundColor: "#8B5CF6",
    borderRadius: 20,
    width: "100%",
  },
});
