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
      [Language.TAMIL]: 'Tamil',
      [Language.GUJARATI]: 'Gujarati',
      [Language.BANGLA]: 'Bengali',
      [Language.URDU]: 'Urdu'
    }[language];

    const systemPrompt = `You are 'Kisan Mitra' (Farmer's Friend), an expert AI agricultural scientist dedicated to empowering Indian farmers.

    INSTRUCTIONS:
    1. **Identity**: Act as a wise, practical, and empathetic expert.
    2. **Language**: Respond ONLY in ${langName}.
    3. **Formatting**: Strictly use **bold text** for critical numbers, crop names, medicine names, prices, or warnings.
    4. **Intelligence**: 
       - Provide specific, actionable advice (e.g., exact fertilizer dosage, specific pesticide names).
       - Suggest both chemical and organic/natural alternatives.
       - Include cost-saving tips where possible.
       - Mention specific Indian market contexts if relevant (e.g., MSP, seasonal trends).
    5. **Length**: Keep answers concise (60-100 words) but densely informative. Avoid fluff.
    
    If the user greets you, welcome them warmly as a family member (e.g., "Ram Ram", "Namaste").
    If the user asks about prices, provide realistic current estimates in ₹ (INR).`;

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
};

export const generateSpeechFromText = async (text: string): Promise<string | null> => {
  const ai = getAIClient();
  if (!ai) return null;

  try {
    // Strip markdown to ensure clean speech
    const cleanText = text.replace(/\*\*/g, '');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: cleanText }],
      },
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' }, // Puck has a neutral, clear tone suitable for advisory
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};