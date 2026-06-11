import { NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_INSTRUCTIONS = `You are an expert marketing campaign strategist and copywriter.
Analyze the user's input containing campaign brief, target audience, product details, tone of voice, and marketing channels.
Generate a structured marketing campaign concept.

You MUST return a JSON object containing EXACTLY these fields:
{
  "concept": {
    "title": "Creative Campaign Title",
    "tagline": "A punchy, memorable tagline",
    "description": "A concise paragraph explaining the core theme and creative angle of the campaign."
  },
  "variants": [
    { "headline": "Catchy headline for variant 1", "body": "Persuasive body copy for variant 1 matching the tone and channel.", "channel": "Primary channel for this variant" },
    { "headline": "Catchy headline for variant 2", "body": "Persuasive body copy for variant 2 matching the tone and channel.", "channel": "Secondary channel for this variant" },
    { "headline": "Catchy headline for variant 3", "body": "Persuasive body copy for variant 3 matching the tone and channel.", "channel": "Tertiary channel for this variant" }
  ],
  "checklist": [
    "Launch action item 1 (e.g., set up tracking URLs)",
    "Launch action item 2 (e.g., launch ads on Social)",
    "Launch action item 3",
    "Launch action item 4",
    "Launch action item 5"
  ],
  "imagePrompts": [
    "Detailed descriptive prompt for DALL-E/gpt-image-2 to generate a campaign key visual representing the brand aesthetic. Stylized, commercial photography.",
    "Another descriptive image prompt representing a product mockup or social media graphic concept."
  ]
}

Return ONLY raw JSON. Do not include markdown codeblocks or extra text.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { brief, audience, product, tone, channels } = body;

    // Validation
    if (!brief || !audience || !product || !tone || !channels || channels.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: brief, audience, product, tone, or channels." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // FALLBACK MOCK DATA IF NO API KEY IS CONFIGURED
    if (!apiKey || apiKey === "your_openai_api_key_here" || apiKey.trim() === "") {
      console.warn("OpenAI API key not set or placeholder. Using mock generator fallback.");
      const mockResult = generateMockCampaign(brief, audience, product, tone, channels);
      // Wait 1.5s to simulate network latency for loading state verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({ ...mockResult, source: "mock-fallback" });
    }

    // Initialize OpenAI SDK
    const openai = new OpenAI({ apiKey });

    // Build the user input prompt
    const userPrompt = `
Generate a campaign based on:
- Product Details: ${product}
- Campaign Brief/Goal: ${brief}
- Target Audience: ${audience}
- Brand Tone of Voice: ${tone}
- Desired Channels: ${channels.join(", ")}
    `;

    // 1. Text Generation using the OpenAI Responses API
    const response = await openai.responses.create({
      model: "gpt-4o", // Adjust the text model here
      input: userPrompt,
      instructions: SYSTEM_INSTRUCTIONS
    });

    // Extract text safely from the responses output array or helper property
    let text = "";
    if (response.output_text) {
      text = response.output_text;
    } else if (response.output && response.output[0] && response.output[0].content && response.output[0].content[0]) {
      text = response.output[0].content[0].text;
    }

    if (!text) {
      throw new Error("Empty response returned from Responses API");
    }

    // Parse the JSON output
    let cleanText = text.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    let campaignData;
    try {
      campaignData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", cleanText);
      throw new Error("OpenAI model returned invalid JSON structure: " + parseError.message);
    }

    // 2. Image Generation using DALL-E / gpt-image-2 for the first 2 prompts
    const generatedImages = [];
    const promptsToGenerate = campaignData.imagePrompts ? campaignData.imagePrompts.slice(0, 2) : [];

    for (const promptText of promptsToGenerate) {
      let imageUrl = "";
      // Try current gpt-image-2 model, fall back to dall-e-3 then dall-e-2
      try {
        const imageRes = await openai.images.generate({
          model: "gpt-image-2", // Adjust the image model here
          prompt: promptText,
          n: 1,
          size: "1024x1024"
        });
        imageUrl = imageRes.data[0].url;
      } catch (err1) {
        console.warn("gpt-image-2 failed, falling back to dall-e-3:", err1.message);
        try {
          const imageRes = await openai.images.generate({
            model: "dall-e-3",
            prompt: promptText,
            n: 1,
            size: "1024x1024"
          });
          imageUrl = imageRes.data[0].url;
        } catch (err2) {
          console.warn("dall-e-3 failed, falling back to dall-e-2:", err2.message);
          try {
            const imageRes = await openai.images.generate({
              model: "dall-e-2",
              prompt: promptText,
              n: 1,
              size: "512x512"
            });
            imageUrl = imageRes.data[0].url;
          } catch (err3) {
            console.error("All image generation models failed:", err3.message);
            imageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"; // Premium placeholder
          }
        }
      }
      generatedImages.push({ prompt: promptText, url: imageUrl });
    }

    return NextResponse.json({
      ...campaignData,
      generatedImages,
      source: "openai-responses-api"
    });

  } catch (error) {
    console.error("Campaign Concept Studio API error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while generating your campaign concept." },
      { status: 500 }
    );
  }
}

// Helper to generate realistic mock data for testing without API keys
function generateMockCampaign(brief, audience, product, tone, channels) {
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  return {
    concept: {
      title: `Project ${cap(tone)} Spark`,
      tagline: `Unlocking the Future of ${cap(product.split(" ")[0] || "Innovation")}`,
      description: `A highly targeted campaign designed to address "${brief}" for our key demographic of ${audience}. By embracing a ${tone} tone across all touchpoints, we bridge the gap between digital convenience and human authenticity, creating an unmissable call-to-action.`
    },
    variants: [
      {
        headline: `Meet the next generation of ${product}`,
        body: `We've reimagined how you interact with ${product}. Built for ${audience}, it delivers unparalleled results with a distinctly ${tone} feel. Find out why thousands are switching today.`,
        channel: channels[0] || "Social Media"
      },
      {
        headline: `Tired of the old way? Enter ${cap(tone)} Flow.`,
        body: `It's time to elevate your workflow. Our ${product} integrates seamlessly into your life, helping you achieve more without the stress. Designed specifically for ${audience}.`,
        channel: channels[1] || channels[0] || "Email Marketing"
      },
      {
        headline: `Precision meets simplicity.`,
        body: `Discover why experts choose our ${product} to reach ${audience}. Experience the difference that a ${tone} design makes from day one.`,
        channel: channels[2] || channels[0] || "Search Ads"
      }
    ],
    checklist: [
      `Review and customize the copy variants for ${channels.join(" and ")}.`,
      `Finalize key visual creatives matching the prompts: "Minimalist layout highlighting ${product}".`,
      `Configure custom audience tracking and UTM parameters targeting "${audience}".`,
      `Set up A/B testing variables between variant 1 (focused on tone) and variant 2 (focused on product benefits).`,
      `Schedule campaign launch review and sign-off meeting with the design and marketing leads.`
    ],
    imagePrompts: [
      `A sleek modern product visual representing ${product} in a creative design studio. Soft professional shadows, neon cyan glowing accent details, high-end commercial photo.`,
      `A lifestyle marketing visual of ${audience} enjoying the benefits of ${product}. Natural lighting, premium minimalist interior, candid commercial photography.`
    ],
    generatedImages: [
      {
        prompt: `A sleek modern product visual representing ${product} in a creative design studio. Soft professional shadows, neon cyan glowing accent details, high-end commercial photo.`,
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
      },
      {
        prompt: `A lifestyle marketing visual of ${audience} enjoying the benefits of ${product}. Natural lighting, premium minimalist interior, candid commercial photography.`,
        url: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=800&auto=format&fit=crop"
      }
    ]
  };
}
