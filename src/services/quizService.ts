const QUIZ_FUNCTION_URL =
  "https://us-central1-fir-neurosync.cloudfunctions.net/generateQuizHttp";

export async function generateQuiz(title: string, subject: string) {
  const response = await fetch(QUIZ_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      subject,
    }),
  });

  const data = await response.json();

  return data.quiz;
}
