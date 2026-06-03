import { auth } from "@/config/firebase";
import { saveOnboardingData } from "@/src/services/userService";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Menu, Text, TextInput } from "react-native-paper";

export default function OnboardingScreen() {
  const [fullName, setFullName] = useState("");
  const [subject, setSubject] = useState("");
  const [studyLevel, setStudyLevel] = useState("Undergraduate");

  const [sessionType, setSessionType] = useState("Pomodoro");
  const [focusLevel, setFocusLevel] = useState(80);
  const [accountabilityLevel, setAccountabilityLevel] = useState(70);

  const [mainGoal, setMainGoal] = useState("Improve consistency");
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState("120");
  const [weeklyStudyDays, setWeeklyStudyDays] = useState("5");

  const [preferredTime, setPreferredTime] = useState("Night");
  const [communicationStyle, setCommunicationStyle] = useState("Silent focus");
  const [partnerPreference, setPartnerPreference] = useState("Strict");
  const [groupPreference, setGroupPreference] = useState("One-to-one");
  const [studyLevelMenuVisible, setStudyLevelMenuVisible] = useState(false);
  const [preferredTimeMenuVisible, setPreferredTimeMenuVisible] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const getLevelLabel = (value: number) => {
    if (value < 20) return "Very Low";
    if (value < 40) return "Low";
    if (value < 60) return "Medium";
    if (value < 80) return "High";
    return "Very High";
  };

  const availableDays = ["Monday", "Tuesday", "Thursday"];
  const purpose = ["Exam preparation", "Assignment"];

  const handleSubmit = async () => {
    if (!fullName || !subject || !studyLevel) {
      Alert.alert(
        "Missing Information",
        "Please complete your profile details.",
      );
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "No logged-in user found.");
      return;
    }

    try {
      setLoading(true);

      await saveOnboardingData({
        uid: user.uid,
        email: user.email ?? "",
        fullName,
        subject,
        studyLevel,
        sessionType,
        focusLevel,
        accountabilityLevel,
        mainGoal,
        dailyStudyMinutes: Number(dailyStudyMinutes),
        weeklyStudyDays: Number(weeklyStudyDays),
        purpose,
        preferredTime,
        availableDays,
        communicationStyle,
        partnerPreference,
        groupPreference,
      });

      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to save onboarding data.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* <Text style={styles.step}>Step 1 of 4</Text> */}
      <Text style={styles.title}>Profile Setup</Text>
      <Text style={styles.subtitle}>Tell us about yourself</Text>

      <TextInput
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Subject"
        value={subject}
        onChangeText={setSubject}
        mode="outlined"
        style={styles.input}
      />

      <Menu
        visible={studyLevelMenuVisible}
        onDismiss={() => setStudyLevelMenuVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setStudyLevelMenuVisible(true)}>
            <TextInput
              label="Study Level"
              value={studyLevel}
              mode="outlined"
              editable={false}
              pointerEvents="none"
              right={<TextInput.Icon icon="menu-down" />}
              style={styles.input}
            />
          </TouchableOpacity>
        }
      >
        {["Foundation", "Diploma", "Undergraduate", "Postgraduate"].map(
          (level) => (
            <Menu.Item
              key={level}
              title={level}
              onPress={() => {
                setStudyLevel(level);
                setStudyLevelMenuVisible(false);
              }}
            />
          ),
        )}
      </Menu>

      <Text style={styles.sectionTitle}>Study Preferences</Text>

      <View style={styles.optionRow}>
        <OptionCard
          title="Pomodoro"
          subtitle="25 min focus"
          selected={sessionType === "Pomodoro"}
          onPress={() => setSessionType("Pomodoro")}
        />

        <OptionCard
          title="Long Session"
          subtitle="60+ min focus"
          selected={sessionType === "Long Session"}
          onPress={() => setSessionType("Long Session")}
        />
      </View>

      <View style={styles.sliderHeader}>
        <Text style={styles.label}>Focus Level</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ color: "#999", fontSize: 12 }}>{focusLevel}%</Text>

          <Text style={styles.sliderValue}>{getLevelLabel(focusLevel)}</Text>
        </View>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={focusLevel}
        minimumTrackTintColor="#8B5CF6"
        maximumTrackTintColor="#E5E5E5"
        thumbTintColor="#8B5CF6"
        onValueChange={setFocusLevel}
      />

      <View style={styles.sliderHeader}>
        <Text style={styles.label}>Accountability Level</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ color: "#999", fontSize: 12 }}>
            {accountabilityLevel}%
          </Text>

          <Text style={styles.sliderValue}>
            {getLevelLabel(accountabilityLevel)}
          </Text>
        </View>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={accountabilityLevel}
        minimumTrackTintColor="#8B5CF6"
        maximumTrackTintColor="#E5E5E5"
        thumbTintColor="#8B5CF6"
        onValueChange={setAccountabilityLevel}
      />

      <Text style={styles.sectionTitle}>Study Goals</Text>

      <TextInput
        label="Main Goal"
        value={mainGoal}
        onChangeText={setMainGoal}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Daily Study Minutes"
        value={dailyStudyMinutes}
        onChangeText={setDailyStudyMinutes}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Weekly Study Days"
        value={weeklyStudyDays}
        onChangeText={setWeeklyStudyDays}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>Availability</Text>

      <Menu
        visible={preferredTimeMenuVisible}
        onDismiss={() => setPreferredTimeMenuVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setPreferredTimeMenuVisible(true)}>
            <TextInput
              label="Preferred Time"
              value={preferredTime}
              mode="outlined"
              editable={false}
              pointerEvents="none"
              right={<TextInput.Icon icon="menu-down" />}
              style={styles.input}
            />
          </TouchableOpacity>
        }
      >
        {["Morning", "Afternoon", "Evening", "Night", "Anytime"].map((time) => (
          <Menu.Item
            key={time}
            title={time}
            onPress={() => {
              setPreferredTime(time);
              setPreferredTimeMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      <Text style={styles.sectionTitle}>Study Style</Text>

      <View style={styles.optionColumn}>
        {["Silent focus", "Light discussion", "Active collaboration"].map(
          (style) => (
            <SmallOption
              key={style}
              title={style}
              selected={communicationStyle === style}
              onPress={() => setCommunicationStyle(style)}
            />
          ),
        )}
      </View>

      <View style={styles.optionRow}>
        {["Strict", "Flexible"].map((preference) => (
          <SmallOption
            key={preference}
            title={preference}
            selected={partnerPreference === preference}
            onPress={() => setPartnerPreference(preference)}
          />
        ))}
      </View>

      <View style={styles.optionRow}>
        {["One-to-one", "Group"].map((group) => (
          <SmallOption
            key={group}
            title={group}
            selected={groupPreference === group}
            onPress={() => setGroupPreference(group)}
          />
        ))}
      </View>

      <Button
        mode="contained"
        style={styles.continueButton}
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
      >
        Continue
      </Button>
    </ScrollView>
  );
}

function OptionCard({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.optionCard, selected && styles.selectedCard]}
    >
      <Text style={[styles.optionTitle, selected && styles.selectedText]}>
        {title}
      </Text>
      <Text style={[styles.optionSubtitle, selected && styles.selectedText]}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

function SmallOption({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.smallOption, selected && styles.selectedCard]}
    >
      <Text style={[styles.optionTitle, selected && styles.selectedText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 24,
    paddingBottom: 90,
  },
  step: {
    textAlign: "right",
    color: "#999",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#888",
    marginBottom: 24,
  },
  input: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  optionColumn: {
    gap: 10,
    marginBottom: 12,
  },
  optionCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    minWidth: 140,
  },
  smallOption: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedCard: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  optionTitle: {
    fontWeight: "bold",
    color: "#333",
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  selectedText: {
    color: "#fff",
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    color: "#666",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  continueButton: {
    marginTop: 30,
    borderRadius: 24,
    paddingVertical: 6,
    backgroundColor: "#8B5CF6",
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  sliderValue: {
    color: "#8B5CF6",
    fontSize: 12,
  },

  slider: {
    width: "100%",
    height: 40,
    marginBottom: 16,
  },
});
