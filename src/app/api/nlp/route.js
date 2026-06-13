import Anthropic from "@anthropic-ai/sdk";

let client;
try {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && apiKey !== "your_anthropic_api_key_here" && apiKey.trim() !== "") {
    client = new Anthropic({
      apiKey: apiKey,
    });
  }
} catch (e) {
  console.error("Failed to initialize Anthropic client:", e);
}

const EXTRACTION_PROMPT = `You are an AI furniture designer. Analyze the user's description and generate a complete Parametric FurnitureConfig.

The output MUST be a valid JSON object representing a "FurnitureConfig" which our parametric builder uses.

VALID ENUMS:
- type: "wardrobe" | "kitchen" | "office" | "bed" | "cabinet" | "shelves" | "table" | "dressing_table"
- style: "luxury" | "minimal" | "scandi" | "industrial" | "classic" | "modern" | "navy"
- material: "oak" | "walnut" | "white" | "black" | "beige" | "mahogany" | "linen" | "graphite" | "sage" | "navy" | "concrete" | "dark_wood"
- handleStyle: "gold" | "silver" | "black" | "hidden" | "chrome"
- doorType: "solid" | "glass" | "mirror" | "frosted"
- ledLighting: "off" | "warm" | "cool" | "rgb"

MODULES ARRAY:
Each item in "modules" represents a vertical bay or section (left to right).
- kind: "door" | "drawerBank" | "openShelf" | "applianceGap"
- widthRatio: float (e.g. 0.25, 0.5, must sum to 1.0 across all modules)
- doorCount: integer (number of doors in this module, e.g., 1 or 2)
- drawerRows: integer (number of drawers, e.g., 2, 3, 4)
- shelfCount: integer (number of internal open shelves)
- hingeSide: "left" | "right"

User Description: "{description}"

Return ONLY valid JSON, no markdown, no explanation. Output this exact schema:

{
  "type": "wardrobe",
  "style": "modern",
  "material": "oak",
  "handleStyle": "silver",
  "doorType": "solid",
  "ledLighting": "off",
  "hasPlinth": true,
  "plinthHeight": 0.1,
  "dimensions": {
    "width": 2.4,
    "height": 2.8,
    "depth": 0.6
  },
  "modules": [
    { "kind": "door", "widthRatio": 0.5, "doorCount": 2, "shelfCount": 2, "hingeSide": "left" },
    { "kind": "drawerBank", "widthRatio": 0.5, "drawerRows": 4 }
  ],
  "ai": {
    "source": "nlp",
    "confidence": 0.9,
    "assumptions": ["Assumed 4 drawers based on 'lots of drawers'"]
  }
}`;

// Local parsing fallback based on regular expressions and keyword matches
function localParseFallback(description) {
  const desc = description.toLowerCase();

  let type = "wardrobe";
  if (desc.includes("kitchen")) type = "kitchen";
  else if (desc.includes("desk") || desc.includes("office")) type = "office";
  else if (desc.includes("bed")) type = "bed";
  else if (desc.includes("cabinet")) type = "cabinet";
  else if (desc.includes("shel")) type = "shelves";

  let material = "oak";
  if (desc.includes("walnut")) material = "walnut";
  else if (desc.includes("white")) material = "white";
  else if (desc.includes("black")) material = "black";

  let style = "modern";
  if (desc.includes("luxury")) style = "luxury";
  else if (desc.includes("minimal")) style = "minimal";

  let handleStyle = "silver_knob";
  if (desc.includes("gold")) handleStyle = "gold_bar";
  else if (desc.includes("hidden") || desc.includes("push")) handleStyle = "hidden_push";

  const w = desc.includes("kitchen") ? 3.0 : 2.4;
  const h = desc.includes("kitchen") ? 2.2 : 2.8;
  const d = desc.includes("kitchen") ? 0.6 : 0.6;

  return {
    type,
    style,
    material,
    handleStyle,
    doorType: desc.includes("glass") ? "glass_panel" : "solid_panel",
    ledLighting: desc.includes("led") ? "warm" : "off",
    hasPlinth: true,
    plinthHeight: 0.1,
    dimensions: {
      width: w,
      height: h,
      depth: d
    },
    // Compatibility properties for old builder URL redirection
    furnitureType: type,
    primaryColor: material,
    width: w * 100, // meters to cm
    height: h * 100,
    depth: d * 100,
    modules: [
      { kind: "door", widthRatio: 0.5, doorCount: 1, shelfCount: 2, hingeSide: "left" },
      { kind: "drawerBank", widthRatio: 0.5, drawerRows: 3 }
    ],
    ai: {
      source: "local-fallback",
      confidence: 0.5,
      assumptions: ["Fallback parser used due to no API key"]
    }
  };
}

export async function POST(request) {
  let description = "";
  try {
    const body = await request.json();
    description = body.description;
  } catch (err) {
    return Response.json({ error: "Description is required in JSON body" }, { status: 400 });
  }

  if (!description || description.trim().length === 0) {
    return Response.json({ error: "Description is required" }, { status: 400 });
  }

  if (!client) {
    console.warn("Anthropic API key not set. Using local fallback parser.");
    const fallbackParams = localParseFallback(description);
    return Response.json({
      success: true,
      parameters: fallbackParams,
      rawDescription: description,
      source: "local-fallback"
    });
  }

  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: EXTRACTION_PROMPT.replace("{description}", description),
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    let extracted;
    try {
      extracted = JSON.parse(content.text);
    } catch {
      console.error("Failed to parse Claude response:", content.text);
      throw new Error("Failed to parse structured parameters");
    }

    // Map extracted parameters to support both new parametric and old flat formats
    const parameters = {
      ...extracted,
      furnitureType: extracted.type || extracted.furnitureType,
      primaryColor: extracted.material || extracted.primaryColor,
      width: extracted.width || (extracted.dimensions?.width ? extracted.dimensions.width * 100 : undefined),
      height: extracted.height || (extracted.dimensions?.height ? extracted.dimensions.height * 100 : undefined),
      depth: extracted.depth || (extracted.dimensions?.depth ? extracted.dimensions.depth * 100 : undefined),
    };

    return Response.json({
      success: true,
      parameters,
      rawDescription: description,
      source: "claude-api"
    });
  } catch (error) {
    console.error("Claude API failed. Using local fallback parser. Error:", error);
    const fallbackParams = localParseFallback(description);
    return Response.json({
      success: true,
      parameters: fallbackParams,
      rawDescription: description,
      source: "local-fallback"
    });
  }
}
