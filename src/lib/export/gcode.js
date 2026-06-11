/**
 * @fileoverview G-code Generation Utility for FurnAI
 *
 * Generates 2.5D CNC G-code for cutting rectangular panels from sheet stock.
 * Designed for 3-axis CNC routers commonly used in furniture manufacturing.
 *
 * Output follows standard NIST RS274/NGC G-code dialect compatible with
 * Mach3, LinuxCNC, GRBL, and most industrial CNC controllers.
 *
 * @module lib/export/gcode
 */

/**
 * Default machining parameters for furniture-grade CNC work.
 * @readonly
 */
const DEFAULTS = {
  toolDiameter: 6,      // mm — standard straight-cut end mill
  feedRate: 3000,        // mm/min — feed rate for cutting moves
  plungeRate: 800,       // mm/min — feed rate for Z plunge
  rapidHeight: 10,      // mm — Z height for rapid moves (above material)
  depth: 18,            // mm — total cut depth
  depthPerPass: 6,      // mm — depth increment per pass
  spindleSpeed: 18000,  // RPM
  tabWidth: 8,          // mm — holding tab width (not yet implemented)
};

/**
 * Generates CNC G-code for cutting rectangular panels.
 *
 * Each panel is cut as a rectangular toolpath with full-depth passes,
 * accounting for tool diameter offset. The tool path runs outside the
 * panel outline by half the tool diameter (climb milling direction).
 *
 * @param {Array<{ name: string, width: number, height: number, thickness?: number, quantity?: number }>} panels
 *   Panel dimensions in mm.
 * @param {object} [options]
 * @param {number} [options.toolDiameter=6]  — End mill diameter in mm.
 * @param {number} [options.feedRate=3000]   — Cutting feed rate in mm/min.
 * @param {number} [options.plungeRate=800]  — Z plunge rate in mm/min.
 * @param {number} [options.depth=18]        — Total cut depth in mm.
 * @param {number} [options.depthPerPass=6]  — Max depth per pass in mm.
 * @param {number} [options.spindleSpeed=18000] — Spindle RPM.
 * @param {number} [options.rapidHeight=10]  — Safe Z height for rapids.
 * @param {number} [options.sheetWidth=2440] — Sheet width for layout.
 * @param {number} [options.sheetHeight=1220] — Sheet height for layout.
 * @returns {string} Complete G-code program as a string.
 *
 * @example
 *   const gcode = generateCuttingGcode(
 *     [{ name: "Side Panel", width: 600, height: 2200, thickness: 18 }],
 *     { toolDiameter: 6, feedRate: 3000, depth: 18 }
 *   );
 */
