export function generateFurniture(params) {
  const { type, style, material, color, width, height, depth, kitchen } = params;

  // Scale from cm to Three.js units (divide by 100)
  const w = width / 100;
  const h = height / 100;
  const d = depth / 100;

  const mat = getMaterialConfig(material, color, style);

  switch (type) {
    case "wardrobe":
      return generateWardrobe(w, h, d, mat, style);
    case "table":
      return generateTable(w, h, d, mat, style);
    case "sofa":
      return generateSofa(w, h, d, mat, style);
    case "cabinet":
      return generateCabinet(w, h, d, mat, style);
    case "kitchen":
      return generateKitchen(w, h, d, mat, style, kitchen);
    case "bed":
      return generateBed(w, h, d, mat, style);
    default:
      return generateWardrobe(w, h, d, mat, style);
  }
}

function getMaterialConfig(material, color, style) {
  const configs = {
    wood: { roughness: 0.75, metalness: 0.05 },
    glass: { roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35 },
    metal: { roughness: 0.25, metalness: 0.85 },
    marble: { roughness: 0.3, metalness: 0.15 },
    fabric: { roughness: 0.92, metalness: 0.0 },
  };
  return { ...configs[material] || configs.wood, color };
}

// ─────────────────────────────────────────────
// WARDROBE — Full frame, shelves, and 2 doors
// ─────────────────────────────────────────────
function generateWardrobe(w, h, d, mat, style) {
  const t = 0.025; // panel thickness
  const doorGap = 0.008;
  const shelfCount = style === "luxury" ? 5 : style === "minimal" ? 2 : 3;
  const innerW = w - t * 2;
  const innerD = d - t;
  const doorW = (innerW - doorGap) / 2;

  const shelfMat = { ...mat, color: lighten(mat.color, 12) };
  const doorMat = { ...mat, color: lighten(mat.color, -8) };
  const handleMat = { roughness: 0.2, metalness: 0.85, color: "#aaaaaa" };

  const parts = [
    // Back panel
    { geo: "box", args: [w, h, t * 0.6], position: [0, h / 2, -d / 2 + t * 0.3], material: mat },
    // Left side
    { geo: "box", args: [t, h, d], position: [-w / 2 + t / 2, h / 2, 0], material: mat },
    // Right side
    { geo: "box", args: [t, h, d], position: [w / 2 - t / 2, h / 2, 0], material: mat },
    // Top
    { geo: "box", args: [w + 0.01, t, d + 0.01], position: [0, h, 0], material: mat },
    // Bottom
    { geo: "box", args: [w, t, d], position: [0, t / 2, 0], material: mat },

    // Shelves
    ...Array.from({ length: shelfCount }, (_, i) => ({
      geo: "box",
      args: [innerW - 0.005, t * 0.5, innerD - 0.01],
      position: [0, t + ((h - t * 2) / (shelfCount + 1)) * (i + 1), t * 0.3],
      material: shelfMat,
    })),

    // Left door
    {
      geo: "roundedBox",
      args: [doorW, h - t * 2 - 0.01, t * 0.5],
      radius: 0.005,
      segments: 2,
      position: [-(doorW + doorGap) / 2, h / 2, d / 2 - t * 0.25],
      material: doorMat,
    },
    // Right door
    {
      geo: "roundedBox",
      args: [doorW, h - t * 2 - 0.01, t * 0.5],
      radius: 0.005,
      segments: 2,
      position: [(doorW + doorGap) / 2, h / 2, d / 2 - t * 0.25],
      material: doorMat,
    },

    // Left door handle (vertical bar)
    {
      geo: "cylinder",
      args: [0.005, 0.005, 0.1, 8],
      position: [-(doorGap / 2) - 0.03, h / 2, d / 2 + 0.005],
      material: handleMat,
    },
    // Right door handle
    {
      geo: "cylinder",
      args: [0.005, 0.005, 0.1, 8],
      position: [(doorGap / 2) + 0.03, h / 2, d / 2 + 0.005],
      material: handleMat,
    },
  ];

  return { type: "wardrobe", parts };
}

