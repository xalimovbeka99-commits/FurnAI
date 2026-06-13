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

// 20 Stunning Furniture Ideas with photorealistic renders & customizable 3D equivalents
const galleryItems = [
  // Kitchens
  {
    id: 1,
    name: "Luxury Walnut Kitchen",
    type: "kitchen",
    style: "luxury",
    material: "Walnut Wood & Marble",
    color: "walnut",
    width: 320,
    height: 220,
    depth: 65,
    glb: "/kitchen.glb",
    image: "/gallery/luxury_kitchen.png",
    description: "A luxury L-shaped kitchen featuring warm dark walnut cabinets, a matching island, integrated warm LED illumination, and gold hardware finishes."
  },
  {
    id: 2,
    name: "Scandinavian Matte Kitchen",
    type: "kitchen",
    style: "minimal",
    material: "Birch Wood & Matte Quartz",
    color: "white",
    width: 280,
    height: 220,
    depth: 60,
    glb: "/kitchen.glb",
    image: "/gallery/minimal_kitchen.png",
    description: "Bright Scandinavian-inspired open layout with handleless white cabinets, birch accents, and matte quartz countertops."
  },
  {
    id: 3,
    name: "Industrial Concrete Kitchen",
    type: "kitchen",
    style: "industrial",
    material: "Concrete & Charcoal Satin",
    color: "black",
    width: 300,
    height: 210,
    depth: 60,
    glb: "/kitchen.glb",
    image: "/gallery/industrial_kitchen.png",
    description: "Bold industrial loft design with concrete counter slabs, dark charcoal cabinets, black powder-coated metal handles, and raw brick accents."
  },
  {
    id: 4,
    name: "Royal Midnight Navy Kitchen",
    type: "kitchen",
    style: "navy",
    material: "Satin Navy Lacquer & Gold",
    color: "navy",
    width: 340,
    height: 230,
    depth: 65,
    glb: "/kitchen.glb",
    image: "/gallery/navy_kitchen.png",
    description: "Elegant modern navy blue kitchen cabinets detailed with bright brass gold pull handles and premium white calacatta marble."
  },
  // Wardrobes
  {
    id: 5,
    name: "Grand Walnut Walk-In Closet",
    type: "wardrobe",
    style: "luxury",
    material: "Dark Espresso Oak & Glass",
    color: "walnut",
    width: 240,
    height: 260,
    depth: 65,
    glb: "/wardrobe.glb",
    image: "/gallery/luxury_wardrobe.png",
    description: "A premium walk-in wardrobe closet showcasing tinted glass door panels, warm internal LED strip fixtures, and multi-tier wardrobe drawers."
  },
  {
    id: 6,
    name: "Minimalist Sliding Wardrobe",
    type: "wardrobe",
    style: "minimal",
    material: "Glossy White Melamine",
    color: "white",
    width: 180,
    height: 220,
    depth: 60,
    glb: "/wardrobe.glb",
    image: "/gallery/minimal_wardrobe.png",
    description: "Streamlined modern wardrobe with handle-free sliding doors, solid gloss finish, and customizable internal storage divisions."
  },
  {
    id: 7,
    name: "Scandinavian Open Wardrobe",
    type: "wardrobe",
    style: "scandi",
    material: "Birch Wood & Fabric",
    color: "oak",
    width: 150,
    height: 200,
    depth: 55,
    glb: "/wardrobe.glb",
    image: "/gallery/scandi_wardrobe.png",
    description: "Eco-friendly open-shelf clothes organizer built from solid birch wood slats, equipped with fabric curtain separators."
  },
  // Office
  {
    id: 8,
    name: "Executive L-Desk Setup",
    type: "office",
    style: "luxury",
    material: "Walnut Wood & Brass",
    color: "walnut",
    width: 220,
    height: 76,
    depth: 160,
    glb: "/office.glb",
    image: "/gallery/executive_office.png",
    description: "A professional L-shaped desk configuration in warm walnut wood, with ample desk drawers, built-in wire ducts, and leather accents."
  },
  {
    id: 9,
    name: "Ergonomic Height-Adjustable Desk",
    type: "office",
    style: "minimal",
    material: "Light Oak & Steel",
    color: "oak",
    width: 160,
    height: 75,
    depth: 80,
    glb: "/office.glb",
    image: "/gallery/modern_office.png",
    description: "Sleek ergonomic height-adjustable standing desk featuring a natural oak top and clean matte white metal frames."
  },
  // Beds
  {
    id: 10,
    name: "Upholstered Velvet Bed",
    type: "bed",
    style: "luxury",
    material: "Grey Velvet & Walnut",
    color: "walnut",
    width: 200,
    height: 110,
    depth: 220,
    glb: "/bed.glb",
    image: "/gallery/luxury_bed.png",
    description: "Luxury king-size bed with a tall, button-tufted dark grey velvet headboard, built-in side led lights, and walnut wood base."
  },
  {
    id: 11,
    name: "Low-Profile Platform Bed",
    type: "bed",
    style: "minimal",
    material: "Light White Oak",
    color: "white",
    width: 180,
    height: 90,
    depth: 210,
    glb: "/bed.glb",
    image: "/gallery/minimalist_bed.png",
    description: "Japanese-style low platform bed frame in raw white oak, designed with a sleek handle-free floating headboard panel."
  },
  {
    id: 12,
    name: "Industrial Reclaimed Bed",
    type: "bed",
    style: "industrial",
    material: "Reclaimed Fir & Steel",
    color: "black",
    width: 190,
    height: 120,
    depth: 215,
    glb: "/bed.glb",
    image: "/gallery/industrial_bed.png",
    description: "Robust industrial bed frame featuring a headboard crafted from rustic reclaimed timber planks, supported by matte black structural piping."
  },
  // TV Walls
  {
    id: 13,
    name: "Slat Wood Floating TV Wall",
    type: "tv-wall",
    style: "modern",
    material: "Walnut Slats & LEDs",
    color: "walnut",
    width: 240,
    height: 180,
    depth: 40,
    glb: "/tv_wall.glb",
    image: "/gallery/tv_wall_modern.png",
    description: "Stunning wall-mounted media center featuring vertical walnut wood slats and color-adjustable ambient LED backing strips."
  },
  {
    id: 14,
    name: "Grand Marble TV Wall Unit",
    type: "tv-wall",
    style: "luxury",
    material: "Nero Marquina & Walnut",
    color: "black",
    width: 280,
    height: 200,
    depth: 45,
    glb: "/tv_wall.glb",
    image: "/gallery/tv_wall_luxury.png",
    description: "Luxury entertainment feature wall built with dark marble backing panels, floating solid wood cabinets, and integrated fireplace cavity."
  },
  // Cabinets
  {
    id: 15,
    name: "Traditional Cherry Sideboard",
    type: "cabinet",
    style: "classic",
    material: "Cherry Wood & Brass",
    color: "darkwood",
    width: 160,
    height: 90,
    depth: 45,
    glb: "/cabinet.glb",
    image: "/gallery/cabinet_classic.png",
    description: "Classic dining room credenza sideboard with beautiful rich cherry grain veneers, detailed frame mouldings, and brass drawer hardware."
  },
  {
    id: 16,
    name: "Floating Minimal Cabinet",
    type: "cabinet",
    style: "minimal",
    material: "White Matte Lacquer",
    color: "white",
    width: 180,
    height: 50,
    depth: 38,
    glb: "/cabinet.glb",
    image: "/gallery/modern_cabinet.png",
    description: "Floating modern wall cabinet unit in clean white satin lacquer finish, featuring soft-close handle-free cabinet doors."
  },
  // Shelves
  {
    id: 17,
    name: "Industrial Pipe Bookcase",
    type: "shelves",
    style: "industrial",
    material: "Iron Pipes & Reclaimed Pine",
    color: "black",
    width: 120,
    height: 200,
    depth: 35,
    glb: "/shelves.glb",
    image: "/gallery/shelves_industrial.png",
    description: "Steampunk-inspired multi-shelf bookcase combining robust black structural steel pipes with rustic distressed pine planks."
  },
  {
    id: 18,
    name: "Geometric Floating Shelves",
    type: "shelves",
    style: "minimal",
    material: "White Oak & Lacquer",
    color: "white",
    width: 140,
    height: 120,
    depth: 25,
    glb: "/shelves.glb",
    image: "/gallery/shelves_modern.png",
    description: "Asymmetrical artistic wall shelf system arranged in a creative geometric block layout, mixing white and light wood tones."
  },
  // Dressing Table
  {
    id: 19,
    name: "Hollywood Vanity Desk",
    type: "dressing-table",
    style: "luxury",
    material: "White Lacquer & Gold Trim",
    color: "white",
    width: 120,
    height: 140,
    depth: 50,
    glb: "/dressing_table.glb",
    image: "/gallery/dressing_table.png",
    description: "Glamorous dressing console with drawers, gold stainless legs, and a mirror panel lined with frosted warm LED makeup bulbs."
  },
  // Decorative Wood Slat Panels
  {
    id: 20,
    name: "Backlit Slat Wood Panel",
    type: "tv-wall",
    style: "modern",
    material: "Natural Oak Slats & LEDs",
    color: "oak",
    width: 160,
    height: 240,
    depth: 8,
    glb: "/tv_wall.glb",
    image: "/gallery/panel_wall.png",
    description: "Vertical oak wood slat wall cladding panels with indirect soft ambient backlighting, designed for living room accent walls."
  }
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

const CATEGORY_FILTERS = ["All", "Wardrobe", "Kitchen", "Office", "Bed", "Cabinet", "Shelves", "TV Wall", "Dressing Table"];
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
};

