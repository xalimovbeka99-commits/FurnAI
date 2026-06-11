"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useTheme } from "../../components/ThemeProvider";
import ProductionModal from "../../components/ProductionModal";
import { generateProductionSpec } from "../../lib/productionSpec";

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

// ─── OFFICE DESIGNER PROCEDURAL TEXTURES ───
function woodTex(c1, c2, dens = 1) {
  if (typeof window === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 512;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, 512, 512);
  const n = Math.floor(68 * dens);
  for (let i = 0; i < n; i++) {
    ctx.strokeStyle = c2;
    ctx.globalAlpha = 0.1 + Math.random() * 0.2;
    ctx.lineWidth = 0.5 + Math.random() * 1.8;
    const y = (i / (n - 1)) * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 20) {
      ctx.lineTo(x, y + (Math.random() - 0.5) * 4.5);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function marbleTex(base, vein, alpha = 0.35) {
  if (typeof window === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 512;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 22; i++) {
    ctx.strokeStyle = vein;
    ctx.globalAlpha = alpha * (0.25 + Math.random() * 0.75);
    ctx.lineWidth = 0.3 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, Math.random() * 512);
    ctx.bezierCurveTo(
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 512
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function noiseTex(hexA, hexB) {
  if (typeof window === "undefined") return null;
  const toRgb = (h) => {
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const ctx = cv.getContext("2d");
  const id = ctx.createImageData(256, 256);
  const [r1, g1, b1] = toRgb(hexA);
  const [r2, g2, b2] = toRgb(hexB);
  for (let i = 0; i < id.data.length; i += 4) {
    const t = Math.random();
    id.data[i] = r1 + (r2 - r1) * t;
    id.data[i + 1] = g1 + (g2 - g1) * t;
    id.data[i + 2] = b1 + (b2 - b1) * t;
    id.data[i + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

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

  // ─── Production & Export States ───
  const [productionModalOpen, setProductionModalOpen] = useState(false);
  const [currentProductionSpec, setCurrentProductionSpec] = useState(null);

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

  // ─── Office Designer States (Rebuilt from Reference HTML) ───
  const officeMatsRef = useRef(null);
  const [officeDeskW, setOfficeDeskW] = useState(2.4);
  const [officeDeskD, setOfficeDeskD] = useState(1.0);
  const [officeDeskH, setOfficeDeskH] = useState(0.75);
  const [officeDeskT, setOfficeDeskT] = useState(0.06);
  const [officeDeskTopMat, setOfficeDeskTopMat] = useState("natural_oak");
  const [officeDeskBaseMat, setOfficeDeskBaseMat] = useState("matte_beige");
  const [officeDeskDrawer, setOfficeDeskDrawer] = useState(true);
  const [officeDeskDrawerCount, setOfficeDeskDrawerCount] = useState(3);
  const [officeDeskDrawerSide, setOfficeDeskDrawerSide] = useState("left");
  const [officeDeskDrawerStyle, setOfficeDeskDrawerStyle] = useState("closed");
  const [officeDeskFileCab, setOfficeDeskFileCab] = useState(false);

  const [officeCabW, setOfficeCabW] = useState(4.0);
  const [officeCabH, setOfficeCabH] = useState(2.8);
  const [officeCabD, setOfficeCabD] = useState(0.40);
  const [officeCabSections, setOfficeCabSections] = useState(3);
  const [officeCabOpenShelves, setOfficeCabOpenShelves] = useState(3);
  const [officeCabLowerDoors, setOfficeCabLowerDoors] = useState(4);
  const [officeCabLowerHRatio, setOfficeCabLowerHRatio] = useState(0.40);
  const [officeCabColor, setOfficeCabColor] = useState("beige");
  const [officeCabPanelMat, setOfficeCabPanelMat] = useState("natural_oak");
  const [officeCabShelfSpacing, setOfficeCabShelfSpacing] = useState("even");
  const [officeCabAutoSync, setOfficeCabAutoSync] = useState(true);

  const [officeLedOn, setOfficeLedOn] = useState(true);
  const [officeLedColor, setOfficeLedColor] = useState("warm");
  const [officeLedBright, setOfficeLedBright] = useState(0.70);
  const [officeLedUnder, setOfficeLedUnder] = useState(true);
  const [officeLedBack, setOfficeLedBack] = useState(false);
  const [officeLedTop, setOfficeLedTop] = useState(false);

  const [selectedOfficeObject, setSelectedOfficeObject] = useState(null);

  // ─── TV Wall Unit States ───
  const [tvWallShelves, setTvWallShelves] = useState(2);
  const [tvWallSize, setTvWallSize] = useState("65");
  const [tvWallLed, setTvWallLed] = useState(true);
  const [tvWallStorage, setTvWallStorage] = useState(true);

  // ─── Cabinet States ───
  const [cabinetDrawerRows, setCabinetDrawerRows] = useState(2);
  const [cabinetOpenTop, setCabinetOpenTop] = useState(true);
  const [cabinetLegs, setCabinetLegs] = useState("metal"); // metal, wood, none

  // ─── Bed States ───
  const [bedSize, setBedSize] = useState("queen"); // single, double, queen, king
  const [bedHeadboard, setBedHeadboard] = useState("padded"); // padded, wood, tall, low
  const [bedStorage, setBedStorage] = useState(false);
  const [bedLedUnder, setBedLedUnder] = useState(false);

  // ─── Shelving Unit States ───
  const [shelfCount, setShelfCount] = useState(5);
  const [shelfBackPanel, setShelfBackPanel] = useState(true);
  const [shelfStyle, setShelfStyle] = useState("open"); // open, ladder, cube

  // ─── Dressing Table States ───
  const [dressingDrawers, setDressingDrawers] = useState(2);
  const [dressingMirror, setDressingMirror] = useState("round"); // round, rect, trifold, none
  const [dressingStool, setDressingStool] = useState(true);
  const [dressingLights, setDressingLights] = useState("hollywood"); // none, led-strip, hollywood
  const [dressingTableMat, setDressingTableMat] = useState("oak"); // oak, walnut, white, black

  // ─── TV Wall Extra States ───
  const [tvPanelStyle, setTvPanelStyle] = useState("slats"); // slats, solid, stone
  const [tvSoundBar, setTvSoundBar] = useState(true);
  const [tvConsoleLegs, setTvConsoleLegs] = useState(true);
  const [tvLedColor, setTvLedColor] = useState("warm"); // warm, cool, rgb

  // ─── Cabinet Extra States ───
  const [cabinetGlassDoors, setCabinetGlassDoors] = useState(false);
  const [cabinetDoorCount, setCabinetDoorCount] = useState(2); // 2, 3, 4
  const [cabinetStyle, setCabinetStyle] = useState("sideboard"); // sideboard, highboy, filing

  // ─── Bed Extra States ───
  const [bedBench, setBedBench] = useState(false);
  const [bedPillowCount, setBedPillowCount] = useState(2); // 2, 4
  const [bedLampStyle, setBedLampStyle] = useState("table"); // table, pendant, none
  const [bedFrameStyle, setBedFrameStyle] = useState("platform"); // platform, panel, floating

  // ─── Shelves Extra States ───
  const [shelfLighting, setShelfLighting] = useState(true);
  const [shelfDecorItems, setShelfDecorItems] = useState(true);
  const [shelfMaterial, setShelfMaterial] = useState("oak"); // oak, walnut, white, black, metal

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

  // Initialize from URL parameters (Phase One - NLP pre-population)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    // Map extracted parameters to builder state
    if (params.has("type")) {
      const type = params.get("type");
      if (["wardrobe", "kitchen", "office", "bed", "cabinet", "shelves", "table", "dressing_table"].includes(type)) {
        setActiveCategory(type);
      }
    }

    if (params.has("style")) {
      const style = params.get("style");
      if (["luxury", "minimal", "scandi", "industrial", "classic", "modern", "navy"].includes(style)) {
        setActivePreset(style);
      }
    }

    if (params.has("color")) {
      const color = params.get("color");
      if (["oak", "walnut", "white", "black", "beige", "mahogany", "linen", "graphite", "sage", "navy", "concrete", "darkwood"].includes(color)) {
        setActiveColor(color);
        setActiveFaceColor(color);
      }
    }

    if (params.has("doorType")) {
      const doorType = params.get("doorType");
      if (["solid", "glass", "mirror", "frosted"].includes(doorType)) {
        setDoorStyle(doorType);
      }
    }

    if (params.has("handleStyle")) {
      const handleStyle = params.get("handleStyle");
      if (["gold", "silver", "black", "hidden", "chrome"].includes(handleStyle)) {
        setHandleStyle(handleStyle);
      }
    }

    if (params.has("drawerRows")) {
      const drawerRows = parseInt(params.get("drawerRows"));
      if ([0, 1, 2, 3].includes(drawerRows)) {
        setExtDrawerRows(drawerRows);
      }
    }

    if (params.has("hangerRods")) {
      setHangerRods(params.get("hangerRods") === "true");
    }

    if (params.has("ledLighting")) {
      const ledLighting = params.get("ledLighting");
      if (["off", "warm", "cool", "rgb"].includes(ledLighting)) {
        setLedLighting(ledLighting);
      }
    }

    // Dimensions (in cm, convert to m for the builder which uses meters)
    if (params.has("width")) {
      const width = parseFloat(params.get("width"));
      if (!isNaN(width)) setWidth(width / 100);
    }

    if (params.has("height")) {
      const height = parseFloat(params.get("height"));
      if (!isNaN(height)) setHeight(height / 100);
    }

    if (params.has("depth")) {
      const depth = parseFloat(params.get("depth"));
      if (!isNaN(depth)) setDepth(depth / 100);
    }
  }, []);

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
    kitchenCabinetPremiumFinish
  ]);

  // ─── 3D OFFICE MESH GENERATOR (Rebuilt from Reference HTML) ───
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

    // Helper: bx box builder
    const bx = (w, h, d, mat, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    // Initialize/cache office materials
    if (!officeMatsRef.current) {
      const M_off = {};
      M_off.natural_oak  = new THREE.MeshStandardMaterial({map:woodTex('#C8A96E','#8C6A3A'),roughness:.75,metalness:.02});
      M_off.walnut       = new THREE.MeshStandardMaterial({map:woodTex('#6B3F1E','#3A1E08'),roughness:.78,metalness:.02});
      M_off.dark_walnut  = new THREE.MeshStandardMaterial({map:woodTex('#3A2010','#1A0E06'),roughness:.80,metalness:.02});
      M_off.ash          = new THREE.MeshStandardMaterial({map:woodTex('#D8C9A8','#A89060',1.4),roughness:.72,metalness:.02});
      M_off.black_wood   = new THREE.MeshStandardMaterial({map:woodTex('#1A1614','#0A0806'),roughness:.82,metalness:.04});
      M_off.white_wood   = new THREE.MeshStandardMaterial({map:woodTex('#EDE8DF','#C8C0B0',1.4),roughness:.72,metalness:0});
      M_off.matte_lam    = new THREE.MeshStandardMaterial({color:0xD0C9BE,roughness:.95,metalness:0});
      M_off.high_gloss   = new THREE.MeshStandardMaterial({color:0xEAE6E0,roughness:.04,metalness:.08});
      M_off.white_marble = new THREE.MeshStandardMaterial({map:marbleTex('#F5F5F0','#C8C4C0',.28),roughness:.14,metalness:.08});
      M_off.black_marble = new THREE.MeshStandardMaterial({map:marbleTex('#1A1A1C','#3C3C42',.40),roughness:.20,metalness:.12});
      M_off.grey_marble  = new THREE.MeshStandardMaterial({map:marbleTex('#B0AFAC','#787674',.33),roughness:.18,metalness:.10});
      M_off.travertine   = new THREE.MeshStandardMaterial({map:noiseTex('D4C4A0','B8A884'),roughness:.88,metalness:0});
      M_off.matte_beige  = new THREE.MeshStandardMaterial({color:0xBEB4A6,roughness:.92,metalness:0});
      M_off.matte_white  = new THREE.MeshStandardMaterial({color:0xEFEFED,roughness:.90,metalness:0});
      M_off.matte_black  = new THREE.MeshStandardMaterial({color:0x1C1C1E,roughness:.88,metalness:.05});
      M_off.dark_grey_base=new THREE.MeshStandardMaterial({color:0x3A3A3C,roughness:.85,metalness:.05});
      M_off.metal_dark   = new THREE.MeshStandardMaterial({color:0x2A2826,roughness:.28,metalness:.9});
      M_off.metal_gold   = new THREE.MeshStandardMaterial({color:0xBD8D3C,roughness:.22,metalness:.92});
      M_off.floor        = new THREE.MeshStandardMaterial({map:woodTex('#D4C098','#A88C60',1.8),roughness:.84,metalness:0});
      M_off.wall         = new THREE.MeshStandardMaterial({color:0xF0EDE5,roughness:1,metalness:0});
      M_off.wall_side    = new THREE.MeshStandardMaterial({color:0xECE9E1,roughness:1,metalness:0});
      if (M_off.floor && M_off.floor.map) {
        M_off.floor.map.repeat.set(6, 6);
      }
      officeMatsRef.current = M_off;
    }

    const M_off = officeMatsRef.current;
    const CAB_HEX = {
      beige:0xBEB4A6, sand:0xC5B99A, white:0xEFEFED, ivory:0xEEE8D6,
      light_grey:0xCACAC6, dark_grey:0x3A3A3C, taupe:0x8A8274,
      black:0x1A1A1C, walnut_col:0x6B3F1E, oak_col:0xC8A96E
    };

    // Dynamic Materials
    const cabColorHex = CAB_HEX[officeCabColor] || 0xBEB4A6;
    const _cabMat = new THREE.MeshStandardMaterial({ color: cabColorHex, roughness: 0.90, metalness: 0 });

    const cols = { warm: 0xFFD070, neutral: 0xFFF5CC, cool: 0xD0E8FF };
    const ledCol = cols[officeLedColor] || 0xFFD070;
    const _ledMat = new THREE.MeshStandardMaterial({
      emissive: new THREE.Color(ledCol),
      emissiveIntensity: officeLedBright * 3.8,
      roughness: 1,
      metalness: 0
    });

    const getTopMat = () => M_off[officeDeskTopMat] || M_off.natural_oak;
    const getBaseMat = () => officeDeskBaseMat === 'match_top' ? getTopMat() : (M_off[officeDeskBaseMat] || M_off.matte_beige);
    const getPanelMat = () => M_off[officeCabAutoSync ? officeDeskTopMat : officeCabPanelMat] || M_off.natural_oak;

    // ─── ENVIRONMENT ────────────────────────────────
    // Floor
    const fl = bx(18, .03, 18, M_off.floor, 0, -.015, 0);
    fl.castShadow = false;
    app.root.add(fl);
    // Back wall
    app.root.add(bx(18, 5, .1, M_off.wall, 0, 2.5, -4.2));
    // Side walls
    app.root.add(bx(.1, 5, 18, M_off.wall_side, -7.5, 2.5, 0));
    app.root.add(bx(.1, 5, 18, M_off.wall_side, 7.5, 2.5, 0));

    // ─── DESK ───────────────────────────────────────
    const deskGrp = new THREE.Group();
    const topM = getTopMat();
    const baseM = getBaseMat();
    const metalM = M_off.metal_dark;
    const goldM = M_off.metal_gold;

    // — Tabletop
    deskGrp.add(bx(officeDeskW + .04, officeDeskT, officeDeskD + .04, topM, 0, officeDeskH - officeDeskT / 2, 0));
    // Accent edge strip (gold/metal)
    deskGrp.add(bx(officeDeskW + .04, .005, .012, goldM, 0, officeDeskH - officeDeskT - .003, officeDeskD / 2 + .018));

    // — Left pedestal (main, wider)
    const pW = .56;
    const pH = officeDeskH - officeDeskT;
    const pD = officeDeskD * .93;
    deskGrp.add(bx(pW, pH, pD, baseM, -officeDeskW / 2 + pW / 2, pH / 2, 0));

    // — Right pedestal (narrower)
    const rW = .32;
    deskGrp.add(bx(rW, pH, pD, baseM, officeDeskW / 2 - rW / 2, pH / 2, 0));

    // — Drawers on left pedestal
    if (officeDeskDrawer) {
      const dH = (pH - .04) / officeDeskDrawerCount;
      for (let i = 0; i < officeDeskDrawerCount; i++) {
        const dy = .03 + i * (dH + .007) + dH / 2;
        const df = bx(pW - .04, dH - .006, .019, officeDeskDrawerStyle === 'open' ? M_off.metal_dark : baseM,
          -officeDeskW / 2 + pW / 2, dy, pD / 2 + .005);
        df.userData = { group: "ext-drawer" };
        deskGrp.add(df);
        // Thin gap line
        deskGrp.add(bx(pW - .04, .0025, .022, metalM, -officeDeskW / 2 + pW / 2, dy + dH / 2 - .005, pD / 2 + .005));
        // Handle bar
        deskGrp.add(bx(.14, .007, .014, metalM, -officeDeskW / 2 + pW / 2, dy, pD / 2 + .018));
      }
    }

    // — Right side drawers if 'both' or 'right'
    if (officeDeskDrawer && (officeDeskDrawerSide === 'right' || officeDeskDrawerSide === 'both')) {
      const n = Math.max(2, officeDeskDrawerCount - 1);
      const dH2 = (pH - .04) / n;
      for (let i = 0; i < n; i++) {
        const dy = .03 + i * (dH2 + .007) + dH2 / 2;
        const df = bx(rW - .04, dH2 - .006, .019, baseM, officeDeskW / 2 - rW / 2, dy, pD / 2 + .005);
        df.userData = { group: "ext-drawer" };
        deskGrp.add(df);
        deskGrp.add(bx(.09, .007, .014, metalM, officeDeskW / 2 - rW / 2, dy, pD / 2 + .018));
      }
    }

    // — File cabinet extension
    if (officeDeskFileCab) {
      const fcW = rW + .12;
      const fcH = pH * .48;
      const fcD = pD;
      deskGrp.add(bx(fcW, fcH, fcD, baseM, officeDeskW / 2 - rW / 2 + fcW * .55, fcH / 2, 0));
      for (let i = 0; i < 2; i++) {
        const fy = .03 + i * (fcH * .5 - .03) + fcH * .25;
        deskGrp.add(bx(fcW - .04, fcH * .5 - .016, .02, baseM, officeDeskW / 2 - rW / 2 + fcW * .55, fy, pD / 2 + .006));
      }
    }

    // — Modesty back panel
    const mpW = officeDeskW - pW - rW - .08;
    deskGrp.add(bx(mpW, .46, .022, baseM, (rW - pW) / 2 * .5, .23, -officeDeskD / 2 + .013));

    deskGrp.position.set(0, 0, 1.6);
    app.root.add(deskGrp);

    // ─── WALL CABINET ───────────────────────────────
    const cabGrp = new THREE.Group();
    const lH = officeCabH * officeCabLowerHRatio;
    const uH = officeCabH - lH;
    const sideW = Math.max(.36, officeCabW * .10);
    const cenW = officeCabW - sideW * 2;
    const shT = .026;
    const panM = getPanelMat();

    // — Full back panel
    cabGrp.add(bx(officeCabW, officeCabH, .022, _cabMat, 0, officeCabH / 2, -officeCabD / 2 + .012));
    // — Top cap
    cabGrp.add(bx(officeCabW + .02, .028, officeCabD, _cabMat, 0, officeCabH - .014, 0));
    // — Bottom base
    cabGrp.add(bx(officeCabW + .02, .04, officeCabD, _cabMat, 0, .02, 0));

    // — Left tall side unit
    cabGrp.add(bx(sideW, officeCabH, officeCabD, _cabMat, -officeCabW / 2 + sideW / 2, officeCabH / 2, 0));
    cabGrp.add(bx(sideW - .02, officeCabH - .03, .02, _cabMat, -officeCabW / 2 + sideW / 2, officeCabH / 2, officeCabD / 2 - .009));
    // — Right tall side unit
    cabGrp.add(bx(sideW, officeCabH, officeCabD, _cabMat, officeCabW / 2 - sideW / 2, officeCabH / 2, 0));
    cabGrp.add(bx(sideW - .02, officeCabH - .03, .02, _cabMat, officeCabW / 2 - sideW / 2, officeCabH / 2, officeCabD / 2 - .009));

    // — Center vertical dividers
    const secW = cenW / officeCabSections;
    for (let i = 1; i < officeCabSections; i++) {
      const dvX = -cenW / 2 + i * secW;
      cabGrp.add(bx(.024, uH, officeCabD, _cabMat, dvX, lH + uH / 2, 0));
    }

    // — Decorative back panels per upper section
    for (let i = 0; i < officeCabSections; i++) {
      const sx = -cenW / 2 + i * secW + secW / 2;
      cabGrp.add(bx(secW - .048, uH - .05, .018, panM, sx, lH + uH / 2, -officeCabD / 2 + .028));
    }

    // — Open shelves in upper zone
    const ns = officeCabOpenShelves;
    const aH = uH - .04;
    for (let sh = 0; sh <= ns; sh++) {
      let y;
      if (officeCabShelfSpacing === 'even') y = lH + .02 + aH / (ns + 1) * (sh + 1);
      else if (officeCabShelfSpacing === 'top') y = lH + .02 + aH * (1 - Math.pow(1 - (sh + 1) / (ns + 1), 1.55));
      else y = lH + .02 + aH * Math.pow((sh + 1) / (ns + 1), 1.55);

      cabGrp.add(bx(cenW + .005, shT, officeCabD - .022, _cabMat, 0, y, 0));

      if (officeLedOn && sh > 0) {
        const cols_led = { warm: 0xFFCC60, neutral: 0xFFFCCC, cool: 0xCCE8FF };
        const lc = cols_led[officeLedColor] || 0xFFCC60;
        
        if (officeLedUnder) {
          cabGrp.add(bx(cenW * .88, .009, .016, _ledMat, 0, y - shT / 2 - .005, -officeCabD / 2 + .056));
          const pl = new THREE.PointLight(lc, officeLedBright * 0.5, 2.2, 2);
          pl.position.set(0, y - .04, -officeCabD / 2 + .12);
          cabGrp.add(pl);
        }
        if (officeLedBack) {
          const seg = aH / (ns + 1);
          const blY = y - seg * .35;
          [cenW / 2 + .002, -cenW / 2 - .002].forEach(bx_ => {
            const bl = bx(.01, seg * .65, .009, _ledMat, bx_, blY, -officeCabD / 2 + .028);
            cabGrp.add(bl);
          });
        }
      }
    }

    // — Top cove LED
    if (officeLedOn && officeLedTop) {
      cabGrp.add(bx(officeCabW * .82, .009, .014, _ledMat, 0, officeCabH - .042, -officeCabD / 2 + .042));
      const pl = new THREE.PointLight(0xFFEE99, officeLedBright * 0.6, 3, 2);
      pl.position.set(0, officeCabH - .1, 0);
      cabGrp.add(pl);
    }

    // — Lower zone: floor shelf at lH
    cabGrp.add(bx(cenW + .005, shT, officeCabD - .022, _cabMat, 0, lH, 0));
    // — Lower side panels
    cabGrp.add(bx(sideW, lH, officeCabD, _cabMat, -officeCabW / 2 + sideW / 2, lH / 2, 0));
    cabGrp.add(bx(sideW, lH, officeCabD, _cabMat, officeCabW / 2 - sideW / 2, lH / 2, 0));

    // — Lower door panels — pivot-based (children of cabGrp so they inherit its z=-2.9 offset)
    const nd = Math.max(1, officeCabLowerDoors);
    const dW = (cenW - .01 * (nd - 1)) / nd;
    const dH = lH - .065;

    for (let d = 0; d < nd; d++) {
      const isLeft = d < nd / 2;
      // Hinge x within cabGrp local space
      const hingeX = -cenW / 2 + d * (dW + .01) + (isLeft ? 0 : dW);
      const pivot = new THREE.Group();
      // Position in cabGrp local space — front face of cabinet
      pivot.position.set(hingeX, lH / 2 + .01, officeCabD / 2);
      cabGrp.add(pivot);  // child of cabGrp — inherits the -2.9 z offset

      const faceOffX = isLeft ? dW / 2 : -dW / 2;
      const doorM = new THREE.Mesh(new THREE.BoxGeometry(dW - .01, dH, .020), _cabMat);
      doorM.position.set(faceOffX, 0, .010);
      doorM.castShadow = true;
      doorM.name = `offDoor${d}`;
      doorM.userData.group = "door";
      pivot.add(doorM);

      // Gap line at top
      cabGrp.add(bx(dW - .01, .002, .022, metalM, -cenW/2 + d*(dW+.01) + dW/2, lH + .01, officeCabD / 2 - .001));

      // Handle on inner edge
      const hm = new THREE.Mesh(new THREE.BoxGeometry(.050, .007, .014), metalM);
      hm.position.set(isLeft ? dW * .76 : -dW * .76, -dH * .1, .020);
      hm.userData.group = "handle";
      pivot.add(hm);

      const openDir = isLeft ? -Math.PI * 0.72 : Math.PI * 0.72;
      app.doorPivots.push({ pivot, target: app.doorsOpen ? openDir : 0, openDir, i: d });
      if (app.doorsOpen) pivot.rotation.y = openDir;
    }

    cabGrp.position.set(0, 0, -2.9);
    app.root.add(cabGrp);

    // Studio lighting spot lights
    const studioSpot = (x, y, z, intensity) => {
      const s = new THREE.SpotLight(0xFFFCF5, intensity, 15, Math.PI / 6.5, 0.55, 1.2);
      s.position.set(x, y, z);
      s.castShadow = true;
      s.shadow.mapSize.set(1024, 1024);
      app.root.add(s);
    };
    studioSpot(-1.5, 5.5, 3, 0.7);
    studioSpot(2.5, 5.5, 3, 0.55);

  }, [
    officeDeskW, officeDeskD, officeDeskH, officeDeskT, officeDeskTopMat, officeDeskBaseMat, officeDeskDrawer, officeDeskDrawerCount, officeDeskDrawerSide, officeDeskDrawerStyle, officeDeskFileCab,
    officeCabW, officeCabH, officeCabD, officeCabSections, officeCabOpenShelves, officeCabLowerDoors, officeCabLowerHRatio, officeCabColor, officeCabPanelMat, officeCabShelfSpacing, officeCabAutoSync,
    officeLedOn, officeLedColor, officeLedBright, officeLedUnder, officeLedBack, officeLedTop
  ]);

  const buildTVWall = useCallback(() => {
    const app = appRef.current;
    if (!app.root) return;

    while (app.root.children.length) app.root.remove(app.root.children[0]);
    app.selectables = [];
    app.doorPivots = [];
    app.drawerPivots = [];
    app.shelvesMeshes = [];

    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const mesh = (geo, mat, x, y, z, n) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      m.name = n || "";
      return m;
    };
    const add = (m, group) => {
      m.userData.group = group || "body";
      app.root.add(m);
      app.selectables.push(m);
      return m;
    };

    const W = Math.max(width, 2.0);
    const D = Math.max(depth * 0.55, 0.30);
    const T = 0.022;
    const wallZ = -D / 2;
    const mountY = 1.30;

    // ── Wall panel behind TV ─────────────────────────────────────────
    const panelW = W * 1.35;
    const panelH = 2.80;
    if (tvPanelStyle === "slats") {
      // Vertical wood slats
      const slatMat = new THREE.MeshStandardMaterial({ color: 0x3A2A1A, roughness: 0.72, metalness: 0.02 });
      const slatW = 0.06; const slatGap = 0.025;
      const nSlats = Math.floor(panelW / (slatW + slatGap));
      for (let s = 0; s < nSlats; s++) {
        const sx = -panelW / 2 + s * (slatW + slatGap) + slatW / 2;
        app.root.add(mesh(box(slatW, panelH, 0.022), slatMat, sx, panelH / 2, wallZ - 0.011, `slt${s}`));
      }
      // Backing wall
      const backMat = new THREE.MeshStandardMaterial({ color: 0x1A1614, roughness: 0.95 });
      app.root.add(mesh(box(panelW + 0.10, panelH, 0.010), backMat, 0, panelH / 2, wallZ - 0.024, "wallBack"));
    } else if (tvPanelStyle === "stone") {
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x3C3830, roughness: 0.78, metalness: 0.08 });
      app.root.add(mesh(box(panelW, panelH, 0.032), stoneMat, 0, panelH / 2, wallZ - 0.016, "stoneWall"));
    } else {
      const solidMat = new THREE.MeshStandardMaterial({ color: 0x1E1C1A, roughness: 0.88 });
      app.root.add(mesh(box(panelW, panelH, 0.015), solidMat, 0, panelH / 2, wallZ - 0.008, "solidWall"));
    }

    // ── TV Screen ────────────────────────────────────────────────────
    const diag = parseFloat(tvWallSize) || 65;
    const tvW = diag * 0.0254 * 0.872;
    const tvH = (tvW * 9) / 16;
    const tvZ = wallZ + 0.05;

    const screenMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.10, metalness: 0.65 });
    const displayMat = new THREE.MeshStandardMaterial({ color: 0x0a0e18, roughness: 0.04, metalness: 0.15, emissive: new THREE.Color(0x0a1020), emissiveIntensity: 0.55 });
    // Thin bezel frame
    add(mesh(box(tvW + 0.028, tvH + 0.028, 0.026), screenMat, 0, mountY + tvH / 2, tvZ, "tvBezel"), "tv");
    add(mesh(box(tvW, tvH, 0.014), displayMat, 0, mountY + tvH / 2, tvZ + 0.020, "tvDisplay"), "tv");
    // Wall bracket
    add(mesh(box(0.12, 0.08, 0.06), screenMat, 0, mountY + tvH / 2, tvZ - 0.025, "tvBracket"), "tv");

    // ── LED Backlight ────────────────────────────────────────────────
    if (tvWallLed) {
      const ledColors = { warm: 0xFFCC44, cool: 0x88CCFF, rgb: 0xFF44AA };
      const ledHex = ledColors[tvLedColor] || 0xFFCC44;
      const ledMat = new THREE.MeshStandardMaterial({ color: ledHex, emissive: new THREE.Color(ledHex), emissiveIntensity: 2.2, roughness: 0.5 });
      add(mesh(box(tvW + 0.08, tvH + 0.08, 0.008), ledMat, 0, mountY + tvH / 2, tvZ - 0.018, "tvLedGlow"), "led");
      const pl = new THREE.PointLight(ledHex, 1.1, 7);
      pl.position.set(0, mountY + tvH / 2, 0.5);
      app.root.add(pl);
      app.ledLight = pl;
    } else { app.ledLight = null; }

    // ── Sound Bar ────────────────────────────────────────────────────
    if (tvSoundBar) {
      const sbMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1C, roughness: 0.45, metalness: 0.55 });
      const sbY = mountY - 0.055;
      add(mesh(box(tvW * 0.88, 0.068, 0.078), sbMat, 0, sbY, tvZ + 0.005, "soundBar"), "body");
      // Speaker grille texture (dots)
      const grilleMat = new THREE.MeshStandardMaterial({ color: 0x2A2A2C, roughness: 0.8 });
      for (let gi = -3; gi <= 3; gi++) {
        add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.072, 8), grilleMat, gi * 0.06, sbY, tvZ + 0.040, `sbDot${gi}`), "body");
      }
    }

    // ── Floating Media Console ───────────────────────────────────────
    const cabH = 0.44;
    const cabY = tvConsoleLegs ? 0.20 + cabH / 2 : cabH / 2;

    if (tvConsoleLegs) {
      // Hairpin legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0xC0A030, roughness: 0.12, metalness: 0.90 });
      for (const [sx, sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
        add(mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.20, 8), legMat, sx*(W/2-0.12), 0.10, sz*(D/2-0.08), `conLeg${sx}${sz}`), "leg");
      }
    }

    add(mesh(box(W, cabH, D), app.M.body, 0, cabY, 0, "tvConsole"), "body");
    // Shadow gap / reveal
    add(mesh(box(W - 0.03, 0.014, D - 0.03), app.M.plinth, 0, cabY - cabH/2 - 0.008, 0, "conReveal"), "body");

    if (tvWallStorage) {
      const dc = 3; const dW = (W - T*(dc+1)) / dc;
      for (let i = 0; i < dc; i++) {
        const dx = -W/2 + T + dW/2 + i*(dW+T);
        add(mesh(box(dW, cabH - 0.05, T*0.8), app.M.drawerFront, dx, cabY, D/2 + T/2, `conDoor${i}`), "door");
        // Recessed handle slot
        add(mesh(box(dW*0.55, 0.012, 0.012), app.M.handle, dx, cabY - 0.04, D/2 + T, `conHandle${i}`), "handle");
      }
    } else {
      // Open shelf with inner light
      add(mesh(box(W - 0.03, 0.012, D - 0.04), app.M.drawerFront, 0, cabY + cabH/2 - 0.05, 0, "conOpenShelf"), "shelf");
      // Center strip LED
      const innerLed = new THREE.MeshStandardMaterial({ color: 0xFFEEAA, emissive: new THREE.Color(0xFFEEAA), emissiveIntensity: 1.2, roughness: 0.8 });
      add(mesh(box(W - 0.06, 0.008, 0.012), innerLed, 0, cabY - cabH/2 + 0.025, D/2 - 0.035, "conInnerLed"), "led");
    }

    // ── Floating side shelves ────────────────────────────────────────
    const numShelves = Math.max(0, tvWallShelves);
    const shelfMat = app.M.body;
    const decorMats = [
      new THREE.MeshStandardMaterial({ color: 0x8B2020, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0x205080, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0x3A6030, roughness: 0.85 }),
    ];
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x2A5A20, roughness: 0.9 });
    const potMat = new THREE.MeshStandardMaterial({ color: 0xC07040, roughness: 0.75 });

    for (let i = 0; i < numShelves; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const sw = W * 0.30;
      const sd = D * 0.85;
      const shX = side * (W/2 - sw/2 - 0.06);
      const shY = mountY + tvH * 0.3 + i * 0.50;
      // Shelf board
      add(mesh(box(sw, 0.025, sd), shelfMat, shX, shY, 0, `tvShelf${i}`), "shelf");
      // Wall bracket
      add(mesh(box(0.015, 0.10, sd * 0.5), app.M.plinth, shX, shY - 0.05, -sd/4, `tvBkt${i}`), "body");
      // Decor objects
      let bx2 = shX - sw * 0.35;
      for (let b = 0; b < 4; b++) {
        const bw = 0.035 + (b % 2) * 0.015;
        const bh = 0.14 + (b % 3) * 0.04;
        app.root.add(mesh(box(bw, bh, sd*0.55), decorMats[b % 3], bx2 + bw/2, shY + 0.025 + bh/2, 0, `tvBook${i}_${b}`));
        bx2 += bw + 0.008;
      }
      // Small plant on one shelf
      if (i === 0) {
        app.root.add(mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.07, 8), potMat, shX + sw*0.32, shY + 0.025 + 0.035, 0, "tvPot"));
        app.root.add(mesh(new THREE.SphereGeometry(0.06, 8, 6), plantMat, shX + sw*0.32, shY + 0.025 + 0.07 + 0.05, 0, "tvPlant"));
      }
    }

    app.root.position.set(0, 0, 0);
  }, [width, depth, tvWallShelves, tvWallSize, tvWallLed, tvWallStorage, tvPanelStyle, tvSoundBar, tvConsoleLegs, tvLedColor]);

  // ─────────────────────────────────────────────────────────────────────────
  // Cabinet builder — compact carcass with configurable drawer rows, an
  // optional open-top display compartment, and a choice of leg styles.
  // ─────────────────────────────────────────────────────────────────────────
  const buildCabinet = useCallback(() => {
    const app = appRef.current;
    if (!app.root) return;

    while (app.root.children.length) app.root.remove(app.root.children[0]);
    app.selectables = [];
    app.doorPivots = [];
    app.drawerPivots = [];
    app.shelvesMeshes = [];

    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const mesh = (geo, mat, x, y, z, n) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      m.name = n || "";
      return m;
    };
    const add = (m, group) => {
      m.userData.group = group || "body";
      app.root.add(m);
      app.selectables.push(m);
      return m;
    };

    // Style-based dimensions
    const styleDims = {
      sideboard: { W: Math.min(Math.max(width, 1.0), 1.8), H: 0.80, D: Math.max(depth * 0.75, 0.42) },
      highboy:   { W: Math.min(Math.max(width, 0.7), 1.0), H: 1.35, D: Math.max(depth * 0.65, 0.38) },
      filing:    { W: Math.min(Math.max(width, 0.5), 0.55), H: 1.20, D: Math.max(depth * 0.75, 0.55) },
    };
    const dims = styleDims[cabinetStyle] || styleDims.sideboard;
    const { W, H, D } = dims;
    const T = 0.020;
    const legH = cabinetLegs === "none" ? 0.015 : (cabinetLegs === "metal" ? 0.14 : 0.08);

    // ── Legs ─────────────────────────────────────────────────────────
    if (cabinetLegs !== "none") {
      const legMat = cabinetLegs === "metal"
        ? new THREE.MeshStandardMaterial({ color: 0xC8A030, roughness: 0.10, metalness: 0.92 })
        : app.M.plinth;
      for (const [sx, sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
        const legGeo = cabinetLegs === "metal"
          ? new THREE.CylinderGeometry(0.013, 0.010, legH, 12)
          : box(0.06, legH, 0.06);
        add(mesh(legGeo, legMat, sx*(W/2-0.09), legH/2, sz*(D/2-0.09), `cabLeg${sx}${sz}`), "leg");
      }
    }

    // ── Carcass panels ──────────────────────────────────────────────
    const base = legH;
    add(mesh(box(T, H, D), app.M.body, -(W/2-T/2), base + H/2, 0, "cabL"), "body");
    add(mesh(box(T, H, D), app.M.body,  (W/2-T/2), base + H/2, 0, "cabR"), "body");
    add(mesh(box(W, T, D), app.M.body, 0, base + H - T/2, 0, "cabTop"), "body");
    add(mesh(box(W, T, D), app.M.body, 0, base + T/2, 0, "cabBot"), "body");
    add(mesh(box(W-T*2, H-T*2, 0.010), app.M.plinth, 0, base + T + (H-T*2)/2, -(D/2-0.005), "cabBack"), "body");

    // ── Top display zone (open or closed) ──────────────────────────
    if (cabinetOpenTop) {
      const dispH = cabinetStyle === "sideboard" ? 0.28 : 0.22;
      const dispBase = base + H;
      add(mesh(box(T, dispH, D), app.M.body, -(W/2-T/2), dispBase + dispH/2, 0, "dispL"), "body");
      add(mesh(box(T, dispH, D), app.M.body,  (W/2-T/2), dispBase + dispH/2, 0, "dispR"), "body");
      add(mesh(box(W, T, D), app.M.body, 0, dispBase + dispH, 0, "dispTop"), "body");
      const dispShelf = mesh(box(W-T*2, 0.015, D-0.01), app.M.plinth, 0, dispBase + 0.008, 0, "dispShelf");
      dispShelf.userData.group = "shelf";
      app.root.add(dispShelf);
      app.selectables.push(dispShelf);
      app.shelvesMeshes.push(dispShelf);
      // Decorative items on display shelf
      const vMat = new THREE.MeshStandardMaterial({ color: 0x4A8060, roughness: 0.7 });
      const pMat = new THREE.MeshStandardMaterial({ color: 0xC07844, roughness: 0.65 });
      app.root.add(mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.18, 8), vMat, -W*0.25, dispBase + 0.015 + 0.09, D*0.15, "vase1"));
      app.root.add(mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2A5020, roughness: 0.9 }), -W*0.25, dispBase + 0.015 + 0.18 + 0.05, D*0.15, "plant1"));
      app.root.add(mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.12, 8), pMat,  W*0.25, dispBase + 0.015 + 0.06, 0, "vase2"));
    }

    // ── Mid shelf (highboy / filing) ─────────────────────────────────
    if (cabinetStyle !== "sideboard") {
      const midZ = base + H * 0.50;
      const midShelf = mesh(box(W-T*2, T*0.9, D-0.01), app.M.plinth, 0, midZ, 0, "cabMidShelf");
      midShelf.userData.group = "shelf";
      app.root.add(midShelf);
      app.selectables.push(midShelf);
      app.shelvesMeshes.push(midShelf);
    }

    // ── Lower door section — pivot-based so Open Doors animates them ──
    const lowerH = cabinetStyle === "sideboard" ? H : H * 0.48;
    const lowerBase = base + T;
    const dc = Math.max(2, cabinetDoorCount);
    const dW = (W - T*(dc+1)) / dc;
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xCCDDEE, transparent: true, opacity: 0.30, roughness: 0.04, metalness: 0.15 });
    const dH = lowerH - 0.010 - T;

    for (let i = 0; i < dc; i++) {
      const isLeft = i < dc / 2;
      // Hinge edge x position
      const hingeX = -W/2 + T + i*(dW + T) + (isLeft ? 0 : dW);

      const pivot = new THREE.Group();
      pivot.position.set(hingeX, lowerBase, D/2);
      app.root.add(pivot);

      // Door face offset from hinge edge
      const faceOffsetX = isLeft ? dW/2 : -dW/2;

      const doorFace = cabinetGlassDoors
        ? new THREE.Mesh(box(dW - 0.008, dH, 0.005), glassMat)
        : new THREE.Mesh(box(dW - 0.008, dH, T*0.8), app.M.drawerFront);
      doorFace.position.set(faceOffsetX, dH/2, T/2);
      doorFace.castShadow = true;
      doorFace.name = `cabDoor${i}`;
      doorFace.userData.group = "door";
      pivot.add(doorFace);
      app.selectables.push(doorFace);

      if (cabinetGlassDoors) {
        const frame = new THREE.Mesh(box(dW - 0.008, dH, T*0.5), app.M.body);
        frame.position.set(faceOffsetX, dH/2, T*0.25);
        frame.name = `cabFrame${i}`;
        frame.userData.group = "door";
        pivot.add(frame);
      }

      // Handle on inner edge
      const handleOffset = isLeft ? dW*0.76 : -dW*0.76;
      const handleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.12, 10), app.M.handle);
      handleMesh.position.set(handleOffset, dH/2, T + 0.012);
      handleMesh.name = `cabH${i}`;
      handleMesh.userData.group = "handle";
      pivot.add(handleMesh);

      const openDir = isLeft ? -Math.PI * 0.72 : Math.PI * 0.72;
      app.doorPivots.push({ pivot, target: app.doorsOpen ? openDir : 0, openDir, i });
      if (app.doorsOpen) pivot.rotation.y = openDir;
    }

    // ── Upper drawer section (highboy / filing only) ─────────────────
    if (cabinetStyle !== "sideboard") {
      const rows = Math.max(1, cabinetDrawerRows);
      const upperBase = base + H * 0.50 + T;
      const upperH = H * 0.50 - T;
      const rowH = upperH / rows;
      for (let r = 0; r < rows; r++) {
        const cy = upperBase + r*rowH + rowH/2;
        add(mesh(box(W-T*2, rowH-0.010, T*0.8), app.M.drawerFront, 0, cy, D/2 + T/2, `cabDrw${r}`), "drawer");
        add(mesh(box(W*0.45, 0.012, 0.012), app.M.handle, 0, cy, D/2 + T + 0.004, `cabDrwH${r}`), "handle");
      }
    } else {
      // Sideboard: top drawer strip
      const rows = Math.max(1, cabinetDrawerRows);
      const drwH = (H * 0.28 - T) / rows;
      for (let r = 0; r < rows; r++) {
        const cy = base + H*(1 - 0.28) + T + r*drwH + drwH/2;
        add(mesh(box(W-T*2, drwH-0.010, T*0.8), app.M.drawerFront, 0, cy, D/2 + T/2, `cabSBDrw${r}`), "drawer");
        add(mesh(box(W*0.40, 0.011, 0.011), app.M.handle, 0, cy, D/2 + T + 0.004, `cabSBH${r}`), "handle");
      }
    }

    // ── Tabletop reveal edge ─────────────────────────────────────────
    add(mesh(box(W + 0.02, T*0.8, D + 0.02), app.M.body, 0, base + H + T*0.4, 0, "cabLip"), "body");

    app.root.position.set(0, 0, 0);
  }, [width, depth, height, cabinetDrawerRows, cabinetOpenTop, cabinetLegs, cabinetGlassDoors, cabinetDoorCount, cabinetStyle]);

  // ─────────────────────────────────────────────────────────────────────────
  // Bed builder — frame, mattress, pillows, headboard styles, optional
  // under-bed storage drawers, and an optional under-bed LED glow strip.
  // ─────────────────────────────────────────────────────────────────────────
  const buildBed = useCallback(() => {
    const app = appRef.current;
    if (!app.root) return;

    while (app.root.children.length) app.root.remove(app.root.children[0]);
    app.selectables = [];
    app.doorPivots = [];
    app.drawerPivots = [];
    app.shelvesMeshes = [];

    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const cyl = (r, h, seg=12) => new THREE.CylinderGeometry(r, r, h, seg);
    const sph = (r, seg=10) => new THREE.SphereGeometry(r, seg, 8);
    const mesh = (geo, mat, x, y, z, n) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      m.name = n || "";
      return m;
    };
    const add = (m, group) => {
      m.userData.group = group || "body";
      app.root.add(m);
      app.selectables.push(m);
      return m;
    };

    const T = 0.022;  // panel thickness
    const sizes = { single:{w:0.95,l:1.95}, double:{w:1.40,l:1.95}, queen:{w:1.65,l:2.05}, king:{w:1.95,l:2.10} };
    const { w: W, l: L } = sizes[bedSize] || sizes.queen;

    const frameH = bedFrameStyle === "floating" ? 0.18 : 0.26;
    const legH   = bedFrameStyle === "floating" ? 0.12 : (bedFrameStyle === "platform" ? 0.06 : 0.14);
    const mattH  = 0.26;

    const mattMat    = new THREE.MeshStandardMaterial({ color: 0xF2EFE9, roughness: 0.88 });
    const pillowMat  = new THREE.MeshStandardMaterial({ color: 0xFAF8F4, roughness: 0.92 });
    const sheetMat   = new THREE.MeshStandardMaterial({ color: 0xE8E4DC, roughness: 0.86 });
    const goldMat    = new THREE.MeshStandardMaterial({ color: 0xC8A030, roughness: 0.12, metalness: 0.90 });
    const lampMat    = new THREE.MeshStandardMaterial({ color: 0xF0D880, roughness: 0.30 });
    const nsStandMat = new THREE.MeshStandardMaterial({ color: 0x9A7858, roughness: 0.70 });

    // ── Platform / frame ─────────────────────────────────────────────
    if (bedFrameStyle === "floating") {
      // Slim floating slab (no visible legs)
      add(mesh(box(W + 0.04, frameH, L + 0.06), app.M.body, 0, legH + frameH/2, 0, "bedBase"), "body");
      // Hairpin legs hidden inside
      for (const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
        add(mesh(cyl(0.010, legH), goldMat, sx*(W/2-0.14), legH/2, sz*(L/2-0.18), `bLeg${sx}${sz}`), "leg");
      }
    } else {
      // Solid platform base
      add(mesh(box(W + 0.04, frameH, L + 0.04), app.M.body, 0, legH + frameH/2, 0, "bedBase"), "body");
      const legMat = bedFrameStyle === "panel" ? app.M.plinth : goldMat;
      const legSz  = bedFrameStyle === "panel" ? 0.08 : 0.014;
      for (const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
        const lGeo = bedFrameStyle === "panel" ? box(legSz, legH, legSz) : cyl(legSz, legH);
        add(mesh(lGeo, legMat, sx*(W/2-0.10), legH/2, sz*(L/2-0.14), `bLeg${sx}${sz}`), "leg");
      }
      // Side rails
      add(mesh(box(T, frameH*0.6, L-0.04), app.M.plinth, -(W/2), legH + frameH*0.5, 0, "railL"), "body");
      add(mesh(box(T, frameH*0.6, L-0.04), app.M.plinth,  (W/2), legH + frameH*0.5, 0, "railR"), "body");
    }

    // ── Mattress ──────────────────────────────────────────────────────
    const mattZ = legH + frameH + mattH/2;
    add(mesh(box(W - 0.04, mattH, L - 0.06), mattMat, 0, legH + frameH + mattH/2, 0, "mattress"), "mattress");
    // Mattress piping edge
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xDDD8D0, roughness: 0.85 });
    add(mesh(box(W - 0.04, 0.016, L - 0.06), pipeMat, 0, legH + frameH + mattH - 0.008, 0, "mattPipe"), "mattress");

    // ── Duvet / Sheet ─────────────────────────────────────────────────
    const sheetTopZ = legH + frameH + mattH;
    add(mesh(box(W - 0.04, 0.08, L * 0.62), sheetMat, 0, sheetTopZ + 0.04, L * 0.19, "duvet"), "mattress");
    // Turned-back fold
    add(mesh(box(W - 0.04, 0.025, L * 0.12), sheetMat, 0, sheetTopZ + 0.08 + 0.012, -L * 0.01, "duvetFold"), "mattress");

    // ── Pillows ───────────────────────────────────────────────────────
    const pillowPositions = bedPillowCount >= 4
      ? [[-1,0],[-0.33,0],[0.33,0],[1,0]]
      : [[-1,0],[1,0]];
    pillowPositions.forEach(([t, _], i) => {
      const px = t * (W * 0.22);
      add(mesh(box(W * (bedPillowCount >= 4 ? 0.22 : 0.38), 0.12, 0.46), pillowMat,
        px, sheetTopZ + 0.06, -L/2 + 0.36, `pillow${i}`), "pillow");
      // Pillow puff
      add(mesh(sph(0.08), pillowMat, px, sheetTopZ + 0.10, -L/2 + 0.36, `pillowPuff${i}`), "pillow");
    });

    // ── Headboard ─────────────────────────────────────────────────────
    const hbConfigs = {
      padded: { h: 0.95, t: 0.11, mat: app.M.drawerFront },
      wood:   { h: 0.72, t: 0.05, mat: app.M.body },
      tall:   { h: 1.25, t: 0.10, mat: app.M.drawerFront },
      low:    { h: 0.42, t: 0.04, mat: app.M.body },
    };
    const hb = hbConfigs[bedHeadboard] || hbConfigs.padded;
    add(mesh(box(W + 0.06, hb.h, hb.t), hb.mat, 0, legH + hb.h/2, -L/2 - hb.t/2, "headboard"), "headboard");
    // Decorative tufting channels (vertical)
    if (bedHeadboard === "padded" || bedHeadboard === "tall") {
      for (let si = -2; si <= 2; si++) {
        add(mesh(box(0.008, hb.h - 0.08, 0.005), app.M.body, si*(W/4.5), legH + hb.h/2, -L/2 - hb.t + 0.003, `stitch${si}`), "headboard");
      }
      // Horizontal channel
      add(mesh(box(W - 0.04, 0.008, 0.005), app.M.body, 0, legH + hb.h * 0.48, -L/2 - hb.t + 0.003, "stitchH"), "headboard");
    }

    // ── Footboard ─────────────────────────────────────────────────────
    const fbH = bedHeadboard === "tall" ? 0.32 : 0.22;
    add(mesh(box(W + 0.06, fbH, 0.045), app.M.body, 0, legH + fbH/2, L/2 + 0.022, "footboard"), "body");

    // ── Under-bed storage drawers — slide animation via drawerPivots ─────
    if (bedStorage) {
      for (const [sx, i] of [[-1,0],[1,1]]) {
        const drwGrp = new THREE.Group();
        drwGrp.position.set(sx*W*0.25, legH + frameH*0.28, L*0.18);
        app.root.add(drwGrp);

        const drwFace = new THREE.Mesh(box(W*0.44, frameH*0.55, L*0.45), app.M.drawerFront);
        drwFace.name = `bedDrw${i}`;
        drwFace.userData.group = "drawer";
        drwFace.castShadow = true;
        drwGrp.add(drwFace);
        app.selectables.push(drwFace);

        const drwHandle = new THREE.Mesh(box(0.12, 0.013, 0.013), app.M.handle);
        drwHandle.position.set(0, 0, L*0.225);
        drwHandle.userData.group = "handle";
        drwGrp.add(drwHandle);
        app.selectables.push(drwHandle);

        const openZ = L * 0.46;
        app.drawerPivots.push({ group: drwGrp, targetZ: app.drawersAllOpen ? openZ : 0, openZ, open: app.drawersAllOpen });
        if (app.drawersAllOpen) drwGrp.position.z = L*0.18 + openZ;
      }
    }

    // ── Under-bed LED ─────────────────────────────────────────────────
    if (bedLedUnder) {
      const ledCols = { warm: 0xFFDD88, cool: 0xC0D8FF, rgb: 0xFF88CC, off: 0x88AAFF };
      const ledHex = ledCols[ledLighting] || 0x88AAFF;
      const ledMat = new THREE.MeshStandardMaterial({ color: ledHex, emissive: new THREE.Color(ledHex), emissiveIntensity: 1.8, roughness: 0.5 });
      add(mesh(box(W-0.04, 0.010, L-0.04), ledMat, 0, legH - 0.005, 0, "bedLed"), "led");
      const pl = new THREE.PointLight(ledHex, 0.9, 5);
      pl.position.set(0, 0.06, 0);
      app.root.add(pl);
      app.ledLight = pl;
    } else { app.ledLight = null; }

    // ── Nightstands ───────────────────────────────────────────────────
    const nsW = 0.50, nsH = legH + frameH + 0.06, nsD = 0.40;
    for (const sx of [-1, 1]) {
      const nx = sx * (W/2 + nsW/2 + 0.08);
      // Body
      add(mesh(box(nsW, nsH, nsD), nsStandMat, nx, nsH/2, -L/4, `ns${sx}`), "body");
      // Drawer
      add(mesh(box(nsW-0.025, nsH*0.35, 0.014), app.M.drawerFront, nx, nsH*0.28, -L/4 + nsD/2 + 0.007, `nsDrw${sx}`), "drawer");
      add(mesh(box(0.08, 0.011, 0.011), app.M.handle, nx, nsH*0.28, -L/4 + nsD/2 + 0.014, `nsDrwH${sx}`), "handle");

      if (bedLampStyle === "table") {
        // Table lamp
        add(mesh(cyl(0.055, 0.028, 8), goldMat, nx, nsH + 0.014, -L/4, `lampBase${sx}`), "body");
        add(mesh(cyl(0.010, 0.32, 8), app.M.plinth, nx, nsH + 0.014 + 0.16, -L/4, `lampPole${sx}`), "body");
        add(mesh(new THREE.ConeGeometry(0.12, 0.18, 12, 1, true), lampMat, nx, nsH + 0.014 + 0.32 + 0.09, -L/4, `lampShade${sx}`), "body");
      } else if (bedLampStyle === "pendant") {
        // Pendant cord from ceiling
        add(mesh(cyl(0.004, 1.10, 6), app.M.plinth, nx, nsH + 0.55 + 0.55, -L/4, `pendCord${sx}`), "body");
        add(mesh(new THREE.SphereGeometry(0.09, 12, 8), lampMat, nx, nsH + 0.55 - 0.09, -L/4, `pendBulb${sx}`), "body");
      }
    }

    // ── Bench at foot of bed ──────────────────────────────────────────
    if (bedBench) {
      const benchMat = new THREE.MeshStandardMaterial({ color: 0xC0A888, roughness: 0.80 });
      const cushMat  = new THREE.MeshStandardMaterial({ color: 0xE8D4C4, roughness: 0.88 });
      const bY = legH + 0.28; const bZ = L/2 + 0.30;
      add(mesh(box(W * 0.80, 0.05, 0.40), benchMat, 0, bY, bZ, "benchBody"), "body");
      add(mesh(box(W * 0.78, 0.07, 0.38), cushMat, 0, bY + 0.06, bZ, "benchCush"), "body");
      for (const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
        add(mesh(box(0.04, bY, 0.04), goldMat, sx*(W*0.37), bY/2, bZ + sz*0.16, `bLeg${sx}${sz}`), "leg");
      }
    }

    app.root.position.set(0, 0, 0);
  }, [bedSize, bedHeadboard, bedStorage, bedLedUnder, bedBench, bedPillowCount, bedLampStyle, bedFrameStyle, ledLighting]);

  // ─────────────────────────────────────────────────────────────────────────
  // Shelving unit builder — open frame with a choice of layout styles
  // (open shelves, ladder, or cube grid) and an optional back panel.
  // ─────────────────────────────────────────────────────────────────────────
  const buildShelves = useCallback(() => {
    const app = appRef.current;
    if (!app.root) return;

    while (app.root.children.length) app.root.remove(app.root.children[0]);
    app.selectables = [];
    app.doorPivots = [];
    app.drawerPivots = [];
    app.shelvesMeshes = [];

    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const mesh = (geo, mat, x, y, z, n) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      m.name = n || "";
      return m;
    };
    const add = (m, group) => {
      m.userData.group = group || "body";
      app.root.add(m);
      app.selectables.push(m);
      if (group === "shelf") app.shelvesMeshes.push(m);
      return m;
    };

    const W = Math.min(Math.max(width, 0.6), 2.0);
    const H = Math.min(Math.max(height, 1.2), 2.4);
    const D = Math.max(depth * 0.65, 0.28);
    const T = 0.022;

    // ── Material based on shelfMaterial state ────────────────────────
    const matColors = { oak:0xC09060, walnut:0x5A3018, white:0xF0EDE5, black:0x1C1C1E, metal:0x7A7A7E };
    const frameCol = matColors[shelfMaterial] || matColors.oak;
    const isMetalFrame = shelfMaterial === "metal";
    const frameMat = isMetalFrame
      ? new THREE.MeshStandardMaterial({ color: frameCol, roughness: 0.25, metalness: 0.80 })
      : new THREE.MeshStandardMaterial({ color: frameCol, roughness: 0.70, metalness: 0.02 });
    const shelfBoardMat = new THREE.MeshStandardMaterial({ color: frameCol + 0x0A0808, roughness: 0.68, metalness: isMetalFrame ? 0.75 : 0.01 });

    // ── Frame ────────────────────────────────────────────────────────
    if (isMetalFrame) {
      // Thin tube uprights for metal frame
      for (const sx of [-1,1]) {
        add(mesh(new THREE.CylinderGeometry(T/2, T/2, H, 8), frameMat, sx*(W/2-T/2), H/2, -(D/2-T/2), `side${sx}B`));
        add(mesh(new THREE.CylinderGeometry(T/2, T/2, H, 8), frameMat, sx*(W/2-T/2), H/2,  (D/2-T/2), `side${sx}F`));
        add(mesh(box(T*0.8, T*0.8, D-T), frameMat, sx*(W/2-T/2), T/2, 0, `baseBar${sx}`));
        add(mesh(box(T*0.8, T*0.8, D-T), frameMat, sx*(W/2-T/2), H-T/2, 0, `topBar${sx}`));
      }
    } else {
      add(mesh(box(T, H, D), frameMat, -(W/2-T/2), H/2, 0, "sideL"));
      add(mesh(box(T, H, D), frameMat,  (W/2-T/2), H/2, 0, "sideR"));
    }
    add(mesh(box(W, T, D), frameMat, 0, H-T/2, 0, "shTop"));
    add(mesh(box(W, T, D), frameMat, 0, T/2, 0, "shBot"));

    // ── Back panel ───────────────────────────────────────────────────
    if (shelfBackPanel) {
      const backMat = new THREE.MeshStandardMaterial({ color: frameCol - 0x101010, roughness: 0.80 });
      add(mesh(box(W-T*2, H-T*2, 0.010), backMat, 0, H/2, -(D/2-0.005), "shBack"), "back");
    }

    // ── Shelf boards ─────────────────────────────────────────────────
    const count = Math.max(1, shelfCount);

    if (shelfStyle === "cube") {
      const cols = Math.max(2, Math.ceil(Math.sqrt(count)));
      const rows = Math.max(2, Math.ceil(count / cols));
      for (let c = 1; c < cols; c++) {
        const x = -W/2 + T + (c*(W-T*2))/cols;
        add(mesh(box(T*0.85, H-T*2, D), frameMat, x, H/2, 0, `divV${c}`), "shelf");
      }
      for (let r = 1; r < rows; r++) {
        const y = T + (r*(H-T*2))/rows;
        const s = mesh(box(W-T*2, T*0.85, D), shelfBoardMat, 0, y, 0, `divH${r}`);
        s.userData.group = "shelf";
        app.root.add(s);
        app.selectables.push(s);
        app.shelvesMeshes.push(s);
      }
    } else if (shelfStyle === "ladder") {
      for (let i = 0; i < count; i++) {
        const t2 = i / Math.max(1, count-1);
        const y = T + t2*(H-T*2);
        const w = (W-T*2)*(1-t2*0.32);
        const d = D*(1-t2*0.38);
        const s = mesh(box(w, T*0.90, d), shelfBoardMat, 0, y, -D*0.16*t2, `ladShelf${i}`);
        s.userData.group = "shelf";
        app.root.add(s);
        app.selectables.push(s);
        app.shelvesMeshes.push(s);
      }
    } else {
      for (let i = 0; i < count; i++) {
        const y = T + ((i+1)*(H-T*2))/(count+1);
        const s = mesh(box(W-T*2, T*0.90, D-0.01), shelfBoardMat, 0, y, 0, `openShelf${i}`);
        s.userData.group = "shelf";
        app.root.add(s);
        app.selectables.push(s);
        app.shelvesMeshes.push(s);
      }
    }

    // ── LED strips under each shelf ──────────────────────────────────
    if (shelfLighting && shelfStyle === "open") {
      const ledMat = new THREE.MeshStandardMaterial({ color: 0xFFEECC, emissive: new THREE.Color(0xFFEECC), emissiveIntensity: 1.4, roughness: 0.8 });
      for (let i = 0; i < count; i++) {
        const y = T + ((i+1)*(H-T*2))/(count+1);
        app.root.add(mesh(box(W-T*2-0.04, 0.008, 0.010), ledMat, 0, y - T*0.5 - 0.004, D/2 - 0.025, `led${i}`));
      }
      const pl = new THREE.PointLight(0xFFEECC, 0.5, 4);
      pl.position.set(0, H/2, D/2);
      app.root.add(pl);
      app.ledLight = pl;
    } else { app.ledLight = null; }

    // ── Decorative items ─────────────────────────────────────────────
    if (shelfDecorItems && shelfStyle === "open") {
      const bookColors = [0x8B2020, 0x205080, 0x3A6030, 0x806020, 0x502060, 0xA04020, 0x204060];
      const rng = (seed, lo, hi) => lo + ((seed * 9301 + 49297) % 233280 / 233280) * (hi - lo);

      for (let i = 0; i < count; i++) {
        const sy = T + ((i+1)*(H-T*2))/(count+1) + T*0.9 + 0.002;
        let bx2 = -(W-T*2)*0.48;
        let seed = i * 17;

        // Books
        for (let b = 0; b < 6; b++) {
          seed += 31;
          const bw = rng(seed, 0.036, 0.065);
          const bh = rng(seed+1, 0.15, 0.26);
          const bc = bookColors[(seed * 7) % bookColors.length];
          const bMat = new THREE.MeshStandardMaterial({ color: bc, roughness: 0.85 });
          app.root.add(mesh(box(bw, bh, D*0.72), bMat, bx2 + bw/2, sy + bh/2, 0, `book${i}_${b}`));
          bx2 += bw + rng(seed+2, 0.004, 0.010);
          if (bx2 > (W-T*2)*0.32) break;
        }

        // Small decor object
        if (i % 2 === 0) {
          const vMat = new THREE.MeshStandardMaterial({ color: 0x4A7860, roughness: 0.7 });
          app.root.add(mesh(new THREE.CylinderGeometry(0.025, 0.020, 0.12, 8), vMat, (W-T*2)*0.38, sy + 0.06, 0, `vase${i}`));
          app.root.add(mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2A5A20, roughness: 0.9 }), (W-T*2)*0.38, sy + 0.12 + 0.035, 0, `plant${i}`));
        } else {
          const oMat = new THREE.MeshStandardMaterial({ color: 0xC07040, roughness: 0.6 });
          app.root.add(mesh(new THREE.SphereGeometry(0.045, 8, 6), oMat, (W-T*2)*0.38, sy + 0.045, 0, `sphere${i}`));
        }
      }
    }

    app.root.position.set(0, 0, 0);
  }, [width, height, depth, shelfCount, shelfBackPanel, shelfStyle, shelfLighting, shelfDecorItems, shelfMaterial]);

  // ─────────────────────────────────────────────────────────────────────────
  // Dressing table builder — vanity desk with drawer block, configurable
  // mirror style, support legs, and an optional matching stool.
  // ─────────────────────────────────────────────────────────────────────────
  const buildDressingTable = useCallback(() => {
    const app = appRef.current;
    if (!app.root) return;

    while (app.root.children.length) app.root.remove(app.root.children[0]);
    app.selectables = [];
    app.doorPivots = [];
    app.drawerPivots = [];
    app.shelvesMeshes = [];

    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const cyl = (r1, r2, h, seg=16) => new THREE.CylinderGeometry(r1, r2, h, seg);
    const mesh = (geo, mat, x, y, z, n) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      m.name = n || "";
      return m;
    };
    const add = (m, group) => {
      m.userData.group = group || "body";
      app.root.add(m);
      app.selectables.push(m);
      return m;
    };

    const W = Math.min(Math.max(width, 1.0), 1.60);
    const D = Math.max(depth * 0.70, 0.44);
    const T = 0.022;
    const tableH = 0.76;

    // Material
    const matCols = { oak:0xC09060, walnut:0x5A3018, white:0xF0EDE5, black:0x1C1C1E };
    const bodyCol = matCols[dressingTableMat] || matCols.oak;
    const bodyMat  = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.70, metalness: 0.02 });
    const faceMat  = new THREE.MeshStandardMaterial({ color: bodyCol + 0x0A0806, roughness: 0.62, metalness: 0.02 });
    const goldMat  = new THREE.MeshStandardMaterial({ color: 0xC8A030, roughness: 0.10, metalness: 0.90 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xC8DCEE, roughness: 0.02, metalness: 0.95 });
    const lampMat  = new THREE.MeshStandardMaterial({ color: 0xFFF0CC, emissive: new THREE.Color(0xFFF0CC), emissiveIntensity: 1.0, roughness: 0.4 });

    // ── Drawer tower (left side) ────────────────────────────────────
    const towerW = W * 0.30;
    const towerX = -(W/2 - towerW/2);
    add(mesh(box(towerW, tableH - T, D), bodyMat, towerX, (tableH-T)/2, 0, "dtTowerL"), "body");
    const drawers = Math.max(1, dressingDrawers);
    const rowH = (tableH - T - 0.06) / drawers;
    for (let i = 0; i < drawers; i++) {
      const cy = 0.04 + i*rowH + rowH/2;
      add(mesh(box(towerW-0.016, rowH-0.010, T*0.7), faceMat, towerX, cy, D/2 + T/2, `dtDrw${i}`), "drawer");
      add(mesh(cyl(0.006, 0.006, 0.09), goldMat, towerX, cy, D/2 + T + 0.005, `dtH${i}`), "handle");
    }

    // ── Mirror tower (right side) ───────────────────────────────────
    const towerR = W * 0.22;
    const towerRX = (W/2 - towerR/2);
    add(mesh(box(towerR, tableH - T, D), bodyMat, towerRX, (tableH-T)/2, 0, "dtTowerR"), "body");
    // Small shelf in right tower
    add(mesh(box(towerR-T*2, T*0.8, D-0.01), faceMat, towerRX, (tableH-T)*0.55, 0, "dtShelf"), "shelf");

    // ── Tabletop ────────────────────────────────────────────────────
    add(mesh(box(W + 0.025, T*1.5, D + 0.025), bodyMat, 0, tableH + T*0.75, 0, "dtTop"), "body");

    // ── Knee-hole legs (slender) ────────────────────────────────────
    const clearW = W - towerW - towerR - T*2;
    const clearX = (towerRX - towerR/2 + towerX + towerW/2) / 2;
    for (const sz of [-1,1]) {
      add(mesh(cyl(0.014, 0.011, tableH - T), goldMat, clearX - clearW*0.35, (tableH-T)/2, sz*(D/2-0.07), `dtLegF${sz}`), "leg");
      add(mesh(cyl(0.014, 0.011, tableH - T), goldMat, clearX + clearW*0.35, (tableH-T)/2, sz*(D/2-0.07), `dtLegB${sz}`), "leg");
    }
    // Stretcher bar
    add(mesh(box(clearW*0.70, 0.014, 0.014), goldMat, clearX, 0.18, 0, "dtStretcher"), "leg");

    // ── Mirror ─────────────────────────────────────────────────────
    if (dressingMirror !== "none") {
      const mirZ = -(D/2 - 0.040);
      const postH = 0.55;
      const mirBaseY = tableH + T*1.5;

      if (dressingMirror === "trifold") {
        // Central large panel + two angled wings
        const cW = 0.34, cH = 0.68;
        const wW = 0.20, wH = 0.58;
        add(mesh(box(cW+0.020, cH+0.020, 0.016), goldMat, 0, mirBaseY + postH + cH/2, mirZ, "dtMFC"), "mirror");
        add(mesh(box(cW, cH, 0.008), glassMat, 0, mirBaseY + postH + cH/2, mirZ + 0.012, "dtMG"), "mirror");
        [-1,1].forEach(sx => {
          const wMesh = mesh(box(wW+0.014, wH+0.014, 0.014), goldMat, sx*(cW/2+wW/2+0.01), mirBaseY + postH + wH/2 + 0.05, mirZ - 0.01, `dtMFW${sx}`);
          wMesh.rotation.y = sx * 0.28;
          add(wMesh, "mirror");
          const wGlass = mesh(box(wW, wH, 0.008), glassMat, sx*(cW/2+wW/2+0.01), mirBaseY + postH + wH/2 + 0.05, mirZ + 0.008, `dtMGW${sx}`);
          wGlass.rotation.y = sx * 0.28;
          add(wGlass, "mirror");
        });
        add(mesh(box(0.035, postH, 0.035), goldMat, 0, mirBaseY + postH/2, mirZ + 0.04, "dtMPost"), "mirror");

      } else if (dressingMirror === "round") {
        const mr = 0.28;
        // Post
        add(mesh(box(0.030, postH, 0.030), goldMat, 0, mirBaseY + postH/2, mirZ + 0.04, "dtPost"), "mirror");
        // Frame ring
        const frame = mesh(cyl(mr + 0.020, mr + 0.020, 0.022), goldMat, 0, mirBaseY + postH + mr, mirZ, "dtMFrame");
        frame.rotation.x = Math.PI/2;
        add(frame, "mirror");
        const glass2 = mesh(cyl(mr, mr, 0.008), glassMat, 0, mirBaseY + postH + mr, mirZ + 0.014, "dtMGlass");
        glass2.rotation.x = Math.PI/2;
        add(glass2, "mirror");

        // Hollywood lights around mirror
        if (dressingLights === "hollywood") {
          const nBulbs = 12;
          const bulbMat = new THREE.MeshStandardMaterial({ color: 0xFFFAEE, emissive: new THREE.Color(0xFFFAEE), emissiveIntensity: 2.5, roughness: 0.3 });
          for (let b = 0; b < nBulbs; b++) {
            const angle = (b / nBulbs) * Math.PI * 2;
            const bx2 = Math.sin(angle) * (mr + 0.034);
            const by2 = Math.cos(angle) * (mr + 0.034);
            const bulb = mesh(new THREE.SphereGeometry(0.018, 8, 6), bulbMat, bx2, mirBaseY + postH + mr + by2, mirZ - 0.005, `bulb${b}`);
            add(bulb, "mirror");
          }
          const pl = new THREE.PointLight(0xFFFAEE, 0.9, 3.5);
          pl.position.set(0, mirBaseY + postH + mr, 0.4);
          app.root.add(pl);
        } else if (dressingLights === "led-strip") {
          const ledRingMat = new THREE.MeshStandardMaterial({ color: 0xFFEECC, emissive: new THREE.Color(0xFFEECC), emissiveIntensity: 1.6, roughness: 0.6 });
          const ledRing = mesh(cyl(mr + 0.025, mr + 0.025, 0.010), ledRingMat, 0, mirBaseY + postH + mr, mirZ - 0.005, "dtLedRing");
          ledRing.rotation.x = Math.PI/2;
          add(ledRing, "led");
          const pl = new THREE.PointLight(0xFFEECC, 0.7, 3.0);
          pl.position.set(0, mirBaseY + postH + mr, 0.4);
          app.root.add(pl);
          app.ledLight = pl;
        }

      } else { // rect
        const rW = 0.50, rH = 0.70;
        add(mesh(box(0.030, postH, 0.030), goldMat, 0, mirBaseY + postH/2, mirZ + 0.04, "dtPost"), "mirror");
        add(mesh(box(rW+0.024, rH+0.024, 0.018), goldMat, 0, mirBaseY + postH + rH/2, mirZ, "dtMFrame"), "mirror");
        add(mesh(box(rW, rH, 0.008), glassMat, 0, mirBaseY + postH + rH/2, mirZ + 0.012, "dtMGlass"), "mirror");
      }
    }

    // ── Cosmetics on tabletop ───────────────────────────────────────
    const topY2 = tableH + T*1.5 + T*0.75;
    const perfMat = new THREE.MeshStandardMaterial({ color: 0xCCDDEE, roughness: 0.04, metalness: 0.90 });
    const lipMat  = new THREE.MeshStandardMaterial({ color: 0xC83060, roughness: 0.20 });
    app.root.add(mesh(cyl(0.024, 0.020, 0.10), perfMat, W*0.20, topY2 + 0.05, D*0.15, "perf1"));
    app.root.add(mesh(cyl(0.018, 0.014, 0.07), perfMat, W*0.28, topY2 + 0.035, D*0.18, "perf2"));
    app.root.add(mesh(cyl(0.008, 0.008, 0.12), lipMat,  W*0.34, topY2 + 0.06, D*0.14, "lipstick"));
    app.root.add(mesh(box(0.18, 0.014, 0.12), goldMat,  W*0.22, topY2 + 0.007, D*0.22, "tray"));

    // ── Matching stool ───────────────────────────────────────────────
    if (dressingStool) {
      const cushMat  = new THREE.MeshStandardMaterial({ color: 0xE8D4C4, roughness: 0.88 });
      const stoolLeg = new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.65 });
      const seatY = 0.44;
      const stoolX = W/2 + 0.46;

      // Padded seat (oval)
      const seat = mesh(cyl(0.20, 0.19, 0.075, 24), cushMat, stoolX, seatY + 0.075/2, 0, "dtStoolSeat");
      add(seat, "stool");
      // Cushion top puff
      const puff = mesh(new THREE.SphereGeometry(0.13, 12, 6), cushMat, stoolX, seatY + 0.075 + 0.04, 0, "dtPuff");
      puff.scale.set(1.4, 0.5, 1.2);
      add(puff, "stool");

      // 4 tapered legs
      for (const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
        add(mesh(cyl(0.014, 0.010, seatY, 8), stoolLeg, stoolX + sx*0.13, seatY/2, sz*0.11, `dtSL${sx}${sz}`), "stool");
      }
      // Stretcher ring
      add(mesh(cyl(0.008, 0.008, 0.22), goldMat, stoolX - 0.13, 0.14, 0, "dtStrL"), "stool");
      add(mesh(cyl(0.008, 0.008, 0.22), goldMat, stoolX + 0.13, 0.14, 0, "dtStrR"), "stool");
    }

    app.root.position.set(0, 0, 0);
  }, [width, depth, dressingDrawers, dressingMirror, dressingStool, dressingLights, dressingTableMat]);

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
      const base = 1400 + officeDeskW * 900 + (officeCabW * officeCabH) * 280;
      const mm = {
        natural_oak: 1, walnut: 1.3, dark_walnut: 1.2, ash: 1.1, black_wood: 1.15,
        white_wood: 1.1, matte_lam: 0.85, high_gloss: 0.9, white_marble: 1.9,
        black_marble: 2.0, grey_marble: 1.75, travertine: 1.55
      };
      const total = Math.round(base * (mm[officeDeskTopMat] || 1) / 100) * 100;
      return total.toFixed(2);
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

  // LED lighting live update (without rebuild) — applies to ALL categories
  useEffect(() => {
    const app = appRef.current;
    // Apply global LED state to any category that has a ledLight reference
    _applyLEDstate(app, ledLighting);
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
    const initBg = theme === "light" ? 0xf4f7fa : 0x070d19;
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
    else if (activeCategory === "tv-wall") buildTVWall();
    else if (activeCategory === "cabinet") buildCabinet();
    else if (activeCategory === "bed") buildBed();
    else if (activeCategory === "shelves") buildShelves();
    else if (activeCategory === "dressing-table") buildDressingTable();
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

    // Touch Controls
    let touchStartDist = 0;

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        dragging = true;
        const touch = e.touches[0];
        prevMouse = { x: touch.clientX, y: touch.clientY };
        mouseDownPos = { x: touch.clientX, y: touch.clientY };
      } else if (e.touches.length === 2) {
        dragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 1 && dragging) {
        e.preventDefault(); // Prevent page bouncing/scrolling during orbit
        const touch = e.touches[0];
        app.sph.t -= (touch.clientX - prevMouse.x) * 0.008;
        app.sph.p = Math.max(0.25, Math.min(1.52, app.sph.p - (touch.clientY - prevMouse.y) * 0.008));
        prevMouse = { x: touch.clientX, y: touch.clientY };
        moveCam();
      } else if (e.touches.length === 2) {
        e.preventDefault(); // Prevent page zooming
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (touchStartDist > 0) {
          const factor = (touchStartDist - dist) * 0.01;
          app.sph.r = Math.max(2.2, Math.min(11, app.sph.r + factor));
          moveCam();
        }
        touchStartDist = dist;
      }
    };

    const onTouchEnd = (e) => {
      dragging = false;
      // Handle tap selection if touch didn't drag much
      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const dist = Math.hypot(touch.clientX - mouseDownPos.x, touch.clientY - mouseDownPos.y);
        if (dist < 6) {
          const rect = canvas.getBoundingClientRect();
          mouse2D.x = ((touch.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
          mouse2D.y = -((touch.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
          
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
        }
      }
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("wheel", onWheel);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });

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
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      app.renderer.dispose();
    };
  }, [buildWardrobe, buildOffice, triggerNotification, triggerHud]);

  // Update Three.js scene dynamically when the theme changes
  useEffect(() => {
    const app = appRef.current;
    if (!app.scene || !app.renderer) return;

    const isLight = theme === "light";
    const bgCol = isLight ? 0xf4f7fa : 0x070d19;
    const floorCol = isLight ? 0xe9f0f5 : 0x0a1226;
    const gridCol = isLight ? 0xcbd5e1 : 0x1e293b;

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
    } else if (activeCategory === "tv-wall") {
      buildTVWall();
    } else if (activeCategory === "cabinet") {
      buildCabinet();
    } else if (activeCategory === "bed") {
      buildBed();
    } else if (activeCategory === "shelves") {
      buildShelves();
    } else if (activeCategory === "dressing-table") {
      buildDressingTable();
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
    officeDeskW, officeDeskD, officeDeskH, officeDeskT, officeDeskTopMat, officeDeskBaseMat, officeDeskDrawer, officeDeskDrawerCount, officeDeskDrawerSide, officeDeskDrawerStyle, officeDeskFileCab,
    officeCabW, officeCabH, officeCabD, officeCabSections, officeCabOpenShelves, officeCabLowerDoors, officeCabLowerHRatio, officeCabColor, officeCabPanelMat, officeCabShelfSpacing, officeCabAutoSync,
    officeLedOn, officeLedColor, officeLedBright, officeLedUnder, officeLedBack, officeLedTop, buildOffice,
    buildTVWall, tvWallShelves, tvWallSize, tvWallLed, tvWallStorage,
    tvPanelStyle, tvSoundBar, tvConsoleLegs, tvLedColor,
    buildCabinet, cabinetDrawerRows, cabinetOpenTop, cabinetLegs,
    cabinetGlassDoors, cabinetDoorCount, cabinetStyle,
    buildBed, bedSize, bedHeadboard, bedStorage, bedLedUnder,
    bedBench, bedPillowCount, bedLampStyle, bedFrameStyle,
    buildShelves, shelfCount, shelfBackPanel, shelfStyle,
    shelfLighting, shelfDecorItems, shelfMaterial,
    buildDressingTable, dressingDrawers, dressingMirror, dressingStool,
    dressingLights, dressingTableMat
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
  - Width: ${activeCategory === "kitchen" ? roomWidth * 100 : activeCategory === "office" ? officeDeskW * 100 : width * 100} cm
  - Height: ${activeCategory === "kitchen" ? roomHeight * 100 : activeCategory === "office" ? officeDeskH * 100 : height * 100} cm
  - Depth: ${activeCategory === "kitchen" ? roomLength * 100 : activeCategory === "office" ? officeDeskD * 100 : depth * 100} cm
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
  - Desk Dimensions: ${officeDeskW * 100} x ${officeDeskD * 100} x ${officeDeskH * 100} cm
  - Cabinet Dimensions: ${officeCabW * 100} x ${officeCabH * 100} x ${officeCabD * 100} cm
  - Desk Material: ${officeDeskTopMat} (Base: ${officeDeskBaseMat})
  - Cabinet Finish: Body: ${officeCabColor}, Panel: ${officeCabPanelMat}
  - Drawers: ${officeDeskDrawer ? `${officeDeskDrawerCount} drawers on ${officeDeskDrawerSide}` : "None"}
  - File Cabinet: ${officeDeskFileCab ? "Yes" : "No"}
  - LED Shelf Lights: ${officeLedOn ? `${officeLedColor} (under: ${officeLedUnder ? 'yes' : 'no'}, back: ${officeLedBack ? 'yes' : 'no'}, top: ${officeLedTop ? 'yes' : 'no'})` : "Off"}
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
# Dimensions: ${activeCategory === "kitchen" ? roomWidth : activeCategory === "office" ? officeDeskW : width} x ${activeCategory === "kitchen" ? roomHeight : activeCategory === "office" ? officeDeskH : height} x ${activeCategory === "kitchen" ? roomLength : activeCategory === "office" ? officeDeskD : depth}
# This file contains the 3D layout data for imports in SketchUp, AutoCAD, or Blender.
# Selected Materials: ${activeCategory === "kitchen" ? kitchenCabinetMaterial : activeCategory === "office" ? officeDeskTopMat : activeColor}
# Countertop: ${activeCategory === "kitchen" ? countertopMaterial : "N/A"}`;
    const blob = new Blob([data], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `furni-ai-${activeCategory}-${Date.now()}.${fmt}`;
    link.href = URL.createObjectURL(blob);
    link.click();
    triggerNotification(`${fmt.toUpperCase()} format exported successfully!`);
  };

  // Generate production specification
  const handleSendToProduction = () => {
    const spec = generateProductionSpec({
      type: activeCategory,
      style: activePreset,
      color: activeColor,
      width,
      height,
      depth,
      doorType,
      handleStyle,
      drawerRows: extDrawerRows,
      ledLighting,
      hangerRods,
      bedSize,
      bedHeadboard,
      bedStorage,
      bedFrameStyle,
      bedPillowCount,
      bedBench,
      bedLampStyle,
    });

    setCurrentProductionSpec(spec);
    setProductionModalOpen(true);
    triggerNotification("Production spec generated!");
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
        setOfficeDeskTopMat("walnut");
        setOfficeCabPanelMat("walnut");
        setOfficeCabColor("beige");
      } else if (t.includes("oak")) {
        setOfficeDeskTopMat("natural_oak");
        setOfficeCabPanelMat("natural_oak");
        setOfficeCabColor("beige");
      } else if (t.includes("marble") || t.includes("luxury")) {
        setOfficeDeskTopMat("white_marble");
        setOfficeCabPanelMat("white_marble");
        setOfficeCabColor("white");
      } else if (t.includes("dark") || t.includes("black")) {
        setOfficeDeskTopMat("black_marble");
        setOfficeDeskBaseMat("matte_black");
        setOfficeCabColor("dark_grey");
      }
      
      if (t.includes("led") || t.includes("light")) {
        setOfficeLedOn(true);
      }

      if (t.includes("warm")) {
        setOfficeLedColor("warm");
      } else if (t.includes("cool")) {
        setOfficeLedColor("cool");
      } else if (t.includes("neutral")) {
        setOfficeLedColor("neutral");
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
          --bg: ${theme === "light" ? "#f4f7fa" : "#070d19"};
          --bg2: ${theme === "light" ? "#e9f0f5" : "#0a1226"};
          --bg3: ${theme === "light" ? "#dae5ee" : "#121e36"};
          --border: ${theme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(0, 229, 255, 0.08)"};
          --border2: ${theme === "light" ? "rgba(0, 155, 180, 0.15)" : "rgba(0, 229, 255, 0.15)"};
          --accent: ${theme === "light" ? "#009bb4" : "#00e5ff"};
          --accent2: ${theme === "light" ? "#0077b6" : "#3b82f6"};
          --text: ${theme === "light" ? "#0f172a" : "#f1f5f9"};
          --muted: ${theme === "light" ? "#64748b" : "#94a3b8"};
          --muted2: ${theme === "light" ? "#94a3b8" : "#475569"};
          --accent-rgb: ${theme === "light" ? "0, 155, 180" : "0, 229, 255"};
          
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
          text-decoration: none;
        }

        .home-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 8px;
          background: var(--bg3);
          border: 1px solid var(--border);
          color: var(--muted);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all .15s;
          margin-right: 10px;
          white-space: nowrap;
        }

        .home-btn:hover {
          background: rgba(var(--accent-rgb), 0.1);
          color: var(--accent);
          border-color: var(--accent);
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .ftype-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          padding: 4px 0 8px;
        }

        .ftype-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          padding: 10px 6px 8px;
          border-radius: 10px;
          cursor: pointer;
          border: 1.5px solid var(--border);
          background: var(--bg3);
          transition: all .18s;
          text-align: center;
        }

        .ftype-card:hover {
          border-color: var(--accent);
          background: rgba(var(--accent-rgb), 0.08);
          transform: translateY(-1px);
        }

        .ftype-card.on {
          border-color: var(--accent);
          background: rgba(var(--accent-rgb), 0.14);
          box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.18);
        }

        .ftype-card .ftype-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .ftype-card .ftype-name {
          font-size: 0.66rem;
          font-weight: 600;
          color: var(--muted);
          line-height: 1.2;
        }

        .ftype-card.on .ftype-name {
          color: var(--accent);
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
          color: #070d19;
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
          background: rgba(var(--accent-rgb), 0.15);
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
          background: rgba(var(--accent-rgb), 0.1);
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
          border-color: rgba(var(--accent-rgb), 0.4);
          color: var(--accent);
        }

        .scene-btn.on {
          background: rgba(var(--accent-rgb), 0.1);
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
          color: #070d19;
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
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid rgba(var(--accent-rgb), 0.2);
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
          background: rgba(var(--accent-rgb), 0.15);
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
          border-color: rgba(var(--accent-rgb), 0.4);
          color: var(--text);
        }

        .chip.on {
          background: rgba(var(--accent-rgb), 0.15);
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
          box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.2);
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
        <div className="logo-area">
          <a href="/" className="home-btn">← Home</a>
          <a href="/" className="logo">Furni AI</a>
        </div>
        <div className="file-name">
          <span style={{ color: "var(--accent)" }}>📁</span>
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
            <div className="sec-label">Choose Furniture</div>
            <div className="ftype-grid">
            {[
              { id: "wardrobe",       label: "Wardrobe",       emoji: "🚪", bg: "linear-gradient(135deg,#c8a96e,#9a7040)" },
              { id: "kitchen",        label: "Kitchen",         emoji: "🍳", bg: "linear-gradient(135deg,#b59beb,#7a5ab0)" },
              { id: "office",         label: "Office",          emoji: "💼", bg: "linear-gradient(135deg,#d4a5e8,#9a60c0)" },
              { id: "tv-wall",        label: "TV Wall",         emoji: "📺", bg: "linear-gradient(135deg,#9bcbeb,#5090b8)" },
              { id: "cabinet",        label: "Cabinet",         emoji: "🗄️", bg: "linear-gradient(135deg,#c5a5e8,#8058b8)" },
              { id: "bed",            label: "Bed",             emoji: "🛏️", bg: "linear-gradient(135deg,#a5b0e8,#5060b8)" },
              { id: "shelves",        label: "Shelves",         emoji: "📚", bg: "linear-gradient(135deg,#a5e8b0,#40a858)" },
              { id: "dressing-table", label: "Dressing Table",  emoji: "🪞", bg: "linear-gradient(135deg,#e8d4a5,#b89050)" },
            ].map((f) => (
              <div
                key={f.id}
                className={`ftype-card ${activeCategory === f.id ? "on" : ""}`}
                onClick={() => {
                  setActiveCategory(f.id);
                  triggerNotification("Switched to " + f.label);
                }}
              >
                <div className="ftype-icon" style={{ background: f.bg }}>
                  {f.emoji}
                </div>
                <div className="ftype-name">{f.label}</div>
              </div>
            ))}
            </div>
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

                  {/* Send to Production */}
                  <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                    <button
                      className="sec-n hover-bright cursor-pointer"
                      onClick={handleSendToProduction}
                      style={{ fontSize: "10.5px", padding: "8px", textAlign: "center", background: "linear-gradient(135deg, #c8a050 0%, #e8d4a5 100%)", color: "#000", fontWeight: "bold", width: "100%" }}
                    >
                      🏭 Send to Production
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : activeCategory === "office" ? (
            <>
              {/* OFFICE CONFIGURATOR PANELS */}
              {/* 1. AI Design Assistant */}
              <div className="rps">
                <div className="rpt">✦ AI Prompt</div>
                <div className="aibox">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your office style…&#10;e.g. Modern executive office with walnut and warm LED lights"
                  />
                  <div className="aifoot">
                    <div className="aiex-list">
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("walnut and warm LED")}>Walnut</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("marble luxury")}>Marble</span>
                      <span className="aiex cursor-pointer" onClick={() => setPrompt("dark black modern")}>Dark Modern</span>
                    </div>
                    <button className="aiapply cursor-pointer" onClick={() => { handleRunAI(prompt); setPrompt(""); }}>Apply</button>
                  </div>
                </div>
              </div>

              {/* 2. Style Presets */}
              <div className="rps">
                <div className="rpt">Style Presets</div>
                <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  <button 
                    className={`sec-n cursor-pointer ${officeDeskTopMat === 'walnut' && officeCabColor === 'beige' ? 'on' : ''}`}
                    onClick={() => {
                      setOfficeDeskTopMat('walnut'); setOfficeDeskBaseMat('matte_beige');
                      setOfficeCabColor('beige'); setOfficeCabPanelMat('walnut');
                      setOfficeLedColor('warm'); setOfficeLedOn(true);
                      triggerNotification("Applied Modern Walnut Preset");
                    }}
                    style={{ fontSize: "10px", padding: "6px" }}
                  >
                    Modern Walnut
                  </button>
                  <button 
                    className={`sec-n cursor-pointer ${officeDeskTopMat === 'white_marble' && officeCabColor === 'white' ? 'on' : ''}`}
                    onClick={() => {
                      setOfficeDeskTopMat('white_marble'); setOfficeDeskBaseMat('matte_white');
                      setOfficeCabColor('white'); setOfficeCabPanelMat('white_marble');
                      setOfficeLedColor('neutral'); setOfficeLedOn(true);
                      triggerNotification("Applied Marble Luxury Preset");
                    }}
                    style={{ fontSize: "10px", padding: "6px" }}
                  >
                    Marble Luxury
                  </button>
                  <button 
                    className={`sec-n cursor-pointer ${officeDeskTopMat === 'black_marble' && officeCabColor === 'dark_grey' ? 'on' : ''}`}
                    onClick={() => {
                      setOfficeDeskTopMat('black_marble'); setOfficeDeskBaseMat('matte_black');
                      setOfficeCabColor('dark_grey'); setOfficeCabPanelMat('black_marble');
                      setOfficeLedColor('cool'); setOfficeLedOn(true);
                      triggerNotification("Applied Dark Executive Preset");
                    }}
                    style={{ fontSize: "10px", padding: "6px" }}
                  >
                    Dark Executive
                  </button>
                </div>
              </div>

              {/* 3. Desk Dimensions */}
              <div className="rps">
                <div className="rpt">Desk Dimensions</div>
                <div className="size-grid">
                  <div className="size-row">
                    <label>Width <span>{Math.round(officeDeskW * 100)} cm</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="140"
                      max="340"
                      step="5"
                      value={officeDeskW * 100}
                      onChange={(e) => setOfficeDeskW(parseFloat(e.target.value) / 100)}
                    />
                  </div>
                  <div className="size-row">
                    <label>Depth <span>{Math.round(officeDeskD * 100)} cm</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="60"
                      max="140"
                      step="5"
                      value={officeDeskD * 100}
                      onChange={(e) => setOfficeDeskD(parseFloat(e.target.value) / 100)}
                    />
                  </div>
                  <div className="size-row">
                    <label>Height <span>{Math.round(officeDeskH * 100)} cm</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="65"
                      max="90"
                      step="1"
                      value={officeDeskH * 100}
                      onChange={(e) => setOfficeDeskH(parseFloat(e.target.value) / 100)}
                    />
                  </div>
                  <div className="size-row">
                    <label>Tabletop Thickness <span>{Math.round(officeDeskT * 100)} cm</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="3"
                      max="12"
                      step="1"
                      value={officeDeskT * 100}
                      onChange={(e) => setOfficeDeskT(parseFloat(e.target.value) / 100)}
                    />
                  </div>
                </div>
              </div>

              {/* 4. Desk Configuration */}
              <div className="rps">
                <div className="rpt">Desk Configuration</div>
                <div className="size-grid">
                  <div className="size-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ margin: 0 }}>Drawer Unit</label>
                    <button 
                      className={`sec-n cursor-pointer ${officeDeskDrawer ? "on" : ""}`}
                      onClick={() => setOfficeDeskDrawer(!officeDeskDrawer)}
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                    >
                      {officeDeskDrawer ? "ON" : "OFF"}
                    </button>
                  </div>
                  
                  {officeDeskDrawer && (
                    <>
                      <div className="size-row" style={{ marginBottom: "8px" }}>
                        <label style={{ marginBottom: "4px" }}>Drawer Count</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button className="sec-n cursor-pointer" onClick={() => setOfficeDeskDrawerCount(Math.max(1, officeDeskDrawerCount - 1))} style={{ padding: "4px 10px" }}>−</button>
                          <span style={{ fontSize: "14px", fontWeight: "800", flex: 1, textAlign: "center", color: "var(--accent)" }}>{officeDeskDrawerCount}</span>
                          <button className="sec-n cursor-pointer" onClick={() => setOfficeDeskDrawerCount(Math.min(6, officeDeskDrawerCount + 1))} style={{ padding: "4px 10px" }}>+</button>
                        </div>
                      </div>
                      
                      <div className="size-row" style={{ marginBottom: "8px" }}>
                        <label style={{ marginBottom: "4px" }}>Placement</label>
                        <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                          {["left", "right", "both"].map((side) => (
                            <button 
                              key={side}
                              className={`sec-n cursor-pointer ${officeDeskDrawerSide === side ? "on" : ""}`}
                              onClick={() => setOfficeDeskDrawerSide(side)}
                              style={{ fontSize: "10px", padding: "4px", textTransform: "capitalize" }}
                            >
                              {side}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="size-row" style={{ marginBottom: "8px" }}>
                        <label style={{ marginBottom: "4px" }}>Style</label>
                        <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                          {[
                            { id: "closed", label: "Closed" },
                            { id: "open", label: "Open Shelf" }
                          ].map((st) => (
                            <button 
                              key={st.id}
                              className={`sec-n cursor-pointer ${officeDeskDrawerStyle === st.id ? "on" : ""}`}
                              onClick={() => setOfficeDeskDrawerStyle(st.id)}
                              style={{ fontSize: "10px", padding: "4px" }}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="size-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ margin: 0 }}>File Cabinet</label>
                    <button 
                      className={`sec-n cursor-pointer ${officeDeskFileCab ? "on" : ""}`}
                      onClick={() => setOfficeDeskFileCab(!officeDeskFileCab)}
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                    >
                      {officeDeskFileCab ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. Desk Materials */}
              <div className="rps">
                <div className="rpt">Desk Materials</div>
                <div className="size-grid">
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "4px" }}>Tabletop Finish</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                      {[
                        { id: "natural_oak", label: "Natural Oak", bg: "#C8A96E" },
                        { id: "walnut", label: "Walnut", bg: "#6B3F1E" },
                        { id: "dark_walnut", label: "Dark Walnut", bg: "#3A2010" },
                        { id: "ash", label: "Ash Wood", bg: "#D8C9A8" },
                        { id: "black_wood", label: "Black Wood", bg: "#1A1614" },
                        { id: "white_wood", label: "White Wood", bg: "#EDE8DF" },
                        { id: "matte_lam", label: "Matte Lam.", bg: "#D0C9BE" },
                        { id: "high_gloss", label: "High Gloss", bg: "#EEEAE4" },
                        { id: "white_marble", label: "White Marble", bg: "#F5F5F0" },
                        { id: "black_marble", label: "Black Marble", bg: "#1A1A1C" },
                        { id: "grey_marble", label: "Grey Marble", bg: "#B0AFAC" },
                        { id: "travertine", label: "Travertine", bg: "#D4C4A0" },
                      ].map((mat) => (
                        <button
                          key={mat.id}
                          className={`sec-n cursor-pointer ${officeDeskTopMat === mat.id ? "on" : ""}`}
                          onClick={() => {
                            setOfficeDeskTopMat(mat.id);
                            if (officeCabAutoSync) setOfficeCabPanelMat(mat.id);
                          }}
                          style={{ fontSize: "10.5px", padding: "5px 8px", display: "flex", alignItems: "center", gap: "6px", textAlign: "left", justifyContent: "flex-start" }}
                        >
                          <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: mat.bg, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
                          {mat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="size-row">
                    <label style={{ marginBottom: "4px" }}>Base / Pedestals</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                      {[
                        { id: "match_top", label: "Match Top", bg: "#C8A96E" },
                        { id: "matte_beige", label: "Matte Beige", bg: "#BEB4A6" },
                        { id: "matte_white", label: "Matte White", bg: "#EFEFED" },
                        { id: "matte_black", label: "Matte Black", bg: "#1C1C1E" },
                        { id: "dark_grey_base", label: "Dark Grey", bg: "#3A3A3C" },
                      ].map((mat) => (
                        <button
                          key={mat.id}
                          className={`sec-n cursor-pointer ${officeDeskBaseMat === mat.id ? "on" : ""}`}
                          onClick={() => setOfficeDeskBaseMat(mat.id)}
                          style={{ fontSize: "10.5px", padding: "5px 8px", display: "flex", alignItems: "center", gap: "6px", textAlign: "left", justifyContent: "flex-start" }}
                        >
                          <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: mat.id === 'match_top' ? (officeMatsRef.current && officeMatsRef.current[officeDeskTopMat] ? "#C8A96E" : "#C8A96E") : mat.bg, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
                          {mat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Cabinet Dimensions */}
              <div className="rps">
                <div className="rpt">Cabinet Dimensions</div>
                <div className="size-grid">
                  <div className="size-row">
                    <label>Width <span>{Math.round(officeCabW * 100)} cm</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="200"
                      max="600"
                      step="10"
                      value={officeCabW * 100}
                      onChange={(e) => setOfficeCabW(parseFloat(e.target.value) / 100)}
                    />
                  </div>
                  <div className="size-row">
                    <label>Height <span>{Math.round(officeCabH * 100)} cm</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="200"
                      max="320"
                      step="5"
                      value={officeCabH * 100}
                      onChange={(e) => setOfficeCabH(parseFloat(e.target.value) / 100)}
                    />
                  </div>
                  <div className="size-row">
                    <label>Depth <span>{Math.round(officeCabD * 100)} cm</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="25"
                      max="60"
                      step="2"
                      value={officeCabD * 100}
                      onChange={(e) => setOfficeCabD(parseFloat(e.target.value) / 100)}
                    />
                  </div>
                  <div className="size-row">
                    <label>Sections <span>{officeCabSections}</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="2"
                      max="6"
                      step="1"
                      value={officeCabSections}
                      onChange={(e) => setOfficeCabSections(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* 7. Cabinet Layout */}
              <div className="rps">
                <div className="rpt">Cabinet Layout</div>
                <div className="size-grid">
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "4px" }}>Open Shelves</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button className="sec-n cursor-pointer" onClick={() => setOfficeCabOpenShelves(Math.max(1, officeCabOpenShelves - 1))} style={{ padding: "4px 10px" }}>−</button>
                      <span style={{ fontSize: "14px", fontWeight: "800", flex: 1, textAlign: "center", color: "var(--accent)" }}>{officeCabOpenShelves}</span>
                      <button className="sec-n cursor-pointer" onClick={() => setOfficeCabOpenShelves(Math.min(6, officeCabOpenShelves + 1))} style={{ padding: "4px 10px" }}>+</button>
                    </div>
                  </div>
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "4px" }}>Lower Doors</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button className="sec-n cursor-pointer" onClick={() => setOfficeCabLowerDoors(Math.max(2, officeCabLowerDoors - 1))} style={{ padding: "4px 10px" }}>−</button>
                      <span style={{ fontSize: "14px", fontWeight: "800", flex: 1, textAlign: "center", color: "var(--accent)" }}>{officeCabLowerDoors}</span>
                      <button className="sec-n cursor-pointer" onClick={() => setOfficeCabLowerDoors(Math.min(8, officeCabLowerDoors + 1))} style={{ padding: "4px 10px" }}>+</button>
                    </div>
                  </div>
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label>Lower Section Height <span>{Math.round(officeCabLowerHRatio * 100)}%</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="20"
                      max="60"
                      step="5"
                      value={officeCabLowerHRatio * 100}
                      onChange={(e) => setOfficeCabLowerHRatio(parseFloat(e.target.value) / 100)}
                    />
                  </div>
                  <div className="size-row">
                    <label style={{ marginBottom: "4px" }}>Shelf Spacing</label>
                    <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                      {[
                        { id: "even", label: "Even" },
                        { id: "top", label: "Top Heavy" },
                        { id: "bot", label: "Bottom" }
                      ].map((spacing) => (
                        <button 
                          key={spacing.id}
                          className={`sec-n cursor-pointer ${officeCabShelfSpacing === spacing.id ? "on" : ""}`}
                          onClick={() => setOfficeCabShelfSpacing(spacing.id)}
                          style={{ fontSize: "9px", padding: "4px" }}
                        >
                          {spacing.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Cabinet Color & Material */}
              <div className="rps">
                <div className="rpt">Cabinet Color &amp; Material</div>
                <div className="size-grid">
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "4px" }}>Body Color</label>
                    <div className="txgrid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                      {[
                        { id: "beige", bg: "#BEB4A6", name: "Warm Beige" },
                        { id: "sand", bg: "#C5B99A", name: "Sand" },
                        { id: "white", bg: "#EFEFED", name: "White" },
                        { id: "ivory", bg: "#EEE8D6", name: "Ivory" },
                        { id: "light_grey", bg: "#CACAC6", name: "Light Grey" },
                        { id: "dark_grey", bg: "#3A3A3C", name: "Dark Grey" },
                        { id: "taupe", bg: "#8A8274", name: "Taupe" },
                        { id: "black", bg: "#1A1A1C", name: "Black" },
                        { id: "walnut_col", bg: "#6B3F1E", name: "Walnut" },
                        { id: "oak_col", bg: "#C8A96E", name: "Oak" },
                      ].map((col) => (
                        <div
                          key={col.id}
                          className={`sw ${officeCabColor === col.id ? "on" : ""}`}
                          style={{ background: col.bg, width: "30px", height: "30px", borderRadius: "6px", cursor: "pointer", border: "2px solid transparent" }}
                          onClick={() => setOfficeCabColor(col.id)}
                          title={col.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "4px" }}>Decorative Back Panel</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                      {[
                        { id: "natural_oak", label: "Natural Oak", bg: "#C8A96E" },
                        { id: "walnut", label: "Walnut", bg: "#6B3F1E" },
                        { id: "white_marble", label: "White Marble", bg: "#F5F5F0" },
                        { id: "black_marble", label: "Black Marble", bg: "#1A1A1C" },
                        { id: "grey_marble", label: "Grey Marble", bg: "#B0AFAC" },
                        { id: "travertine", label: "Travertine", bg: "#D4C4A0" },
                      ].map((mat) => (
                        <button
                          key={mat.id}
                          className={`sec-n cursor-pointer ${!officeCabAutoSync && officeCabPanelMat === mat.id ? "on" : ""}`}
                          onClick={() => {
                            setOfficeCabPanelMat(mat.id);
                            setOfficeCabAutoSync(false);
                          }}
                          style={{ fontSize: "10.5px", padding: "5px 8px", display: "flex", alignItems: "center", gap: "6px", textAlign: "left", justifyContent: "flex-start" }}
                        >
                          <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: mat.bg, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
                          {mat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="size-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px" }}>
                    <button 
                      className="sec-n cursor-pointer"
                      onClick={() => {
                        setOfficeCabPanelMat(officeDeskTopMat);
                        triggerNotification("Panel synced to desk top");
                      }}
                      style={{ fontSize: "11px", padding: "6px" }}
                    >
                      ↺ Sync to Desk Top
                    </button>
                    <button 
                      className={`sec-n cursor-pointer ${officeCabAutoSync ? "on" : ""}`}
                      onClick={() => {
                        setOfficeCabAutoSync(!officeCabAutoSync);
                        triggerNotification(!officeCabAutoSync ? "Auto sync ON" : "Auto sync OFF");
                      }}
                      style={{ fontSize: "11px", padding: "6px" }}
                    >
                      Auto Sync
                    </button>
                  </div>
                </div>
              </div>

              {/* 9. LED Lighting */}
              <div className="rps">
                <div className="rpt">LED Lighting</div>
                <div className="size-grid">
                  <div className="size-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ margin: 0 }}>Shelf LEDs</label>
                    <button 
                      className={`sec-n cursor-pointer ${officeLedOn ? "on" : ""}`}
                      onClick={() => setOfficeLedOn(!officeLedOn)}
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                    >
                      {officeLedOn ? "ON" : "OFF"}
                    </button>
                  </div>

                  {officeLedOn && (
                    <>
                      <div className="size-row" style={{ marginBottom: "8px" }}>
                        <label style={{ marginBottom: "4px" }}>Color Temperature</label>
                        <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                          {[
                            { id: "warm", label: "Warm" },
                            { id: "neutral", label: "Neutral" },
                            { id: "cool", label: "Cool" }
                          ].map((temp) => (
                            <button
                              key={temp.id}
                              className={`sec-n cursor-pointer ${officeLedColor === temp.id ? "on" : ""}`}
                              onClick={() => setOfficeLedColor(temp.id)}
                              style={{ fontSize: "10px", padding: "4px" }}
                            >
                              {temp.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="size-row" style={{ marginBottom: "8px" }}>
                        <label>Brightness <span>{Math.round(officeLedBright * 100)}%</span></label>
                        <input
                          type="range"
                          className="slider"
                          min="10"
                          max="100"
                          step="5"
                          value={officeLedBright * 100}
                          onChange={(e) => setOfficeLedBright(parseFloat(e.target.value) / 100)}
                        />
                      </div>

                      <div className="size-row">
                        <label style={{ marginBottom: "4px" }}>Placement</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Under Shelf</span>
                            <button 
                              className={`sec-n cursor-pointer ${officeLedUnder ? "on" : ""}`}
                              onClick={() => setOfficeLedUnder(!officeLedUnder)}
                              style={{ padding: "2px 8px", fontSize: "9px" }}
                            >
                              {officeLedUnder ? "ON" : "OFF"}
                            </button>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Back of Shelf</span>
                            <button 
                              className={`sec-n cursor-pointer ${officeLedBack ? "on" : ""}`}
                              onClick={() => setOfficeLedBack(!officeLedBack)}
                              style={{ padding: "2px 8px", fontSize: "9px" }}
                            >
                              {officeLedBack ? "ON" : "OFF"}
                            </button>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Top Cove</span>
                            <button 
                              className={`sec-n cursor-pointer ${officeLedTop ? "on" : ""}`}
                              onClick={() => setOfficeLedTop(!officeLedTop)}
                              style={{ padding: "2px 8px", fontSize: "9px" }}
                            >
                              {officeLedTop ? "ON" : "OFF"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 10. Reset to Default */}
              <div className="rps" style={{ borderBottom: "none" }}>
                <button 
                  className="sec-n cursor-pointer"
                  onClick={() => {
                    setOfficeDeskW(2.4); setOfficeDeskD(1.0); setOfficeDeskH(0.75); setOfficeDeskT(0.06);
                    setOfficeDeskTopMat("natural_oak"); setOfficeDeskBaseMat("matte_beige");
                    setOfficeDeskDrawer(true); setOfficeDeskDrawerCount(3); setOfficeDeskDrawerSide("left"); setOfficeDeskDrawerStyle("closed");
                    setOfficeDeskFileCab(false);
                    setOfficeCabW(4.0); setOfficeCabH(2.8); setOfficeCabD(0.40); setOfficeCabSections(3);
                    setOfficeCabOpenShelves(3); setOfficeCabLowerDoors(4); setOfficeCabLowerHRatio(0.40);
                    setOfficeCabColor("beige"); setOfficeCabPanelMat("natural_oak"); setOfficeCabShelfSpacing("even"); setOfficeCabAutoSync(true);
                    setOfficeLedOn(true); setOfficeLedColor("warm"); setOfficeLedBright(0.70);
                    setOfficeLedUnder(true); setOfficeLedBack(false); setOfficeLedTop(false);
                    triggerNotification("Reset scene to defaults");
                  }}
                  style={{ width: "100%", padding: "10px", fontSize: "12px", background: "rgba(200,80,80,0.08)", color: "#ee6666", borderColor: "rgba(200,80,80,0.2)" }}
                >
                  Reset to Default Settings
                </button>
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
                  className="vsave cursor-pointer"
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
          ) : ["tv-wall", "cabinet", "bed", "shelves", "dressing-table"].includes(activeCategory) ? (
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

              {/* Size */}
              <div className="rps">
                <div className="rpt">Size</div>
                <div className="size-grid">
                  <div className="size-row">
                    <label>Width <span>{width.toFixed(1)} m</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="0.8"
                      max="3.2"
                      step="0.1"
                      value={width}
                      onChange={(e) => setWidth(parseFloat(e.target.value))}
                    />
                  </div>
                  {activeCategory !== "bed" && (
                    <div className="size-row">
                      <label>Height <span>{height.toFixed(1)} m</span></label>
                      <input
                        type="range"
                        className="slider"
                        min="0.4"
                        max="2.6"
                        step="0.1"
                        value={height}
                        onChange={(e) => setHeight(parseFloat(e.target.value))}
                      />
                    </div>
                  )}
                  <div className="size-row">
                    <label>Depth <span>{depth.toFixed(2)} m</span></label>
                    <input
                      type="range"
                      className="slider"
                      min="0.3"
                      max="0.8"
                      step="0.05"
                      value={depth}
                      onChange={(e) => setDepth(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* TV Wall Unit controls */}
              {activeCategory === "tv-wall" && (
                <div className="rps">
                  <div className="rpt">TV Wall Unit</div>
                  <div className="size-grid">
                    <div className="size-row">
                      <label>Screen Size</label>
                      <div className="section-btns">
                        {["43", "55", "65", "75", "85"].map((s) => (
                          <div
                            key={s}
                            className={`sec-n ${tvWallSize === s ? "on" : ""}`}
                            onClick={() => { setTvWallSize(s); triggerNotification(`${s}" screen selected`); }}
                          >
                            {s}&quot;
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="size-row">
                      <label>Floating Shelves <span>{tvWallShelves}</span></label>
                      <input
                        type="range"
                        className="slider"
                        min="0"
                        max="4"
                        step="1"
                        value={tvWallShelves}
                        onChange={(e) => setTvWallShelves(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <button
                    className={`scene-btn ${tvWallLed ? "on" : ""}`}
                    style={{ margin: "8px 0 7px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setTvWallLed(!tvWallLed); triggerNotification(tvWallLed ? "LED backlight off" : "LED backlight on"); }}
                  >
                    {tvWallLed ? "✓" : "○"} LED Backlight Glow
                  </button>
                  <button
                    className={`scene-btn ${tvWallStorage ? "on" : ""}`}
                    style={{ margin: "0 0 8px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setTvWallStorage(!tvWallStorage); triggerNotification(tvWallStorage ? "Closed storage cabinet" : "Open shelf cabinet"); }}
                  >
                    {tvWallStorage ? "✓" : "○"} Enclosed Storage Cabinet
                  </button>
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "5px" }}>Wall Panel</label>
                    <div className="section-btns">
                      {[{ id: "slats", label: "Slats" }, { id: "solid", label: "Solid" }, { id: "stone", label: "Stone" }].map((p) => (
                        <div key={p.id} className={`sec-n ${tvPanelStyle === p.id ? "on" : ""}`}
                          onClick={() => { setTvPanelStyle(p.id); triggerNotification(`Panel: ${p.label}`); }}>
                          {p.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "5px" }}>LED Color</label>
                    <div className="section-btns">
                      {[{ id: "warm", label: "Warm" }, { id: "cool", label: "Cool" }, { id: "rgb", label: "RGB" }].map((c) => (
                        <div key={c.id} className={`sec-n ${tvLedColor === c.id ? "on" : ""}`}
                          onClick={() => { setTvLedColor(c.id); triggerNotification(`LED: ${c.label}`); }}>
                          {c.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    className={`scene-btn ${tvSoundBar ? "on" : ""}`}
                    style={{ margin: "0 0 7px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setTvSoundBar(!tvSoundBar); triggerNotification(tvSoundBar ? "Sound bar removed" : "Sound bar added"); }}
                  >
                    {tvSoundBar ? "✓" : "○"} Sound Bar
                  </button>
                  <button
                    className={`scene-btn ${tvConsoleLegs ? "on" : ""}`}
                    style={{ margin: "0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setTvConsoleLegs(!tvConsoleLegs); triggerNotification(tvConsoleLegs ? "Console legs hidden" : "Hairpin legs added"); }}
                  >
                    {tvConsoleLegs ? "✓" : "○"} Hairpin Console Legs
                  </button>
                </div>
              )}

              {/* Cabinet controls */}
              {activeCategory === "cabinet" && (
                <div className="rps">
                  <div className="rpt">Cabinet</div>
                  <div className="size-grid">
                    <div className="size-row">
                      <label>Drawer Rows <span>{cabinetDrawerRows}</span></label>
                      <input
                        type="range"
                        className="slider"
                        min="0"
                        max="4"
                        step="1"
                        value={cabinetDrawerRows}
                        onChange={(e) => setCabinetDrawerRows(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="size-row">
                      <label>Leg Style</label>
                      <div className="section-btns">
                        {[
                          { id: "metal", label: "Metal" },
                          { id: "wood", label: "Wood" },
                          { id: "none", label: "None" },
                        ].map((leg) => (
                          <div
                            key={leg.id}
                            className={`sec-n ${cabinetLegs === leg.id ? "on" : ""}`}
                            onClick={() => { setCabinetLegs(leg.id); triggerNotification(`Legs: ${leg.label}`); }}
                          >
                            {leg.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`scene-btn ${cabinetOpenTop ? "on" : ""}`}
                    style={{ margin: "8px 0 8px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setCabinetOpenTop(!cabinetOpenTop); triggerNotification(cabinetOpenTop ? "Top compartment closed" : "Open-top display compartment"); }}
                  >
                    {cabinetOpenTop ? "✓" : "○"} Open-Top Display Compartment
                  </button>
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "5px" }}>Cabinet Style</label>
                    <div className="section-btns">
                      {[{ id: "sideboard", label: "Sideboard" }, { id: "highboy", label: "Highboy" }, { id: "filing", label: "Filing" }].map((s) => (
                        <div key={s.id} className={`sec-n ${cabinetStyle === s.id ? "on" : ""}`}
                          onClick={() => { setCabinetStyle(s.id); triggerNotification(`Style: ${s.label}`); }}>
                          {s.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label>Doors <span>{cabinetDoorCount}</span></label>
                    <input type="range" className="slider" min="2" max="4" step="1"
                      value={cabinetDoorCount} onChange={(e) => setCabinetDoorCount(parseInt(e.target.value))} />
                  </div>
                  <button
                    className={`scene-btn ${cabinetGlassDoors ? "on" : ""}`}
                    style={{ margin: "0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setCabinetGlassDoors(!cabinetGlassDoors); triggerNotification(cabinetGlassDoors ? "Solid doors" : "Glass doors added"); }}
                  >
                    {cabinetGlassDoors ? "✓" : "○"} Glass Doors
                  </button>
                </div>
              )}

              {/* Bed controls */}
              {activeCategory === "bed" && (
                <div className="rps">
                  <div className="rpt">Bed</div>
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "5px" }}>Bed Size</label>
                    <div className="section-btns">
                      {[
                        { id: "single", label: "Single" },
                        { id: "double", label: "Double" },
                        { id: "queen", label: "Queen" },
                        { id: "king", label: "King" },
                      ].map((sz) => (
                        <div
                          key={sz.id}
                          className={`sec-n ${bedSize === sz.id ? "on" : ""}`}
                          onClick={() => { setBedSize(sz.id); triggerNotification(`${sz.label} bed selected`); }}
                        >
                          {sz.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "5px" }}>Headboard Style</label>
                    <div className="section-btns">
                      {[
                        { id: "padded", label: "Padded" },
                        { id: "wood", label: "Wood" },
                        { id: "tall", label: "Tall" },
                        { id: "low", label: "Low" },
                      ].map((hb) => (
                        <div
                          key={hb.id}
                          className={`sec-n ${bedHeadboard === hb.id ? "on" : ""}`}
                          onClick={() => { setBedHeadboard(hb.id); triggerNotification(`Headboard: ${hb.label}`); }}
                        >
                          {hb.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    className={`scene-btn ${bedStorage ? "on" : ""}`}
                    style={{ margin: "0 0 7px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setBedStorage(!bedStorage); triggerNotification(bedStorage ? "Storage drawers removed" : "Under-bed storage drawers added"); }}
                  >
                    {bedStorage ? "✓" : "○"} Under-Bed Storage Drawers
                  </button>
                  <button
                    className={`scene-btn ${bedLedUnder ? "on" : ""}`}
                    style={{ margin: "0 0 8px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setBedLedUnder(!bedLedUnder); triggerNotification(bedLedUnder ? "Under-bed LED off" : "Under-bed LED glow on"); }}
                  >
                    {bedLedUnder ? "✓" : "○"} Under-Bed LED Glow
                  </button>
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "5px" }}>Frame Style</label>
                    <div className="section-btns">
                      {[{ id: "platform", label: "Platform" }, { id: "panel", label: "Panel" }, { id: "floating", label: "Float" }].map((f) => (
                        <div key={f.id} className={`sec-n ${bedFrameStyle === f.id ? "on" : ""}`}
                          onClick={() => { setBedFrameStyle(f.id); triggerNotification(`Frame: ${f.label}`); }}>
                          {f.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "5px" }}>Pillows</label>
                    <div className="section-btns">
                      {[{ id: 2, label: "2" }, { id: 4, label: "4" }].map((p) => (
                        <div key={p.id} className={`sec-n ${bedPillowCount === p.id ? "on" : ""}`}
                          onClick={() => { setBedPillowCount(p.id); triggerNotification(`${p.label} pillows`); }}>
                          {p.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "5px" }}>Bedside Lamp</label>
                    <div className="section-btns">
                      {[{ id: "table", label: "Table" }, { id: "pendant", label: "Pendant" }, { id: "none", label: "None" }].map((l) => (
                        <div key={l.id} className={`sec-n ${bedLampStyle === l.id ? "on" : ""}`}
                          onClick={() => { setBedLampStyle(l.id); triggerNotification(`Lamp: ${l.label}`); }}>
                          {l.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    className={`scene-btn ${bedBench ? "on" : ""}`}
                    style={{ margin: "0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setBedBench(!bedBench); triggerNotification(bedBench ? "Bench removed" : "Foot bench added"); }}
                  >
                    {bedBench ? "✓" : "○"} Foot-of-Bed Bench
                  </button>
                </div>
              )}

              {/* Shelving Unit controls */}
              {activeCategory === "shelves" && (
                <div className="rps">
                  <div className="rpt">Shelving Unit</div>
                  <div className="size-grid">
                    <div className="size-row">
                      <label>Shelf Count <span>{shelfCount}</span></label>
                      <input
                        type="range"
                        className="slider"
                        min="2"
                        max="8"
                        step="1"
                        value={shelfCount}
                        onChange={(e) => setShelfCount(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="size-row">
                      <label>Layout Style</label>
                      <div className="section-btns">
                        {[
                          { id: "open", label: "Open" },
                          { id: "ladder", label: "Ladder" },
                          { id: "cube", label: "Cube" },
                        ].map((st) => (
                          <div
                            key={st.id}
                            className={`sec-n ${shelfStyle === st.id ? "on" : ""}`}
                            onClick={() => { setShelfStyle(st.id); triggerNotification(`Layout: ${st.label}`); }}
                          >
                            {st.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`scene-btn ${shelfBackPanel ? "on" : ""}`}
                    style={{ margin: "8px 0 8px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setShelfBackPanel(!shelfBackPanel); triggerNotification(shelfBackPanel ? "Back panel removed" : "Back panel added"); }}
                  >
                    {shelfBackPanel ? "✓" : "○"} Back Panel
                  </button>
                  <div className="size-row" style={{ marginBottom: "8px" }}>
                    <label style={{ marginBottom: "5px" }}>Material</label>
                    <div className="section-btns">
                      {[{ id: "oak", label: "Oak" }, { id: "walnut", label: "Walnut" }, { id: "white", label: "White" }, { id: "metal", label: "Metal" }].map((m) => (
                        <div key={m.id} className={`sec-n ${shelfMaterial === m.id ? "on" : ""}`}
                          onClick={() => { setShelfMaterial(m.id); triggerNotification(`Material: ${m.label}`); }}>
                          {m.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    className={`scene-btn ${shelfLighting ? "on" : ""}`}
                    style={{ margin: "0 0 7px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setShelfLighting(!shelfLighting); triggerNotification(shelfLighting ? "Shelf lighting off" : "LED shelf lighting on"); }}
                  >
                    {shelfLighting ? "✓" : "○"} LED Shelf Lighting
                  </button>
                  <button
                    className={`scene-btn ${shelfDecorItems ? "on" : ""}`}
                    style={{ margin: "0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setShelfDecorItems(!shelfDecorItems); triggerNotification(shelfDecorItems ? "Decor removed" : "Books & decor added"); }}
                  >
                    {shelfDecorItems ? "✓" : "○"} Books & Decor Items
                  </button>
                </div>
              )}

              {/* Dressing Table controls */}
              {activeCategory === "dressing-table" && (
                <div className="rps">
                  <div className="rpt">Dressing Table</div>
                  <div className="size-grid">
                    <div className="size-row">
                      <label>Drawers <span>{dressingDrawers}</span></label>
                      <input
                        type="range"
                        className="slider"
                        min="0"
                        max="4"
                        step="1"
                        value={dressingDrawers}
                        onChange={(e) => setDressingDrawers(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="size-row">
                      <label>Mirror Style</label>
                      <div className="section-btns">
                        {[
                          { id: "round", label: "Round" },
                          { id: "rect", label: "Rect." },
                          { id: "trifold", label: "Trifold" },
                          { id: "none", label: "None" },
                        ].map((mr) => (
                          <div
                            key={mr.id}
                            className={`sec-n ${dressingMirror === mr.id ? "on" : ""}`}
                            onClick={() => { setDressingMirror(mr.id); triggerNotification(`Mirror: ${mr.label}`); }}
                          >
                            {mr.label}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="size-row">
                      <label>Mirror Lights</label>
                      <div className="section-btns">
                        {[
                          { id: "hollywood", label: "Hollywood" },
                          { id: "led-strip", label: "LED Ring" },
                          { id: "none", label: "None" },
                        ].map((l) => (
                          <div
                            key={l.id}
                            className={`sec-n ${dressingLights === l.id ? "on" : ""}`}
                            onClick={() => { setDressingLights(l.id); triggerNotification(`Lights: ${l.label}`); }}
                          >
                            {l.label}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="size-row">
                      <label>Table Material</label>
                      <div className="section-btns">
                        {[
                          { id: "oak", label: "Oak" },
                          { id: "walnut", label: "Walnut" },
                          { id: "white", label: "White" },
                          { id: "black", label: "Black" },
                        ].map((m) => (
                          <div
                            key={m.id}
                            className={`sec-n ${dressingTableMat === m.id ? "on" : ""}`}
                            onClick={() => { setDressingTableMat(m.id); triggerNotification(`Material: ${m.label}`); }}
                          >
                            {m.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`scene-btn ${dressingStool ? "on" : ""}`}
                    style={{ margin: "8px 0 0 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                    onClick={() => { setDressingStool(!dressingStool); triggerNotification(dressingStool ? "Stool removed" : "Matching stool added"); }}
                  >
                    {dressingStool ? "✓" : "○"} Matching Stool
                  </button>
                </div>
              )}

              {/* Body Colour - shared swatches */}
              <div className="rps">
                <div className="rpt">Body Colour</div>
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

              {/* Save & Export */}
              <div className="rps">
                <div className="rpt">Save &amp; Export</div>
                <div style={{ marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>Estimated Cost: </span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent)" }}>
                    ${parseFloat(calculateEstimatedCost()).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  className="vsave cursor-pointer"
                  onClick={() => triggerNotification("Design saved to designs list!")}
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

                  {/* Send to Production */}
                  <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                    <button
                      className="sec-n hover-bright cursor-pointer"
                      onClick={handleSendToProduction}
                      style={{ fontSize: "10.5px", padding: "8px", textAlign: "center", background: "linear-gradient(135deg, #c8a050 0%, #e8d4a5 100%)", color: "#000", fontWeight: "bold", width: "100%" }}
                    >
                      🏭 Send to Production
                    </button>
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

      {/* Production Modal */}
      <ProductionModal
        spec={currentProductionSpec}
        isOpen={productionModalOpen}
        onClose={() => setProductionModalOpen(false)}
      />
    </div>
  );
}

