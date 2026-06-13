"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid } from "@react-three/drei";
import StructurePanel from "@/components/builder/StructurePanel";
import AppearancePanel from "@/components/builder/AppearancePanel";
import FurnitureModel from "@/components/builder/FurnitureModel";
import useFurnitureStore from "@/store/furnitureStore";
import ProductionModal from "@/components/ProductionModal";
import AIAssistantPanel from "@/components/builder/AIAssistantPanel";
import { createDefaultConfig } from "@/lib/furnitureConfig";

export default function BuilderPage() {
  const config = useFurnitureStore((s) => s.config);
  const selectModule = useFurnitureStore((s) => s.selectModule);
  const loadConfig = useFurnitureStore((s) => s.loadConfig);
  const setPrompt = useFurnitureStore((s) => s.setPrompt);

  const [productionModalOpen, setProductionModalOpen] = useState(false);
  const [currentProductionSpec, setCurrentProductionSpec] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    
    if (params.has("prompt") || params.has("description")) {
      const promptText = params.get("prompt") || params.get("description");
      if (promptText) {
        setPrompt(promptText);
        setTimeout(() => {
          handleRunAI(promptText);
        }, 800);
      }
    }
  }, [setPrompt]);

  const handleRunAI = async (text) => {
    try {
      const res = await fetch("/api/nlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
      });
      const data = await res.json();
      if (data.success && data.parameters) {
        // The NLP route will now return a full FurnitureConfig object
        if (data.parameters.modules) {
          loadConfig(data.parameters);
        } else {
          // Basic fallback if API didn't return full config
          console.warn("AI didn't return a full config array. Falling back to default.");
        }
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
    }
  };

  const handleExport = () => {
    setCurrentProductionSpec(config);
    setProductionModalOpen(true);
  };

  return (
    <div className="flex h-screen w-full bg-neutral-100 pt-16 dark:bg-neutral-900">
      <StructurePanel />

      <main className="relative flex-1">
        <Canvas
          shadows
          camera={{ position: [2.6, 1.9, 3.2], fov: 45 }}
          onPointerMissed={() => selectModule(null)}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
          <Environment preset="apartment" />
          <Grid args={[20, 20]} cellColor="#ddd" sectionColor="#bbb" infiniteGrid fadeDistance={18} position={[0, 0, 0]} />

          <group position={[0, -config.dimensions.height / 2, 0]}>
            <FurnitureModel />
          </group>

          <OrbitControls makeDefault target={[0, 0, 0]} minDistance={1.2} maxDistance={9} />
        </Canvas>

        <div className="pointer-events-none absolute left-4 top-4 rounded bg-white/80 px-3 py-1.5 text-xs text-neutral-600 backdrop-blur dark:bg-neutral-800/80 dark:text-neutral-300">
          Click a door or drawer to edit that section · drag to orbit
        </div>
        
        <div className="absolute right-4 top-4 pointer-events-auto">
           <button 
             onClick={handleExport}
             className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition-colors"
           >
             Export Manufacturing Spec
           </button>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-auto">
           <AIAssistantPanel onGenerate={handleRunAI} />
        </div>
      </main>

      <AppearancePanel />

      <ProductionModal
        isOpen={productionModalOpen}
        onClose={() => setProductionModalOpen(false)}
        spec={currentProductionSpec}
      />
    </div>
  );
}
