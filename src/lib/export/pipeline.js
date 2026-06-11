/**
 * @fileoverview Complete Export Pipeline for FurnAI
 *
 * Orchestrates the full production export workflow:
 *   DXF cutting sheets + G-code CNC program + PDF spec sheet → ZIP archive
 *
 * Reuses the existing `generateFactorySpec` and `generateProductionSpec`
 * utilities for consistent component/hardware data.
 *
 * @module lib/export/pipeline
 */

import JSZip from "jszip";
import { generatePanelDXF, generateCuttingLayout } from "./dxf.js";
import { generateCuttingGcode } from "./gcode.js";
import { generateSpecSheet } from "./pdfSpec.js";
import { generateFactorySpec } from "@/lib/factoryExport";

/**
 * Generates a complete production package containing all export files.
 *
 * @param {object} design — Design object with the following shape:
 * @param {string} design.type       — e.g. "wardrobe", "table", "cabinet", "kitchen", "sofa"
 * @param {string} [design.style]    — e.g. "modern", "luxury", "minimal"
 * @param {string} [design.material] — e.g. "wood", "metal"
 * @param {string} [design.color]    — Hex color
 * @param {number} design.width      — Width in cm (converted to mm internally)
 * @param {number} design.height     — Height in cm
 * @param {number} design.depth      — Depth in cm
 * @param {Array}  [design.components] — Component list
 * @param {string} [design.name]     — Design name
 * @param {string} [design.orderNumber] — Order reference
 * @param {object} [design.kitchen]  — Kitchen-specific config
 * @param {object} [options]
 * @param {number} [options.toolDiameter=6] — CNC tool diameter in mm
 * @param {number} [options.feedRate=3000]  — CNC feed rate
 * @param {number} [options.sheetWidth=2440] — Material sheet width in mm
 * @param {number} [options.sheetHeight=1220] — Material sheet height in mm
 * @returns {Promise<Buffer>} ZIP file as a Node.js Buffer.
 *
 * @example
 *   const zip = await generateProductionPackage({
 *     type: "wardrobe", style: "modern", material: "wood",
 *     width: 150, height: 220, depth: 60, name: "My Wardrobe"
 *   });
 *   // Write zip to disk or return as response
 */
export async function generateProductionPackage(design, options = {}) {
  const {
    toolDiameter = 6,
    feedRate = 3000,
    sheetWidth = 2440,
    sheetHeight = 1220,
  } = options;

  // ── Generate factory specification ─────────────────────────────────
  const specDesign = {
    ...design,
    width: design.width * 10,  // cm → mm
    height: design.height * 10,
    depth: design.depth * 10,
  };

  const factorySpec = generateFactorySpec(specDesign);
  const panels = factorySpec.components || [];
  const hardware = factorySpec.hardware || [];

  // ── Filter panels (only items with physical dimensions, not hardware) ──
  const physicalPanels = panels.filter(
    (p) => p.width && p.height && p.thickness
  );

  // ── Generate individual exports ────────────────────────────────────
  const [dxfPanels, dxfCutting, gcode, pdfBuffer] = await Promise.all([
    // 1. DXF — individual panels
    Promise.resolve(generatePanelDXF(physicalPanels)),

    // 2. DXF — cutting layout on sheets
    Promise.resolve(generateCuttingLayout(physicalPanels, sheetWidth, sheetHeight)),

    // 3. G-code — CNC cutting program
    Promise.resolve(
      generateCuttingGcode(physicalPanels, { toolDiameter, feedRate, sheetWidth, sheetHeight })
    ),

    // 4. PDF — specification sheet
    generateSpecSheet({
      design: {
        name: design.name || `${design.style || "Custom"} ${design.type}`,
        type: design.type,
        style: design.style || "modern",
      },
      panels: physicalPanels,
      materials: {
        primary: design.material || "wood",
        color: design.color || "#8B6914",
        finish: factorySpec.general?.finish || "Standard",
        edgeBanding: factorySpec.overallDimensions?.edgeBanding || "2mm PVC",
      },
      hardware,
      dimensions: {
        width: design.width * 10,
        height: design.height * 10,
        depth: design.depth * 10,
      },
      orderNumber: design.orderNumber,
      assemblyNotes: factorySpec.assemblyInstructions || [],
    }),
  ]);

  // ── Package into ZIP ───────────────────────────────────────────────
  const zip = new JSZip();

  const designSlug = (design.name || design.type || "design")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Create folder structure
  const folder = zip.folder(`furnai-${designSlug}`);

  folder.file("panels.dxf", dxfPanels);
  folder.file("cutting-layout.dxf", dxfCutting);
  folder.file("cutting-program.nc", gcode);
  folder.file("spec-sheet.pdf", pdfBuffer);
  folder.file(
    "factory-spec.json",
    JSON.stringify(factorySpec, null, 2)
  );

  // Add a README for the factory team
  folder.file(
    "README.txt",
    [
      `FurnAI Production Package`,
      `========================`,
      `Design: ${design.name || design.type}`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `Contents:`,
      `  panels.dxf          — Individual panel outlines (AutoCAD DXF)`,
      `  cutting-layout.dxf  — Optimised cutting layout on ${sheetWidth}×${sheetHeight}mm sheets`,
      `  cutting-program.nc  — CNC G-code (${toolDiameter}mm tool, ${feedRate}mm/min feed)`,
      `  spec-sheet.pdf      — Production specification sheet`,
      `  factory-spec.json   — Machine-readable specification`,
      ``,
      `Notes:`,
      `  - All dimensions are in millimeters`,
      `  - G-code is for a 3-axis CNC router (RS274/NGC dialect)`,
      `  - Review spec-sheet.pdf for hardware and assembly details`,
    ].join("\n")
  );

  return await zip.generateAsync({ type: "nodebuffer" });
}

// ── Re-export individual generators for standalone use ───────────────
export { generatePanelDXF, generateCuttingLayout } from "./dxf.js";
export { generateCuttingGcode } from "./gcode.js";
export { generateSpecSheet } from "./pdfSpec.js";
