/**
 * Production Specification Generator
 * Generates factory-ready specs from design parameters
 */

const MATERIAL_COSTS = {
  oak: 45,        // AED per m²
  walnut: 65,     // AED per m²
  white: 35,
  black: 40,
  beige: 38,
  mahogany: 70,
  linen: 42,
  graphite: 39,
  sage: 42,
  navy: 41,
  concrete: 50,
  darkwood: 60,
};

const HARDWARE_COSTS = {
  gold: 15,
  silver: 12,
  black: 10,
  hidden: 8,
  chrome: 14,
};

const HANDLE_TYPE_COSTS = {
  gold: 8,
  silver: 7,
  black: 6,
  hidden: 0,
  chrome: 7,
};

const DOOR_TYPE_COSTS = {
  solid: 20,
  glass: 45,
  mirror: 55,
  frosted: 50,
};

const STANDARD_THICKNESS = 18; // mm for panels

/**
 * Generate complete production specification
 */
export function generateProductionSpec(design) {
  const {
    type,
    color,
    width,    // in meters
    height,   // in meters
    depth,    // in meters
    doorType = "solid",
    handleStyle = "gold",
    drawerRows = 0,
    ledLighting = "off",
    hangerRods = false,
    bedSize = "queen",
    bedHeadboard = "padded",
    bedStorage = false,
    bedFrameStyle = "platform",
    bedPillowCount = 2,
    bedBench = false,
    bedLampStyle = "table",
  } = design;

  // Convert to cm for spec
  const wCm = Math.round(width * 100);
  const hCm = Math.round(height * 100);
  const dCm = Math.round(depth * 100);

  // Convert to mm for detailed specs
  const wMm = wCm * 10;
  const hMm = hCm * 10;
  const dMm = dCm * 10;

  // Generate component breakdown based on type
  let components = [];

  if (type === "wardrobe") {
    components = generateWardrobeComponents(wMm, hMm, dMm, doorType, drawerRows);
  } else if (type === "kitchen") {
    components = generateKitchenComponents(wMm, hMm, dMm);
  } else if (type === "cabinet") {
    components = generateCabinetComponents(wMm, hMm, dMm, doorType);
  } else if (type === "bed") {
    components = generateBedComponents(wMm, hMm, dMm, bedSize, bedHeadboard, bedStorage, bedFrameStyle, bedPillowCount, bedBench, bedLampStyle);
  } else {
    // Generic furniture components
    components = generateGenericComponents(type, wMm, hMm, dMm);
  }

  // Calculate costs
  const materialArea = calculateMaterialArea(components);
  const materialCost = (materialArea * (MATERIAL_COSTS[color] || 40)) / 10000; // Convert mm² to m²

  const hardwareCost = calculateHardwareCost(
    type,
    doorType,
    handleStyle,
    drawerRows,
    ledLighting,
    hangerRods,
    bedStorage,
    ledLighting !== "off"
  );

  const laborCost = calculateLaborCost(components, type);
  const deliveryCost = 50; // Fixed for Phase Three

  const totalCost = materialCost + hardwareCost + laborCost + deliveryCost;

  return {
    id: `FURNI-${Date.now()}`,
    createdAt: new Date().toISOString(),
    design: {
      type,
      color,
      style: design.style || "modern",
      dimensions: { width: wCm, height: hCm, depth: dCm },
    },
    components,
    materials: {
      primary: color,
      edgeBanding: `${color}-edge`,
      finishing: "lacquer",
      description: `${color} wood with standard edge banding`,
    },
    hardware: {
      handleStyle,
      doorType,
      drawerRows,
      ledLighting,
      hangerRods,
      items: generateHardwareList(type, doorType, handleStyle, drawerRows, ledLighting),
    },
    costs: {
      material: Math.round(materialCost * 100) / 100,
      hardware: Math.round(hardwareCost * 100) / 100,
      labor: Math.round(laborCost * 100) / 100,
      delivery: deliveryCost,
      total: Math.round(totalCost * 100) / 100,
    },
    productionTime: calculateProductionTime(components),
    cncReady: true,
    dxfRequired: true,
    gCodeRequired: true,
  };
}

/**
 * Generate bed-specific components
 */
