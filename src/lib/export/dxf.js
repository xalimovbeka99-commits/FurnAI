/**
 * @fileoverview DXF Export Utility for FurnAI
 *
 * Generates AutoCAD DXF files from panel data for CNC cutting and
 * factory production workflows.
 *
 * Uses @tarikjabiri/dxf for standards-compliant DXF generation.
 *
 * @module lib/export/dxf
 */

import { DxfWriter, point2d } from "@tarikjabiri/dxf";

/**
 * Generates a DXF file containing one rectangle per panel, laid out
 * vertically with spacing. Each panel is labelled and dimensioned.
 *
 * @param {Array<{ name: string, width: number, height: number, thickness?: number, quantity?: number }>} panels
 *   Array of panel objects with dimensions in mm.
 * @returns {string} DXF file content as a string.
 *
 * @example
 *   const dxf = generatePanelDXF([
 *     { name: "Side Panel", width: 600, height: 2200, thickness: 18 },
 *     { name: "Top Panel",  width: 1000, height: 600, thickness: 18 },
 *   ]);
 */
export function generatePanelDXF(panels) {
  if (!panels || panels.length === 0) {
    throw new Error("At least one panel is required to generate DXF");
  }

  const dxf = new DxfWriter();

  // ── Layout parameters ──────────────────────────────────────────────
  const SPACING = 30; // mm gap between panels
  let yOffset = 0;

  for (const panel of panels) {
    const qty = panel.quantity || 1;
    const w = panel.width;
    const h = panel.height;

    for (let q = 0; q < qty; q++) {
      // Draw panel rectangle (polyline with 4 corners)
      drawRectangle(dxf, 0, yOffset, w, h);

      // Add label as text at center of panel
      const labelText = qty > 1
        ? `${panel.name} (${q + 1}/${qty}) — ${w}×${h}mm`
        : `${panel.name} — ${w}×${h}mm`;

      dxf.addText(
        point2d(w / 2, yOffset + h / 2),
        Math.min(h * 0.08, 12),
        labelText
      );

      // Add thickness annotation if available
      if (panel.thickness) {
        dxf.addText(
          point2d(w / 2, yOffset + h / 2 - 15),
          Math.min(h * 0.06, 8),
          `t=${panel.thickness}mm`
        );
      }

      yOffset += h + SPACING;
    }
  }

  return dxf.stringify();
}

/**
 * Generates a DXF file with panels bin-packed onto standard sheets.
 * Uses a simple shelf-based (first-fit decreasing height) algorithm.
 *
 * @param {Array<{ name: string, width: number, height: number, thickness?: number, quantity?: number }>} panels
 *   Panels to pack, dimensions in mm.
 * @param {number} sheetWidth  — Sheet width in mm (default: 2440 for standard plywood).
 * @param {number} sheetHeight — Sheet height in mm (default: 1220).
 * @returns {string} DXF file content as a string.
 *
 * @example
 *   const dxf = generateCuttingLayout(panels, 2440, 1220);
 */
