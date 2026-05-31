"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import useFurnitureStore from "@/store/furnitureStore";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

export default function DashboardPage() {
  const { savedDesigns, loadDesigns, deleteDesign, renameDesign, loadDesignIntoBuilder } = useFurnitureStore();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  const handleRename = (id) => {
    if (editName.trim()) {
      renameDesign(id, editName.trim());
      setEditingId(null);
      setEditName("");
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-img-about relative">
      {/* Background opacity overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-accent-light text-xs font-semibold tracking-widest uppercase mb-4">
            Dashboard
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white leading-tight">
            My Designs
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted text-sm md:text-base max-w-xl">
            Manage your saved furniture designs. Open them in the builder, rename, or delete.
          </motion.p>
        </motion.div>

        {/* Empty state */}
        {savedDesigns.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-pro border border-white/10 rounded-3xl text-center py-20 max-w-xl mx-auto floating-layer-deep"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
              📐
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">No saved designs yet</h3>
            <p className="text-sm text-muted mb-8 max-w-xs mx-auto">
              Start creating furniture in the AI Builder and save your designs here.
            </p>
            <Link href="/builder" className="btn-premium-primary">
              <span>Open Builder →</span>
            </Link>
          </motion.div>
        )}

        {/* Designs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {savedDesigns.map((design, i) => (
              <motion.div
                key={design.id}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                variants={fadeUp}
                custom={i}
                className="glass rounded-3xl overflow-hidden group border border-white/5 transition-all floating-layer relative"
              >
                {/* Preview */}
                <div
                  className="h-44 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${design.color}15, ${design.color}35)` }}
                >
                  <div
                    className="rounded-lg shadow-2xl border border-white/15"
                    style={{
                      width: Math.min(design.width * 0.5, 110),
                      height: Math.min(design.height * 0.4, 90),
                      backgroundColor: design.color,
                      opacity: 0.7,
                    }}
                  />
                </div>

                <div className="p-6 relative z-10 bg-black/20">
                  {/* Name */}
                  {editingId === design.id ? (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRename(design.id)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent"
                        autoFocus
                      />
                      <button onClick={() => handleRename(design.id)} className="text-accent-light text-xs font-semibold uppercase tracking-wider">
                        Save
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-semibold text-base mb-1.5 text-white group-hover:text-accent-light transition-colors">{design.name}</h3>
                  )}

                  <p className="text-xs text-muted mb-1">
                    {design.width} × {design.height} × {design.depth} cm
                  </p>
                  <p className="text-xs text-muted mb-6">
                    {design.type} · {design.style} · {design.material}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href="/builder"
                      onClick={() => loadDesignIntoBuilder(design)}
                      className="flex-1 py-2 text-center bg-accent/15 border border-accent/25 text-accent-light text-xs font-semibold rounded-xl hover:bg-accent/25 transition-all hover:scale-[1.03]"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => {
                        setEditingId(design.id);
                        setEditName(design.name);
                      }}
                      className="flex-1 py-2 bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-xl hover:bg-white/10 hover:border-white/20 transition-all hover:scale-[1.03] cursor-pointer"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => deleteDesign(design.id)}
                      className="flex-1 py-2 bg-white/5 border border-white/10 text-xs font-semibold rounded-xl hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all hover:scale-[1.03] cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
