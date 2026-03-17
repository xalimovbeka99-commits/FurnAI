// Factory Export — generates detailed production specification
export function generateFactorySpec(design) {
  const { type, style, material, color, width, height, depth, components, name, kitchen } = design;

  const panelThickness = material === "metal" ? 1.5 : material === "glass" ? 8 : 18; // mm
  const edgeBanding = material === "wood" ? "2mm PVC edge banding" : "none";

  // Generate component breakdown with exact dimensions
  const componentBreakdown = generateComponentBreakdown(type, width, height, depth, panelThickness, material, components);
  const hardware = generateHardwareList(type, componentBreakdown);
  const productionNotes = generateProductionNotes(type, style, material);

  const spec = {
    meta: {
      name: name || `${style} ${type}`,
      generatedAt: new Date().toISOString(),
      version: "1.0",
      generator: "Furni AI Factory Export System",
    },
    general: {
      furnitureType: type,
      style,
      material,
      primaryColor: color,
      finish: getFinish(material, style),
    },
    overallDimensions: {
      width: `${width} mm`,
      height: `${height} mm`,
      depth: `${depth} mm`,
      panelThickness: `${panelThickness} mm`,
      edgeBanding,
    },
    components: componentBreakdown,
    hardware,
    ...(type === "kitchen" ? { kitchenDetails: generateKitchenDetails(width, height, depth, kitchen) } : {}),
    productionNotes,
    assemblyInstructions: generateAssemblyInstructions(type),
  };

  return spec;
}

function getFinish(material, style) {
  const finishes = {
    wood: style === "luxury" ? "High-gloss lacquer" : style === "minimal" ? "Matte lacquer" : "Semi-gloss veneer",
    glass: "Tempered, polished edges",
    metal: style === "industrial" ? "Brushed steel" : "Powder-coated",
    marble: "Polished natural stone",
    fabric: "Stain-resistant upholstery",
  };
  return finishes[material] || "Standard finish";
}