// ─────────────────────────────────────────────
// TABLE — Rounded tabletop with legs
// ─────────────────────────────────────────────
function generateTable(w, h, d, mat, style) {
  const topThick = 0.035;
  const legR = style === "modern" ? 0.02 : 0.03;
  const legH = h - topThick;
  const inset = 0.06;

  const legMat = style === "modern"
    ? { roughness: 0.25, metalness: 0.85, color: "#555555" }
    : mat;

  const parts = [
    // Tabletop — rounded box
    {
      geo: "roundedBox",
      args: [w, topThick, d],
      radius: 0.008,
      segments: 3,
      position: [0, h - topThick / 2, 0],
      material: mat,
    },

    // 4 legs — cylinders
    ...[
      [-w / 2 + inset, 0, -d / 2 + inset],
      [w / 2 - inset, 0, -d / 2 + inset],
      [-w / 2 + inset, 0, d / 2 - inset],
      [w / 2 - inset, 0, d / 2 - inset],
    ].map((pos) => ({
      geo: "cylinder",
      args: [legR, legR * 0.85, legH, 12],
      position: [pos[0], legH / 2, pos[2]],
      material: legMat,
    })),

    // Cross support under the table (modern style)
    ...(style === "modern" || style === "minimal"
      ? [
          {
            geo: "box",
            args: [w - inset * 2, 0.015, 0.015],
            position: [0, legH * 0.15, 0],
            material: legMat,
          },
          {
            geo: "box",
            args: [0.015, 0.015, d - inset * 2],
            position: [0, legH * 0.15, 0],
            material: legMat,
          },
        ]
      : []),
  ];

  return { type: "table", parts };
}

// ─────────────────────────────────────────────
// SOFA — Rounded, soft, fabric-style
// ─────────────────────────────────────────────
function generateSofa(w, h, d, mat, style) {
  const fabricMat = {
    color: mat.color,
    roughness: 0.92,
    metalness: 0.0,
  };
  const cushionMat = {
    ...fabricMat,
    color: lighten(mat.color, 10),
  };
  const legMat = { roughness: 0.3, metalness: 0.7, color: "#444444" };

  const baseH = h * 0.22;
  const backH = h * 0.48;
  const seatH = h * 0.18;
  const armW = d * 0.18;
  const armH = h * 0.32;
  const seatTop = baseH + seatH;
  const backThick = d * 0.22;
  const legH = h * 0.06;
  const cushionCount = w > 1.8 ? 3 : 2;
  const cushionW = (w - armW * 2 - 0.02 * (cushionCount - 1)) / cushionCount;

  const parts = [
    // ── Base platform (rounded) ──
    {
      geo: "roundedBox",
      args: [w, baseH, d],
      radius: 0.03,
      segments: 3,
      position: [0, legH + baseH / 2, 0],
      material: fabricMat,
    },

    // ── Backrest (tall rounded rectangle, slight tilt forward) ──
    {
      geo: "roundedBox",
      args: [w - armW * 0.4, backH, backThick],
      radius: 0.04,
      segments: 3,
      position: [0, legH + baseH + backH / 2, -d / 2 + backThick / 2 + 0.01],
      material: fabricMat,
    },

    // ── Left armrest (rounded capsule shape) ──
    {
      geo: "roundedBox",
      args: [armW, armH, d * 0.85],
      radius: 0.05,
      segments: 3,
      position: [-w / 2 + armW / 2, legH + baseH + armH / 2 - 0.02, d * 0.04],
      material: fabricMat,
    },
    // ── Right armrest ──
    {
      geo: "roundedBox",
      args: [armW, armH, d * 0.85],
      radius: 0.05,
      segments: 3,
      position: [w / 2 - armW / 2, legH + baseH + armH / 2 - 0.02, d * 0.04],
      material: fabricMat,
    },

    // ── Seat cushions (individual, soft-looking) ──
    ...Array.from({ length: cushionCount }, (_, i) => {
      const xStart = -w / 2 + armW + 0.005;
      const xPos = xStart + cushionW / 2 + i * (cushionW + 0.02);
      return {
        geo: "roundedBox",
        args: [cushionW, seatH, d - backThick - 0.06],
        radius: 0.035,
        segments: 3,
        position: [xPos, legH + baseH + seatH / 2 + 0.005, backThick / 2 - 0.01],
        material: cushionMat,
      };
    }),

    // ── Back cushions (softer, slightly puffy) ──
    ...Array.from({ length: cushionCount }, (_, i) => {
      const xStart = -w / 2 + armW + 0.005;
      const xPos = xStart + cushionW / 2 + i * (cushionW + 0.02);
      return {
        geo: "roundedBox",
        args: [cushionW - 0.02, backH * 0.55, backThick * 0.5],
        radius: 0.04,
        segments: 3,
        position: [xPos, legH + baseH + seatH + backH * 0.28, -d / 2 + backThick * 0.8],
        material: cushionMat,
      };
    }),

    // ── Legs (small cylinders) ──
    ...[
      [-w / 2 + 0.08, 0, -d / 2 + 0.08],
      [w / 2 - 0.08, 0, -d / 2 + 0.08],
      [-w / 2 + 0.08, 0, d / 2 - 0.08],
      [w / 2 - 0.08, 0, d / 2 - 0.08],
    ].map((pos) => ({
      geo: "cylinder",
      args: [0.015, 0.012, legH, 8],
      position: [pos[0], legH / 2, pos[2]],
      material: legMat,
    })),
  ];

  return { type: "sofa", parts };
}

