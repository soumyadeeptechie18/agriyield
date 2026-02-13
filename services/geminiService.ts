import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

// NOTE: In a real app, API key should be proxy-ed or handled securely.
// For this demo, we assume process.env.API_KEY is available.

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateAgriAdvice = async (
  prompt: string, 
  language: Language
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable (Missing Key)";

  try {
    const langName = {
      [Language.ENGLISH]: 'English',
      [Language.HINDI]: 'Hindi',
      [Language.MARATHI]: 'Marathi',
      [Language.TELUGU]: 'Telugu',
      [Language.TAMIL]: 'Tamil'
    }[language];

    const systemPrompt = `You are an expert agricultural scientist and friend to Indian farmers. 
    Your name is 'Kisan Mitra'.
    Provide practical, low-cost, and encouraging advice.
    Keep answers concise (under 100 words) and use simple formatting.
    Output directly in the ${langName} language.
    If the user asks about market prices, give estimated ranges for India.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return response.text || "Sorry, I could not generate advice at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI assistant. Please try again.";
  }
};

export const translateText = async (text: string, targetLang: Language): Promise<string> => {
    if (targetLang === Language.ENGLISH) return text;
    
    const ai = getAIClient();
    if (!ai) return text;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Translate the following text to ${targetLang}. Only return the translated text: "${text}"`,
        });
        return response.text || text;
    } catch (e) {
        return text;
    }
}