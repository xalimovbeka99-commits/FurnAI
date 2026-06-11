"use client";

import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage } from "@react-three/drei";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: "easeOut" },
  }),
};

const galleryItems = [
  { id: 1,  name: "Oak Wardrobe",       type: "wardrobe",       style: "luxury",   material: "Oak Wood",  color: "oak",     width: 200, height: 240, depth: 60,  glb: "/wardrobe.glb" },
  { id: 2,  name: "Modern Kitchen",     type: "kitchen",        style: "modern",   material: "Matte",     color: "white",   width: 240, height: 220, depth: 60,  glb: "/kitchen.glb" },
  { id: 3,  name: "Executive Office",   type: "office",         style: "minimal",  material: "Oak + Metal",color: "oak",     width: 240, height: 220, depth: 100, glb: "/office.glb" },
  { id: 4,  name: "TV Wall Unit",       type: "office",         style: "modern",   material: "Dark Walnut",color: "walnut",  width: 220, height: 200, depth: 42,  glb: "/tv_wall.glb" },
  { id: 5,  name: "Sideboard Cabinet",  type: "cabinet",        style: "scandi",   material: "Oak Wood",  color: "oak",     width: 110, height: 88,  depth: 48,  glb: "/cabinet.glb" },
  { id: 6,  name: "Queen Bed",          type: "bed",            style: "luxury",   material: "Walnut",    color: "walnut",  width: 165, height: 100, depth: 210, glb: "/bed.glb" },
  { id: 7,  name: "Oak Bookshelf",      type: "shelves",        style: "classic",  material: "Oak Wood",  color: "oak",     width: 120, height: 220, depth: 32,  glb: "/shelves.glb" },
  { id: 8,  name: "Dressing Table",     type: "dressing_table", style: "luxury",   material: "Oak + Gold",color: "oak",     width: 120, height: 155, depth: 50,  glb: "/dressing_table.glb" },
  { id: 9,  name: "Dining Table",       type: "table",          style: "minimal",  material: "Oak Wood",  color: "oak",     width: 160, height: 75,  depth: 90,  glb: "/test_table.glb" },
];

// Style names for display
const STYLE_NAMES = {
  luxury: "Luxury",
  minimal: "Minimal",
  scandi: "Scandi",
  industrial: "Industrial",
  classic: "Classic",
  modern: "Modern",
  navy: "Navy",
};

// Preload all models so they are ready when cards mount
galleryItems.forEach((item) => useGLTF.preload(item.glb));

const CATEGORY_FILTERS = ["All", "Wardrobe", "Kitchen", "Office", "Bed", "Cabinet", "Shelves", "Table", "Dressing Table"];
const STYLE_FILTERS = ["All", "Luxury", "Minimal", "Scandi", "Industrial", "Classic", "Modern", "Navy"];

const TYPE_COLOR = {
  wardrobe:       "#00e5ff",
  kitchen:        "#3b82f6",
  office:         "#00a3cc",
  "tv-wall":      "#60a5fa",
  cabinet:        "#0077b6",
  bed:            "#00b4d8",
  shelves:        "#93c5fd",
  "dressing-table":"#0284c7",
  table:          "#005f73",
  decor:          "#0891b2",
};

// ─── GLB scene component (must be inside Suspense) ─────────────────────────
function GLBScene({ glb }) {
  const { scene } = useGLTF(glb);
  return <primitive object={scene} />;
}

// ─── Small card canvas (auto-rotate, no controls) ─────────────────────────
function CardCanvas({ glb }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Stage
          environment="city"
          intensity={0.55}
          adjustCamera={1.3}
          shadows="contact"
        >
          <GLBScene glb={glb} />
        </Stage>
        <OrbitControls
          autoRotate
          autoRotateSpeed={1.4}
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Suspense>
    </Canvas>
  );
}

// ─── Large modal canvas (orbit + zoom enabled) ────────────────────────────
function ModalCanvas({ glb }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Stage
          environment="city"
          intensity={0.6}
          adjustCamera={1.4}
          shadows="contact"
        >
          <GLBScene glb={glb} />
        </Stage>
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.8}
          enableZoom
          enablePan={false}
          minDistance={1}
          maxDistance={20}
        />
      </Suspense>
    </Canvas>
  );
}

