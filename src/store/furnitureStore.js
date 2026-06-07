import { create } from "zustand";

const useFurnitureStore = create((set, get) => ({
  // Current design params
  prompt: "",
  type: "wardrobe",
  style: "modern",
  material: "wood",
  color: "oak",
  width: 120,
  height: 200,
  depth: 60,

  // Hardware options
  doorType: "solid",
  handleStyle: "hidden",
  drawerRows: 1,
  hangerRods: true,
  ledLighting: "off",

  // Generated design state
  isGenerating: false,
  generatedDesign: null,

  // Saved designs
  savedDesigns: [],

  // ─── Kitchen Appliance Config ───
  kitchen: {
    fridge: { enabled: true, size: "double", position: "right" },
    dishwasher: { enabled: true, size: "standard", style: "hidden" },
    hood: { enabled: true, type: "wall-mounted", size: "match" },
    oven: { enabled: true, position: "bottom", cooktop: "induction" },
  },

  // Kitchen setters
  setKitchenAppliance: (appliance, key, value) =>
    set((state) => ({
      kitchen: {
        ...state.kitchen,
        [appliance]: { ...state.kitchen[appliance], [key]: value },
      },
    })),

  // Setters
  setPrompt: (prompt) => set({ prompt }),
  setType: (type) => set({ type }),
  setStyle: (style) => set({ style }),
  setMaterial: (material) => set({ material }),
  setColor: (color) => set({ color }),
  setWidth: (width) => set({ width: Number(width) }),
  setHeight: (height) => set({ height: Number(height) }),
  setDepth: (depth) => set({ depth: Number(depth) }),
  setDoorType: (doorType) => set({ doorType }),
  setHandleStyle: (handleStyle) => set({ handleStyle }),
  setDrawerRows: (drawerRows) => set({ drawerRows: Number(drawerRows) }),
  setHangerRods: (hangerRods) => set({ hangerRods: Boolean(hangerRods) }),
  setLedLighting: (ledLighting) => set({ ledLighting }),

  // Generate design action
  generateDesign: async () => {
    set({ isGenerating: true });
    const state = get();

    // Simulate AI processing delay
    await new Promise((r) => setTimeout(r, 1500));

    const design = {
      id: Date.now().toString(),
      prompt: state.prompt,
      type: state.type,
      style: state.style,
      material: state.material,
      color: state.color,
      width: state.width,
      height: state.height,
      depth: state.depth,
      kitchen: state.type === "kitchen" ? state.kitchen : undefined,
      createdAt: new Date().toISOString(),
      name: `${state.style.charAt(0).toUpperCase() + state.style.slice(1)} ${state.type.charAt(0).toUpperCase() + state.type.slice(1)}`,
    };

    set({ generatedDesign: design, isGenerating: false });
    return design;
  },

  // Save design
  saveDesign: (design) => {
    const current = get().savedDesigns;
    const updated = [...current, { ...design, savedAt: new Date().toISOString() }];
    set({ savedDesigns: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem("furniai-designs", JSON.stringify(updated));
    }
  },

  // Load designs from localStorage
  loadDesigns: () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("furniai-designs");
      if (saved) {
        set({ savedDesigns: JSON.parse(saved) });
      }
    }
  },

  // Delete design
  deleteDesign: (id) => {
    const updated = get().savedDesigns.filter((d) => d.id !== id);
    set({ savedDesigns: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem("furniai-designs", JSON.stringify(updated));
    }
  },

  // Rename design
  renameDesign: (id, newName) => {
    const updated = get().savedDesigns.map((d) =>
      d.id === id ? { ...d, name: newName } : d
    );
    set({ savedDesigns: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem("furniai-designs", JSON.stringify(updated));
    }
  },

  // Load a design into the builder
  loadDesignIntoBuilder: (design) => {
    set({
      prompt: design.prompt || "",
      type: design.type,
      style: design.style,
      material: design.material,
      color: design.color,
      width: design.width,
      height: design.height,
      depth: design.depth,
      generatedDesign: design,
      ...(design.kitchen ? { kitchen: design.kitchen } : {}),
    });
  },
}));

export default useFurnitureStore;
