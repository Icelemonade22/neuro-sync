const AI_FUNCTION_URL =
  "https://us-central1-fir-neurosync.cloudfunctions.net/askStudyAssistantHttp";

export async function askStudyAssistant(question: string, profile: any) {
  const response = await fetch(AI_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, profile }),
  });

  const rawText = await response.text();

  console.log("AI RAW RESPONSE:", rawText);

  if (!response.ok) {
    throw new Error(rawText);
  }

  const data = JSON.parse(rawText);

  return data.answer;
}
