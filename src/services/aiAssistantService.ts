// URL of the Firebase Cloud Function that powers the AI Study Assistant
const AI_FUNCTION_URL =
  "https://us-central1-fir-neurosync.cloudfunctions.net/askStudyAssistantHttp";

// Send a question and student progress data to the AI Study Assistant
export async function askStudyAssistant(
  question: string,
  profile: any,
  analytics?: any,
  insights?: any,
  forecast?: any,
) {
  const start = Date.now();

  // Send request to Firebase Cloud Function
  const response = await fetch(AI_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    // Include student question and personalized study data
    body: JSON.stringify({
      question,
      profile,
      analytics,
      insights,
      forecast,
    }),
  });

  // Retrieve raw response text from the server
  const rawText = await response.text();

  const end = Date.now();

  console.log(`AI Response Time: ${end - start} ms`);

  // Log response for debugging purposes
  // console.log("AI RAW RESPONSE:", rawText);

  // Throw an error if the request was unsuccessful
  if (!response.ok) {
    throw new Error(rawText);
  }

  // Convert JSON response into a JavaScript object
  const data = JSON.parse(rawText);

  // Return the generated AI answer
  return data.answer;
}
