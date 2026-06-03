export function generateStudyRecommendation(
  profile: any,
  sessions: any[],
  analytics?: any,
  todayMinutes: number = 0,
  burnoutWarning?: any,
) {
  const totalSessions = sessions.length;
  const streak = profile?.streak ?? 0;
  const focusLevel = profile?.studyPreferences?.focusLevel ?? 0;
  const preferredTime = profile?.availability?.preferredTime ?? "Anytime";
  const dailyGoal = profile?.studyGoals?.dailyStudyMinutes ?? 120;

  const focusScore = analytics?.focusScore ?? 0;
  const totalHours = analytics?.totalHours ?? 0;

  if (burnoutWarning) {
    return {
      title: "Recovery recommended 😴",
      message:
        "Your recent study pattern suggests fatigue. Consider a lighter session or short break.",
    };
  }

  if (todayMinutes >= dailyGoal) {
    return {
      title: "Goal completed 🎯",
      message:
        "You have completed today’s study goal. Keep the momentum going tomorrow.",
    };
  }

  if (focusScore >= 90) {
    return {
      title: "Elite focus mode 🔥",
      message:
        "Your focus score is excellent. Continue using your current study routine.",
    };
  }

  if (totalHours >= 10) {
    return {
      title: "High performer 🚀",
      message:
        "You have built strong study time. Keep balancing consistency with rest.",
    };
  }

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