function generateComponentBreakdown(type, w, h, d, thickness, material, components) {
  const t = thickness;
  const parts = [];

  switch (type) {
    case "wardrobe": {
      parts.push(
        { partId: "WRD-LP", name: "Left Panel", material, width: d, height: h, thickness: t, quantity: 1, edging: "front, top" },
        { partId: "WRD-RP", name: "Right Panel", material, width: d, height: h, thickness: t, quantity: 1, edging: "front, top" },
        { partId: "WRD-BP", name: "Back Panel", material, width: w - t * 2, height: h, thickness: Math.max(4, t * 0.5), quantity: 1, edging: "none" },
        { partId: "WRD-TP", name: "Top Panel", material, width: w, height: d, thickness: t, quantity: 1, edging: "front, left, right" },
        { partId: "WRD-BT", name: "Bottom Panel", material, width: w - t * 2, height: d, thickness: t, quantity: 1, edging: "front" },
      );
      const shelfCount = components?.filter(c => c.type === "shelf")[0]?.count || 3;
      for (let i = 0; i < shelfCount; i++) {
        parts.push({
          partId: `WRD-SH${i + 1}`,
          name: `Shelf ${i + 1}`,
          material,
          width: w - t * 2 - 2,
          height: d - t - 5,
          thickness: t,
          quantity: 1,
          edging: "front",
        });
      }
      const doorCount = components?.filter(c => c.type === "door")[0]?.count || 2;
      const doorW = (w - t * 2 - 4) / doorCount;
      for (let i = 0; i < doorCount; i++) {
        parts.push({
          partId: `WRD-DR${i + 1}`,
          name: `Door ${i + 1}`,
          material,
          width: doorW,
          height: h - t * 2 - 4,
          thickness: t,
          quantity: 1,
          edging: "all sides",
        });
      }
      break;
    }
    case "sofa": {
      parts.push(
        { partId: "SOF-BF", name: "Base Frame", material: "plywood", width: w, height: 60, thickness: 18, quantity: 1, edging: "none" },
        { partId: "SOF-BR", name: "Backrest Frame", material: "plywood", width: w - 40, height: h * 0.55, thickness: 15, quantity: 1, edging: "none" },
        { partId: "SOF-CS", name: "Seat Cushion", material: "HR foam + fabric", width: (w - 100) / 2, height: 150, thickness: d - 120, quantity: 2, edging: "N/A — upholstered" },
        { partId: "SOF-CB", name: "Back Cushion", material: "fiber fill + fabric", width: (w - 100) / 2, height: h * 0.4, thickness: 120, quantity: 2, edging: "N/A — upholstered" },
        { partId: "SOF-AL", name: "Left Armrest", material: "foam + fabric", width: 80, height: h * 0.35, thickness: d * 0.8, quantity: 1, edging: "N/A — upholstered" },
        { partId: "SOF-AR", name: "Right Armrest", material: "foam + fabric", width: 80, height: h * 0.35, thickness: d * 0.8, quantity: 1, edging: "N/A — upholstered" },
        { partId: "SOF-LG", name: "Leg", material: "metal", width: 30, height: h * 0.06, thickness: 30, quantity: 4, edging: "N/A" },
      );
      break;
    }
    case "table": {
      parts.push(
        { partId: "TBL-TP", name: "Tabletop", material, width: w, height: d, thickness: Math.max(25, t), quantity: 1, edging: "all sides" },
        { partId: "TBL-LG", name: "Leg", material: material === "wood" ? material : "metal", width: 40, height: h - 35, thickness: 40, quantity: 4, edging: "N/A" },
      );
      parts.push(
        { partId: "TBL-XS", name: "Cross Support", material: material === "wood" ? material : "metal", width: w - 120, height: 15, thickness: 15, quantity: 2, edging: "N/A" },
      );
      break;
    }
    case "cabinet": {
      parts.push(
        { partId: "CAB-LP", name: "Left Panel", material, width: d, height: h, thickness: t, quantity: 1, edging: "front, top" },
        { partId: "CAB-RP", name: "Right Panel", material, width: d, height: h, thickness: t, quantity: 1, edging: "front, top" },
        { partId: "CAB-BP", name: "Back Panel", material, width: w - t * 2, height: h, thickness: Math.max(4, t * 0.5), quantity: 1, edging: "none" },
        { partId: "CAB-TP", name: "Top Panel", material, width: w + 20, height: d + 20, thickness: t, quantity: 1, edging: "all sides" },
        { partId: "CAB-BT", name: "Bottom Panel", material, width: w - t * 2, height: d, thickness: t, quantity: 1, edging: "front" },
      );
      const drawerCount = components?.filter(c => c.type === "drawer")[0]?.count || 3;
      for (let i = 0; i < drawerCount; i++) {
        parts.push({
          partId: `CAB-DF${i + 1}`,
          name: `Drawer Front ${i + 1}`,
          material,
          width: w - t * 3,
          height: (h - t * 2) / drawerCount - 6,
          thickness: t,
          quantity: 1,
          edging: "all sides",
        });
        parts.push({
          partId: `CAB-DB${i + 1}`,
          name: `Drawer Box ${i + 1}`,
          material: "plywood",
          width: w - t * 4,
          height: (h - t * 2) / drawerCount - 30,
          thickness: d - 50,
          quantity: 1,
          edging: "none",
          note: "Drawer box: 2 sides + front + back + bottom",
        });
      }
      break;
    }
    case "kitchen": {
      // Lower cabinets
      const lowerCount = 3;
      const lowerW = (w - 600) / lowerCount; // 600mm reserved for appliances
      for (let i = 0; i < lowerCount; i++) {
        parts.push({
          partId: `KIT-LC${i + 1}`,
          name: `Lower Cabinet ${i + 1}`,
          material,
          width: lowerW,
          height: 720,
          thickness: t,
          quantity: 1,
          edging: "front",
          note: "Includes: 2 sides, top, bottom, back, 1 shelf, 1 door",
        });
      }
      // Upper cabinets
      const upperCount = 3;
      const upperW = w / upperCount;
      for (let i = 0; i < upperCount; i++) {
        parts.push({
          partId: `KIT-UC${i + 1}`,
          name: `Upper Cabinet ${i + 1}`,
          material,
          width: upperW,
          height: 700,
          thickness: t,
          quantity: 1,
          edging: "front",
          note: "Includes: 2 sides, top, bottom, back, 2 shelves, 1 door",
        });
      }
      // Countertop
      parts.push({
        partId: "KIT-CT",
        name: "Countertop",
        material: "marble",
        width: w,
        height: d + 20,
        thickness: 30,
        quantity: 1,
        edging: "front edge polished, drip groove",
      });
      // Drawer units
      parts.push({
        partId: "KIT-DU",
        name: "Drawer Unit (4 drawers)",
        material,
        width: lowerW,
        height: 720,
        thickness: t,
        quantity: 1,
        edging: "front",
        note: "4 drawers with soft-close rails",
      });
      break;
    }
  }

  return parts;
}