export function generateCuttingGcode(panels, options = {}) {
  if (!panels || panels.length === 0) {
    throw new Error("At least one panel is required to generate G-code");
  }

  const config = { ...DEFAULTS, ...options };
  const {
    toolDiameter,
    feedRate,
    plungeRate,
    depth,
    depthPerPass,
    spindleSpeed,
    rapidHeight,
  } = config;

  const toolRadius = toolDiameter / 2;
  const numPasses = Math.ceil(depth / depthPerPass);
  const KERF = toolDiameter + 4; // spacing between panels

  const lines = [];

  // ── Header ─────────────────────────────────────────────────────────
  lines.push(
    `; =====================================================`,
    `; FurnAI CNC Cutting Program`,
    `; Generated: ${new Date().toISOString()}`,
    `; =====================================================`,
    `; Tool: ${toolDiameter}mm straight-cut end mill`,
    `; Feed rate: ${feedRate} mm/min`,
    `; Plunge rate: ${plungeRate} mm/min`,
    `; Depth: ${depth} mm (${numPasses} passes @ ${depthPerPass}mm)`,
    `; Spindle: ${spindleSpeed} RPM`,
    `; Panel count: ${panels.reduce((sum, p) => sum + (p.quantity || 1), 0)}`,
    `; =====================================================`,
    ``,
    `; --- Machine initialisation ---`,
    `G90          ; Absolute positioning`,
    `G21          ; Millimeters`,
    `G17          ; XY plane selection`,
    `G40          ; Cancel cutter compensation`,
    `G49          ; Cancel tool length offset`,
    `G80          ; Cancel canned cycles`,
    ``,
    `; --- Tool setup ---`,
    `T1 M6        ; Select tool 1, tool change`,
    `S${spindleSpeed} M3   ; Spindle on, clockwise`,
    `G4 P2        ; Dwell 2 seconds for spindle ramp-up`,
    ``,
    `; --- Move to safe height ---`,
    `G0 Z${rapidHeight.toFixed(1)}`,
    ``
  );

  // ── Layout and cut panels ──────────────────────────────────────────
  let panelIndex = 0;
  let xOffset = 0;
  let yOffset = 0;
  let rowMaxHeight = 0;
  const sheetWidth = config.sheetWidth || 2440;

  for (const panel of panels) {
    const qty = panel.quantity || 1;
    const cutDepth = panel.thickness || depth;
    const actualPasses = Math.ceil(cutDepth / depthPerPass);

    for (let q = 0; q < qty; q++) {
      panelIndex++;
      const w = panel.width;
      const h = panel.height;

      // Check if panel fits on current row; if not, start new row
      if (xOffset + w + KERF > sheetWidth && xOffset > 0) {
        xOffset = 0;
        yOffset += rowMaxHeight + KERF;
        rowMaxHeight = 0;
      }

      rowMaxHeight = Math.max(rowMaxHeight, h);

      lines.push(
        `; --- Panel ${panelIndex}: ${panel.name}${qty > 1 ? ` (${q + 1}/${qty})` : ""} ---`,
        `; Size: ${w} × ${h} × ${cutDepth}mm`
      );

      // Tool path is offset outward by tool radius (conventional milling)
      const x0 = xOffset - toolRadius;
      const y0 = yOffset - toolRadius;
      const x1 = xOffset + w + toolRadius;
      const y1 = yOffset + h + toolRadius;

      // Rapid to start position
      lines.push(
        `G0 X${x0.toFixed(2)} Y${y0.toFixed(2)}`,
        `G0 Z${(2).toFixed(1)}  ; Lower to approach height`
      );

      // Multi-pass depth cutting
      for (let pass = 1; pass <= actualPasses; pass++) {
        const passDepth = Math.min(pass * depthPerPass, cutDepth);

        lines.push(
          ``,
          `; Pass ${pass}/${actualPasses} — Z depth: -${passDepth.toFixed(1)}mm`,
          `G1 Z-${passDepth.toFixed(1)} F${plungeRate}  ; Plunge`
        );

        // Cut rectangle clockwise (climb milling)
        lines.push(
          `G1 X${x1.toFixed(2)} Y${y0.toFixed(2)} F${feedRate}  ; Bottom edge →`,
          `G1 X${x1.toFixed(2)} Y${y1.toFixed(2)} F${feedRate}  ; Right edge ↑`,
          `G1 X${x0.toFixed(2)} Y${y1.toFixed(2)} F${feedRate}  ; Top edge ←`,
          `G1 X${x0.toFixed(2)} Y${y0.toFixed(2)} F${feedRate}  ; Left edge ↓ (close)`
        );
      }

      // Retract after panel
      lines.push(
        `G0 Z${rapidHeight.toFixed(1)}  ; Retract to safe height`,
        ``
      );

      xOffset += w + KERF;
    }
  }

  // ── Footer ─────────────────────────────────────────────────────────
  lines.push(
    `; =====================================================`,
    `; Program complete`,
    `; =====================================================`,
    `G0 Z${(rapidHeight + 10).toFixed(1)}  ; Final retract`,
    `G0 X0 Y0        ; Return to origin`,
    `M5               ; Spindle off`,
    `M9               ; Coolant off`,
    `M30              ; Program end`,
    ``
  );

  return lines.join("\n");
}
