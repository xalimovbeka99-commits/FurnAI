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
  concrete: { c: 0xBCB8B0, r: 0.92, m: 0.00 },
  darkwood: { c: 0x282422, r: 0.80, m: 0.04 },
};

// ─── STYLE PRESETS ───
const PRESETS = {
  luxury:     { color: 'oak',    handle: 'gold',   door: 'solid',  led: 'warm'  },
  minimal:    { color: 'white',  handle: 'hidden',  door: 'solid',  led: 'off'   },
  scandi:     { color: 'linen',  handle: 'silver',  door: 'solid',  led: 'off'   },
  industrial: { color: 'graph',  handle: 'black',   door: 'solid',  led: 'cool'  },
  classic:    { color: 'walnut', handle: 'gold',    door: 'solid',  led: 'warm'  },
  modern:     { color: 'black',  handle: 'chrome',  door: 'solid',  led: 'cool'  },
  navy:       { color: 'navy',   handle: 'chrome',  door: 'glass',  led: 'cool'  },
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
  const [intDrawers, setIntDrawers] = useState(false);
  const [activePreset, setActivePreset] = useState("luxury");
  const [activeColor, setActiveColor] = useState("oak");
  const [doorStyle, setDoorStyle] = useState("solid");
  const [handleStyle, setHandleStyle] = useState("gold");
  const [ledLighting, setLedLighting] = useState("off");
  const [activeView, setActiveView] = useState("v3d");
  const [prompt, setPrompt] = useState("");
  const [notifText, setNotifText] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [hudText, setHudText] = useState("✦ Click a part to customise");
  const [showHud, setShowHud] = useState(false);

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
    ledMesh: null,
    ledLight: null,
    doorsOpen: false,
    drawersAllOpen: false,
    interiorVisible: false,
    M: {
      body: new THREE.MeshStandardMaterial({ color: 0x282422, roughness: 0.80, metalness: 0.04 }),
      door: new THREE.MeshStandardMaterial({ color: 0xBCB8B0, roughness: 0.92, metalness: 0.00 }),
      handle: new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.45, metalness: 0.30 }),
      plinth: new THREE.MeshStandardMaterial({ color: 0x1E1C1A, roughness: 0.85, metalness: 0.04 }),
      led: new THREE.MeshStandardMaterial({ color: 0xFFDD88, emissive: new THREE.Color(0xFFDD88), emissiveIntensity: 0 }),
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

  // helper to lighten hex colors
  const lightenColor = (hex, amount) => {
    const num = hex;
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
    return (r << 16) | (g << 8) | b;
  };

  // ─── 3D WARDROBE MESH GENERATOR ───
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

    // Body Panel creator helper
    const addBody = (w, h, d, x, y, z, n) => {
      const m = mesh(box(w, h, d), app.M.body, x, y, z, n);
      m.userData.group = "body";
      app.root.add(m);
      app.selectables.push(m);
      return m;
    };

    // Core Frame
    const BODY_H = H - PL;
    addBody(W, BODY_H, T, 0, PL + BODY_H / 2, -(D / 2 - T / 2), "back");
    addBody(T, BODY_H, D, -(W / 2 - T / 2), PL + BODY_H / 2, 0, "sideL");
    addBody(T, BODY_H, D, (W / 2 - T / 2), PL + BODY_H / 2, 0, "sideR");
    addBody(W, T, D, 0, H - T / 2, 0, "top");

    // Top rail accent
    const topRail = mesh(box(W, 0.018, D + 0.004), app.M.plinth, 0, H + 0.009, 0, "topRail");
    topRail.userData.group = "body";
    app.root.add(topRail);

    // Plinth
    const plinth = mesh(box(W, PL, D - 0.06), app.M.plinth, 0, PL / 2, 0.01, "plinth");
    plinth.userData.group = "plinth";
    app.root.add(plinth);
    app.selectables.push(plinth);

    // Feet
    const footGeo = new THREE.BoxGeometry(FT, FH, FT);
    const foX = W / 2 - 0.08, foZ = D / 2 - 0.08;
    [[-foX, -foZ], [foX, -foZ], [-foX, foZ], [foX, foZ]].forEach(([fx, fz], idx) => {
      const fm = new THREE.Mesh(footGeo, app.M.plinth);
      fm.position.set(fx, FH / 2, fz);
      fm.castShadow = true;
      fm.name = "foot" + idx;
      fm.userData = { group: "body", selectable: false };
      app.root.add(fm);
    });

    // Separator panel
    if (extDrawerRows > 0) {
      const sep = mesh(box(W - T * 2, T * 0.8, D - T), app.M.body, 0, PL + T + EXT_DH, 0, "sepH");
      sep.userData.group = "body";
      app.root.add(sep);
    }

    // ─── EXTERIOR DRAWERS ───
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

        const dFront = mesh(box(trayW, trayH, T), app.M.door, 0, 0, frontZ, `dFront_r${row}_c${col}`);
        dFront.userData.group = "ext-drawer";
        dFront.userData.drawerGroup = dg;
        dg.add(dFront);
        app.selectables.push(dFront);

        // Tray walls
        dg.add(Object.assign(mesh(box(WT, trayH, boxD), drawerIntMat, -(trayW / 2 - WT / 2), 0, midZ), { userData: { group: "body" } }));
        dg.add(Object.assign(mesh(box(WT, trayH, boxD), drawerIntMat, (trayW / 2 - WT / 2), 0, midZ), { userData: { group: "body" } }));
        dg.add(Object.assign(mesh(box(trayW - WT * 2, WT, boxD), drawerIntMat, 0, -(trayH / 2 - WT / 2), midZ), { userData: { group: "body" } }));
        dg.add(Object.assign(mesh(box(trayW - WT * 2, trayH - WT, WT), drawerIntMat, 0, WT / 2, backZ), { userData: { group: "body" } }));

        // Handle
        const dHandle = mesh(box(trayW * 0.44, 0.022, 0.026), app.M.handle, 0, 0, frontZ + T / 2 + 0.016, `dHandle_r${row}_c${col}`);
        dHandle.userData.group = "handles";
        dg.add(dHandle);
        app.selectables.push(dHandle);

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

    // ─── DOORS ───
    const doorW = (W - T * 2 - GAP * (sections + 1)) / sections;
    for (let i = 0; i < sections; i++) {
      const leftHinge = (i % 2 === 0);
      const slotLeft = -W / 2 + T + GAP + i * (doorW + GAP);
      const hingeX = leftHinge ? slotLeft : slotLeft + doorW;

      const pivot = new THREE.Group();
      pivot.position.set(hingeX, DOOR_Y, DOOR_Z);

      const dmOffX = leftHinge ? doorW / 2 : -doorW / 2;
      const dm = mesh(box(doorW, DOOR_H - GAP * 2, T), app.M.door, dmOffX, 0, 0, "door" + i);
      dm.userData.group = "doors";
      pivot.add(dm);
      app.selectables.push(dm);

      const hx = leftHinge ? doorW * 0.72 : -doorW * 0.72;
      const hBar = mesh(new THREE.BoxGeometry(0.022, 0.20, 0.028), app.M.handle, hx, 0, T / 2 + 0.018, "handle" + i);
      hBar.userData.group = "handles";
      pivot.add(hBar);
      app.selectables.push(hBar);

      // Hide handles if style is set to hidden
      if (handleStyle === "hidden") {
        hBar.visible = false;
      }

      app.root.add(pivot);
      const openDir = leftHinge ? -Math.PI / 2 : Math.PI / 2;
      app.doorPivots.push({ pivot, target: app.doorsOpen ? openDir : 0, openDir, i });
      
      // sync current door pivot position if door is set open
      if (app.doorsOpen) {
        pivot.rotation.y = openDir;
      }
    }

    // Vertical dividers between slots
    for (let i = 1; i < sections; i++) {
      const vx = -W / 2 + T + GAP + i * (doorW + GAP) - GAP / 2;
      const vd = mesh(box(T * 0.8, DOOR_H, D - T * 0.5), app.M.body, vx, DOOR_Y, -T * 0.2, "vdiv" + i);
      vd.userData.group = "body";
      app.root.add(vd);
    }

    // ─── INTERIOR DRAWERS ───
    if (intDrawers) {
      const iDW = (W - T * 2) / sections - GAP * 2;
      const iDH = 0.16;
      const iRows = 4;
      const iCol = 0;
      const icx = -W / 2 + T + GAP + iCol * (doorW + GAP) + doorW / 2;
      const iBoxD = D - T * 3;

      for (let r = 0; r < iRows; r++) {
        const iy = PL + T + EXT_DH + 0.05 + r * (iDH + GAP * 3);
        const ig = new THREE.Group();
        ig.position.set(icx, iy, 0);
        ig.userData.isDrawerGroup = true;

        const iFront = mesh(box(iDW, iDH - GAP, T), app.M.door, 0, 0, D / 2 - T, "idFront_r" + r);
        iFront.userData.group = "int-drawer";
        iFront.userData.drawerGroup = ig;
        ig.add(iFront);
        app.selectables.push(iFront);

        const iBoxMesh = mesh(box(iDW - T * 0.5, iDH - GAP - T * 0.4, iBoxD), app.M.body, 0, 0, D / 2 - T - iBoxD / 2, "idBox_r" + r);
        iBoxMesh.userData.group = "body";
        ig.add(iBoxMesh);

        const iHandle = mesh(box(iDW * 0.38, 0.018, 0.022), app.M.handle, 0, 0, D / 2 - T + 0.014, "idHandle_r" + r);
        iHandle.userData.group = "handles";
        ig.add(iHandle);
        app.selectables.push(iHandle);

        // Visible only if doors are swung open or interior toggle is checked
        ig.visible = app.doorsOpen || app.interiorVisible;
        app.root.add(ig);
        app.shelvesMeshes.push(ig);
        app.drawerPivots.push({ group: ig, targetZ: 0, openZ: (D - T * 2) * 0.68, open: false, row: r, col: iCol, interior: true });
      }
    }

    // ─── INTERIOR SHELVES ───
    const shelfMat = new THREE.MeshStandardMaterial({ color: app.M.body.color.getHex(), roughness: 0.78, metalness: 0.03 });
    const innerW = W - T * 2 - 0.008;
    const innerD = D - T * 1.5;
    for (let i = 1; i <= 4; i++) {
      const sy = PL + T + EXT_DH + DOOR_H * (i / 5);
      const sm = mesh(box(innerW, T, innerD), shelfMat, 0, sy, -T * 0.25, "shelf" + i);
      sm.userData.group = "shelf";
      sm.visible = app.interiorVisible || app.doorsOpen;
      app.root.add(sm);
      app.shelvesMeshes.push(sm);
      app.selectables.push(sm);
    }

    // ─── LED LIGHT STRIP ───
    app.ledMesh = mesh(new THREE.BoxGeometry(W - T * 2 - 0.02, 0.014, 0.014), app.M.led, 0, PL + T + EXT_DH + 0.01, D / 2 - 0.008, "led");
    app.ledMesh.visible = ledLighting !== "off";
    app.root.add(app.ledMesh);

    app.ledLight = new THREE.PointLight(0xFFDD88, 0, 4);
    app.ledLight.position.set(0, PL + T + EXT_DH + 0.06, D / 2 + 0.12);
    app.root.add(app.ledLight);

    // Apply active LED power level
    const colsLED = { off: 0xFFDD88, warm: 0xFFCC44, cool: 0x88AAFF, rgb: 0xFF55BB };
    const emI = { off: 0, warm: 2.2, cool: 2.0, rgb: 2.5 };
    const lInt = { off: 0, warm: 1.0, cool: 0.8, rgb: 1.3 };
    app.M.led.color.setHex(colsLED[ledLighting]);
    app.M.led.emissive.setHex(colsLED[ledLighting]);
    app.M.led.emissiveIntensity = emI[ledLighting];
    app.M.led.needsUpdate = true;
    app.ledLight.color.setHex(colsLED[ledLighting]);
    app.ledLight.intensity = lInt[ledLighting];

  }, [width, height, depth, sections, extDrawerRows, intDrawers, handleStyle, ledLighting]);

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


  // Synchronize dynamic color updates
  useEffect(() => {
    const app = appRef.current;
    const p = PALETTE[activeColor];
    if (!p) return;

    // Apply body + plinth
    app.M.body.color.setHex(p.c);
    app.M.body.roughness = p.r;
    app.M.body.metalness = p.m;
    app.M.body.needsUpdate = true;

    app.M.plinth.color.setHex(p.c);
    app.M.plinth.color.multiplyScalar(0.60);
    app.M.plinth.roughness = p.r;
    app.M.plinth.needsUpdate = true;

    app.shelvesMeshes.forEach(s => {
      if (s.material && s.userData.group === "shelf") {
        s.material.color.setHex(p.c);
        s.material.needsUpdate = true;
      }
    });

    // Apply door panels style configs
    if (doorStyle === "glass") {
      app.M.door.color.setHex(0xCCE0F4);
      app.M.door.roughness = 0.06; app.M.door.metalness = 0.05;
      app.M.door.transparent = true; app.M.door.opacity = 0.22;
    } else if (doorStyle === "mirror") {
      app.M.door.color.setHex(0xCCDEEE);
      app.M.door.roughness = 0.02; app.M.door.metalness = 0.95;
      app.M.door.transparent = false; app.M.door.opacity = 1;
    } else if (doorStyle === "frosted") {
      app.M.door.color.setHex(0xE4ECF8);
      app.M.door.roughness = 0.55; app.M.door.metalness = 0.0;
      app.M.door.transparent = true; app.M.door.opacity = 0.48;
    } else {
      app.M.door.color.setHex(lightenColor(p.c, -8));
      app.M.door.roughness = 0.90; app.M.door.metalness = 0.00;
      app.M.door.transparent = false; app.M.door.opacity = 1;
    }
    app.M.door.needsUpdate = true;

    // Apply Handle finishes
    const handleFinishes = {
      gold: { c: 0xC8A050, r: 0.18, m: 0.88 },
      silver: { c: 0xC0C8D0, r: 0.15, m: 0.90 },
      black: { c: 0x1A1A1A, r: 0.5, m: 0.3 },
      chrome: { c: 0xDDE8F0, r: 0.04, m: 0.96 },
      hidden: { c: 0x1A1A1A, r: 0.5, m: 0.3 }
    };
    const hp = handleFinishes[handleStyle] || handleFinishes.gold;
    app.M.handle.color.setHex(hp.c);
    app.M.handle.roughness = hp.r;
    app.M.handle.metalness = hp.m;
    app.M.handle.needsUpdate = true;

  }, [activeColor, doorStyle, handleStyle]);

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
  }, [buildWardrobe, triggerNotification, triggerHud]);

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
    } else {
      buildWardrobe();
    }
  }, [
    activeCategory,
    width, height, depth, sections, extDrawerRows, intDrawers, buildWardrobe,
    roomWidth, roomLength, roomHeight, kitchenLayout,
    baseCabinetWidth, baseCabinetHeight, baseCabinetDepth, toeKickHeight, kitchenHandleType,
    wallCabinetsEnabled, wallCabinetHeight, wallCabinetDepth, wallCabinetDistance, wallCabinetGlass, wallCabinetOpen,
    tallCabinetType, tallCabinetsCount, countertopMaterial, countertopThickness, countertopWaterfall, countertopColor,
    islandEnabled, islandWidth, islandDepth, islandSeating, islandSink, islandCooker,
    applianceFridge, applianceOven, applianceCooker, applianceHood, applianceDishwasher,
    sinkType, sinkPosition, faucetType, kitchenCabinetMaterial, kitchenCabinetWoodType, kitchenCabinetMatteColor,
    wallColor, floorColor, backsplashColor, textureScale, textureRotation, glossLevel, roughnessVal, bumpStrength,
    buildKitchen, showWalls
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
    setHandleStyle(p.handle);
    setDoorStyle(p.door);
    setLedLighting(p.led);
    triggerNotification("Style applied: " + presetKey);
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
    triggerNotification("JPG Render downloaded!");
  };

  const handleExportGLB = () => {
    const designData = {
      generator: "FurniAI Kitchen & Furniture Configurator",
      version: "1.0",
      activeCategory,
      timestamp: new Date().toISOString(),
      dimensions: {
        width: activeCategory === "kitchen" ? roomWidth : width,
        height: activeCategory === "kitchen" ? roomHeight : height,
        depth: activeCategory === "kitchen" ? roomLength : depth,
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
      } : {
        sections,
        extDrawerRows,
        intDrawers,
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
  - Width: ${activeCategory === "kitchen" ? roomWidth * 100 : width * 100} cm
  - Height: ${activeCategory === "kitchen" ? roomHeight * 100 : height * 100} cm
  - Depth: ${activeCategory === "kitchen" ? roomLength * 100 : depth * 100} cm

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
# Dimensions: ${activeCategory === "kitchen" ? roomWidth : width} x ${activeCategory === "kitchen" ? roomHeight : height} x ${activeCategory === "kitchen" ? roomLength : depth}
# This file contains the 3D layout data for imports in SketchUp, AutoCAD, or Blender.
# Selected Materials: ${activeCategory === "kitchen" ? kitchenCabinetMaterial : activeColor}
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

    // Auto-switch category to kitchen if prompt contains kitchen keywords
    if (t.includes("kitchen") || t.includes("cabinet") || t.includes("countertop") || t.includes("appliances") || t.includes("island") || t.includes("sink") || t.includes("hob")) {
      setActiveCategory("kitchen");
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
        {/* LEFT PANEL */}
        <div className="lsb">
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
        <div className="rp">
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

              {/* Surface Colour */}
              <div className="rps">
                <div className="rpt">Surface Colour</div>
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
                        setDoorStyle("solid");
                        triggerNotification("Colour: " + sw.name);
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
                  className={`scene-btn ${intDrawers ? "on" : ""}`}
                  style={{ margin: "0 0 7px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
                  onClick={() => {
                    setIntDrawers(!intDrawers);
                    triggerNotification(!intDrawers ? "Interior drawers added" : "Interior drawers removed");
                  }}
                >
                  <span style={{ background: "#e07a5f", width: "18px", height: "18px", borderRadius: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", marginRight: "8px" }}>📥</span>
                  Add Interior Drawers
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
