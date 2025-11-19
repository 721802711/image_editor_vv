
import { GoogleGenAI, Modality } from "@google/genai";

export async function editImageWithGemini(base64ImageData: string, mimeType: string, prompt: string): Promise<string> {
  // Initialize the client here to avoid a crash on load if the `process` object
  // is not available in the browser's global scope. The API key is automatically
  // injected by the execution environment.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const candidate = response.candidates?.[0];

    if (candidate?.finishReason === 'SAFETY') {
        throw new Error('The request was blocked due to safety filters. Try a different prompt or image.');
    }

    const firstPart = candidate?.content?.parts?.[0];

    if (firstPart) {
        if ('inlineData' in firstPart && firstPart.inlineData) {
            return firstPart.inlineData.data;
        }
        if ('text' in firstPart && firstPart.text) {
            throw new Error(`The model returned text instead of an image: "${firstPart.text}"`);
        }
    }
    
    throw new Error('No image data found in the API response. The model may have refused the request.');
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error; // Re-throw to be caught by the UI
  }
}

export async function removeBackgroundWithGemini(base64ImageData: string, mimeType: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
              },
            },
            {
              text: "Remove the background from this image. Return the image with a transparent background (alpha channel). Do not add any background color. Keep the main subject intact.",
            },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
  
      const candidate = response.candidates?.[0];

      if (candidate?.finishReason === 'SAFETY') {
          throw new Error('Background removal blocked due to safety filters.');
      }

      const firstPart = candidate?.content?.parts?.[0];
  
      if (firstPart) {
          if ('inlineData' in firstPart && firstPart.inlineData) {
              return firstPart.inlineData.data;
          }
          if ('text' in firstPart && firstPart.text) {
             // Sometimes the model might explain why it can't remove the background
             throw new Error(`AI Response: "${firstPart.text}"`);
          }
      }
      
      throw new Error('No image data found in the API response.');
    } catch (error) {
      console.error("Error calling Gemini API for background removal:", error);
      throw error;
    }
  }
