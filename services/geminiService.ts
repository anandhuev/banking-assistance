
import { GoogleGenAI, Type } from "@google/genai";

/**
 * getSmartTimeRecommendation uses AI to suggest optimal visit arrival times 
 * based on current load and service complexity.
 */
export const getSmartTimeRecommendation = async (service: string, currentLoad: number): Promise<string[]> => {
  // Fixed: Initialize GoogleGenAI inside the function using the environment variable directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on a bank service "${service}" and a current branch crowd level of ${currentLoad}/100, suggest 3 best arrival times (e.g., "10:30 AM") between 10 AM and 5 PM to visit for minimal wait. Format as a simple array of strings. Do not provide ranges.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    // Fixed: Correctly accessing the text property on the response object.
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    return ["10:30 AM", "02:00 PM", "03:45 PM"];
  }
};
