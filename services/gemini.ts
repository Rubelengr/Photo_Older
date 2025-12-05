import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a Blob/File to a Base64 string.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the Data URI prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Sends the image to Gemini to apply the laminated, old mobile photo effect
 * while rectifying perspective.
 */
export const processImageEffect = async (base64Image: string, mimeType: string): Promise<string> => {
  const model = 'gemini-2.5-flash-image';

  const prompt = `
    Task: Transform the input image into a photorealistic "mobile phone photo" of an old, vintage laminated ID card.

    Directives for Realism & Texture:
    1. **Perspective & Geometry**: 
       - The card MUST be **perfectly straight and rectified** (top-down view).
       - Do NOT tilt or rotate the card. It should look like a clean scan or a perfectly aligned photo.

    2. **Advanced Material Simulation (The "Old Laminated" Effect)**:
       - **Plastic Waviness**: The lamination should NOT be perfectly flat. Introduce subtle waviness, ripples, or slight warping to the plastic surface to show it's old and flexible.
       - **Surface Texture**: Add pronounced scuff marks, fine surface scratches, and "swirl marks" on the plastic layer.
       - **Underlying Grain**: Render the subtle texture of the paper/cardstock *beneath* the plastic (paper grain, fibers) so it doesn't look like a flat digital print.
       - **Aging**: Slightly yellowed plastic, peeling or air pockets at the corners (dog-ears), and a visible seal around the edges.

    3. **Mobile Camera Simulation**:
       - **Lighting**: Realistic indoor lighting with a **SUBTLE MOBILE FLASH**.
       - **Flash Positioning**: 
         - Add a visible flash reflection/hotspot on the plastic to enhance realism.
         - **CRITICAL CONSTRAINT**: The flash hotspot MUST be located in the **BOTTOM-LEFT** or **CENTER**. 
         - **EXCLUSION ZONE**: The **UPPER-RIGHT** area must be completely clear of flash glare to ensure details are readable.
       - **Sensor**: Visible ISO noise/grain typical of indoor mobile photography. 

    4. **Environment**:
       - Place on a realistic **dark wooden table** surface (e.g., mahogany, walnut, or stained oak).
       - The wood texture and grain must be clearly visible and detailed.
       - Tightly cropped but visible background at edges to ground the object.

    Output: A single photorealistic image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate through parts to find the image output
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated in the response.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};