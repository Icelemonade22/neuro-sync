// This function calculates a compatibility score between two users based
// on their study preferences and styles.
export function calculateCompatibility(currentUser: any, otherUser: any) {
  let score = 0;

  // Bonus points for same subject
  if (currentUser.subject === otherUser.subject) {
    score += 30;
  }

  // Bonus points for similar study session types
  if (
    currentUser.studyPreferences?.sessionType ===
    otherUser.studyPreferences?.sessionType
  ) {
    score += 15;
  }

  // Calculate the difference in focus levels
  const focusDiff = Math.abs(
    (currentUser.studyPreferences?.focusLevel ?? 0) -
      (otherUser.studyPreferences?.focusLevel ?? 0),
  );

  // Bonus points for similar focus levels
  if (focusDiff <= 10) score += 20;
  else if (focusDiff <= 25) score += 10;

  // Bonus points for similar accountability levels
  const accountabilityDiff = Math.abs(
    (currentUser.studyPreferences?.accountabilityLevel ?? 0) -
      (otherUser.studyPreferences?.accountabilityLevel ?? 0),
  );

  // Bonus points for similar accountability levels
  if (accountabilityDiff <= 10) score += 15;
  else if (accountabilityDiff <= 25) score += 8;

  // Bonus points for similar availability
  if (
    currentUser.availability?.preferredTime ===
    otherUser.availability?.preferredTime
  ) {
    score += 15;
  }

  // Bonus points for similar communication styles
  if (
    currentUser.studyStyle?.communicationStyle ===
    otherUser.studyStyle?.communicationStyle
  ) {
    score += 5;
  }

  // Normalize score to be between 0 and 100
  return Math.min(score, 100);
}
