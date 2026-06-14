// Calculate study activity for the current week (Monday-Sunday)
export function calculateWeeklyActivity(sessions: any[]) {
  // Store total study minutes for each day of the current week
  const weeklyMinutes = [0, 0, 0, 0, 0, 0, 0];

  const now = new Date();

  // Determine the start date of the current week (Monday)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  startOfWeek.setDate(startOfWeek.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  sessions.forEach((session) => {
    // Skip sessions with missing date or duration information
    if (!session.createdAt || !session.durationMinutes) return;

    // Convert Firestore timestamp into a JavaScript Date object
    const date = session.createdAt.toDate();

    // Ignore study sessions from previous weeks
    if (date < startOfWeek) return;

    // Get day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const sessionDay = date.getDay();

    // Convert to Monday-first indexing for chart display
    const mondayIndex = sessionDay === 0 ? 6 : sessionDay - 1;

    // Add study duration to the corresponding day
    weeklyMinutes[mondayIndex] += session.durationMinutes;
  });

  // Return weekly activity data for analytics charts
  return weeklyMinutes;
}