function generateHardwareList(type, components) {
  const hardware = [];

  const doorCount = components.filter(c => c.name.includes("Door")).length;
  const drawerCount = components.filter(c => c.name.includes("Drawer")).length;

  if (doorCount > 0) {
    hardware.push(
      { item: "Soft-close hinge (110°)", quantity: doorCount * 2, specification: "Full overlay, clip-on" },
      { item: "Door handle", quantity: doorCount, specification: "128mm center-to-center" },
    );
  }

  if (drawerCount > 0) {
    hardware.push(
      { item: "Drawer slide (soft-close)", quantity: drawerCount, specification: "Full extension, 45kg capacity" },
      { item: "Drawer handle/knob", quantity: drawerCount, specification: "96mm center-to-center" },
    );
  }

  if (type === "wardrobe" || type === "cabinet" || type === "kitchen") {
    hardware.push(
      { item: "Shelf pin", quantity: components.filter(c => c.name.includes("Shelf")).length * 4, specification: "5mm diameter, metal" },
      { item: "Cam lock + dowel", quantity: 8, specification: "15mm, for panel joining" },
      { item: "Back panel nail/staple", quantity: 20, specification: "16mm" },
    );
  }

  if (type === "table") {
    hardware.push(
      { item: "Leg mounting bracket", quantity: 4, specification: "Heavy-duty L-bracket" },
      { item: "Wood screw", quantity: 16, specification: "M6 x 40mm" },
    );
  }

  if (type === "sofa") {
    hardware.push(
      { item: "Sofa leg bolt", quantity: 4, specification: "M8 hanger bolt" },
      { item: "Webbing/springs", quantity: 1, specification: "Sinuous springs or elastic webbing" },
      { item: "Staples (upholstery)", quantity: 200, specification: "10mm crown" },
    );
  }

  if (type === "kitchen") {
    hardware.push(
      { item: "Adjustable foot/plinth", quantity: 8, specification: "100mm height adjustable" },
      { item: "Wall mounting bracket", quantity: 6, specification: "For upper cabinets, heavy-duty" },
    );
  }

  return hardware;
}

function generateKitchenDetails(w, h, d, kitchenConfig) {
  const cfg = kitchenConfig || {};
  const fridge = cfg.fridge || {};
  const dishwasher = cfg.dishwasher || {};
  const hood = cfg.hood || {};
  const oven = cfg.oven || {};

  const fridgeW = fridge.size === "side-by-side" ? 900 : fridge.size === "double" ? 700 : 600;
  const dwW = dishwasher.size === "compact" ? 450 : 600;

  return {
    appliances: {
      fridge: fridge.enabled ? {
        type: fridge.size || "double",
        position: fridge.position || "right",
        width: `${fridgeW} mm`,
        height: `${Math.round(h * 0.88)} mm`,
        depth: `${d} mm`,
        integration: "standalone",
      } : null,
      dishwasher: dishwasher.enabled ? {
        size: dishwasher.size || "standard",
        style: dishwasher.style || "hidden",
        width: `${dwW} mm`,
        height: "720 mm",
        depth: `${d} mm`,
        integration: dishwasher.style === "hidden" ? "panel-ready" : "freestanding",
      } : null,
      hood: hood.enabled ? {
        type: hood.type || "wall-mounted",
        width: "660 mm",
        mountHeight: "550 mm above countertop",
      } : null,
      oven: oven.enabled ? {
        position: oven.position || "bottom",
        cooktop: oven.cooktop || "induction",
        ovenWidth: "600 mm",
        ovenHeight: oven.position === "tower" ? "550 mm" : `${Math.round(720 * 0.75)} mm`,
        cooktopWidth: "520 mm",
      } : null,
    },
    applianceSpaces: {
      fridgeSlot: fridge.enabled ? { width: `${fridgeW} mm`, height: `${Math.round(h * 0.88)} mm`, depth: `${d} mm`, position: fridge.position || "right" } : null,
      dishwasherSlot: dishwasher.enabled ? { width: `${dwW} mm`, height: "720 mm", depth: `${d} mm`, position: "under countertop" } : null,
      ovenSlot: oven.enabled ? { width: "600 mm", height: oven.position === "tower" ? "850 mm" : "720 mm", depth: `${d} mm`, position: oven.position === "tower" ? "tower unit" : "under cooktop" } : null,
    },
    countertop: {
      material: "Marble / Quartz",
      width: `${w} mm`,
      depth: `${d + 20} mm`,
      thickness: "30 mm",
      edgeProfile: "Eased edge",
      backsplash: "100mm upstand recommended",
    },
    cabinetSpacing: {
      lowerCabinetHeight: "720 mm",
      plinthHeight: "100 mm",
      countertopHeight: "850 mm (720 + 100 + 30)",
      upperCabinetBottomHeight: "1400 mm from floor",
      upperCabinetHeight: "700 mm",
      gapBetweenUpperAndCountertop: "520 mm",
    },
  };
}

