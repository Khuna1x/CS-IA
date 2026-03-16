import { GoogleGenAI, Type } from "@google/genai";
import { Item, MatchResult } from '../types';

export const findMatches = async (targetItem: Item, candidates: Item[]): Promise<MatchResult[]> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("No API Key available for Gemini");
      return [];
    }

    const ai = new GoogleGenAI({ apiKey });

    // Filter candidates to only include the opposite type (if Lost, look for Found)
    // and exclude resolved items.
    const relevantCandidates = candidates.filter(
      c => c.type !== targetItem.type && c.status === 'OPEN'
    );

    if (relevantCandidates.length === 0) {
      return [];
    }

    // Limit candidates to avoid token limits for this demo if the list is huge
    const limitedCandidates = relevantCandidates.slice(0, 20);

    const prompt = `
      You are an intelligent assistant for a Hostel Lost and Found system.
      
      TARGET ITEM (${targetItem.type}):
      - Title: ${targetItem.title}
      - Description: ${targetItem.description}
      - Category: ${targetItem.category}
      - Location: ${targetItem.location}
      - Date: ${targetItem.dateReported}

      CANDIDATE ITEMS TO CHECK AGAINST:
      ${JSON.stringify(limitedCandidates.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        location: c.location,
        date: c.dateReported
      })))}

      Task: Identify if any of the candidate items are likely matches for the target item.
      Consider:
      1. Semantic similarity (e.g., "Phone" matches "iPhone").
      2. Location logic (e.g., "Dining Hall" is arguably close to "Common Room" if they are adjacent, but primarily look for exact or close matches).
      3. Date logic (A found item must be found AFTER or on the same day the lost item was lost).

      Return a JSON array of matches. If no likely match, return an empty array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              itemId: { type: Type.STRING },
              confidence: { type: Type.NUMBER, description: "Score between 0 and 100" },
              reason: { type: Type.STRING, description: "Short explanation of why this is a match" }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const results = JSON.parse(jsonText) as MatchResult[];
    
    // Sort by confidence
    return results.sort((a, b) => b.confidence - a.confidence);

  } catch (error) {
    console.error("Error matching items with Gemini:", error);
    return [];
  }
};
