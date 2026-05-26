import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "NeuroSync Reminder 🔔",
      body: "Time for a quick focus session!",
    },
    trigger: null,
  });
}

export async function scheduleStudyReminder(seconds: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Study Reminder 📚",
      body: "Ready for your next focus session?",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
}
