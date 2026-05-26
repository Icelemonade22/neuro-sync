export function calculateTodayMinutes(sessions: any[]) {
  const today = new Date();

  return sessions.reduce((total, session) => {
    if (!session.createdAt || !session.durationMinutes) return total;

    const sessionDate = session.createdAt.toDate();

    const isToday =
      sessionDate.getFullYear() === today.getFullYear() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getDate() === today.getDate();

    return isToday ? total + session.durationMinutes : total;
  }, 0);
}
