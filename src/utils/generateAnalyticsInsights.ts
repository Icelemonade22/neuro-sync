// Generate study insights based on the current week's study sessions
export function generateAnalyticsInsights(sessions: any[]) {
  // Store total study minutes for each day of the current week
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

  const now = new Date();

  // Determine the start date of the current week, starting from Monday
  const startOfWeek = new Date(now);
  const currentDay = startOfWeek.getDay();
  const diff = currentDay === 0 ? -6 : 1 - currentDay;

  startOfWeek.setDate(startOfWeek.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  sessions.forEach((session) => {
    // Skip sessions with missing date or duration information
    if (!session.createdAt || !session.durationMinutes) return;

    // Convert Firestore timestamp into a JavaScript Date object
    const date = session.createdAt.toDate();

    // Ignore sessions from previous weeks
    if (date < startOfWeek) return;

    // Get day of the week and convert to Monday-first indexing
    const day = date.getDay();
    const index = day === 0 ? 6 : day - 1;

    // Add study minutes to the correct day
    weeklyMinutes[index] += session.durationMinutes;
  });

  // Calculate total study time for the current week
  const totalMinutes = weeklyMinutes.reduce((a, b) => a + b, 0);

  // Find the day with the highest study duration
  const bestIndex = weeklyMinutes.indexOf(Math.max(...weeklyMinutes));

  // Count how many days had study activity
  const activeDays = weeklyMinutes.filter((m) => m > 0).length;

  // Determine consistency level based on active study days
  let consistency = "Low";

  if (activeDays >= 5) consistency = "High";
  else if (activeDays >= 3) consistency = "Moderate";

  // Return weekly study insights for the Progress screen
  return {
    totalMinutes,
    bestStudyDay: totalMinutes > 0 ? labels[bestIndex] : "Not enough data",
    consistency,
    activeDays,
  };
}
