export function calculateAnalytics(sessions: any[]) {
  const totalSessions = sessions.length;

  const totalMinutes = sessions.reduce(
    (sum, session) => sum + (session.durationMinutes || 0),
    0,
  );

  const totalHours = (totalMinutes / 60).toFixed(1);

  const focusScore =
    totalSessions === 0
      ? 0
      : Math.min(100, Math.round((totalMinutes / totalSessions) * 3));

  return {
    totalSessions,
    totalMinutes,
    totalHours,
    focusScore,
  };
}
