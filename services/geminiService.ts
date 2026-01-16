
import { GoogleGenAI, Type } from "@google/genai";
import { DocumentGuidance, ServiceType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getMissingDocumentGuidance = async (document: string): Promise<DocumentGuidance> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain why the document "${document}" is required for banking services and how a customer can obtain it through official government channels.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          document: { type: Type.STRING },
          reason: { type: Type.STRING, description: "One sentence on why it is needed." },
          procurementMethod: { type: Type.STRING, description: "Official steps to get it." },
          estimatedWait: { type: Type.STRING, description: "Estimated time to get this doc (e.g. 5 days)." },
        },
        required: ["document", "reason", "procurementMethod", "estimatedWait"]
      }
    }
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    return {
      document,
      reason: "Required for identity verification.",
      procurementMethod: "Visit the nearest government office or apply online at the official portal.",
      estimatedWait: "Depends on processing."
    };
  }
};

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
    return ["10:30 AM", "02:30 PM", "03:45 PM"];
  }
};
