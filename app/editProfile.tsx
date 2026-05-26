import { auth, db } from "@/config/firebase";
import { getUserProfile } from "@/src/services/getUserProfile";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Button, Menu, Text, TextInput } from "react-native-paper";

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [subject, setSubject] = useState("");
  const [studyLevel, setStudyLevel] = useState("");
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState("");
  const [weeklyStudyDays, setWeeklyStudyDays] = useState("");
  const [focusLevel, setFocusLevel] = useState(0);
  const [accountabilityLevel, setAccountabilityLevel] = useState(0);
  const [preferredTime, setPreferredTime] = useState("");
  const [studyLevelMenuVisible, setStudyLevelMenuVisible] = useState(false);
  const [preferredTimeMenuVisible, setPreferredTimeMenuVisible] =
    useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const profile = await getUserProfile(user.uid);

    setFullName(profile?.fullName ?? "");
    setSubject(profile?.subject ?? "");
    setStudyLevel(profile?.studyLevel ?? "");
    setDailyStudyMinutes(String(profile?.studyGoals?.dailyStudyMinutes ?? ""));
    setWeeklyStudyDays(String(profile?.studyGoals?.weeklyStudyDays ?? ""));
    setFocusLevel(profile?.studyPreferences?.focusLevel ?? 50);
    setAccountabilityLevel(
      profile?.studyPreferences?.accountabilityLevel ?? 50,
    );
    setPreferredTime(profile?.availability?.preferredTime ?? "");

    setLoading(false);
  };

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "No user found.");
      return;
    }

    if (!fullName || !subject || !studyLevel) {
      Alert.alert("Missing Information", "Please fill in required fields.");
      return;
    }

    try {
      setSaving(true);

      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        fullName,
        subject,
        studyLevel,

        "studyGoals.dailyStudyMinutes": Number(dailyStudyMinutes),
        "studyGoals.weeklyStudyDays": Number(weeklyStudyDays),

        "studyPreferences.focusLevel": focusLevel,
        "studyPreferences.accountabilityLevel": accountabilityLevel,

        "availability.preferredTime": preferredTime,

        updatedAt: serverTimestamp(),
      });

      Alert.alert("Profile Updated", "Your study profile has been updated.");
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setSaving(false);
    }
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
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        label="Full Name"
        mode="outlined"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

      <TextInput
        label="Subject"
        mode="outlined"
        value={subject}
        onChangeText={setSubject}
        style={styles.input}
      />

      <Menu
        visible={studyLevelMenuVisible}
        onDismiss={() => setStudyLevelMenuVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setStudyLevelMenuVisible(true)}>
            <TextInput
              label="Study Level"
              mode="outlined"
              value={studyLevel}
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

      <Text style={styles.sectionTitle}>Study Goals</Text>

      <TextInput
        label="Daily Study Minutes"
        mode="outlined"
        value={dailyStudyMinutes}
        onChangeText={setDailyStudyMinutes}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        label="Weekly Study Days"
        mode="outlined"
        value={weeklyStudyDays}
        onChangeText={setWeeklyStudyDays}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>Study Preferences</Text>

      <Text style={styles.sliderLabel}>Focus Level: {focusLevel}%</Text>
      <Slider
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={focusLevel}
        onValueChange={setFocusLevel}
        minimumTrackTintColor="#8B5CF6"
        maximumTrackTintColor="#E5E5E5"
        thumbTintColor="#8B5CF6"
      />

      <Text style={styles.sliderLabel}>
        Accountability Level: {accountabilityLevel}%
      </Text>
      <Slider
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={accountabilityLevel}
        onValueChange={setAccountabilityLevel}
        minimumTrackTintColor="#8B5CF6"
        maximumTrackTintColor="#E5E5E5"
        thumbTintColor="#8B5CF6"
      />

      <Menu
        visible={preferredTimeMenuVisible}
        onDismiss={() => setPreferredTimeMenuVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setPreferredTimeMenuVisible(true)}>
            <TextInput
              label="Preferred Time"
              mode="outlined"
              value={preferredTime}
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

      <Button
        mode="contained"
        style={styles.saveButton}
        onPress={handleSave}
        loading={saving}
        disabled={saving}
      >
        Save Changes
      </Button>

      <Button
        mode="text"
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        Cancel
      </Button>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
  },
  input: {
    marginBottom: 14,
  },
  saveButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    paddingVertical: 6,
    marginTop: 24,
  },
  cancelButton: {
    marginBottom: 10,
  },
  sliderLabel: {
    marginTop: 12,
    marginBottom: 6,
    color: "#555",
    fontWeight: "bold",
  },
});
