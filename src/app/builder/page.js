"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

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
    app.scene.background = new THREE.Color(0x1e1e24);
    app.scene.fog = new THREE.Fog(0x1e1e24, 12, 28);

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
    app.scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a24, 0.85));

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
      new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.9, metalness: 0.08 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    app.scene.add(floor);

    const grid = new THREE.GridHelper(20, 20, 0x3a3a46, 0x3a3a46);
    grid.position.y = 0.001;
    grid.material.opacity = 0.5;
    grid.material.transparent = true;
    app.scene.add(grid);

    // Mount Root Object
    app.root = new THREE.Group();
    app.scene.add(app.root);

    // Initial build call
    buildWardrobe();

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
    buildWardrobe();
  }, [width, height, depth, sections, extDrawerRows, intDrawers, buildWardrobe]);

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

  // AI execution simulation
  const handleRunAI = (text) => {
    if (!text.trim()) return;
    const t = text.toLowerCase();
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

    triggerNotification('✦ AI applied: "' + text.slice(0, 30) + (text.length > 30 ? "..." : "") + '"');
  };

  return (
    <div className="builder-root-container">
      {/* Dynamic CSS Styling Injector */}
      <style dangerouslySetInnerHTML={{ __html: `
        .builder-root-container {
          --bg: #0c0c0e;
          --bg2: #111114;
          --bg3: #18181d;
          --border: rgba(255, 255, 255, 0.07);
          --border2: rgba(255, 255, 255, 0.13);
          --accent: #c8a96e;
          --accent2: #e8c98e;
          --text: #f0ede8;
          --muted: #8a8880;
          --muted2: #5a5855;
          
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
          <button className="tb gold cursor-pointer" onClick={() => triggerNotification("Exporting...")}>Export ↓</button>
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
          </div>
        </div>
      </div>

      {/* Dynamic Toast notifications */}
      <div className={`notif ${showNotif ? "show" : ""}`}>
        {notifText}
      </div>
    </div>
  );
}
