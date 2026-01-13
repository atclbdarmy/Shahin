
import { GoogleGenAI, Type } from "@google/genai";
import { Laborer } from "../types";

export const getSmartMatch = async (userInput: string, laborers: Laborer[]): Promise<{
  bestMatchId: string;
  reason: string;
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const laborerContext = laborers.map(l => ({
    id: l.id,
    name: l.name,
    skills: l.skills.join(', '),
    rate: l.ratePerHour,
    rating: l.rating,
    bio: l.bio
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this request: "${userInput}". 
    From the following list of laborers, pick the BEST single match and explain why.
    
    Laborers: ${JSON.stringify(laborerContext)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bestMatchId: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["bestMatchId", "reason"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return { bestMatchId: laborers[0].id, reason: "Manual match selected due to processing error." };
  }
};
