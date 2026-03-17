"use client";

import { motion } from "framer-motion";

// Texture presets per furniture type
const texturePresets = {
  wardrobe: [
    { id: "oak", label: "Oak Wood", color: "#8B6914", roughness: 0.75, metalness: 0.05, preview: "linear-gradient(135deg, #8B6914, #A67C2E)" },
    { id: "walnut", label: "Walnut", color: "#3E2723", roughness: 0.7, metalness: 0.05, preview: "linear-gradient(135deg, #3E2723, #5D4037)" },
    { id: "matte-white", label: "Matte White", color: "#E8E8E8", roughness: 0.85, metalness: 0.02, preview: "linear-gradient(135deg, #E8E8E8, #CCCCCC)" },
    { id: "gloss-black", label: "Gloss Black", color: "#1a1a1a", roughness: 0.15, metalness: 0.3, preview: "linear-gradient(135deg, #333, #111)" },
    { id: "birch", label: "Birch", color: "#F5F5DC", roughness: 0.72, metalness: 0.03, preview: "linear-gradient(135deg, #F5F5DC, #EEE8AA)" },
  ],
  sofa: [
    { id: "gray-fabric", label: "Gray Fabric", color: "#808080", roughness: 0.92, metalness: 0.0, preview: "linear-gradient(135deg, #808080, #666)" },
    { id: "beige-fabric", label: "Beige Fabric", color: "#B0A090", roughness: 0.92, metalness: 0.0, preview: "linear-gradient(135deg, #B0A090, #C8B8A0)" },
    { id: "navy-fabric", label: "Navy Velvet", color: "#1B2A4A", roughness: 0.88, metalness: 0.0, preview: "linear-gradient(135deg, #1B2A4A, #2E4068)" },
    { id: "brown-leather", label: "Brown Leather", color: "#6B3A2A", roughness: 0.55, metalness: 0.08, preview: "linear-gradient(135deg, #6B3A2A, #8B5A3A)" },
    { id: "olive-fabric", label: "Olive Fabric", color: "#6B7A4A", roughness: 0.9, metalness: 0.0, preview: "linear-gradient(135deg, #6B7A4A, #8B9A5A)" },
  ],
  table: [
    { id: "natural-wood", label: "Natural Wood", color: "#A67C2E", roughness: 0.7, metalness: 0.05, preview: "linear-gradient(135deg, #A67C2E, #C49A3E)" },
    { id: "marble-white", label: "White Marble", color: "#E8E0D0", roughness: 0.3, metalness: 0.15, preview: "linear-gradient(135deg, #E8E0D0, #D0C8B8)" },
    { id: "glass-clear", label: "Glass", color: "#E0F0F0", roughness: 0.05, metalness: 0.1, preview: "linear-gradient(135deg, rgba(200,230,240,0.5), rgba(180,210,220,0.3))" },
    { id: "dark-wood", label: "Dark Wood", color: "#3E2723", roughness: 0.75, metalness: 0.05, preview: "linear-gradient(135deg, #3E2723, #5D4037)" },
    { id: "concrete", label: "Concrete", color: "#999999", roughness: 0.85, metalness: 0.05, preview: "linear-gradient(135deg, #999, #888)" },
  ],
  cabinet: [
    { id: "oak", label: "Oak Wood", color: "#8B6914", roughness: 0.75, metalness: 0.05, preview: "linear-gradient(135deg, #8B6914, #A67C2E)" },
    { id: "matte-white", label: "Matte White", color: "#E8E8E8", roughness: 0.85, metalness: 0.02, preview: "linear-gradient(135deg, #E8E8E8, #CCC)" },
    { id: "charcoal", label: "Charcoal", color: "#333333", roughness: 0.7, metalness: 0.1, preview: "linear-gradient(135deg, #333, #555)" },
    { id: "walnut", label: "Walnut", color: "#3E2723", roughness: 0.7, metalness: 0.05, preview: "linear-gradient(135deg, #3E2723, #5D4037)" },
  ],
  kitchen: [
    { id: "white-gloss", label: "White Gloss", color: "#F0F0F0", roughness: 0.15, metalness: 0.1, preview: "linear-gradient(135deg, #F0F0F0, #DDD)" },
    { id: "oak", label: "Oak Wood", color: "#8B6914", roughness: 0.75, metalness: 0.05, preview: "linear-gradient(135deg, #8B6914, #A67C2E)" },
    { id: "dark-gray", label: "Anthracite", color: "#2A2A2A", roughness: 0.6, metalness: 0.15, preview: "linear-gradient(135deg, #2A2A2A, #444)" },
    { id: "sage-green", label: "Sage Green", color: "#7A8B6A", roughness: 0.7, metalness: 0.05, preview: "linear-gradient(135deg, #7A8B6A, #9AAB8A)" },
    { id: "navy", label: "Navy Blue", color: "#1B2A4A", roughness: 0.6, metalness: 0.1, preview: "linear-gradient(135deg, #1B2A4A, #2E4068)" },
  ],
};

export default function TextureSelector({ type, selectedTexture, onSelect }) {
  const presets = texturePresets[type] || texturePresets.wardrobe;

  return (
    <div>
      <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">
        Texture / Finish
      </label>
      <div className="grid grid-cols-5 gap-2">
        {presets.map((texture) => (
          <motion.button
            key={texture.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(texture)}
            title={texture.label}
            className={`relative group rounded-xl overflow-hidden aspect-square transition-all ${
              selectedTexture?.id === texture.id
                ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                : "ring-1 ring-white/10 hover:ring-white/30"
            }`}
          >
            <div
              className="w-full h-full"
              style={{ background: texture.preview }}
            />
            {/* Label tooltip */}
            <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[8px] text-white text-center truncate">{texture.label}</p>
            </div>
            {/* Active check */}
            {selectedTexture?.id === texture.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-accent/20">
                <span className="text-xs">✓</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export { texturePresets };
