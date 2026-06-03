import { GoogleGenAI } from "@google/genai";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";

const geminiApiKey = defineSecret("GEMINI_API_KEY");

export const askStudyAssistantHttp = onRequest(
  {
    secrets: [geminiApiKey],
    cors: true,
  },
  async (req, res) => {
    const { question, profile, analytics, insights, forecast } = req.body;

    if (!question) {
      res.status(400).json({
        answer: "Please ask a question.",
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: geminiApiKey.value(),
    });

    const prompt = `
You are NeuroSync Study Assistant.
Help students with study planning, productivity, focus, motivation, and revision.

Student profile:
- Subject: ${profile?.subject ?? "Unknown"}
- Study level: ${profile?.studyLevel ?? "Unknown"}
- Preferred time: ${profile?.availability?.preferredTime ?? "Unknown"}
- Focus level: ${profile?.studyPreferences?.focusLevel ?? "Unknown"}%
- Daily goal: ${profile?.studyGoals?.dailyStudyMinutes ?? "Unknown"} minutes

Student progress:
- Focus Score: ${analytics?.focusScore ?? 0}
- Total Sessions: ${analytics?.totalSessions ?? 0}
- Total Study Hours: ${analytics?.totalHours ?? 0}
- Current Streak: ${profile?.streak ?? 0}

Weekly insights:
- Best Study Day: ${insights?.bestStudyDay ?? "Unknown"}
- Consistency: ${insights?.consistency ?? "Unknown"}

Forecast:
- Projected Focus Score: ${forecast?.projectedFocusScore ?? 0}
- Projected Sessions: ${forecast?.projectedSessions ?? 0}

Achievements:
${profile?.badges?.join(", ") ?? "None"}

Student question:
${question}

Answer using the student's actual progress and study data whenever relevant.

Keep responses concise and personalized.

Never use markdown formatting.
Do not use **bold**, *, #, bullet markdown, or code blocks.
Return plain readable text only.
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.status(200).json({
        answer: response.text,
      });
    } catch (error: any) {
      console.error(error);

      res.status(500).json({
        answer: "AI service is currently unavailable. Please try again later.",
      });
    }
  },
);

export const generateQuizHttp = onRequest(
  {
    secrets: [geminiApiKey],
    cors: true,
  },
  async (req, res) => {
    const { title, subject, content, difficulty } = req.body;

    if (!title || !subject) {
      res.status(400).json({
        quiz: "Please provide a note title and subject.",
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: geminiApiKey.value(),
    });

    const prompt = `
You are NeuroSync Quiz Generator.

Create a short revision quiz based on this study note.

Note title: ${title}
Subject: ${subject}

Study Note Content:
${content || "No note content provided. Use the title and subject only."}

Quiz Difficulty Level:
${difficulty || "Medium"}

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations outside JSON.

JSON format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Short explanation"
    }
  ]
}

Difficulty Guidelines:

- Easy:
Simple definitions, beginner-level concepts,
direct recall questions.

- Medium:
Concept understanding, moderate reasoning,
practical understanding.

- Hard:
Deep understanding, scenario-based reasoning,
analytical and critical-thinking questions.

If study note content is provided, questions must be based mainly on that content.
Generate exactly 5 multiple-choice questions.
Each question must have exactly 4 options.
answerIndex must be 0, 1, 2, or 3.
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.status(200).json({
        quiz: response.text,
      });
    } catch (error: any) {
      console.error(error);

      res.status(500).json({
        quiz: "AI quiz generation is currently unavailable. Please try again later.",
      });
    }
  },
);
