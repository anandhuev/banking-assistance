import { GoogleGenAI, Type } from "@google/genai";
import { DocumentGuidance, CrowdLevel, LoanInput, LoanRecommendation } from '../types';
import { TIME_SLOTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const getCrowdLevel = (branchName: string, slot: string): CrowdLevel => {
  const hash = branchName.length + slot.length + slot.charCodeAt(0);
  const val = hash % 3;
  if (val === 0) return 'Low';
  if (val === 1) return 'Medium';
  return 'Busy';
};

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
          reason: { type: Type.STRING },
          procurementMethod: { type: Type.STRING },
          estimatedWait: { type: Type.STRING }
        },
        required: ["document", "reason", "procurementMethod", "estimatedWait"]
      }
    }
  });

  try {
    const text = response.text || '';
    const jsonStr = text.trim();
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

export interface SmartRecommendationResponse {
  slots: string[];
  explanation: string;
}

export const getSmartTimeRecommendation = async (service: string, branchName: string): Promise<SmartRecommendationResponse> => {
  const slotsData = TIME_SLOTS.map(slot => ({
    slot,
    crowdLevel: getCrowdLevel(branchName, slot)
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Recommend 3 time slots for a "${service}" visit at "${branchName}". 
    Priority order: Low > Medium > Busy. Suggestions:
    ${slotsData.map(s => `- ${s.slot}: ${s.crowdLevel}`).join('\n')}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          slots: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          explanation: { type: Type.STRING }
        },
        required: ["slots", "explanation"]
      }
    }
  });

  try {
    const text = response.text || '';
    const jsonStr = text.trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    const lowSlots = slotsData.filter(s => s.crowdLevel === 'Low').map(s => s.slot);
    return { 
      slots: lowSlots.slice(0, 3), 
      explanation: "Priority given to Low crowd slots for maximum comfort." 
    };
  }
};

export const getLoanRecommendation = async (input: LoanInput): Promise<LoanRecommendation> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Recommend a loan for: ${input.purpose}, Income: ${input.incomeRange}, Employment: ${input.employmentType}, Amount: ${input.amount}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedLoan: { type: Type.STRING },
          alternativeLoan: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["recommendedLoan", "explanation"]
      }
    }
  });

  try {
    const text = response.text || '';
    const jsonStr = text.trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    return {
      recommendedLoan: "Personal Loan",
      explanation: "Based on the provided details, a personal loan offers the most flexibility."
    };
  }
};