import "server-only";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompts";

let _client: GoogleGenAI | null = null;

function client(): GoogleGenAI {
  if (_client) return _client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  _client = new GoogleGenAI({ apiKey });
  return _client;
}

const TIMEOUT_MS = 10_000;

class TimeoutError extends Error {
  constructor() {
    super("AI took longer than 10s");
  }
}

export async function generateJson(prompt: string): Promise<unknown> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const callPromise = client().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.4,
      // Disable Gemini 2.5 "thinking" — drafting is pattern matching, not deep reasoning,
      // and thinking pushes latency past our 10s budget.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new TimeoutError()), TIMEOUT_MS)
  );
  const resp = await Promise.race([callPromise, timeoutPromise]);
  const text = resp.text || "";
  return JSON.parse(text);
}

export { TimeoutError };