// ─────────────────────────────────────────────
// CABINET — Compact with drawers and handles
// ─────────────────────────────────────────────
function generateCabinet(w, h, d, mat, style) {
  const t = 0.02;
  const drawerCount = style === "luxury" ? 4 : style === "minimal" ? 2 : 3;
  const innerH = h - t * 2;
  const drawerH = innerH / drawerCount;
  const drawerGap = 0.006;
  const legH = 0.07;

  const frameMat = mat;
  const drawerMat = { ...mat, color: lighten(mat.color, 6) };
  const handleMat = { roughness: 0.2, metalness: 0.85, color: "#999999" };
  const legMat = { roughness: 0.3, metalness: 0.6, color: "#555555" };

  const parts = [
    // Back panel
    { geo: "box", args: [w, h, t * 0.5], position: [0, legH + h / 2, -d / 2 + t * 0.25], material: frameMat },
    // Left side
    { geo: "box", args: [t, h, d], position: [-w / 2 + t / 2, legH + h / 2, 0], material: frameMat },
    // Right side
    { geo: "box", args: [t, h, d], position: [w / 2 - t / 2, legH + h / 2, 0], material: frameMat },
    // Top — slightly overhanging
    {
      geo: "roundedBox",
      args: [w + 0.02, t, d + 0.02],
      radius: 0.005,
      segments: 2,
      position: [0, legH + h + t / 2, 0],
      material: frameMat,
    },
    // Bottom
    { geo: "box", args: [w, t, d], position: [0, legH + t / 2, 0], material: frameMat },

    // Drawer fronts
    ...Array.from({ length: drawerCount }, (_, i) => ({
      geo: "roundedBox",
      args: [w - t * 3, drawerH - drawerGap, t * 0.6],
      radius: 0.004,
      segments: 2,
      position: [0, legH + t + drawerH * i + drawerH / 2, d / 2 - t * 0.3],
      material: drawerMat,
    })),

    // Drawer handles (horizontal bars)
    ...Array.from({ length: drawerCount }, (_, i) => ({
      geo: "cylinder",
      args: [0.004, 0.004, 0.08, 8],
      position: [0, legH + t + drawerH * i + drawerH / 2, d / 2 + 0.005],
      rotation: [0, 0, Math.PI / 2],
      material: handleMat,
    })),

    // 4 short legs (tapered cylinders)
    ...[
      [-w / 2 + 0.05, 0, -d / 2 + 0.05],
      [w / 2 - 0.05, 0, -d / 2 + 0.05],
      [-w / 2 + 0.05, 0, d / 2 - 0.05],
      [w / 2 - 0.05, 0, d / 2 - 0.05],
    ].map((pos) => ({
      geo: "cylinder",
      args: [0.015, 0.01, legH, 8],
      position: [pos[0], legH / 2, pos[2]],
      material: legMat,
    })),
  ];

  return { type: "cabinet", parts };
}

