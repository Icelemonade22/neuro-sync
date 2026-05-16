export function calculateCompatibility(currentUser: any, otherUser: any) {
  let score = 0;

  if (currentUser.subject === otherUser.subject) score += 30;

  if (
    currentUser.studyPreferences?.sessionType ===
    otherUser.studyPreferences?.sessionType
  ) {
    score += 20;
  }

  const focusDiff = Math.abs(
    (currentUser.studyPreferences?.focusLevel ?? 0) -
      (otherUser.studyPreferences?.focusLevel ?? 0),
  );

  if (focusDiff <= 10) score += 20;
  else if (focusDiff <= 25) score += 10;

  if (
    currentUser.availability?.preferredTime ===
    otherUser.availability?.preferredTime
  ) {
    score += 15;
  }

  if (
    currentUser.studyStyle?.communicationStyle ===
    otherUser.studyStyle?.communicationStyle
  ) {
    score += 15;
  }

  return Math.min(score, 100);
}
