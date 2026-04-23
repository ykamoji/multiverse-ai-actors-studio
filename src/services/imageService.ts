import { GoogleGenAI } from "@google/genai";

export async function generateSceneImage(
  sceneDescription: string,
  actors: { name: string; description: string; pose: string; imageBase64?: string }[],
  aspectRatio: string = "16:9"
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];

  let promptString = `Generate an image matching this scene description: ${sceneDescription}\n\n`;
  if (actors.length > 0) {
    promptString += `The scene MUST feature these exactly ${actors.length} characters using the provided portrait images as references for their appearance:\n`;
    actors.forEach((actor, index) => {
      const actorId = actor.name ? actor.name : `Character ${index + 1}`;
      promptString += `${index + 1}. ${actorId}:\n`;
      if (actor.description) promptString += `  - Visual Details: ${actor.description}\n`;
      promptString += `  - Pose/Action in this scene: ${actor.pose}\n`;
      
      if (actor.imageBase64) {
        // Extract base64 and mime type
        const match = actor.imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            }
          });
          promptString += `  - [REFER TO IMAGE ${parts.length} FOR THIS CHARACTER'S APPEARANCE]\n`;
        }
      }
    });
  }

  promptString += `\nINSTRUCTIONS:
1. Recreate the people from the provided portrait images faithfully in the new scene.
2. Position them according to the scene description and their specific poses.
3. Maintain consistent lighting and style across the entire generated image.
4. The output should be a single, high-quality, professional composite image.`;

  parts.push({ text: promptString });

  try {
    const response = await ai.models.generateContent({
      model: "imagen-4.0-generate-001",
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from the model.");
    }

    const responseParts = response.candidates[0].content.parts;
    if (!responseParts) {
      throw new Error("No parts in response.");
    }

    for (const part of responseParts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/jpeg;base64,${base64EncodeString}`;
      }
    }
    
    throw new Error("Image data not found in response.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
