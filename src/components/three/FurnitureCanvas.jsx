"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";
import FurnitureModel from "./FurnitureModel";

const darkScenes = {
  studio: { bg: "#151515", floor: "#1a1a1a", ambient: 0.6, dirIntensity: 1.5 },
  "living-room": { bg: "#1a1612", floor: "#1f1a15", ambient: 0.7, dirIntensity: 1.2 },
  kitchen: { bg: "#161a1c", floor: "#1a1e20", ambient: 0.65, dirIntensity: 1.4 },
  dark: { bg: "#0a0a0a", floor: "#111", ambient: 0.4, dirIntensity: 1.8 },
};

const lightScenes = {
  studio: { bg: "#f5f5f5", floor: "#e8e8e8", ambient: 0.8, dirIntensity: 1.2 },
  "living-room": { bg: "#f0ebe5", floor: "#e5ddd5", ambient: 0.85, dirIntensity: 1.0 },
  kitchen: { bg: "#edf0f2", floor: "#e0e5e8", ambient: 0.8, dirIntensity: 1.1 },
  dark: { bg: "#e0e0e0", floor: "#d5d5d5", ambient: 0.7, dirIntensity: 1.3 },
};

export default function FurnitureCanvas({ design, scene = "studio", theme = "dark" }) {
  const scenes = theme === "light" ? lightScenes : darkScenes;
  const cfg = scenes[scene] || scenes.studio;

  return (
    <div className="w-full h-full bg-surface rounded-2xl overflow-hidden relative">
      {/* Placeholder when no design */}
      {!design && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center">
              <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <p className="text-sm text-muted">Configure your furniture and click</p>
            <p className="text-sm text-accent font-medium">Generate Design</p>
          </div>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [2.5, 2, 3], fov: 40 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        style={{ background: cfg.bg }}
      >
        <Suspense fallback={null}>
          {/* 3-point lighting */}
          <ambientLight intensity={cfg.ambient} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={cfg.dirIntensity}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-4, 3, -2]} intensity={0.4} />
          <pointLight position={[0, 4, 3]} intensity={0.3} />

          {/* Hemisphere for soft fill */}
          <hemisphereLight
            skyColor="#ffffff"
            groundColor={cfg.floor}
            intensity={0.3}
          />

          {/* Model */}
          {design && <FurnitureModel design={design} />}

          {/* Contact shadow on the floor */}
          <ContactShadows
            position={[0, -0.005, 0]}
            opacity={0.4}
            scale={8}
            blur={2}
            far={5}
          />

          {/* Orbit controls — NO auto-rotation */}
          <OrbitControls
            makeDefault
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate={false}
            minDistance={0.8}
            maxDistance={12}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
