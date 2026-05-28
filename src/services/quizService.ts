const QUIZ_FUNCTION_URL =
  "https://us-central1-fir-neurosync.cloudfunctions.net/generateQuizHttp";

export async function generateQuiz(
  title: string,
  subject: string,
  content: string,
  difficulty: string,
) {
  const response = await fetch(QUIZ_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      subject,
      content,
      difficulty,
    }),
  });

  const data = await response.json();

  try {
    const cleanedQuiz = data.quiz
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanedQuiz);

    return parsed.questions;
  } catch (error) {
    console.log("RAW AI QUIZ RESPONSE:", data.quiz);

    throw new Error("Failed to parse AI quiz.");
  }
}
