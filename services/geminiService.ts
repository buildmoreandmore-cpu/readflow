
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Cleans up messy text or attempts to "fetch" and extract main content if a URL is provided.
   * Since we can't fetch CORS-protected URLs easily in browser, we can ask Gemini 
   * to provide a summary or simulated content if it "knows" the source, 
   * or simply clean up pasted text.
   */
  async processContent(input: string): Promise<string> {
    const isUrl = input.trim().startsWith('http');
    
    const prompt = isUrl 
      ? `The user provided this URL: "${input}". 
         Please provide a clean, high-fidelity transcription of the main body text of the article/content found at this URL if you know it. 
         If you don't know the exact text, provide a detailed 500-1000 word overview/article on the subject in a clean reading format. 
         No meta-commentary, just the content.`
      : `The user pasted some text. Please clean it up for a speed-reading trainer. 
         Remove advertisements, navigation text, or weird formatting. 
         Preserve the flow and meaning. 
         Input: ${input.substring(0, 5000)}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text || input;
    } catch (error) {
      console.error("Gemini processing error:", error);
      return input;
    }
  }

  async getInsights(text: string): Promise<{ summary: string; difficulty: string; readingTime: number }> {
     try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following text for a speed reading session. 
        Provide a JSON object with: 
        - "summary": a one-sentence summary.
        - "difficulty": "Beginner", "Intermediate", or "Advanced".
        - "readingTime": Estimated reading time in minutes at 250 WPM.
        
        Text: ${text.substring(0, 2000)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              readingTime: { type: Type.NUMBER }
            }
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      return { summary: "Content loaded.", difficulty: "N/A", readingTime: 0 };
    }
  }
}

export const gemini = new GeminiService();
