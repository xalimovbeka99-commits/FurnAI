import { NextResponse } from "next/server";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
const DESIGNS_FILE = join(DATA_DIR, "designs.json");

// GET /api/designs — list all saved designs
export async function GET() {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!existsSync(DESIGNS_FILE)) {
      writeFileSync(DESIGNS_FILE, "[]", "utf-8");
    }

    const raw = readFileSync(DESIGNS_FILE, "utf-8");
    const designs = JSON.parse(raw);

    return NextResponse.json(designs);
  } catch (error) {
    console.error("Load designs error:", error);
    return NextResponse.json([]);
  }
}
