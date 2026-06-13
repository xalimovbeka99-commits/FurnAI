"use client";

import React from "react";

const PRESETS = {
  luxury:     { color: 'oak',    faceColor: 'oak',    handle: 'gold',   door: 'solid', led: 'warm', dr: 2, ro: true  },
  minimal:    { color: 'white',  faceColor: 'white',  handle: 'hidden', door: 'solid', led: 'off',  dr: 0, ro: false },
  scandi:     { color: 'linen',  faceColor: 'linen',  handle: 'silver', door: 'solid', led: 'warm', dr: 1, ro: true  },
  industrial: { color: 'graph',  faceColor: 'graph',  handle: 'black',  door: 'solid', led: 'cool', dr: 2, ro: false },
  classic:    { color: 'walnut', faceColor: 'walnut', handle: 'gold',   door: 'solid', led: 'warm', dr: 2, ro: true  },
  modern:     { color: 'black',  faceColor: 'black',  handle: 'chrome', door: 'glass', led: 'cool', dr: 1, ro: false },
  navy:       { color: 'navy',   faceColor: 'navy',   handle: 'chrome', door: 'glass', led: 'cool', dr: 0, ro: false },
};

export default function WardrobePanels({
  prompt,
  setPrompt,
  handleRunAI,
  selectedPart,
  width,
  setWidth,
  height,
  setHeight,
  depth,
  setDepth,
  sections,
  setSections,
  activePreset,
  handleApplyPreset,
  activeColor,
  setActiveColor,
  activeFaceColor,
  setActiveFaceColor,
  doorStyle,
  setDoorStyle,
  handleStyle,
  setHandleStyle,
  extDrawerRows,
  setExtDrawerRows,
  hangerRods,
  setHangerRods,
  handleToggleAllDrawers,
  ledLighting,
  setLedLighting,
  triggerNotification,
  calculateEstimatedCost,
  handleExportPNG,
  handleExportJPG,
  handleExportPDF,
  handleExportGLB,
  handleExportFormat,
  handleSendToProduction,
}) {
  return (
    <>
      {/* AI Prompt */}
      <div className="rps">
        <div className="rpt">✦ AI Prompt</div>
        <div className="aibox">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your style…&#10;e.g. Dark walnut with gold handles and warm LED"
          />
          <div className="aifoot">
            <div className="aiex-list">
              <span className="aiex cursor-pointer" onClick={() => setPrompt("Luxury gold")}>Luxury</span>
              <span className="aiex cursor-pointer" onClick={() => setPrompt("Minimal white")}>Minimal</span>
              <span className="aiex cursor-pointer" onClick={() => setPrompt("Dark walnut")}>Walnut</span>
              <span className="aiex cursor-pointer" onClick={() => setPrompt("Add warm LED")}>LED</span>
              <span className="aiex cursor-pointer" onClick={() => setPrompt("Mirror doors")}>Mirror</span>
              <span className="aiex cursor-pointer" onClick={() => setPrompt("Navy modern")}>Navy</span>
            </div>
            <button className="aiapply cursor-pointer" onClick={() => { handleRunAI(prompt); setPrompt(""); }}>Apply</button>
          </div>
        </div>
      </div>

      {/* Selected Part */}
      <div className="rps">
        <div className="rpt">Selected Part</div>
        <div className="pbadge">
          <div className="pdot"></div>
          <span>{selectedPart}</span>
        </div>
      </div>

      {/* Size & Structure */}
      <div className="rps">
        <div className="rpt">Size & Structure</div>
        <div className="size-grid">
          <div className="size-row">
            <label>Width <span>{width.toFixed(1)} m</span></label>
            <input
              type="range"
              className="slider"
              min="1.6"
              max="3.2"
              step="0.1"
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value))}
            />
          </div>
          <div className="size-row">
            <label>Height <span>{height.toFixed(1)} m</span></label>
            <input
              type="range"
              className="slider"
              min="1.8"
              max="3.0"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value))}
            />
          </div>
          <div className="size-row">
            <label>Depth <span>{depth.toFixed(2)} m</span></label>
            <input
              type="range"
              className="slider"
              min="0.4"
              max="0.8"
              step="0.05"
              value={depth}
              onChange={(e) => setDepth(parseFloat(e.target.value))}
            />
          </div>
          <div className="size-row">
            <label>Door Sections</label>
            <div className="section-btns">
              {[2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`sec-n ${sections === num ? "on" : ""}`}
                  onClick={() => {
                    setSections(num);
                    triggerNotification(num + "-section wardrobe built");
                  }}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Style Preset */}
      <div className="rps">
        <div className="rpt">Style Preset</div>
        <div className="chips">
          {Object.keys(PRESETS).map((key) => (
            <div
              key={key}
              className={`chip ${activePreset === key ? "on" : ""}`}
              onClick={() => handleApplyPreset(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </div>
          ))}
        </div>
      </div>

      {/* Wardrobe Colour - all parts */}
      <div className="rps">
        <div className="rpt">Wardrobe Colour <span style={{ fontSize: ".6rem", color: "var(--muted2)", fontWeight: "400", letterSpacing: 0 }}>(all parts)</span></div>
        <div className="txgrid">
          {[
            { id: "oak", name: "Oak", cls: "s1" },
            { id: "walnut", name: "Walnut", cls: "s2" },
            { id: "white", name: "White", cls: "s3" },
            { id: "black", name: "Black", cls: "s4" },
            { id: "beige", name: "Beige", cls: "s5" },
            { id: "mahog", name: "Mahog.", cls: "s6" },
            { id: "linen", name: "Linen", cls: "s7" },
            { id: "graph", name: "Graphite", cls: "s8" },
            { id: "sage", name: "Sage", cls: "s9" },
            { id: "navy", name: "Navy", cls: "s10" },
            { id: "concrete", name: "Concrete", style: { background: "linear-gradient(135deg,#c4c0b8,#a8a49c)" } },
            { id: "darkwood", name: "Dark Wood", style: { background: "linear-gradient(135deg,#2a2422,#1a1614)" } },
          ].map((sw) => (
            <div
              key={sw.id}
              className={`sw ${sw.cls || ""} ${activeColor === sw.id ? "on" : ""}`}
              style={sw.style}
              onClick={() => {
                setActiveColor(sw.id);
                setActiveFaceColor(sw.id);
                triggerNotification("Colour: " + sw.name);
              }}
            >
              <span className="sw-tip">{sw.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Door & Drawer Face Colour Override */}
      <div className="rps">
        <div className="rpt">Door &amp; Drawer Face <span style={{ fontSize: ".6rem", color: "var(--muted2)", fontWeight: "400", letterSpacing: 0 }}>(override)</span></div>
        <div className="txgrid">
          {[
            { id: "oak", name: "Oak", cls: "s1" },
            { id: "walnut", name: "Walnut", cls: "s2" },
            { id: "white", name: "White", cls: "s3" },
            { id: "black", name: "Black", cls: "s4" },
            { id: "beige", name: "Beige", cls: "s5" },
            { id: "mahog", name: "Mahog.", cls: "s6" },
            { id: "linen", name: "Linen", cls: "s7" },
            { id: "graph", name: "Graphite", cls: "s8" },
            { id: "sage", name: "Sage", cls: "s9" },
            { id: "navy", name: "Navy", cls: "s10" },
            { id: "concrete", name: "Concrete", style: { background: "linear-gradient(135deg,#c4c0b8,#a8a49c)" } },
            { id: "darkwood", name: "Dark Wood", style: { background: "linear-gradient(135deg,#2a2422,#1a1614)" } },
          ].map((sw) => (
            <div
              key={sw.id}
              className={`sw ${sw.cls || ""} ${activeFaceColor === sw.id ? "on" : ""}`}
              style={sw.style}
              onClick={() => {
                setActiveFaceColor(sw.id);
                triggerNotification("Face colour: " + sw.name);
              }}
            >
              <span className="sw-tip">{sw.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Door Style */}
      <div className="rps">
        <div className="rpt">Door Style</div>
        <div className="optlist">
          {[
            { id: "solid", label: "Solid Panel" },
            { id: "glass", label: "Glass Panel" },
            { id: "mirror", label: "Full Mirror" },
            { id: "frosted", label: "Frosted Glass" },
          ].map((style) => (
            <div
              key={style.id}
              className={`opt ${doorStyle === style.id ? "on" : ""}`}
              onClick={() => {
                setDoorStyle(style.id);
                triggerNotification("Door style: " + style.label);
              }}
            >
              {style.id === "solid" ? "🪵 " : style.id === "glass" ? "🔷 " : style.id === "mirror" ? "🪞 " : "❄️ "}
              {style.label}
            </div>
          ))}
        </div>
      </div>

      {/* Handle Style */}
      <div className="rps">
        <div className="rpt">Handle Style</div>
        <div className="optlist">
          {[
            { id: "gold", label: "— Gold Bar" },
            { id: "silver", label: "◎ Silver Knob" },
            { id: "black", label: "▬ Black Strip" },
            { id: "hidden", label: "⊘ Hidden Push" },
            { id: "chrome", label: "✦ Chrome" },
          ].map((handle) => (
            <div
              key={handle.id}
              className={`opt ${handleStyle === handle.id ? "on" : ""}`}
              onClick={() => {
                setHandleStyle(handle.id);
                triggerNotification("Handle style: " + handle.label.replace(/[^a-zA-Z ]/g, ""));
              }}
            >
              {handle.label}
            </div>
          ))}
        </div>
      </div>

      {/* Drawers */}
      <div className="rps">
        <div className="rpt">Drawers</div>
        <div className="size-row" style={{ marginBottom: "8px" }}>
          <label style={{ marginBottom: "5px" }}>Exterior Drawer Rows</label>
          <div className="section-btns">
            {[0, 1, 2, 3].map((num) => (
              <div
                key={num}
                className={`sec-n ${extDrawerRows === num ? "on" : ""}`}
                onClick={() => {
                  setExtDrawerRows(num);
                  triggerNotification(num === 0 ? "Drawers removed" : `${num} rows added`);
                }}
              >
                {num === 0 ? "None" : `${num} Row${num > 1 ? "s" : ""}`}
              </div>
            ))}
          </div>
        </div>
        
        <button
          className={`scene-btn ${hangerRods ? "on" : ""}`}
          style={{ margin: "0 0 7px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
          onClick={() => {
            setHangerRods(!hangerRods);
            triggerNotification(!hangerRods ? "Hanger rods added — top shelf removed for space" : "Hanger rods removed");
          }}
        >
          <span style={{ background: hangerRods ? "#8a7adc" : "#5a5855", width: "18px", height: "18px", borderRadius: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", marginRight: "8px" }}>🪝</span>
          {hangerRods ? "Remove Hanger Rods" : "Add Hanger Rods"}
        </button>
        <button 
          className="scene-btn" 
          style={{ margin: 0, width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }} 
          onClick={handleToggleAllDrawers}
        >
          <span style={{ background: "#f4a261", width: "18px", height: "18px", borderRadius: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", marginRight: "8px" }}>📂</span>
          Open All Drawers
        </button>
        
        <p style={{ fontSize: ".68rem", color: "var(--muted2)", marginTop: "7px" }}>
          💡 Click any drawer to open/close it individually
        </p>
      </div>

      {/* LED Lighting */}
      <div className="rps">
        <div className="rpt">LED Lighting</div>
        <div className="ledrow">
          {["off", "warm", "cool", "rgb"].map((mode) => (
            <div
              key={mode}
              className={`lb ${ledLighting === mode ? "on" : ""}`}
              onClick={() => setLedLighting(mode)}
            >
              {mode === "off" ? "Off" : mode.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Versions */}
      <div className="rps" style={{ borderBottom: "none" }}>
        <div className="rpt">Versions</div>
        <div className="optlist" style={{ gap: "8px" }}>
          {[
            { id: "oak", name: "Golden Oak", desc: "Current · now", cls: "s1" },
            { id: "walnut", name: "Dark Walnut", desc: "v2 · 5 min ago", cls: "s2" },
            { id: "white", name: "Glossy White", desc: "v3 · 12 min ago", cls: "s3" }
          ].map((v) => (
            <div
              key={v.id}
              className={`vi ${activeColor === v.id ? "on" : ""}`}
              onClick={() => {
                setActiveColor(v.id);
                setDoorStyle("solid");
                triggerNotification("Version Loaded: " + v.name);
              }}
            >
              <div className={`vthumb ${v.cls}`} />
              <div className="vinfo">
                <h5>{v.name}</h5>
                <p>{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="vsave cursor-pointer" style={{ marginTop: "10px" }} onClick={() => triggerNotification("Version saved!")}>
          + Save current version
        </button>

        {/* format-specific exports grid */}
        <div style={{ marginTop: "15px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Export Design</div>
          <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
            <div className="sec-n hover-bright cursor-pointer" onClick={handleExportPNG} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>PNG</div>
            <div className="sec-n hover-bright cursor-pointer" onClick={handleExportJPG} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>JPG</div>
            <div className="sec-n hover-bright cursor-pointer" onClick={handleExportPDF} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>PDF</div>
            <div className="sec-n hover-bright cursor-pointer" onClick={handleExportGLB} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>GLB</div>
            <div className="sec-n hover-bright cursor-pointer" onClick={() => handleExportFormat("obj")} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>OBJ</div>
            <div className="sec-n hover-bright cursor-pointer" onClick={() => handleExportFormat("fbx")} style={{ fontSize: "10.5px", padding: "6px", textAlign: "center" }}>FBX</div>
          </div>

          {/* Send to Production */}
          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
            <button
              className="sec-n hover-bright cursor-pointer"
              onClick={handleSendToProduction}
              style={{ fontSize: "10.5px", padding: "8px", textAlign: "center", background: "linear-gradient(135deg, #c8a050 0%, #e8d4a5 100%)", color: "#000", fontWeight: "bold", width: "100%" }}
            >
              🏭 Send to Production
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
