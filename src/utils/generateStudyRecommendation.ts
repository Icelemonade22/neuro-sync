export function generateStudyRecommendation(profile: any, sessions: any[]) {
  const totalSessions = sessions.length;
  const streak = profile?.streak ?? 0;
  const focusLevel = profile?.studyPreferences?.focusLevel ?? 0;
  const preferredTime = profile?.availability?.preferredTime ?? "Anytime";

  if (totalSessions === 0) {
    return {
      title: "Start your first focus session 🎯",
      message: "Begin with a short Pomodoro session to build momentum.",
    };
  }

  if (streak >= 3) {
    return {
      title: "Your consistency is improving 🔥",
      message: `You are on a ${streak}-day streak. Keep your momentum going today.`,
    };
  }

  if (focusLevel >= 80) {
    return {
      title: "Deep focus recommended 🧠",
      message: "Your focus level is high. Try a longer study session today.",
    };
  }

  if (preferredTime === "Night") {
    return {
      title: "Night study fits you 🌙",
      message: "Based on your preference, schedule your next session tonight.",
    };
  }

  return {
    title: "Keep building your routine 📈",
    message: "Complete one session today to strengthen your study habit.",
  };
}
