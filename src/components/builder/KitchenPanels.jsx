"use client";

import React from "react";

export default function KitchenPanels({
  selectedPart,
  showWalls,
  setShowWalls,
  kitchenLayout,
  setKitchenLayout,
  roomWidth,
  setRoomWidth,
  roomLength,
  setRoomLength,
  roomHeight,
  setRoomHeight,
  activeKitchenSection,
  setActiveKitchenSection,
  kitchenModules,
  handleMoveModule,
  handleDeleteModule,
  handleUpdateModuleWidth,
  handleUpdateModuleSubType,
  handleAddKitchenModule,
  wallCabinetsEnabled,
  setWallCabinetsEnabled,
  islandEnabled,
  setIslandEnabled,
  islandWidth,
  setIslandWidth,
  islandDepth,
  setIslandDepth,
  islandSeating,
  setIslandSeating,
  islandSink,
  setIslandSink,
  kitchenCabinetMaterial,
  setKitchenCabinetMaterial,
  kitchenCabinetWoodType,
  setKitchenCabinetWoodType,
  kitchenCabinetMatteColor,
  setKitchenCabinetMatteColor,
  kitchenCabinetPremiumFinish,
  setKitchenCabinetPremiumFinish,
  kitchenHandleType,
  setKitchenHandleType,
  countertopMaterial,
  setCountertopMaterial,
  countertopThickness,
  setCountertopThickness,
  countertopWaterfall,
  setCountertopWaterfall,
  backsplashMaterial,
  setBacksplashMaterial,
  countertopColor,
  setCountertopColor,
  backsplashColor,
  setBacksplashColor,
  wallColor,
  setWallColor,
  floorColor,
  setFloorColor,
  applianceSink,
  setApplianceSink,
  sinkType,
  setSinkType,
  faucetType,
  setFaucetType,
  applianceCooker,
  setApplianceCooker,
  applianceOven,
  setApplianceOven,
  applianceFridge,
  setApplianceFridge,
  textureScale,
  setTextureScale,
  textureRotation,
  setTextureRotation,
  glossLevel,
  setGlossLevel,
  roughnessVal,
  setRoughnessVal,
  bumpStrength,
  setBumpStrength,
  handleExportPNG,
  handleExportJPG,
  handleExportPDF,
  handleExportGLB,
  handleExportFormat,
  handleSendToProduction,
  triggerNotification,
}) {
  return (
    <>
      {/* 2. Selected Part */}
      <div className="rps">
        <div className="rpt">Selected Part</div>
        <div className="pbadge">
          <div className="pdot"></div>
          <span>{selectedPart}</span>
        </div>
      </div>

      {/* Show Walls Toggle */}
      <div className="rps" style={{ paddingBottom: "10px" }}>
        <div className="rpt">Room Walls</div>
        <button
          className={`scene-btn ${showWalls ? "on" : ""}`}
          style={{ margin: "0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
          onClick={() => {
            setShowWalls(v => !v);
            triggerNotification(!showWalls ? "Room walls shown" : "Room walls hidden");
          }}
        >
          <span style={{ background: showWalls ? "#6a9bc8" : "#5a5855", width: "16px", height: "16px", borderRadius: "4px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", marginRight: "6px" }}>🏠</span>
          {showWalls ? "Hide Room Walls" : "Show Room Walls"}
        </button>
      </div>

      {/* 3. Kitchen Layout & Room Size */}
      <div className="rps">
        <div className="rpt">Kitchen Layout & Room Size</div>
        <div className="size-grid">
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "5px" }}>Layout Type</label>
            <div className="section-btns">
              {[
                { id: "u-shape", label: "U-Shape" },
                { id: "l-shape", label: "L-Shape" },
                { id: "single-wall", label: "Wall" },
                { id: "parallel", label: "Parallel" },
              ].map((lay) => (
                <div
                  key={lay.id}
                  className={`sec-n ${kitchenLayout === lay.id ? "on" : ""}`}
                  onClick={() => {
                    setKitchenLayout(lay.id);
                    triggerNotification("Layout set: " + lay.label);
                  }}
                  style={{ fontSize: "10px", padding: "6px" }}
                >
                  {lay.label}
                </div>
              ))}
            </div>
          </div>
          <div className="size-row">
            <label>Room Width <span>{(roomWidth * 100).toFixed(0)} cm</span></label>
            <input
              type="range"
              className="slider"
              min="2.0"
              max="4.0"
              step="0.1"
              value={roomWidth}
              onChange={(e) => setRoomWidth(parseFloat(e.target.value))}
            />
          </div>
          <div className="size-row">
            <label>Room Length <span>{(roomLength * 100).toFixed(0)} cm</span></label>
            <input
              type="range"
              className="slider"
              min="1.6"
              max="3.6"
              step="0.1"
              value={roomLength}
              onChange={(e) => setRoomLength(parseFloat(e.target.value))}
            />
          </div>
          <div className="size-row">
            <label>Ceiling Height <span>{(roomHeight * 100).toFixed(0)} cm</span></label>
            <input
              type="range"
              className="slider"
              min="2.2"
              max="3.2"
              step="0.1"
              value={roomHeight}
              onChange={(e) => setRoomHeight(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 4. Cabinet Modules List Manager */}
      <div className="rps">
        <div className="rpt">Cabinet Modules</div>
        <div className="size-grid">
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "5px" }}>Wall Section</label>
            <div className="section-btns">
              {[
                { id: "left", label: "Left Wall" },
                { id: "back", label: "Back Wall" },
                { id: "right", label: "Right Wall" },
              ].map((sec) => (
                <div
                  key={sec.id}
                  className={`sec-n ${activeKitchenSection === sec.id ? "on" : ""}`}
                  onClick={() => setActiveKitchenSection(sec.id)}
                  style={{ fontSize: "10px", padding: "6px" }}
                >
                  {sec.label}
                </div>
              ))}
            </div>
          </div>

          {/* Render list of modules for active section */}
          <div className="optlist" style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto", paddingRight: "4px" }}>
            {kitchenModules.filter(m => m.section === activeKitchenSection).map((m, idx) => {
              const relativeIndex = kitchenModules.filter(secM => secM.section === activeKitchenSection).indexOf(m);
              const sectionLength = kitchenModules.filter(secM => secM.section === activeKitchenSection).length;
              
              const typeEmojis = {
                base: "🚪",
                wall: "🗄️",
                tall: "🪜"
              };

              return (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.02)", border: "1px solid var(--border)", borderRadius: "6px", padding: "8px", gap: "4px" }}>
                  <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px" }}>{typeEmojis[m.type] || "📁"}</span>
                      <span style={{ fontSize: "11px", fontWeight: "600" }}>{m.label}</span>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button 
                        className="sec-n hover-bright cursor-pointer" 
                        style={{ padding: "2px 6px", fontSize: "10px", minWidth: "auto", height: "auto" }}
                        disabled={relativeIndex === 0}
                        onClick={() => handleMoveModule(relativeIndex, -1)}
                      >
                        ▲
                      </button>
                      <button 
                        className="sec-n hover-bright cursor-pointer" 
                        style={{ padding: "2px 6px", fontSize: "10px", minWidth: "auto", height: "auto" }}
                        disabled={relativeIndex === sectionLength - 1}
                        onClick={() => handleMoveModule(relativeIndex, 1)}
                      >
                        ▼
                      </button>
                      <button 
                        className="sec-n hover-bright cursor-pointer" 
                        style={{ padding: "2px 6px", fontSize: "10px", background: "rgba(224, 122, 95, 0.15)", color: "#e07a5f", minWidth: "auto", height: "auto" }}
                        onClick={() => handleDeleteModule(m.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "9px", color: "var(--muted2)", marginBottom: "2px", display: "block" }}>
                        Width: <span>{(m.width * 100).toFixed(0)} cm</span>
                      </label>
                      <input
                        type="range"
                        className="slider"
                        min="0.15"
                        max="1.20"
                        step="0.05"
                        value={m.width}
                        onChange={(e) => handleUpdateModuleWidth(m.id, e.target.value)}
                      />
                    </div>
                    <div style={{ width: "90px" }}>
                      <label style={{ fontSize: "9px", color: "var(--muted2)", marginBottom: "2px", display: "block" }}>Type</label>
                      <select 
                        value={m.subType}
                        onChange={(e) => handleUpdateModuleSubType(m.id, e.target.value)}
                        style={{ fontSize: "10px", padding: "2px", width: "100%", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--bg)" }}
                      >
                        {m.type === "base" && (
                          <>
                            <option value="standard">Standard</option>
                            <option value="sink">Sink Unit</option>
                            <option value="cooker">Cooker Unit</option>
                            <option value="dishwasher">Dishwasher</option>
                          </>
                        )}
                        {m.type === "wall" && (
                          <>
                            <option value="standard">Standard</option>
                            <option value="glass-door">Glass Door</option>
                            <option value="open-shelf">Open Shelf</option>
                            <option value="lift-up">Lift Up</option>
                          </>
                        )}
                        {m.type === "tall" && (
                          <>
                            <option value="pantry">Pantry</option>
                            <option value="oven-tower">Oven Tower</option>
                            <option value="fridge-housing">Fridge Housing</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}

            {kitchenModules.filter(m => m.section === activeKitchenSection).length === 0 && (
              <div style={{ fontSize: "10px", color: "var(--muted)", padding: "10px", textAlign: "center" }}>
                No modules in this section. Add one below!
              </div>
            )}
          </div>

          {/* Add modules quick actions */}
          <div style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
            <label style={{ fontSize: "10px", fontWeight: "600", color: "var(--muted)", display: "block", marginBottom: "6px" }}>+ Add Module</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
              <button 
                className="sec-n hover-bright cursor-pointer" 
                style={{ fontSize: "9.5px", padding: "5px" }} 
                onClick={() => handleAddKitchenModule("base", "standard", 0.60)}
              >
                ➕ Base (60)
              </button>
              <button 
                className="sec-n hover-bright cursor-pointer" 
                style={{ fontSize: "9.5px", padding: "5px" }} 
                onClick={() => handleAddKitchenModule("wall", "standard", 0.60)}
              >
                ➕ Wall (60)
              </button>
              <button 
                className="sec-n hover-bright cursor-pointer" 
                style={{ fontSize: "9.5px", padding: "5px" }} 
                onClick={() => handleAddKitchenModule("tall", "pantry", 0.60)}
              >
                ➕ Tall (60)
              </button>
            </div>
            
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <button 
                className="sec-n hover-bright cursor-pointer" 
                style={{ fontSize: "9.5px", padding: "5px", flex: 1 }} 
                onClick={() => handleAddKitchenModule("base", "sink", 0.60)}
              >
                💧 Add Sink Base
              </button>
              <button 
                className="sec-n hover-bright cursor-pointer" 
                style={{ fontSize: "9.5px", padding: "5px", flex: 1 }} 
                onClick={() => handleAddKitchenModule("base", "cooker", 0.60)}
              >
                🔥 Add Cooker Base
              </button>
            </div>
          </div>

          <div className="size-row" style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={wallCabinetsEnabled}
                onChange={(e) => setWallCabinetsEnabled(e.target.checked)}
              />
              Enable Wall Cabinets
            </label>
          </div>
        </div>
      </div>

      {/* 5. Kitchen Island Module */}
      <div className="rps">
        <div className="rpt">Kitchen Island Module</div>
        <div className="size-grid">
          <div className="size-row">
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={islandEnabled}
                onChange={(e) => setIslandEnabled(e.target.checked)}
              />
              Enable Kitchen Island
            </label>
          </div>

          {islandEnabled && (
            <>
              <div className="size-row">
                <label>Island Width <span>{islandWidth.toFixed(1)} m</span></label>
                <input
                  type="range"
                  className="slider"
                  min="1.2"
                  max="3.0"
                  step="0.1"
                  value={islandWidth}
                  onChange={(e) => setIslandWidth(parseFloat(e.target.value))}
                />
              </div>
              <div className="size-row">
                <label>Island Depth <span>{islandDepth.toFixed(2)} m</span></label>
                <input
                  type="range"
                  className="slider"
                  min="0.6"
                  max="1.2"
                  step="0.05"
                  value={islandDepth}
                  onChange={(e) => setIslandDepth(parseFloat(e.target.value))}
                />
              </div>
              <div className="size-row" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", cursor: "pointer" }}>
                  <input type="checkbox" checked={islandSeating} onChange={(e) => setIslandSeating(e.target.checked)} />
                  Seating Stools
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", cursor: "pointer" }}>
                  <input type="checkbox" checked={islandSink} onChange={(e) => setIslandSink(e.target.checked)} />
                  Island Sink
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 6. Cabinet Style, Materials & Handles */}
      <div className="rps">
        <div className="rpt">Cabinet Materials & Finishes</div>
        <div className="size-grid" style={{ marginBottom: "10px" }}>
          <label>Finish Category</label>
          <div className="section-btns" style={{ marginBottom: "8px" }}>
            {[
              { id: "wood", label: "🪵 Wood" },
              { id: "matte", label: "🎨 Matte" },
              { id: "premium", label: "💎 Premium" },
            ].map((fin) => (
              <div
                key={fin.id}
                className={`sec-n ${kitchenCabinetMaterial === fin.id ? "on" : ""}`}
                onClick={() => setKitchenCabinetMaterial(fin.id)}
              >
                {fin.label}
              </div>
            ))}
          </div>

          {kitchenCabinetMaterial === "wood" && (
            <div className="optlist">
              {[
                { id: "oak", label: "Oak Wood" },
                { id: "walnut", label: "Walnut Wood" },
                { id: "ash", label: "Ash Wood" },
                { id: "pine", label: "Pine Wood" },
                { id: "teak", label: "Teak Wood" },
              ].map((wType) => (
                <div
                  key={wType.id}
                  className={`opt ${kitchenCabinetWoodType === wType.id ? "on" : ""}`}
                  onClick={() => setKitchenCabinetWoodType(wType.id)}
                >
                  {wType.label}
                </div>
              ))}
            </div>
          )}

          {kitchenCabinetMaterial === "matte" && (
            <div className="txgrid">
              {[
                { id: "white", name: "White", style: { background: "#F2EDE6" } },
                { id: "black", name: "Black", style: { background: "#1C1C1C" } },
                { id: "gray", name: "Gray", style: { background: "#7E7E7E" } },
                { id: "beige", name: "Beige", style: { background: "#D4C5A8" } },
                { id: "green", name: "Green", style: { background: "#506655" } },
                { id: "blue", name: "Blue", style: { background: "#2A3E50" } },
              ].map((cOpt) => (
                <div
                  key={cOpt.id}
                  className={`sw ${kitchenCabinetMatteColor === cOpt.id ? "on" : ""}`}
                  style={cOpt.style}
                  onClick={() => setKitchenCabinetMatteColor(cOpt.id)}
                >
                  <span className="sw-tip">{cOpt.name}</span>
                </div>
              ))}
            </div>
          )}

          {kitchenCabinetMaterial === "premium" && (
            <div className="optlist">
              {[
                { id: "concrete", label: "Concrete Block" },
                { id: "stone", label: "Stone Block" },
                { id: "marble", label: "Polished Marble" },
                { id: "glass", label: "Reflective Glass" },
                { id: "metal", label: "Stainless Metal" },
              ].map((pType) => (
                <div
                  key={pType.id}
                  className={`opt ${kitchenCabinetPremiumFinish === pType.id ? "on" : ""}`}
                  onClick={() => setKitchenCabinetPremiumFinish(pType.id)}
                >
                  {pType.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rpt" style={{ fontSize: "11px", marginTop: "12px", border: "none" }}>Handles</div>
        <div className="optlist">
          {[
            { id: "gold", label: "— Gold Bar" },
            { id: "silver", label: "◎ Silver Knob" },
            { id: "black", label: "▬ Black Strip" },
            { id: "hidden", label: "⊘ Hidden Push" },
            { id: "chrome", label: "✦ Chrome" },
          ].map((hStyle) => (
            <div
              key={hStyle.id}
              className={`opt ${kitchenHandleType === hStyle.id ? "on" : ""}`}
              onClick={() => setKitchenHandleType(hStyle.id)}
            >
              {hStyle.label}
            </div>
          ))}
        </div>
      </div>

      {/* 7. Countertop & Backsplash Materials */}
      <div className="rps">
        <div className="rpt">Countertop & Backsplash</div>
        <div className="size-grid">
          <div className="size-row" style={{ marginBottom: "6px" }}>
            <label>Countertop Material</label>
            <div className="optlist" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {[
                { id: "marble", label: "💎 Marble" },
                { id: "quartz", label: "✨ Quartz" },
                { id: "granite", label: "🪨 Granite" },
                { id: "concrete", label: "🧱 Concrete" },
                { id: "wood", label: "🪵 Wood" },
                { id: "ceramic", label: "🏺 Ceramic" },
              ].map((mat) => (
                <div
                  key={mat.id}
                  className={`opt ${countertopMaterial === mat.id ? "on" : ""}`}
                  onClick={() => setCountertopMaterial(mat.id)}
                  style={{ fontSize: "10.5px", padding: "6px" }}
                >
                  {mat.label}
                </div>
              ))}
            </div>
          </div>

          <div className="size-row">
            <label>Thickness <span>{(countertopThickness * 100).toFixed(0)} cm</span></label>
            <input
              type="range"
              className="slider"
              min="0.01"
              max="0.08"
              step="0.01"
              value={countertopThickness}
              onChange={(e) => setCountertopThickness(parseFloat(e.target.value))}
            />
          </div>

          <div className="size-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={countertopWaterfall}
                onChange={(e) => setCountertopWaterfall(e.target.checked)}
              />
              Waterfall Edge
            </label>
          </div>

          <div className="size-row" style={{ marginTop: "8px", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
            <label>Backsplash Material</label>
            <div className="section-btns" style={{ marginTop: "4px" }}>
              {[
                { id: "ceramic", label: "Tile" },
                { id: "glass", label: "Glass" },
                { id: "marble", label: "Marble" },
                { id: "metal", label: "Steel" },
              ].map((bs) => (
                <div
                  key={bs.id}
                  className={`sec-n ${backsplashMaterial === bs.id ? "on" : ""}`}
                  onClick={() => setBacksplashMaterial(bs.id)}
                  style={{ fontSize: "10px", padding: "6px" }}
                >
                  {bs.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 8. Colors Configurator */}
      <div className="rps">
        <div className="rpt">Colors Configurator</div>
        <div className="size-grid">
          <div className="size-row" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ display: "flex", justifyContent: "space-between" }}>
              Countertop Color <span>{countertopColor}</span>
            </label>
            <input
              type="color"
              value={countertopColor}
              onChange={(e) => setCountertopColor(e.target.value)}
              style={{ width: "100%", height: "28px", border: "1px solid var(--border)", borderRadius: "4px", padding: "0", cursor: "pointer" }}
            />
          </div>
          <div className="size-row" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ display: "flex", justifyContent: "space-between" }}>
              Backsplash Color <span>{backsplashColor}</span>
            </label>
            <input
              type="color"
              value={backsplashColor}
              onChange={(e) => setBacksplashColor(e.target.value)}
              style={{ width: "100%", height: "28px", border: "1px solid var(--border)", borderRadius: "4px", padding: "0", cursor: "pointer" }}
            />
          </div>
          <div className="size-row" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ display: "flex", justifyContent: "space-between" }}>
              Wall Color <span>{wallColor}</span>
            </label>
            <input
              type="color"
              value={wallColor}
              onChange={(e) => setWallColor(e.target.value)}
              style={{ width: "100%", height: "28px", border: "1px solid var(--border)", borderRadius: "4px", padding: "0", cursor: "pointer" }}
            />
          </div>
          <div className="size-row" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ display: "flex", justifyContent: "space-between" }}>
              Floor Color <span>{floorColor}</span>
            </label>
            <input
              type="color"
              value={floorColor}
              onChange={(e) => setFloorColor(e.target.value)}
              style={{ width: "100%", height: "28px", border: "1px solid var(--border)", borderRadius: "4px", padding: "0", cursor: "pointer" }}
            />
          </div>
        </div>
      </div>

      {/* 9. Appliance & Sink Toggles */}
      <div className="rps">
        <div className="rpt">Appliance & Sink Settings</div>
        <div className="size-grid">
          <div className="size-row" style={{ marginBottom: "6px" }}>
            <label>Sink Setup</label>
            <div className="section-btns" style={{ marginBottom: "4px" }}>
              {[
                { id: "yes", label: "Include Sink" },
                { id: "none", label: "No Sink" },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`sec-n ${applianceSink === item.id ? "on" : ""}`}
                  onClick={() => setApplianceSink(item.id)}
                >
                  {item.label}
                </div>
              ))}
            </div>
            {applianceSink !== "none" && (
              <div className="optlist" style={{ marginTop: "6px" }}>
                {[
                  { id: "single-bowl", label: "Single Bowl" },
                  { id: "double-bowl", label: "Double Bowl" },
                  { id: "farmhouse", label: "Farmhouse Bowl" },
                ].map((s) => (
                  <div
                    key={s.id}
                    className={`opt ${sinkType === s.id ? "on" : ""}`}
                    onClick={() => setSinkType(s.id)}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="size-row" style={{ marginBottom: "6px" }}>
            <label>Faucet Type</label>
            <div className="section-btns">
              {[
                { id: "gold", label: "Gold Arc" },
                { id: "chrome", label: "Chrome Arc" },
                { id: "classic", label: "Classic" },
              ].map((f) => (
                <div
                  key={f.id}
                  className={`sec-n ${faucetType === f.id ? "on" : ""}`}
                  onClick={() => setFaucetType(f.id)}
                >
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          <div className="size-row" style={{ marginBottom: "6px" }}>
            <label>Cooker Hob Type</label>
            <div className="section-btns">
              {[
                { id: "induction", label: "Induction" },
                { id: "gas", label: "Gas" },
                { id: "electric", label: "Electric" },
                { id: "none", label: "None" },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`sec-n ${applianceCooker === item.id ? "on" : ""}`}
                  onClick={() => setApplianceCooker(item.id)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="size-row" style={{ marginBottom: "6px" }}>
            <label>Oven Tower Unit</label>
            <div className="section-btns">
              {[
                { id: "single", label: "Single Oven" },
                { id: "double", label: "Double Oven" },
                { id: "steam", label: "Steam Oven" },
                { id: "none", label: "None" },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`sec-n ${applianceOven === item.id ? "on" : ""}`}
                  onClick={() => setApplianceOven(item.id)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="size-row" style={{ marginBottom: "6px" }}>
            <label>Refrigeration</label>
            <div className="section-btns">
              {[
                { id: "built-in", label: "Built-In" },
                { id: "single", label: "Single" },
                { id: "double", label: "Double" },
                { id: "none", label: "None" },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`sec-n ${applianceFridge === item.id ? "on" : ""}`}
                  onClick={() => setApplianceFridge(item.id)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 10. Texture System */}
      <div className="rps">
        <div className="rpt">Texture System</div>
        <div className="size-grid">
          <div className="size-row">
            <label>Texture Scale <span>{textureScale.toFixed(1)}x</span></label>
            <input
              type="range"
              className="slider"
              min="0.5"
              max="3.0"
              step="0.1"
              value={textureScale}
              onChange={(e) => setTextureScale(parseFloat(e.target.value))}
            />
          </div>
          <div className="size-row">
            <label>Texture Rotation <span>{textureRotation}°</span></label>
            <input
              type="range"
              className="slider"
              min="0"
              max="360"
              step="5"
              value={textureRotation}
              onChange={(e) => setTextureRotation(parseInt(e.target.value))}
            />
          </div>
          <div className="size-row">
            <label>Gloss Level <span>{(glossLevel * 100).toFixed(0)}%</span></label>
            <input
              type="range"
              className="slider"
              min="0.0"
              max="1.0"
              step="0.05"
              value={glossLevel}
              onChange={(e) => setGlossLevel(parseFloat(e.target.value))}
            />
          </div>
          <div className="size-row">
            <label>Roughness <span>{(roughnessVal * 100).toFixed(0)}%</span></label>
            <input
              type="range"
              className="slider"
              min="0.0"
              max="1.0"
              step="0.05"
              value={roughnessVal}
              onChange={(e) => setRoughnessVal(parseFloat(e.target.value))}
            />
          </div>
          <div className="size-row">
            <label>Bump Strength <span>{(bumpStrength * 100).toFixed(0)}%</span></label>
            <input
              type="range"
              className="slider"
              min="0.0"
              max="1.0"
              step="0.05"
              value={bumpStrength}
              onChange={(e) => setBumpStrength(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 11. Versions / Export & Save */}
      <div className="rps" style={{ borderBottom: "none" }}>
        <div className="rpt">Versions</div>
        <div className="optlist" style={{ gap: "8px" }}>
          {[
            { id: "v1", name: "Oak / U-Shape", desc: "Current version", cls: "s1" },
            { id: "v2", name: "Matte Gray / L-Shape", desc: "10 mins ago", cls: "s8" },
            { id: "v3", name: "Glossy White / Island", desc: "Yesterday", cls: "s3" }
          ].map((v) => (
            <div
              key={v.id}
              className="vi"
              onClick={() => {
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
