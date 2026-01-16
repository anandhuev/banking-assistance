
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * getSmartTimeRecommendation uses AI to suggest optimal visit times 
 * based on current load and service complexity.
 */
export const getSmartTimeRecommendation = async (service: string, currentLoad: number): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on a bank service "${service}" and a current branch crowd level of ${currentLoad}/100, suggest 3 best time slots between 9 AM and 4 PM to visit for minimal wait. Format as a simple array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    return ["10:30 AM", "02:00 PM", "03:45 PM"];
  }
};