function generateBedComponents(w, h, d, bedSize, bedHeadboard, bedStorage, bedFrameStyle, bedPillowCount, bedBench, bedLampStyle) {
  const components = [
    // Headboard
    { name: `Headboard Panel (${bedHeadboard})`, width: w + 60, height: bedHeadboard === "tall" ? 1250 : bedHeadboard === "low" ? 420 : 950, quantity: 1, thickness: 50 },
    // Footboard
    { name: "Footboard Panel", width: w + 60, height: 220, quantity: 1, thickness: 30 },
    // Bed base/frame
    { name: `Bed Frame (${bedFrameStyle})`, width: w + 40, height: d + 40, quantity: 1, thickness: 25 },
    // Side Rails
    { name: "Side Rail (Left)", width: d - 40, height: 150, quantity: 1, thickness: 22 },
    { name: "Side Rail (Right)", width: d - 40, height: 150, quantity: 1, thickness: 22 },
    // Mattress
    { name: `Mattress (${bedSize})`, width: w - 40, height: d - 60, quantity: 1, thickness: 260 },
  ];

  // Under-bed storage drawers
  if (bedStorage) {
    components.push(
      { name: "Storage Drawer Front", width: Math.round(w * 0.44), height: 120, quantity: 2, thickness: 18 },
      { name: "Storage Drawer Box Side", width: Math.round(d * 0.45), height: 100, quantity: 4, thickness: 12 },
      { name: "Storage Drawer Box Bottom", width: Math.round(w * 0.42), height: Math.round(d * 0.42), quantity: 2, thickness: 6 }
    );
  }

  // Nightstands
  components.push(
    { name: "Nightstand Top", width: 500, height: 400, quantity: 2, thickness: 18 },
    { name: "Nightstand Side Panel", width: 400, height: 350, quantity: 4, thickness: 18 },
    { name: "Nightstand Drawer Front", width: 475, height: 150, quantity: 2, thickness: 18 }
  );

  // Bench
  if (bedBench) {
    components.push(
      { name: "Bench Cushion", width: Math.round(w * 0.78), height: 380, quantity: 1, thickness: 70 },
      { name: "Bench Frame", width: Math.round(w * 0.80), height: 400, quantity: 1, thickness: 25 }
    );
  }

  return components;
}

/**
 * Generate wardrobe-specific components
 */
function generateWardrobeComponents(w, h, d, doorType, drawerRows) {
  return [
    // Structure
    { name: "Side Panel (Left)", width: d, height: h, quantity: 1, thickness: STANDARD_THICKNESS },
    { name: "Side Panel (Right)", width: d, height: h, quantity: 1, thickness: STANDARD_THICKNESS },
    { name: "Top Panel", width: w, height: d, quantity: 1, thickness: STANDARD_THICKNESS },
    { name: "Bottom Panel", width: w, height: d, quantity: 1, thickness: STANDARD_THICKNESS },
    { name: "Back Panel", width: w, height: h, quantity: 1, thickness: 12 },

    // Doors
    { name: `Door Panel (${doorType})`, width: Math.round(w / 3), height: Math.round(h * 0.9), quantity: 3, thickness: doorType === "mirror" ? 5 : 18 },

    // Shelves
    { name: "Internal Shelf", width: Math.round(w * 0.95), height: d, quantity: 2, thickness: STANDARD_THICKNESS },

    // Drawers (if applicable)
    ...(drawerRows > 0 ? [
      { name: "Drawer Front", width: Math.round(w / 3), height: Math.round(h * 0.2), quantity: drawerRows * 3, thickness: STANDARD_THICKNESS },
      { name: "Drawer Box", width: Math.round(d * 0.95), height: Math.round(h * 0.18), quantity: drawerRows * 3, thickness: 12 },
    ] : []),

    // Hardware
    { name: "Handle", quantity: drawerRows > 0 ? (drawerRows * 3) + 3 : 3, unit: "pcs" },
    { name: "Hinge", quantity: 6, unit: "pcs" },
    { name: "Rail", quantity: drawerRows > 0 ? drawerRows * 3 : 0, unit: "pcs" },
  ];
}

/**
 * Generate kitchen-specific components
 */
