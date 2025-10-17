import { GoogleGenAI } from "@google/genai";
// Fix: Corrected import path for constants.
import { CHOOK_SYSTEM_INSTRUCTION } from '../constants';

// Async generator function to stream the roast
export async function* streamRoast(code: string, context: string, detectedLanguage: string): AsyncGenerator<string> {
  // Defensive check for API key
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Format the prompt with language and context as required by the V3 system instruction
    const formattedMessage = `LANGUAGE: ${detectedLanguage || 'None'}
CONTEXT: ${context.trim() || 'None'}
---
CODE:
${code}`;

    // FIX: Refactored to use generateContentStream for a more direct single-turn streaming call.
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: formattedMessage,
      config: {
        systemInstruction: CHOOK_SYSTEM_INSTRUCTION,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Error streaming from Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API call failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while streaming from Gemini API.");
  }
}