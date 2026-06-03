"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useTheme } from "../../components/ThemeProvider";

// ─── COLOUR PALETTE DEFINITIONS ───
const PALETTE = {
  oak:      { c: 0xA07040, r: 0.75, m: 0.02 },
  walnut:   { c: 0x3D2010, r: 0.80, m: 0.02 },
  white:    { c: 0xF2EDE6, r: 0.30, m: 0.06 },
  black:    { c: 0x1C1C1C, r: 0.42, m: 0.12 },
  beige:    { c: 0xD0C0A0, r: 0.72, m: 0.02 },
  mahog:    { c: 0x6A2820, r: 0.76, m: 0.02 },
  linen:    { c: 0xDDD4C4, r: 0.68, m: 0.02 },
  graph:    { c: 0x363232, r: 0.48, m: 0.18 },
  sage:     { c: 0x3A5040, r: 0.72, m: 0.02 },
  navy:     { c: 0x1A2840, r: 0.55, m: 0.10 },
  ice:      { c: 0xB0C4D8, r: 0.38, m: 0.12 },
  marble:   { c: 0xF0ECE4, r: 0.15, m: 0.08 },
  concrete: { c: 0xBCB8B0, r: 0.92, m: 0.00 },
  darkwood: { c: 0x282422, r: 0.80, m: 0.04 },
};

// ─── STYLE PRESETS ───
const PRESETS = {
  luxury:     { color: 'oak',    faceColor: 'oak',    handle: 'gold',   door: 'solid', led: 'warm', dr: 2, ro: true  },
  minimal:    { color: 'white',  faceColor: 'white',  handle: 'hidden', door: 'solid', led: 'off',  dr: 0, ro: false },
  scandi:     { color: 'linen',  faceColor: 'linen',  handle: 'silver', door: 'solid', led: 'warm', dr: 1, ro: true  },
  industrial: { color: 'graph',  faceColor: 'graph',  handle: 'black',  door: 'solid', led: 'cool', dr: 2, ro: false },
  classic:    { color: 'walnut', faceColor: 'walnut', handle: 'gold',   door: 'solid', led: 'warm', dr: 2, ro: true  },
  modern:     { color: 'black',  faceColor: 'black',  handle: 'chrome', door: 'glass', led: 'cool', dr: 1, ro: false },
  navy:       { color: 'navy',   faceColor: 'navy',   handle: 'chrome', door: 'glass', led: 'cool', dr: 0, ro: false },
};