// ─────────────────────────────────────────────
// KITCHEN — Full kitchen with cabinets, countertop, appliances
// ─────────────────────────────────────────────
function generateKitchen(w, h, d, mat, style, kitchenConfig) {
  const cfg = kitchenConfig || {
    fridge: { enabled: true, size: "double", position: "right" },
    dishwasher: { enabled: true, size: "standard", style: "hidden" },
    hood: { enabled: true, type: "wall-mounted" },
    oven: { enabled: true, position: "bottom", cooktop: "induction" },
  };

  const t = 0.02;
  const parts = [];

  // ── STANDARD KITCHEN DIMENSIONS (real-world) ──
  const plinthH = 0.1;
  const lowerH = 0.72;
  const counterH = 0.03;
  const counterTopY = plinthH + lowerH + counterH;
  const gapH = 0.52;
  const upperH = 0.70;
  const upperD = d * 0.55;

  // ── MATERIALS ──
  const cabinetMat = mat;
  const doorMat = { ...mat, color: lighten(mat.color, -5) };
  const counterMat = { roughness: 0.3, metalness: 0.15, color: "#E8E0D0" };
  const handleMat = { roughness: 0.2, metalness: 0.85, color: "#aaaaaa" };
  const steelMat = { roughness: 0.2, metalness: 0.8, color: "#C0C0C0" };
  const darkSteelMat = { roughness: 0.3, metalness: 0.7, color: "#444444" };
  const glassMat = { roughness: 0.05, metalness: 0.15, color: "#222222", transparent: true, opacity: 0.4 };

  // ── LAYOUT: compute appliance zones ──
  const fridgeW = cfg.fridge.enabled
    ? (cfg.fridge.size === "side-by-side" ? 0.9 : cfg.fridge.size === "double" ? 0.7 : 0.6)
    : 0;
  const ovenW = cfg.oven.enabled && cfg.oven.position === "tower" ? 0.6 : 0;
  const dishwasherW = cfg.dishwasher.enabled
    ? (cfg.dishwasher.size === "compact" ? 0.45 : 0.6)
    : 0;

  const fridgeOnLeft = cfg.fridge.position === "left";
  const cabinetZoneW = w - fridgeW - ovenW;
  const cabinetStartX = fridgeOnLeft ? -w / 2 + fridgeW : -w / 2;

  // ── FRIDGE ──
  if (cfg.fridge.enabled) {
    const fridgeX = fridgeOnLeft ? -w / 2 + fridgeW / 2 : w / 2 - fridgeW / 2;
    const fridgeH = h * 0.88;

    // Fridge body
    parts.push({
      geo: "roundedBox", args: [fridgeW - 0.01, fridgeH, d],
      radius: 0.01, segments: 2,
      position: [fridgeX, fridgeH / 2, 0], material: steelMat,
    });

    if (cfg.fridge.size === "side-by-side") {
      // Two vertical doors
      const doorW = (fridgeW - 0.03) / 2;
      [-1, 1].forEach((side) => {
        parts.push({
          geo: "roundedBox", args: [doorW, fridgeH - 0.04, t * 0.4],
          radius: 0.005, segments: 2,
          position: [fridgeX + side * (doorW / 2 + 0.005), fridgeH / 2, d / 2 - t * 0.2],
          material: { ...steelMat, color: lighten(steelMat.color, -5) },
        });
        // Vertical handle
        parts.push({
          geo: "cylinder", args: [0.005, 0.005, 0.35, 8],
          position: [fridgeX + side * 0.01, fridgeH / 2, d / 2 + 0.008],
          material: handleMat,
        });
      });
    } else {
      // Top/bottom split (fridge + freezer)
      const splitY = fridgeH * 0.4;
      // Upper door (fridge)
      parts.push({
        geo: "roundedBox", args: [fridgeW - 0.02, fridgeH - splitY - 0.02, t * 0.4],
        radius: 0.005, segments: 2,
        position: [fridgeX, splitY + (fridgeH - splitY) / 2, d / 2 - t * 0.2],
        material: { ...steelMat, color: lighten(steelMat.color, -3) },
      });
      // Lower door (freezer)
      parts.push({
        geo: "roundedBox", args: [fridgeW - 0.02, splitY - 0.02, t * 0.4],
        radius: 0.005, segments: 2,
        position: [fridgeX, splitY / 2, d / 2 - t * 0.2],
        material: { ...steelMat, color: lighten(steelMat.color, -3) },
      });
      // Split line
      parts.push({
        geo: "box", args: [fridgeW - 0.02, 0.004, 0.006],
        position: [fridgeX, splitY, d / 2 + 0.003],
        material: darkSteelMat,
      });
      // Handles
      [splitY + (fridgeH - splitY) / 2, splitY / 2].forEach((y) => {
        parts.push({
          geo: "cylinder", args: [0.004, 0.004, 0.12, 8],
          position: [fridgeX + fridgeW / 2 - 0.04, y, d / 2 + 0.008],
          material: handleMat,
        });
      });
    }
  }

  // ── DETERMINE CABINET & APPLIANCE LAYOUT ──
  // Oven cooktop zone is in the middle of the cabinet zone
  const cooktopW = 0.6;
  // Dishwasher is next to the cooktop zone (left)
  const usableW = cabinetZoneW;
  const applianceRegionW = (cfg.oven.enabled && cfg.oven.position === "bottom" ? cooktopW : 0) + dishwasherW;
  const cabinetW = usableW - applianceRegionW;
  const lowerCabCount = Math.max(1, Math.floor(cabinetW / 0.5));
  const lowerCabUnitW = cabinetW / lowerCabCount;

  // Layout positions (left to right within cabinet zone)
  let xCursor = cabinetStartX;

  // First half cabinets
  const halfCabs = Math.ceil(lowerCabCount / 2);
  for (let i = 0; i < halfCabs; i++) {
    addLowerCabinet(parts, xCursor, lowerCabUnitW, lowerH, d, plinthH, t, cabinetMat, doorMat, handleMat, i === halfCabs - 1);
    xCursor += lowerCabUnitW;
  }

  // ── DISHWASHER ──
  if (cfg.dishwasher.enabled) {
    const dwX = xCursor + dishwasherW / 2;

    parts.push({
      geo: "box", args: [dishwasherW - 0.005, lowerH, d],
      position: [dwX, plinthH + lowerH / 2, 0],
      material: cfg.dishwasher.style === "visible" ? steelMat : cabinetMat,
    });

    if (cfg.dishwasher.style === "visible") {
      // Metal front with control strip
      parts.push({
        geo: "roundedBox", args: [dishwasherW - 0.015, lowerH - 0.02, t * 0.4],
        radius: 0.003, segments: 2,
        position: [dwX, plinthH + lowerH / 2, d / 2 - t * 0.2],
        material: { ...steelMat, color: lighten(steelMat.color, -8) },
      });
      // Control strip at top
      parts.push({
        geo: "box", args: [dishwasherW - 0.04, 0.03, 0.005],
        position: [dwX, plinthH + lowerH - 0.04, d / 2 + 0.003],
        material: darkSteelMat,
      });
    } else {
      // Hidden: cabinet-matching front
      parts.push({
        geo: "roundedBox", args: [dishwasherW - 0.015, lowerH - 0.01, t * 0.5],
        radius: 0.004, segments: 2,
        position: [dwX, plinthH + lowerH / 2, d / 2 - t * 0.25],
        material: doorMat,
      });
    }
    // Handle
    parts.push({
      geo: "cylinder", args: [0.004, 0.004, 0.1, 8],
      position: [dwX, plinthH + lowerH - 0.06, d / 2 + 0.005],
      rotation: [0, 0, Math.PI / 2],
      material: handleMat,
    });
    xCursor += dishwasherW;
  }

  // ── OVEN & COOKTOP (bottom mount) ──
  if (cfg.oven.enabled && cfg.oven.position === "bottom") {
    const ovenX = xCursor + cooktopW / 2;

    // Oven cabinet body
    parts.push({
      geo: "box", args: [cooktopW - 0.005, lowerH, d],
      position: [ovenX, plinthH + lowerH / 2, 0],
      material: cabinetMat,
    });
    // Oven door (glass front)
    parts.push({
      geo: "roundedBox", args: [cooktopW - 0.04, lowerH * 0.75, t * 0.5],
      radius: 0.005, segments: 2,
      position: [ovenX, plinthH + lowerH * 0.42, d / 2 - t * 0.25],
      material: glassMat,
    });
    // Oven frame
    parts.push({
      geo: "box", args: [cooktopW - 0.03, 0.01, 0.01],
      position: [ovenX, plinthH + lowerH * 0.82, d / 2 - t * 0.15],
      material: darkSteelMat,
    });
    // Oven handle
    parts.push({
      geo: "cylinder", args: [0.004, 0.004, cooktopW * 0.6, 8],
      position: [ovenX, plinthH + lowerH * 0.82, d / 2 + 0.008],
      rotation: [0, 0, Math.PI / 2],
      material: handleMat,
    });
    // Cooktop on counter surface
    const cooktopY = counterTopY + 0.002;
    parts.push({
      geo: "roundedBox", args: [cooktopW - 0.08, 0.015, d * 0.55],
      radius: 0.005, segments: 2,
      position: [ovenX, cooktopY, 0.02],
      material: { roughness: 0.1, metalness: 0.3, color: "#111111" },
    });
    // Burner circles (4)
    const burnerPositions = [
      [-0.12, -0.08], [0.12, -0.08], [-0.12, 0.12], [0.12, 0.12],
    ];
    burnerPositions.forEach(([bx, bz]) => {
      parts.push({
        geo: "cylinder", args: [0.05, 0.05, 0.003, 16],
        position: [ovenX + bx, cooktopY + 0.01, bz],
        rotation: [0, 0, 0],
        material: { roughness: 0.15, metalness: 0.4, color: cfg.oven.cooktop === "gas" ? "#555555" : "#222222" },
      });
    });
    xCursor += cooktopW;
  }

  // Remaining cabinets
  const remainingCabs = lowerCabCount - halfCabs;
  for (let i = 0; i < remainingCabs; i++) {
    addLowerCabinet(parts, xCursor, lowerCabUnitW, lowerH, d, plinthH, t, cabinetMat, doorMat, handleMat, false);
    xCursor += lowerCabUnitW;
  }

  // ── TOWER OVEN (if position=tower) ──
  if (cfg.oven.enabled && cfg.oven.position === "tower") {
    const towerX = fridgeOnLeft ? w / 2 - fridgeW - ovenW / 2 : cabinetStartX + cabinetZoneW + ovenW / 2;
    const towerH = h * 0.85;

    parts.push({
      geo: "box", args: [ovenW - 0.01, towerH, d],
      position: [towerX, towerH / 2, 0], material: cabinetMat,
    });
    // Oven cavity (mid height)
    parts.push({
      geo: "roundedBox", args: [ovenW - 0.05, 0.55, t * 0.5],
      radius: 0.005, segments: 2,
      position: [towerX, towerH * 0.55, d / 2 - t * 0.25],
      material: glassMat,
    });
    // Handle
    parts.push({
      geo: "cylinder", args: [0.004, 0.004, ovenW * 0.6, 8],
      position: [towerX, towerH * 0.55 + 0.3, d / 2 + 0.008],
      rotation: [0, 0, Math.PI / 2],
      material: handleMat,
    });
  }

  // ── PLINTH ──
  parts.push({
    geo: "box", args: [cabinetZoneW, plinthH, d - 0.05],
    position: [cabinetStartX + cabinetZoneW / 2, plinthH / 2, 0.025],
    material: { ...cabinetMat, color: lighten(cabinetMat.color, -15) },
  });

  // ── COUNTERTOP ──
  parts.push({
    geo: "roundedBox", args: [cabinetZoneW + 0.02, counterH, d + 0.03],
    radius: 0.005, segments: 2,
    position: [cabinetStartX + cabinetZoneW / 2, counterTopY - counterH / 2, 0.015],
    material: counterMat,
  });

  // ── UPPER CABINETS ──
  // Skip the zone above the hood
  const hoodZoneX = cfg.oven.enabled && cfg.oven.position === "bottom"
    ? cabinetStartX + cabinetW / 2 + dishwasherW
    : null;

  const upperCabCount = Math.max(2, Math.floor(cabinetZoneW / 0.55));
  const upperCabW = cabinetZoneW / upperCabCount;
  const upperBottom = counterTopY + gapH;

  for (let i = 0; i < upperCabCount; i++) {
    const xPos = cabinetStartX + upperCabW / 2 + i * upperCabW;

    // Skip if hood is here
    if (cfg.hood.enabled && hoodZoneX !== null) {
      const dist = Math.abs(xPos - (hoodZoneX + cooktopW / 2));
      if (dist < cooktopW / 2 + 0.05) continue;
    }

    parts.push({
      geo: "box", args: [upperCabW - 0.005, upperH, upperD],
      position: [xPos, upperBottom + upperH / 2, -d / 2 + upperD / 2 + 0.01],
      material: cabinetMat,
    });
    parts.push({
      geo: "roundedBox", args: [upperCabW - 0.015, upperH - 0.01, t * 0.5],
      radius: 0.004, segments: 2,
      position: [xPos, upperBottom + upperH / 2, -d / 2 + upperD + 0.01 - t * 0.25],
      material: doorMat,
    });
    parts.push({
      geo: "cylinder", args: [0.004, 0.004, 0.08, 8],
      position: [xPos + upperCabW / 2 - 0.04, upperBottom + upperH * 0.3, -d / 2 + upperD + 0.015],
      material: handleMat,
    });
  }

  // ── HOOD ──
  if (cfg.hood.enabled) {
    const hoodW = cooktopW + 0.06;
    const ovenCenterX = cfg.oven.enabled && cfg.oven.position === "bottom"
      ? cabinetStartX + cabinetW / 2 + dishwasherW + cooktopW / 2
      : cabinetStartX + cabinetZoneW / 2;
    const hoodY = counterTopY + gapH * 0.3;

    if (cfg.hood.type === "wall-mounted") {
      // Chimney-style trapezoid look
      parts.push({
        geo: "box", args: [hoodW, 0.08, d * 0.5],
        position: [ovenCenterX, hoodY, -d * 0.15],
        material: steelMat,
      });
      // Chimney duct
      parts.push({
        geo: "box", args: [0.25, gapH * 0.8, 0.18],
        position: [ovenCenterX, counterTopY + gapH * 0.6, -d / 2 + 0.12],
        material: steelMat,
      });
    } else if (cfg.hood.type === "built-in") {
      // Slim built-in under cabinet
      parts.push({
        geo: "roundedBox", args: [hoodW, 0.05, d * 0.45],
        radius: 0.005, segments: 2,
        position: [ovenCenterX, upperBottom - 0.03, -d * 0.15],
        material: { ...steelMat, color: lighten(steelMat.color, -10) },
      });
    } else {
      // Island hood (hanging from ceiling)
      parts.push({
        geo: "box", args: [hoodW, 0.1, d * 0.55],
        position: [ovenCenterX, hoodY + 0.15, 0],
        material: steelMat,
      });
      parts.push({
        geo: "cylinder", args: [0.08, 0.08, gapH * 0.5, 12],
        position: [ovenCenterX, hoodY + 0.15 + gapH * 0.3, 0],
        material: steelMat,
      });
    }
  }

  // ── BACKSPLASH ──
  parts.push({
    geo: "box", args: [cabinetZoneW, gapH, 0.01],
    position: [cabinetStartX + cabinetZoneW / 2, counterTopY + gapH / 2, -d / 2 + 0.005],
    material: { ...counterMat, color: lighten(counterMat.color, -10) },
  });

  return { type: "kitchen", parts };
}