function generateKitchenComponents(w, h, d) {
  return [
    { name: "Base Cabinet Body", width: w, height: 900, quantity: 1, thickness: STANDARD_THICKNESS },
    { name: "Wall Cabinet Body", width: w, height: 750, quantity: 1, thickness: STANDARD_THICKNESS },
    { name: "Countertop", width: w, height: d, quantity: 1, thickness: 30 },
    { name: "Door Panels", width: Math.round(w / 2), height: 850, quantity: 4, thickness: STANDARD_THICKNESS },
    { name: "Drawer Fronts", width: Math.round(w / 2), height: 200, quantity: 4, thickness: STANDARD_THICKNESS },
    { name: "Shelves (Interior)", width: Math.round(w * 0.95), height: Math.round(d * 0.9), quantity: 4, thickness: 16 },
    { name: "Backing Panels", width: w, height: 1650, quantity: 1, thickness: 12 },
  ];
}

/**
 * Generate cabinet-specific components
 */
function generateCabinetComponents(w, h, d, doorType) {
  return [
    { name: "Side Panel", width: d, height: h, quantity: 2, thickness: STANDARD_THICKNESS },
    { name: "Top/Bottom Panel", width: w, height: d, quantity: 2, thickness: STANDARD_THICKNESS },
    { name: "Back Panel", width: w, height: h, quantity: 1, thickness: 12 },
    { name: `Door Panel`, width: Math.round(w * 0.95), height: Math.round(h * 0.95), quantity: 1, thickness: doorType === "mirror" ? 5 : 18 },
    { name: "Interior Shelf", width: Math.round(w * 0.95), height: d, quantity: 2, thickness: STANDARD_THICKNESS },
  ];
}

/**
 * Generic components for other types
 */
function generateGenericComponents(type, w, h, d) {
  return [
    { name: "Main Body - Left", width: d, height: h, quantity: 1, thickness: STANDARD_THICKNESS },
    { name: "Main Body - Right", width: d, height: h, quantity: 1, thickness: STANDARD_THICKNESS },
    { name: "Top Panel", width: w, height: d, quantity: 1, thickness: STANDARD_THICKNESS },
    { name: "Bottom Panel", width: w, height: d, quantity: 1, thickness: STANDARD_THICKNESS },
    { name: "Back Panel", width: w, height: h, quantity: 1, thickness: 12 },
  ];
}

/**
 * Calculate total material area needed (simplified)
 */
function calculateMaterialArea(components) {
  return components.reduce((total, comp) => {
    if (comp.unit === "pcs") return total;
    const area = (comp.width * comp.height * comp.quantity * comp.thickness) / 1000000; // mm² to m²
    return total + area;
  }, 0);
}

/**
 * Generate hardware list with part numbers
 */
function generateHardwareList(type, doorType, handleStyle, drawerRows, ledLighting) {
  const list = [];

  if (type === "bed") {
    list.push({
      description: "Heavy Duty Bed Corner Bracket",
      partNumber: "BRKT-BED-HD",
      quantity: 4,
      unitPrice: 15,
      supplier: "Hardware",
    });
    list.push({
      description: "M8 Joint Connect Bolt (80mm)",
      partNumber: "BOLT-M8-80",
      quantity: 12,
      unitPrice: 2,
      supplier: "Hardware",
    });
    if (ledLighting !== "off") {
      list.push({
        description: `LED Strip (${ledLighting})`,
        partNumber: `LED-${ledLighting.toUpperCase()}`,
        quantity: 1,
        unitPrice: 25,
        supplier: "Lighting",
      });
    }
    return list;
  }

  // Hinges
  list.push({
    description: "Blum Clip Top Hinge",
    partNumber: "71B3550",
    quantity: 6,
    unitPrice: 12,
    supplier: "Blum",
  });

  // Handles
  if (handleStyle !== "hidden") {
    list.push({
      description: `${handleStyle.charAt(0).toUpperCase() + handleStyle.slice(1)} Handle`,
      partNumber: `HANDLE-${handleStyle.toUpperCase()}`,
      quantity: 3,
      unitPrice: HANDLE_TYPE_COSTS[handleStyle] || 7,
      supplier: "Internal",
    });
  }

  // Drawer rails
  if (drawerRows > 0) {
    list.push({
      description: "Ball-Bearing Drawer Rail (500mm)",
      partNumber: "RAIL-500BB",
      quantity: drawerRows * 3 * 2,
      unitPrice: 5,
      supplier: "Blum",
    });
  }

  // Mirror/Glass for doors
  if (doorType === "mirror") {
    list.push({
      description: "Silver Mirror Panel (5mm)",
      partNumber: "MIRROR-5MM",
      quantity: 3,
      unitPrice: 20,
      supplier: "Glass Supplier",
    });
  }

  // LED strips
  if (ledLighting !== "off") {
    list.push({
      description: `LED Strip (${ledLighting})`,
      partNumber: `LED-${ledLighting.toUpperCase()}`,
      quantity: 1,
      unitPrice: 25,
      supplier: "Lighting",
    });
  }

  // Confirmat screws
  list.push({
    description: "Confirmat Screw (5x65mm)",
    partNumber: "SCREW-5X65",
    quantity: 50,
    unitPrice: 0.2,
    supplier: "Hardware",
  });

  return list;
}

