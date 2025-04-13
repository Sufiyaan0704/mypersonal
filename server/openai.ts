import OpenAI from "openai";
import { OpenAIMoodAnalysisResponse } from "@shared/schema";

// Use environment variable for API key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "your-api-key"
});

// Analyze mood from journal entry text
export async function analyzeMood(text: string): Promise<OpenAIMoodAnalysisResponse> {
  try {
    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a mood analysis expert. Analyze the sentiment and energy level in the provided journal entry.
          
          Provide:
          1. A sentiment score from 1-100 (1 being most negative, 100 being most positive)
          2. An energy level score from 1-100 (1 being lowest energy, 100 being highest energy)
          3. A brief 1-2 sentence summary of the mood expressed in the text
          4. Up to 5 keywords that represent the emotional states expressed in the text
          
          Respond with JSON in this format exactly:
          {
            "sentiment": number,
            "energy": number,
            "summary": string,
            "keywords": string[]
          }`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the content and ensure it has the correct structure
    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      sentiment: Math.max(1, Math.min(100, Math.round(result.sentiment))),
      energy: Math.max(1, Math.min(100, Math.round(result.energy))),
      summary: result.summary,
      keywords: result.keywords || []
    };
  } catch (error) {
    console.error("Error analyzing mood:", error);
    // Return default values if analysis fails
    return {
      sentiment: 50,
      energy: 50,
      summary: "Unable to analyze mood at this time.",
      keywords: ["unavailable"]
    };
  }
}