export function generateCuttingLayout(panels, sheetWidth = 2440, sheetHeight = 1220) {
  if (!panels || panels.length === 0) {
    throw new Error("At least one panel is required for cutting layout");
  }

  const dxf = new DxfWriter();
  const KERF = 4; // mm saw blade kerf allowance
  const SHEET_GAP = 50; // mm gap between sheets in the DXF

  // ── Flatten panels by quantity ─────────────────────────────────────
  /** @type {Array<{ name: string, width: number, height: number, thickness?: number }>} */
  const flatPanels = [];
  for (const panel of panels) {
    const qty = panel.quantity || 1;
    for (let i = 0; i < qty; i++) {
      // Optionally rotate panel to fit better: ensure width >= height
      let w = panel.width;
      let h = panel.height;
      if (w > sheetWidth && h <= sheetWidth) {
        [w, h] = [h, w]; // rotate 90°
      }
      flatPanels.push({
        name: panel.name,
        width: w,
        height: h,
        thickness: panel.thickness,
        index: i + 1,
        totalQty: qty,
      });
    }
  }

  // Sort by height descending (shelf algorithm works best this way)
  flatPanels.sort((a, b) => b.height - a.height);

  // ── Bin-packing: shelf-based first-fit ─────────────────────────────
  /** @type {Array<{ panels: typeof flatPanels, shelfY: number, x: number }>} */
  const sheets = [];

  for (const panel of flatPanels) {
    let placed = false;

    for (const sheet of sheets) {
      // Try to place on existing shelves
      if (tryPlaceOnSheet(sheet, panel, sheetWidth, sheetHeight, KERF)) {
        placed = true;
        break;
      }
    }

    if (!placed) {
      // New sheet needed
      const newSheet = {
        panels: [],
        shelves: [{ y: 0, maxHeight: 0, x: 0 }],
      };
      tryPlaceOnSheet(newSheet, panel, sheetWidth, sheetHeight, KERF);
      sheets.push(newSheet);
    }
  }

  // ── Render sheets to DXF ───────────────────────────────────────────
  let sheetOffsetY = 0;

  for (let si = 0; si < sheets.length; si++) {
    const sheet = sheets[si];

    // Draw sheet outline
    drawRectangle(dxf, 0, sheetOffsetY, sheetWidth, sheetHeight);

    // Sheet label
    dxf.addText(
      point2d(sheetWidth / 2, sheetOffsetY + sheetHeight + 10),
      10,
      `Sheet ${si + 1} — ${sheetWidth}×${sheetHeight}mm`
    );

    // Draw each placed panel
    for (const placed of sheet.panels) {
      const px = placed.x;
      const py = sheetOffsetY + placed.y;
      const pw = placed.width;
      const ph = placed.height;

      drawRectangle(dxf, px, py, pw, ph);

      // Label
      const label = placed.totalQty > 1
        ? `${placed.name} (${placed.index}/${placed.totalQty})`
        : placed.name;

      dxf.addText(
        point2d(px + pw / 2, py + ph / 2),
        Math.min(ph * 0.1, 8),
        label
      );
    }

    sheetOffsetY += sheetHeight + SHEET_GAP;
  }

  return dxf.stringify();
}

/**
 * Tries to place a panel on an existing sheet using shelf-based placement.
 *
 * @param {object} sheet - Sheet state with shelves array.
 * @param {object} panel - Panel to place.
 * @param {number} sheetWidth
 * @param {number} sheetHeight
 * @param {number} kerf
 * @returns {boolean} True if panel was placed.
 * @private
 */
function tryPlaceOnSheet(sheet, panel, sheetWidth, sheetHeight, kerf) {
  // Try each existing shelf
  for (const shelf of sheet.shelves) {
    if (
      shelf.x + panel.width + kerf <= sheetWidth &&
      shelf.y + panel.height + kerf <= sheetHeight
    ) {
      // Place panel on this shelf
      sheet.panels.push({
        ...panel,
        x: shelf.x,
        y: shelf.y,
      });
      shelf.x += panel.width + kerf;
      shelf.maxHeight = Math.max(shelf.maxHeight, panel.height);
      return true;
    }
  }

  // Try creating a new shelf
  const lastShelf = sheet.shelves[sheet.shelves.length - 1];
  const newShelfY = lastShelf.y + lastShelf.maxHeight + kerf;

  if (
    newShelfY + panel.height + kerf <= sheetHeight &&
    panel.width + kerf <= sheetWidth
  ) {
    const newShelf = { y: newShelfY, maxHeight: panel.height, x: panel.width + kerf };
    sheet.shelves.push(newShelf);
    sheet.panels.push({
      ...panel,
      x: 0,
      y: newShelfY,
    });
    return true;
  }

  return false;
}

/**
 * Draws a rectangle as a closed polyline in the DXF.
 *
 * @param {DxfWriter} dxf
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @private
 */
function drawRectangle(dxf, x, y, w, h) {
  dxf.addLine(point2d(x, y), point2d(x + w, y));
  dxf.addLine(point2d(x + w, y), point2d(x + w, y + h));
  dxf.addLine(point2d(x + w, y + h), point2d(x, y + h));
  dxf.addLine(point2d(x, y + h), point2d(x, y));
}
