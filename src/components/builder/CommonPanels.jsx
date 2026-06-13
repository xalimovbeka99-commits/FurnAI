"use client";

import React from "react";

export default function CommonPanels({
  activeCategory,
  selectedPart,
  width,
  setWidth,
  height,
  setHeight,
  depth,
  setDepth,
  tvWallSize,
  setTvWallSize,
  tvWallShelves,
  setTvWallShelves,
  tvWallLed,
  setTvWallLed,
  tvWallStorage,
  setTvWallStorage,
  tvPanelStyle,
  setTvPanelStyle,
  tvLedColor,
  setTvLedColor,
  tvSoundBar,
  setTvSoundBar,
  tvConsoleLegs,
  setTvConsoleLegs,
  cabinetDrawerRows,
  setCabinetDrawerRows,
  cabinetLegs,
  setCabinetLegs,
  cabinetOpenTop,
  setCabinetOpenTop,
  cabinetStyle,
  setCabinetStyle,
  cabinetDoorCount,
  setCabinetDoorCount,
  cabinetGlassDoors,
  setCabinetGlassDoors,
  bedSize,
  setBedSize,
  bedHeadboard,
  setBedHeadboard,
  bedStorage,
  setBedStorage,
  bedLedUnder,
  setBedLedUnder,
  bedFrameStyle,
  setBedFrameStyle,
  bedPillowCount,
  setBedPillowCount,
  bedLampStyle,
  setBedLampStyle,
  bedBench,
  setBedBench,
  shelfCount,
  setShelfCount,
  shelfStyle,
  setShelfStyle,
  shelfBackPanel,
  setShelfBackPanel,
  shelfMaterial,
  setShelfMaterial,
  shelfLighting,
  setShelfLighting,
  shelfDecorItems,
  setShelfDecorItems,
  dressingDrawers,
  setDressingDrawers,
  dressingMirror,
  setDressingMirror,
  dressingLights,
  setDressingLights,
  dressingTableMat,
  setDressingTableMat,
  dressingStool,
  setDressingStool,
  activeColor,
  setActiveColor,
  setActiveFaceColor,
  triggerNotification,
  calculateEstimatedCost,
  handleExportPNG,
  handleExportJPG,
  handleExportPDF,
  handleExportGLB,
  handleExportFormat,
}) {
  return (
    <>
      {/* Selected Part */}
      <div className="rps">
        <div className="rpt">Selected Part</div>
        <div className="pbadge">
          <div className="pdot"></div>
          <span>{selectedPart}</span>
        </div>
      </div>

      {/* Size */}
      <div className="rps">
        <div className="rpt">Size</div>
        <div className="size-grid">
          <div className="size-row">
            <label>Width <span>{width.toFixed(1)} m</span></label>
            <input
              type="range"
              className="slider"
              min="0.8"
              max="3.2"
              step="0.1"
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value))}
            />
          </div>
          {activeCategory !== "bed" && (
            <div className="size-row">
              <label>Height <span>{height.toFixed(1)} m</span></label>
              <input
                type="range"
                className="slider"
                min="0.4"
                max="2.6"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value))}
              />
            </div>
          )}
          <div className="size-row">
            <label>Depth <span>{depth.toFixed(2)} m</span></label>
            <input
              type="range"
              className="slider"
              min="0.3"
              max="0.8"
              step="0.05"
              value={depth}
              onChange={(e) => setDepth(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* TV Wall Unit controls */}
      {activeCategory === "tv-wall" && (
        <div className="rps">
          <div className="rpt">TV Wall Unit</div>
          <div className="size-grid">
            <div className="size-row">
              <label>Screen Size</label>
              <div className="section-btns">
                {["43", "55", "65", "75", "85"].map((s) => (
                  <div
                    key={s}
                    className={`sec-n ${tvWallSize === s ? "on" : ""}`}
                    onClick={() => { setTvWallSize(s); triggerNotification(`${s}" screen selected`); }}
                  >
                    {s}&quot;
                  </div>
                ))}
              </div>
            </div>
            <div className="size-row">
              <label>Floating Shelves <span>{tvWallShelves}</span></label>
              <input
                type="range"
                className="slider"
                min="0"
                max="4"
                step="1"
                value={tvWallShelves}
                onChange={(e) => setTvWallShelves(parseInt(e.target.value))}
              />
            </div>
          </div>
          <button
            className={`scene-btn ${tvWallLed ? "on" : ""}`}
            style={{ margin: "8px 0 7px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setTvWallLed(!tvWallLed); triggerNotification(tvWallLed ? "LED backlight off" : "LED backlight on"); }}
          >
            {tvWallLed ? "✓" : "○"} LED Backlight Glow
          </button>
          <button
            className={`scene-btn ${tvWallStorage ? "on" : ""}`}
            style={{ margin: "0 0 8px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setTvWallStorage(!tvWallStorage); triggerNotification(tvWallStorage ? "Closed storage cabinet" : "Open shelf cabinet"); }}
          >
            {tvWallStorage ? "✓" : "○"} Enclosed Storage Cabinet
          </button>
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "5px" }}>Wall Panel</label>
            <div className="section-btns">
              {[{ id: "slats", label: "Slats" }, { id: "solid", label: "Solid" }, { id: "stone", label: "Stone" }].map((p) => (
                <div key={p.id} className={`sec-n ${tvPanelStyle === p.id ? "on" : ""}`}
                  onClick={() => { setTvPanelStyle(p.id); triggerNotification(`Panel: ${p.label}`); }}>
                  {p.label}
                </div>
              ))}
            </div>
          </div>
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "5px" }}>LED Color</label>
            <div className="section-btns">
              {[{ id: "warm", label: "Warm" }, { id: "cool", label: "Cool" }, { id: "rgb", label: "RGB" }].map((c) => (
                <div key={c.id} className={`sec-n ${tvLedColor === c.id ? "on" : ""}`}
                  onClick={() => { setTvLedColor(c.id); triggerNotification(`LED: ${c.label}`); }}>
                  {c.label}
                </div>
              ))}
            </div>
          </div>
          <button
            className={`scene-btn ${tvSoundBar ? "on" : ""}`}
            style={{ margin: "0 0 7px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setTvSoundBar(!tvSoundBar); triggerNotification(tvSoundBar ? "Sound bar removed" : "Sound bar added"); }}
          >
            {tvSoundBar ? "✓" : "○"} Sound Bar
          </button>
          <button
            className={`scene-btn ${tvConsoleLegs ? "on" : ""}`}
            style={{ margin: "0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setTvConsoleLegs(!tvConsoleLegs); triggerNotification(tvConsoleLegs ? "Console legs hidden" : "Hairpin legs added"); }}
          >
            {tvConsoleLegs ? "✓" : "○"} Hairpin Console Legs
          </button>
        </div>
      )}

      {/* Cabinet controls */}
      {activeCategory === "cabinet" && (
        <div className="rps">
          <div className="rpt">Cabinet</div>
          <div className="size-grid">
            <div className="size-row">
              <label>Drawer Rows <span>{cabinetDrawerRows}</span></label>
              <input
                type="range"
                className="slider"
                min="0"
                max="4"
                step="1"
                value={cabinetDrawerRows}
                onChange={(e) => setCabinetDrawerRows(parseInt(e.target.value))}
              />
            </div>
            <div className="size-row">
              <label>Leg Style</label>
              <div className="section-btns">
                {[
                  { id: "metal", label: "Metal" },
                  { id: "wood", label: "Wood" },
                  { id: "none", label: "None" },
                ].map((leg) => (
                  <div
                    key={leg.id}
                    className={`sec-n ${cabinetLegs === leg.id ? "on" : ""}`}
                    onClick={() => { setCabinetLegs(leg.id); triggerNotification(`Legs: ${leg.label}`); }}
                  >
                    {leg.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            className={`scene-btn ${cabinetOpenTop ? "on" : ""}`}
            style={{ margin: "8px 0 8px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setCabinetOpenTop(!cabinetOpenTop); triggerNotification(cabinetOpenTop ? "Top compartment closed" : "Open-top display compartment"); }}
          >
            {cabinetOpenTop ? "✓" : "○"} Open-Top Display Compartment
          </button>
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "5px" }}>Cabinet Style</label>
            <div className="section-btns">
              {[{ id: "sideboard", label: "Sideboard" }, { id: "highboy", label: "Highboy" }, { id: "filing", label: "Filing" }].map((s) => (
                <div key={s.id} className={`sec-n ${cabinetStyle === s.id ? "on" : ""}`}
                  onClick={() => { setCabinetStyle(s.id); triggerNotification(`Style: ${s.label}`); }}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label>Doors <span>{cabinetDoorCount}</span></label>
            <input type="range" className="slider" min="2" max="4" step="1"
              value={cabinetDoorCount} onChange={(e) => setCabinetDoorCount(parseInt(e.target.value))} />
          </div>
          <button
            className={`scene-btn ${cabinetGlassDoors ? "on" : ""}`}
            style={{ margin: "0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setCabinetGlassDoors(!cabinetGlassDoors); triggerNotification(cabinetGlassDoors ? "Solid doors" : "Glass doors added"); }}
          >
            {cabinetGlassDoors ? "✓" : "○"} Glass Doors
          </button>
        </div>
      )}

      {/* Bed controls */}
      {activeCategory === "bed" && (
        <div className="rps">
          <div className="rpt">Bed</div>
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "5px" }}>Bed Size</label>
            <div className="section-btns">
              {[
                { id: "single", label: "Single" },
                { id: "double", label: "Double" },
                { id: "queen", label: "Queen" },
                { id: "king", label: "King" },
              ].map((sz) => (
                <div
                  key={sz.id}
                  className={`sec-n ${bedSize === sz.id ? "on" : ""}`}
                  onClick={() => { setBedSize(sz.id); triggerNotification(`${sz.label} bed selected`); }}
                >
                  {sz.label}
                </div>
              ))}
            </div>
          </div>
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "5px" }}>Headboard Style</label>
            <div className="section-btns">
              {[
                { id: "padded", label: "Padded" },
                { id: "wood", label: "Wood" },
                { id: "tall", label: "Tall" },
                { id: "low", label: "Low" },
              ].map((hb) => (
                <div
                  key={hb.id}
                  className={`sec-n ${bedHeadboard === hb.id ? "on" : ""}`}
                  onClick={() => { setBedHeadboard(hb.id); triggerNotification(`Headboard: ${hb.label}`); }}
                >
                  {hb.label}
                </div>
              ))}
            </div>
          </div>
          <button
            className={`scene-btn ${bedStorage ? "on" : ""}`}
            style={{ margin: "0 0 7px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setBedStorage(!bedStorage); triggerNotification(bedStorage ? "Storage drawers removed" : "Under-bed storage drawers added"); }}
          >
            {bedStorage ? "✓" : "○"} Under-Bed Storage Drawers
          </button>
          <button
            className={`scene-btn ${bedLedUnder ? "on" : ""}`}
            style={{ margin: "0 0 8px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setBedLedUnder(!bedLedUnder); triggerNotification(bedLedUnder ? "Under-bed LED off" : "Under-bed LED glow on"); }}
          >
            {bedLedUnder ? "✓" : "○"} Under-Bed LED Glow
          </button>
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "5px" }}>Frame Style</label>
            <div className="section-btns">
              {[{ id: "platform", label: "Platform" }, { id: "panel", label: "Panel" }, { id: "floating", label: "Float" }].map((f) => (
                <div key={f.id} className={`sec-n ${bedFrameStyle === f.id ? "on" : ""}`}
                  onClick={() => { setBedFrameStyle(f.id); triggerNotification(`Frame: ${f.label}`); }}>
                  {f.label}
                </div>
              ))}
            </div>
          </div>
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "5px" }}>Pillows</label>
            <div className="section-btns">
              {[{ id: 2, label: "2" }, { id: 4, label: "4" }].map((p) => (
                <div key={p.id} className={`sec-n ${bedPillowCount === p.id ? "on" : ""}`}
                  onClick={() => { setBedPillowCount(p.id); triggerNotification(`${p.label} pillows`); }}>
                  {p.label}
                </div>
              ))}
            </div>
          </div>
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "5px" }}>Bedside Lamp</label>
            <div className="section-btns">
              {[{ id: "table", label: "Table" }, { id: "pendant", label: "Pendant" }, { id: "none", label: "None" }].map((l) => (
                <div key={l.id} className={`sec-n ${bedLampStyle === l.id ? "on" : ""}`}
                  onClick={() => { setBedLampStyle(l.id); triggerNotification(`Lamp: ${l.label}`); }}>
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <button
            className={`scene-btn ${bedBench ? "on" : ""}`}
            style={{ margin: "0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setBedBench(!bedBench); triggerNotification(bedBench ? "Bench removed" : "Foot bench added"); }}
          >
            {bedBench ? "✓" : "○"} Foot-of-Bed Bench
          </button>
        </div>
      )}

      {/* Shelving Unit controls */}
      {activeCategory === "shelves" && (
        <div className="rps">
          <div className="rpt">Shelving Unit</div>
          <div className="size-grid">
            <div className="size-row">
              <label>Shelf Count <span>{shelfCount}</span></label>
              <input
                type="range"
                className="slider"
                min="2"
                max="8"
                step="1"
                value={shelfCount}
                onChange={(e) => setShelfCount(parseInt(e.target.value))}
              />
            </div>
            <div className="size-row">
              <label>Layout Style</label>
              <div className="section-btns">
                {[
                  { id: "open", label: "Open" },
                  { id: "ladder", label: "Ladder" },
                  { id: "cube", label: "Cube" },
                ].map((st) => (
                  <div
                    key={st.id}
                    className={`sec-n ${shelfStyle === st.id ? "on" : ""}`}
                    onClick={() => { setShelfStyle(st.id); triggerNotification(`Layout: ${st.label}`); }}
                  >
                    {st.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            className={`scene-btn ${shelfBackPanel ? "on" : ""}`}
            style={{ margin: "8px 0 8px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setShelfBackPanel(!shelfBackPanel); triggerNotification(shelfBackPanel ? "Back panel removed" : "Back panel added"); }}
          >
            {shelfBackPanel ? "✓" : "○"} Back Panel
          </button>
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "5px" }}>Material</label>
            <div className="section-btns">
              {[{ id: "oak", label: "Oak" }, { id: "walnut", label: "Walnut" }, { id: "white", label: "White" }, { id: "metal", label: "Metal" }].map((m) => (
                <div key={m.id} className={`sec-n ${shelfMaterial === m.id ? "on" : ""}`}
                  onClick={() => { setShelfMaterial(m.id); triggerNotification(`Material: ${m.label}`); }}>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
          <button
            className={`scene-btn ${shelfLighting ? "on" : ""}`}
            style={{ margin: "0 0 7px 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setShelfLighting(!shelfLighting); triggerNotification(shelfLighting ? "Shelf lighting off" : "LED shelf lighting on"); }}
          >
            {shelfLighting ? "✓" : "○"} LED Shelf Lighting
          </button>
          <button
            className={`scene-btn ${shelfDecorItems ? "on" : ""}`}
            style={{ margin: "0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setShelfDecorItems(!shelfDecorItems); triggerNotification(shelfDecorItems ? "Decor removed" : "Books & decor added"); }}
          >
            {shelfDecorItems ? "✓" : "○"} Books & Decor Items
          </button>
        </div>
      )}

      {/* Dressing Table controls */}
      {activeCategory === "dressing-table" && (
        <div className="rps">
          <div className="rpt">Dressing Table</div>
          <div className="size-grid">
            <div className="size-row">
              <label>Drawers <span>{dressingDrawers}</span></label>
              <input
                type="range"
                className="slider"
                min="0"
                max="4"
                step="1"
                value={dressingDrawers}
                onChange={(e) => setDressingDrawers(parseInt(e.target.value))}
              />
            </div>
            <div className="size-row">
              <label>Mirror Style</label>
              <div className="section-btns">
                {[
                  { id: "round", label: "Round" },
                  { id: "rect", label: "Rect." },
                  { id: "trifold", label: "Trifold" },
                  { id: "none", label: "None" },
                ].map((mr) => (
                  <div
                    key={mr.id}
                    className={`sec-n ${dressingMirror === mr.id ? "on" : ""}`}
                    onClick={() => { setDressingMirror(mr.id); triggerNotification(`Mirror: ${mr.label}`); }}
                  >
                    {mr.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="size-row">
              <label>Mirror Lights</label>
              <div className="section-btns">
                {[
                  { id: "hollywood", label: "Hollywood" },
                  { id: "led-strip", label: "LED Ring" },
                  { id: "none", label: "None" },
                ].map((l) => (
                  <div
                    key={l.id}
                    className={`sec-n ${dressingLights === l.id ? "on" : ""}`}
                    onClick={() => { setDressingLights(l.id); triggerNotification(`Lights: ${l.label}`); }}
                  >
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="size-row">
              <label>Table Material</label>
              <div className="section-btns">
                {[
                  { id: "oak", label: "Oak" },
                  { id: "walnut", label: "Walnut" },
                  { id: "white", label: "White" },
                  { id: "black", label: "Black" },
                ].map((m) => (
                  <div
                    key={m.id}
                    className={`sec-n ${dressingTableMat === m.id ? "on" : ""}`}
                    onClick={() => { setDressingTableMat(m.id); triggerNotification(`Material: ${m.label}`); }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            className={`scene-btn ${dressingStool ? "on" : ""}`}
            style={{ margin: "8px 0 0 0", width: "100%", justifyContent: "flex-start", paddingLeft: "10px" }}
            onClick={() => { setDressingStool(!dressingStool); triggerNotification(dressingStool ? "Stool removed" : "Matching stool added"); }}
          >
            {dressingStool ? "✓" : "○"} Matching Stool
          </button>
        </div>
      )}

      {/* Body Colour - shared swatches */}
      <div className="rps">
        <div className="rpt">Body Colour</div>
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

      {/* Save & Export */}
      <div className="rps">
        <div className="rpt">Save &amp; Export</div>
        <div style={{ marginBottom: "10px" }}>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>Estimated Cost: </span>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent)" }}>
            ${parseFloat(calculateEstimatedCost()).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <button
          className="vsave cursor-pointer"
          onClick={() => triggerNotification("Design saved to designs list!")}
          style={{ width: "100%", fontSize: "11px", padding: "6px" }}
        >
          Save Current Design
        </button>
        <div style={{ marginTop: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Export Options</div>
          <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
            <div className="sec-n hover-bright cursor-pointer" onClick={handleExportPNG} style={{ fontSize: "10px", padding: "6px", textAlign: "center" }}>PNG</div>
            <div className="sec-n hover-bright cursor-pointer" onClick={handleExportJPG} style={{ fontSize: "10px", padding: "6px", textAlign: "center" }}>JPG</div>
            <div className="sec-n hover-bright cursor-pointer" onClick={handleExportPDF} style={{ fontSize: "10px", padding: "6px", textAlign: "center" }}>PDF</div>
            <div className="sec-n hover-bright cursor-pointer" onClick={handleExportGLB} style={{ fontSize: "10px", padding: "6px", textAlign: "center" }}>GLB</div>
            <div className="sec-n hover-bright cursor-pointer" onClick={() => handleExportFormat("obj")} style={{ fontSize: "10px", padding: "6px", textAlign: "center" }}>OBJ</div>
            <div className="sec-n hover-bright cursor-pointer" onClick={() => handleExportFormat("fbx")} style={{ fontSize: "10px", padding: "6px", textAlign: "center" }}>FBX</div>
          </div>
        </div>
      </div>
    </>
  );
}