// ─── GLB scene component (must be inside Suspense) ─────────────────────────
function GLBScene({ glb }) {
  const { scene } = useGLTF(glb);
  return <primitive object={scene} />;
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

// ─── Card preview showing photorealistic generated image ──────────────────
function CardPreview({ item }) {
  const accentColor = TYPE_COLOR[item.type] || "#c8a870";
  return (
    <div
      className="h-60 relative overflow-hidden group/img"
      style={{ background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}38)` }}
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute top-4 left-4 flex gap-1.5 z-10 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white">
          {item.type.replace("-", " ")}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white">
          {item.style}
        </span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function GalleryPage() {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selected gallery item
  const [selected, setSelected] = useState(null);
  
  // Modal customization states
  const [selectedStyle, setSelectedStyle] = useState("luxury");
  const [customDescription, setCustomDescription] = useState("");
  const [viewMode, setViewMode] = useState("photo"); // "photo" or "3d"
  const [isGenerating, setIsGenerating] = useState(false);

  // Open modal and load defaults
  const handleSelectCard = (item) => {
    setSelected(item);
    setSelectedStyle(item.style);
    setCustomDescription(item.description);
    setViewMode("photo");
  };

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
      item.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && styleMatch && searchMatch;
  });

  const handleCustomizeThis = async (item) => {
    setIsGenerating(true);
    try {
      // Call the NLP AI extractor API to parse the custom style + user description
      const response = await fetch("/api/nlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: `${selectedStyle} style ${item.type}. ${customDescription}` }),
      });

      const params = new URLSearchParams();
      // Start with the base item properties as fallbacks
      params.append("type", item.type);
      params.append("style", selectedStyle);
      params.append("color", item.color);
      params.append("width", item.width);
      params.append("height", item.height);
      params.append("depth", item.depth);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.parameters) {
          const p = data.parameters;
          // Apply parsed AI parameters
          if (p.furnitureType) params.set("type", p.furnitureType);
          if (p.style) params.set("style", p.style);
          if (p.primaryColor) params.set("color", p.primaryColor);
          if (p.doorType) params.append("doorType", p.doorType);
          if (p.handleStyle) params.append("handleStyle", p.handleStyle);
          if (p.drawerRows !== undefined) params.append("drawerRows", p.drawerRows);
          if (p.hangerRods !== undefined) params.append("hangerRods", p.hangerRods);
          if (p.ledLighting) params.append("ledLighting", p.ledLighting);
          if (p.width) params.set("width", p.width);
          if (p.height) params.set("height", p.height);
          if (p.depth) params.set("depth", p.depth);
        }
      }
      
      params.append("prompt", customDescription);
      router.push(`/builder?${params.toString()}`);
      setSelected(null);
    } catch (err) {
      console.error("AI Generation failed:", err);
      // Fallback: direct redirect
      const params = new URLSearchParams();
      params.append("type", item.type);
      params.append("style", selectedStyle);
      params.append("color", item.color);
      params.append("width", item.width);
      params.append("height", item.height);
      params.append("depth", item.depth);
      params.append("prompt", customDescription);
      router.push(`/builder?${params.toString()}`);
      setSelected(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-img-materials relative">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-xs pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="text-center mb-12">
          <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold tracking-widest uppercase mb-4 gradient-text">
            Studio Portfolio
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">
            Design & AI Gallery
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
            Select any interior photo, customize the style and specifications, and generate a corresponding parametric 3D model immediately.
          </motion.p>
        </motion.div>

        {/* Search & Filters Controls Container */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="glass rounded-3xl p-6 mb-12 border border-white/5"
        >
          {/* Search Bar */}
          <div className="flex justify-center mb-6">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search styles, wardrobes, kitchens, materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-black/45 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-accent/50 focus:bg-white/[0.08] transition-all text-sm pl-11"
              />
              <span className="absolute left-4 top-3.5 text-white/40 text-sm">🔍</span>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-muted mb-3 text-center font-bold">Filter Category</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
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
          </div>

          {/* Style Filters */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted mb-3 text-center font-bold">Filter Style</p>
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
              onClick={() => handleSelectCard(item)}
              className="glass rounded-3xl overflow-hidden cursor-pointer group border border-white/5 transition-all duration-300 hover:border-white/15 floating-layer relative"
            >
              <CardPreview item={item} />

              <div className="p-6 relative z-10 bg-black/25">
                <h3 className="font-semibold text-base mb-1 group-hover:text-accent-light transition-colors text-white">
                  {item.name}
                </h3>
                <p className="text-xs text-muted mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-[11px] text-white/50 border-t border-white/5 pt-3">
                  <span>{item.material}</span>
                  <span className="text-accent-light font-medium uppercase tracking-wider">Configure 3D →</span>
                </div>
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
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-3xl w-full max-w-4xl p-6 sm:p-8 border border-white/10 floating-layer-deep my-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 text-white">{selected.name}</h2>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded bg-accent/15 border border-accent/20 text-accent-light font-semibold uppercase">{selected.type}</span>
                    <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted font-semibold uppercase">{selected.material}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-muted hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Image Inspiration & Specs */}
                <div>
                  <div className="relative h-80 rounded-2xl mb-4 overflow-hidden border border-white/5 bg-black/40">
                    <img
                      src={selected.image}
                      alt={selected.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-3">
                    {[["Width", selected.width], ["Height", selected.height], ["Depth", selected.depth]].map(([label, val]) => (
                      <div key={label} className="bg-black/35 border border-white/5 rounded-2xl p-2.5 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted mb-0.5">{label}</p>
                        <p className="font-bold text-accent-light text-sm">{val} cm</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Customization Tools & Actions */}
                <div className="flex flex-col justify-between">
                  {/* Real-time Generator Settings Form */}
                  <div className="bg-white/[0.03] rounded-2xl p-4 sm:p-5 border border-white/10 mb-6 flex-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 mb-4 flex items-center gap-1.5">
                      ✨ Configure AI parameters
                    </h4>

                    {/* Choose Style */}
                    <div className="mb-4">
                      <label className="block text-[11px] uppercase tracking-wider text-muted mb-2 font-bold">Select Style Preference</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(STYLE_NAMES).map(([key, name]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedStyle(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              selectedStyle === key
                                ? "bg-accent/15 border-accent text-accent-light"
                                : "bg-black/20 border-white/5 text-muted hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Prompt / Description */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-muted mb-2 font-bold">
                        Custom Prompt / Structural Description
                      </label>
                      <textarea
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="Describe specific details you want the AI model to include (e.g. 'Use walnut shelves with LED strip light, add gold handles, make 3 extra drawers')"
                        rows={4}
                        className="w-full bg-black/45 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent/40"
                      />
                      <p className="text-[10px] text-white/40 mt-2 leading-normal">
                        💡 Our parametric engine will automatically parse details like cabinet layout, colors, drawers, handles, and lights from your custom text.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleCustomizeThis(selected);
                      }}
                      disabled={isGenerating}
                      className={`btn-premium-primary flex-1 font-bold text-sm flex items-center justify-center gap-2 ${isGenerating ? "opacity-75 cursor-wait" : "cursor-pointer"}`}
                    >
                      {isGenerating ? (
                        <>
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>AI Extracting 3D Model...</span>
                        </>
                      ) : (
                        <span>Generate Custom 3D Model ✨</span>
                      )}
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      disabled={isGenerating}
                      className="btn-premium-secondary flex-[0.4] cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Close</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
