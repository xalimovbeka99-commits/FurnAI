import { NextResponse } from "next/server";

// Simple in-memory rate limiter (10 requests per minute per IP)
const rateLimitMap = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const SYSTEM_PROMPT = `You are a furniture design AI assistant. When given a description of furniture, you must return a structured JSON object with the following fields:

{
  "type": "wardrobe" | "sofa" | "table" | "cabinet" | "kitchen",
  "style": "modern" | "minimal" | "luxury" | "classic" | "industrial",
  "material": "wood" | "glass" | "metal" | "marble" | "fabric",
  "color": "#hexcolor",
  "width": number (in cm, realistic),
  "height": number (in cm, realistic),
  "depth": number (in cm, realistic),
  "components": [
    { "name": string, "type": string, "count": number, "material": string }
  ],
  "suggestions": {
    "style_note": string (brief design tip),
    "material_note": string (material recommendation),
    "layout_note": string (layout suggestion)
  },
  "name": string (creative name for this design)
}

Rules:
- Use realistic furniture dimensions (e.g., wardrobe: 120-200cm wide, 180-240cm tall)
- For sofas use fabric material with soft colors
- For kitchens include cabinets, countertop, drawers, and appliance slots
- components should list every distinct part of the furniture
- Always return ONLY valid JSON, no markdown or extra text`;

