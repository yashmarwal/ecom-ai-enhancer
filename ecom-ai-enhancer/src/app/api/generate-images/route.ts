import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { prompts, productDetails } = await req.json();

    if (!prompts || !prompts.professional) {
      return NextResponse.json({ error: 'Missing image prompts' }, { status: 400 });
    }

    // Enhance prompts with product-preserving instructions
    const baseQuality = ', ultra realistic, high detail, 8K, product accurate, exact colors preserved, no design changes';
    const negativePrompt = 'blurry, low quality, distorted, wrong color, different design, modified product, cartoon, illustration';

    const generateImage = async (prompt: string): Promise<string> => {
      const enhancedPrompt = `${prompt}${baseQuality}. Product: ${productDetails}`;
      
      const imageBlob = await hf.textToImage({
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        inputs: enhancedPrompt,
        parameters: {
          negative_prompt: negativePrompt,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 1024,
          height: 1024,
        },
      });

      // Convert blob to base64
      const arrayBuffer = await imageBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return `data:image/png;base64,${base64}`;
    };

    // Generate all 3 images in parallel
    const [professionalImage, modelTryOnImage, lifestyleImage] = await Promise.all([
      generateImage(prompts.professional),
      generateImage(prompts.modelTryOn),
      generateImage(prompts.lifestyle),
    ]);

    return NextResponse.json({
      images: {
        professional: professionalImage,
        modelTryOn: modelTryOnImage,
        lifestyle: lifestyleImage,
      },
    });
  } catch (error: unknown) {
    console.error('Image generation error:', error);
    const message = error instanceof Error ? error.message : 'Image generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
