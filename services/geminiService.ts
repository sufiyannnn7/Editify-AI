
import { GoogleGenAI } from "@google/genai";
import { INTERNAL_PROMPT_TEMPLATE, SPECIAL_EDIT_MAPPINGS } from "../constants";
import { EditingStyle } from "../types";

export async function editImage(
  base64Images: string[],
  instruction: string,
  style: EditingStyle
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean up the instruction and map to technical terms if possible
  let refinedInstruction = instruction;
  for (const [key, val] of Object.entries(SPECIAL_EDIT_MAPPINGS)) {
    if (instruction.toLowerCase().includes(key)) {
      refinedInstruction += `. Technical adjustment: ${val}`;
    }
  }

  // Add asset-specific context for multi-image tasks
  const multiImageContext = base64Images.length > 1 
    ? `You have been provided with ${base64Images.length} separate source images. Asset #1 is the first image, Asset #2 is the second, and so on. Please combine, merge, or edit them together into a single master image as requested, ensuring all subjects look like they belong in the same environment with matched lighting and perspective.`
    : "";

  const prompt = INTERNAL_PROMPT_TEMPLATE
    .replace('{{style}}', style)
    .replace('{{instruction}}', `${multiImageContext} ${refinedInstruction}`);

  // Convert all images to parts
  const imageParts = base64Images.map((img, index) => ({
    inlineData: {
      mimeType: 'image/png',
      data: img.split(',')[1] || img,
    },
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { 
      parts: [
        { text: prompt },
        ...imageParts 
      ] 
    },
  });

  // Iterate through parts to find the resulting edited image
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("The AI engine was unable to generate a high-quality result. Please try refining your instruction.");
}
