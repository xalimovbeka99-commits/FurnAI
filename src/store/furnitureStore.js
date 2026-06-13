import { create } from "zustand";
import {
  createDefaultConfig,
  clampDimension,
} from "@/lib/furnitureConfig";

const useFurnitureStore = create((set, get) => ({
  // --- PARAMETRIC STATE ---
  config: createDefaultConfig("wardrobe"),
  selectedModule: null, // index of module being edited, or null

  // --- whole-config ---
  loadConfig: (config) => set({ config, selectedModule: null }),
  setType: (type) => set({ config: createDefaultConfig(type), selectedModule: null }),

  // --- appearance (right panel) ---
  setMaterial: (material) => set((s) => ({ config: { ...s.config, material } })),
  setStyle: (style) => set((s) => ({ config: { ...s.config, style } })),
  setHandleStyle: (handleStyle) => set((s) => ({ config: { ...s.config, handleStyle } })),
  setDoorType: (doorType) => set((s) => ({ config: { ...s.config, doorType } })),
  setLed: (ledLighting) => set((s) => ({ config: { ...s.config, ledLighting } })),
  setPlinth: (hasPlinth) => set((s) => ({ config: { ...s.config, hasPlinth } })),

  setDimension: (axis, value) =>
    set((s) => ({
      config: {
        ...s.config,
        dimensions: { ...s.config.dimensions, [axis]: clampDimension(axis, value) },
      },
    })),

  // --- structure (left panel) ---
  selectModule: (index) => set({ selectedModule: index }),

  addModule: () =>
    set((s) => {
      const modules = [
        ...s.config.modules,
        { kind: "door", widthRatio: 0.25, doorCount: 1, drawerRows: 0, shelfCount: 2, hingeSide: "left", slideType: "hinged" },
      ];
      return { config: { ...s.config, modules } };
    }),

  removeModule: (index) =>
    set((s) => {
      if (s.config.modules.length <= 1) return s; // keep at least one
      const modules = s.config.modules.filter((_, i) => i !== index);
      return { config: { ...s.config, modules }, selectedModule: null };
    }),

  updateModule: (index, patch) =>
    set((s) => {
      const modules = s.config.modules.map((m, i) => (i === index ? { ...m, ...patch } : m));
      return { config: { ...s.config, modules } };
    }),

  setModuleRatio: (index, widthRatio) =>
    set((s) => {
      const modules = s.config.modules.map((m, i) =>
        i === index ? { ...m, widthRatio: Math.max(0.05, widthRatio) } : m
      );
      return { config: { ...s.config, modules } };
    }),

  // --- CLOUD & LEGACY STATE ---
  prompt: "",
  setPrompt: (prompt) => set({ prompt }),
  
  isGenerating: false,
  generatedDesign: null,
  savedDesigns: [],
  isAuthenticated: false,
  setAuthenticated: (val) => set({ isAuthenticated: val }),

  generateDesign: async () => {
    set({ isGenerating: true });
    const state = get();
    await new Promise((r) => setTimeout(r, 1500)); // Simulate AI delay

    const design = {
      id: Date.now().toString(),
      prompt: state.prompt,
      config: state.config, // Store the full parametric config
      createdAt: new Date().toISOString(),
      name: `${state.config.style.charAt(0).toUpperCase() + state.config.style.slice(1)} ${state.config.type.charAt(0).toUpperCase() + state.config.type.slice(1)}`,
    };

    set({ generatedDesign: design, isGenerating: false });
    return design;
  },

  saveDesign: async (design) => {
    const current = get().savedDesigns;
    const newDesign = { ...design, savedAt: new Date().toISOString() };

    const updated = [...current, newDesign];
    set({ savedDesigns: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem("furniai-designs", JSON.stringify(updated));
    }

    if (get().isAuthenticated) {
      try {
        const res = await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDesign),
        });
        const data = await res.json();
        if (data.success && data.design?.supabaseId) {
          const withId = updated.map((d) =>
            d.id === newDesign.id
              ? { ...d, supabaseId: data.design.supabaseId }
              : d
          );
          set({ savedDesigns: withId });
          if (typeof window !== "undefined") {
            localStorage.setItem("furniai-designs", JSON.stringify(withId));
          }
        }
      } catch (err) {
        console.warn("[store] Cloud sync failed:", err);
      }
    }
  },

  loadDesigns: async () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("furniai-designs");
      if (saved) {
        set({ savedDesigns: JSON.parse(saved) });
      }
    }

    if (get().isAuthenticated) {
      try {
        const res = await fetch("/api/designs");
        const cloudDesigns = await res.json();
        if (Array.isArray(cloudDesigns) && cloudDesigns.length > 0) {
          const localDesigns = get().savedDesigns;
          const cloudIds = new Set(cloudDesigns.map((d) => d.supabaseId || d.id));
          const localOnly = localDesigns.filter((d) => !d.supabaseId && !cloudIds.has(d.id));
          const merged = [...cloudDesigns, ...localOnly];
          set({ savedDesigns: merged });
          if (typeof window !== "undefined") {
            localStorage.setItem("furniai-designs", JSON.stringify(merged));
          }
        }
      } catch (err) {
        console.warn("[store] Cloud load failed:", err);
      }
    }
  },

  deleteDesign: async (id) => {
    const designToDelete = get().savedDesigns.find((d) => d.id === id);
    const updated = get().savedDesigns.filter((d) => d.id !== id);
    set({ savedDesigns: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem("furniai-designs", JSON.stringify(updated));
    }

    if (get().isAuthenticated && designToDelete?.supabaseId) {
      try {
        await fetch("/api/save", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: designToDelete.supabaseId }),
        });
      } catch (err) {
        console.warn("[store] Cloud delete failed:", err);
      }
    }
  },

  renameDesign: async (id, newName) => {
    const designToRename = get().savedDesigns.find((d) => d.id === id);
    const updated = get().savedDesigns.map((d) =>
      d.id === id ? { ...d, name: newName } : d
    );
    set({ savedDesigns: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem("furniai-designs", JSON.stringify(updated));
    }

    if (get().isAuthenticated && designToRename?.supabaseId) {
      try {
        await fetch("/api/save", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: designToRename.supabaseId, name: newName }),
        });
      } catch (err) {
        console.warn("[store] Cloud rename failed:", err);
      }
    }
  },

  loadDesignIntoBuilder: (design) => {
    set({
      prompt: design.prompt || "",
      config: design.config || createDefaultConfig("wardrobe"),
      generatedDesign: design,
    });
  },
}));

export { useFurnitureStore };
export default useFurnitureStore;
