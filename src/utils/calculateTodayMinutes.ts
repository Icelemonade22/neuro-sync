/// Calculates the total minutes spent in sessions that were created today.
export function calculateTodayMinutes(sessions: any[]) {
  // Get the current date to compare with session creation dates
  const today = new Date();

  // Use reduce to sum up the duration of sessions created today
  return sessions.reduce((total, session) => {
    // Check if the session has a valid creation date and duration
    if (!session.createdAt || !session.durationMinutes) return total;

    // Convert the session's creation date to a Date object
    const sessionDate = session.createdAt.toDate();

    // Check if the session was created today by comparing year, month, and date
    const isToday =
      sessionDate.getFullYear() === today.getFullYear() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getDate() === today.getDate();

    // If the session was created today, add its duration to the total; otherwise,
    // keep the total unchanged
    return isToday ? total + session.durationMinutes : total;
  }, 0);
}
