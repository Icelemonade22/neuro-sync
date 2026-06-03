export function generateWeeklyStudyReport(
  analytics: any,
  insights: any,
  profile: any,
) {
  const totalHours = analytics?.totalHours ?? 0;
  const totalSessions = analytics?.totalSessions ?? 0;
  const focusScore = analytics?.focusScore ?? 0;
  const consistency = insights?.consistency ?? "Low";
  const bestStudyDay = insights?.bestStudyDay ?? "Not enough data";
  const dailyGoal = profile?.studyGoals?.dailyStudyMinutes ?? 120;

  let strength = "You are starting to build your study routine.";
  let recommendation = "Try completing at least one short focus session today.";
  let outlook = "Keep building consistency step by step.";

  if (focusScore >= 80 && consistency === "High") {
    strength = "Excellent focus and strong weekly consistency.";
    recommendation =
      "Maintain your current routine and avoid overloading yourself.";
    outlook = "You are on track for a very productive study week.";
  } else if (totalSessions >= 5) {
    strength = "You are showing good consistency this week.";
    recommendation =
      "Try increasing your session quality by reducing distractions.";
    outlook = "Your study rhythm is improving steadily.";
  } else if (totalHours >= 3) {
    strength = "You have built a good amount of study time.";
    recommendation =
      "Spread your sessions across more days to improve consistency.";
    outlook = "Your progress is moving in the right direction.";
  }

  return {
    title: "Weekly Study Report 📊",
    studyTime: `${totalHours} hours`,
    sessions: totalSessions,
    focusScore,
    consistency,
    bestStudyDay,
    dailyGoal,
    strength,
    recommendation,
    outlook,
  };
}
