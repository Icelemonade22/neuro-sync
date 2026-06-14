// Calculate overall study analytics and focus performance metrics
export function calculateAnalytics(sessions: any[], streak: number = 0) {
  // Total number of study sessions completed
  const totalSessions = sessions.length;

  // Sum all study durations (in minutes)
  const totalMinutes = sessions.reduce(
    (sum, session) => sum + (session.durationMinutes || 0),
    0,
  );

  // Convert total study time from minutes to hours
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Calculate average duration per study session
  const averageSessionMinutes =
    totalSessions === 0 ? 0 : totalMinutes / totalSessions;

  // Score based on average session length
  // 60 minutes or more = maximum score of 100
  const sessionScore = Math.min(100, (averageSessionMinutes / 60) * 100);

  // Score based on study consistency
  // 20 sessions or more = maximum score of 100
  const consistencyScore = Math.min(100, (totalSessions / 20) * 100);

  // Score based on study streak
  // 30-day streak = maximum score of 100
  const streakScore = Math.min(100, (streak / 30) * 100);

  // Overall focus score using weighted performance metrics
  const focusScore = Math.round(
    sessionScore * 0.4 + consistencyScore * 0.4 + streakScore * 0.2,
  );

  // Return all calculated analytics values
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
