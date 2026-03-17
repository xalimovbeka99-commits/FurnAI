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
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-12">
          <motion.p variants={fadeUp} custom={0} className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
            Dashboard
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4">
            My Designs
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted">
            Manage your saved furniture designs. Open them in the builder, rename, or delete.
          </motion.p>
        </motion.div>

        {/* Empty state */}
        {savedDesigns.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface border border-border flex items-center justify-center">
              <span className="text-3xl">📐</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No saved designs yet</h3>
            <p className="text-sm text-muted mb-8 max-w-sm mx-auto">
              Start creating furniture in the AI Builder and save your designs here.
            </p>
            <Link
              href="/builder"
              className="inline-flex px-8 py-3 bg-accent hover:bg-accent-dark text-white font-medium rounded-full transition-all"
            >
              Open Builder →
            </Link>
          </motion.div>
        )}

        {/* Designs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {savedDesigns.map((design, i) => (
              <motion.div
                key={design.id}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                variants={fadeUp}
                custom={i}
                className="glass rounded-2xl overflow-hidden group"
              >
                {/* Preview */}
                <div
                  className="h-40 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${design.color}22, ${design.color}44)` }}
                >
                  <div
                    className="rounded-lg shadow-lg"
                    style={{
                      width: Math.min(design.width * 0.5, 100),
                      height: Math.min(design.height * 0.4, 80),
                      backgroundColor: design.color,
                      opacity: 0.6,
                    }}
                  />
                </div>

                <div className="p-5">
                  {/* Name */}
                  {editingId === design.id ? (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRename(design.id)}
                        className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent"
                        autoFocus
                      />
                      <button onClick={() => handleRename(design.id)} className="text-accent text-sm font-medium">
                        Save
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-semibold mb-1">{design.name}</h3>
                  )}

                  <p className="text-xs text-muted mb-1">
                    {design.width} × {design.height} × {design.depth} cm
                  </p>
                  <p className="text-xs text-muted mb-4">
                    {design.type} · {design.style} · {design.material}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href="/builder"
                      onClick={() => loadDesignIntoBuilder(design)}
                      className="flex-1 py-2 text-center bg-accent/10 text-accent text-xs font-medium rounded-lg hover:bg-accent/20 transition-colors"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => {
                        setEditingId(design.id);
                        setEditName(design.name);
                      }}
                      className="flex-1 py-2 glass text-xs font-medium rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => deleteDesign(design.id)}
                      className="flex-1 py-2 glass text-xs font-medium rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
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
