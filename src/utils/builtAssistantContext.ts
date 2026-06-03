export function buildAssistantContext(
  profile: any,
  analytics: any,
  insights: any,
  forecast: any,
) {
  return `
Student Profile

Name: ${profile?.fullName ?? "Unknown"}

Subject:
${profile?.subject ?? "Unknown"}

Study Level:
${profile?.studyLevel ?? "Unknown"}

Preferred Study Time:
${profile?.availability?.preferredTime ?? "Unknown"}

Focus Level:
${profile?.studyPreferences?.focusLevel ?? 0}

Current Streak:
${profile?.streak ?? 0}

Longest Streak:
${profile?.longestStreak ?? 0}

Achievements:
${profile?.badges?.join(", ") ?? "None"}

Progress Analytics

Focus Score:
${analytics?.focusScore ?? 0}

Total Sessions:
${analytics?.totalSessions ?? 0}

Total Hours:
${analytics?.totalHours ?? 0}

Weekly Insights

Best Study Day:
${insights?.bestStudyDay ?? "Unknown"}

Consistency:
${insights?.consistency ?? "Unknown"}

Forecast

Projected Focus Score:
${forecast?.projectedFocusScore ?? 0}

Projected Sessions:
${forecast?.projectedSessions ?? 0}
`;
}
