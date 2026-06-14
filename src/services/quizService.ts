// This file contains functions related to quiz generation using an AI service.
const QUIZ_FUNCTION_URL =
  "https://us-central1-fir-neurosync.cloudfunctions.net/generateQuizHttp";

// This function sends a request to the quiz generation cloud function with the
// provided parameters and processes the response to extract the quiz questions.
export async function generateQuiz(
  title: string,
  subject: string,
  content: string,
  difficulty: string,
) {
  const start = Date.now();

  // Send a POST request to the quiz generation cloud function with the quiz parameters
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

  // Parse the JSON response from the cloud function, which should contain a "quiz" field
  const data = await response.json();

  const end = Date.now();

  console.log(`Quiz Generation Time: ${end - start} ms`);

  try {
    // The quiz is expected to be a JSON string that may be wrapped in code block markers.
    // Clean the quiz string by removing any code block markers and trimming whitespace.
    const cleanedQuiz = data.quiz
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse the cleaned quiz string as JSON to extract the quiz questions.
    // The expected
    const parsed = JSON.parse(cleanedQuiz);

    // Return the array of quiz questions extracted from the parsed quiz object.
    return parsed.questions;
  } catch (error) {
    // If there was an error parsing the quiz, log the raw quiz response for debugging
    console.log("RAW AI QUIZ RESPONSE:", data.quiz);

    // Throw an error indicating that the quiz could not be parsed, which can be
    // handled by the caller to show an appropriate message to the user.
    throw new Error("Failed to parse AI quiz.");
  }
}
