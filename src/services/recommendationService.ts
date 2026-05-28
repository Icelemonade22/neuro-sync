export function generateSmartRecommendation(profile: any) {
  const streak = profile?.streak ?? 0;
  const focusLevel = profile?.focusLevel ?? 50;
  const preferredTime = profile?.availability?.preferredTime ?? "Night";

  if (streak >= 7) {
    return {
      title: "Amazing consistency 🔥",
      message:
        "You're on a strong study streak. Keep your momentum going today.",
    };
  }

  if (focusLevel < 50) {
    return {
      title: "Low focus detected 🧠",
      message: "Try a short Pomodoro session with fewer distractions.",
    };
  }

  if (preferredTime === "Night") {
    return {
      title: "Night study fits you 🌙",
      message: "Based on your preference, schedule your next session tonight.",
    };
  }

  return {
    title: "Stay productive ⚡",
    message: "Complete a focus session today to grow your streak and XP.",
  };
}
