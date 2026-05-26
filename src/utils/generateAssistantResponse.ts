export function generateAssistantResponse(input: string, profile?: any) {
  const text = input.toLowerCase();
  const subject = profile?.subject ?? "your subject";
  const preferredTime =
    profile?.availability?.preferredTime ?? "your preferred time";

  if (text.includes("focus")) {
    return `To improve focus, try a 25-minute Pomodoro session, keep your phone away, and prepare one clear task before starting. Since your preferred time is ${preferredTime}, try studying during that period.`;
  }

  if (text.includes("motivation")) {
    return "Start with a small task first. Completing one short session can build momentum and make studying feel easier.";
  }

  if (text.includes("study plan") || text.includes("schedule")) {
    return `Here is a simple study plan for ${subject}:\n\n1. 25 min revision\n2. 5 min break\n3. 25 min practice\n4. 5 min break\n5. 20 min summary notes`;
  }

  if (text.includes("pomodoro")) {
    return "Pomodoro is a study method where you focus for 25 minutes, then take a short 5-minute break. It helps reduce procrastination and improve concentration.";
  }

  if (text.includes("burnout") || text.includes("tired")) {
    return "Take a longer break, drink water, stretch, and avoid forcing another session immediately. Rest is part of productive studying.";
  }

  if (text.includes("exam")) {
    return `For exam preparation in ${subject}, focus on past questions, active recall, and short review sessions instead of only rereading notes.`;
  }

  return "I recommend starting with one short focus session, reviewing your progress, and adjusting your study goal based on how you feel today.";
}