export default function BuilderPage() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const { theme } = useTheme();

  // ─── React states mirroring active options ───
  const [activeCategory, setActiveCategory] = useState("wardrobe");
  const [selectedPart, setSelectedPart] = useState("Click any part to edit");
  const [width, setWidth] = useState(2.4);
  const [height, setHeight] = useState(2.8);
  const [depth, setDepth] = useState(0.60);
  const [sections, setSections] = useState(3);
  const [extDrawerRows, setExtDrawerRows] = useState(0);
  const [hangerRods, setHangerRods] = useState(false);
  const [activePreset, setActivePreset] = useState("luxury");
  const [activeColor, setActiveColor] = useState("oak");
  const [activeFaceColor, setActiveFaceColor] = useState("oak");
  const [doorStyle, setDoorStyle] = useState("solid");
  const [handleStyle, setHandleStyle] = useState("gold");
  const [ledLighting, setLedLighting] = useState("off");
  const [activeView, setActiveView] = useState("v3d");
  const [prompt, setPrompt] = useState("");
  const [notifText, setNotifText] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [hudText, setHudText] = useState("✦ Click a part to customise");
  const [showHud, setShowHud] = useState(false);

  // ─── Mobile Responsive Toggle States ───
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  // ─── Kitchen Designer States ───
  const [roomWidth, setRoomWidth] = useState(2.6); // 2.6 m (260 cm)
  const [roomLength, setRoomLength] = useState(2.2); // 2.2 m (220 cm)
  const [roomHeight, setRoomHeight] = useState(2.7); // 2.7 m (270 cm)
  const [kitchenLayout, setKitchenLayout] = useState("u-shape"); // u-shape, l-shape, single-wall, parallel, island
  
  const [baseCabinetWidth, setBaseCabinetWidth] = useState(0.60); // 60 cm
  const [baseCabinetHeight, setBaseCabinetHeight] = useState(0.90); // 90 cm
  const [baseCabinetDepth, setBaseCabinetDepth] = useState(0.60); // 60 cm
  const [toeKickHeight, setToeKickHeight] = useState(0.10); // 10 cm
  const [kitchenHandleType, setKitchenHandleType] = useState("gold"); // gold, silver, black, hidden, chrome
  
  const [wallCabinetsEnabled, setWallCabinetsEnabled] = useState(true);
  const [wallCabinetHeight, setWallCabinetHeight] = useState(0.75); // 75 cm
  const [wallCabinetDepth, setWallCabinetDepth] = useState(0.35); // 35 cm
  const [wallCabinetDistance, setWallCabinetDistance] = useState(0.60); // 60 cm from countertop
  const [wallCabinetGlass, setWallCabinetGlass] = useState(false);
  const [wallCabinetOpen, setWallCabinetOpen] = useState(false);

  const [tallCabinetType, setTallCabinetType] = useState("oven-pantry"); // oven-tower, pantry, fridge-housing, storage
  const [tallCabinetsCount, setTallCabinetsCount] = useState(1);

  const [countertopMaterial, setCountertopMaterial] = useState("marble"); // marble, quartz, granite, concrete, wood, ceramic
  const [countertopColor, setCountertopColor] = useState("white");
  const [countertopThickness, setCountertopThickness] = useState(0.03); // 3 cm
  const [countertopWaterfall, setCountertopWaterfall] = useState(true);

  const [islandEnabled, setIslandEnabled] = useState(false);
  const [islandWidth, setIslandWidth] = useState(1.6); // 1.2 - 3.0 m
  const [islandDepth, setIslandDepth] = useState(0.9); // 0.6 - 1.2 m
  const [islandSeating, setIslandSeating] = useState(true);
  const [islandSink, setIslandSink] = useState(false);
  const [islandCooker, setIslandCooker] = useState(false);

  const [applianceFridge, setApplianceFridge] = useState("built-in"); // built-in, single, double, none
  const [applianceOven, setApplianceOven] = useState("single"); // single, double, steam, none
  const [applianceCooker, setApplianceCooker] = useState("induction"); // induction, gas, electric, none
  const [applianceHood, setApplianceHood] = useState("wall"); // wall, ceiling, integrated, none
  const [applianceDishwasher, setApplianceDishwasher] = useState("hidden"); // hidden, visible, none

  const [sinkType, setSinkType] = useState("double-bowl"); // single-bowl, double-bowl, farmhouse, black, steel
  const [sinkPosition, setSinkPosition] = useState(0.5); // relative slider along counter length
  const [faucetType, setFaucetType] = useState("gold"); // modern, classic, gold

  const [kitchenCabinetMaterial, setKitchenCabinetMaterial] = useState("wood"); // wood, matte, premium
  const [kitchenCabinetWoodType, setKitchenCabinetWoodType] = useState("oak"); // oak, walnut, ash, pine, teak
  const [kitchenCabinetMatteColor, setKitchenCabinetMatteColor] = useState("white"); // white, black, gray, beige, green, blue
  const [kitchenCabinetPremiumFinish, setKitchenCabinetPremiumFinish] = useState("concrete"); // concrete, stone, marble, glass, metal

  const [wallColor, setWallColor] = useState("#eae6df");
  const [floorColor, setFloorColor] = useState("#d2c8be");
  const [backsplashColor, setBacksplashColor] = useState("#eae6df");
  const [backsplashMaterial, setBacksplashMaterial] = useState("ceramic"); // glass, ceramic, marble, concrete, metal

  const [textureScale, setTextureScale] = useState(1.0);
  const [textureRotation, setTextureRotation] = useState(0);
  const [glossLevel, setGlossLevel] = useState(0.5);
  const [roughnessVal, setRoughnessVal] = useState(0.5);
  const [bumpStrength, setBumpStrength] = useState(0.5);

  const [applianceSink, setApplianceSink] = useState("yes"); // yes, none
  const [showWalls, setShowWalls] = useState(false); // toggle room walls in kitchen view
  const [activeKitchenSection, setActiveKitchenSection] = useState("back"); // left, back, right, island

  const [kitchenModules, setKitchenModules] = useState([
    // Left Wall
    { id: "l-base-1", section: "left", type: "base", subType: "sink", width: 0.60, label: "Sink Base 60cm" },
    { id: "l-base-2", section: "left", type: "base", subType: "standard", width: 0.60, label: "Base Drawer 60cm" },
    { id: "l-base-3", section: "left", type: "base", subType: "standard", width: 0.40, label: "Base Drawer 40cm" },
    { id: "l-wall-1", section: "left", type: "wall", subType: "standard", width: 0.60, label: "Wall Cabinet 60cm" },
    { id: "l-wall-2", section: "left", type: "wall", subType: "glass-door", width: 0.60, label: "Wall Glass 60cm" },

    // Back Wall
    { id: "b-base-1", section: "back", type: "base", subType: "standard", width: 0.60, label: "Base Cabinet 60cm" },
    { id: "b-base-2", section: "back", type: "base", subType: "cooker", width: 0.60, label: "Cooker Base 60cm" },
    { id: "b-base-3", section: "back", type: "base", subType: "standard", width: 0.60, label: "Base Cabinet 60cm" },
    { id: "b-wall-1", section: "back", type: "wall", subType: "open-shelf", width: 0.60, label: "Open Shelf 60cm" },
    { id: "b-wall-2", section: "back", type: "wall", subType: "standard", width: 0.60, label: "Wall Cabinet 60cm" },

    // Right Wall
    { id: "r-base-1", section: "right", type: "base", subType: "standard", width: 0.60, label: "Base Cabinet 60cm" },
    { id: "r-tall-1", section: "right", type: "tall", subType: "oven-tower", width: 0.60, label: "Oven Tower 60cm" },
    { id: "r-tall-2", section: "right", type: "tall", subType: "pantry", width: 0.60, label: "Pantry Tower 60cm" }
  ]);

  const handleUpdateModuleWidth = (id, newW) => {
    setKitchenModules(prev => prev.map(m => m.id === id ? { ...m, width: parseFloat(newW) } : m));
  };

  const handleUpdateModuleSubType = (id, newSub) => {
    setKitchenModules(prev => prev.map(m => m.id === id ? { ...m, subType: newSub } : m));
  };

  const handleDeleteModule = (id) => {
    setKitchenModules(prev => prev.filter(m => m.id !== id));
    triggerNotification("Module removed");
  };

  const handleMoveModule = (index, direction) => {
    const activeSectionModules = kitchenModules.filter(m => m.section === activeKitchenSection);
    if (index + direction < 0 || index + direction >= activeSectionModules.length) return;
    
    // Swap in activeSectionModules
    const updatedSection = [...activeSectionModules];
    const temp = updatedSection[index];
    updatedSection[index] = updatedSection[index + direction];
    updatedSection[index + direction] = temp;

    // Merge back, keeping other sections intact
    const otherSections = kitchenModules.filter(m => m.section !== activeKitchenSection);
    setKitchenModules([...otherSections, ...updatedSection]);
    triggerNotification("Module reordered");
  };

  const handleAddKitchenModule = (type, subType, width) => {
    const newId = `m-${Date.now()}`;
    const newMod = {
      id: newId,
      section: activeKitchenSection,
      type,
      subType,
      width,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${subType.charAt(0).toUpperCase() + subType.slice(1)}`
    };
    setKitchenModules(prev => [...prev, newMod]);
    triggerNotification(`Added ${newMod.label}`);
  };

  // ─── Office Designer States ───
  const [officeLayoutType, setOfficeLayoutType] = useState("executive"); // executive, home, study, workspace
  const [officeRoomWidth, setOfficeRoomWidth] = useState(3.6);
  const [officeRoomLength, setOfficeRoomLength] = useState(3.0);
  const [officeRoomHeight, setOfficeRoomHeight] = useState(2.7);

  // Feature Wall
  const [officeFeatureWallStyle, setOfficeFeatureWallStyle] = useState("wood-slat"); // wood-slat, marble, painted, concrete, wallpaper, acoustic
  const [officeFeatureWallWidth, setOfficeFeatureWallWidth] = useState(2.4);
  const [officeFeatureWallHeight, setOfficeFeatureWallHeight] = useState(2.7);
  const [officeFeatureWallThickness, setOfficeFeatureWallThickness] = useState(0.08);
  const [officeFeatureWallColor, setOfficeFeatureWallColor] = useState("walnut"); // oak, walnut, charcoal, beige, sage
  const [officeFeatureWallSlatSpacing, setOfficeFeatureWallSlatSpacing] = useState(0.06);

  // Cabinet & Shelf Modules
  const [officeCabinets, setOfficeCabinets] = useState([
    { id: "oc-1", type: "tall", subType: "bookshelf", width: 0.8, height: 2.2, depth: 0.4, color: "walnut", doorType: "glass" },
    { id: "oc-2", type: "floor", subType: "storage", width: 0.6, height: 0.8, depth: 0.4, color: "walnut", doorType: "solid" },
    { id: "oc-3", type: "wall", subType: "display", width: 0.6, height: 0.8, depth: 0.3, color: "walnut", doorType: "open" },
    { id: "oc-4", type: "shelves", subType: "led-shelf", width: 0.8, height: 1.6, depth: 0.35, color: "charcoal", shelfCount: 3 }
  ]);
  const [selectedOfficeCabinetId, setSelectedOfficeCabinetId] = useState(null);

  // Desk System
  const [officeDeskType, setOfficeDeskType] = useState("executive"); // executive, l-shape, u-shape, floating, compact
  const [officeDeskWidth, setOfficeDeskWidth] = useState(1.8);
  const [officeDeskDepth, setOfficeDeskDepth] = useState(0.85);
  const [officeDeskHeight, setOfficeDeskHeight] = useState(0.76);
  const [officeDeskTopThickness, setOfficeDeskTopThickness] = useState(0.04);
  const [officeDeskTopMaterial, setOfficeDeskTopMaterial] = useState("marble"); // wood, marble, quartz, glass, concrete, metal
  const [officeDeskTopColor, setOfficeDeskTopColor] = useState("white"); // oak, walnut, white, black, gray
  const [officeDeskDrawerPos, setOfficeDeskDrawerPos] = useState("left"); // left, right, center, dual, none
  const [officeDeskDrawerCount, setOfficeDeskDrawerCount] = useState(3);
  const [officeDeskDrawersOpen, setOfficeDeskDrawersOpen] = useState(false);
  const [officeDeskLockOption, setOfficeDeskLockOption] = useState(false);

  // Chair System
  const [officeChairType, setOfficeChairType] = useState("executive"); // executive, visitor
  const [officeChairColor, setOfficeChairColor] = useState("black"); // black, brown, gray, cream, red, blue
  const [officeChairMaterial, setOfficeChairMaterial] = useState("leather"); // leather, fabric, mesh
  const [officeChairHeight, setOfficeChairHeight] = useState(0.95);
  const [officeChairFrame, setOfficeChairFrame] = useState("chrome"); // chrome, black, silver

  // Tech & Decor Libraries (active elements toggles)
  const [officeTechItems, setOfficeTechItems] = useState(["laptop", "pc", "monitor", "speakers"]);
  const [officeDecorItems, setOfficeDecorItems] = useState(["books", "plant", "award", "lamp"]);

  // Flooring System
  const [officeFlooringType, setOfficeFlooringType] = useState("wood"); // wood, herringbone, marble, porcelain, concrete, carpet, rug
  const [officeFlooringColor, setOfficeFlooringColor] = useState("oak");
  const [officeFlooringScale, setOfficeFlooringScale] = useState(1.0);
  const [officeFlooringGloss, setOfficeFlooringGloss] = useState(0.45);

  // Lighting System
  const [officeLightingType, setOfficeLightingType] = useState("spotlights"); // spotlights, linear, track, cove, wall
  const [officeLightingBrightness, setOfficeLightingBrightness] = useState(1.0);
  const [officeLightingColorTemp, setOfficeLightingColorTemp] = useState("warm"); // warm, cool, neutral
  const [officeShelvesLEDPosition, setOfficeShelvesLEDPosition] = useState("back"); // top, bottom, back, sides, off
  const [officeShelvesLEDBrightness, setOfficeShelvesLEDBrightness] = useState(0.8);

  // Generic selected 3D item states for viewport edit actions
  const [selectedOfficeObject, setSelectedOfficeObject] = useState(null); // metadata of selected object
  const [officeCustomObjects, setOfficeCustomObjects] = useState([]);

  // Office state handlers
  const handleUpdateOfficeCabinetWidth = (id, w) => {
    setOfficeCabinets(prev => prev.map(c => c.id === id ? { ...c, width: parseFloat(w) } : c));
  };
  const handleUpdateOfficeCabinetHeight = (id, h) => {
    setOfficeCabinets(prev => prev.map(c => c.id === id ? { ...c, height: parseFloat(h) } : c));
  };
  const handleUpdateOfficeCabinetDepth = (id, d) => {
    setOfficeCabinets(prev => prev.map(c => c.id === id ? { ...c, depth: parseFloat(d) } : c));
  };
  const handleUpdateOfficeCabinetDoor = (id, door) => {
    setOfficeCabinets(prev => prev.map(c => c.id === id ? { ...c, doorType: door } : c));
  };
  const handleDeleteOfficeCabinet = (id) => {
    setOfficeCabinets(prev => prev.filter(c => c.id !== id));
    triggerNotification("Office cabinet removed");
  };
  const handleAddOfficeCabinet = (type, subType, width) => {
    const newId = `oc-${Date.now()}`;
    const newMod = {
      id: newId,
      type,
      subType,
      width,
      height: type === "tall" ? 2.2 : type === "floor" ? 0.8 : 0.8,
      depth: type === "wall" ? 0.3 : 0.4,
      color: "walnut",
      doorType: type === "shelves" ? "open" : "solid",
      shelfCount: 3
    };
    setOfficeCabinets(prev => [...prev, newMod]);
    triggerNotification("Added Office Cabinet module");
  };

  // References for ThreeJS instances to communicate with React handlers
  const appRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    sph: { t: 0.38, p: 1.25, r: 5.6 },
    TARGET: new THREE.Vector3(0, 1.3, 0),
    root: null,
    selectables: [],
    doorPivots: [],
    drawerPivots: [],
    shelvesMeshes: [],
    doorFrameMeshes: [],
    hangerRodMeshes: [],
    shelfLEDStrips: [],
    doorHandleMeshes: [],
    drawerHandleMeshes: [],
    ledMesh: null,
    ledLight: null,
    doorsOpen: false,
    drawersAllOpen: false,
    currentDoorStyle: 'solid',
    M: {
      body:        new THREE.MeshStandardMaterial({ color: 0x282422, roughness: 0.80, metalness: 0.04 }),
      door:        new THREE.MeshStandardMaterial({ color: 0xBCB8B0, roughness: 0.92, metalness: 0.00 }),
      drawerFront: new THREE.MeshStandardMaterial({ color: 0xBCB8B0, roughness: 0.92, metalness: 0.00 }),
      doorFrame:   new THREE.MeshStandardMaterial({ color: 0x1A1818, roughness: 0.22, metalness: 0.88 }),
      handle:      new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.45, metalness: 0.30 }),
      plinth:      new THREE.MeshStandardMaterial({ color: 0x1E1C1A, roughness: 0.85, metalness: 0.04 }),
      rod:         new THREE.MeshStandardMaterial({ color: 0xC0C0C0, roughness: 0.15, metalness: 0.90 }),
      led:         new THREE.MeshStandardMaterial({ color: 0xFFDD88, emissive: new THREE.Color(0xFFDD88), emissiveIntensity: 0 }),
    }
  });

  // Display toast alerts
  const triggerNotification = useCallback((msg) => {
    setNotifText(msg);
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 2400);
  }, []);

  const triggerHud = useCallback((msg) => {
    setHudText(msg);
    setShowHud(true);
    setTimeout(() => setShowHud(false), 2200);
  }, []);

  // Helper: restore door style state after wardrobe rebuild
  const _restoreDoorStyleWardrobe = (app) => {
    const style = app.currentDoorStyle || 'solid';
    const isFramed = style !== 'solid';
    app.doorPivots.forEach(dp => {
      if (dp.solidPanel) dp.solidPanel.visible = !isFramed;
      if (dp.glassPanel) dp.glassPanel.visible = isFramed;
      if (dp.frameParts) dp.frameParts.forEach(f => f.visible = isFramed);
    });
    if (isFramed) {
      if (style === 'glass') {
        app.M.door.color.setHex(0xD0ECFC); app.M.door.roughness = 0.04; app.M.door.metalness = 0.04;
        app.M.door.transparent = true; app.M.door.opacity = 0.16;
      } else if (style === 'mirror') {
        app.M.door.color.setHex(0xCCDCEE); app.M.door.roughness = 0.01; app.M.door.metalness = 0.96;
        app.M.door.transparent = false; app.M.door.opacity = 1;
      } else if (style === 'frosted') {
        app.M.door.color.setHex(0xDCE8F4); app.M.door.roughness = 0.58; app.M.door.metalness = 0.0;
        app.M.door.transparent = true; app.M.door.opacity = 0.48;
      }
      app.M.door.needsUpdate = true;
    }
  };

  // Helper: apply LED mode to shelf strips + point light
  const _applyLEDstate = (app, mode) => {
    const cols = { off: 0xFFDD88, warm: 0xFFCC44, cool: 0x88AAFF, rgb: 0xFF55BB };
    const emI  = { off: 0, warm: 2.2, cool: 2.0, rgb: 2.5 };
    const lInt = { off: 0, warm: 1.0, cool: 0.8, rgb: 1.3 };
    if (app.ledLight) {
      app.ledLight.color.setHex(cols[mode]);
      app.ledLight.intensity = lInt[mode] * 0.7;
    }
    if (app.shelfLEDStrips) {
      app.shelfLEDStrips.forEach(sl => {
        sl.visible = mode !== 'off';
        sl.material.color.setHex(cols[mode]);
        sl.material.emissive.setHex(cols[mode]);
        sl.material.emissiveIntensity = emI[mode];
        sl.material.needsUpdate = true;
      });
    }
  };

const buildWardrobe = useCallback(() => {
    const app = appRef.current;
    if (!app.root) return;

    // Clear previous geometries
    while (app.root.children.length) {
      app.root.remove(app.root.children[0]);
    }
    app.selectables = [];
    app.doorPivots = [];
    app.drawerPivots = [];
    app.shelvesMeshes = [];
    app.doorFrameMeshes = [];
    app.hangerRodMeshes = [];
    app.shelfLEDStrips = [];
    app.doorHandleMeshes = [];
    app.drawerHandleMeshes = [];

    const W = width;
    const H = height;
    const D = depth;
    const T = 0.022;
    const PL = 0.09;
    const FT = 0.04;
    const FH = 0.07;
    const GAP = 0.004;

    const ROW_H = 0.205;
    const EXT_DH = extDrawerRows * ROW_H;
    const SLIDE_OUT = D * 0.74;

    const DOOR_H = H - PL - T - EXT_DH;
    const DOOR_Y = PL + T + EXT_DH + DOOR_H / 2;
    const DOOR_Z = D / 2 + T / 2;

    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const mesh = (geo, mat, x, y, z, name) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      m.name = name || "";
      return m;
    };

    const addBody = (w, h, d, x, y, z, n) => {
      const m = mesh(box(w, h, d), app.M.body, x, y, z, n);
      m.userData.group = "body";
      app.root.add(m);
      app.selectables.push(m);
      return m;
    };

    const BODY_H = H - PL;
    addBody(W, BODY_H, T, 0, PL + BODY_H / 2, -(D / 2 - T / 2), "back");
    addBody(T, BODY_H, D, -(W / 2 - T / 2), PL + BODY_H / 2, 0, "sideL");
    addBody(T, BODY_H, D, (W / 2 - T / 2), PL + BODY_H / 2, 0, "sideR");
    addBody(W, T, D, 0, H - T / 2, 0, "top");

    const plinth = mesh(box(W, PL, D - 0.06), app.M.plinth, 0, PL / 2, 0.01, "plinth");
    plinth.userData.group = "plinth";
    app.root.add(plinth);
    app.selectables.push(plinth);

    if (extDrawerRows > 0) {
      const sep = mesh(box(W - T * 2, T * 0.8, D - T), app.M.body, 0, PL + T + EXT_DH, 0, "sepH");
      sep.userData.group = "body";
      app.root.add(sep);
    }

    const cols = sections;
    const dW = (W - T * 2 - GAP * (cols + 1)) / cols;
    const drawerIntMat = new THREE.MeshStandardMaterial({ color: 0xC8B898, roughness: 0.82, metalness: 0.0 });
    const WT = 0.014;

    for (let row = 0; row < extDrawerRows; row++) {
      const cy = PL + T + row * ROW_H + ROW_H / 2;
      for (let col = 0; col < cols; col++) {
        const cx = -W / 2 + T + GAP + col * (dW + GAP) + dW / 2;
        const dg = new THREE.Group();
        dg.position.set(cx, cy, 0);
        dg.userData.isDrawerGroup = true;

        const frontZ = D / 2 + T / 2;
        const boxD = D - T * 2.0;
        const trayW = dW - GAP * 2;
        const trayH = ROW_H - GAP * 2;
        const backZ = frontZ - T - boxD;
        const midZ = frontZ - T / 2 - boxD / 2;

        const dFront = mesh(box(trayW, trayH, T), app.M.drawerFront, 0, 0, frontZ, `dFront_r${row}_c${col}`);
        dFront.userData.group = "ext-drawer";
        dFront.userData.drawerGroup = dg;
        dg.add(dFront);
        app.selectables.push(dFront);

        dg.add(Object.assign(mesh(box(WT, trayH, boxD), drawerIntMat, -(trayW / 2 - WT / 2), 0, midZ), { userData: { group: "body" } }));
        dg.add(Object.assign(mesh(box(WT, trayH, boxD), drawerIntMat, (trayW / 2 - WT / 2), 0, midZ), { userData: { group: "body" } }));
        dg.add(Object.assign(mesh(box(trayW - WT * 2, WT, boxD), drawerIntMat, 0, -(trayH / 2 - WT / 2), midZ), { userData: { group: "body" } }));
        dg.add(Object.assign(mesh(box(trayW - WT * 2, trayH - WT, WT), drawerIntMat, 0, WT / 2, backZ), { userData: { group: "body" } }));

        const dHandle = mesh(box(trayW * 0.44, 0.022, 0.026), app.M.handle, 0, 0, frontZ + T / 2 + 0.016, `dHandle_r${row}_c${col}`);
        dHandle.userData.group = "handles";
        dHandle.userData.kind = "drawer";
        dHandle.userData.baseZ = frontZ + T / 2 + 0.016;
        dHandle.userData.barW = trayW * 0.44;
        dg.add(dHandle);
        app.selectables.push(dHandle);
        app.drawerHandleMeshes.push(dHandle);

        app.root.add(dg);
        app.drawerPivots.push({ group: dg, targetZ: 0, openZ: SLIDE_OUT, open: false, row, col });
      }

      if (row < extDrawerRows - 1) {
        const ds = mesh(box(W - T * 2, T * 0.5, T), app.M.plinth, 0, PL + T + (row + 1) * ROW_H, D / 2 + T * 0.25, "drDiv" + row);
        ds.userData.group = "body";
        app.root.add(ds);
      }
      for (let c = 1; c < cols; c++) {
        const vx = -W / 2 + T + GAP + c * (dW + GAP) - GAP / 2;
        const vcd = mesh(box(T * 0.6, ROW_H - GAP, T), app.M.plinth, vx, PL + T + row * ROW_H + ROW_H / 2, D / 2 + T * 0.3, `drVDiv_r${row}_c${c}`);
        vcd.userData.group = "body";
        app.root.add(vcd);
      }
    }

    // ─── DOORS (metallic frames + glass/mirror panel support) ───
    const doorW = (W - T * 2 - GAP * (sections + 1)) / sections;
    const FW = 0.028;
    const dH_inner = DOOR_H - GAP * 2;

    for (let i = 0; i < sections; i++) {
      const leftHinge = (i % 2 === 0);
      const slotLeft = -W / 2 + T + GAP + i * (doorW + GAP);
      const hingeX = leftHinge ? slotLeft : slotLeft + doorW;
      const dmOffX = leftHinge ? doorW / 2 : -doorW / 2;

      const pivot = new THREE.Group();
      pivot.position.set(hingeX, DOOR_Y, DOOR_Z);

      // Solid panel
      const solidPanel = mesh(box(doorW, dH_inner, T), app.M.door, dmOffX, 0, 0, "door" + i);
      solidPanel.userData.group = "doors";
      pivot.add(solidPanel);
      app.selectables.push(solidPanel);

      // Glass panel (inside frame)
      const gpW = doorW - FW * 2;
      const gpH = dH_inner - FW * 2;
      const glassPanel = mesh(box(gpW, gpH, T * 0.85), app.M.door, dmOffX, 0, -T * 0.08, "doorG" + i);
      glassPanel.userData.group = "doors";
      glassPanel.visible = false;
      pivot.add(glassPanel);
      app.selectables.push(glassPanel);

      // Metallic border frame (4 strips, hidden until framed style)
      const fp = [
        mesh(box(doorW, FW, T * 1.05), app.M.doorFrame, dmOffX,                    dH_inner / 2 - FW / 2, 0, "fT" + i),
        mesh(box(doorW, FW, T * 1.05), app.M.doorFrame, dmOffX,                   -dH_inner / 2 + FW / 2, 0, "fB" + i),
        mesh(box(FW, dH_inner, T * 1.05), app.M.doorFrame, dmOffX - doorW / 2 + FW / 2, 0,                0, "fL" + i),
        mesh(box(FW, dH_inner, T * 1.05), app.M.doorFrame, dmOffX + doorW / 2 - FW / 2, 0,                0, "fR" + i),
      ];
      fp.forEach(f => { f.userData.group = "door-frame"; f.visible = false; pivot.add(f); app.doorFrameMeshes.push(f); });

      // Door handle bar
      const hx = leftHinge ? doorW * 0.72 : -doorW * 0.72;
      const hBar = mesh(new THREE.BoxGeometry(0.022, 0.20, 0.028), app.M.handle, dmOffX + (leftHinge ? hx - dmOffX : hx - dmOffX), 0, T / 2 + 0.018, "handle" + i);
      hBar.userData.group = "handles";
      hBar.userData.kind = "door";
      hBar.userData.baseX = hx;
      hBar.userData.baseZ = T / 2 + 0.018;
      if (handleStyle === "hidden") hBar.visible = false;
      pivot.add(hBar);
      app.selectables.push(hBar);
      app.doorHandleMeshes.push(hBar);

      app.root.add(pivot);
      const openDir = leftHinge ? -Math.PI / 2 : Math.PI / 2;
      app.doorPivots.push({ pivot, target: app.doorsOpen ? openDir : 0, openDir, i, solidPanel, glassPanel, frameParts: fp });
      if (app.doorsOpen) pivot.rotation.y = openDir;

      // Hanger rods
      if (hangerRods) {
        const scx = slotLeft + doorW / 2;
        const rodY = PL + T + EXT_DH + DOOR_H * 0.80;
        const rodW = doorW - T * 1.6;
        const rod = mesh(new THREE.BoxGeometry(rodW, 0.016, 0.016), app.M.rod, scx, rodY, 0, "rod" + i);
        rod.userData.group = "rod";
        app.root.add(rod);
        app.hangerRodMeshes.push(rod);
        [-1, 1].forEach(s => {
          const br = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.055, 0.022), app.M.rod);
          br.position.set(scx + s * (rodW / 2 + 0.011), rodY + 0.028, 0);
          br.castShadow = true;
          br.userData = { group: "rod" };
          app.root.add(br);
          app.hangerRodMeshes.push(br);
        });
      }
    }

    // Vertical dividers between door slots
    for (let i = 1; i < sections; i++) {
      const vx = -W / 2 + T + GAP + i * (doorW + GAP) - GAP / 2;
      const vd = mesh(box(T * 0.8, DOOR_H, D - T * 0.5), app.M.body, vx, DOOR_Y, -T * 0.2, "vdiv" + i);
      vd.userData.group = "body";
      app.root.add(vd);
    }

    // ─── INTERIOR SHELVES (always visible, split with LED channel) ───
    const shelfMat = new THREE.MeshStandardMaterial({ color: app.M.body.color.getHex(), roughness: 0.78, metalness: 0.03 });
    const innerW = W - T * 2 - 0.008;
    const innerD = D - T * 1.5;
    const LEDC = 0.024;
    const halfD = (innerD - LEDC) / 2;

    for (let i = 1; i <= 4; i++) {
      const sy = PL + T + EXT_DH + DOOR_H * (i / 5);

      const smF = mesh(box(innerW, T, halfD), shelfMat, 0, sy, halfD / 2 + LEDC / 2, "shelf" + i + "F");
      smF.userData.group = "shelf";
      app.root.add(smF);
      app.shelvesMeshes.push(smF);

      const smB = mesh(box(innerW, T, halfD), shelfMat.clone(), 0, sy, -(halfD / 2 + LEDC / 2), "shelf" + i + "B");
      smB.userData.group = "shelf";
      app.root.add(smB);
      app.shelvesMeshes.push(smB);

      // Per-shelf LED strip in the channel gap
      const slMat = new THREE.MeshStandardMaterial({ color: 0xFFDD88, emissive: new THREE.Color(0xFFDD88), emissiveIntensity: 0 });
      const sl = mesh(new THREE.BoxGeometry(innerW, T * 0.35, LEDC), slMat, 0, sy - T * 0.5 + T * 0.175, 0, "shelfLED" + i);
      sl.userData.group = "shelf-led";
      sl.visible = false;
      app.root.add(sl);
      app.shelfLEDStrips.push(sl);
    }

    // LED point light
    app.ledLight = new THREE.PointLight(0xFFDD88, 0, 4);
    app.ledLight.position.set(0, PL + T + EXT_DH + DOOR_H * 0.3, D / 2 + 0.1);
    app.root.add(app.ledLight);

    // Apply LED + door style state
    _applyLEDstate(app, ledLighting);
    _restoreDoorStyleWardrobe(app);

  }, [width, height, depth, sections, extDrawerRows, hangerRods, handleStyle, ledLighting]);

  // ─── 3D KITCHEN MESH GENERATOR ───
  const buildKitchen = useCallback(() => {
    const app = appRef.current;
    if (!app.root) return;

    // Clear previous geometries
    while (app.root.children.length) {
      app.root.remove(app.root.children[0]);
    }
    app.selectables = [];
    app.doorPivots = [];
    app.drawerPivots = [];
    app.shelvesMeshes = [];

    // Helper functions for ThreeJS meshes
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const mesh = (geo, mat, x, y, z, name) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      m.name = name || "";
      return m;
    };

    // --- Materials Definitions ---
    // Cabinet Body / Doors
    let cabColor = 0xA07040; // Oak
    let cabinetRoughness = roughnessVal;
    let cabinetMetalness = glossLevel * 0.15;
    let cabinetTransparent = false;
    let cabinetOpacity = 1.0;

    if (kitchenCabinetMaterial === "wood") {
      if (kitchenCabinetWoodType === "oak") cabColor = 0xA07040;
      else if (kitchenCabinetWoodType === "walnut") cabColor = 0x3D2010;
      else if (kitchenCabinetWoodType === "ash") cabColor = 0xD4C5A8;
      else if (kitchenCabinetWoodType === "pine") cabColor = 0xC8B080;
      else if (kitchenCabinetWoodType === "teak") cabColor = 0x8C5220;
    } else if (kitchenCabinetMaterial === "matte") {
      if (kitchenCabinetMatteColor === "white") cabColor = 0xF2EDE6;
      else if (kitchenCabinetMatteColor === "black") cabColor = 0x1C1C1C;
      else if (kitchenCabinetMatteColor === "gray") cabColor = 0x7E7E7E;
      else if (kitchenCabinetMatteColor === "beige") cabColor = 0xD4C5A8;
      else if (kitchenCabinetMatteColor === "green") cabColor = 0x506655;
      else if (kitchenCabinetMatteColor === "blue") cabColor = 0x2A3E50;
    } else if (kitchenCabinetMaterial === "premium") {
      if (kitchenCabinetPremiumFinish === "concrete") { cabColor = 0x8E8E8E; cabinetRoughness = 0.85; cabinetMetalness = 0.05; }
      else if (kitchenCabinetPremiumFinish === "stone") { cabColor = 0x4E4D4A; cabinetRoughness = 0.80; cabinetMetalness = 0.05; }
      else if (kitchenCabinetPremiumFinish === "marble") { cabColor = 0xEEEEEC; cabinetRoughness = 0.15; cabinetMetalness = 0.15; }
      else if (kitchenCabinetPremiumFinish === "glass") { cabColor = 0xDDEEFF; cabinetRoughness = 0.10; cabinetMetalness = 0.85; cabinetTransparent = true; cabinetOpacity = 0.4; }
      else if (kitchenCabinetPremiumFinish === "metal") { cabColor = 0x7A7A7F; cabinetRoughness = 0.25; cabinetMetalness = 0.85; }
    }

    const mCabinet = new THREE.MeshStandardMaterial({
      color: cabColor,
      roughness: cabinetRoughness,
      metalness: cabinetMetalness,
      transparent: cabinetTransparent,
      opacity: cabinetOpacity,
    });

    // Countertop
    let counterRoughness = 0.1;
    let counterMetal = 0.05;
    if (countertopMaterial === "marble") { counterRoughness = 0.1; }
    else if (countertopMaterial === "quartz") { counterRoughness = 0.12; }
    else if (countertopMaterial === "granite") { counterRoughness = 0.25; }
    else if (countertopMaterial === "concrete") { counterRoughness = 0.75; }
    else if (countertopMaterial === "wood") { counterRoughness = 0.6; }
    else if (countertopMaterial === "ceramic") { counterRoughness = 0.05; }

    const mCountertop = new THREE.MeshStandardMaterial({
      color: new THREE.Color(countertopColor === "white" ? 0xf5f5f5 : countertopColor),
      roughness: counterRoughness,
      metalness: counterMetal,
    });

    // Backsplash
    let bsColor = new THREE.Color(backsplashColor);
    let bsRoughness = 0.25;
    let bsMetal = 0.1;
    let bsTransparent = false;
    let bsOpacity = 1.0;

    if (backsplashMaterial === "glass") { bsColor.setHex(0xddeeff); bsRoughness = 0.05; bsMetal = 0.95; bsTransparent = true; bsOpacity = 0.6; }
    else if (backsplashMaterial === "ceramic") { bsRoughness = 0.15; bsMetal = 0.1; }
    else if (backsplashMaterial === "marble") { bsColor.setHex(0xf0efe9); bsRoughness = 0.2; bsMetal = 0.05; }
    else if (backsplashMaterial === "concrete") { bsColor.setHex(0x8e8e8e); bsRoughness = 0.85; bsMetal = 0.0; }
    else if (backsplashMaterial === "metal") { bsColor.setHex(0xaaaaaa); bsRoughness = 0.3; bsMetal = 0.85; }

    const mBacksplash = new THREE.MeshStandardMaterial({
      color: bsColor,
      roughness: bsRoughness,
      metalness: bsMetal,
      transparent: bsTransparent,
      opacity: bsOpacity,
    });

    const mWall = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.9,
    });

    const mFloor = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.6,
    });

    const mSteel = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.18, metalness: 0.85 });
    const mDarkSteel = new THREE.MeshStandardMaterial({ color: 0x2e2e2e, roughness: 0.35, metalness: 0.7 });
    const mGlass = new THREE.MeshStandardMaterial({ color: 0xddeeff, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.1 });
    
    let handleColor = 0xd4af37; // Gold
    if (kitchenHandleType === "silver") handleColor = 0xcccccc;
    else if (kitchenHandleType === "black") handleColor = 0x111111;
    else if (kitchenHandleType === "chrome") handleColor = 0xffffff;
    const mHandle = new THREE.MeshStandardMaterial({ color: handleColor, roughness: 0.2, metalness: 0.85 });

    // --- Build Room Shell ---
    const RW = roomWidth;
    const RL = roomLength;
    const RH = roomHeight;

    // Floor (always visible)
    const floorMesh = mesh(box(RW, 0.02, RL), mFloor, 0, -0.01, 0, "floor");
    app.root.add(floorMesh);

    // Backsplash (always visible — it sits directly behind the countertop)
    const backsplash = mesh(box(RW - 0.02, 0.6, 0.01), mBacksplash, 0, baseCabinetHeight + 0.3, -RL / 2 + 0.025, "backsplash");
    app.root.add(backsplash);

    // Room Walls — only rendered when showWalls is enabled
    if (showWalls) {
      // Back Wall
      const backWall = mesh(box(RW, RH, 0.04), mWall, 0, RH / 2, -RL / 2, "backWall");
      app.root.add(backWall);

      // Left Wall with window
      const leftWallUpper = mesh(box(0.04, RH - 1.4, RL), mWall, -RW / 2, 1.4 + (RH - 1.4) / 2, 0, "leftWallUpper");
      const leftWallLower = mesh(box(0.04, 0.8, RL), mWall, -RW / 2, 0.4, 0, "leftWallLower");
      const leftWallSideL = mesh(box(0.04, 0.6, RL * 0.3), mWall, -RW / 2, 1.1, -RL * 0.35, "leftWallSideL");
      const leftWallSideR = mesh(box(0.04, 0.6, RL * 0.3), mWall, -RW / 2, 1.1, RL * 0.35, "leftWallSideR");
      app.root.add(leftWallUpper, leftWallLower, leftWallSideL, leftWallSideR);

      // Window Frame & Glass
      const winFrame = mesh(box(0.06, 0.6, RL * 0.4), mDarkSteel, -RW / 2 + 0.01, 1.1, 0, "winFrame");
      const winGlass = mesh(box(0.01, 0.56, RL * 0.38), mGlass, -RW / 2 + 0.01, 1.1, 0, "winGlass");
      app.root.add(winFrame, winGlass);

      // Right Wall
      const rightWall = mesh(box(0.04, RH, RL), mWall, RW / 2, RH / 2, 0, "rightWall");
      app.root.add(rightWall);
    }

    // --- Placements calculation ---
    const cabD = baseCabinetDepth;
    const cabH = baseCabinetHeight;
    const pldH = toeKickHeight;
    const cabBoxH = cabH - pldH;
    const margin = 0.01;

    // Helper: Add cabinet from module spec
    const addCabinetModule = (x, z, angle, width, type, subType) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = angle;

      const isTall = type === "tall";
      const currentH = isTall ? roomHeight * 0.8 : cabH;
      const currentBoxH = currentH - pldH;

      // Plinth (toe kick)
      const plinth = mesh(box(width - 0.01, pldH, cabD - 0.04), mCabinet, 0, pldH / 2, 0.02, "plinth");
      plinth.material = plinth.material.clone();
      plinth.material.color.multiplyScalar(0.7); // make plinth darker
      g.add(plinth);

      // Main Cabinet Box
      const cabinetBox = mesh(box(width - 0.002, currentBoxH, cabD - 0.01), mCabinet, 0, pldH + currentBoxH / 2, -0.005, "cabBox");
      g.add(cabinetBox);
      app.selectables.push(cabinetBox);

      if (isTall) {
        if (subType === "oven-tower") {
          // Double oven space mid-level
          const lowerDoor = mesh(box(width - 0.004, currentBoxH * 0.3, 0.02), mCabinet, 0, pldH + (currentBoxH * 0.3) / 2, cabD / 2 - 0.01, "tallDoorLower");
          g.add(lowerDoor);
          app.selectables.push(lowerDoor);

          // Oven slot
          const ovenSlot = mesh(box(width - 0.04, currentBoxH * 0.3, cabD - 0.04), mDarkSteel, 0, pldH + currentBoxH * 0.3 + (currentBoxH * 0.3) / 2, 0, "ovenSlot");
          const ovenGlass = mesh(box(width - 0.06, currentBoxH * 0.26, 0.02), mGlass, 0, pldH + currentBoxH * 0.3 + (currentBoxH * 0.3) / 2, cabD / 2 - 0.008, "ovenGlass");
          g.add(ovenSlot, ovenGlass);

          // Upper door
          const upperDoor = mesh(box(width - 0.004, currentBoxH * 0.4, 0.02), mCabinet, 0, pldH + currentBoxH * 0.6 + (currentBoxH * 0.4) / 2, cabD / 2 - 0.01, "tallDoorUpper");
          g.add(upperDoor);
          app.selectables.push(upperDoor);
        } else if (subType === "fridge-housing") {
          // Fridge housing: vertical double doors representing standard built-in fridge
          const doorL = mesh(box(width / 2 - 0.003, currentBoxH - 0.008, 0.02), mCabinet, -width / 4, pldH + currentBoxH / 2, cabD / 2 - 0.01, "fridgeDoorL");
          const doorR = mesh(box(width / 2 - 0.003, currentBoxH - 0.008, 0.02), mCabinet, width / 4, pldH + currentBoxH / 2, cabD / 2 - 0.01, "fridgeDoorR");
          g.add(doorL, doorR);
          app.selectables.push(doorL, doorR);

          if (kitchenHandleType !== "hidden") {
            const hL = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.4, 8), mHandle, -0.04, pldH + currentBoxH / 2, cabD / 2 + 0.008, "tallFridgeHandleL");
            const hR = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.4, 8), mHandle, 0.04, pldH + currentBoxH / 2, cabD / 2 + 0.008, "tallFridgeHandleR");
            g.add(hL, hR);
          }
        } else {
          // Standard tall pantry
          const tallDoor = mesh(box(width - 0.004, currentBoxH - 0.008, 0.02), mCabinet, 0, pldH + currentBoxH / 2, cabD / 2 - 0.01, "tallDoor");
          g.add(tallDoor);
          app.selectables.push(tallDoor);

          // Long bar handle
          if (kitchenHandleType !== "hidden") {
            const hCyl = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.4, 8), mHandle, width / 2 - 0.05, pldH + currentBoxH / 2, cabD / 2 + 0.008, "tallHandle");
            g.add(hCyl);
          }
        }
      } else {
        // Base cabinet
        if (subType === "dishwasher") {
          // Dishwasher panel front
          const dwPanel = mesh(box(width - 0.004, currentBoxH - 0.08, 0.02), mCabinet, 0, pldH + (currentBoxH - 0.08) / 2, cabD / 2 - 0.01, "dwPanel");
          const dwControls = mesh(box(width - 0.04, 0.06, 0.01), mDarkSteel, 0, pldH + currentBoxH - 0.04, cabD / 2 - 0.005, "dwControls");
          g.add(dwPanel, dwControls);
          app.selectables.push(dwPanel);
        } else {
          // Standard Base Cabinet
          const door = mesh(box(width - 0.004, currentBoxH - 0.008, 0.02), mCabinet, 0, pldH + currentBoxH / 2, cabD / 2 - 0.01, "door");
          g.add(door);
          app.selectables.push(door);

          // Draw handle
          if (kitchenHandleType !== "hidden") {
            const bar = mesh(box(0.16, 0.015, 0.018), mHandle, 0, pldH + currentBoxH - 0.06, cabD / 2 + 0.008, "handle");
            g.add(bar);
          }
        }

        // Appliance overlays on top of Base Cabinets
        if (subType === "cooker" && applianceCooker !== "none") {
          const hobY = cabH + countertopThickness + 0.002;
          const hobBase = mesh(box(0.58, 0.004, 0.5), mDarkSteel, 0, hobY, 0, "hobBase");
          g.add(hobBase);

          [-0.14, 0.14].forEach((ox) => {
            [-0.11, 0.11].forEach((oz) => {
              const ring = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.002, 16), mHandle, ox, hobY + 0.001, oz, "hobBurner");
              g.add(ring);
            });
          });

          // Draw Wall Hood vertically aligned above cooker if enabled
          if (applianceHood !== "none") {
            const hoodY = cabH + wallCabinetDistance + 0.1;
            if (applianceHood === "wall") {
              const hoodPyramid = mesh(box(0.6, 0.28, 0.4), mSteel, 0, hoodY + 0.14, -cabD / 2 + 0.2, "hoodBody");
              const chimney = mesh(new THREE.CylinderGeometry(0.08, 0.08, roomHeight - hoodY - 0.28, 12), mSteel, 0, hoodY + 0.28 + (roomHeight - hoodY - 0.28) / 2, -cabD / 2 + 0.1, "chimney");
              g.add(hoodPyramid, chimney);
            }
          }
        }

        if (subType === "sink" && applianceSink !== "none") {
          const sinkY = cabH + countertopThickness + 0.001;
          const sinkDeck = mesh(box(0.5, 0.004, cabD + 0.02), mSteel, 0, sinkY, 0, "sinkDeck");
          g.add(sinkDeck);
          app.selectables.push(sinkDeck);

          if (sinkType === "double-bowl") {
            [-0.11, 0.11].forEach((offset) => {
              const bowl = mesh(box(0.18, 0.002, 0.36), mDarkSteel, 0, sinkY + 0.002, offset, "sinkBowl");
              g.add(bowl);
            });
          } else {
            const bowl = mesh(box(0.38, 0.002, 0.42), mDarkSteel, 0, sinkY + 0.002, 0, "sinkBowl");
            g.add(bowl);
          }

          // Faucet
          const faucetG = new THREE.Group();
          faucetG.position.set(0, sinkY, cabD / 2 - 0.08);
          const fBase = mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.08, 8), mHandle, 0, 0.04, 0, "faucetBase");
          faucetG.add(fBase);
          const fNeck = mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.2, 8), mHandle, 0, 0.16, 0, "faucetNeck");
          const fBend = mesh(box(0.08, 0.018, 0.018), mHandle, -0.03, 0.25, 0, "faucetBend");
          faucetG.add(fNeck, fBend);

          g.add(faucetG);
        }
      }

      app.root.add(g);
    };

    // Helper: Add wall cabinet from module spec
    const addWallCabinetModule = (x, z, angle, width, subType) => {
      if (!wallCabinetsEnabled) return;
      const g = new THREE.Group();
      g.position.set(x, cabH + wallCabinetDistance, z);
      g.rotation.y = angle;

      const wH = wallCabinetHeight;
      const wD = wallCabinetDepth;

      // Cabinet Box
      const cabinetBox = mesh(box(width - 0.002, wH, wD - 0.01), mCabinet, 0, wH / 2, -0.005, "wallCabBox");
      g.add(cabinetBox);
      app.selectables.push(cabinetBox);

      // Doors / interior based on subType
      if (subType === "open-shelf") {
        // Inner shelves visible
        const shelf = mesh(box(width - 0.03, 0.016, wD - 0.03), mCabinet, 0, wH / 2, -0.005, "wallCabShelf");
        g.add(shelf);
      } else if (subType === "glass-door") {
        // Glass door
        const frameL = mesh(box(0.02, wH - 0.004, 0.02), mCabinet, -width / 2 + 0.01, wH / 2, wD / 2 - 0.01, "glassFrameL");
        const frameR = mesh(box(0.02, wH - 0.004, 0.02), mCabinet, width / 2 - 0.01, wH / 2, wD / 2 - 0.01, "glassFrameR");
        const glass = mesh(box(width - 0.04, wH - 0.04, 0.01), mGlass, 0, wH / 2, wD / 2 - 0.01, "glassDoorPanel");
        g.add(frameL, frameR, glass);
      } else if (subType === "lift-up") {
        // Lift-up horizontal divider
        const door = mesh(box(width - 0.004, wH - 0.008, 0.02), mCabinet, 0, wH / 2, wD / 2 - 0.01, "wallDoor");
        const dividerLine = mesh(box(width - 0.02, 0.002, 0.022), mDarkSteel, 0, wH / 2, wD / 2 - 0.005, "liftUpDivider");
        g.add(door, dividerLine);
        app.selectables.push(door);
      } else {
        // Standard wall doors
        const door = mesh(box(width - 0.004, wH - 0.008, 0.02), mCabinet, 0, wH / 2, wD / 2 - 0.01, "wallDoor");
        g.add(door);
        app.selectables.push(door);
      }

      app.root.add(g);
    };

    // Lay out modules sequentially along sections
    const hasLeft = kitchenLayout === "u-shape" || kitchenLayout === "l-shape" || kitchenLayout === "parallel";
    const hasRight = kitchenLayout === "u-shape" || kitchenLayout === "parallel";
    const hasBack = kitchenLayout !== "parallel"; // parallel doesn't have a back wall counter

    // 1. LEFT WALL (along Z-axis)
    if (hasLeft) {
      const leftModules = kitchenModules.filter(m => m.section === "left");
      // base units
      let currentZ = -RL / 2 + cabD;
      leftModules.filter(m => m.type === "base" || m.type === "tall").forEach(m => {
        const cx = -RW / 2 + cabD / 2 + margin;
        const cz = currentZ + m.width / 2;
        addCabinetModule(cx, cz, Math.PI / 2, m.width, m.type, m.subType);
        currentZ += m.width;
      });

      // wall units
      let currentZWall = -RL / 2 + wallCabinetDepth;
      leftModules.filter(m => m.type === "wall").forEach(m => {
        const cx = -RW / 2 + wallCabinetDepth / 2 + margin;
        const cz = currentZWall + m.width / 2;
        addWallCabinetModule(cx, cz, Math.PI / 2, m.width, m.subType);
        currentZWall += m.width;
      });
    }

    // 2. BACK WALL (along X-axis)
    if (hasBack) {
      const backModules = kitchenModules.filter(m => m.section === "back");
      const startX = -RW / 2 + (hasLeft ? cabD : 0);
      
      // base units
      let currentX = startX;
      backModules.filter(m => m.type === "base" || m.type === "tall").forEach(m => {
        const cx = currentX + m.width / 2;
        const cz = -RL / 2 + cabD / 2 + margin;
        addCabinetModule(cx, cz, 0, m.width, m.type, m.subType);
        currentX += m.width;
      });

      // wall units
      let currentXWall = -RW / 2 + (hasLeft ? wallCabinetDepth : 0);
      backModules.filter(m => m.type === "wall").forEach(m => {
        const cx = currentXWall + m.width / 2;
        const cz = -RL / 2 + wallCabinetDepth / 2 + margin;
        addWallCabinetModule(cx, cz, 0, m.width, m.subType);
        currentXWall += m.width;
      });
    }

    // 3. RIGHT WALL (along Z-axis)
    if (hasRight) {
      const rightModules = kitchenModules.filter(m => m.section === "right");
      // base units
      let currentZ = -RL / 2 + cabD;
      rightModules.filter(m => m.type === "base" || m.type === "tall").forEach(m => {
        const cx = RW / 2 - cabD / 2 - margin;
        const cz = currentZ + m.width / 2;
        addCabinetModule(cx, cz, -Math.PI / 2, m.width, m.type, m.subType);
        currentZ += m.width;
      });

      // wall units
      let currentZWall = -RL / 2 + wallCabinetDepth;
      rightModules.filter(m => m.type === "wall").forEach(m => {
        const cx = RW / 2 - wallCabinetDepth / 2 - margin;
        const cz = currentZWall + m.width / 2;
        addWallCabinetModule(cx, cz, -Math.PI / 2, m.width, m.subType);
        currentZWall += m.width;
      });
    }

    // --- Countertops Creation ---
    const buildCountertopSegment = (w, d, h, x, y, z, rotY = 0) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = rotY;

      const ct = mesh(box(w, countertopThickness, d), mCountertop, 0, 0, 0, "countertop");
      g.add(ct);
      app.selectables.push(ct);

      // Waterfall Edge drop-down at exposed side ends
      if (countertopWaterfall) {
        const waterfallPanel = mesh(box(countertopThickness, cabH - countertopThickness / 2, d), mCountertop, -w / 2 + countertopThickness / 2, -(cabH - countertopThickness) / 2 - countertopThickness / 2, 0, "waterfall");
        g.add(waterfallPanel);
        app.selectables.push(waterfallPanel);
      }
      app.root.add(g);
    };

    const ctY = cabH + countertopThickness / 2;

    // Countertops placement corresponding to base modules sum of width
    // Left Countertop
    if (hasLeft) {
      const leftBaseModules = kitchenModules.filter(m => m.section === "left" && m.type === "base");
      const leftW = leftBaseModules.reduce((sum, m) => sum + m.width, 0);
      if (leftW > 0) {
        buildCountertopSegment(leftW + cabD, cabD, ctY, -RW / 2 + cabD / 2 + margin, ctY, -RL / 2 + cabD + leftW / 2 - cabD / 2, Math.PI / 2);
      }
    }

    // Back Countertop
    if (hasBack) {
      const backBaseModules = kitchenModules.filter(m => m.section === "back" && m.type === "base");
      const backW = backBaseModules.reduce((sum, m) => sum + m.width, 0);
      if (backW > 0) {
        const startX = -RW / 2 + (hasLeft ? cabD : 0);
        buildCountertopSegment(backW, cabD, ctY, startX + backW / 2, ctY, -RL / 2 + cabD / 2 + margin);
      }
    }

    // Right Countertop
    if (hasRight) {
      const rightBaseModules = kitchenModules.filter(m => m.section === "right" && m.type === "base");
      const rightW = rightBaseModules.reduce((sum, m) => sum + m.width, 0);
      if (rightW > 0) {
        buildCountertopSegment(rightW + cabD, cabD, ctY, RW / 2 - cabD / 2 - margin, ctY, -RL / 2 + cabD + rightW / 2 - cabD / 2, -Math.PI / 2);
      }
    }

    // --- Kitchen Island (if enabled) ---
    if (islandEnabled) {
      const isX = 0;
      const isZ = 0.4;
      const islandG = new THREE.Group();
      islandG.position.set(isX, 0, isZ);

      // Island base cabinets
      const islandBase = mesh(box(islandWidth, cabBoxH, islandDepth - 0.02), mCabinet, 0, pldH + cabBoxH / 2, 0, "islandBase");
      const islandPlinth = mesh(box(islandWidth - 0.04, pldH, islandDepth - 0.08), mCabinet, 0, pldH / 2, 0, "islandPlinth");
      islandG.add(islandBase, islandPlinth);
      app.selectables.push(islandBase);

      // Island Countertop
      const islandCounter = mesh(box(islandWidth + 0.04, countertopThickness, islandDepth + 0.04), mCountertop, 0, cabH + countertopThickness / 2, 0, "islandCounter");
      islandG.add(islandCounter);
      app.selectables.push(islandCounter);

      // Waterfall edges for island if enabled
      if (countertopWaterfall) {
        const wfL = mesh(box(countertopThickness, cabH, islandDepth + 0.04), mCountertop, -islandWidth / 2 - 0.02, cabH / 2, 0, "islandWfL");
        const wfR = mesh(box(countertopThickness, cabH, islandDepth + 0.04), mCountertop, islandWidth / 2 + 0.02, cabH / 2, 0, "islandWfR");
        islandG.add(wfL, wfR);
      }

      // Island Seating / Bar stools
      if (islandSeating) {
        [-0.4, 0.4].forEach((offset) => {
          const stool = new THREE.Group();
          stool.position.set(offset, 0, islandDepth / 2 + 0.35);

          // Seat
          const seat = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16), mCabinet, 0, 0.65, 0, "stoolSeat");
          stool.add(seat);
          app.selectables.push(seat);

          // Legs
          [-0.1, 0.1].forEach((lx) => {
            [-0.1, 0.1].forEach((lz) => {
              const leg = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.62, 8), mDarkSteel, lx, 0.31, lz, "stoolLeg");
              stool.add(leg);
            });
          });

          // Footrest ring
          const ring = mesh(new THREE.TorusGeometry(0.12, 0.008, 6, 16), mDarkSteel, 0, 0.18, 0, "stoolRing");
          ring.rotation.x = Math.PI / 2;
          stool.add(ring);

          islandG.add(stool);
        });
      }

      // Island Sink
      if (islandSink) {
        const sinkY = cabH + countertopThickness + 0.001;
        const sinkDeck = mesh(box(0.5, 0.004, islandDepth - 0.1), mSteel, 0, sinkY, 0, "islandSinkDeck");
        islandG.add(sinkDeck);
        app.selectables.push(sinkDeck);

        const bowl = mesh(box(0.38, 0.002, islandDepth - 0.2), mDarkSteel, 0, sinkY + 0.002, 0, "islandSinkBowl");
        islandG.add(bowl);

        // Faucet
        const faucetG = new THREE.Group();
        faucetG.position.set(0, sinkY, islandDepth / 2 - 0.15);
        const fBase = mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.08, 8), mHandle, 0, 0.04, 0, "islandFaucetBase");
        faucetG.add(fBase);
        const fNeck = mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.2, 8), mHandle, 0, 0.16, 0, "islandFaucetNeck");
        const fBend = mesh(box(0.08, 0.018, 0.018), mHandle, -0.03, 0.25, 0, "islandFaucetBend");
        faucetG.add(fNeck, fBend);
        islandG.add(faucetG);
      }

      app.root.add(islandG);
    }

    // --- Stand-alone fridge overlay (if free standing single or double) ---
    if (applianceFridge !== "none" && applianceFridge !== "built-in") {
      const isDouble = applianceFridge === "double";
      const frW = isDouble ? 0.9 : 0.6;
      const frH = 1.85;
      const frD = 0.65;
      const frX = RW / 2 - frW / 2 - 0.01;
      const frZ = RL / 2 - frD / 2 - 0.01;

      const fridgeBody = mesh(box(frW, frH, frD), mSteel, frX, frH / 2, frZ, "fridgeBody");
      app.root.add(fridgeBody);
      app.selectables.push(fridgeBody);

      if (isDouble) {
        [-0.02, 0.02].forEach((offset) => {
          const hCyl = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.4, 8), mHandle, frX + offset, frH * 0.55, frZ - frD / 2 - 0.008, "fridgeHandle");
          app.root.add(hCyl);
        });
      } else {
        const hCyl = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.4, 8), mHandle, frX - frW / 2 + 0.05, frH * 0.55, frZ - frD / 2 - 0.008, "fridgeHandle");
        app.root.add(hCyl);
      }
    }

  }, [
    roomWidth, roomLength, roomHeight, kitchenLayout,
    baseCabinetWidth, baseCabinetHeight, baseCabinetDepth, toeKickHeight, kitchenHandleType,
    wallCabinetsEnabled, wallCabinetHeight, wallCabinetDepth, wallCabinetDistance, wallCabinetGlass, wallCabinetOpen,
    tallCabinetType, tallCabinetsCount, countertopMaterial, countertopThickness, countertopWaterfall, countertopColor,
    islandEnabled, islandWidth, islandDepth, islandSeating, islandSink, islandCooker,
    applianceFridge, applianceOven, applianceCooker, applianceHood, applianceDishwasher,
    sinkType, sinkPosition, faucetType, kitchenCabinetMaterial, kitchenCabinetWoodType, kitchenCabinetMatteColor,
    wallColor, floorColor, backsplashColor, textureScale, textureRotation, glossLevel, roughnessVal, bumpStrength,
    kitchenCabinetPremiumFinish, backsplashMaterial, countertopColor, applianceSink, kitchenModules, showWalls
  ]);

  // ─── 3D OFFICE MESH GENERATOR ───
  const buildOffice = useCallback(() => {
    const app = appRef.current;
    if (!app.root) return;

    // Clear previous geometries
    while (app.root.children.length) {
      app.root.remove(app.root.children[0]);
    }
    app.selectables = [];
    app.doorPivots = [];
    app.drawerPivots = [];
    app.shelvesMeshes = [];

    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const mesh = (geo, mat, x, y, z, name) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      m.name = name || "";
      return m;
    };

    const RW = officeRoomWidth;
    const RL = officeRoomLength;
    const RH = officeRoomHeight;

    // --- Create Custom Office Materials ---
    let cabColor = 0x5c4a38; // walnut default
    if (officeFeatureWallColor === "oak") cabColor = 0xA07040;
    else if (officeFeatureWallColor === "charcoal") cabColor = 0x242424;
    else if (officeFeatureWallColor === "beige") cabColor = 0xd4c5a8;
    else if (officeFeatureWallColor === "sage") cabColor = 0x4f6352;
    const mCabinet = new THREE.MeshStandardMaterial({ color: cabColor, roughness: 0.72, metalness: 0.05 });

    let topColor = 0xf5f5f7;
    let topRoughness = 0.08;
    let topMetal = 0.12;
    let topTrans = false;
    let topOpac = 1.0;
    if (officeDeskTopMaterial === "wood") {
      topColor = officeDeskTopColor === "walnut" ? 0x3d2e1e : 0xa07040;
      topRoughness = 0.75;
      topMetal = 0.02;
    } else if (officeDeskTopMaterial === "marble") {
      topColor = 0xf5f5f7;
      topRoughness = 0.08;
      topMetal = 0.12;
    } else if (officeDeskTopMaterial === "quartz") {
      topColor = 0xe2e2e6;
      topRoughness = 0.22;
      topMetal = 0.02;
    } else if (officeDeskTopMaterial === "glass") {
      topColor = 0xddeeff;
      topRoughness = 0.02;
      topMetal = 0.90;
      topTrans = true;
      topOpac = 0.35;
    } else if (officeDeskTopMaterial === "concrete") {
      topColor = 0x88888b;
      topRoughness = 0.85;
      topMetal = 0.02;
    } else if (officeDeskTopMaterial === "metal") {
      topColor = 0xaaaaaf;
      topRoughness = 0.25;
      topMetal = 0.85;
    }
    const mDeskTop = new THREE.MeshStandardMaterial({ color: topColor, roughness: topRoughness, metalness: topMetal, transparent: topTrans, opacity: topOpac });

    const mSteel = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.15, metalness: 0.85 });
    const mDarkSteel = new THREE.MeshStandardMaterial({ color: 0x222224, roughness: 0.5, metalness: 0.2 });

    let chairColVal = 0x111111; // black cushion
    if (officeChairColor === "brown") chairColVal = 0x5a3e2e;
    else if (officeChairColor === "gray") chairColVal = 0x555558;
    else if (officeChairColor === "cream") chairColVal = 0xf2ece0;
    else if (officeChairColor === "red") chairColVal = 0x8c2520;
    else if (officeChairColor === "blue") chairColVal = 0x20355a;
    const mLeather = new THREE.MeshStandardMaterial({ color: chairColVal, roughness: 0.65, metalness: 0.08 });

    let ledColorVal = 0xffcc44; // warm
    if (officeLightingColorTemp === "cool") ledColorVal = 0x88aaff;
    else if (officeLightingColorTemp === "neutral") ledColorVal = 0xffffff;
    const mLED = new THREE.MeshStandardMaterial({ color: ledColorVal, emissive: new THREE.Color(ledColorVal), emissiveIntensity: officeShelvesLEDBrightness * 2.5 });

    const mGlass = new THREE.MeshStandardMaterial({ color: 0xddeeff, transparent: true, opacity: 0.3, roughness: 0.05, metalness: 0.1 });

    // Flooring Setup
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    let baseCol = "#a07040"; // oak
    let darkCol = "#704820";
    if (officeFlooringColor === "walnut") { baseCol = "#3d2010"; darkCol = "#261208"; }
    else if (officeFlooringColor === "charcoal") { baseCol = "#2b2b2b"; darkCol = "#1c1c1c"; }
    else if (officeFlooringColor === "beige") { baseCol = "#d8cbb5"; darkCol = "#b5a790"; }
    ctx.fillStyle = baseCol;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = darkCol;
    ctx.lineWidth = 2.0;

    if (officeFlooringType === "herringbone") {
      for (let y = 0; y < 512; y += 64) {
        for (let x = 0; x < 512; x += 128) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 64, y + 64);
          ctx.lineTo(x + 128, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + 64, y + 64);
          ctx.lineTo(x + 64, y + 128);
          ctx.stroke();
        }
      }
    } else {
      for (let x = 0; x < 512; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(officeFlooringScale * 2, officeFlooringScale * 2);

    const mFloor = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 1.0 - officeFlooringGloss,
      metalness: officeFlooringGloss * 0.2
    });

    // Floor Plane
    const floorMesh = mesh(box(RW, 0.02, RL), mFloor, 0, -0.01, 0, "officeFloor");
    app.root.add(floorMesh);

    // Subtle office Rug under the desk
    const rug = mesh(box(officeDeskWidth + 0.6, 0.005, officeDeskDepth + 1.0), new THREE.MeshStandardMaterial({ color: 0xe2dcd3, roughness: 0.95 }), 0, 0.002, 0.2, "officeRug");
    app.root.add(rug);

    // --- Build Feature Wall ---
    const fwG = new THREE.Group();
    fwG.name = "featureWall";
    fwG.userData = { group: "feature-wall", id: "feature-wall" };
    
    if (officeFeatureWallStyle === "wood-slat") {
      const backWallPanel = mesh(box(officeFeatureWallWidth, officeFeatureWallHeight, officeFeatureWallThickness), mCabinet, 0, officeFeatureWallHeight / 2, -RL / 2 + officeFeatureWallThickness / 2, "fwBackPanel");
      fwG.add(backWallPanel);
      
      const slatW = 0.035;
      const slatD = 0.02;
      const slatMat = mCabinet.clone();
      slatMat.color.multiplyScalar(0.72);
      const slatCount = Math.floor(officeFeatureWallWidth / (slatW + officeFeatureWallSlatSpacing));
      const startX = -((slatCount - 1) * (slatW + officeFeatureWallSlatSpacing)) / 2;
      for (let s = 0; s < slatCount; s++) {
        const sx = startX + s * (slatW + officeFeatureWallSlatSpacing);
        const slat = mesh(box(slatW, officeFeatureWallHeight, slatD), slatMat, sx, officeFeatureWallHeight / 2, -RL / 2 + officeFeatureWallThickness + slatD / 2, `fwSlat_${s}`);
        fwG.add(slat);
      }
    } else if (officeFeatureWallStyle === "marble") {
      const marblePanel = mesh(box(officeFeatureWallWidth, officeFeatureWallHeight, officeFeatureWallThickness), mDeskTop, 0, officeFeatureWallHeight / 2, -RL / 2 + officeFeatureWallThickness / 2, "fwMarblePanel");
      fwG.add(marblePanel);
      [-0.6, 0, 0.6].forEach((offset, idx) => {
        const strip = mesh(box(0.015, officeFeatureWallHeight, 0.006), mSteel, offset, officeFeatureWallHeight / 2, -RL / 2 + officeFeatureWallThickness + 0.003, `fwMarbleStrip_${idx}`);
        fwG.add(strip);
      });
    } else if (officeFeatureWallStyle === "acoustic") {
      const acousticPanel = mesh(box(officeFeatureWallWidth, officeFeatureWallHeight, officeFeatureWallThickness), new THREE.MeshStandardMaterial({ color: 0x3a4f41, roughness: 0.90 }), 0, officeFeatureWallHeight / 2, -RL / 2 + officeFeatureWallThickness / 2, "fwAcousticPanel");
      fwG.add(acousticPanel);
      for (let h = 0.6; h < officeFeatureWallHeight; h += 0.6) {
        const seam = mesh(box(officeFeatureWallWidth, 0.008, 0.008), mDarkSteel, 0, h, -RL / 2 + officeFeatureWallThickness + 0.003, `fwAcousticSeam_${h}`);
        fwG.add(seam);
      }
    } else {
      let fCol = 0xeae6df;
      if (officeFeatureWallStyle === "concrete") fCol = 0x8c8c90;
      const paintedWall = mesh(box(officeFeatureWallWidth, officeFeatureWallHeight, officeFeatureWallThickness), new THREE.MeshStandardMaterial({ color: fCol, roughness: 0.85 }), 0, officeFeatureWallHeight / 2, -RL / 2 + officeFeatureWallThickness / 2, "fwPaintedPanel");
      fwG.add(paintedWall);
    }
    app.root.add(fwG);
    app.selectables.push(fwG.children[0]);

    // --- Build Modular Built-in Cabinets ---
    officeCabinets.forEach((cab, idx) => {
      const cabG = new THREE.Group();
      cabG.name = `cabinet_${cab.id}`;
      cabG.userData = { id: cab.id, group: "cabinet", type: cab.type };
      
      const isTall = cab.type === "tall";
      const isWall = cab.type === "wall";
      const isShelves = cab.type === "shelves";
      const cabH = cab.height || (isTall ? 2.2 : 0.8);
      const cabW = cab.width || 0.6;
      const cabD = cab.depth || (isWall ? 0.3 : 0.4);
      
      const isLeft = idx % 2 === 0;
      const marginOffset = 0.02;
      const cx = isLeft ? -officeFeatureWallWidth / 2 - cabW / 2 - marginOffset : officeFeatureWallWidth / 2 + cabW / 2 + marginOffset;
      const cy = isWall ? officeRoomHeight - cabH - 0.1 : 0;
      const cz = -RL / 2 + cabD / 2;

      cabG.position.set(cx, cy, cz);

      const frame = mesh(box(cabW, cabH, cabD), mCabinet, 0, cabH / 2, 0, `cabFrame_${cab.id}`);
      cabG.add(frame);
      app.selectables.push(frame);

      if (isShelves || cab.doorType === "open" || cab.subType === "bookshelf") {
        const sCount = cab.shelfCount || 3;
        const innerW = cabW - 0.04;
        const innerD = cabD - 0.04;
        for (let s = 1; s <= sCount; s++) {
          const sy = (cabH / (sCount + 1)) * s;
          const shelf = mesh(box(innerW, 0.02, innerD), mCabinet, 0, sy, 0.01, `cabShelf_${cab.id}_${s}`);
          cabG.add(shelf);
          app.shelvesMeshes.push(shelf);

          if (officeShelvesLEDPosition !== "off") {
            let ledY = sy;
            let ledZ = -innerD / 2 + 0.01;
            let ledX = 0;
            if (officeShelvesLEDPosition === "top") ledY += 0.015;
            if (officeShelvesLEDPosition === "bottom") ledY -= 0.015;
            
            const led = mesh(box(innerW, 0.008, 0.012), mLED, ledX, ledY, ledZ, `cabShelfLED_${cab.id}_${s}`);
            cabG.add(led);
          }
        }
      } else {
        const doorW = cabW - 0.006;
        const doorH = cabH - 0.01;
        const doorZ = cabD / 2 + 0.01;

        if (cab.doorType === "glass") {
          const doorBorder = mesh(box(doorW, doorH, 0.015), mCabinet, 0, cabH / 2, doorZ, `cabDoorBorder_${cab.id}`);
          const glassPane = mesh(box(doorW - 0.08, doorH - 0.08, 0.008), mGlass, 0, cabH / 2, doorZ + 0.004, `cabDoorGlass_${cab.id}`);
          cabG.add(doorBorder, glassPane);
          app.selectables.push(doorBorder);
        } else {
          const door = mesh(box(doorW, doorH, 0.015), mCabinet, 0, cabH / 2, doorZ, `cabDoor_${cab.id}`);
          cabG.add(door);
          app.selectables.push(door);
        }

        const handle = mesh(box(0.015, 0.16, 0.02), mSteel, doorW / 2 - 0.04, cabH / 2, doorZ + 0.012, `cabHandle_${cab.id}`);
        cabG.add(handle);
      }

      app.root.add(cabG);
    });

    // --- Build Desk System ---
    const deskG = new THREE.Group();
    deskG.name = "officeDesk";
    deskG.userData = { id: "office-desk", group: "desk", type: officeDeskType };
    
    const deskY = officeDeskHeight;
    const deskW = officeDeskWidth;
    const deskD = officeDeskDepth;
    const deskThickness = officeDeskTopThickness;
    const deskZ = 0.2;

    deskG.position.set(0, 0, deskZ);

    let topGeo = box(deskW, deskThickness, deskD);
    if (officeDeskType === "l-shape") {
      topGeo = box(deskW, deskThickness, deskD);
      const returnW = 0.5;
      const returnD = 1.0;
      const deskReturn = mesh(box(returnW, deskThickness, returnD), mDeskTop, -deskW / 2 + returnW / 2, deskY - deskThickness / 2, -deskD / 2 - returnD / 2, "deskReturnTop");
      deskG.add(deskReturn);
      app.selectables.push(deskReturn);
    } else if (officeDeskType === "u-shape") {
      topGeo = box(deskW, deskThickness, deskD);
      const rW = 0.5;
      const rD = 1.0;
      const retL = mesh(box(rW, deskThickness, rD), mDeskTop, -deskW / 2 + rW / 2, deskY - deskThickness / 2, -deskD / 2 - rD / 2, "deskReturnLTop");
      const retR = mesh(box(rW, deskThickness, rD), mDeskTop, deskW / 2 - rW / 2, deskY - deskThickness / 2, -deskD / 2 - rD / 2, "deskReturnRTop");
      deskG.add(retL, retR);
      app.selectables.push(retL, retR);
    }
    
    const topMesh = mesh(topGeo, mDeskTop, 0, deskY - deskThickness / 2, 0, "deskTop");
    deskG.add(topMesh);
    app.selectables.push(topMesh);

    if (officeDeskType === "floating") {
      const bracket = mesh(box(deskW - 0.1, 0.2, 0.05), mDarkSteel, 0, deskY - 0.1, -deskD / 2 + 0.025, "deskFloatingBracket");
      deskG.add(bracket);
    } else if (officeDeskType === "compact") {
      const legR = 0.024;
      const legH = deskY - deskThickness;
      const lx = deskW / 2 - 0.06;
      const lz = deskD / 2 - 0.06;
      [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]].forEach(([xVal, zVal], idx) => {
        const leg = mesh(new THREE.CylinderGeometry(legR, legR, legH, 12), mSteel, xVal, legH / 2, zVal, `deskLeg_${idx}`);
        deskG.add(leg);
      });
    } else {
      const panelThickness = 0.08;
      const legH = deskY - deskThickness;
      const sideL = mesh(box(panelThickness, legH, deskD - 0.02), mCabinet, -deskW / 2 + panelThickness / 2 + 0.02, legH / 2, 0, "deskSideSupportL");
      const sideR = mesh(box(panelThickness, legH, deskD - 0.02), mCabinet, deskW / 2 - panelThickness / 2 - 0.02, legH / 2, 0, "deskSideSupportR");
      const modesty = mesh(box(deskW - panelThickness * 2 - 0.06, legH * 0.8, 0.018), mCabinet, 0, legH * 0.6, -deskD / 2 + 0.08, "deskModestyPanel");
      deskG.add(sideL, sideR, modesty);
      app.selectables.push(sideL, sideR);
    }

    // --- Drawer System (Desk Drawers) ---
    if (officeDeskDrawerPos !== "none" && officeDeskType !== "floating") {
      const hasL = officeDeskDrawerPos === "left" || officeDeskDrawerPos === "dual";
      const hasR = officeDeskDrawerPos === "right" || officeDeskDrawerPos === "dual";
      const hasC = officeDeskDrawerPos === "center";

      const pedW = 0.44;
      const pedH = deskY - deskThickness - 0.02;
      const pedD = deskD - 0.06;
      const drawerCount = officeDeskDrawerCount || 3;
      const rowHeight = pedH / drawerCount;
      const slideOutZ = pedD * 0.7;

      const buildPedestalDrawers = (xOffset, suffix) => {
        const pedGroup = new THREE.Group();
        pedGroup.position.set(xOffset, pedH / 2, 0.02);

        const caseMesh = mesh(box(pedW, pedH, pedD), mCabinet, 0, 0, 0, `pedCase_${suffix}`);
        pedGroup.add(caseMesh);

        for (let row = 0; row < drawerCount; row++) {
          const dy = -pedH / 2 + row * rowHeight + rowHeight / 2;
          const dg = new THREE.Group();
          dg.position.set(0, dy, 0);
          dg.userData = { isDrawerGroup: true, drawerIndex: row };

          const trayW = pedW - 0.02;
          const trayH = rowHeight - 0.02;
          const trayD = pedD - 0.02;
          
          const frontFace = mesh(box(trayW, trayH, 0.02), mCabinet, 0, 0, pedD / 2 + 0.01, `drawerFace_${suffix}_${row}`);
          frontFace.userData = { group: "ext-drawer", drawerGroup: dg };
          dg.add(frontFace);
          app.selectables.push(frontFace);

          const handle = mesh(box(0.12, 0.015, 0.018), mSteel, 0, 0, pedD / 2 + 0.024, `drawerHandle_${suffix}_${row}`);
          dg.add(handle);

          const trayBody = mesh(box(trayW - 0.02, trayH * 0.8, trayD), new THREE.MeshStandardMaterial({ color: 0xc8b898, roughness: 0.8 }), 0, -trayH * 0.1, 0, `drawerInner_${suffix}_${row}`);
          dg.add(trayBody);

          if (row === drawerCount - 1) {
            [-0.08, 0, 0.08].forEach((itemX, i) => {
              const fileBox = mesh(box(0.04, trayH * 0.6, 0.15), new THREE.MeshStandardMaterial({ color: i === 0 ? 0xcc4444 : i === 1 ? 0x4488cc : 0x44cc88 }), itemX, trayH * 0.2, 0, `drawerFile_${suffix}_${i}`);
              dg.add(fileBox);
            });
          }

          pedGroup.add(dg);
          app.drawerPivots.push({
            group: dg,
            targetZ: 0,
            openZ: slideOutZ,
            open: officeDeskDrawersOpen,
            row,
            col: suffix === "L" ? 0 : 1
          });

          if (officeDeskLockOption && row === drawerCount - 1) {
            const lockMesh = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 8), mDarkSteel, 0, trayH / 2 - 0.02, pedD / 2 + 0.022, `drawerLock_${suffix}`);
            lockMesh.rotation.x = Math.PI / 2;
            dg.add(lockMesh);
          }
        }
        deskG.add(pedGroup);
      };

      if (hasL) buildPedestalDrawers(-deskW / 2 + pedW / 2 + 0.05, "L");
      if (hasR) buildPedestalDrawers(deskW / 2 - pedW / 2 - 0.05, "R");
      
      if (hasC) {
        const cW = deskW - 0.4;
        const cH = 0.08;
        const cD = deskD - 0.08;
        const cg = new THREE.Group();
        cg.position.set(0, deskY - deskThickness - cH / 2 - 0.005, 0.02);
        
        const centerFront = mesh(box(cW - 0.01, cH - 0.01, 0.016), mCabinet, 0, 0, cD / 2 + 0.008, "drawerCenterFace");
        centerFront.userData = { group: "ext-drawer", drawerGroup: cg };
        cg.add(centerFront);
        app.selectables.push(centerFront);

        const centerHandle = mesh(box(0.18, 0.01, 0.016), mSteel, 0, 0, cD / 2 + 0.018, "drawerCenterHandle");
        cg.add(centerHandle);

        const centerTray = mesh(box(cW - 0.04, cH - 0.02, cD), new THREE.MeshStandardMaterial({ color: 0xc8b898, roughness: 0.85 }), 0, 0, 0, "drawerCenterTray");
        cg.add(centerTray);

        deskG.add(cg);
        app.drawerPivots.push({
          group: cg,
          targetZ: 0,
          openZ: slideOutZ * 0.8,
          open: officeDeskDrawersOpen,
          row: 0,
          col: 3
        });
      }
    }
    app.root.add(deskG);

    // --- Chair System ---
    const buildExecutiveChair = (x, y, z, rotY, isVisitor) => {
      const chairG = new THREE.Group();
      chairG.name = isVisitor ? "visitorChair" : "executiveChair";
      chairG.userData = { id: isVisitor ? "visitor-chair" : "office-chair", group: "chair" };
      chairG.position.set(x, y, z);
      chairG.rotation.y = rotY;

      if (isVisitor) {
        const frameG = new THREE.Group();
        const baseTube = mesh(box(0.5, 0.03, 0.5), mSteel, 0, 0.015, 0, "visitorBaseTube");
        const backLegs = mesh(box(0.03, 0.44, 0.03), mSteel, -0.22, 0.22, -0.22, "visitorBackLegL");
        const backLegsR = mesh(box(0.03, 0.44, 0.03), mSteel, 0.22, 0.22, -0.22, "visitorBackLegR");
        frameG.add(baseTube, backLegs, backLegsR);
        chairG.add(frameG);
        
        const seat = mesh(box(0.48, 0.04, 0.46), mLeather, 0, 0.44, 0, "visitorSeat");
        const back = mesh(box(0.46, 0.42, 0.04), mLeather, 0, 0.72, -0.21, "visitorBackrest");
        chairG.add(seat, back);
        app.selectables.push(seat, back);
      } else {
        const baseG = new THREE.Group();
        for (let arm = 0; arm < 5; arm++) {
          const angle = (arm / 5) * Math.PI * 2;
          const baseLeg = mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.28, 8), mSteel, 0, 0.06, 0.14, `chairStarLeg_${arm}`);
          baseLeg.rotation.x = Math.PI / 2;
          baseLeg.rotation.y = angle;
          baseG.add(baseLeg);
          
          const wheel = mesh(new THREE.SphereGeometry(0.024, 8, 8), mDarkSteel, 0.24 * Math.sin(angle), 0.024, 0.24 * Math.cos(angle), `chairWheel_${arm}`);
          baseG.add(wheel);
        }
        const stem = mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.32, 10), mSteel, 0, 0.22, 0, "chairStem");
        baseG.add(stem);
        chairG.add(baseG);

        const seatHeight = 0.44;
        const seat = mesh(box(0.54, 0.07, 0.52), mLeather, 0, seatHeight, 0, "chairSeat");
        
        const backG = new THREE.Group();
        backG.position.set(0, seatHeight + 0.035, -0.22);
        
        const spine = mesh(box(0.06, 0.58, 0.03), mSteel, 0, 0.29, -0.01, "chairSpineSupport");
        const backrest = mesh(box(0.48, 0.62, 0.06), mLeather, 0, 0.35, 0.02, "chairBackrestPanel");
        const headrest = mesh(box(0.28, 0.16, 0.08), mLeather, 0, 0.72, 0.04, "chairHeadrest");
        backG.add(spine, backrest, headrest);
        
        [-0.28, 0.28].forEach((offsetX, idx) => {
          const armSupport = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 8), mSteel, offsetX, seatHeight + 0.1, 0.08, `chairArmStem_${idx}`);
          const armPad = mesh(box(0.05, 0.024, 0.28), mLeather, offsetX, seatHeight + 0.2, 0.06, `chairArmPad_${idx}`);
          chairG.add(armSupport, armPad);
        });

        chairG.add(seat, backG);
        app.selectables.push(seat, backrest);
      }
      app.root.add(chairG);
    };

    buildExecutiveChair(0, 0.01, deskZ - deskD / 2 - 0.45, 0, false);
    buildExecutiveChair(-0.6, 0.01, deskZ + deskD / 2 + 0.55, Math.PI + 0.18, true);
    buildExecutiveChair(0.6, 0.01, deskZ + deskD / 2 + 0.55, Math.PI - 0.18, true);

    // --- Technology Items ---
    const buildDeskTechnology = () => {
      const topY = deskY + 0.002;
      
      if (officeTechItems.includes("monitor") || officeTechItems.includes("dual-monitors")) {
        const isDual = officeTechItems.includes("dual-monitors");
        
        const buildSingleMonitor = (x, rotY, nameSuffix) => {
          const monG = new THREE.Group();
          monG.position.set(x, topY, 0.06);
          monG.rotation.y = rotY;

          const mBase = mesh(box(0.18, 0.006, 0.14), mSteel, 0, 0.003, 0, `monBase_${nameSuffix}`);
          const mPole = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 8), mSteel, 0, 0.14, -0.04, `monPole_${nameSuffix}`);
          monG.add(mBase, mPole);

          const screenFrame = mesh(box(0.52, 0.32, 0.016), mDarkSteel, 0, 0.28, 0, `monFrame_${nameSuffix}`);
          const screenGlass = mesh(box(0.50, 0.30, 0.008), mGlass, 0, 0.28, 0.005, `monScreen_${nameSuffix}`);
          screenGlass.material = screenGlass.material.clone();
          screenGlass.material.color.setHex(0x111116);
          screenGlass.material.roughness = 0.08;
          monG.add(screenFrame, screenGlass);
          app.selectables.push(screenFrame);

          deskG.add(monG);
        };

        if (isDual) {
          buildSingleMonitor(-0.32, 0.15, "L");
          buildSingleMonitor(0.32, -0.15, "R");
        } else {
          buildSingleMonitor(0, 0, "C");
        }
      }

      if (officeTechItems.includes("pc")) {
        const kboard = mesh(box(0.38, 0.008, 0.13), mSteel, 0, topY, 0.26, "pcKeyboard");
        const mouseObj = mesh(box(0.05, 0.012, 0.08), mDarkSteel, 0.25, topY, 0.26, "pcMouse");
        deskG.add(kboard, mouseObj);
        
        const tower = mesh(box(0.2, 0.42, 0.44), mDarkSteel, deskW / 2 - 0.18, 0.22, -0.06, "pcTowerUnit");
        deskG.add(tower);
        app.selectables.push(tower);
      }

      if (officeTechItems.includes("laptop")) {
        const lapG = new THREE.Group();
        lapG.position.set(-0.35, topY, 0.25);
        lapG.rotation.y = 0.22;

        const lapBase = mesh(box(0.32, 0.008, 0.22), mSteel, 0, 0.004, 0, "laptopBase");
        lapG.add(lapBase);
        app.selectables.push(lapBase);

        const screenPivot = new THREE.Group();
        screenPivot.position.set(0, 0.004, -0.11);
        screenPivot.rotation.x = -Math.PI / 1.6;
        
        const lapLid = mesh(box(0.32, 0.22, 0.006), mSteel, 0, 0.11, 0, "laptopLid");
        const glowScreen = mesh(box(0.30, 0.20, 0.004), new THREE.MeshStandardMaterial({ color: 0x90c0f0, emissive: 0x90c0f0, emissiveIntensity: 1.2 }), 0, 0.11, 0.002, "laptopGlowScreen");
        screenPivot.add(lapLid, glowScreen);
        lapG.add(screenPivot);

        deskG.add(lapG);
      }

      if (officeTechItems.includes("speakers")) {
        const spL = mesh(box(0.08, 0.14, 0.08), mDarkSteel, -deskW / 2 + 0.1, topY + 0.07, -0.12, "speakerL");
        const spR = mesh(box(0.08, 0.14, 0.08), mDarkSteel, deskW / 2 - 0.1, topY + 0.07, -0.12, "speakerR");
        deskG.add(spL, spR);
        app.selectables.push(spL, spR);
      }

      if (officeTechItems.includes("tv")) {
        const tv = mesh(box(1.4, 0.8, 0.03), mDarkSteel, 0, 1.7, -RL / 2 + officeFeatureWallThickness + 0.02, "featureWallTV");
        const tvGlass = mesh(box(1.36, 0.76, 0.005), new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.02 }), 0, 1.7, -RL / 2 + officeFeatureWallThickness + 0.038, "tvGlassPane");
        app.root.add(tv, tvGlass);
        app.selectables.push(tv);
      }
    };
    buildDeskTechnology();

    const buildDecorations = () => {
      const topY = deskY + 0.002;

      if (officeDecorItems.includes("plant")) {
        const plantG = new THREE.Group();
        plantG.name = "decorPlant";
        plantG.position.set(deskW / 2 - 0.18, topY, 0.22);
        
        const pot = mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.15, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }), 0, 0.075, 0, "plantPot");
        plantG.add(pot);
        
        const plantMat = new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.9 });
        for (let leaf = 0; leaf < 3; leaf++) {
          const leafPl = mesh(new THREE.CircleGeometry(0.12, 6), plantMat, 0, 0.2, 0, `leafPlane_${leaf}`);
          leafPl.rotation.y = (leaf / 3) * Math.PI;
          leafPl.rotation.x = -Math.PI / 4;
          plantG.add(leafPl);
        }
        deskG.add(plantG);
        app.selectables.push(pot);
      }

      if (officeDecorItems.includes("lamp")) {
        const lampG = new THREE.Group();
        lampG.position.set(-deskW / 2 + 0.16, topY, -0.15);

        const lBase = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 12), mSteel, 0, 0.005, 0, "lampBase");
        const lPole = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 8), mSteel, 0, 0.13, 0, "lampPole");
        lPole.rotation.z = -0.15;
        
        const shade = mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.08, 12), mSteel, -0.04, 0.26, 0, "lampShade");
        shade.rotation.z = -Math.PI / 4;
        
        const bulb = mesh(new THREE.SphereGeometry(0.02, 8, 8), mLED, -0.04, 0.24, 0, "lampBulb");
        lampG.add(lBase, lPole, shade, bulb);
        
        deskG.add(lampG);
        app.selectables.push(lBase);
      }

      if (officeDecorItems.includes("books")) {
        const bookStack = new THREE.Group();
        bookStack.position.set(-officeFeatureWallWidth / 2 - 0.3, 0.82, -RL / 2 + 0.3);
        [-0.04, 0, 0.04].forEach((bx, idx) => {
          const book = mesh(box(0.03, 0.16, 0.12), new THREE.MeshStandardMaterial({ color: idx === 0 ? 0xaa4444 : idx === 1 ? 0x44aa88 : 0xaa8833 }), bx, 0.08, 0, `book_${idx}`);
          book.rotation.z = -0.1 + Math.random() * 0.2;
          bookStack.add(book);
        });
        app.root.add(bookStack);
      }
    };
    buildDecorations();

    // --- Custom Objects ---
    officeCustomObjects.forEach(obj => {
      let customMesh = null;
      
      if (obj.type === "chair-visitor" || obj.group === "chair") {
        customMesh = mesh(box(0.48, 0.44, 0.46), mLeather, 0, 0.22, 0, obj.name);
        const backing = mesh(box(0.46, 0.42, 0.04), mLeather, 0, 0.65, -0.21, `${obj.name}_back`);
        const framePipe = mesh(box(0.5, 0.03, 0.5), mSteel, 0, 0.015, 0, `${obj.name}_frame`);
        customMesh.add(backing, framePipe);
      } else if (obj.type === "potted-plant") {
        customMesh = new THREE.Group();
        customMesh.name = obj.name;
        const pot = mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.22, 12), new THREE.MeshStandardMaterial({ color: 0xeeeeee }), 0, 0.11, 0, `${obj.name}_pot`);
        const green = mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: 0x3d7042, roughness: 0.95 }), 0, 0.28, 0, `${obj.name}_green`);
        customMesh.add(pot, green);
      } else {
        customMesh = mesh(box(obj.width || 0.4, obj.height || 0.4, obj.depth || 0.4), mCabinet, 0, (obj.height || 0.4) / 2, 0, obj.name);
      }

      if (customMesh) {
        customMesh.position.set(obj.posX, obj.posY, obj.posZ);
        customMesh.rotation.y = obj.rotY * (Math.PI / 180);
        customMesh.scale.set(obj.scaleW || 1, obj.scaleH || 1, obj.scaleD || 1);
        customMesh.userData = { id: obj.id, group: obj.group || "custom", type: obj.type };
        app.root.add(customMesh);
        
        customMesh.traverse(child => {
          if (child.isMesh) {
            child.userData = { group: obj.group || "custom", id: obj.id };
            app.selectables.push(child);
          }
        });
      }
    });

    const trackLight = new THREE.PointLight(ledColorVal, officeLightingBrightness, 6);
    trackLight.position.set(0, RH - 0.2, 0.5);
    app.root.add(trackLight);

    if (selectedOfficeObject) {
      const app = appRef.current;
      const meshObj = app.root.getObjectByName(selectedOfficeObject.name) || app.root.children.find(c => c.uuid === selectedOfficeObject.id || c.name === selectedOfficeObject.name);
      if (meshObj) {
        const wireGeo = new THREE.BoxHelper(meshObj, 0xcc4444);
        wireGeo.name = "dimensionWireframeHUD";
        app.root.add(wireGeo);
      }
    }

  }, [
    officeRoomWidth, officeRoomLength, officeRoomHeight,
    officeFeatureWallStyle, officeFeatureWallWidth, officeFeatureWallHeight, officeFeatureWallThickness, officeFeatureWallColor, officeFeatureWallSlatSpacing,
    officeCabinets, officeDeskType, officeDeskWidth, officeDeskDepth, officeDeskHeight, officeDeskTopThickness, officeDeskTopMaterial, officeDeskTopColor, officeDeskDrawerPos, officeDeskDrawerCount, officeDeskDrawersOpen, officeDeskLockOption,
    officeChairType, officeChairColor, officeChairMaterial, officeChairHeight, officeChairFrame,
    officeTechItems, officeDecorItems, officeFlooringType, officeFlooringColor, officeFlooringScale, officeFlooringGloss,
    officeLightingType, officeLightingBrightness, officeLightingColorTemp, officeShelvesLEDPosition, officeShelvesLEDBrightness,
    officeCustomObjects, selectedOfficeObject
  ]);

  const handleUpdateSelectedObject = (field, val) => {
    if (!selectedOfficeObject) return;
    const v = parseFloat(val);
    
    setSelectedOfficeObject(prev => {
      const updated = { ...prev, [field]: v };
      const app = appRef.current;
      if (app.root) {
        const meshObj = app.root.getObjectByName(prev.name) || app.root.children.find(c => c.uuid === prev.id || c.name === prev.name);
        if (meshObj) {
          if (field === "posX") meshObj.position.x = v;
          if (field === "posY") meshObj.position.y = v;
          if (field === "posZ") meshObj.position.z = v;
          if (field === "rotY") meshObj.rotation.y = v * (Math.PI / 180);
          if (field === "scaleW") meshObj.scale.x = v;
          if (field === "scaleH") meshObj.scale.y = v;
          if (field === "scaleD") meshObj.scale.z = v;
        }
      }
      return updated;
    });
  };

  const handleDuplicateSelectedObject = () => {
    if (!selectedOfficeObject) return;
    const newId = `custom-${Date.now()}`;
    const newObj = {
      id: newId,
      name: `copy-${selectedOfficeObject.name}-${Date.now().toString().slice(-4)}`,
      type: selectedOfficeObject.type || "custom",
      group: selectedOfficeObject.group || "custom",
      posX: selectedOfficeObject.posX + 0.3,
      posY: selectedOfficeObject.posY,
      posZ: selectedOfficeObject.posZ + 0.3,
      rotY: selectedOfficeObject.rotY,
      scaleW: selectedOfficeObject.scaleW,
      scaleH: selectedOfficeObject.scaleH,
      scaleD: selectedOfficeObject.scaleD,
      color: selectedOfficeObject.color,
      material: selectedOfficeObject.material
    };
    setOfficeCustomObjects(prev => [...prev, newObj]);
    triggerNotification("Object duplicated! Adjust sliders to move.");
  };

  const handleDeleteSelectedObject = () => {
    if (!selectedOfficeObject) return;
    const id = selectedOfficeObject.id;
    setOfficeCustomObjects(prev => prev.filter(obj => obj.id !== id && obj.name !== selectedOfficeObject.name));
    setOfficeCabinets(prev => prev.filter(c => c.id !== id));
    
    setSelectedOfficeObject(null);
    setSelectedPart("Click any part to edit");
    triggerNotification("Object deleted");
    setTimeout(() => buildOffice(), 10);
  };

  const handleReplaceSelectedMaterial = (mat) => {
    if (!selectedOfficeObject) return;
    setSelectedOfficeObject(prev => ({ ...prev, material: mat }));
    
    const app = appRef.current;
    const meshObj = app.root.getObjectByName(selectedOfficeObject.name) || app.root.children.find(c => c.uuid === selectedOfficeObject.id || c.name === selectedOfficeObject.name);
    if (meshObj) {
      meshObj.traverse(child => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          if (mat === "wood") { child.material.color.setHex(0xa07040); child.material.roughness = 0.75; child.material.metalness = 0.05; }
          else if (mat === "marble") { child.material.color.setHex(0xf5f5f7); child.material.roughness = 0.08; child.material.metalness = 0.12; }
          else if (mat === "glass") { child.material.color.setHex(0xddeeff); child.material.roughness = 0.02; child.material.transparent = true; child.material.opacity = 0.35; }
          else if (mat === "metal") { child.material.color.setHex(0xcccccc); child.material.roughness = 0.15; child.material.metalness = 0.85; }
          else if (mat === "fabric") { child.material.color.setHex(0x5a3e2e); child.material.roughness = 0.90; child.material.metalness = 0.0; }
          child.material.needsUpdate = true;
        }
      });
    }
    triggerNotification("Material replaced");
  };

  const handleReplaceSelectedModel = (model) => {
    if (!selectedOfficeObject) return;
    if (selectedOfficeObject.group === "chair") {
      setOfficeChairType(model);
      triggerNotification(`Chair style swapped to: ${model}`);
    } else if (selectedOfficeObject.group === "desk") {
      setOfficeDeskType(model);
      triggerNotification(`Desk style swapped to: ${model}`);
    }
  };

  const calculateEstimatedCost = () => {
    if (activeCategory === "wardrobe") {
      let cost = width * height * 190;
      cost += extDrawerRows * 75;
      if (hangerRods) cost += 30;
      if (ledLighting !== "off") cost += 55;
      if (doorStyle === "glass") cost += 140;
      else if (doorStyle === "mirror") cost += 160;
      else if (doorStyle === "frosted") cost += 150;
      return cost.toFixed(2);
    } else if (activeCategory === "kitchen") {
      let cost = kitchenModules.length * 220;
      if (countertopMaterial === "marble") cost += 400;
      else if (countertopMaterial === "quartz") cost += 320;
      else if (countertopMaterial === "granite") cost += 280;
      if (islandEnabled) cost += islandWidth * 350;
      if (applianceFridge !== "none") cost += 800;
      if (applianceOven !== "none") cost += 450;
      if (applianceCooker !== "none") cost += 350;
      return cost.toFixed(2);
    } else if (activeCategory === "office") {
      let cost = officeFeatureWallWidth * officeFeatureWallHeight * 95;
      if (officeFeatureWallStyle === "wood-slat") cost += 280;
      else if (officeFeatureWallStyle === "marble") cost += 450;
      
      cost += officeDeskWidth * officeDeskDepth * 180;
      if (officeDeskTopMaterial === "marble") cost += 350;
      else if (officeDeskTopMaterial === "quartz") cost += 250;
      else if (officeDeskTopMaterial === "glass") cost += 180;

      if (officeDeskDrawerPos !== "none") {
        cost += officeDeskDrawerCount * 60;
      }

      cost += officeChairType === "executive" ? 320 : 180;
      cost += 2 * 140;

      cost += officeCabinets.length * 190;

      if (officeTechItems.includes("dual-monitors")) cost += 450;
      else if (officeTechItems.includes("monitor")) cost += 250;
      if (officeTechItems.includes("laptop")) cost += 900;
      if (officeTechItems.includes("pc")) cost += 800;
      if (officeTechItems.includes("tv")) cost += 500;

      cost += officeDecorItems.length * 35;
      cost += officeRoomWidth * officeRoomLength * 45;

      return cost.toFixed(2);
    }
    return "0.00";
  };

  // Synchronize dynamic color updates
  useEffect(() => {
    const app = appRef.current;
    const p = PALETTE[activeColor];
    const pFace = PALETTE[activeFaceColor] || p;
    if (!p) return;

    // Apply body + plinth (all parts)
    app.M.body.color.setHex(p.c);
    app.M.body.roughness = p.r;
    app.M.body.metalness = p.m;
    app.M.body.needsUpdate = true;

    app.M.plinth.color.setHex(p.c);
    app.M.plinth.color.multiplyScalar(0.58);
    app.M.plinth.roughness = p.r;
    app.M.plinth.needsUpdate = true;

    // Shelves match body
    app.shelvesMeshes.forEach(s => {
      if (s.material && s.userData.group === "shelf") {
        s.material.color.setHex(p.c);
        s.material.needsUpdate = true;
      }
    });

    // Face color (door panels + drawer fronts) — independently overrideable
    // Store in drawerFront so it persists through door style changes
    app.M.drawerFront.color.setHex(pFace.c);
    app.M.drawerFront.roughness = pFace.r;
    app.M.drawerFront.metalness = pFace.m;
    app.M.drawerFront.transparent = false;
    app.M.drawerFront.opacity = 1;
    app.M.drawerFront.needsUpdate = true;

    // Sync app.currentDoorStyle
    app.currentDoorStyle = doorStyle;

    // Apply door panels style
    if (doorStyle === "glass") {
      app.M.door.color.setHex(0xD0ECFC); app.M.door.roughness = 0.04; app.M.door.metalness = 0.04;
      app.M.door.transparent = true; app.M.door.opacity = 0.16;
    } else if (doorStyle === "mirror") {
      app.M.door.color.setHex(0xCCDCEE); app.M.door.roughness = 0.01; app.M.door.metalness = 0.96;
      app.M.door.transparent = false; app.M.door.opacity = 1;
    } else if (doorStyle === "frosted") {
      app.M.door.color.setHex(0xDCE8F4); app.M.door.roughness = 0.58; app.M.door.metalness = 0.0;
      app.M.door.transparent = true; app.M.door.opacity = 0.48;
    } else {
      // Solid — copy from drawerFront (face color)
      app.M.door.color.copy(app.M.drawerFront.color);
      app.M.door.roughness = app.M.drawerFront.roughness;
      app.M.door.metalness = app.M.drawerFront.metalness;
      app.M.door.transparent = false; app.M.door.opacity = 1;
    }
    app.M.door.needsUpdate = true;

    // Apply frame/glass visibility based on doorStyle
    _restoreDoorStyleWardrobe(app);

    // Apply Handle finishes
    const handleFinishes = {
      gold:   { c: 0xC8A050, r: 0.18, m: 0.88 },
      silver: { c: 0xC0C8D0, r: 0.14, m: 0.92 },
      black:  { c: 0x1A1A1A, r: 0.50, m: 0.30 },
      chrome: { c: 0xDDE8F0, r: 0.03, m: 0.97 },
      hidden: { c: 0x1A1A1A, r: 0.50, m: 0.30 },
    };
    const hp = handleFinishes[handleStyle] || handleFinishes.gold;
    app.M.handle.color.setHex(hp.c);
    app.M.handle.roughness = hp.r;
    app.M.handle.metalness = hp.m;
    app.M.handle.needsUpdate = true;

    // Show/hide door handles based on style
    if (app.doorHandleMeshes) {
      app.doorHandleMeshes.forEach(h => { h.visible = handleStyle !== 'hidden'; });
    }

  }, [activeColor, activeFaceColor, doorStyle, handleStyle]);

  // LED lighting live update (without rebuild)
  useEffect(() => {
    const app = appRef.current;
    if (activeCategory === 'wardrobe') {
      _applyLEDstate(app, ledLighting);
    }
  }, [ledLighting, activeCategory]);

  // Initial WebGL Context Mount
  useEffect(() => {
    const app = appRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    // Renderer
    app.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    app.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    app.renderer.shadowMap.enabled = true;
    app.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    app.renderer.outputColorSpace = THREE.SRGBColorSpace;
    app.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    app.renderer.toneMappingExposure = 1.15;

    // Scene setup
    app.scene = new THREE.Scene();
    const initBg = theme === "light" ? 0xfbfaf8 : 0x1e1e24;
    app.scene.background = new THREE.Color(initBg);
    app.scene.fog = new THREE.Fog(initBg, 12, 28);

    // Camera setup
    app.camera = new THREE.PerspectiveCamera(40, wrap.clientWidth / wrap.clientHeight, 0.05, 40);
    
    const moveCam = () => {
      app.camera.position.set(
        app.sph.r * Math.sin(app.sph.p) * Math.sin(app.sph.t),
        app.sph.r * Math.cos(app.sph.p) + app.TARGET.y,
        app.sph.r * Math.sin(app.sph.p) * Math.cos(app.sph.t)
      );
      app.camera.lookAt(app.TARGET);
    };
    moveCam();

    // Lighting
    app.scene.add(new THREE.HemisphereLight(0xffffff, theme === "light" ? 0xdddddf : 0x1a1a24, 0.85));

    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(3.5, 7, 4.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { near: 0.5, far: 24, left: -5, right: 5, top: 6, bottom: -1 });
    sun.shadow.bias = -0.001;
    app.scene.add(sun);

    const fill = new THREE.PointLight(0x70a0ff, 0.7, 14);
    fill.position.set(-4, 2.5, 2);
    app.scene.add(fill);

    const spot = new THREE.SpotLight(0xffecd1, 1.0, 16, Math.PI / 6, 0.4);
    spot.position.set(0, 7, -3);
    spot.target.position.set(0, 1.5, 0);
    app.scene.add(spot, spot.target);

    // Floor Planes
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 22),
      new THREE.MeshStandardMaterial({ color: theme === "light" ? 0xeeeeee : 0x1a1a20, roughness: 0.9, metalness: 0.08 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    app.scene.add(floor);

    const gridCol = theme === "light" ? 0xd8d8df : 0x3a3a46;
    const grid = new THREE.GridHelper(20, 20, gridCol, gridCol);
    grid.position.y = 0.001;
    grid.material.opacity = 0.5;
    grid.material.transparent = true;
    app.scene.add(grid);

    // Mount Root Object
    app.root = new THREE.Group();
    app.scene.add(app.root);

    // Initial build call
    if (activeCategory === "kitchen") buildKitchen();
    else if (activeCategory === "office") buildOffice();
    else buildWardrobe();

    // Resize handlers
    const resizeObserver = new ResizeObserver(() => {
      const W = wrap.clientWidth;
      const H = wrap.clientHeight;
      if (W && H) {
        app.renderer.setSize(W, H, false);
        app.camera.aspect = W / H;
        app.camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(wrap);

    // Orbit mouse controls
    let dragging = false;
    let prevMouse = { x: 0, y: 0 };
    let mouseDownPos = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      if (e.button === 0) {
        dragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
        mouseDownPos = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      dragging = false;
    };

    const onMouseMove = (e) => {
      if (!dragging) return;
      app.sph.t -= (e.clientX - prevMouse.x) * 0.007;
      app.sph.p = Math.max(0.25, Math.min(1.52, app.sph.p - (e.clientY - prevMouse.y) * 0.007));
      prevMouse = { x: e.clientX, y: e.clientY };
      moveCam();
    };

    const onWheel = (e) => {
      app.sph.r = Math.max(2.2, Math.min(11, app.sph.r + e.deltaY * 0.009));
      moveCam();
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("wheel", onWheel);

    // Click selection Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse2D = new THREE.Vector2();

    const onClick = (e) => {
      if (Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y) > 6) return;
      const rect = canvas.getBoundingClientRect();
      mouse2D.x = ((e.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
      mouse2D.y = -((e.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse2D, app.camera);
      const hits = raycaster.intersectObjects(app.selectables, false);
      if (hits.length) {
        const m = hits[0].object;
        const grp = m.userData.group;

        if (activeCategory === "office") {
          if (grp === "ext-drawer") {
            const dg = m.userData.drawerGroup;
            const dp = app.drawerPivots.find(d => d.group === dg);
            if (dp) {
              dp.open = !dp.open;
              dp.targetZ = dp.open ? dp.openZ : 0;
              triggerHud(dp.open ? "📦 Drawer opened" : "📦 Drawer closed");
            }
          }

          let topObj = m;
          while (topObj.parent && topObj.parent !== app.root) {
            topObj = topObj.parent;
          }

          setSelectedOfficeObject({
            id: topObj.userData.id || topObj.uuid,
            name: topObj.name || grp || "Office Object",
            group: topObj.userData.group || grp || "custom",
            type: topObj.userData.type || topObj.name || "custom",
            posX: topObj.position.x,
            posY: topObj.position.y,
            posZ: topObj.position.z,
            rotY: topObj.rotation.y * (180 / Math.PI),
            scaleW: topObj.scale.x,
            scaleH: topObj.scale.y,
            scaleD: topObj.scale.z,
            color: topObj.userData.color || "default",
            material: topObj.userData.material || "default"
          });
          setSelectedPart(topObj.name || grp || "Office Object");
          triggerHud(`✦ Selected: ${topObj.name || grp}`);
          setTimeout(() => buildOffice(), 10);
          return;
        }

        if (grp === "doors" || (grp === "handles" && m.parent && m.parent !== app.root)) {
          const dp = app.doorPivots.find(d => d.pivot === m.parent);
          if (dp) {
            const isOpen = Math.abs(dp.pivot.rotation.y) > 0.05;
            dp.target = isOpen ? 0 : dp.openDir;
            triggerHud(isOpen ? "🚪 Door closed" : "🚪 Door opened");
          }
          return;
        }

        if (grp === "ext-drawer" || grp === "int-drawer") {
          const dg = m.userData.drawerGroup;
          const dp = app.drawerPivots.find(d => d.group === dg);
          if (dp) {
            dp.open = !dp.open;
            dp.targetZ = dp.open ? dp.openZ : 0;
            triggerHud(dp.open ? "📦 Drawer opened" : "📦 Drawer closed");
          }
          return;
        }

        const labels = { body: "Body / Panel", plinth: "Plinth", shelf: "Interior Shelf" };
        setSelectedPart(labels[grp] || grp || m.name);
      } else {
        setSelectedPart("Click any part to edit");
      }
    };

    canvas.addEventListener("click", onClick);

    // Animation Loop
    const clock = new THREE.Clock();
    let animId = null;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const lf = 1 - Math.pow(0.012, dt); // lerp damp

      // Swing hinges
      app.doorPivots.forEach(dp => {
        dp.pivot.rotation.y += (dp.target - dp.pivot.rotation.y) * lf;
      });

      // Slide drawers
      app.drawerPivots.forEach(dp => {
        dp.group.position.z += (dp.targetZ - dp.group.position.z) * lf;
      });

      app.renderer.render(app.scene, app.camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("click", onClick);
      app.renderer.dispose();
    };
  }, [buildWardrobe, buildOffice, triggerNotification, triggerHud]);

  // Update Three.js scene dynamically when the theme changes
  useEffect(() => {
    const app = appRef.current;
    if (!app.scene || !app.renderer) return;

    const isLight = theme === "light";
    const bgCol = isLight ? 0xfbfaf8 : 0x1e1e24;
    const floorCol = isLight ? 0xeeeeee : 0x1a1a20;
    const gridCol = isLight ? 0xd8d8df : 0x3a3a46;

    app.scene.background.setHex(bgCol);
    if (app.scene.fog) {
      app.scene.fog.color.setHex(bgCol);
    }
    
    app.scene.traverse((child) => {
      if (child.isMesh && child.geometry && child.geometry.type === "PlaneGeometry") {
        child.material.color.setHex(floorCol);
        child.material.needsUpdate = true;
      }
      if (child.isGridHelper) {
        child.material.color.setHex(gridCol);
        child.material.needsUpdate = true;
      }
    });
  }, [theme]);

  // Apply Views
  const changeView = (view) => {
    setActiveView(view);
    const app = appRef.current;
    const views = {
      v3d: [0.38, 1.25, 5.6],
      vFront: [0, Math.PI / 2, 5.0],
      vSide: [Math.PI / 2, Math.PI / 2, 5.0],
      vTop: [0, 0.08, 5.5]
    };
    const [t, p, r] = views[view];
    app.sph = { t, p, r };
    app.camera.position.set(
      r * Math.sin(p) * Math.sin(t),
      r * Math.cos(p) + app.TARGET.y,
      r * Math.sin(p) * Math.cos(t)
    );
    app.camera.lookAt(app.TARGET);
  };

  // Re-trigger layout rebuild on dimension or slider tweaks
  useEffect(() => {
    if (activeCategory === "kitchen") {
      buildKitchen();
    } else if (activeCategory === "office") {
      buildOffice();
    } else {
      buildWardrobe();
    }
  }, [
    activeCategory,
    width, height, depth, sections, extDrawerRows, hangerRods, buildWardrobe,
    roomWidth, roomLength, roomHeight, kitchenLayout,
    baseCabinetWidth, baseCabinetHeight, baseCabinetDepth, toeKickHeight, kitchenHandleType,
    wallCabinetsEnabled, wallCabinetHeight, wallCabinetDepth, wallCabinetDistance, wallCabinetGlass, wallCabinetOpen,
    tallCabinetType, tallCabinetsCount, countertopMaterial, countertopThickness, countertopWaterfall, countertopColor,
    islandEnabled, islandWidth, islandDepth, islandSeating, islandSink, islandCooker,
    applianceFridge, applianceOven, applianceCooker, applianceHood, applianceDishwasher,
    sinkType, sinkPosition, faucetType, kitchenCabinetMaterial, kitchenCabinetWoodType, kitchenCabinetMatteColor,
    wallColor, floorColor, backsplashColor, textureScale, textureRotation, glossLevel, roughnessVal, bumpStrength,
    buildKitchen, showWalls,
    officeRoomWidth, officeRoomLength, officeRoomHeight,
    officeFeatureWallStyle, officeFeatureWallWidth, officeFeatureWallHeight, officeFeatureWallThickness, officeFeatureWallColor, officeFeatureWallSlatSpacing,
    officeCabinets, officeDeskType, officeDeskWidth, officeDeskDepth, officeDeskHeight, officeDeskTopThickness, officeDeskTopMaterial, officeDeskTopColor, officeDeskDrawerPos, officeDeskDrawerCount, officeDeskDrawersOpen, officeDeskLockOption,
    officeChairType, officeChairColor, officeChairMaterial, officeChairHeight, officeChairFrame,
    officeTechItems, officeDecorItems, officeFlooringType, officeFlooringColor, officeFlooringScale, officeFlooringGloss,
    officeLightingType, officeLightingBrightness, officeLightingColorTemp, officeShelvesLEDPosition, officeShelvesLEDBrightness,
    officeCustomObjects, selectedOfficeObject, buildOffice
  ]);

  // Hinge swing state trigger
  const handleToggleDoors = () => {
    const app = appRef.current;
    app.doorsOpen = !app.doorsOpen;
    app.doorPivots.forEach(dp => {
      dp.target = app.doorsOpen ? dp.openDir : 0;
    });
    
    app.shelvesMeshes.forEach(s => {
      s.visible = app.doorsOpen || app.interiorVisible;
    });

    triggerNotification(app.doorsOpen ? "Doors opened" : "Doors closed");
  };

  // Shelf interior display state trigger
  const handleToggleInterior = () => {
    const app = appRef.current;
    app.interiorVisible = !app.interiorVisible;
    app.shelvesMeshes.forEach(s => {
      s.visible = app.interiorVisible || app.doorsOpen;
    });
    triggerNotification(app.interiorVisible ? "Interior shown" : "Interior hidden");
  };

  // Reset viewport camera position
  const handleResetCamera = () => {
    const app = appRef.current;
    app.sph = { t: 0.38, p: 1.25, r: 5.6 };
    app.camera.position.set(
      5.6 * Math.sin(1.25) * Math.sin(0.38),
      5.6 * Math.cos(1.25) + app.TARGET.y,
      5.6 * Math.sin(1.25) * Math.cos(0.38)
    );
    app.camera.lookAt(app.TARGET);
    triggerNotification("Camera reset");
  };

  // Drawer slide state trigger
  const handleToggleAllDrawers = () => {
    const app = appRef.current;
    app.drawersAllOpen = !app.drawersAllOpen;
    app.drawerPivots.forEach(dp => {
      dp.open = app.drawersAllOpen;
      dp.targetZ = app.drawersAllOpen ? dp.openZ : 0;
    });
    triggerNotification(app.drawersAllOpen ? "All drawers opened" : "All drawers closed");
  };

  // Apply visual preset configurations
  const handleApplyPreset = (presetKey) => {
    setActivePreset(presetKey);
    const p = PRESETS[presetKey];
    if (!p) return;

    setActiveColor(p.color);
    if (p.faceColor) setActiveFaceColor(p.faceColor);
    setHandleStyle(p.handle);
    setDoorStyle(p.door);
    setLedLighting(p.led);
    if (typeof p.dr !== 'undefined') setExtDrawerRows(p.dr);
    if (typeof p.ro !== 'undefined') setHangerRods(p.ro);
    triggerNotification("✦ " + presetKey.charAt(0).toUpperCase() + presetKey.slice(1) + " style applied");
  };
  // Export handlers
  const handleExportPNG = () => {
    const app = appRef.current;
    if (!app.renderer || !canvasRef.current) return;
    app.renderer.render(app.scene, app.camera);
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `furni-ai-${activeCategory}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    triggerNotification("PNG Snapshot downloaded!");
  };

  const handleExportJPG = () => {
    const app = appRef.current;
    if (!app.renderer || !canvasRef.current) return;
    app.renderer.render(app.scene, app.camera);
    const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);
    const link = document.createElement("a");
    link.download = `furni-ai-${activeCategory}-${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
    triggerNotification("JPG Snapshot downloaded!");
  };

  const handleExportGLB = () => {
    const designData = {
      generator: "FurniAI Kitchen, Wardrobe & Office Configurator",
      version: "1.0",
      activeCategory,
      timestamp: new Date().toISOString(),
      dimensions: {
        width: activeCategory === "kitchen" ? roomWidth : activeCategory === "office" ? officeRoomWidth : width,
        height: activeCategory === "kitchen" ? roomHeight : activeCategory === "office" ? officeRoomHeight : height,
        depth: activeCategory === "kitchen" ? roomLength : activeCategory === "office" ? officeRoomLength : depth,
      },
      specifications: activeCategory === "kitchen" ? {
        layout: kitchenLayout,
        cabinet: {
          material: kitchenCabinetMaterial,
          woodType: kitchenCabinetWoodType,
          matteColor: kitchenCabinetMatteColor,
          baseWidth: baseCabinetWidth,
          baseHeight: baseCabinetHeight,
          baseDepth: baseCabinetDepth,
          toeKick: toeKickHeight,
          handles: kitchenHandleType,
        },
        wallCabinets: {
          enabled: wallCabinetsEnabled,
          height: wallCabinetHeight,
          depth: wallCabinetDepth,
          distance: wallCabinetDistance,
          glass: wallCabinetGlass,
          open: wallCabinetOpen,
        },
        tallCabinets: {
          count: tallCabinetsCount,
          type: tallCabinetType,
        },
        countertop: {
          material: countertopMaterial,
          thickness: countertopThickness,
          waterfall: countertopWaterfall,
        },
        island: {
          enabled: islandEnabled,
          width: islandWidth,
          depth: islandDepth,
          seating: islandSeating,
          sink: islandSink,
        },
        appliances: {
          fridge: applianceFridge,
          oven: applianceOven,
          cooker: applianceCooker,
          hood: applianceHood,
        }
      } : activeCategory === "office" ? {
        layout: officeLayoutType,
        featureWall: {
          style: officeFeatureWallStyle,
          width: officeFeatureWallWidth,
          color: officeFeatureWallColor
        },
        desk: {
          style: officeDeskType,
          width: officeDeskWidth,
          depth: officeDeskDepth,
          material: officeDeskTopMaterial,
          drawers: officeDeskDrawerPos
        },
        cabinetsCount: officeCabinets.length,
        tech: officeTechItems,
        decor: officeDecorItems,
        flooring: officeFlooringType,
        estimatedCost: calculateEstimatedCost()
      } : {
        sections,
        extDrawerRows,
        hangerRods,
        preset: activePreset,
        color: activeColor,
        doorStyle,
        handleStyle,
        led: ledLighting,
      }
    };
    const str = JSON.stringify(designData, null, 2);
    const blob = new Blob([str], { type: "application/json" });
    const link = document.createElement("a");
    link.download = `furni-ai-${activeCategory}-${Date.now()}.glb.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    triggerNotification("GLB Layout Spec downloaded!");
  };

  const handleExportPDF = () => {
    const summary = `=============================================
             FURNI AI DESIGN REPORT
=============================================
Generated on: ${new Date().toLocaleString()}
Category: ${activeCategory.toUpperCase()}
Room Dimensions:
  - Width: ${activeCategory === "kitchen" ? roomWidth * 100 : activeCategory === "office" ? officeRoomWidth * 100 : width * 100} cm
  - Height: ${activeCategory === "kitchen" ? roomHeight * 100 : activeCategory === "office" ? officeRoomHeight * 100 : height * 100} cm
  - Depth: ${activeCategory === "kitchen" ? roomLength * 100 : activeCategory === "office" ? officeRoomLength * 100 : depth * 100} cm
Estimated Cost: $${calculateEstimatedCost()}

---------------------------------------------
Specifications:
${activeCategory === "kitchen" ? `
  - Layout: ${kitchenLayout}
  - Cabinet Material: ${kitchenCabinetMaterial} (${kitchenCabinetWoodType || kitchenCabinetMatteColor || kitchenCabinetPremiumFinish})
  - Countertop: ${countertopMaterial} (${countertopThickness * 100} cm)
  - Island: ${islandEnabled ? `Enabled (${islandWidth * 100} x ${islandDepth * 100} cm)` : "Disabled"}
  - Appliances:
      * Fridge: ${applianceFridge}
      * Oven: ${applianceOven}
      * Cooker: ${applianceCooker}
      * Hood: ${applianceHood}
` : activeCategory === "office" ? `
  - Layout Preset: ${officeLayoutType}
  - Feature Wall Style: ${officeFeatureWallStyle} (${officeFeatureWallColor})
  - Desk Style: ${officeDeskType} (Top: ${officeDeskTopMaterial}, Drawers: ${officeDeskDrawerPos})
  - Cabinet Modules: ${officeCabinets.length} units
  - Enabled Tech: ${officeTechItems.join(", ")}
  - Enabled Decor: ${officeDecorItems.join(", ")}
  - Floor Cover: ${officeFlooringType}
` : `
  - Sections: ${sections}
  - Style Preset: ${activePreset}
  - Color: ${activeColor}
  - Door Style: ${doorStyle}
  - Handle Style: ${handleStyle}
  - LED Lighting: ${ledLighting}
`}
=============================================`;
    const blob = new Blob([summary], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `furni-ai-${activeCategory}-${Date.now()}.pdf`;
    link.href = URL.createObjectURL(blob);
    link.click();
    triggerNotification("PDF Spec Report downloaded!");
  };

  const handleExportFormat = (fmt) => {
    const data = `# Furni AI Export
# Format: ${fmt.toUpperCase()}
# Category: ${activeCategory}
# Dimensions: ${activeCategory === "kitchen" ? roomWidth : activeCategory === "office" ? officeRoomWidth : width} x ${activeCategory === "kitchen" ? roomHeight : activeCategory === "office" ? officeRoomHeight : height} x ${activeCategory === "kitchen" ? roomLength : activeCategory === "office" ? officeRoomLength : depth}
# This file contains the 3D layout data for imports in SketchUp, AutoCAD, or Blender.
# Selected Materials: ${activeCategory === "kitchen" ? kitchenCabinetMaterial : activeCategory === "office" ? officeDeskTopMaterial : activeColor}
# Countertop: ${activeCategory === "kitchen" ? countertopMaterial : "N/A"}`;
    const blob = new Blob([data], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `furni-ai-${activeCategory}-${Date.now()}.${fmt}`;
    link.href = URL.createObjectURL(blob);
    link.click();
    triggerNotification(`${fmt.toUpperCase()} format exported successfully!`);
  };

  // AI execution simulation
  const handleRunAI = (text) => {
    if (!text.trim()) return;
    const t = text.toLowerCase();

    // Auto-switch category to kitchen or office if prompt contains keywords
    if (t.includes("office") || t.includes("desk") || t.includes("chair") || t.includes("workspace") || t.includes("study") || t.includes("slat") || t.includes("bookshelf")) {
      setActiveCategory("office");
    } else if (t.includes("kitchen") || t.includes("cabinet") || t.includes("countertop") || t.includes("appliances") || t.includes("island") || t.includes("sink") || t.includes("hob")) {
      setActiveCategory("kitchen");
    }

    if (activeCategory === "office" || t.includes("office") || t.includes("desk") || t.includes("chair") || t.includes("workspace") || t.includes("study")) {
      if (t.includes("walnut")) {
        setOfficeFeatureWallColor("walnut");
        setOfficeDeskTopColor("walnut");
      } else if (t.includes("oak")) {
        setOfficeFeatureWallColor("oak");
        setOfficeDeskTopColor("oak");
      } else if (t.includes("charcoal") || t.includes("black")) {
        setOfficeFeatureWallColor("charcoal");
        setOfficeDeskTopColor("black");
      }
      
      if (t.includes("marble")) {
        setOfficeDeskTopMaterial("marble");
      } else if (t.includes("wood")) {
        setOfficeDeskTopMaterial("wood");
      } else if (t.includes("glass")) {
        setOfficeDeskTopMaterial("glass");
      }

      if (t.includes("leather")) {
        setOfficeChairMaterial("leather");
        setOfficeChairColor("black");
      } else if (t.includes("fabric")) {
        setOfficeChairMaterial("fabric");
      }

      if (t.includes("led")) {
        setOfficeShelvesLEDPosition("back");
      }

      if (t.includes("warm")) {
        setOfficeLightingColorTemp("warm");
      } else if (t.includes("cool")) {
        setOfficeLightingColorTemp("cool");
      } else if (t.includes("neutral")) {
        setOfficeLightingColorTemp("neutral");
      }

      if (t.includes("plant") || t.includes("plants")) {
        if (!officeDecorItems.includes("plant")) {
          setOfficeDecorItems(prev => [...prev, "plant"]);
        }
      }

      if (t.includes("executive")) {
        setOfficeLayoutType("executive");
        setOfficeDeskType("executive");
        setOfficeChairType("executive");
      } else if (t.includes("home") || t.includes("study")) {
        setOfficeLayoutType("home");
        setOfficeDeskType("compact");
        setOfficeChairType("visitor");
      } else if (t.includes("modern") || t.includes("workspace")) {
        setOfficeLayoutType("workspace");
        setOfficeFeatureWallStyle("acoustic");
      }

      triggerNotification("✦ AI generated office layout");
      return;
    }

    if (activeCategory === "kitchen" || t.includes("kitchen")) {
      // Kitchen AI Prompt Heuristics
      if (t.includes("white")) {
        setKitchenCabinetMaterial("matte");
        setKitchenCabinetMatteColor("white");
      } else if (t.includes("black")) {
        setKitchenCabinetMaterial("matte");
        setKitchenCabinetMatteColor("black");
      } else if (t.includes("gray") || t.includes("grey")) {
        setKitchenCabinetMaterial("matte");
        setKitchenCabinetMatteColor("gray");
      } else if (t.includes("beige") || t.includes("linen")) {
        setKitchenCabinetMaterial("matte");
        setKitchenCabinetMatteColor("beige");
      } else if (t.includes("green") || t.includes("sage")) {
        setKitchenCabinetMaterial("matte");
        setKitchenCabinetMatteColor("green");
      } else if (t.includes("blue") || t.includes("navy")) {
        setKitchenCabinetMaterial("matte");
        setKitchenCabinetMatteColor("blue");
      }

      if (t.includes("oak")) {
        setKitchenCabinetMaterial("wood");
        setKitchenCabinetWoodType("oak");
      } else if (t.includes("walnut")) {
        setKitchenCabinetMaterial("wood");
        setKitchenCabinetWoodType("walnut");
      } else if (t.includes("ash")) {
        setKitchenCabinetMaterial("wood");
        setKitchenCabinetWoodType("ash");
      } else if (t.includes("pine")) {
        setKitchenCabinetMaterial("wood");
        setKitchenCabinetWoodType("pine");
      } else if (t.includes("teak")) {
        setKitchenCabinetMaterial("wood");
        setKitchenCabinetWoodType("teak");
      }

      // Countertop Materials
      if (t.includes("marble")) {
        setCountertopMaterial("marble");
      } else if (t.includes("quartz")) {
        setCountertopMaterial("quartz");
      } else if (t.includes("granite")) {
        setCountertopMaterial("granite");
      } else if (t.includes("concrete")) {
        setCountertopMaterial("concrete");
      } else if (t.includes("wood countertop")) {
        setCountertopMaterial("wood");
      } else if (t.includes("ceramic")) {
        setCountertopMaterial("ceramic");
      }

      // Layouts
      if (t.includes("u-shape") || t.includes("u shape")) {
        setKitchenLayout("u-shape");
      } else if (t.includes("l-shape") || t.includes("l shape")) {
        setKitchenLayout("l-shape");
      } else if (t.includes("parallel") || t.includes("double-row")) {
        setKitchenLayout("parallel");
      } else if (t.includes("wall") || t.includes("single-wall")) {
        setKitchenLayout("single-wall");
      }

      // Island
      if (t.includes("island")) {
        setIslandEnabled(true);
        if (t.includes("seating") || t.includes("stools")) setIslandSeating(true);
        if (t.includes("island sink")) setIslandSink(true);
      }

      // Waterfall Edge
      if (t.includes("waterfall")) {
        setCountertopWaterfall(true);
      }

      // Glass door wall cabinets
      if (t.includes("glass door") || t.includes("glass cabinets")) {
        setWallCabinetsEnabled(true);
        setWallCabinetGlass(true);
        setWallCabinetOpen(false);
      } else if (t.includes("open shelf") || t.includes("open shelves")) {
        setWallCabinetsEnabled(true);
        setWallCabinetOpen(true);
        setWallCabinetGlass(false);
      }

      // LED lighting
      if (t.includes("led") || t.includes("lighting")) {
        setLedLighting("warm");
      }

    } else {
      // Wardrobe AI Prompt Heuristics (original)
      let matched = null;
      if (t.includes("luxury") || t.includes("gold")) matched = "luxury";
      else if (t.includes("white") || t.includes("minimal")) matched = "minimal";
      else if (t.includes("scandi") || t.includes("linen")) matched = "scandi";
      else if (t.includes("industrial") || t.includes("graphite")) matched = "industrial";
      else if (t.includes("walnut") || t.includes("classic")) matched = "classic";
      else if (t.includes("modern") || t.includes("chrome")) matched = "modern";
      else if (t.includes("navy") || t.includes("blue")) matched = "navy";

      if (matched) {
        handleApplyPreset(matched);
      }
      if (t.includes("mirror")) setDoorStyle("mirror");
      if (t.includes("glass")) setDoorStyle("glass");
      if (t.includes("led") || t.includes("warm light")) setLedLighting("warm");
      if (t.includes("open")) {
        const app = appRef.current;
        if (!app.doorsOpen) handleToggleDoors();
      }
    }

    triggerNotification('✦ AI applied: "' + text.slice(0, 30) + (text.length > 30 ? "..." : "") + '"');
  };

  return (
    <div className="builder-root-container">
      {/* Dynamic CSS Styling Injector */}
      <style dangerouslySetInnerHTML={{ __html: `
        .builder-root-container {
          --bg: ${theme === "light" ? "#fbfaf8" : "#0c0c0e"};
          --bg2: ${theme === "light" ? "#f5f3f0" : "#111114"};
          --bg3: ${theme === "light" ? "#ebe8e2" : "#18181d"};
          --border: ${theme === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.07)"};
          --border2: ${theme === "light" ? "rgba(0, 0, 0, 0.13)" : "rgba(255, 255, 255, 0.13)"};
          --accent: ${theme === "light" ? "#b89553" : "#c8a96e"};
          --accent2: ${theme === "light" ? "#d4b574" : "#e8c98e"};
          --text: ${theme === "light" ? "#1c1c1f" : "#f0ede8"};
          --muted: ${theme === "light" ? "#6b6a65" : "#8a8880"};
          --muted2: ${theme === "light" ? "#a3a19b" : "#5a5855"};
          
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', sans-serif;
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 100;
        }

        .topbar {
          height: 52px;
          background: var(--bg2);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          flex-shrink: 0;
        }

        .logo {
          font-size: 1rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .file-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: .8rem;
          color: var(--muted);
        }

        .file-name input {
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-family: 'Inter', sans-serif;
          font-size: .8rem;
          width: 180px;
        }

        .top-right {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .tb {
          background: var(--bg3);
          border: 1px solid var(--border2);
          color: var(--text);
          padding: 6px 14px;
          border-radius: 7px;
          font-size: .78rem;
          font-weight: 600;
          cursor: pointer;
          transition: background .15s;
        }

        .tb:hover {
          background: #222228;
        }

        .tb.gold {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #0c0c0e;
          border: none;
        }

        .vtog {
          display: flex;
          background: var(--bg3);
          border: 1px solid var(--border2);
          border-radius: 7px;
          overflow: hidden;
        }

        .vb {
          padding: 6px 12px;
          font-size: .74rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: none;
          color: var(--muted);
          transition: all .15s;
        }

        .vb.on {
          background: rgba(200, 169, 110, 0.15);
          color: var(--accent);
        }

        .workspace {
          display: flex;
          height: calc(100vh - 52px);
          width: 100vw;
        }

        .lsb {
          width: 188px;
          flex-shrink: 0;
          background: var(--bg2);
          border-right: 1px solid var(--border);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .lsb-sec {
          padding: 12px 12px 0;
        }

        .sec-label {
          font-size: .66rem;
          font-weight: 700;
          color: var(--muted2);
          letter-spacing: .8px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .ftype {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 9px;
          border-radius: 7px;
          cursor: pointer;
          font-size: .81rem;
          font-weight: 500;
          color: var(--muted);
          transition: all .15s;
          margin-bottom: 2px;
        }

        .ftype:hover {
          background: var(--bg3);
          color: var(--text);
        }

        .ftype.on {
          background: rgba(200, 169, 110, 0.1);
          color: var(--accent);
        }

        .divider {
          height: 1px;
          background: var(--border);
          margin: 10px 12px;
        }

        .scene-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--bg3);
          border: 1px solid var(--border2);
          border-radius: 7px;
          padding: 7px 10px;
          font-size: .77rem;
          font-weight: 600;
          color: var(--text);
          cursor: pointer;
          margin: 0 12px 6px;
          transition: all .15s;
        }

        .scene-btn:hover {
          border-color: rgba(200, 169, 110, 0.4);
          color: var(--accent);
        }

        .scene-btn.on {
          background: rgba(200, 169, 110, 0.1);
          border-color: var(--accent);
          color: var(--accent);
        }

        .cw {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: var(--bg);
        }

        #c {
          position: absolute;
          inset: 0;
          width: 100% !important;
          height: 100% !important;
          cursor: grab;
          display: block;
        }

        #c:active {
          cursor: grabbing;
        }

        .hud {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(12, 12, 14, 0.88);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(200, 169, 110, 0.3);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: .74rem;
          font-weight: 600;
          color: var(--accent2);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.25s;
          white-space: nowrap;
          z-index: 10;
        }

        .hud.show {
          opacity: 1;
        }

        .hint {
          position: absolute;
          bottom: 70px;
          left: 50%;
          transform: translateX(-50%);
          font-size: .7rem;
          color: var(--muted2);
          pointer-events: none;
          white-space: nowrap;
          opacity: .7;
          z-index: 10;
        }

        .bbbar {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(17, 17, 20, 0.92);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border2);
          border-radius: 13px;
          padding: 7px 7px 7px 16px;
          width: min(520px, 90vw);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          z-index: 10;
        }

        .bbi {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-family: 'Inter', sans-serif;
          font-size: .875rem;
        }

        .bbi::placeholder {
          color: var(--muted2);
        }

        .bbs {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border: none;
          border-radius: 9px;
          padding: 9px 18px;
          color: #0c0c0e;
          font-weight: 700;
          font-size: .78rem;
          cursor: pointer;
          white-space: nowrap;
        }

        .bbs:hover {
          opacity: .9;
        }

        .rp {
          width: 262px;
          flex-shrink: 0;
          background: var(--bg2);
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .rps {
          padding: 12px;
          border-bottom: 1px solid var(--border);
        }

        .rpt {
          font-size: .66rem;
          font-weight: 700;
          color: var(--muted2);
          letter-spacing: .8px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .pbadge {
          background: rgba(200, 169, 110, 0.08);
          border: 1px solid rgba(200, 169, 110, 0.2);
          border-radius: 8px;
          padding: 7px 12px;
          font-size: .79rem;
          color: var(--accent2);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .pdot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
        }

        .size-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .size-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .size-row label {
          font-size: .72rem;
          color: var(--muted);
          display: flex;
          justify-content: space-between;
        }

        .size-row label span {
          color: var(--accent2);
          font-weight: 600;
        }

        .slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: var(--bg3);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid var(--bg2);
        }

        .section-btns {
          display: flex;
          gap: 6px;
          margin-top: 6px;
        }

        .sec-n {
          flex: 1;
          padding: 6px 4px;
          border-radius: 7px;
          font-size: .75rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid var(--border2);
          background: var(--bg3);
          color: var(--muted);
          text-align: center;
          transition: all .15s;
        }

        .sec-n.on {
          background: rgba(200, 169, 110, 0.15);
          border-color: var(--accent);
          color: var(--accent);
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .chip {
          background: var(--bg3);
          border: 1px solid var(--border2);
          border-radius: 20px;
          padding: 5px 11px;
          font-size: .73rem;
          font-weight: 600;
          color: var(--muted);
          cursor: pointer;
          transition: all .15s;
        }

        .chip:hover {
          border-color: rgba(200, 169, 110, 0.4);
          color: var(--text);
        }

        .chip.on {
          background: rgba(200, 169, 110, 0.15);
          border-color: var(--accent);
          color: var(--accent);
        }

        .txgrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 16px;
        }

        .sw {
          aspect-ratio: 1;
          border-radius: 7px;
          cursor: pointer;
          border: 2.5px solid transparent;
          transition: all .15s;
          position: relative;
        }

        .sw:hover {
          transform: scale(1.08);
        }

        .sw.on {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px rgba(200, 169, 110, 0.2);
        }

        .sw-tip {
          position: absolute;
          bottom: -17px;
          left: 50%;
          transform: translateX(-50%);
          font-size: .55rem;
          color: var(--muted2);
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity .15s;
        }

        .sw:hover .sw-tip {
          opacity: 1;
        }

        .s1 { background: linear-gradient(135deg, #c8a050, #8b6635); }
        .s2 { background: linear-gradient(135deg, #5c4a38, #3d2e1e); }
        .s3 { background: linear-gradient(135deg, #f5f0e8, #e8e0d0); }
        .s4 { background: linear-gradient(135deg, #1a1a1a, #2d2d2d); }
        .s5 { background: linear-gradient(135deg, #d4c5a8, #b8a880); }
        .s6 { background: linear-gradient(135deg, #6a4030, #4a2818); }
        .s7 { background: linear-gradient(135deg, #e0d8cc, #c8bfb0); }
        .s8 { background: linear-gradient(135deg, #4a4a4a, #666); }
        .s9 { background: linear-gradient(135deg, #2a3a2a, #3d5c3d); }
        .s10 { background: linear-gradient(135deg, #1a2840, #2a3d60); }

        .optlist {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .opt {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 10px;
          border-radius: 7px;
          cursor: pointer;
          background: var(--bg3);
          border: 1px solid var(--border);
          font-size: .77rem;
          font-weight: 500;
          color: var(--muted);
          transition: all .15s;
        }

        .opt:hover {
          border-color: rgba(200, 169, 110, 0.4);
          color: var(--text);
        }

        .opt.on {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(200, 169, 110, 0.08);
        }

        .ledrow {
          display: flex;
          gap: 5px;
        }

        .lb {
          flex: 1;
          padding: 6px 4px;
          border-radius: 7px;
          font-size: .72rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--border2);
          background: var(--bg3);
          color: var(--muted);
          text-align: center;
          transition: all .15s;
        }

        .lb.on {
          background: rgba(200, 169, 110, 0.12);
          border-color: var(--accent);
          color: var(--accent);
        }

        .aibox {
          background: var(--bg3);
          border: 1px solid rgba(200, 169, 110, 0.22);
          border-radius: 9px;
          overflow: hidden;
        }

        .aibox textarea {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          resize: none;
          color: var(--text);
          font-family: 'Inter', sans-serif;
          font-size: .81rem;
          line-height: 1.5;
          padding: 9px 11px;
          height: 60px;
        }

        .aibox textarea::placeholder {
          color: var(--muted2);
        }

        .aifoot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 5px 9px;
          border-top: 1px solid var(--border);
        }

        .aiex-list {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .aiex {
          font-size: .64rem;
          color: var(--muted2);
          cursor: pointer;
          transition: color .15s;
        }

        .aiex:hover {
          color: var(--accent);
        }

        .aiapply {
          background: var(--accent);
          color: #0c0c0e;
          border: none;
          border-radius: 6px;
          padding: 5px 11px;
          font-size: .73rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .vi {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 9px;
          border-radius: 7px;
          cursor: pointer;
          border: 1px solid var(--border);
          margin-bottom: 5px;
          background: var(--bg3);
          transition: border-color .15s;
        }

        .vi:hover {
          border-color: rgba(200, 169, 110, 0.3);
        }

        .vi.on {
          border-color: var(--accent);
        }

        .vthumb {
          width: 32px;
          height: 32px;
          border-radius: 5px;
          flex-shrink: 0;
        }

        .vinfo h5 {
          font-size: .73rem;
          font-weight: 600;
          margin-bottom: 1px;
        }

        .vinfo p {
          font-size: .66rem;
          color: var(--muted2);
        }

        .vsave {
          width: 100%;
          margin-top: 5px;
          background: var(--bg3);
          border: 1px dashed var(--border2);
          border-radius: 7px;
          padding: 7px;
          font-size: .73rem;
          color: var(--muted2);
          cursor: pointer;
        }

        .vsave:hover {
          border-color: rgba(200, 169, 110, 0.4);
          color: var(--accent);
        }

        .notif {
          position: fixed;
          top: 62px;
          right: 14px;
          background: rgba(17, 17, 20, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(200, 169, 110, 0.3);
          border-radius: 9px;
          padding: 9px 14px;
          font-size: .79rem;
          font-weight: 600;
          color: var(--accent2);
          transform: translateY(-8px);
          opacity: 0;
          transition: all 0.3s;
          pointer-events: none;
          z-index: 999;
        }

        .notif.show {
          transform: translateY(0);
          opacity: 1;
        }

        /* ─── MOBILE-ONLY UTILITY ─── */
        .mob-only { display: none; }

        /* ─── TABLET: max-width 1024px ─── */
        @media (max-width: 1024px) {
          .lsb { width: 160px; }
          .rp { width: 230px; }
          .topbar .file-name input { width: 120px; }
        }

        /* ─── MOBILE: max-width 768px ─── */
        @media (max-width: 768px) {
          .mob-only { display: flex; }

          .lsb {
            position: fixed;
            left: 0;
            top: 52px;
            bottom: 0;
            width: 240px;
            z-index: 50;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            will-change: transform;
          }
          .lsb.mob-open { transform: translateX(0); }

          .rp {
            position: fixed;
            right: 0;
            top: 52px;
            bottom: 0;
            width: 280px;
            z-index: 50;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            will-change: transform;
          }
          .rp.mob-open { transform: translateX(0); }

          .mob-overlay {
            position: fixed;
            inset: 0;
            top: 52px;
            background: rgba(0,0,0,0.5);
            z-index: 40;
            backdrop-filter: blur(2px);
          }

          .topbar .file-name { display: none; }
          .topbar .vtog { display: none; }

          .mob-btn {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: var(--bg3);
            border: 1px solid var(--border2);
            color: var(--text);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            cursor: pointer;
            flex-shrink: 0;
          }

          .bbbar {
            width: calc(100vw - 24px);
            left: 12px;
            transform: none;
            bottom: 12px;
          }

          .hint { display: none; }
        }

        /* ─── SMALL PHONE: max-width 480px ─── */
        @media (max-width: 480px) {
          .topbar { padding: 0 8px; height: 46px; }
          .workspace { height: calc(100vh - 46px); }
          .lsb.mob-open { width: 100vw; }
          .rp.mob-open { width: 100vw; }
          .logo { font-size: 0.85rem; }
          .tb { padding: 5px 10px; font-size: 0.72rem; }
        }
      ` }} />

      {/* TOPBAR */}
      <div className="topbar">
        <div className="logo">Furni AI</div>
        <div className="file-name">
          <span style={{ color: "#c8a96e" }}>📁</span>
          <input defaultValue="Custom Wardrobe — 3D" readOnly />
          <span style={{ color: "var(--muted2)" }}>· Auto-saved</span>
        </div>
        <div className="top-right">
          <button className="mob-btn mob-only" onClick={() => { setMobileLeftOpen(!mobileLeftOpen); setMobileRightOpen(false); }} title="Tools">☰</button>
          <button className="mob-btn mob-only" onClick={() => { setMobileRightOpen(!mobileRightOpen); setMobileLeftOpen(false); }} title="Properties">⚙</button>
          <div className="vtog">
            {["v3d", "vFront", "vSide", "vTop"].map((v) => (
              <button
                key={v}
                className={`vb ${activeView === v ? "on" : ""}`}
                onClick={() => changeView(v)}
              >
                {v === "v3d" ? "3D" : v.replace("v", "")}
              </button>
            ))}
          </div>
          <button className="tb cursor-pointer" onClick={() => triggerNotification("Link shared!")}>Share</button>
          <button className="tb gold cursor-pointer" onClick={handleExportPNG}>Export ↓</button>
        </div>
      </div>

      {/* WORKSPACE LAYOUT */}
      <div className="workspace">
        {(mobileLeftOpen || mobileRightOpen) && (
          <div className="mob-overlay" onClick={() => { setMobileLeftOpen(false); setMobileRightOpen(false); }} />
        )}
        {/* LEFT PANEL */}
        <div className={`lsb ${mobileLeftOpen ? 'mob-open' : ''}`}>
          <div className="lsb-sec" style={{ paddingTop: "14px" }}>
            <div className="sec-label">Furniture Type</div>
            {[
              { id: "wardrobe", label: "Wardrobe", emoji: "🚪", bg: "#c8a96e" },
              { id: "kitchen", label: "Kitchen", emoji: "🍳", bg: "#b59beb" },
              { id: "office", label: "Office", emoji: "💼", bg: "#d4a5e8" },
              { id: "tv-wall", label: "TV Wall", emoji: "📺", bg: "#9bcbeb" },
              { id: "cabinet", label: "Cabinet", emoji: "🗄️", bg: "#c5a5e8" },
              { id: "bed", label: "Bed", emoji: "🛏️", bg: "#a5b0e8" },
              { id: "shelves", label: "Shelves", emoji: "📚", bg: "#a5e8b0" },
              { id: "dressing-table", label: "Dressing Table", emoji: "🪞", bg: "#e8d4a5" },
            ].map((f) => (
              <div
                key={f.id}
                className={`ftype ${activeCategory === f.id ? "on" : ""}`}
                onClick={() => {
                  setActiveCategory(f.id);
                  triggerNotification("Switched to " + f.label);
                }}
              >
                <span style={{
                  background: f.bg,
                  color: "#0c0c0e",
                  width: "20px",
                  height: "20px",
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  flexShrink: 0
                }}>{f.emoji}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
          
          <div className="divider"></div>
          
          <div className="lsb-sec">
            <div className="sec-label">Scene</div>
          </div>
          <button className={`scene-btn ${appRef.current.doorsOpen ? "on" : ""}`} onClick={handleToggleDoors}>
            <span style={{ background: "#a07040", width: "16px", height: "16px", borderRadius: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", marginRight: "6px" }}>🚪</span>
            Open Doors
          </button>
          <button className={`scene-btn ${appRef.current.interiorVisible ? "on" : ""}`} onClick={handleToggleInterior}>
            <span style={{ background: "#c8a96e", width: "16px", height: "16px", borderRadius: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", marginRight: "6px" }}>📦</span>
            Show Interior
          </button>
          <button className="scene-btn" onClick={handleResetCamera}>
            <span style={{ background: "#a59be8", width: "16px", height: "16px", borderRadius: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", marginRight: "6px" }}>🎥</span>
            Reset Camera
          </button>
          <button className="scene-btn" onClick={() => triggerNotification("Selected all doors")}>
            <span style={{ background: "#5a5855", width: "16px", height: "16px", borderRadius: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", marginRight: "6px" }}>＋</span>
            Select All Doors
          </button>

          <div className="divider"></div>

          <div style={{ padding: "0 12px 12px" }}>
            <div className="sec-label" style={{ marginBottom: "8px" }}>Recent</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {/* Card 1: Wardrobe mini vector */}
              <div style={{ aspectRatio: "1", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => triggerNotification("Recent Design loaded")}>
                <div style={{ display: "flex", gap: "2px", width: "22px", height: "34px", border: "1.5px solid #d4c5a8", borderRadius: "3px", padding: "2px" }}>
                  <div style={{ flex: 1, borderRight: "1px solid #d4c5a8", height: "100%" }}></div>
                  <div style={{ flex: 1, height: "100%" }}></div>
                </div>
              </div>
              {/* Card 2: Lens with purple/orange circle */}
              <div style={{ aspectRatio: "1", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, #f4a261, #e76f51)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>
                  🔍
                </div>
              </div>
              {/* Card 3: Color layers */}
              <div style={{ aspectRatio: "1", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: "1px", transform: "rotate(-15deg)" }}>
                  <div style={{ width: "8px", height: "12px", background: "#a5e8b0", borderRadius: "1.5px", border: "1px solid #111" }} />
                  <div style={{ width: "8px", height: "12px", background: "#9bcbeb", borderRadius: "1.5px", border: "1px solid #111", marginLeft: "-5px", marginTop: "2px" }} />
                  <div style={{ width: "8px", height: "12px", background: "#e8d4a5", borderRadius: "1.5px", border: "1px solid #111", marginLeft: "-5px", marginTop: "4px" }} />
                </div>
              </div>
              {/* Card 4: plus */}
              <div style={{ aspectRatio: "1", background: "var(--bg3)", border: "1px dashed var(--border2)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem", color: "var(--muted2)", cursor: "pointer" }}>＋</div>
            </div>
          </div>
        </div>

        {/* CENTER VIEWPORT CANVAS */}
        <div className="cw" ref={wrapRef}>
          <canvas ref={canvasRef} id="c" />
          <div className={`hud ${showHud ? "show" : ""}`}>
            {hudText}
          </div>
          <div className="hint">🖱 Drag to orbit · Scroll to zoom · Click any part</div>
          <div className="bbbar">
            <input
              className="bbi"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe style… e.g. Luxury gold wardrobe with LED"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRunAI(prompt);
                  setPrompt("");
                }
              }}
            />
            <button className="bbs" onClick={() => { handleRunAI(prompt); setPrompt(""); }}>
              Apply AI
            </button>
          </div>
        </div>

        {/* RIGHT PANEL CONTROL BAR */}
        <div className={`rp ${mobileRightOpen ? 'mob-open' : ''}`}>
          {activeCategory === "kitchen" ? (
            <>
              {/* KITCHEN PANELS */}
              {/* 1. AI Design Assistant */}
              <div className="rps">
                <div className="rpt">✦ AI Prompt</div>
                <div className="aibox">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your kitchen style…&#10;e.g. Modern white kitchen with oak cabinets and marble countertop"
                  />
                  <div className="aifoot">
                    <div className="aiex-list">
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Modern white oak")}>Modern</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Industrial concrete")}>Industrial</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Scandi sage wood")}>Scandi</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Navy blue gold")}>Navy</span>
                    </div>
                    <button className="aiapply cursor-pointer" onClick={() => { handleRunAI(prompt); setPrompt(""); }}>Apply</button>
                  </div>
                </div>
              </div>

              {/* 2. Selected Part */}
              <div className="rps">
                <div className="rpt">Selected Part</div>
                <div className="pbadge">
                  <div className="pdot"></div>
                  <span>{selectedPart}</span>
                </div>
              </div>

              {/* Show Walls Toggle */}
              <div className="rps" style={{ paddingBottom: "10px" }}>
                <div className="rpt">Room Walls</div>
                <button
                  className={`scene-btn ${showWalls ? "on" : ""}`}
                  style={{ margin: "0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                  onClick={() => {
                    setShowWalls(v => !v);
                    triggerNotification(!showWalls ? "Room walls shown" : "Room walls hidden");
                  }}
                >
                  <span style={{ background: showWalls ? "#6a9bc8" : "#5a5855", width: "16px", height: "16px", borderRadius: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", marginRight: "6px" }}>🏠</span>
                  {showWalls ? "Hide Room Walls" : "Show Room Walls"}
                </button>
              </div>

              {/* 3. Kitchen Layout & Room Size */}
              <div className="rps">
                <div className="rpt">Kitchen Layout & Room Size</div>
                <div className="size-grid">
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "5px" }}>Layout Type</label>
                    <div className="section-btns">
                      {[
                        { id: "u-shape", label: "U-Shape" },
                        { id: "l-shape", label: "L-Shape" },
                        { id: "single-wall", label: "Wall" },
                        { id: "parallel", label: "Parallel" },
                      ].map((lay) => (
                        <div
                          key={lay.id}
                          className={`sec-n ${kitchenLayout === lay.id ? "on" : ""}`}
                          onClick={() => {
                            setKitchenLayout(lay.id);
                            triggerNotification("Layout set: " + lay.label);
                          }}
                          style={{ fontSize: "10px", padding: "6px" }}
                        >
                          {lay.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row">
                    <label>Room Width <span>{(roomWidth * 100).toFixed(0)} cm</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="2.0"
                      max="4.0"
                      step="0.1"
                      value={roomWidth}
                      onChange={(e) => setRoomWidth(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Room Length <span>{(roomLength * 100).toFixed(0)} cm</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="1.6"
                      max="3.6"
                      step="0.1"
                      value={roomLength}
                      onChange={(e) => setRoomLength(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Ceiling Height <span>{(roomHeight * 100).toFixed(0)} cm</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="2.2"
                      max="3.2"
                      step="0.1"
                      value={roomHeight}
                      onChange={(e) => setRoomHeight(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* 4. Cabinet Modules List Manager */}
              <div className="rps">
                <div className="rpt">Cabinet Modules</div>
                <div className="size-grid">
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "5px" }}>Wall Section</label>
                    <div className="section-btns">
                      {[
                        { id: "left", label: "Left Wall" },
                        { id: "back", label: "Back Wall" },
                        { id: "right", label: "Right Wall" },
                      ].map((sec) => (
                        <div
                          key={sec.id}
                          className={`sec-n ${activeKitchenSection === sec.id ? "on" : ""}`}
                          onClick={() => setActiveKitchenSection(sec.id)}
                          style={{ fontSize: "10px", padding: "6px" }}
                        >
                          {sec.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Render list of modules for active section */}
                  <div className="optlist" style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto", paddingRight: "4px" }}>
                    {kitchenModules.filter(m => m.section === activeKitchenSection).map((m, idx) => {
                      const absoluteIndex = kitchenModules.indexOf(m);
                      const relativeIndex = kitchenModules.filter(secM => secM.section === activeKitchenSection).indexOf(m);
                      const sectionLength = kitchenModules.filter(secM => secM.section === activeKitchenSection).length;
                      
                      const typeEmojis = {
                        base: "🚪",
                        wall: "🗄️",
                        tall: "🪜"
                      };

                      return (
                        <div key={m.id} style={{ display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "14px" }}>{typeEmojis[m.type] || "📁"}</span>
                              <span style={{ fontSize: "11px", fontWeight: "600" }}>{m.label}</span>
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button 
                                className="sec-n hover-bright cursor-pointer" 
                                style={{ padding: "2px 6px", fontSize: "10px", minWidth: "auto", height: "auto" }}
                                disabled={relativeIndex === 0}
                                onClick={() => handleMoveModule(relativeIndex, -1)}
                              >
                                ▲
                              </button>
                              <button 
                                className="sec-n hover-bright cursor-pointer" 
                                style={{ padding: "2px 6px", fontSize: "10px", minWidth: "auto", height: "auto" }}
                                disabled={relativeIndex === sectionLength - 1}
                                onClick={() => handleMoveModule(relativeIndex, 1)}
                              >
                                ▼
                              </button>
                              <button 
                                className="sec-n hover-bright cursor-pointer" 
                                style={{ padding: "2px 6px", fontSize: "10px", background: "rgba(224, 122, 95, 0.15)", color: "#e07a5f", minWidth: "auto", height: "auto" }}
                                onClick={() => handleDeleteModule(m.id)}
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: "9px", color: "var(--muted2)", marginBottom: "2px", display: "block" }}>
                                Width: <span>{(m.width * 100).toFixed(0)} cm</span>
                              </label>
                              <input
                                type="range"
                                className="slider"
                                min="0.15"
                                max="1.20"
                                step="0.05"
                                value={m.width}
                                onChange={(e) => handleUpdateModuleWidth(m.id, e.target.value)}
                              />
                            </div>
                            <div style={{ width: "90px" }}>
                              <label style={{ fontSize: "9px", color: "var(--muted2)", marginBottom: "2px", display: "block" }}>Type</label>
                              <select 
                                value={m.subType}
                                onChange={(e) => handleUpdateModuleSubType(m.id, e.target.value)}
                                style={{ fontSize: "10px", padding: "2px", width: "100%", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--bg)" }}
                              >
                                {m.type === "base" && (
                                  <>
                                    <option value="standard">Standard</option>
                                    <option value="sink">Sink Unit</option>
                                    <option value="cooker">Cooker Unit</option>
                                    <option value="dishwasher">Dishwasher</option>
                                  </>
                                )}
                                {m.type === "wall" && (
                                  <>
                                    <option value="standard">Standard</option>
                                    <option value="glass-door">Glass Door</option>
                                    <option value="open-shelf">Open Shelf</option>
                                    <option value="lift-up">Lift Up</option>
                                  </>
                                )}
                                {m.type === "tall" && (
                                  <>
                                    <option value="pantry">Pantry</option>
                                    <option value="oven-tower">Oven Tower</option>
                                    <option value="fridge-housing">Fridge Housing</option>
                                  </>
                                )}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {kitchenModules.filter(m => m.section === activeKitchenSection).length === 0 && (
                      <div style={{ fontSize: "10px", color: "var(--muted)", padding: "10px", textAlign: "center" }}>
                        No modules in this section. Add one below!
                      </div>
                    )}
                  </div>

                  {/* Add modules quick actions */}
                  <div style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                    <label style={{ fontSize: "10px", fontWeight: "600", color: "var(--muted)", display: "block", marginBottom: "6px" }}>+ Add Module</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                      <button 
                        className="sec-n hover-bright cursor-pointer" 
                        style={{ fontSize: "9.5px", padding: "5px" }} 
                        onClick={() => handleAddKitchenModule("base", "standard", 0.60)}
                      >
                        ➕ Base (60)
                      </button>
                      <button 
                        className="sec-n hover-bright cursor-pointer" 
                        style={{ fontSize: "9.5px", padding: "5px" }} 
                        onClick={() => handleAddKitchenModule("wall", "standard", 0.60)}
                      >
                        ➕ Wall (60)
                      </button>
                      <button 
                        className="sec-n hover-bright cursor-pointer" 
                        style={{ fontSize: "9.5px", padding: "5px" }} 
                        onClick={() => handleAddKitchenModule("tall", "pantry", 0.60)}
                      >
                        ➕ Tall (60)
                      </button>
                    </div>
                    
                    <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                      <button 
                        className="sec-n hover-bright cursor-pointer" 
                        style={{ fontSize: "9.5px", padding: "5px", flex: 1 }} 
                        onClick={() => handleAddKitchenModule("base", "sink", 0.60)}
                      >
                        💧 Add Sink Base
                      </button>
                      <button 
                        className="sec-n hover-bright cursor-pointer" 
                        style={{ fontSize: "9.5px", padding: "5px", flex: 1 }} 
                        onClick={() => handleAddKitchenModule("base", "cooker", 0.60)}
                      >
                        🔥 Add Cooker Base
                      </button>
                    </div>
                  </div>

                  <div className="size-row" style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={wallCabinetsEnabled}
                        onChange={(e) => setWallCabinetsEnabled(e.target.checked)}
                      />
                      Enable Wall Cabinets
                    </label>
                  </div>
                </div>
              </div>

              {/* 5. Kitchen Island Module */}
              <div className="rps">
                <div className="rpt">Kitchen Island Module</div>
                <div className="size-grid">
                  <div className="size-row">
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={islandEnabled}
                        onChange={(e) => setIslandEnabled(e.target.checked)}
                      />
                      Enable Kitchen Island
                    </label>
                  </div>

                  {islandEnabled && (
                    <>
                      <div className="size-row">
                        <label>Island Width <span>{islandWidth.toFixed(1)} m</span></label>
                        <input
                          type="range"
                          className="slider"
                          min="1.2"
                          max="3.0"
                          step="0.1"
                          value={islandWidth}
                          onChange={(e) => setIslandWidth(parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="size-row">
                        <label>Island Depth <span>{islandDepth.toFixed(2)} m</span></label>
                        <input
                          type="range"
                          className="slider"
                          min="0.6"
                          max="1.2"
                          step="0.05"
                          value={islandDepth}
                          onChange={(e) => setIslandDepth(parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="size-row" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", cursor: "pointer" }}>
                          <input type="checkbox" checked={islandSeating} onChange={(e) => setIslandSeating(e.target.checked)} />
                          Seating Stools
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", cursor: "pointer" }}>
                          <input type="checkbox" checked={islandSink} onChange={(e) => setIslandSink(e.target.checked)} />
                          Island Sink
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 6. Cabinet Style, Materials & Handles */}
              <div className="rps">
                <div className="rpt">Cabinet Materials & Finishes</div>
                <div className="size-grid" style={{ marginBottom: "10px" }}>
                  <label>Finish Category</label>
                  <div className="section-btns" style={{ marginBottom: "8px" }}>
                    {[
                      { id: "wood", label: "🪵 Wood" },
                      { id: "matte", label: "🎨 Matte" },
                      { id: "premium", label: "💎 Premium" },
                    ].map((fin) => (
                      <div
                        key={fin.id}
                        className={`sec-n ${kitchenCabinetMaterial === fin.id ? "on" : ""}`}
                        onClick={() => setKitchenCabinetMaterial(fin.id)}
                      >
                        {fin.label}
                      </div>
                    ))}
                  </div>

                  {kitchenCabinetMaterial === "wood" && (
                    <div className="optlist">
                      {[
                        { id: "oak", label: "Oak Wood" },
                        { id: "walnut", label: "Walnut Wood" },
                        { id: "ash", label: "Ash Wood" },
                        { id: "pine", label: "Pine Wood" },
                        { id: "teak", label: "Teak Wood" },
                      ].map((wType) => (
                        <div
                          key={wType.id}
                          className={`opt ${kitchenCabinetWoodType === wType.id ? "on" : ""}`}
                          onClick={() => setKitchenCabinetWoodType(wType.id)}
                        >
                          {wType.label}
                        </div>
                      ))}
                    </div>
                  )}

                  {kitchenCabinetMaterial === "matte" && (
                    <div className="txgrid">
                      {[
                        { id: "white", name: "White", style: { background: "#F2EDE6" } },
                        { id: "black", name: "Black", style: { background: "#1C1C1C" } },
                        { id: "gray", name: "Gray", style: { background: "#7E7E7E" } },
                        { id: "beige", name: "Beige", style: { background: "#D4C5A8" } },
                        { id: "green", name: "Green", style: { background: "#506655" } },
                        { id: "blue", name: "Blue", style: { background: "#2A3E50" } },
                      ].map((cOpt) => (
                        <div
                          key={cOpt.id}
                          className={`sw ${kitchenCabinetMatteColor === cOpt.id ? "on" : ""}`}
                          style={cOpt.style}
                          onClick={() => setKitchenCabinetMatteColor(cOpt.id)}
                        >
                          <span className="sw-tip">{cOpt.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {kitchenCabinetMaterial === "premium" && (
                    <div className="optlist">
                      {[
                        { id: "concrete", label: "Concrete Block" },
                        { id: "stone", label: "Stone Block" },
                        { id: "marble", label: "Polished Marble" },
                        { id: "glass", label: "Reflective Glass" },
                        { id: "metal", label: "Stainless Metal" },
                      ].map((pType) => (
                        <div
                          key={pType.id}
                          className={`opt ${kitchenCabinetPremiumFinish === pType.id ? "on" : ""}`}
                          onClick={() => setKitchenCabinetPremiumFinish(pType.id)}
                        >
                          {pType.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rpt" style={{ fontSize: "11px", marginTop: "12px", border: "none" }}>Handles</div>
                <div className="optlist">
                  {[
                    { id: "gold", label: "— Gold Bar" },
                    { id: "silver", label: "◎ Silver Knob" },
                    { id: "black", label: "▬ Black Strip" },
                    { id: "hidden", label: "⊘ Hidden Push" },
                    { id: "chrome", label: "✦ Chrome" },
                  ].map((hStyle) => (
                    <div
                      key={hStyle.id}
                      className={`opt ${kitchenHandleType === hStyle.id ? "on" : ""}`}
                      onClick={() => setKitchenHandleType(hStyle.id)}
                    >
                      {hStyle.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. Countertop & Backsplash Materials */}
              <div className="rps">
                <div className="rpt">Countertop & Backsplash</div>
                <div className="size-grid">
                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label>Countertop Material</label>
                    <div className="optlist" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                      {[
                        { id: "marble", label: "💎 Marble" },
                        { id: "quartz", label: "✨ Quartz" },
                        { id: "granite", label: "🪨 Granite" },
                        { id: "concrete", label: "🧱 Concrete" },
                        { id: "wood", label: "🪵 Wood" },
                        { id: "ceramic", label: "🏺 Ceramic" },
                      ].map((mat) => (
                        <div
                          key={mat.id}
                          className={`opt ${countertopMaterial === mat.id ? "on" : ""}`}
                          onClick={() => setCountertopMaterial(mat.id)}
                          style={{ fontSize: "10.5px", padding: "6px" }}
                        >
                          {mat.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="size-row">
                    <label>Thickness <span>{(countertopThickness * 100).toFixed(0)} cm</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="0.01"
                      max="0.08"
                      step="0.01"
                      value={countertopThickness}
                      onChange={(e) => setCountertopThickness(parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="size-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={countertopWaterfall}
                        onChange={(e) => setCountertopWaterfall(e.target.checked)}
                      />
                      Waterfall Edge
                    </label>
                  </div>

                  <div className="size-row" style={{ marginTop: "8px", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                    <label>Backsplash Material</label>
                    <div className="section-btns" style={{ marginTop: "4px" }}>
                      {[
                        { id: "ceramic", label: "Tile" },
                        { id: "glass", label: "Glass" },
                        { id: "marble", label: "Marble" },
                        { id: "metal", label: "Steel" },
                      ].map((bs) => (
                        <div
                          key={bs.id}
                          className={`sec-n ${backsplashMaterial === bs.id ? "on" : ""}`}
                          onClick={() => setBacksplashMaterial(bs.id)}
                          style={{ fontSize: "10px", padding: "6px" }}
                        >
                          {bs.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Colors Configurator */}
              <div className="rps">
                <div className="rpt">Colors Configurator</div>
                <div className="size-grid">
                  <div className="size-row" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ display: "flex", justifyContent: "space-between" }}>
                      Countertop Color <span>{countertopColor}</span>
                    </label>
                    <input
                      type="color"
                      value={countertopColor}
                      onChange={(e) => setCountertopColor(e.target.value)}
                      style={{ width: "100%", height: "28px", border: "1px solid var(--border)", borderRadius: "4px", padding: "0", cursor: "pointer" }}
                    />
                  </div>
                  <div className="size-row" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ display: "flex", justifyContent: "space-between" }}>
                      Backsplash Color <span>{backsplashColor}</span>
                    </label>
                    <input
                      type="color"
                      value={backsplashColor}
                      onChange={(e) => setBacksplashColor(e.target.value)}
                      style={{ width: "100%", height: "28px", border: "1px solid var(--border)", borderRadius: "4px", padding: "0", cursor: "pointer" }}
                    />
                  </div>
                  <div className="size-row" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ display: "flex", justifyContent: "space-between" }}>
                      Wall Color <span>{wallColor}</span>
                    </label>
                    <input
                      type="color"
                      value={wallColor}
                      onChange={(e) => setWallColor(e.target.value)}
                      style={{ width: "100%", height: "28px", border: "1px solid var(--border)", borderRadius: "4px", padding: "0", cursor: "pointer" }}
                    />
                  </div>
                  <div className="size-row" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ display: "flex", justifyContent: "space-between" }}>
                      Floor Color <span>{floorColor}</span>
                    </label>
                    <input
                      type="color"
                      value={floorColor}
                      onChange={(e) => setFloorColor(e.target.value)}
                      style={{ width: "100%", height: "28px", border: "1px solid var(--border)", borderRadius: "4px", padding: "0", cursor: "pointer" }}
                    />
                  </div>
                </div>
              </div>

              {/* 9. Appliance & Sink Toggles */}
              <div className="rps">
                <div className="rpt">Appliance & Sink Settings</div>
                <div className="size-grid">
                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label>Sink Setup</label>
                    <div className="section-btns" style={{ marginBottom: "4px" }}>
                      {[
                        { id: "yes", label: "Include Sink" },
                        { id: "none", label: "No Sink" },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className={`sec-n ${applianceSink === item.id ? "on" : ""}`}
                          onClick={() => setApplianceSink(item.id)}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                    {applianceSink !== "none" && (
                      <div className="optlist" style={{ marginTop: "6px" }}>
                        {[
                          { id: "single-bowl", label: "Single Bowl" },
                          { id: "double-bowl", label: "Double Bowl" },
                          { id: "farmhouse", label: "Farmhouse Bowl" },
                        ].map((s) => (
                          <div
                            key={s.id}
                            className={`opt ${sinkType === s.id ? "on" : ""}`}
                            onClick={() => setSinkType(s.id)}
                          >
                            {s.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label>Faucet Type</label>
                    <div className="section-btns">
                      {[
                        { id: "gold", label: "Gold Arc" },
                        { id: "chrome", label: "Chrome Arc" },
                        { id: "classic", label: "Classic" },
                      ].map((f) => (
                        <div
                          key={f.id}
                          className={`sec-n ${faucetType === f.id ? "on" : ""}`}
                          onClick={() => setFaucetType(f.id)}
                        >
                          {f.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label>Cooker Hob Type</label>
                    <div className="section-btns">
                      {[
                        { id: "induction", label: "Induction" },
                        { id: "gas", label: "Gas" },
                        { id: "electric", label: "Electric" },
                        { id: "none", label: "None" },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className={`sec-n ${applianceCooker === item.id ? "on" : ""}`}
                          onClick={() => setApplianceCooker(item.id)}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label>Oven Tower Unit</label>
                    <div className="section-btns">
                      {[
                        { id: "single", label: "Single Oven" },
                        { id: "double", label: "Double Oven" },
                        { id: "steam", label: "Steam Oven" },
                        { id: "none", label: "None" },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className={`sec-n ${applianceOven === item.id ? "on" : ""}`}
                          onClick={() => setApplianceOven(item.id)}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label>Refrigeration</label>
                    <div className="section-btns">
                      {[
                        { id: "built-in", label: "Built-In" },
                        { id: "single", label: "Single" },
                        { id: "double", label: "Double" },
                        { id: "none", label: "None" },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className={`sec-n ${applianceFridge === item.id ? "on" : ""}`}
                          onClick={() => setApplianceFridge(item.id)}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 10. Texture System */}
              <div className="rps">
                <div className="rpt">Texture System</div>
                <div className="size-grid">
                  <div className="size-row">
                    <label>Texture Scale <span>{textureScale.toFixed(1)}x</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={textureScale}
                      onChange={(e) => setTextureScale(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Texture Rotation <span>{textureRotation}°</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="0"
                      max="360"
                      step="5"
                      value={textureRotation}
                      onChange={(e) => setTextureRotation(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Gloss Level <span>{(glossLevel * 100).toFixed(0)}%</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={glossLevel}
                      onChange={(e) => setGlossLevel(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Roughness <span>{(roughnessVal * 100).toFixed(0)}%</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={roughnessVal}
                      onChange={(e) => setRoughnessVal(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Bump Strength <span>{(bumpStrength * 100).toFixed(0)}%</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={bumpStrength}
                      onChange={(e) => setBumpStrength(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* 11. Versions / Export & Save */}
              <div className="rps" style={{ borderBottom: "none" }}>
                <div className="rpt">Versions</div>
                <div className="optlist" style={{ gap: "8px" }}>
                  {[
                    { id: "v1", name: "Oak / U-Shape", desc: "Current version", cls: "s1" },
                    { id: "v2", name: "Matte Gray / L-Shape", desc: "10 mins ago", cls: "s8" },
                    { id: "v3", name: "Glossy White / Island", desc: "Yesterday", cls: "s3" }
                  ].map((v) => (
                    <div
                      key={v.id}
                      className="vi"
                      onClick={() => {
                        triggerNotification("Version Loaded: " + v.name);
                      }}
                    >
                      <div className={`vthumb ${v.cls}`} />
                      <div className="vinfo">
                        <h5>{v.name}</h5>
                        <p>{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="vsave cursor-pointer" style={{ marginTop: "10px" }} onClick={() => triggerNotification("Version saved!")}>
                  + Save current version
                </button>

                {/* format-specific exports grid */}
                <div style={{ marginTop: "15px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Export Design</div>
                  <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                    <div className="sec-n hover-bright cursor-pointer" onClick={handleExportPNG} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>PNG</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={handleExportJPG} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>JPG</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={handleExportPDF} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>PDF</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={handleExportGLB} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>GLB</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={() => handleExportFormat("obj")} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>OBJ</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={() => handleExportFormat("fbx")} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>FBX</div>
                  </div>
                </div>
              </div>
            </>
          ) : activeCategory === "office" ? (
            <>
              {/* OFFICE PANELS */}
              {/* 1. AI Design Assistant */}
              <div className="rps">
                <div className="rpt">✦ AI Prompt</div>
                <div className="aibox">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your office style…&#10;e.g. Modern executive office with walnut and marble"
                  />
                  <div className="aifoot">
                    <div className="aiex-list">
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Executive walnut marble")}>Executive</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Minimal wood glass")}>Minimal</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Home study warm LED")}>Study</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Modern workspace charcoal")}>Modern</span>
                    </div>
                    <button className="aiapply cursor-pointer" onClick={() => { handleRunAI(prompt); setPrompt(""); }}>Apply</button>
                  </div>
                </div>
              </div>

              {/* 2. Selected Part */}
              <div className="rps">
                <div className="rpt">Selected Part</div>
                <div className="pbadge">
                  <div className="pdot"></div>
                  <span>{selectedPart}</span>
                </div>
              </div>

              {/* 3. Office Layout & Room Size */}
              <div className="rps">
                <div className="rpt">Office Layout &amp; Room Size</div>
                <div className="size-grid">
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "5px" }}>Layout Preset</label>
                    <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                      {[
                        { id: "executive", label: "Executive" },
                        { id: "home", label: "Home Office" },
                        { id: "study", label: "Study Room" },
                        { id: "workspace", label: "Workstation" }
                      ].map((lay) => (
                        <div
                          key={lay.id}
                          className={`sec-n ${officeLayoutType === lay.id ? "on" : ""}`}
                          onClick={() => {
                            setOfficeLayoutType(lay.id);
                            if (lay.id === "executive") {
                              setOfficeDeskType("executive");
                              setOfficeChairType("executive");
                            } else if (lay.id === "home") {
                              setOfficeDeskType("compact");
                              setOfficeChairType("visitor");
                            }
                            triggerNotification("Layout set: " + lay.label);
                          }}
                          style={{ fontSize: "10.5px", padding: "6px" }}
                        >
                          {lay.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row">
                    <label>Room Width <span>{officeRoomWidth.toFixed(1)} m</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="2.0"
                      max="5.0"
                      step="0.1"
                      value={officeRoomWidth}
                      onChange={(e) => setOfficeRoomWidth(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Room Length <span>{officeRoomLength.toFixed(1)} m</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="2.0"
                      max="5.0"
                      step="0.1"
                      value={officeRoomLength}
                      onChange={(e) => setOfficeRoomLength(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Room Height <span>{officeRoomHeight.toFixed(1)} m</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="2.2"
                      max="3.5"
                      step="0.1"
                      value={officeRoomHeight}
                      onChange={(e) => setOfficeRoomHeight(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* 4. Feature Wall Configurator */}
              <div className="rps">
                <div className="rpt">Feature Wall Panel</div>
                <div className="size-grid">
                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label style={{ marginBottom: "4px" }}>Wall Style</label>
                    <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                      {[
                        { id: "wood-slat", label: "Slat" },
                        { id: "marble", label: "Marble" },
                        { id: "acoustic", label: "Acoustic" },
                        { id: "painted", label: "Paint" },
                        { id: "concrete", label: "Concrete" }
                      ].map((st) => (
                        <div
                          key={st.id}
                          className={`sec-n ${officeFeatureWallStyle === st.id ? "on" : ""}`}
                          onClick={() => {
                            setOfficeFeatureWallStyle(st.id);
                            triggerNotification("Wall style: " + st.label);
                          }}
                          style={{ fontSize: "10px", padding: "4px" }}
                        >
                          {st.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row">
                    <label>Wall Width <span>{officeFeatureWallWidth.toFixed(1)} m</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="1.0"
                      max="4.0"
                      step="0.1"
                      value={officeFeatureWallWidth}
                      onChange={(e) => setOfficeFeatureWallWidth(parseFloat(e.target.value))}
                    />
                  </div>
                  {officeFeatureWallStyle === "wood-slat" && (
                    <div className="size-row">
                      <label>Slat Spacing <span>{(officeFeatureWallSlatSpacing * 100).toFixed(0)} cm</span></label>
                      <input
                        type="range"
                        className="slider"
                        min="0.02"
                        max="0.12"
                        step="0.01"
                        value={officeFeatureWallSlatSpacing}
                        onChange={(e) => setOfficeFeatureWallSlatSpacing(parseFloat(e.target.value))}
                      />
                    </div>
                  )}
                  <div className="size-row">
                    <label style={{ marginBottom: "5px" }}>Wall Finish Colour</label>
                    <div className="txgrid">
                      {[
                        { id: "walnut", name: "Walnut", cls: "s2" },
                        { id: "oak", name: "Oak", cls: "s1" },
                        { id: "charcoal", name: "Charcoal", style: { background: "#242424" } },
                        { id: "beige", name: "Beige", cls: "s5" },
                        { id: "sage", name: "Sage", cls: "s9" }
                      ].map((sw) => (
                        <div
                          key={sw.id}
                          className={`sw ${sw.cls || ""} ${officeFeatureWallColor === sw.id ? "on" : ""}`}
                          style={sw.style}
                          onClick={() => {
                            setOfficeFeatureWallColor(sw.id);
                            triggerNotification("Wall finish: " + sw.name);
                          }}
                        >
                          <span className="sw-tip">{sw.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Built-in Cabinets List Planner */}
              <div className="rps">
                <div className="rpt">Built-in Cabinets</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto", marginBottom: "10px" }}>
                  {officeCabinets.map((cab, idx) => (
                    <div key={cab.id} style={{ display: "flex", flexDirection: "column", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent)" }}>
                          #{idx + 1}: {cab.type.toUpperCase()} ({cab.width * 100}cm)
                        </span>
                        <span className="cursor-pointer" onClick={() => handleDeleteOfficeCabinet(cab.id)} style={{ fontSize: "12px", color: "#cc4444" }}>🗑️</span>
                      </div>
                      <div className="size-row">
                        <label style={{ fontSize: "9.5px" }}>Width slider</label>
                        <input
                          type="range"
                          className="slider"
                          min="0.4"
                          max="1.2"
                          step="0.1"
                          value={cab.width}
                          onChange={(e) => handleUpdateOfficeCabinetWidth(cab.id, e.target.value)}
                        />
                      </div>
                      {cab.type !== "shelves" && (
                        <div style={{ display: "flex", gap: "4px" }}>
                          {["solid", "glass", "open"].map(dt => (
                            <button
                              key={dt}
                              onClick={() => handleUpdateOfficeCabinetDoor(cab.id, dt)}
                              className={`sec-n ${cab.doorType === dt ? "on" : ""}`}
                              style={{ fontSize: "9px", padding: "3px 6px", flex: 1 }}
                            >
                              {dt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  <button className="sec-n cursor-pointer" onClick={() => handleAddOfficeCabinet("tall", "bookshelf", 0.6)} style={{ fontSize: "10px", padding: "6px" }}>+ Tall Module</button>
                  <button className="sec-n cursor-pointer" onClick={() => handleAddOfficeCabinet("floor", "storage", 0.6)} style={{ fontSize: "10px", padding: "6px" }}>+ Floor Module</button>
                  <button className="sec-n cursor-pointer" onClick={() => handleAddOfficeCabinet("wall", "display", 0.6)} style={{ fontSize: "10px", padding: "6px" }}>+ Wall Module</button>
                  <button className="sec-n cursor-pointer" onClick={() => handleAddOfficeCabinet("shelves", "led-shelf", 0.6)} style={{ fontSize: "10px", padding: "6px" }}>+ Open Shelves</button>
                </div>
              </div>

              {/* 6. Desk & Table Configurator */}
              <div className="rps">
                <div className="rpt">Desk Configurator</div>
                <div className="size-grid">
                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label style={{ marginBottom: "4px" }}>Desk Style</label>
                    <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                      {[
                        { id: "executive", label: "Executive" },
                        { id: "l-shape", label: "L-Shape" },
                        { id: "u-shape", label: "U-Shape" },
                        { id: "floating", label: "Floating" },
                        { id: "compact", label: "Compact" }
                      ].map((dt) => (
                        <div
                          key={dt.id}
                          className={`sec-n ${officeDeskType === dt.id ? "on" : ""}`}
                          onClick={() => {
                            setOfficeDeskType(dt.id);
                            triggerNotification("Desk style: " + dt.label);
                          }}
                          style={{ fontSize: "9px", padding: "4px", textAlign: "center" }}
                        >
                          {dt.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row">
                    <label>Desk Width <span>{officeDeskWidth.toFixed(1)} m</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="1.2"
                      max="2.4"
                      step="0.1"
                      value={officeDeskWidth}
                      onChange={(e) => setOfficeDeskWidth(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Desk Depth <span>{officeDeskDepth.toFixed(2)} m</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="0.6"
                      max="1.1"
                      step="0.05"
                      value={officeDeskDepth}
                      onChange={(e) => setOfficeDeskDepth(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Desk Height <span>{officeDeskHeight.toFixed(2)} m</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="0.65"
                      max="0.85"
                      step="0.01"
                      value={officeDeskHeight}
                      onChange={(e) => setOfficeDeskHeight(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label style={{ marginBottom: "4px" }}>Tabletop Material</label>
                    <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                      {[
                        { id: "wood", label: "Wood" },
                        { id: "marble", label: "Marble" },
                        { id: "quartz", label: "Quartz" },
                        { id: "glass", label: "Glass" },
                        { id: "concrete", label: "Concrete" },
                        { id: "metal", label: "Metal" }
                      ].map((mat) => (
                        <div
                          key={mat.id}
                          className={`sec-n ${officeDeskTopMaterial === mat.id ? "on" : ""}`}
                          onClick={() => {
                            setOfficeDeskTopMaterial(mat.id);
                            triggerNotification("Tabletop material: " + mat.label);
                          }}
                          style={{ fontSize: "9px", padding: "4px", textAlign: "center" }}
                        >
                          {mat.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row">
                    <label style={{ marginBottom: "4px" }}>Tabletop Colour</label>
                    <div className="txgrid">
                      {[
                        { id: "white", name: "Gloss White", style: { background: "#ffffff", border: "1px solid #ddd" } },
                        { id: "black", name: "Jet Black", style: { background: "#1c1c1c" } },
                        { id: "walnut", name: "Walnut Wood", cls: "s2" },
                        { id: "oak", name: "Oak Wood", cls: "s1" }
                      ].map((sw) => (
                        <div
                          key={sw.id}
                          className={`sw ${sw.cls || ""} ${officeDeskTopColor === sw.id ? "on" : ""}`}
                          style={sw.style}
                          onClick={() => {
                            setOfficeDeskTopColor(sw.id);
                            triggerNotification("Tabletop colour: " + sw.name);
                          }}
                        >
                          <span className="sw-tip">{sw.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row">
                    <label style={{ marginBottom: "4px" }}>Desk Drawer Unit Position</label>
                    <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                      {[
                        { id: "left", label: "Left Pedestal" },
                        { id: "right", label: "Right Pedestal" },
                        { id: "dual", label: "Dual Sides" },
                        { id: "center", label: "Center Pencil" },
                        { id: "none", label: "No Drawer" }
                      ].map((dp) => (
                        <div
                          key={dp.id}
                          className={`sec-n ${officeDeskDrawerPos === dp.id ? "on" : ""}`}
                          onClick={() => {
                            setOfficeDeskDrawerPos(dp.id);
                            triggerNotification("Desk drawer: " + dp.label);
                          }}
                          style={{ fontSize: "8.5px", padding: "4px", textAlign: "center" }}
                        >
                          {dp.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  {officeDeskDrawerPos !== "none" && (
                    <>
                      <div className="size-row">
                        <label>Drawers Count <span>{officeDeskDrawerCount}</span></label>
                        <input
                          type="range"
                          className="slider"
                          min="1"
                          max="4"
                          step="1"
                          value={officeDeskDrawerCount}
                          onChange={(e) => setOfficeDeskDrawerCount(parseInt(e.target.value))}
                        />
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className={`scene-btn ${officeDeskDrawersOpen ? "on" : ""}`}
                          style={{ margin: "0", width: "100%", fontSize: "10px", padding: "6px" }}
                          onClick={() => setOfficeDeskDrawersOpen(!officeDeskDrawersOpen)}
                        >
                          🚪 {officeDeskDrawersOpen ? "Close Drawers" : "Slide Open Drawers"}
                        </button>
                        <button
                          className={`scene-btn ${officeDeskLockOption ? "on" : ""}`}
                          style={{ margin: "0", width: "100%", fontSize: "10px", padding: "6px" }}
                          onClick={() => setOfficeDeskLockOption(!officeDeskLockOption)}
                        >
                          🔒 Lock Drawers
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 7. Office Seating (Chairs) */}
              <div className="rps">
                <div className="rpt">Office Seating</div>
                <div className="size-grid">
                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label style={{ marginBottom: "4px" }}>Swivel Chair Base Frame</label>
                    <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                      {["chrome", "black", "silver"].map((fm) => (
                        <div
                          key={fm}
                          className={`sec-n ${officeChairFrame === fm ? "on" : ""}`}
                          onClick={() => {
                            setOfficeChairFrame(fm);
                            triggerNotification("Chair frame: " + fm);
                          }}
                          style={{ fontSize: "10px", padding: "4px", textTransform: "capitalize" }}
                        >
                          {fm}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row">
                    <label style={{ marginBottom: "4px" }}>Chair Leather Cushion Colour</label>
                    <div className="txgrid">
                      {[
                        { id: "black", name: "Black Cushion", style: { background: "#111" } },
                        { id: "brown", name: "Brown Cushion", style: { background: "#5a3e2e" } },
                        { id: "gray", name: "Gray Cushion", style: { background: "#777" } },
                        { id: "cream", name: "Cream Cushion", style: { background: "#eee4d8" } }
                      ].map((sw) => (
                        <div
                          key={sw.id}
                          className={`sw ${sw.cls || ""} ${officeChairColor === sw.id ? "on" : ""}`}
                          style={sw.style}
                          onClick={() => {
                            setOfficeChairColor(sw.id);
                            triggerNotification("Chair cushion: " + sw.name);
                          }}
                        >
                          <span className="sw-tip">{sw.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Tech & Decor Library */}
              <div className="rps">
                <div className="rpt">Tech &amp; Decor Overlays</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <label style={{ fontSize: "10.5px", fontWeight: "600", color: "var(--muted)", textTransform: "uppercase" }}>Technology Library</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" }}>
                      {[
                        { id: "laptop", label: "💻 Laptop" },
                        { id: "pc", label: "🖥️ Desktop PC" },
                        { id: "monitor", label: "📺 Screen Monitor" },
                        { id: "dual-monitors", label: "📟 Dual Screens" },
                        { id: "speakers", label: "🔊 Speakers" },
                        { id: "tv", label: "📺 TV Display" }
                      ].map(item => {
                        const active = officeTechItems.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            className={`sec-n ${active ? "on" : ""}`}
                            style={{ fontSize: "10px", padding: "6px", textAlign: "left" }}
                            onClick={() => {
                              setOfficeTechItems(prev => active ? prev.filter(x => x !== item.id) : [...prev, item.id]);
                            }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "10.5px", fontWeight: "600", color: "var(--muted)", textTransform: "uppercase" }}>Decorations Library</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "4px" }}>
                      {[
                        { id: "plant", label: "🌿 Potted Plant" },
                        { id: "books", label: "📚 Book Stack" },
                        { id: "lamp", label: "💡 Desk Lamp" },
                        { id: "award", label: "🏆 Award Trophy" }
                      ].map(item => {
                        const active = officeDecorItems.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            className={`sec-n ${active ? "on" : ""}`}
                            style={{ fontSize: "10px", padding: "6px", textAlign: "left" }}
                            onClick={() => {
                              setOfficeDecorItems(prev => active ? prev.filter(x => x !== item.id) : [...prev, item.id]);
                            }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 9. Flooring & Room Lighting */}
              <div className="rps">
                <div className="rpt">Flooring &amp; Room Lights</div>
                <div className="size-grid">
                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label style={{ marginBottom: "4px" }}>Floor Material</label>
                    <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                      {[
                        { id: "wood", label: "Wood Plank" },
                        { id: "herringbone", label: "Herringbone" },
                        { id: "marble", label: "Marble" }
                      ].map((fl) => (
                        <div
                          key={fl.id}
                          className={`sec-n ${officeFlooringType === fl.id ? "on" : ""}`}
                          onClick={() => {
                            setOfficeFlooringType(fl.id);
                            triggerNotification("Floor material: " + fl.label);
                          }}
                          style={{ fontSize: "9.5px", padding: "4px", textAlign: "center" }}
                        >
                          {fl.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row">
                    <label>Spotlight Brightness <span>{officeLightingBrightness.toFixed(1)}</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="0.1"
                      max="2.5"
                      step="0.1"
                      value={officeLightingBrightness}
                      onChange={(e) => setOfficeLightingBrightness(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label style={{ marginBottom: "4px" }}>LED Light Temp</label>
                    <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                      {["warm", "cool", "neutral"].map((temp) => (
                        <div
                          key={temp}
                          className={`sec-n ${officeLightingColorTemp === temp ? "on" : ""}`}
                          onClick={() => {
                            setOfficeLightingColorTemp(temp);
                            triggerNotification("LED colour temp: " + temp);
                          }}
                          style={{ fontSize: "10px", padding: "4px", textTransform: "capitalize" }}
                        >
                          {temp}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row" style={{ marginBottom: "6px" }}>
                    <label style={{ marginBottom: "4px" }}>Cabinet Shelves LED Position</label>
                    <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                      {[
                        { id: "back", label: "Rear Wall" },
                        { id: "top", label: "Top board" },
                        { id: "bottom", label: "Undershelf" },
                        { id: "off", label: "LED Off" }
                      ].map((pos) => (
                        <div
                          key={pos.id}
                          className={`sec-n ${officeShelvesLEDPosition === pos.id ? "on" : ""}`}
                          onClick={() => {
                            setOfficeShelvesLEDPosition(pos.id);
                            triggerNotification("LED placement: " + pos.label);
                          }}
                          style={{ fontSize: "9px", padding: "4px", textAlign: "center" }}
                        >
                          {pos.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 10. Interactive Selected Object Editor */}
              <div className="rps" style={{ background: "rgba(212,165,232,0.06)" }}>
                <div className="rpt">Interactive Object Editor</div>
                {selectedOfficeObject ? (
                  <div className="size-grid">
                    <div className="pbadge" style={{ border: "1px solid rgba(212,165,232,0.3)" }}>
                      <div className="pdot" style={{ background: "#d4a5e8" }}></div>
                      <span style={{ fontSize: "10px" }}>Active: {selectedOfficeObject.name}</span>
                    </div>
                    
                    <div className="size-row">
                      <label>Move Horizontal (X) <span>{selectedOfficeObject.posX.toFixed(2)} m</span></label>
                      <input
                        type="range"
                        className="slider"
                        min="-2.0"
                        max="2.0"
                        step="0.05"
                        value={selectedOfficeObject.posX}
                        onChange={(e) => handleUpdateSelectedObject("posX", e.target.value)}
                      />
                    </div>
                    <div className="size-row">
                      <label>Move Height (Y) <span>{selectedOfficeObject.posY.toFixed(2)} m</span></label>
                      <input
                        type="range"
                        className="slider"
                        min="0.0"
                        max="3.0"
                        step="0.05"
                        value={selectedOfficeObject.posY}
                        onChange={(e) => handleUpdateSelectedObject("posY", e.target.value)}
                      />
                    </div>
                    <div className="size-row">
                      <label>Move Depth (Z) <span>{selectedOfficeObject.posZ.toFixed(2)} m</span></label>
                      <input
                        type="range"
                        className="slider"
                        min="-2.0"
                        max="2.0"
                        step="0.05"
                        value={selectedOfficeObject.posZ}
                        onChange={(e) => handleUpdateSelectedObject("posZ", e.target.value)}
                      />
                    </div>

                    <div className="size-row">
                      <label>Y Rotation <span>{selectedOfficeObject.rotY.toFixed(0)}°</span></label>
                      <input
                        type="range"
                        className="slider"
                        min="0"
                        max="360"
                        step="5"
                        value={selectedOfficeObject.rotY}
                        onChange={(e) => handleUpdateSelectedObject("rotY", e.target.value)}
                      />
                    </div>

                    <div className="size-row">
                      <label>Scale Width <span>{selectedOfficeObject.scaleW.toFixed(1)}x</span></label>
                      <input
                        type="range"
                        className="slider"
                        min="0.2"
                        max="3.0"
                        step="0.1"
                        value={selectedOfficeObject.scaleW}
                        onChange={(e) => handleUpdateSelectedObject("scaleW", e.target.value)}
                      />
                    </div>
                    <div className="size-row">
                      <label>Scale Height <span>{selectedOfficeObject.scaleH.toFixed(1)}x</span></label>
                      <input
                        type="range"
                        className="slider"
                        min="0.2"
                        max="3.0"
                        step="0.1"
                        value={selectedOfficeObject.scaleH}
                        onChange={(e) => handleUpdateSelectedObject("scaleH", e.target.value)}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "6px", marginTop: "5px" }}>
                      <button className="sec-n cursor-pointer" onClick={handleDuplicateSelectedObject} style={{ fontSize: "10.5px", padding: "6px", flex: 1 }}>👥 Duplicate</button>
                      <button className="sec-n cursor-pointer" onClick={handleDeleteSelectedObject} style={{ fontSize: "10.5px", padding: "6px", flex: 1, borderColor: "#cc4444", color: "#cc4444" }}>🗑️ Delete</button>
                    </div>

                    <div className="size-row" style={{ marginTop: "4px" }}>
                      <label style={{ fontSize: "9.5px" }}>Quick Material Swapping</label>
                      <div className="chips" style={{ gap: "4px" }}>
                        {["wood", "marble", "glass", "metal", "fabric"].map(m => (
                          <div
                            key={m}
                            className={`chip ${selectedOfficeObject.material === m ? "on" : ""}`}
                            onClick={() => handleReplaceSelectedMaterial(m)}
                            style={{ fontSize: "8.5px", padding: "3px 7px" }}
                          >
                            {m.toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>

                    {(selectedOfficeObject.group === "chair" || selectedOfficeObject.group === "desk") && (
                      <div className="size-row" style={{ marginTop: "4px" }}>
                        <label style={{ fontSize: "9.5px" }}>Model Swapping</label>
                        <div className="chips" style={{ gap: "4px" }}>
                          {selectedOfficeObject.group === "chair" ? (
                            <>
                              <div className="chip" onClick={() => handleReplaceSelectedModel("executive")} style={{ fontSize: "8.5px" }}>Executive</div>
                              <div className="chip" onClick={() => handleReplaceSelectedModel("visitor")} style={{ fontSize: "8.5px" }}>Visitor</div>
                            </>
                          ) : (
                            <>
                              <div className="chip" onClick={() => handleReplaceSelectedModel("executive")} style={{ fontSize: "8.5px" }}>Executive</div>
                              <div className="chip" onClick={() => handleReplaceSelectedModel("floating")} style={{ fontSize: "8.5px" }}>Floating</div>
                              <div className="chip" onClick={() => handleReplaceSelectedModel("compact")} style={{ fontSize: "8.5px" }}>Compact</div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: "10.5px", color: "var(--muted)", fontStyle: "italic", textAlign: "center" }}>
                    💡 Click on any office furniture in the 3D view to translate, rotate, duplicate, or delete it.
                  </p>
                )}
                
                <div style={{ marginTop: "12px", borderTop: "1px dashed var(--border)", paddingTop: "8px" }}>
                  <label style={{ fontSize: "9.5px", fontWeight: "600", textTransform: "uppercase" }}>Add Custom Furniture</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginTop: "4px" }}>
                    <button className="sec-n cursor-pointer" onClick={() => {
                      setOfficeCustomObjects(prev => [...prev, {
                        id: `c-${Date.now()}`,
                        name: `visitorChair-${Date.now().toString().slice(-4)}`,
                        type: "chair-visitor",
                        group: "chair",
                        posX: 0.8, posY: 0.01, posZ: 0.8,
                        rotY: 180, scaleW: 1.0, scaleH: 1.0, scaleD: 1.0
                      }]);
                      triggerNotification("Custom Chair added to scene!");
                    }} style={{ fontSize: "8.5px", padding: "4px" }}>+ Visitor Chair</button>
                    <button className="sec-n cursor-pointer" onClick={() => {
                      setOfficeCustomObjects(prev => [...prev, {
                        id: `c-${Date.now()}`,
                        name: `plant-${Date.now().toString().slice(-4)}`,
                        type: "potted-plant",
                        group: "decor",
                        posX: -0.8, posY: 0.01, posZ: 0.8,
                        rotY: 0, scaleW: 1.0, scaleH: 1.0, scaleD: 1.0
                      }]);
                      triggerNotification("Custom Plant added to scene!");
                    }} style={{ fontSize: "8.5px", padding: "4px" }}>+ Plant Pot</button>
                  </div>
                </div>
              </div>

              {/* 11. Estimation & Exports */}
              <div className="rp-summary" style={{ padding: "12px", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)" }}>ESTIMATED COST</span>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--accent)" }}>
                    ${parseFloat(calculateEstimatedCost()).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <button
                  className="vsave"
                  onClick={() => triggerNotification("Office layout saved to designs list!")}
                  style={{ width: "100%", fontSize: "11px", padding: "6px" }}
                >
                  Save Current Design
                </button>

                <div style={{ marginTop: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Export Options</div>
                  <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                    <div className="sec-n hover-bright cursor-pointer" onClick={handleExportPNG} style={{ fontSize: "10px", padding: "6px", textAlign: "center" }}>PNG</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={handleExportJPG} style={{ fontSize: "10px", padding: "6px", textAlign: "center" }}>JPG</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={handleExportPDF} style={{ fontSize: "10px", padding: "6px", textAlign: "center" }}>PDF</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={handleExportGLB} style={{ fontSize: "10px", padding: "6px", textAlign: "center" }}>GLB</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={() => handleExportFormat("obj")} style={{ fontSize: "10px", padding: "6px", textAlign: "center" }}>OBJ</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={() => handleExportFormat("fbx")} style={{ fontSize: "10px", padding: "6px", textAlign: "center" }}>FBX</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* AI Prompt */}
              <div className="rps">
                <div className="rpt">✦ AI Prompt</div>
                <div className="aibox">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your style…&#10;e.g. Dark walnut with gold handles and warm LED"
                  />
                  <div className="aifoot">
                    <div className="aiex-list">
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Luxury gold")}>Luxury</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Minimal white")}>Minimal</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Dark walnut")}>Walnut</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Add warm LED")}>LED</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Mirror doors")}>Mirror</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("Navy modern")}>Navy</span>
                    </div>
                    <button className="aiapply cursor-pointer" onClick={() => { handleRunAI(prompt); setPrompt(""); }}>Apply</button>
                  </div>
                </div>
              </div>

              {/* Selected Part */}
              <div className="rps">
                <div className="rpt">Selected Part</div>
                <div className="pbadge">
                  <div className="pdot"></div>
                  <span>{selectedPart}</span>
                </div>
              </div>

              {/* Size & Structure */}
              <div className="rps">
                <div className="rpt">Size & Structure</div>
                <div className="size-grid">
                  <div className="size-row">
                    <label>Width <span>{width.toFixed(1)} m</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="1.6"
                      max="3.2"
                      step="0.1"
                      value={width}
                      onChange={(e) => setWidth(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Height <span>{height.toFixed(1)} m</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="1.8"
                      max="3.0"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Depth <span>{depth.toFixed(2)} m</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="0.4"
                      max="0.8"
                      step="0.05"
                      value={depth}
                      onChange={(e) => setDepth(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="size-row">
                    <label>Door Sections</label>
                    <div className="section-btns">
                      {[2, 3, 4].map((num) => (
                        <div
                          key={num}
                          className={`sec-n ${sections === num ? "on" : ""}`}
                          onClick={() => {
                            setSections(num);
                            triggerNotification(num + "-section wardrobe built");
                          }}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Style Preset */}
              <div className="rps">
                <div className="rpt">Style Preset</div>
                <div className="chips">
                  {Object.keys(PRESETS).map((key) => (
                    <div
                      key={key}
                      className={`chip ${activePreset === key ? "on" : ""}`}
                      onClick={() => handleApplyPreset(key)}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Wardrobe Colour - all parts */}
              <div className="rps">
                <div className="rpt">Wardrobe Colour <span style={{ fontSize: ".6rem", color: "var(--muted2)", fontWeight: "400", letterSpacing: 0 }}>(all parts)</span></div>
                <div className="txgrid">
                  {[
                    { id: "oak", name: "Oak", cls: "s1" },
                    { id: "walnut", name: "Walnut", cls: "s2" },
                    { id: "white", name: "White", cls: "s3" },
                    { id: "black", name: "Black", cls: "s4" },
                    { id: "beige", name: "Beige", cls: "s5" },
                    { id: "mahog", name: "Mahog.", cls: "s6" },
                    { id: "linen", name: "Linen", cls: "s7" },
                    { id: "graph", name: "Graphite", cls: "s8" },
                    { id: "sage", name: "Sage", cls: "s9" },
                    { id: "navy", name: "Navy", cls: "s10" },
                    { id: "concrete", name: "Concrete", style: { background: "linear-gradient(135deg,#c4c0b8,#a8a49c)" } },
                    { id: "darkwood", name: "Dark Wood", style: { background: "linear-gradient(135deg,#2a2422,#1a1614)" } },
                  ].map((sw) => (
                    <div
                      key={sw.id}
                      className={`sw ${sw.cls || ""} ${activeColor === sw.id ? "on" : ""}`}
                      style={sw.style}
                      onClick={() => {
                        setActiveColor(sw.id);
                        setActiveFaceColor(sw.id);
                        triggerNotification("Colour: " + sw.name);
                      }}
                    >
                      <span className="sw-tip">{sw.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Door & Drawer Face Colour Override */}
              <div className="rps">
                <div className="rpt">Door &amp; Drawer Face <span style={{ fontSize: ".6rem", color: "var(--muted2)", fontWeight: "400", letterSpacing: 0 }}>(override)</span></div>
                <div className="txgrid">
                  {[
                    { id: "oak", name: "Oak", cls: "s1" },
                    { id: "walnut", name: "Walnut", cls: "s2" },
                    { id: "white", name: "White", cls: "s3" },
                    { id: "black", name: "Black", cls: "s4" },
                    { id: "beige", name: "Beige", cls: "s5" },
                    { id: "mahog", name: "Mahog.", cls: "s6" },
                    { id: "linen", name: "Linen", cls: "s7" },
                    { id: "graph", name: "Graphite", cls: "s8" },
                    { id: "sage", name: "Sage", cls: "s9" },
                    { id: "navy", name: "Navy", cls: "s10" },
                    { id: "concrete", name: "Concrete", style: { background: "linear-gradient(135deg,#c4c0b8,#a8a49c)" } },
                    { id: "darkwood", name: "Dark Wood", style: { background: "linear-gradient(135deg,#2a2422,#1a1614)" } },
                  ].map((sw) => (
                    <div
                      key={sw.id}
                      className={`sw ${sw.cls || ""} ${activeFaceColor === sw.id ? "on" : ""}`}
                      style={sw.style}
                      onClick={() => {
                        setActiveFaceColor(sw.id);
                        triggerNotification("Face colour: " + sw.name);
                      }}
                    >
                      <span className="sw-tip">{sw.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Door Style */}
              <div className="rps">
                <div className="rpt">Door Style</div>
                <div className="optlist">
                  {[
                    { id: "solid", label: "🪵 Solid Panel" },
                    { id: "glass", label: "🔷 Glass Panel" },
                    { id: "mirror", label: "🪞 Full Mirror" },
                    { id: "frosted", label: "❄️ Frosted Glass" },
                  ].map((style) => (
                    <div
                      key={style.id}
                      className={`opt ${doorStyle === style.id ? "on" : ""}`}
                      onClick={() => {
                        setDoorStyle(style.id);
                        triggerNotification("Door style: " + style.label.replace(/[^a-zA-Z ]/g, ""));
                      }}
                    >
                      {style.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Handle Style */}
              <div className="rps">
                <div className="rpt">Handle Style</div>
                <div className="optlist">
                  {[
                    { id: "gold", label: "— Gold Bar" },
                    { id: "silver", label: "◎ Silver Knob" },
                    { id: "black", label: "▬ Black Strip" },
                    { id: "hidden", label: "⊘ Hidden Push" },
                    { id: "chrome", label: "✦ Chrome" },
                  ].map((handle) => (
                    <div
                      key={handle.id}
                      className={`opt ${handleStyle === handle.id ? "on" : ""}`}
                      onClick={() => {
                        setHandleStyle(handle.id);
                        triggerNotification("Handle style: " + handle.label.replace(/[^a-zA-Z ]/g, ""));
                      }}
                    >
                      {handle.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawers */}
              <div className="rps">
                <div className="rpt">Drawers</div>
                <div className="size-row" style={{ marginBottom: "8px" }}>
                  <label style={{ marginBottom: "5px" }}>Exterior Drawer Rows</label>
                  <div className="section-btns">
                    {[0, 1, 2, 3].map((num) => (
                      <div
                        key={num}
                        className={`sec-n ${extDrawerRows === num ? "on" : ""}`}
                        onClick={() => {
                          setExtDrawerRows(num);
                          triggerNotification(num === 0 ? "Drawers removed" : `${num} rows added`);
                        }}
                      >
                        {num === 0 ? "None" : `${num} Row${num > 1 ? "s" : ""}`}
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  className={`scene-btn ${hangerRods ? "on" : ""}`}
                  style={{ margin: "0 0 7px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                  onClick={() => {
                    setHangerRods(!hangerRods);
                    triggerNotification(!hangerRods ? "Hanger rods added — top shelf removed for space" : "Hanger rods removed");
                  }}
                >
                  <span style={{ background: hangerRods ? "#8a7adc" : "#5a5855", width: "18px", height: "18px", borderRadius: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", marginRight: "8px" }}>🪝</span>
                  {hangerRods ? "Remove Hanger Rods" : "Add Hanger Rods"}
                </button>
                <button 
                  className="scene-btn" 
                  style={{ margin: 0, width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }} 
                  onClick={handleToggleAllDrawers}
                >
                  <span style={{ background: "#f4a261", width: "18px", height: "18px", borderRadius: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", marginRight: "8px" }}>📂</span>
                  Open All Drawers
                </button>
                
                <p style={{ fontSize: ".68rem", color: "var(--muted2)", marginTop: "7px" }}>
                  💡 Click any drawer to open/close it individually
                </p>
              </div>

              {/* LED Lighting */}
              <div className="rps">
                <div className="rpt">LED Lighting</div>
                <div className="ledrow">
                  {["off", "warm", "cool", "rgb"].map((mode) => (
                    <div
                      key={mode}
                      className={`lb ${ledLighting === mode ? "on" : ""}`}
                      onClick={() => setLedLighting(mode)}
                    >
                      {mode === "off" ? "Off" : mode.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Versions */}
              <div className="rps" style={{ borderBottom: "none" }}>
                <div className="rpt">Versions</div>
                <div className="optlist" style={{ gap: "8px" }}>
                  {[
                    { id: "oak", name: "Golden Oak", desc: "Current · now", cls: "s1" },
                    { id: "walnut", name: "Dark Walnut", desc: "v2 · 5 min ago", cls: "s2" },
                    { id: "white", name: "Glossy White", desc: "v3 · 12 min ago", cls: "s3" }
                  ].map((v) => (
                    <div
                      key={v.id}
                      className={`vi ${activeColor === v.id ? "on" : ""}`}
                      onClick={() => {
                        setActiveColor(v.id);
                        setDoorStyle("solid");
                        triggerNotification("Version Loaded: " + v.name);
                      }}
                    >
                      <div className={`vthumb ${v.cls}`} />
                      <div className="vinfo">
                        <h5>{v.name}</h5>
                        <p>{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="vsave cursor-pointer" style={{ marginTop: "10px" }} onClick={() => triggerNotification("Version saved!")}>
                  + Save current version
                </button>

                {/* format-specific exports grid */}
                <div style={{ marginTop: "15px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Export Design</div>
                  <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                    <div className="sec-n hover-bright cursor-pointer" onClick={handleExportPNG} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>PNG</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={handleExportJPG} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>JPG</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={handleExportPDF} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>PDF</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={handleExportGLB} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>GLB</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={() => handleExportFormat("obj")} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>OBJ</div>
                    <div className="sec-n hover-bright cursor-pointer" onClick={() => handleExportFormat("fbx")} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>FBX</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dynamic Toast notifications */}
      <div className={`notif ${showNotif ? "show" : ""}`}>
        {notifText}
      </div>
    </div>
  );
}