/**
 * Calculate hardware costs
 */
function calculateHardwareCost(type, doorType, handleStyle, drawerRows, ledLighting, hangerRods, bedStorage, bedLedUnder) {
  let cost = 0;

  if (type === "bed") {
    cost += 60; // base bed brackets and bolts
    if (bedStorage) cost += 30; // drawer runners
    if (bedLedUnder) cost += 25; // LED strip
    return cost;
  }

  // Door panels
  cost += DOOR_TYPE_COSTS[doorType] || 20;

  // Handles
  cost += HANDLE_TYPE_COSTS[handleStyle] || 0;

  // Drawer rails
  if (drawerRows > 0) {
    cost += drawerRows * 30; // 3 per row × 2 rails per drawer × cost
  }

  // LED strips
  if (ledLighting !== "off") {
    cost += 25;
  }

  // Hanger rods
  if (hangerRods) {
    cost += 12;
  }

  // Base hardware (hinges, screws, etc.)
  cost += 20;

  return cost;
}

/**
 * Calculate labor costs based on complexity
 */
function calculateLaborCost(components, type) {
  const componentCount = components.length;
  const baseLabor = 150; // AED base labor
  const perComponentLabor = 10; // AED per component

  return baseLabor + (componentCount * perComponentLabor);
}

/**
 * Estimate production time in days
 */
function calculateProductionTime(components) {
  const componentCount = components.length;
  // ~15 components = 5 days, scale linearly
  const daysPerComponent = 0.33;
  return Math.max(3, Math.ceil(componentCount * daysPerComponent));
}

/**
 * Format spec as PDF-ready text
 */
export function formatSpecAsPDF(spec) {
  let text = `PRODUCTION SPECIFICATION CARD
=====================================

Order ID: ${spec.id}
Created: ${new Date(spec.createdAt).toLocaleDateString()}

DESIGN PARAMETERS
-----------------
Type: ${spec.design.type}
Style: ${spec.design.style}
Material: ${spec.design.color}
Dimensions: ${spec.design.dimensions.width}cm W × ${spec.design.dimensions.height}cm H × ${spec.design.dimensions.depth}cm D

COMPONENT BREAKDOWN
------------------`;

  spec.components.forEach((comp) => {
    if (comp.unit === "pcs") {
      text += `\n${comp.name}: ${comp.quantity} pcs`;
    } else {
      text += `\n${comp.name}: ${comp.width}mm × ${comp.height}mm × ${comp.thickness}mm, Qty: ${comp.quantity}`;
    }
  });

  text += `\n\nHARDWARE SPECIFICATIONS
-----------------------`;
  spec.hardware.items.forEach((item) => {
    text += `\n${item.description} (${item.partNumber}): ${item.quantity} × ${item.unitPrice} AED`;
  });

  text += `\n\nCOSTING BREAKDOWN
-----------------
Material: ${spec.costs.material} AED
Hardware: ${spec.costs.hardware} AED
Labor: ${spec.costs.labor} AED
Delivery: ${spec.costs.delivery} AED
───────────────────────
TOTAL: ${spec.costs.total} AED

Production Time: ${spec.productionTime} days
CNC Ready: Yes
DXF Files Required: Yes`;

  return text;
}

/**
 * Format spec as JSON for machine processing
 */
export function formatSpecAsJSON(spec) {
  return JSON.stringify(spec, null, 2);
}
