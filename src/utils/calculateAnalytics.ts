export function calculateAnalytics(sessions: any[], streak: number = 0) {
  const totalSessions = sessions.length;

  const totalMinutes = sessions.reduce(
    (sum, session) => sum + (session.durationMinutes || 0),
    0,
  );

  const totalHours = (totalMinutes / 60).toFixed(1);

  const averageSessionMinutes =
    totalSessions === 0 ? 0 : totalMinutes / totalSessions;

  const sessionScore = Math.min(100, (averageSessionMinutes / 60) * 100);

  const consistencyScore = Math.min(100, (totalSessions / 20) * 100);

  const streakScore = Math.min(100, (streak / 30) * 100);

  const focusScore = Math.round(
    sessionScore * 0.4 + consistencyScore * 0.4 + streakScore * 0.2,
  );

  return {
    totalSessions,
    totalMinutes,
    totalHours,
    averageSessionMinutes,
    sessionScore: Math.round(sessionScore),
    consistencyScore: Math.round(consistencyScore),
    streakScore: Math.round(streakScore),
    focusScore,
  };
}