// ─── Card preview: mounts Canvas only after entering viewport ─────────────
function CardPreview({ item }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const accentColor = TYPE_COLOR[item.type] || "#c8a870";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="h-60 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}38)` }}
    >
      {active ? (
        <CardCanvas glb={item.glb} />
      ) : (
        /* Skeleton while waiting for IntersectionObserver */
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-2xl animate-pulse"
            style={{ width: 80, height: 80, background: accentColor, opacity: 0.25 }}
          />
        </div>
      )}
      <div className="absolute top-4 left-4 flex gap-1.5 z-10 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white">
          {item.type}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white">
          {item.style}
        </span>
      </div>
    </div>
  );
}

// AI-Generated Variations Generator based on selected item
const generateVariations = (item) => {
  const variations = [];
  
  if (item.type === "wardrobe") {
    variations.push({
      name: `Walnut ${item.name}`,
      color: "walnut",
      style: "luxury",
      material: "Walnut Wood",
      doorType: "mirror",
      handleStyle: "gold",
      desc: "Warm walnut finish with mirrored door panels and premium gold bar handles.",
      width: item.width,
      height: item.height,
      depth: item.depth
    });
    variations.push({
      name: `Glossy White ${item.name}`,
      color: "white",
      style: "minimal",
      material: "Glossy White Melamine",
      doorType: "solid",
      handleStyle: "hidden",
      desc: "Sleek all-white minimalist design with touch-latches and handle-free doors.",
      width: item.width,
      height: item.height,
      depth: item.depth
    });
  } else if (item.type === "kitchen") {
    variations.push({
      name: "Sage Green Kitchen",
      color: "sage",
      style: "scandi",
      material: "Sage Matte Finish",
      desc: "Nordic-inspired sage green cabinets with oak accents and open shelves.",
      width: item.width,
      height: item.height,
      depth: item.depth
    });
    variations.push({
      name: "Midnight Navy Kitchen",
      color: "navy",
      style: "modern",
      material: "Midnight Navy Satin",
      desc: "Navy cabinets with white quartz countertops and gold hardware.",
      width: item.width,
      height: item.height,
      depth: item.depth
    });
  } else if (item.type === "bed") {
    variations.push({
      name: "Light Oak Platform Bed",
      color: "oak",
      style: "scandi",
      material: "Natural Oak",
      desc: "Platform frame in light oak with minimal wooden headboard and matching nightstands.",
      width: item.width,
      height: item.height,
      depth: item.depth
    });
    variations.push({
      name: "Dark Charcoal Storage Bed",
      color: "black",
      style: "modern",
      material: "Upholstered Linen",
      desc: "Fully upholstered dark linen frame with spacious lift-up hydraulic storage.",
      width: item.width,
      height: item.height,
      depth: item.depth
    });
  } else {
    // Generic fallback variations
    variations.push({
      name: `Walnut ${item.name}`,
      color: "walnut",
      style: "classic",
      material: "American Walnut",
      desc: `Classic premium walnut version of the ${item.name}.`,
      width: item.width,
      height: item.height,
      depth: item.depth
    });
    variations.push({
      name: `Minimal White ${item.name}`,
      color: "white",
      style: "minimal",
      material: "Matte Lacquer",
      desc: `Pure white minimalist style of the ${item.name}.`,
      width: item.width,
      height: item.height,
      depth: item.depth
    });
  }
  
  return variations;
};

