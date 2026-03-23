import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert file to blob
    const arrayBuffer = await image.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: image.type });

    // Step 1: Use vision model to describe the product in detail
    const visionResponse = await hf.imageToText({
      model: 'Salesforce/blip-image-captioning-large',
      data: blob,
    });

    const rawCaption = visionResponse.generated_text || '';

    // Step 2: Use text generation to create SEO title + description from caption
    const seoPrompt = `You are an expert e-commerce SEO copywriter. 
A product image has been analyzed and described as: "${rawCaption}"

Based ONLY on this exact product (do NOT change any details, colors, or design), generate:
1. A compelling SEO product title (max 70 characters, include key descriptive words)
2. An SEO-optimized product description (2-3 sentences, 120-160 characters, include key features, benefits, and relevant keywords)
3. Three image generation prompts for this EXACT product (same color, same design, no modifications):
   - Prompt A: Professional studio product photography, white background, perfect lighting
   - Prompt B: A model wearing/using this exact product in a fashion editorial style
   - Prompt C: Lifestyle photo of this product in a real-world aspirational setting

Respond ONLY in this exact JSON format, no extra text:
{
  "title": "...",
  "description": "...",
  "imagePrompts": {
    "professional": "...",
    "modelTryOn": "...",
    "lifestyle": "..."
  },
  "productDetails": "..."
}`;

    const textResponse = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      inputs: seoPrompt,
      parameters: {
        max_new_tokens: 600,
        temperature: 0.4,
        return_full_text: false,
      },
    });

    const rawText = textResponse.generated_text || '';

    // Extract JSON from the response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback: construct from caption
      return NextResponse.json({
        caption: rawCaption,
        title: `Premium ${rawCaption.slice(0, 50)}`,
        description: `Discover this ${rawCaption}. Perfect quality and design for every occasion. Shop now for the best value.`,
        imagePrompts: {
          professional: `Professional studio product photo of ${rawCaption}, white background, soft box lighting, 8K, commercial photography`,
          modelTryOn: `Fashion model wearing ${rawCaption}, editorial style, studio lighting, high fashion magazine shoot`,
          lifestyle: `${rawCaption} in a modern lifestyle setting, aspirational, natural light, Instagram worthy`,
        },
        productDetails: rawCaption,
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      caption: rawCaption,
      title: parsed.title || '',
      description: parsed.description || '',
      imagePrompts: parsed.imagePrompts || {},
      productDetails: parsed.productDetails || rawCaption,
    });
  } catch (error: unknown) {
    console.error('Analyze error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
