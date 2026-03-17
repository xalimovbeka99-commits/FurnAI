"use client";

import { motion } from "framer-motion";

function Toggle({ label, icon, enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all text-xs font-medium ${
        enabled
          ? "bg-green-500/15 border border-green-500/30 text-green-400"
          : "bg-surface border border-border text-muted"
      }`}
    >
      <span>{icon} {label}</span>
      <span className={`w-8 h-4 rounded-full transition-all relative ${enabled ? "bg-green-500" : "bg-white/10"}`}>
        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${enabled ? "left-4" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function Dropdown({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-[10px] text-muted uppercase tracking-wider mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent/50 appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function KitchenControls({ kitchen, setAppliance }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <label className="text-xs font-medium text-muted uppercase tracking-wider block">
        🍳 Kitchen Tech
      </label>

      {/* ─── FRIDGE ─── */}
      <div className="glass rounded-xl p-3 space-y-2">
        <Toggle
          label="Fridge"
          icon="🧊"
          enabled={kitchen.fridge.enabled}
          onChange={(v) => setAppliance("fridge", "enabled", v)}
        />
        {kitchen.fridge.enabled && (
          <div className="grid grid-cols-2 gap-2 pl-1">
            <Dropdown
              label="Size"
              value={kitchen.fridge.size}
              onChange={(v) => setAppliance("fridge", "size", v)}
              options={[
                { value: "single", label: "Single Door" },
                { value: "double", label: "Double Door" },
                { value: "side-by-side", label: "Side-by-Side" },
              ]}
            />
            <Dropdown
              label="Position"
              value={kitchen.fridge.position}
              onChange={(v) => setAppliance("fridge", "position", v)}
              options={[
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
              ]}
            />
          </div>
        )}
      </div>

      {/* ─── DISHWASHER ─── */}
      <div className="glass rounded-xl p-3 space-y-2">
        <Toggle
          label="Dishwasher"
          icon="🫧"
          enabled={kitchen.dishwasher.enabled}
          onChange={(v) => setAppliance("dishwasher", "enabled", v)}
        />
        {kitchen.dishwasher.enabled && (
          <div className="grid grid-cols-2 gap-2 pl-1">
            <Dropdown
              label="Size"
              value={kitchen.dishwasher.size}
              onChange={(v) => setAppliance("dishwasher", "size", v)}
              options={[
                { value: "standard", label: "Standard (60cm)" },
                { value: "compact", label: "Compact (45cm)" },
              ]}
            />
            <Dropdown
              label="Style"
              value={kitchen.dishwasher.style}
              onChange={(v) => setAppliance("dishwasher", "style", v)}
              options={[
                { value: "hidden", label: "Hidden (Panel)" },
                { value: "visible", label: "Visible (Metal)" },
              ]}
            />
          </div>
        )}
      </div>

      {/* ─── HOOD ─── */}
      <div className="glass rounded-xl p-3 space-y-2">
        <Toggle
          label="Hood / Extractor"
          icon="💨"
          enabled={kitchen.hood.enabled}
          onChange={(v) => setAppliance("hood", "enabled", v)}
        />
        {kitchen.hood.enabled && (
          <div className="pl-1">
            <Dropdown
              label="Type"
              value={kitchen.hood.type}
              onChange={(v) => setAppliance("hood", "type", v)}
              options={[
                { value: "wall-mounted", label: "Wall Mounted" },
                { value: "built-in", label: "Built-In" },
                { value: "island", label: "Island Hood" },
              ]}
            />
          </div>
        )}
      </div>

      {/* ─── OVEN / COOKTOP ─── */}
      <div className="glass rounded-xl p-3 space-y-2">
        <Toggle
          label="Oven & Cooktop"
          icon="🔥"
          enabled={kitchen.oven.enabled}
          onChange={(v) => setAppliance("oven", "enabled", v)}
        />
        {kitchen.oven.enabled && (
          <div className="grid grid-cols-2 gap-2 pl-1">
            <Dropdown
              label="Oven Position"
              value={kitchen.oven.position}
              onChange={(v) => setAppliance("oven", "position", v)}
              options={[
                { value: "bottom", label: "Under Cooktop" },
                { value: "tower", label: "Tower Unit" },
              ]}
            />
            <Dropdown
              label="Cooktop Type"
              value={kitchen.oven.cooktop}
              onChange={(v) => setAppliance("oven", "cooktop", v)}
              options={[
                { value: "induction", label: "Induction" },
                { value: "gas", label: "Gas" },
                { value: "electric", label: "Electric" },
              ]}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
