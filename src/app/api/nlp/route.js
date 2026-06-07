import Anthropic from "@anthropic-ai/sdk";

let client;
try {
  client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
} catch (e) {
  console.error("Failed to initialize Anthropic client:", e);
}

const EXTRACTION_PROMPT = `You are a furniture design parameter extractor. Analyze the user's description and extract structured data.

VALID VALUES:
- Furniture Type: wardrobe, kitchen, office, bed, cabinet, shelves, table, dressing_table
- Style: luxury, minimal, scandi, industrial, classic, modern, navy
- Materials: oak, walnut, white, black, beige, mahogany, linen, graphite, sage, navy, concrete, dark_wood
- Handle Style: gold, silver, black, hidden, chrome
- Door Type: solid, glass, mirror, frosted
- Drawer Rows: 0, 1, 2, 3
- LED Lighting: off, warm, cool, rgb
- Hanger Rods: true or false

User Description: "{description}"

Extract parameters as JSON. Be conservative - only include fields you're confident about (confidence >= 0.7).
Return ONLY valid JSON, no markdown, no explanation.

{
  "furnitureType": "wardrobe|kitchen|office|bed|cabinet|shelves|table|dressing_table",
  "style": "luxury|minimal|scandi|industrial|classic|modern|navy",
  "primaryColor": "oak|walnut|white|black|beige|mahogany|linen|graphite|sage|navy|concrete|dark_wood",
  "doorType": "solid|glass|mirror|frosted",
  "handleStyle": "gold|silver|black|hidden|chrome",
  "drawerRows": 0|1|2|3,
  "hangerRods": true|false,
  "ledLighting": "off|warm|cool|rgb",
  "width": number (in cm),
  "height": number (in cm),
  "depth": number (in cm),
  "confidence": {
    "furnitureType": 0.0-1.0,
    "style": 0.0-1.0,
    "dimensions": 0.0-1.0
  }
}

Only include fields you can confidently extract. Return confidence scores (0.0-1.0) for your main extractions.`;

export async function POST(request) {
  try {
    if (!client) {
      console.error("Anthropic client not initialized");
      return Response.json(
        { error: "API not configured. Please set ANTHROPIC_API_KEY." },
        { status: 500 }
      );
    }

    const { description } = await request.json();

    if (!description || description.trim().length === 0) {
      return Response.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 500,
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
      return Response.json(
        { error: "Failed to parse furniture parameters" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      parameters: extracted,
      rawDescription: description,
    });
  } catch (error) {
    console.error("NLP API error:", error);
    return Response.json(
      { error: error.message || "Failed to process description" },
      { status: 500 }
    );
  }
}
