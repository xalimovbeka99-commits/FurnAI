/**
 * @fileoverview Production Export API Route
 *
 * POST /api/export/production
 *   Generates a complete production package (ZIP) for a furniture design.
 *   The ZIP includes: DXF cutting files, G-code CNC program, PDF spec sheet,
 *   and machine-readable JSON spec.
 *
 *   Body: {
 *     type: string,             — Furniture type (wardrobe, table, etc.)
 *     style?: string,           — Design style (modern, luxury, etc.)
 *     material?: string,        — Primary material
 *     color?: string,           — Hex color
 *     width: number,            — Width in cm
 *     height: number,           — Height in cm
 *     depth: number,            — Depth in cm
 *     name?: string,            — Design name
 *     orderNumber?: string,     — Order reference
 *     components?: Array,       — Component list
 *     kitchen?: object,         — Kitchen-specific config
 *     toolDiameter?: number,    — CNC tool diameter in mm (default: 6)
 *     feedRate?: number,        — CNC feed rate mm/min (default: 3000)
 *     sheetWidth?: number,      — Material sheet width in mm (default: 2440)
 *     sheetHeight?: number,     — Material sheet height in mm (default: 1220)
 *   }
 *
 *   Returns: ZIP file as downloadable binary response.
 *
 * @module app/api/export/production
 */

import { NextResponse } from "next/server";
import { generateProductionPackage } from "@/lib/export/pipeline";

/** Force Node.js runtime for Buffer/file operations */
export const runtime = "nodejs";

/**
 * POST /api/export/production
 *
 * @param {Request} request
 * @returns {Promise<NextResponse>} ZIP file as a binary download.
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // ── Validate required fields ─────────────────────────────────────
    const { type, width, height, depth } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Design 'type' is required" },
        { status: 400 }
      );
    }

    if (!width || !height || !depth) {
      return NextResponse.json(
        { error: "Dimensions (width, height, depth) are required — values in cm" },
        { status: 400 }
      );
    }

    if (
      typeof width !== "number" || typeof height !== "number" || typeof depth !== "number" ||
      width <= 0 || height <= 0 || depth <= 0
    ) {
      return NextResponse.json(
        { error: "Dimensions must be positive numbers (in cm)" },
        { status: 400 }
      );
    }

    // ── Separate CNC options from design params ──────────────────────
    const {
      toolDiameter,
      feedRate,
      sheetWidth,
      sheetHeight,
      ...designParams
    } = body;

    const cncOptions = {};
    if (toolDiameter) cncOptions.toolDiameter = toolDiameter;
    if (feedRate) cncOptions.feedRate = feedRate;
    if (sheetWidth) cncOptions.sheetWidth = sheetWidth;
    if (sheetHeight) cncOptions.sheetHeight = sheetHeight;

    // ── Generate production package ──────────────────────────────────
    const zipBuffer = await generateProductionPackage(designParams, cncOptions);

    // ── Build filename ───────────────────────────────────────────────
    const slug = (body.name || body.type || "design")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const filename = `furnai-${slug}-production.zip`;

    // ── Return as downloadable ZIP ───────────────────────────────────
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(zipBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[export/production] Error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate production package",
        detail: err.message,
      },
      { status: 500 }
    );
  }
}
