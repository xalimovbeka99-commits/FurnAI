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

// Local parsing fallback based on regular expressions and keyword matches
function localParseFallback(description) {
  const desc = description.toLowerCase();

  // 1. Furniture Type
  let furnitureType = "wardrobe";
  let furnitureTypeConf = 0.5;
  if (desc.includes("wardrobe")) { furnitureType = "wardrobe"; furnitureTypeConf = 0.95; }
  else if (desc.includes("kitchen") || (desc.includes("cabinet") && desc.includes("cook"))) { furnitureType = "kitchen"; furnitureTypeConf = 0.95; }
  else if (desc.includes("desk") || desc.includes("office")) { furnitureType = "office"; furnitureTypeConf = 0.95; }
  else if (desc.includes("bed")) { furnitureType = "bed"; furnitureTypeConf = 0.95; }
  else if (desc.includes("sideboard")) { furnitureType = "cabinet"; furnitureTypeConf = 0.95; }
  else if (desc.includes("cabinet")) { furnitureType = "cabinet"; furnitureTypeConf = 0.85; }
  else if (desc.includes("shel")) { furnitureType = "shelves"; furnitureTypeConf = 0.95; }
  else if (desc.includes("table")) { furnitureType = "table"; furnitureTypeConf = 0.95; }
  else if (desc.includes("dressing")) { furnitureType = "dressing_table"; furnitureTypeConf = 0.95; }

  // 2. Style Preset
  let style = "modern";
  let styleConf = 0.5;
  if (desc.includes("luxury") || desc.includes("premium")) { style = "luxury"; styleConf = 0.9; }
  else if (desc.includes("minimal")) { style = "minimal"; styleConf = 0.9; }
  else if (desc.includes("scandi") || desc.includes("nordic")) { style = "scandi"; styleConf = 0.9; }
  else if (desc.includes("industrial")) { style = "industrial"; styleConf = 0.9; }
  else if (desc.includes("classic") || desc.includes("traditional")) { style = "classic"; styleConf = 0.9; }
  else if (desc.includes("modern")) { style = "modern"; styleConf = 0.9; }
  else if (desc.includes("navy")) { style = "navy"; styleConf = 0.9; }

  // 3. Materials & Colors
  let primaryColor = "oak";
  if (desc.includes("walnut") || desc.includes("dark brown")) primaryColor = "walnut";
  else if (desc.includes("white")) primaryColor = "white";
  else if (desc.includes("black") || desc.includes("dark gray")) primaryColor = "black";
  else if (desc.includes("beige") || desc.includes("cream")) primaryColor = "beige";
  else if (desc.includes("mahogany") || desc.includes("cherrywood")) primaryColor = "mahogany";
  else if (desc.includes("linen")) primaryColor = "linen";
  else if (desc.includes("graphite") || desc.includes("charcoal")) primaryColor = "graphite";
  else if (desc.includes("sage")) primaryColor = "sage";
  else if (desc.includes("navy")) primaryColor = "navy";
  else if (desc.includes("concrete") || desc.includes("cement")) primaryColor = "concrete";
  else if (desc.includes("dark wood") || desc.includes("wenge")) primaryColor = "darkwood";
  else if (desc.includes("oak")) primaryColor = "oak";

  // 4. Hardware Specifications
  let handleStyle = "gold";
  if (desc.includes("gold bar") || desc.includes("brass") || desc.includes("gold")) handleStyle = "gold";
  else if (desc.includes("silver knob") || desc.includes("chrome knob") || desc.includes("silver")) handleStyle = "silver";
  else if (desc.includes("black strip") || desc.includes("matte black")) handleStyle = "black";
  else if (desc.includes("hidden") || desc.includes("push to open") || desc.includes("no handle") || desc.includes("push-to-open")) handleStyle = "hidden";
  else if (desc.includes("chrome")) handleStyle = "chrome";
  else if (style === "minimal" || style === "modern") handleStyle = "hidden";

  let doorType = "solid";
  if (desc.includes("glass panel") || desc.includes("glass door") || desc.includes("glass")) doorType = "glass";
  else if (desc.includes("mirror")) doorType = "mirror";
  else if (desc.includes("frosted")) doorType = "frosted";

  // 5. Interior Features
  let drawerRows = 0;
  if (desc.includes("3 drawer") || desc.includes("3 rows of drawers") || desc.includes("three drawers")) drawerRows = 3;
  else if (desc.includes("2 drawer") || desc.includes("2 rows of drawers") || desc.includes("two drawers")) drawerRows = 2;
  else if (desc.includes("1 drawer") || desc.includes("one drawer")) drawerRows = 1;
  else if (desc.includes("drawer")) drawerRows = 2;

  let hangerRods = desc.includes("hanger") || desc.includes("hanging") || desc.includes("rod");

  let ledLighting = "off";
  if (desc.includes("warm led") || desc.includes("warm light")) ledLighting = "warm";
  else if (desc.includes("cool led") || desc.includes("cool light")) ledLighting = "cool";
  else if (desc.includes("rgb led") || desc.includes("neon")) ledLighting = "rgb";
  else if (desc.includes("led") || desc.includes("light")) ledLighting = "warm";

  // 6. Dimensions (parse numbers)
  let width = undefined;
  let height = undefined;
  let depth = undefined;
  let dimConf = 0.0;

  // Look for "W x H x D" patterns, e.g. "2.4m x 2.8m x 0.6m" or "240 x 280 x 60"
  const mMatches = description.match(/(\d+(?:\.\d+)?)\s*(?:m|meter|meters|cm|mm)?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters|cm|mm)?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters|cm|mm)?/i);
  if (mMatches) {
    const rawVal1 = parseFloat(mMatches[1]);
    const rawVal2 = parseFloat(mMatches[2]);
    const rawVal3 = parseFloat(mMatches[3]);

    const toCm = (val, isDepth = false) => {
      // If the number is very small (like < 10), it's likely in meters
      if (val < 10) return val * 100;
      return val;
    };
    width = toCm(rawVal1);
    height = toCm(rawVal2);
    depth = toCm(rawVal3, true);
    dimConf = 0.9;
  } else {
    // Width parsing
    const wMatch = description.match(/(\d+(?:\.\d+)?)\s*(?:m|meter|meters|cm|mm)?\s*(?:wide|width|w\b)/i);
    if (wMatch) {
      const val = parseFloat(wMatch[1]);
      width = wMatch[0].toLowerCase().includes("cm") ? val : (val < 10 ? val * 100 : val);
      dimConf = 0.8;
    }
    // Height parsing
    const hMatch = description.match(/(\d+(?:\.\d+)?)\s*(?:m|meter|meters|cm|mm)?\s*(?:high|height|h\b|tall)/i);
    if (hMatch) {
      const val = parseFloat(hMatch[1]);
      height = hMatch[0].toLowerCase().includes("cm") ? val : (val < 10 ? val * 100 : val);
      dimConf = 0.8;
    }
    // Depth parsing
    const dMatch = description.match(/(\d+(?:\.\d+)?)\s*(?:m|meter|meters|cm|mm)?\s*(?:deep|depth|d\b)/i);
    if (dMatch) {
      const val = parseFloat(dMatch[1]);
      depth = dMatch[0].toLowerCase().includes("cm") ? val : (val < 10 ? val * 100 : val);
      dimConf = 0.8;
    }
  }

  // Smart defaults based on type if dimensions are not specified
  if (!width || !height || !depth) {
    if (furnitureType === "wardrobe") {
      width = width || 240;
      height = height || 280;
      depth = depth || 60;
    } else if (furnitureType === "kitchen") {
      width = width || 300;
      height = height || 220;
      depth = depth || 65;
    } else if (furnitureType === "office") {
      width = width || 240;
      height = height || 280;
      depth = depth || 40;
    } else if (furnitureType === "bed") {
      width = width || 165;
      height = height || 100;
      depth = depth || 210;
    } else if (furnitureType === "cabinet") {
      width = width || 100;
      height = height || 120;
      depth = depth || 50;
    } else if (furnitureType === "shelves") {
      width = width || 120;
      height = height || 220;
      depth = depth || 32;
    } else if (furnitureType === "table") {
      width = width || 160;
      height = height || 75;
      depth = depth || 90;
    } else if (furnitureType === "dressing_table") {
      width = width || 120;
      height = height || 155;
      depth = depth || 50;
    }
  }

  return {
    furnitureType,
    style,
    primaryColor,
    doorType,
    handleStyle,
    drawerRows,
    hangerRods,
    ledLighting,
    width,
    height,
    depth,
    confidence: {
      furnitureType: furnitureTypeConf,
      style: styleConf,
      dimensions: dimConf || 0.5
    },
    rawDescription: description
  };
}

export async function POST(request) {
  let description = "";
  try {
    const body = await request.json();
    description = body.description;
  } catch (err) {
    return Response.json(
      { error: "Description is required in JSON body" },
      { status: 400 }
    );
  }

  if (!description || description.trim().length === 0) {
    return Response.json(
      { error: "Description is required" },
      { status: 400 }
    );
  }

  // Fallback if client is not configured
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
      throw new Error("Failed to parse structured parameters");
    }

    return Response.json({
      success: true,
      parameters: extracted,
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
