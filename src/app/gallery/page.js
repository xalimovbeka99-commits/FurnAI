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
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <motion.p variants={fadeUp} custom={0} className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
            Gallery
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4">
            Design Inspiration
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted max-w-xl mx-auto">
            Explore our collection of AI-generated furniture designs. Click any design for details.
          </motion.p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="flex items-center justify-center gap-2 mb-12"
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "bg-surface text-muted hover:text-white hover:bg-surface-light border border-border"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={i}
              onClick={() => setSelected(item)}
              className="glass rounded-2xl overflow-hidden cursor-pointer group hover:border-accent/30 transition-all"
            >
              {/* Preview placeholder */}
              <div className="h-56 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color}44)` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="rounded-lg shadow-2xl transition-transform group-hover:scale-105"
                    style={{
                      width: Math.min(item.width * 0.5, 120),
                      height: Math.min(item.height * 0.5, 100),
                      backgroundColor: item.color,
                      opacity: 0.6,
                    }}
                  />
                </div>
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2 py-1 rounded-md glass text-[10px] font-medium uppercase tracking-wider">
                    {item.type}
                  </span>
                  <span className="px-2 py-1 rounded-md glass text-[10px] font-medium uppercase tracking-wider">
                    {item.style}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">{item.name}</h3>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-2xl max-w-lg w-full p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selected.name}</h2>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium">{selected.type}</span>
                    <span className="px-2 py-1 rounded-md bg-white/5 text-muted text-xs font-medium">{selected.style}</span>
                    <span className="px-2 py-1 rounded-md bg-white/5 text-muted text-xs font-medium">{selected.material}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-muted hover:text-white transition-colors text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Preview */}
              <div className="h-48 rounded-xl mb-6 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${selected.color}22, ${selected.color}44)` }}>
                <div
                  className="rounded-lg shadow-2xl"
                  style={{
                    width: Math.min(selected.width * 0.6, 140),
                    height: Math.min(selected.height * 0.5, 120),
                    backgroundColor: selected.color,
                    opacity: 0.7,
                  }}
                />
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-surface rounded-xl p-3 text-center">
                  <p className="text-xs text-muted mb-1">Width</p>
                  <p className="font-semibold text-accent">{selected.width} cm</p>
                </div>
                <div className="bg-surface rounded-xl p-3 text-center">
                  <p className="text-xs text-muted mb-1">Height</p>
                  <p className="font-semibold text-accent">{selected.height} cm</p>
                </div>
                <div className="bg-surface rounded-xl p-3 text-center">
                  <p className="text-xs text-muted mb-1">Depth</p>
                  <p className="font-semibold text-accent">{selected.depth} cm</p>
                </div>
              </div>

              <a
                href="/builder"
                className="block w-full py-3 bg-accent hover:bg-accent-dark text-white text-center font-semibold rounded-xl transition-all"
              >
                Open in Builder →
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
