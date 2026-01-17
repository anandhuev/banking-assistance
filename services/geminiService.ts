import { GoogleGenAI, Type } from "@google/genai";

/**
 * getSmartTimeRecommendation uses AI to suggest optimal visit arrival times 
 * based on current load, service complexity, and the specific date.
 */
export const getSmartTimeRecommendation = async (service: string, currentLoad: number, dateStr: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Based on a bank service "${service}" on date "${dateStr}" and a current branch crowd level of ${currentLoad}/100, suggest 3 best arrival times (e.g., "10:30 AM") between 10 AM and 5 PM to visit for minimal wait. 
    IMPORTANT: Do not suggest any time between 1:00 PM and 2:00 PM as it is a lunch break. 
    Format as a simple array of strings. Do not provide ranges.`,
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
    // Fallback times if AI fails
    return ["10:30 AM", "11:15 AM", "03:45 PM"];
  }
};

/**
 * getDailyLoadInsight provides a single, professional overview of the day's expected traffic.
 * This is used to provide instant context for all slots without repeated AI calls.
 */
export const getDailyLoadInsight = async (service: string, crowdLevel: number): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `The bank service is "${service}" and the predicted daily crowd level is ${crowdLevel}/100. 
    Provide one very short (max 12 words) professional outlook on the waiting conditions for today. 
    Example: "High morning volume expected; afternoon slots offer significantly faster service."`,
  });

  return response.text.trim() || "Wait times vary by slot density; booking recommended for mid-day.";
};

/**
 * @deprecated Use getDailyLoadInsight for better performance.
 */
export const getWaitTimeAnalysis = async (slot: string, aheadCount: number): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `The user selected the ${slot} slot. There are ${aheadCount} people already scheduled before them. 
    Provide a very short (max 15 words) professional explanation of why the wait is estimated as it is.`,
  });

  return response.text || "Expected wait is based on current booking volume and counter availability.";
};
