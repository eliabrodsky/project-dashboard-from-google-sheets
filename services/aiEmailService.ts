import { GoogleGenAI } from "@google/genai";
import type { Project } from '../types';
import { GEMINI_API_KEY } from '../config';
import Logger from './logger';

const logger = new Logger('AIEmailService');

let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY && !GEMINI_API_KEY.startsWith('YOUR_GEMINI_API_KEY')) {
  try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    logger.success('GoogleGenAI initialized successfully.');
  } catch (error) {
    logger.error("Failed to initialize GoogleGenAI", error);
  }
} else {
  logger.warn("Gemini API key is not configured in src/config.ts. Email generation will be disabled.");
}


export async function generateStatusUpdateEmail(project: Project): Promise<string> {
  logger.info('Generating status update email for project.', { projectName: project.projectName });
  if (!ai) {
    logger.error('Attempted to generate email, but AI service is not available.', {});
    throw new Error("Gemini AI Service is not available. Please configure your API key in src/config.ts.");
  }

  const prompt = `
    You are an AI assistant for a project management dashboard. Your task is to generate a professional, concise, and visually appealing HTML status update email for a project.

    **Project Details:**
    - Project Name: ${project.projectName}
    - Project Manager: ${project.projectManager}
    - Overall Progress: ${project.progressOverall}%
    - Total Budget: ${project.budget}
    - Last Updated: ${project.lastUpdatedOn}
    - Latest Notes: ${project.lastSummaryNotes || 'No recent notes available.'}

    **Instructions:**
    1.  Create an HTML email body with inline CSS for maximum compatibility with email clients.
    2.  Use a clean, professional design.
    3.  The email should include the following sections:
        - A main title with the project name.
        - A brief executive summary (1-2 sentences) of the project's current state based on its progress and latest notes.
        - A "Key Information" section with bullet points for Project Manager, Budget, and Progress.
        - For the Progress, include a visual progress bar using HTML divs. The color of the bar should be green for progress >= 80%, yellow for progress >= 40%, and red for progress < 40%.
        - A "Recent Notes" section summarizing the provided notes.
    4.  Do NOT include \`<html>\`, \`<head>\`, or \`<body>\` tags. Only generate the content that would go inside the \`<body>\`.
    5.  Use a professional and encouraging tone.

    Here is an example structure to follow:

    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h1 style="color: #1f2937; font-size: 24px;">Project Status: ${project.projectName}</h1>
      <p style="font-size: 16px;">Here is the latest status update for the ${project.projectName} project.</p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
        <h2 style="font-size: 18px; margin-top: 0;">Executive Summary</h2>
        <p>[Your generated 1-2 sentence summary here]</p>
      </div>

      <h2 style="font-size: 18px;">Key Information</h2>
      <ul>
        <li><strong>Manager:</strong> ${project.projectManager}</li>
        <li><strong>Total Budget:</strong> ${project.budget}</li>
        <li>
          <strong>Progress:</strong> ${project.progressOverall}%
          <div style="background-color: #e5e7eb; border-radius: 5px; height: 20px; width: 100%;">
            <div style="background-color: [progress color]; width: ${project.progressOverall}%; height: 20px; border-radius: 5px;"></div>
          </div>
        </li>
      </ul>

      <h2 style="font-size: 18px;">Recent Notes</h2>
      <p style="white-space: pre-wrap;">${project.lastSummaryNotes || 'No recent notes available.'}</p>
    </div>

    Now, generate the complete HTML based on the provided project details.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const emailText = response.text;
    logger.success('Successfully generated email content via Gemini.', { responseLength: emailText.length });
    return emailText;
  } catch (error) {
    logger.error("Error generating email with Gemini API", error);
    throw new Error("Failed to generate email content from the AI.");
  }
}