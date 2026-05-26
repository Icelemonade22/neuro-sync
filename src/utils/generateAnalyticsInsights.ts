export function generateAnalyticsInsights(sessions: any[]) {
  const weeklyMinutes = [0, 0, 0, 0, 0, 0, 0];
  const labels = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  sessions.forEach((session) => {
    if (!session.createdAt || !session.durationMinutes) return;

    const date = session.createdAt.toDate();
    const day = date.getDay();
    const index = day === 0 ? 6 : day - 1;

    weeklyMinutes[index] += session.durationMinutes;
  });

  const bestIndex = weeklyMinutes.indexOf(Math.max(...weeklyMinutes));
  const totalMinutes = weeklyMinutes.reduce((a, b) => a + b, 0);

  let consistency = "Low";

  const activeDays = weeklyMinutes.filter((m) => m > 0).length;

  if (activeDays >= 5) consistency = "High";
  else if (activeDays >= 3) consistency = "Moderate";

  return {
    totalMinutes,
    bestStudyDay: totalMinutes > 0 ? labels[bestIndex] : "Not enough data",
    consistency,
    activeDays,
  };
}