// ─── Main page ─────────────────────────────────────────────────────────────
export default function GalleryPage() {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = galleryItems.filter((item) => {
    // Category filter
    const categoryMatch =
      categoryFilter === "All" ||
      item.type.toLowerCase() === categoryFilter.toLowerCase() ||
      item.type.replace("-", " ").toLowerCase() === categoryFilter.toLowerCase();

    // Style filter
    const styleMatch =
      styleFilter === "All" ||
      STYLE_NAMES[item.style]?.toLowerCase() === styleFilter.toLowerCase();

    // Search filter
    const searchMatch = searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && styleMatch && searchMatch;
  });

  const handleCustomizeThis = (item) => {
    const params = new URLSearchParams();
    params.append("type", item.type);
    params.append("style", item.style);
    params.append("color", item.color);
    params.append("width", item.width);
    params.append("height", item.height);
    params.append("depth", item.depth);
    params.append("description", `${item.name} - ${item.style} ${item.type}`);

    router.push(`/builder?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-img-materials relative">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-xs pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="text-center mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold tracking-widest uppercase mb-4 gradient-text">
            Gallery
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">
            Design Inspiration
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            Explore our collection of AI-generated furniture designs. Drag to rotate any model.
          </motion.p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="mb-8 flex justify-center"
        >
          <input
            type="text"
            placeholder="Search by name or material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent/50 focus:bg-white/[0.15] transition-all w-full max-w-md text-sm"
          />
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
          className="mb-6"
        >
          <p className="text-xs uppercase tracking-widest text-muted mb-3 text-center">Type</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setCategoryFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  categoryFilter === f
                    ? "bg-gradient-to-r from-accent to-accent-light text-white shadow-lg shadow-accent/20 border border-white/20"
                    : "bg-black/35 backdrop-blur-md text-muted hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Style Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={5}
          className="mb-12"
        >
          <p className="text-xs uppercase tracking-widest text-muted mb-3 text-center">Style</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {STYLE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStyleFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  styleFilter === f
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 border border-white/20"
                    : "bg-black/35 backdrop-blur-md text-muted hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
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
              <CardPreview item={item} />

              <div className="p-6 relative z-10 bg-black/20">
                <h3 className="font-semibold text-base mb-1 group-hover:text-accent-light transition-colors text-white">
                  {item.name}
                </h3>
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
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl w-full max-w-xl p-8 border border-white/15 floating-layer-deep my-8"
            >
              <div className="flex items-start justify-between mb-5">
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

              {/* 3D viewer */}
              <div
                className="h-64 rounded-2xl mb-6 overflow-hidden border border-white/8"
                style={{ background: `linear-gradient(135deg, ${TYPE_COLOR[selected.type] || "#c8a870"}18, ${TYPE_COLOR[selected.type] || "#c8a870"}30)` }}
              >
                <ModalCanvas glb={selected.glb} />
              </div>

              {/* Hint */}
              <p className="text-center text-[10px] text-muted mb-5 -mt-3 tracking-wide">
                Drag to rotate · Scroll to zoom
              </p>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[["Width", selected.width], ["Height", selected.height], ["Depth", selected.depth]].map(([label, val]) => (
                  <div key={label} className="bg-black/35 border border-white/5 rounded-2xl p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted mb-1">{label}</p>
                    <p className="font-bold text-accent-light text-sm">{val} cm</p>
                  </div>
                ))}
              </div>

              {/* AI-Generated Variations */}
              <div className="mb-6 bg-white/5 rounded-2xl p-4 border border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3 flex items-center gap-1.5">
                  ✨ AI-Generated Variations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generateVariations(selected).map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelected({
                          ...selected,
                          name: v.name,
                          color: v.color,
                          style: v.style,
                          material: v.material,
                        });
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-full ${
                        selected.name === v.name
                          ? "bg-accent/15 border-accent/60 shadow-lg shadow-accent/5"
                          : "bg-black/20 border-white/5 hover:border-white/15 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div>
                        <p className={`font-semibold text-xs transition-colors ${selected.name === v.name ? "text-accent-light" : "text-white"}`}>
                          {v.name}
                        </p>
                        <p className="text-[10px] text-muted mt-1 leading-normal">
                          {v.desc}
                        </p>
                      </div>
                      <span className={`inline-block mt-3 text-[9px] font-bold uppercase tracking-wider ${selected.name === v.name ? "text-accent-light" : "text-white/40"}`}>
                        {selected.name === v.name ? "✓ Applied Spec" : "Apply Spec"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelected(null);
                    handleCustomizeThis(selected);
                  }}
                  className="btn-premium-primary flex-1 cursor-pointer"
                >
                  <span>Customize This →</span>
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="btn-premium-secondary flex-1 cursor-pointer"
                >
                  <span>Close</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
