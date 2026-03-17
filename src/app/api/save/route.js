import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
const DESIGNS_FILE = join(DATA_DIR, "designs.json");

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DESIGNS_FILE)) {
    writeFileSync(DESIGNS_FILE, "[]", "utf-8");
  }
}

function readDesigns() {
  ensureDataDir();
  const raw = readFileSync(DESIGNS_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeDesigns(designs) {
  ensureDataDir();
  writeFileSync(DESIGNS_FILE, JSON.stringify(designs, null, 2), "utf-8");
}

// POST /api/save — save a design
export async function POST(request) {
  try {
    const design = await request.json();

    if (!design || !design.type) {
      return NextResponse.json({ error: "Invalid design" }, { status: 400 });
    }

    const designs = readDesigns();
    const newDesign = {
      ...design,
      id: design.id || Date.now().toString(),
      savedAt: new Date().toISOString(),
    };

    designs.push(newDesign);
    writeDesigns(designs);

    return NextResponse.json({ success: true, design: newDesign });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json({ error: "Failed to save design" }, { status: 500 });
  }
}
