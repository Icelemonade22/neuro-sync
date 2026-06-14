// Determine the next achievement milestone for the student
export function getNextAchievement(profile: any, analytics: any) {
  // Retrieve current progress metrics
  const totalSessions = analytics?.totalSessions ?? 0;
  const focusScore = analytics?.focusScore ?? 0;
  const streak = profile?.streak ?? 0;

  // Achievement 1: Complete 15 study sessions
  if (totalSessions < 15) {
    return {
      title: "Consistency Master",
      progress: totalSessions,
      target: 15,
      message: `Complete ${15 - totalSessions} more sessions to unlock this badge.`,
      reward: "+100 XP",
    };
  }

  // Achievement 2: Reach a focus score of 85
  if (focusScore < 85) {
    return {
      title: "Focus Champion",
      progress: focusScore,
      target: 85,
      message: `Improve your focus score by ${85 - focusScore} points to unlock this badge.`,
      reward: "+120 XP",
    };
  }

  // Achievement 3: Maintain a 7-day study streak
  if (streak < 7) {
    return {
      title: "7-Day Streak",
      progress: streak,
      target: 7,
      message: `Study for ${7 - streak} more days to unlock this badge.`,
      reward: "+150 XP",
    };
  }

  // Final achievement shown when all previous milestones are completed
  return {
    title: "Elite Learner",
    progress: 100,
    target: 100,
    message: "You are doing great. Keep building your learning momentum.",
    reward: "Special Badge",
  };
}