// Helper: add a lower cabinet with door or drawers
function addLowerCabinet(parts, xCursor, unitW, lowerH, d, plinthH, t, cabinetMat, doorMat, handleMat, isDrawer) {
  const xPos = xCursor + unitW / 2;

  parts.push({
    geo: "box", args: [unitW - 0.005, lowerH, d],
    position: [xPos, plinthH + lowerH / 2, 0],
    material: cabinetMat,
  });

  if (isDrawer) {
    const drawerCount = 4;
    const drawerH = (lowerH - 0.01) / drawerCount;
    for (let j = 0; j < drawerCount; j++) {
      parts.push({
        geo: "roundedBox", args: [unitW - 0.015, drawerH - 0.008, t * 0.5],
        radius: 0.003, segments: 2,
        position: [xPos, plinthH + 0.005 + drawerH * j + drawerH / 2, d / 2 - t * 0.25],
        material: doorMat,
      });
      parts.push({
        geo: "cylinder", args: [0.003, 0.003, 0.06, 8],
        position: [xPos, plinthH + 0.005 + drawerH * j + drawerH / 2, d / 2 + 0.005],
        rotation: [0, 0, Math.PI / 2],
        material: handleMat,
      });
    }
  } else {
    parts.push({
      geo: "roundedBox", args: [unitW - 0.015, lowerH - 0.01, t * 0.5],
      radius: 0.004, segments: 2,
      position: [xPos, plinthH + lowerH / 2, d / 2 - t * 0.25],
      material: doorMat,
    });
    parts.push({
      geo: "cylinder", args: [0.004, 0.004, 0.1, 8],
      position: [xPos + unitW / 2 - 0.04, plinthH + lowerH / 2, d / 2 + 0.005],
      material: handleMat,
    });
  }
}

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────
function lighten(hex, amount) {
  if (!hex || hex.charAt(0) !== "#") return hex;
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ─────────────────────────────────────────────
// BED — Parametric headboard, frame, and mattress
// ─────────────────────────────────────────────
function generateBed(w, h, d, mat, style) {
  const frameH = 0.22;
  const legH = 0.12;
  const mattH = 0.24;
  const hbH = 0.95;

  const woodMat = mat;
  const sheetMat = { roughness: 0.85, metalness: 0.05, color: "#e8e4dc" };
  const pillowMat = { roughness: 0.9, metalness: 0.0, color: "#faf8f4" };
  const legMat = { roughness: 0.2, metalness: 0.85, color: "#c8a030" }; // gold leg accent

  const parts = [
    // Headboard
    {
      geo: "roundedBox",
      args: [w + 0.06, hbH, 0.08],
      radius: 0.01,
      segments: 2,
      position: [0, legH + hbH / 2, -d / 2 - 0.04],
      material: woodMat,
    },
    // Footboard
    {
      geo: "roundedBox",
      args: [w + 0.06, 0.22, 0.04],
      radius: 0.01,
      segments: 2,
      position: [0, legH + 0.11, d / 2 + 0.02],
      material: woodMat,
    },
    // Bed base/frame
    {
      geo: "box",
      args: [w + 0.04, frameH, d + 0.04],
      position: [0, legH + frameH / 2, 0],
      material: woodMat,
    },
    // 4 legs
    ...[
      [-w / 2 + 0.06, -d / 2 + 0.08],
      [w / 2 - 0.06, -d / 2 + 0.08],
      [-w / 2 + 0.06, d / 2 - 0.08],
      [w / 2 - 0.06, d / 2 - 0.08],
    ].map((pos, idx) => ({
      geo: "cylinder",
      args: [0.02, 0.015, legH, 12],
      position: [pos[0], legH / 2, pos[1]],
      material: legMat,
    })),
    // Mattress
    {
      geo: "roundedBox",
      args: [w - 0.02, mattH, d - 0.04],
      radius: 0.02,
      segments: 3,
      position: [0, legH + frameH + mattH / 2, -0.01],
      material: sheetMat,
    },
    // Pillows (2)
    {
      geo: "roundedBox",
      args: [w * 0.38, 0.1, 0.4],
      radius: 0.02,
      segments: 2,
      position: [-w * 0.22, legH + frameH + mattH + 0.05, -d / 2 + 0.3],
      material: pillowMat,
    },
    {
      geo: "roundedBox",
      args: [w * 0.38, 0.1, 0.4],
      radius: 0.02,
      segments: 2,
      position: [w * 0.22, legH + frameH + mattH + 0.05, -d / 2 + 0.3],
      material: pillowMat,
    },
  ];

  return { type: "bed", parts };
}
