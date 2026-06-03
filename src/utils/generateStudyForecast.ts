export function generateStudyForecast(analytics: any, insights: any) {
  const totalHours = analytics?.totalHours ?? 0;
  const totalSessions = analytics?.totalSessions ?? 0;
  const focusScore = analytics?.focusScore ?? 0;
  const activeDays = insights?.activeDays ?? 0;

  const projectedHours = Math.round(totalHours * 1.25 * 10) / 10;
  const projectedSessions = Math.ceil(totalSessions * 1.2);
  const projectedFocusScore = Math.min(
    Math.round(focusScore + activeDays * 2),
    100,
  );

  let status = "Building Momentum";

  if (projectedFocusScore >= 80 && projectedSessions >= 8) {
    status = "On Track";
  } else if (projectedFocusScore < 50) {
    status = "Needs Attention";
  }

  return {
    title: "Study Forecast 🔮",
    projectedHours,
    projectedSessions,
    projectedFocusScore,
    status,
  };
}
