import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAIMoodAnalysisResponse } from "@shared/schema";

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Create a model instance for text generation
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

/**
 * Analyze mood using Gemini API
 * @param text Journal entry text content
 * @returns Mood analysis data compatible with the existing schema
 */
export async function analyzeMood(text: string): Promise<OpenAIMoodAnalysisResponse> {
  try {
    // Strip any HTML from text
    const stripHTML = (html: string) => {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || "";
    };

    // Make the content safe
    const cleanContent = typeof document !== "undefined" ? stripHTML(text) : text.replace(/<[^>]*>?/gm, "");
    
    // Calculate word count
    const wordCount = cleanContent.split(/\s+/).filter(Boolean).length;

    // Prompt for Gemini API
    const prompt = `
    Analyze the sentiment and emotional energy in this journal entry. 
    Provide the following information:
    1. A sentiment score from 0-100 (where 0 is very negative, 50 is neutral, 100 is very positive)
    2. An energy level score from 0-100 (where 0 is very low energy, 50 is moderate, 100 is very high energy)
    3. A brief 1-2 sentence summary of the emotional state
    4. 3-5 keywords that represent the main themes or emotions

    Format your response as JSON with these fields:
    {
      "sentiment": number,
      "energy": number,
      "summary": "string",
      "keywords": ["string", "string", ...]
    }

    Journal entry:
    ${cleanContent}
    `;

    // Generate content with JSON format
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
      },
    });

    const response = result.response;
    const responseText = response.text();

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from response");
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    // Validate and ensure the response has the expected format
    return {
      sentiment: Math.max(0, Math.min(100, Math.round(analysisData.sentiment))),
      energy: Math.max(0, Math.min(100, Math.round(analysisData.energy))),
      summary: analysisData.summary || "No summary available",
      keywords: Array.isArray(analysisData.keywords) ? analysisData.keywords.slice(0, 5) : [],
    };
  } catch (error) {
    console.error("Error analyzing mood with Gemini:", error);
    
    // Return default values in case of error
    return {
      sentiment: 50,
      energy: 50,
      summary: "Could not analyze journal entry. Please try again later.",
      keywords: ["unavailable"],
    };
  }
}