export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const description = typeof body.description === "string" ? body.description.trim() : "";

    // Input validation
    if (!description || description.length === 0) {
      return NextResponse.json(
        { error: "Please provide a furniture description" },
        { status: 400 }
      );
    }
    if (description.length > 500) {
      return NextResponse.json(
        { error: "Description too long. Max 500 characters." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key, use smart fallback
    if (!apiKey || apiKey === "your_openai_api_key_here") {
      const fallbackResult = generateFallback(description);
      return NextResponse.json(fallbackResult);
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Design furniture based on this description: "${description}"` },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errData);
      // Fallback to smart generation on API error
      const fallbackResult = generateFallback(description);
      return NextResponse.json(fallbackResult);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      const fallbackResult = generateFallback(description);
      return NextResponse.json(fallbackResult);
    }

    // Parse JSON from response
    const jsonMatch = content.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      const fallbackResult = generateFallback(description);
      return NextResponse.json(fallbackResult);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI generation error:", error);
    const fallbackResult = generateFallback("modern furniture");
    return NextResponse.json(fallbackResult);
  }
}

// Smart fallback when no API key or API fails
function generateFallback(description) {
  const desc = description.toLowerCase();

  // Detect type
  let type = "wardrobe";
  if (desc.includes("sofa") || desc.includes("couch")) type = "sofa";
  else if (desc.includes("table") || desc.includes("desk")) type = "table";
  else if (desc.includes("cabinet") || desc.includes("drawer")) type = "cabinet";
  else if (desc.includes("kitchen")) type = "kitchen";

  // Detect style
  let style = "modern";
  if (desc.includes("luxury") || desc.includes("premium")) style = "luxury";
  else if (desc.includes("minimal") || desc.includes("simple")) style = "minimal";
  else if (desc.includes("classic") || desc.includes("traditional")) style = "classic";
  else if (desc.includes("industrial")) style = "industrial";

  // Detect material
  let material = "wood";
  if (desc.includes("glass")) material = "glass";
  else if (desc.includes("metal") || desc.includes("steel")) material = "metal";
  else if (desc.includes("marble")) material = "marble";
  else if (desc.includes("fabric") || desc.includes("velvet")) material = "fabric";

  // Detect color
  let color = "#8B6914";
  if (desc.includes("white")) color = "#E8E8E8";
  else if (desc.includes("black")) color = "#1a1a1a";
  else if (desc.includes("gray") || desc.includes("grey")) color = "#888888";
  else if (desc.includes("blue") || desc.includes("navy")) color = "#2563eb";
  else if (desc.includes("beige")) color = "#D4C4A0";
  else if (desc.includes("walnut")) color = "#3E2723";
  else if (type === "sofa") color = "#B0A090";

  const configs = {
    wardrobe: {
      width: 150, height: 220, depth: 60,
      components: [
        { name: "Left Panel", type: "panel", count: 1, material },
        { name: "Right Panel", type: "panel", count: 1, material },
        { name: "Back Panel", type: "panel", count: 1, material },
        { name: "Top Panel", type: "panel", count: 1, material },
        { name: "Bottom Panel", type: "panel", count: 1, material },
        { name: "Shelf", type: "shelf", count: style === "luxury" ? 5 : 3, material },
        { name: "Door", type: "door", count: 2, material },
        { name: "Handle", type: "hardware", count: 2, material: "metal" },
        { name: "Hinge", type: "hardware", count: 4, material: "metal" },
      ],
    },
    sofa: {
      width: 200, height: 85, depth: 90,
      components: [
        { name: "Base Frame", type: "frame", count: 1, material: "wood" },
        { name: "Backrest", type: "cushion", count: 1, material: "fabric" },
        { name: "Seat Cushion", type: "cushion", count: 2, material: "fabric" },
        { name: "Back Cushion", type: "cushion", count: 2, material: "fabric" },
        { name: "Left Armrest", type: "armrest", count: 1, material: "fabric" },
        { name: "Right Armrest", type: "armrest", count: 1, material: "fabric" },
        { name: "Leg", type: "leg", count: 4, material: "metal" },
      ],
    },
    table: {
      width: 140, height: 75, depth: 80,
      components: [
        { name: "Tabletop", type: "top", count: 1, material },
        { name: "Leg", type: "leg", count: 4, material: style === "modern" ? "metal" : material },
        { name: "Cross Support", type: "support", count: 2, material: style === "modern" ? "metal" : material },
      ],
    },
    cabinet: {
      width: 100, height: 120, depth: 50,
      components: [
        { name: "Frame Panel", type: "panel", count: 5, material },
        { name: "Drawer Front", type: "drawer", count: 3, material },
        { name: "Drawer Rail", type: "hardware", count: 6, material: "metal" },
        { name: "Handle", type: "hardware", count: 3, material: "metal" },
        { name: "Leg", type: "leg", count: 4, material: "metal" },
      ],
    },
    kitchen: {
      width: 300, height: 220, depth: 65,
      components: [
        { name: "Upper Cabinet", type: "cabinet", count: 3, material },
        { name: "Lower Cabinet", type: "cabinet", count: 3, material },
        { name: "Drawer Unit", type: "drawer", count: 4, material },
        { name: "Countertop", type: "countertop", count: 1, material: "marble" },
        { name: "Cabinet Door", type: "door", count: 6, material },
        { name: "Door Hinge", type: "hardware", count: 12, material: "metal" },
        { name: "Handle", type: "hardware", count: 10, material: "metal" },
        { name: "Drawer Rail", type: "hardware", count: 8, material: "metal" },
        { name: "Fridge Slot", type: "appliance_space", count: 1, material: "none" },
        { name: "Dishwasher Slot", type: "appliance_space", count: 1, material: "none" },
      ],
    },
  };

  const config = configs[type];
  const name = `${style.charAt(0).toUpperCase() + style.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)}`;

  return {
    type,
    style,
    material,
    color,
    width: config.width,
    height: config.height,
    depth: config.depth,
    components: config.components,
    suggestions: {
      style_note: `A ${style} ${type} pairs well with clean lines and ${material === "wood" ? "natural tones" : material + " accents"}.`,
      material_note: `${material.charAt(0).toUpperCase() + material.slice(1)} is an excellent choice for durability and aesthetics.`,
      layout_note: type === "kitchen"
        ? "Consider separating wet and dry zones for optimal workflow."
        : `For a ${style} look, keep proportions balanced and avoid overcrowding.`,
    },
    name,
  };
}
