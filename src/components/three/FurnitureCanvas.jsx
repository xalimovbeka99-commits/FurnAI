"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, MeshReflectorMaterial } from "@react-three/drei";
import { EffectComposer, SSAO } from "@react-three/postprocessing";
import { Suspense } from "react";
import FurnitureModel from "./FurnitureModel";

const darkScenes = {
  studio: { bg: "transparent", floor: "#151515", ambient: 0.6 },
  "living-room": { bg: "transparent", floor: "#1f1a15", ambient: 0.7 },
  kitchen: { bg: "transparent", floor: "#1a1e20", ambient: 0.65 },
  dark: { bg: "transparent", floor: "#050505", ambient: 0.4 },
};

const lightScenes = {
  studio: { bg: "transparent", floor: "#f0f0f2", ambient: 0.8 },
  "living-room": { bg: "transparent", floor: "#e5ddd5", ambient: 0.85 },
  kitchen: { bg: "transparent", floor: "#e0e5e8", ambient: 0.8 },
  dark: { bg: "transparent", floor: "#d5d5d5", ambient: 0.7 },
};

export default function FurnitureCanvas({ design, scene = "studio", theme = "dark", isExploded = false }) {
  const scenes = theme === "light" ? lightScenes : darkScenes;
  const cfg = scenes[scene] || scenes.studio;

  return (
    <div className="w-full h-full relative">
      {/* Placeholder when no design */}
      {!design && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center glass-pro p-8 rounded-[2rem] shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-surface/40 border border-border flex items-center justify-center">
              <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <p className="text-base text-muted font-medium tracking-tight">Configure your furniture and click</p>
            <p className="text-base text-accent font-semibold tracking-tight mt-1">✨ Generate Design</p>
          </div>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [2.5, 2, 4], fov: 35 }} // 35mm cinematic look
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Master Prompt: Soft-box lighting setup */}
          <ambientLight intensity={cfg.ambient} />
          {/* Top-left large area light equivalent */}
          <directionalLight
            position={[-4, 8, 4]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          {/* Warm fill light right */}
          <directionalLight position={[5, 3, -1]} intensity={0.5} color="#ffe8cc" />
          
          <hemisphereLight skyColor="#ffffff" groundColor={cfg.floor} intensity={0.2} />

          {/* Model with Exploded View support */}
          {design && <FurnitureModel design={design} isExploded={isExploded} />}

          {/* Master Prompt: Reflector Ground Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <MeshReflectorMaterial
              blur={[400, 100]}
              resolution={512}
              mixBlur={0.8}
              mixStrength={1.5}
              roughness={0.2}
              depthScale={1}
              minDepthThreshold={0.8}
              maxDepthThreshold={1.2}
              color={cfg.floor}
              metalness={0.3}
            />
          </mesh>

          {/* SSAO Postprocessing for deep shadows */}
          <EffectComposer multisampling={4}>
            <SSAO 
              samples={21} 
              radius={0.15} 
              intensity={25} 
              luminanceInfluence={0.4} 
              color="black" 
            />
          </EffectComposer>

          {/* Orbit Controls */}
          <OrbitControls
            makeDefault
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate={false}
            minDistance={1}
            maxDistance={15}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
