"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import useFurnitureStore from "@/store/furnitureStore";
import { generateFurniture } from "@/lib/generateFurniture";
import TextureSelector from "@/components/TextureSelector";
import KitchenControls from "@/components/KitchenControls";
import { useTheme } from "@/components/ThemeProvider";

const FurnitureCanvas = dynamic(
  () => import("@/components/three/FurnitureCanvas"),
  { ssr: false }
);

const furnitureTypes = [
  { value: "wardrobe", label: "Wardrobe", icon: "🪟" },
  { value: "table", label: "Table", icon: "🪑" },
  { value: "sofa", label: "Sofa", icon: "🛋️" },
  { value: "cabinet", label: "Cabinet", icon: "🗄️" },
  { value: "kitchen", label: "Kitchen", icon: "🍳" },
];

const styleOptions = [
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "luxury", label: "Luxury" },
  { value: "classic", label: "Classic" },
];

const materialOptions = [
  { value: "wood", label: "Wood" },
  { value: "glass", label: "Glass" },
  { value: "metal", label: "Metal" },
  { value: "marble", label: "Marble" },
  { value: "fabric", label: "Fabric" },
];

const scenes = [
  { id: "studio", label: "Studio" },
  { id: "living-room", label: "Living Room" },
  { id: "kitchen", label: "Kitchen" },
  { id: "dark", label: "Dark" },
];

const presetColors = [
  "#8B6914", "#3E2723", "#F5F5DC", "#1a1a1a",
  "#E8E8E8", "#C0C0C0", "#2563eb", "#B0A090",
];

