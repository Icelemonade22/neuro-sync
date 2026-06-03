export function generateAISummary(
  analytics: any,
  insights: any,
  forecast: any,
) {
  const totalHours = analytics?.totalHours ?? 0;
  const totalSessions = analytics?.totalSessions ?? 0;
  const focusScore = analytics?.focusScore ?? 0;

  const bestDay = insights?.bestStudyDay ?? "Unknown";
  const consistency = insights?.consistency ?? "Moderate";

  const projectedScore = forecast?.projectedFocusScore ?? focusScore;

  let recommendation = "Continue maintaining your current study routine.";

  if (focusScore < 60) {
    recommendation = "Consider shorter, more focused Pomodoro sessions.";
  } else if (consistency === "Low") {
    recommendation = "Try studying on more days throughout the week.";
  } else if (projectedScore >= 80) {
    recommendation =
      "Maintain your momentum and continue studying during your most productive period.";
  }

  return `
This week you completed ${totalSessions} study sessions and accumulated ${totalHours} hours of study time.

Your most productive day was ${bestDay}.

Your consistency level is currently ${consistency} and your projected focus score is ${projectedScore}.

Recommendation: ${recommendation}
`;
}
