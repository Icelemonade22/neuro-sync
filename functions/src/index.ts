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
    const { question, profile } = req.body;

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

Student question:
${question}

Give a helpful, clear, student-friendly answer.
Keep it concise.
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
    const { title, subject } = req.body;

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

Generate:
- 5 multiple-choice questions
- 4 options each
- correct answer
- short explanation

Keep it student-friendly and concise.
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
