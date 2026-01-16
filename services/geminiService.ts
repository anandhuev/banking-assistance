import { GoogleGenAI, Type } from "@google/genai";
import { DocumentGuidance, CrowdLevel, LoanInput, LoanRecommendation } from '../types';
import { TIME_SLOTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getCrowdLevel = (branchName: string, slot: string): CrowdLevel => {
  const hash = branchName.length + slot.length + slot.charCodeAt(0);
  const val = hash % 3;
  if (val === 0) return 'Low';
  if (val === 1) return 'Medium';
  // FIX: Changed 'Busy' to 'High' to match the CrowdLevel type definition ('Low' | 'Medium' | 'High')
  return 'High';
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
    return JSON.parse(text.trim());
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
    Priority order: Low > Medium > High. Suggestions:
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
    return JSON.parse(text.trim());
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
    contents: `Perform a "Complex Loan Application" preparation for a customer.
    Details: 
    - Loan Type: ${input.purpose}
    - Amount Range: ${input.amountRange}
    - Employment: ${input.employmentType}
    - Co-applicant: ${input.hasCoApplicant ? 'Yes' : 'No'}
    - Collateral: ${input.hasCollateral ? 'Yes' : 'No'}
    - Currently Selected Documents: ${input.availableDocs.join(', ')}

    Identify why this is complex (e.g. high amount, collateral involved), list mandatory/conditional/delayed documents, suggest which desk to visit (General/Housing/MSME), and estimate branch time (45-60 min range). 
    Calculate a readiness score (0-100) based on documentation and input completeness.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedLoan: { type: Type.STRING },
          complexityReason: { type: Type.STRING },
          mandatoryDocs: { type: Type.ARRAY, items: { type: Type.STRING } },
          conditionalDocs: { type: Type.ARRAY, items: { type: Type.STRING } },
          delayDocs: { type: Type.ARRAY, items: { type: Type.STRING } },
          readinessScore: { type: Type.NUMBER },
          visitDuration: { type: Type.STRING },
          deskSuggestion: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["recommendedLoan", "complexityReason", "mandatoryDocs", "readinessScore", "visitDuration", "deskSuggestion", "explanation"]
      }
    }
  });

  try {
    const text = response.text || '';
    return JSON.parse(text.trim());
  } catch (e) {
    return {
      recommendedLoan: input.purpose || "Custom Loan",
      complexityReason: "In-branch verification required for complex documentation.",
      mandatoryDocs: ["Identity Proof", "Address Proof", "Income Proof"],
      conditionalDocs: ["Collateral Documents"],
      delayDocs: ["Old Bank Statements"],
      readinessScore: 60,
      visitDuration: "45-60 mins",
      deskSuggestion: "General Loan Desk",
      explanation: "A branch visit is required for validation of originals and collateral assessment."
    };
  }
};