export function detectBurnout(sessions: any[]) {
  const today = new Date();

  const todaySessions = sessions.filter((session) => {
    if (!session.createdAt) return false;

    const sessionDate = session.createdAt.toDate();

    return (
      sessionDate.getFullYear() === today.getFullYear() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getDate() === today.getDate()
    );
  });

  const totalMinutes = todaySessions.reduce(
    (total, session) => total + (session.durationMinutes ?? 0),
    0,
  );

  if (todaySessions.length >= 4) {
    return {
      level: "warning",
      title: "Burnout Risk Detected ⚠️",
      message:
        "You've completed many study sessions today. Consider taking a longer break.",
    };
  }

  if (totalMinutes >= 180) {
    return {
      level: "warning",
      title: "Long Study Duration 📚",
      message:
        "You’ve studied for several hours today. Rest helps improve retention and focus.",
    };
  }

  return null;
}