export default function BuilderPage() {
  const store = useFurnitureStore();
  const [design3D, setDesign3D] = useState(null);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("controls");
  const [selectedTexture, setSelectedTexture] = useState(null);
  const [activeScene, setActiveScene] = useState("studio");
  const [isExploded, setIsExploded] = useState(false);
  const { theme } = useTheme();

  const handleTextureSelect = useCallback((texture) => {
    setSelectedTexture(texture);
    store.setColor(texture.color);
  }, [store]);

  // AI Generate
  const handleAIGenerate = useCallback(async () => {
    if (!store.prompt.trim()) return;
    setAiLoading(true);
    setAiSuggestions(null);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: store.prompt }),
      });
      const data = await res.json();
      if (data.error) { setAiLoading(false); return; }
      if (data.type) {
        store.setType(data.type);
        if (data.style) store.setStyle(data.style);
        if (data.material) store.setMaterial(data.material);
        if (data.color) store.setColor(data.color);
        if (data.width) store.setWidth(data.width);
        if (data.height) store.setHeight(data.height);
        if (data.depth) store.setDepth(data.depth);
        setAiSuggestions(data.suggestions || null);
        const model = generateFurniture({
          type: data.type, style: data.style || store.style,
          material: data.material || store.material, color: data.color || store.color,
          width: data.width || store.width, height: data.height || store.height,
          depth: data.depth || store.depth,
          kitchen: data.type === "kitchen" ? store.kitchen : undefined,
        });
        setDesign3D(model);
        store.generateDesign();
      }
    } catch (err) { console.error("AI generation failed:", err); }
    finally { setAiLoading(false); }
  }, [store]);

  // Manual generate
  const handleGenerate = useCallback(async () => {
    await store.generateDesign();
    const effectiveColor = selectedTexture?.color || store.color;
    const model = generateFurniture({
      type: store.type, style: store.style, material: store.material,
      color: effectiveColor, width: store.width, height: store.height, depth: store.depth,
      kitchen: store.type === "kitchen" ? store.kitchen : undefined,
    });
    setDesign3D(model);
  }, [store, selectedTexture]);

  // Save
  const handleSave = async () => {
    if (store.generatedDesign) {
      store.saveDesign(store.generatedDesign);
      try {
        await fetch("/api/save", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(store.generatedDesign) });
      } catch {}
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // Factory Export
  const handleFactoryExport = async () => {
    if (!store.generatedDesign) return;
    setExportLoading(true);
    setIsExploded(true); // Trigger "Wow" Export Animation
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const res = await fetch("/api/export", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store.generatedDesign) });
      const spec = await res.json();
      const blob = new Blob([JSON.stringify(spec, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(spec.meta?.name || "furniture").replace(/\s+/g, "-").toLowerCase()}-factory-spec.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error("Export failed:", err); }
    finally { setExportLoading(false); setIsExploded(false); }
  };

  // Quick JSON Export
  const handleExportJSON = async () => {
    if (store.generatedDesign) {
      setIsExploded(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const spec = {
        name: store.generatedDesign.name, type: store.type, style: store.style,
        material: store.material, color: store.color, texture: selectedTexture?.label || null,
        dimensions: { width: store.width + " cm", height: store.height + " cm", depth: store.depth + " cm" },
      };
      const blob = new Blob([JSON.stringify(spec, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${spec.name.replace(/\s+/g, "-").toLowerCase()}-spec.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExploded(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="relative h-[calc(100vh-4rem)] overflow-hidden bg-background">
        {/* ─── Left Panel (Glass Island) ─── */}
        <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}
          className="absolute left-0 top-0 lg:left-6 lg:top-6 lg:bottom-6 w-full lg:w-[440px] z-20 glass-pro lg:rounded-[2rem] overflow-y-auto flex flex-col pointer-events-auto">
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">AI Builder</h1>
              <p className="text-xs text-muted">Design furniture with AI or manual controls • 100% Free</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface rounded-xl p-1">
              {[{ id: "controls", label: "Controls" }, { id: "ai", label: "✨ AI" }, { id: "export", label: "🏭 Export" }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === tab.id ? "bg-accent text-white shadow-lg" : "text-muted hover:text-white"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ═══ AI TAB ═══ */}
            {activeTab === "ai" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Describe your furniture</label>
                  <textarea value={store.prompt} onChange={(e) => store.setPrompt(e.target.value)}
                    placeholder="e.g., modern luxury wardrobe with glass doors, white kitchen with marble countertop..."
                    className="w-full h-28 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none" />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleAIGenerate} disabled={aiLoading || !store.prompt.trim()}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
                  {aiLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />AI is thinking...</>) : "🧠 Generate with AI"}
                </motion.button>
                <AnimatePresence>
                  {aiSuggestions && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                      <p className="text-xs font-medium text-accent uppercase tracking-wider">AI Suggestions</p>
                      {aiSuggestions.style_note && (<div className="glass rounded-lg p-3"><p className="text-[10px] text-muted uppercase mb-1">Style</p><p className="text-xs text-white/90">{aiSuggestions.style_note}</p></div>)}
                      {aiSuggestions.material_note && (<div className="glass rounded-lg p-3"><p className="text-[10px] text-muted uppercase mb-1">Material</p><p className="text-xs text-white/90">{aiSuggestions.material_note}</p></div>)}
                      {aiSuggestions.layout_note && (<div className="glass rounded-lg p-3"><p className="text-[10px] text-muted uppercase mb-1">Layout</p><p className="text-xs text-white/90">{aiSuggestions.layout_note}</p></div>)}
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="text-[10px] text-muted text-center">Works with OpenAI API key in .env.local • Falls back to smart generation without it</p>
              </motion.div>
            )}

            {/* ═══ EXPORT TAB ═══ */}
            {activeTab === "export" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-3">🏭 Factory Export</h3>
                  <p className="text-xs text-muted mb-4">Production-ready spec with component breakdown, hardware list, assembly instructions, and mm dimensions.</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleFactoryExport} disabled={!store.generatedDesign || exportLoading}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
                    {exportLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>) : "📦 Export for Factory (JSON)"}
                  </motion.button>
                </div>
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-3">📄 Quick Export</h3>
                  <button onClick={handleExportJSON} disabled={!store.generatedDesign}
                    className="w-full py-3 glass hover:bg-white/10 text-sm font-medium rounded-xl disabled:opacity-40">
                    Download Simple Spec
                  </button>
                </div>
                {!store.generatedDesign && <p className="text-xs text-center text-muted">Generate a design first.</p>}
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-3">Factory spec includes:</h3>
                  <ul className="text-xs text-muted space-y-1.5">
                    <li>✓ Component breakdown (every panel, shelf, door)</li>
                    <li>✓ Exact dimensions (mm precision)</li>
                    <li>✓ Hardware list (hinges, rails, handles)</li>
                    <li>✓ Material & edge banding specifications</li>
                    <li>✓ Assembly instructions</li>
                    <li>✓ Finishing & production notes</li>
                    {store.type === "kitchen" && (<><li>✓ Appliance slot dimensions</li><li>✓ Countertop specifications</li></>)}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* ═══ CONTROLS TAB ═══ */}
            {activeTab === "controls" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                {/* Prompt */}
                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Description (optional)</label>
                  <textarea value={store.prompt} onChange={(e) => store.setPrompt(e.target.value)}
                    placeholder="e.g., A sleek modern wardrobe with 3 shelves..."
                    className="w-full h-16 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none" />
                </div>

                {/* Type */}
                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {furnitureTypes.map((t) => (
                      <button key={t.value} onClick={() => store.setType(t.value)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1 ${store.type === t.value ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-surface text-muted hover:text-white border border-border"}`}>
                        <span className="text-base">{t.icon}</span>{t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style */}
                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {styleOptions.map((s) => (
                      <button key={s.value} onClick={() => store.setStyle(s.value)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${store.style === s.value ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-surface text-muted hover:text-white border border-border"}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Material */}
                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Material</label>
                  <div className="grid grid-cols-3 gap-2">
                    {materialOptions.map((m) => (
                      <button key={m.value} onClick={() => store.setMaterial(m.value)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${store.material === m.value ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-surface text-muted hover:text-white border border-border"}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Texture Selector */}
                <TextureSelector type={store.type} selectedTexture={selectedTexture} onSelect={handleTextureSelect} />

                {/* Color */}
                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.map((c) => (
                      <button key={c} onClick={() => store.setColor(c)} title={c}
                        className={`w-7 h-7 rounded-full transition-all ${store.color === c ? "ring-2 ring-accent ring-offset-2 ring-offset-background scale-110" : "hover:scale-110"}`}
                        style={{ backgroundColor: c }} />
                    ))}
                    <input type="color" value={store.color} onChange={(e) => store.setColor(e.target.value)}
                      className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent" title="Custom" />
                  </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted uppercase tracking-wider block">Dimensions</label>
                  {[
                    { label: "Width", value: store.width, setter: store.setWidth, min: 30, max: store.type === "kitchen" ? 500 : 300 },
                    { label: "Height", value: store.height, setter: store.setHeight, min: 30, max: 300 },
                    { label: "Depth", value: store.depth, setter: store.setDepth, min: 20, max: 200 },
                  ].map((dim) => (
                    <div key={dim.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-muted">{dim.label}</span>
                        <span className="text-xs text-accent font-medium">{dim.value} cm</span>
                      </div>
                      <input type="range" min={dim.min} max={dim.max} value={dim.value} onChange={(e) => dim.setter(e.target.value)} />
                    </div>
                  ))}
                </div>

                {/* Kitchen Controls */}
                {store.type === "kitchen" && (
                  <KitchenControls kitchen={store.kitchen} setAppliance={store.setKitchenAppliance} />
                )}

                {/* Generate */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate} disabled={store.isGenerating}
                  className="w-full py-4 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
                  {store.isGenerating ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>) : "✨ Generate Design"}
                </motion.button>

                {/* Actions */}
                <AnimatePresence>
                  {store.generatedDesign && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-3 gap-2">
                      <button onClick={handleSave} className="py-2.5 glass hover:bg-white/10 text-xs font-medium rounded-xl">{saved ? "✓ Saved!" : "💾 Save"}</button>
                      <button onClick={handleExportJSON} className="py-2.5 glass hover:bg-white/10 text-xs font-medium rounded-xl">📄 Export</button>
                      <button onClick={() => setActiveTab("export")} className="py-2.5 glass hover:bg-white/10 text-xs font-medium rounded-xl">🏭 Factory</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ─── Right Panel — 3D Preview (Infinite Canvas) ─── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="absolute inset-0 z-0 bg-background">
          {/* Loading overlay */}
          <AnimatePresence>
            {(store.isGenerating || aiLoading) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-black/40 backdrop-blur-md flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-3 border-accent/50 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-white shadow-sm glow-text">{aiLoading ? "AI is designing..." : "Generating 3D model..."}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <FurnitureCanvas design={design3D} scene={activeScene} theme={theme} isExploded={isExploded} />

          {/* Scene Selector (Glass Toolbar) */}
          <div className="absolute top-6 right-6 flex gap-1 z-10 glass-pro p-1.5 rounded-2xl">
            {scenes.map((s) => (
              <button key={s.id} onClick={() => setActiveScene(s.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${activeScene === s.id ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-muted hover:text-white"}`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Info overlay */}
          {store.generatedDesign && (
            <div className="absolute bottom-6 right-6 glass-pro rounded-2xl px-5 py-4 z-10 max-w-[300px]">
              <p className="text-sm font-semibold tracking-tight">{store.generatedDesign.name}</p>
              <p className="text-xs text-muted mt-1">{store.width} × {store.height} × {store.depth} cm · {store.material}{selectedTexture ? ` · ${selectedTexture.label}` : ""}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
