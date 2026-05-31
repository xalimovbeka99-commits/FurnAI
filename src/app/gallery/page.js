"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: "easeOut" },
  }),
};

const galleryItems = [
  { id: 1, name: "Minimalist Wardrobe", type: "wardrobe", style: "minimal", material: "wood", color: "#8B6914", width: 150, height: 220, depth: 60 },
  { id: 2, name: "Glass Coffee Table", type: "table", style: "modern", material: "glass", color: "#E8E8E8", width: 120, height: 45, depth: 60 },
  { id: 3, name: "Luxury Sofa", type: "sofa", style: "luxury", material: "wood", color: "#3E2723", width: 200, height: 85, depth: 90 },
  { id: 4, name: "Modern Cabinet", type: "cabinet", style: "modern", material: "metal", color: "#1a1a1a", width: 100, height: 120, depth: 45 },
  { id: 5, name: "Classic Bookshelf", type: "wardrobe", style: "classic", material: "wood", color: "#8B6914", width: 80, height: 200, depth: 35 },
  { id: 6, name: "Industrial Table", type: "table", style: "modern", material: "metal", color: "#C0C0C0", width: 160, height: 75, depth: 80 },
  { id: 7, name: "Velvet Lounge Sofa", type: "sofa", style: "luxury", material: "wood", color: "#7C3AED", width: 220, height: 80, depth: 95 },
  { id: 8, name: "Oak Storage Cabinet", type: "cabinet", style: "classic", material: "wood", color: "#8B6914", width: 90, height: 150, depth: 50 },
  { id: 9, name: "Scandinavian Dresser", type: "cabinet", style: "minimal", material: "wood", color: "#F5F5DC", width: 110, height: 80, depth: 45 },
];

const filters = ["All", "Wardrobe", "Table", "Sofa", "Cabinet"];

export default function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = filter === "All"
    ? galleryItems
    : galleryItems.filter((item) => item.type === filter.toLowerCase());

  return (
    <div className="min-h-screen pt-28 pb-20 bg-img-materials relative">
      {/* Visual dark backdrop for high legibility */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-xs pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold tracking-widest uppercase mb-4 gradient-text">
            Gallery
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">
            Design Inspiration
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            Explore our collection of AI-generated furniture designs. Click any design for details.
          </motion.p>
        </motion.div>

        {/* Filters - redesigned with floating backdrop glass buttons */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="flex flex-wrap items-center justify-center gap-3 mb-16"
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                filter === f
                  ? "bg-gradient-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/20 scale-105 border border-white/20"
                  : "bg-black/35 backdrop-blur-md text-muted hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Grid of floating cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={i}
              onClick={() => setSelected(item)}
              className="glass rounded-3xl overflow-hidden cursor-pointer group border border-white/5 transition-all floating-layer relative"
            >
              {/* Preview placeholder */}
              <div className="h-60 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${item.color}15, ${item.color}35)` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-110"
                    style={{
                      width: Math.min(item.width * 0.5, 130),
                      height: Math.min(item.height * 0.5, 110),
                      backgroundColor: item.color,
                      opacity: 0.7,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  />
                </div>
                <div className="absolute top-4 left-4 flex gap-1.5 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-white">
                    {item.type}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-white">
                    {item.style}
                  </span>
                </div>
              </div>
              <div className="p-6 relative z-10 bg-black/20">
                <h3 className="font-semibold text-base mb-1 group-hover:text-accent-light transition-colors text-white">{item.name}</h3>
                <p className="text-xs text-muted">
                  {item.width} × {item.height} × {item.depth} cm · {item.material}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl max-w-lg w-full p-8 border border-white/15 floating-layer-deep"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-white">{selected.name}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent-light text-xs font-semibold">{selected.type}</span>
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-muted text-xs font-semibold">{selected.style}</span>
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-muted text-xs font-semibold">{selected.material}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-muted hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Preview */}
              <div className="h-56 rounded-2xl mb-6 flex items-center justify-center border border-white/5" style={{ background: `linear-gradient(135deg, ${selected.color}22, ${selected.color}44)` }}>
                <div
                  className="rounded-xl shadow-2xl border border-white/15"
                  style={{
                    width: Math.min(selected.width * 0.6, 150),
                    height: Math.min(selected.height * 0.5, 130),
                    backgroundColor: selected.color,
                    opacity: 0.75,
                  }}
                />
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted mb-1">Width</p>
                  <p className="font-bold text-accent-light text-sm md:text-base">{selected.width} cm</p>
                </div>
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted mb-1">Height</p>
                  <p className="font-bold text-accent-light text-sm md:text-base">{selected.height} cm</p>
                </div>
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted mb-1">Depth</p>
                  <p className="font-bold text-accent-light text-sm md:text-base">{selected.depth} cm</p>
                </div>
              </div>

              <a
                href="/builder"
                className="btn-premium-primary w-full text-center"
              >
                <span>Open in Builder →</span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
