import { GoogleGenAI, Type } from "@google/genai";
import { AiSummary } from '../types';
import { GEMINI_API_KEY } from '../config';

let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY && !GEMINI_API_KEY.startsWith('YOUR_GEMINI_API_KEY')) {
  try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI in geminiService:", error);
  }
} else {
    console.warn("Gemini API key is not configured in src/config.ts. AI note processing will be disabled.");
}


const operationalAreas = [
  'Planning', 'Administrative & Governance', 'Accounting, Finance & Billing', 
  'Clinical Quality', 'Operations', 'Human Resources', 'Facilities', 
  'Marketing & Communications', 'Technology / IT', 'Credentialing'
];

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    overall_health: {
      type: Type.STRING,
      description: "A one-sentence overall project health assessment from the notes (e.g., On Track, At Risk, Needs Attention).",
    },
    executive_summary: {
      type: Type.STRING,
      description: "A concise summary of the meeting notes, under 100 words, suitable for stakeholders.",
    },
    area_updates: {
      type: Type.ARRAY,
      description: "Updates for each operational area mentioned in the notes.",
      items: {
        type: Type.OBJECT,
        properties: {
          area_name: {
            type: Type.STRING,
            description: "Name of the operational area.",
            enum: operationalAreas
          },
          progress_update: {
            type: Type.STRING,
            description: "A summary of progress mentioned for this area.",
          },
          identified_issues: {
            type: Type.ARRAY,
            description: "A list of issues or risks for this area identified in the notes.",
            items: { type: Type.STRING }
          },
        },
        required: ["area_name", "progress_update"],
      },
    },
    action_items: {
      type: Type.ARRAY,
      description: "A list of action items extracted from the meeting notes.",
      items: {
        type: Type.OBJECT,
        properties: {
          task: {
            type: Type.STRING,
            description: "The description of the action item.",
          },
          owner: {
            type: Type.STRING,
            description: "The person or team responsible for the action item, as mentioned in the notes.",
          },
        },
        required: ["task", "owner"],
      },
    },
  },
  required: ["overall_health", "executive_summary", "area_updates", "action_items"],
};


export async function processMeetingNotes(notes: string): Promise<AiSummary> {
  if (!ai) {
    throw new Error("Gemini AI Service for note processing is not available. Please configure your API key in src/config.ts.");
  }
  try {
    const prompt = `
      Analyze these healthcare project meeting notes. Your task is to extract key information and structure it as a JSON object.
      
      Focus on updates, risks, and action items related to these 10 operational areas: ${operationalAreas.join(', ')}.
      
      Meeting Notes:
      ---
      ${notes}
      ---
      
      Based on the notes, provide a structured JSON output with:
      1. An overall health assessment.
      2. A brief executive summary.
      3. Progress updates and identified issues for any of the 10 operational areas mentioned.
      4. A list of specific action items with their owners.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    // Basic validation to ensure the parsed object matches the AiSummary type
    if (
      !parsedJson.overall_health ||
      !parsedJson.executive_summary ||
      !Array.isArray(parsedJson.area_updates) ||
      !Array.isArray(parsedJson.action_items)
    ) {
      throw new Error("AI response is missing required fields.");
    }

    return parsedJson as AiSummary;

  } catch (error) {
    console.error("Error processing meeting notes with Gemini API:", error);
    throw new Error("Failed to get a valid summary from the AI. The model may have returned an unexpected format.");
  }
}