function generateProductionNotes(type, style, material) {
  const notes = {
    materialPrep: [],
    finishing: [],
    qualityChecks: [],
  };

  if (material === "wood") {
    notes.materialPrep.push(
      "Use 18mm melamine-faced chipboard or MDF for panels",
      "Apply 2mm PVC edge banding to all visible edges",
      "Sand all surfaces to 180-grit minimum before finishing"
    );
    notes.finishing.push(
      style === "luxury" ? "Apply 3 coats high-gloss lacquer with sanding between coats" :
      style === "minimal" ? "Apply 2 coats matte lacquer" :
      "Apply 2 coats semi-gloss polyurethane"
    );
  } else if (material === "metal") {
    notes.materialPrep.push(
      "Use 1.5mm steel or aluminum sheet",
      "Deburr all cut edges",
      "Prime with anti-corrosion primer"
    );
    notes.finishing.push("Powder coat in specified color, cure at 200°C for 10 min");
  } else if (material === "fabric") {
    notes.materialPrep.push(
      "Cut fabric with 20mm seam allowance",
      "Use HR35 density foam for seat cushions (min 100mm)",
      "Use fiber fill for back cushions"
    );
    notes.finishing.push("Apply Scotchgard fabric protector");
  }

  notes.qualityChecks.push(
    "Verify all dimensions within ±1mm tolerance",
    "Check all edges for chips or defects",
    "Test all moving parts (doors, drawers) for smooth operation",
    "Verify color consistency across all panels"
  );

  return notes;
}

function generateAssemblyInstructions(type) {
  const instructions = {
    wardrobe: [
      "1. Lay bottom panel flat, attach side panels using cam locks",
      "2. Attach back panel using nails/staples",
      "3. Install shelf pins and place shelves",
      "4. Attach top panel",
      "5. Mount hinges on doors, then hang doors",
      "6. Install handles",
      "7. Level and secure to wall if needed",
    ],
    sofa: [
      "1. Assemble base frame with screws",
      "2. Install sinuous springs or webbing",
      "3. Attach foam padding to frame",
      "4. Upholster base and backrest",
      "5. Attach armrests",
      "6. Place seat and back cushions",
      "7. Screw in legs",
    ],
    table: [
      "1. Position tabletop face-down on protective surface",
      "2. Attach leg mounting brackets",
      "3. Install legs and tighten bolts",
      "4. Attach cross supports if applicable",
      "5. Flip table upright and level",
    ],
    cabinet: [
      "1. Assemble frame (sides + top + bottom) with cam locks",
      "2. Attach back panel",
      "3. Install drawer slides on frame sides",
      "4. Assemble drawer boxes",
      "5. Attach drawer fronts to drawer boxes",
      "6. Install drawer boxes onto slides",
      "7. Install handles/knobs",
      "8. Attach legs",
    ],
    kitchen: [
      "1. Install lower cabinet carcasses, level with adjustable feet",
      "2. Join adjacent cabinets with connector bolts",
      "3. Install drawer slides and shelves in lower cabinets",
      "4. Place and secure countertop",
      "5. Mount upper cabinet wall brackets at correct height",
      "6. Hang upper cabinets and level",
      "7. Install all doors with soft-close hinges",
      "8. Attach all handles",
      "9. Install appliances in designated slots",
      "10. Install backsplash and plinth covers",
    ],
  };

  return instructions[type] || instructions.wardrobe;
}
