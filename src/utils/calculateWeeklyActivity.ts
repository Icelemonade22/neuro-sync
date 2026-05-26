export function calculateWeeklyActivity(sessions: any[]) {
  const weeklyMinutes = [0, 0, 0, 0, 0, 0, 0];

  sessions.forEach((session) => {
    if (!session.createdAt || !session.durationMinutes) return;

    const date = session.createdAt.toDate();
    const day = date.getDay();

    const mondayIndex = day === 0 ? 6 : day - 1;

    weeklyMinutes[mondayIndex] += session.durationMinutes;
  });

  return weeklyMinutes;
}
