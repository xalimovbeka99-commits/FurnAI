"use client";

import React from "react";

export default function OfficePanels({
  officeDeskTopMat,
  setOfficeDeskTopMat,
  officeCabColor,
  setOfficeCabColor,
  setOfficeDeskBaseMat,
  setOfficeCabPanelMat,
  setOfficeLedColor,
  setOfficeLedOn,
  triggerNotification,
  officeDeskW,
  setOfficeDeskW,
  officeDeskD,
  setOfficeDeskD,
  officeDeskH,
  setOfficeDeskH,
  officeDeskT,
  setOfficeDeskT,
  officeDeskDrawer,
  setOfficeDeskDrawer,
  officeDeskDrawerCount,
  setOfficeDeskDrawerCount,
  officeDeskDrawerSide,
  setOfficeDeskDrawerSide,
  officeDeskDrawerStyle,
  setOfficeDeskDrawerStyle,
  officeDeskFileCab,
  setOfficeDeskFileCab,
  officeDeskBaseMat,
  officeMatsRef,
  officeCabW,
  setOfficeCabW,
  officeCabH,
  setOfficeCabH,
  officeCabD,
  setOfficeCabD,
  officeCabSections,
  setOfficeCabSections,
  officeCabOpenShelves,
  setOfficeCabOpenShelves,
  officeCabLowerDoors,
  setOfficeCabLowerDoors,
  officeCabLowerHRatio,
  setOfficeCabLowerHRatio,
  officeCabShelfSpacing,
  setOfficeCabShelfSpacing,
  officeCabPanelMat,
  officeCabAutoSync,
  setOfficeCabAutoSync,
  officeLedOn,
  officeLedColor,
  officeLedBright,
  setOfficeLedBright,
  officeLedUnder,
  setOfficeLedUnder,
  officeLedBack,
  setOfficeLedBack,
  officeLedTop,
  setOfficeLedTop,
  calculateEstimatedCost,
  handleExportPNG,
  handleExportJPG,
  handleExportPDF,
  handleExportGLB,
  handleExportFormat,
}) {
  return (
    <>
      {/* 2. Style Presets */}
      <div className="rps">
        <div className="rpt">Style Presets</div>
        <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
          <button 
            className={`sec-n cursor-pointer ${officeDeskTopMat === 'walnut' && officeCabColor === 'beige' ? 'on' : ''}`}
            onClick={() => {
              setOfficeDeskTopMat('walnut'); setOfficeDeskBaseMat('matte_beige');
              setOfficeCabColor('beige'); setOfficeCabPanelMat('walnut');
              setOfficeLedColor('warm'); setOfficeLedOn(true);
              triggerNotification("Applied Modern Walnut Preset");
            }}
            style={{ fontSize: "10px", padding: "6px" }}
          >
            Modern Walnut
          </button>
          <button 
            className={`sec-n cursor-pointer ${officeDeskTopMat === 'white_marble' && officeCabColor === 'white' ? 'on' : ''}`}
            onClick={() => {
              setOfficeDeskTopMat('white_marble'); setOfficeDeskBaseMat('matte_white');
              setOfficeCabColor('white'); setOfficeCabPanelMat('white_marble');
              setOfficeLedColor('neutral'); setOfficeLedOn(true);
              triggerNotification("Applied Marble Luxury Preset");
            }}
            style={{ fontSize: "10px", padding: "6px" }}
          >
            Marble Luxury
          </button>
          <button 
            className={`sec-n cursor-pointer ${officeDeskTopMat === 'black_marble' && officeCabColor === 'dark_grey' ? 'on' : ''}`}
            onClick={() => {
              setOfficeDeskTopMat('black_marble'); setOfficeDeskBaseMat('matte_black');
              setOfficeCabColor('dark_grey'); setOfficeCabPanelMat('black_marble');
              setOfficeLedColor('cool'); setOfficeLedOn(true);
              triggerNotification("Applied Dark Executive Preset");
            }}
            style={{ fontSize: "10px", padding: "6px" }}
          >
            Dark Executive
          </button>
        </div>
      </div>

      {/* 3. Desk Dimensions */}
      <div className="rps">
        <div className="rpt">Desk Dimensions</div>
        <div className="size-grid">
          <div className="size-row">
            <label>Width <span>{Math.round(officeDeskW * 100)} cm</span></label>
            <input
              type="range"
              className="slider"
              min="140"
              max="340"
              step="5"
              value={officeDeskW * 100}
              onChange={(e) => setOfficeDeskW(parseFloat(e.target.value) / 100)}
            />
          </div>
          <div className="size-row">
            <label>Depth <span>{Math.round(officeDeskD * 100)} cm</span></label>
            <input
              type="range"
              className="slider"
              min="60"
              max="140"
              step="5"
              value={officeDeskD * 100}
              onChange={(e) => setOfficeDeskD(parseFloat(e.target.value) / 100)}
            />
          </div>
          <div className="size-row">
            <label>Height <span>{Math.round(officeDeskH * 100)} cm</span></label>
            <input
              type="range"
              className="slider"
              min="65"
              max="90"
              step="1"
              value={officeDeskH * 100}
              onChange={(e) => setOfficeDeskH(parseFloat(e.target.value) / 100)}
            />
          </div>
          <div className="size-row">
            <label>Tabletop Thickness <span>{Math.round(officeDeskT * 100)} cm</span></label>
            <input
              type="range"
              className="slider"
              min="3"
              max="12"
              step="1"
              value={officeDeskT * 100}
              onChange={(e) => setOfficeDeskT(parseFloat(e.target.value) / 100)}
            />
          </div>
        </div>
      </div>

      {/* 4. Desk Configuration */}
      <div className="rps">
        <div className="rpt">Desk Configuration</div>
        <div className="size-grid">
          <div className="size-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ margin: 0 }}>Drawer Unit</label>
            <button 
              className={`sec-n cursor-pointer ${officeDeskDrawer ? "on" : ""}`}
              onClick={() => setOfficeDeskDrawer(!officeDeskDrawer)}
              style={{ padding: "4px 10px", fontSize: "11px" }}
            >
              {officeDeskDrawer ? "ON" : "OFF"}
            </button>
          </div>
          
          {officeDeskDrawer && (
            <>
              <div className="size-row" style={{ marginBottom: "8px" }}>
                <label style={{ marginBottom: "4px" }}>Drawer Count</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button className="sec-n cursor-pointer" onClick={() => setOfficeDeskDrawerCount(Math.max(1, officeDeskDrawerCount - 1))} style={{ padding: "4px 10px" }}>−</button>
                  <span style={{ fontSize: "14px", fontWeight: "800", flex: 1, textAlign: "center", color: "var(--accent)" }}>{officeDeskDrawerCount}</span>
                  <button className="sec-n cursor-pointer" onClick={() => setOfficeDeskDrawerCount(Math.min(6, officeDeskDrawerCount + 1))} style={{ padding: "4px 10px" }}>+</button>
                </div>
              </div>
              
              <div className="size-row" style={{ marginBottom: "8px" }}>
                <label style={{ marginBottom: "4px" }}>Placement</label>
                <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                  {["left", "right", "both"].map((side) => (
                    <button 
                      key={side}
                      className={`sec-n cursor-pointer ${officeDeskDrawerSide === side ? "on" : ""}`}
                      onClick={() => setOfficeDeskDrawerSide(side)}
                      style={{ fontSize: "10px", padding: "4px", textTransform: "capitalize" }}
                    >
                      {side}
                    </button>
                  ))}
                </div>
              </div>

              <div className="size-row" style={{ marginBottom: "8px" }}>
                <label style={{ marginBottom: "4px" }}>Style</label>
                <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                  {[
                    { id: "closed", label: "Closed" },
                    { id: "open", label: "Open Shelf" }
                  ].map((st) => (
                    <button 
                      key={st.id}
                      className={`sec-n cursor-pointer ${officeDeskDrawerStyle === st.id ? "on" : ""}`}
                      onClick={() => setOfficeDeskDrawerStyle(st.id)}
                      style={{ fontSize: "10px", padding: "4px" }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="size-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ margin: 0 }}>File Cabinet</label>
            <button 
              className={`sec-n cursor-pointer ${officeDeskFileCab ? "on" : ""}`}
              onClick={() => setOfficeDeskFileCab(!officeDeskFileCab)}
              style={{ padding: "4px 10px", fontSize: "11px" }}
            >
              {officeDeskFileCab ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Desk Materials */}
      <div className="rps">
        <div className="rpt">Desk Materials</div>
        <div className="size-grid">
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "4px" }}>Tabletop Finish</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
              {[
                { id: "natural_oak", label: "Natural Oak", bg: "#C8A96E" },
                { id: "walnut", label: "Walnut", bg: "#6B3F1E" },
                { id: "dark_walnut", label: "Dark Walnut", bg: "#3A2010" },
                { id: "ash", label: "Ash Wood", bg: "#D8C9A8" },
                { id: "black_wood", label: "Black Wood", bg: "#1A1614" },
                { id: "white_wood", label: "White Wood", bg: "#EDE8DF" },
                { id: "matte_lam", label: "Matte Lam.", bg: "#D0C9BE" },
                { id: "high_gloss", label: "High Gloss", bg: "#EEEAE4" },
                { id: "white_marble", label: "White Marble", bg: "#F5F5F0" },
                { id: "black_marble", label: "Black Marble", bg: "#1A1A1C" },
                { id: "grey_marble", label: "Grey Marble", bg: "#B0AFAC" },
                { id: "travertine", label: "Travertine", bg: "#D4C4A0" },
              ].map((mat) => (
                <button
                  key={mat.id}
                  className={`sec-n cursor-pointer ${officeDeskTopMat === mat.id ? "on" : ""}`}
                  onClick={() => {
                    setOfficeDeskTopMat(mat.id);
                    if (officeCabAutoSync) setOfficeCabPanelMat(mat.id);
                  }}
                  style={{ fontSize: "10.5px", padding: "5px 8px", display: "flex", alignItems: "center", gap: "6px", textAlign: "left", justifyContent: "flex-start" }}
                >
                  <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: mat.bg, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
                  {mat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="size-row">
            <label style={{ marginBottom: "4px" }}>Base / Pedestals</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
              {[
                { id: "match_top", label: "Match Top", bg: "#C8A96E" },
                { id: "matte_beige", label: "Matte Beige", bg: "#BEB4A6" },
                { id: "matte_white", label: "Matte White", bg: "#EFEFED" },
                { id: "matte_black", label: "Matte Black", bg: "#1C1C1E" },
                { id: "dark_grey_base", label: "Dark Grey", bg: "#3A3A3C" },
              ].map((mat) => (
                <button
                  key={mat.id}
                  className={`sec-n cursor-pointer ${officeDeskBaseMat === mat.id ? "on" : ""}`}
                  onClick={() => setOfficeDeskBaseMat(mat.id)}
                  style={{ fontSize: "10.5px", padding: "5px 8px", display: "flex", alignItems: "center", gap: "6px", textAlign: "left", justifyContent: "flex-start" }}
                >
                  <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: mat.id === 'match_top' ? "#C8A96E" : mat.bg, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
                  {mat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Cabinet Dimensions */}
      <div className="rps">
        <div className="rpt">Cabinet Dimensions</div>
        <div className="size-grid">
          <div className="size-row">
            <label>Width <span>{Math.round(officeCabW * 100)} cm</span></label>
            <input
              type="range"
              className="slider"
              min="200"
              max="600"
              step="10"
              value={officeCabW * 100}
              onChange={(e) => setOfficeCabW(parseFloat(e.target.value) / 100)}
            />
          </div>
          <div className="size-row">
            <label>Height <span>{Math.round(officeCabH * 100)} cm</span></label>
            <input
              type="range"
              className="slider"
              min="200"
              max="320"
              step="5"
              value={officeCabH * 100}
              onChange={(e) => setOfficeCabH(parseFloat(e.target.value) / 100)}
            />
          </div>
          <div className="size-row">
            <label>Depth <span>{Math.round(officeCabD * 100)} cm</span></label>
            <input
              type="range"
              className="slider"
              min="25"
              max="60"
              step="2"
              value={officeCabD * 100}
              onChange={(e) => setOfficeCabD(parseFloat(e.target.value) / 100)}
            />
          </div>
          <div className="size-row">
            <label>Sections <span>{officeCabSections}</span></label>
            <input
              type="range"
              className="slider"
              min="2"
              max="6"
              step="1"
              value={officeCabSections}
              onChange={(e) => setOfficeCabSections(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 7. Cabinet Layout */}
      <div className="rps">
        <div className="rpt">Cabinet Layout</div>
        <div className="size-grid">
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "4px" }}>Open Shelves</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button className="sec-n cursor-pointer" onClick={() => setOfficeCabOpenShelves(Math.max(1, officeCabOpenShelves - 1))} style={{ padding: "4px 10px" }}>−</button>
              <span style={{ fontSize: "14px", fontWeight: "800", flex: 1, textAlign: "center", color: "var(--accent)" }}>{officeCabOpenShelves}</span>
              <button className="sec-n cursor-pointer" onClick={() => setOfficeCabOpenShelves(Math.min(6, officeCabOpenShelves + 1))} style={{ padding: "4px 10px" }}>+</button>
            </div>
          </div>
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "4px" }}>Lower Doors</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button className="sec-n cursor-pointer" onClick={() => setOfficeCabLowerDoors(Math.max(2, officeCabLowerDoors - 1))} style={{ padding: "4px 10px" }}>−</button>
              <span style={{ fontSize: "14px", fontWeight: "800", flex: 1, textAlign: "center", color: "var(--accent)" }}>{officeCabLowerDoors}</span>
              <button className="sec-n cursor-pointer" onClick={() => setOfficeCabLowerDoors(Math.min(8, officeCabLowerDoors + 1))} style={{ padding: "4px 10px" }}>+</button>
            </div>
          </div>
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label>Lower Section Height <span>{Math.round(officeCabLowerHRatio * 100)}%</span></label>
            <input
              type="range"
              className="slider"
              min="20"
              max="60"
              step="5"
              value={officeCabLowerHRatio * 100}
              onChange={(e) => setOfficeCabLowerHRatio(parseFloat(e.target.value) / 100)}
            />
          </div>
          <div className="size-row">
            <label style={{ marginBottom: "4px" }}>Shelf Spacing</label>
            <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
              {[
                { id: "even", label: "Even" },
                { id: "top", label: "Top Heavy" },
                { id: "bot", label: "Bottom" }
              ].map((spacing) => (
                <button 
                  key={spacing.id}
                  className={`sec-n cursor-pointer ${officeCabShelfSpacing === spacing.id ? "on" : ""}`}
                  onClick={() => setOfficeCabShelfSpacing(spacing.id)}
                  style={{ fontSize: "9px", padding: "4px" }}
                >
                  {spacing.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 8. Cabinet Color & Material */}
      <div className="rps">
        <div className="rpt">Cabinet Color &amp; Material</div>
        <div className="size-grid">
          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "4px" }}>Body Color</label>
            <div className="txgrid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
              {[
                { id: "beige", bg: "#BEB4A6", name: "Warm Beige" },
                { id: "sand", bg: "#C5B99A", name: "Sand" },
                { id: "white", bg: "#EFEFED", name: "White" },
                { id: "ivory", bg: "#EEE8D6", name: "Ivory" },
                { id: "light_grey", bg: "#CACAC6", name: "Light Grey" },
                { id: "dark_grey", bg: "#3A3A3C", name: "Dark Grey" },
                { id: "taupe", bg: "#8A8274", name: "Taupe" },
                { id: "black", bg: "#1A1A1C", name: "Black" },
                { id: "walnut_col", bg: "#6B3F1E", name: "Walnut" },
                { id: "oak_col", bg: "#C8A96E", name: "Oak" },
              ].map((col) => (
                <div
                  key={col.id}
                  className={`sw ${officeCabColor === col.id ? "on" : ""}`}
                  style={{ background: col.bg, width: "30px", height: "30px", borderRadius: "6px", cursor: "pointer", border: "2px solid transparent" }}
                  onClick={() => setOfficeCabColor(col.id)}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          <div className="size-row" style={{ marginBottom: "8px" }}>
            <label style={{ marginBottom: "4px" }}>Decorative Back Panel</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
              {[
                { id: "natural_oak", label: "Natural Oak", bg: "#C8A96E" },
                { id: "walnut", label: "Walnut", bg: "#6B3F1E" },
                { id: "white_marble", label: "White Marble", bg: "#F5F5F0" },
                { id: "black_marble", label: "Black Marble", bg: "#1A1A1C" },
                { id: "grey_marble", label: "Grey Marble", bg: "#B0AFAC" },
                { id: "travertine", label: "Travertine", bg: "#D4C4A0" },
              ].map((mat) => (
                <button
                  key={mat.id}
                  className={`sec-n cursor-pointer ${!officeCabAutoSync && officeCabPanelMat === mat.id ? "on" : ""}`}
                  onClick={() => {
                    setOfficeCabPanelMat(mat.id);
                    setOfficeCabAutoSync(false);
                  }}
                  style={{ fontSize: "10.5px", padding: "5px 8px", display: "flex", alignItems: "center", gap: "6px", textAlign: "left", justifyContent: "flex-start" }}
                >
                  <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: mat.bg, border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
                  {mat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="size-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px" }}>
            <button 
              className="sec-n cursor-pointer"
              onClick={() => {
                setOfficeCabPanelMat(officeDeskTopMat);
                triggerNotification("Panel synced to desk top");
              }}
              style={{ fontSize: "11px", padding: "6px" }}
            >
              ↺ Sync to Desk Top
            </button>
            <button 
              className={`sec-n cursor-pointer ${officeCabAutoSync ? "on" : ""}`}
              onClick={() => {
                setOfficeCabAutoSync(!officeCabAutoSync);
                triggerNotification(!officeCabAutoSync ? "Auto sync ON" : "Auto sync OFF");
              }}
              style={{ fontSize: "11px", padding: "6px" }}
            >
              Auto Sync
            </button>
          </div>
        </div>
      </div>

      {/* 9. LED Lighting */}
      <div className="rps">
        <div className="rpt">LED Lighting</div>
        <div className="size-grid">
          <div className="size-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ margin: 0 }}>Shelf LEDs</label>
            <button 
              className={`sec-n cursor-pointer ${officeLedOn ? "on" : ""}`}
              onClick={() => setOfficeLedOn(!officeLedOn)}
              style={{ padding: "4px 10px", fontSize: "11px" }}
            >
              {officeLedOn ? "ON" : "OFF"}
            </button>
          </div>

          {officeLedOn && (
            <>
              <div className="size-row" style={{ marginBottom: "8px" }}>
                <label style={{ marginBottom: "4px" }}>Color Temperature</label>
                <div className="section-btns" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                  {[
                    { id: "warm", label: "Warm" },
                    { id: "neutral", label: "Neutral" },
                    { id: "cool", label: "Cool" }
                  ].map((temp) => (
                    <button
                      key={temp.id}
                      className={`sec-n cursor-pointer ${officeLedColor === temp.id ? "on" : ""}`}
                      onClick={() => setOfficeLedColor(temp.id)}
                      style={{ fontSize: "10px", padding: "4px" }}
                    >
                      {temp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="size-row" style={{ marginBottom: "8px" }}>
                <label>Brightness <span>{Math.round(officeLedBright * 100)}%</span></label>
                <input
                  type="range"
                  className="slider"
                  min="10"
                  max="100"
                  step="5"
                  value={officeLedBright * 100}
                  onChange={(e) => setOfficeLedBright(parseFloat(e.target.value) / 100)}
                />
              </div>

              <div className="size-row">
                <label style={{ marginBottom: "4px" }}>Placement</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>Under Shelf</span>
                    <button 
                      className={`sec-n cursor-pointer ${officeLedUnder ? "on" : ""}`}
                      onClick={() => setOfficeLedUnder(!officeLedUnder)}
                      style={{ padding: "2px 8px", fontSize: "9px" }}
                    >
                      {officeLedUnder ? "ON" : "OFF"}
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>Back of Shelf</span>
                    <button 
                      className={`sec-n cursor-pointer ${officeLedBack ? "on" : ""}`}
                      onClick={() => setOfficeLedBack(!officeLedBack)}
                      style={{ padding: "2px 8px", fontSize: "9px" }}
                    >
                      {officeLedBack ? "ON" : "OFF"}
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--muted)" }}>Top Cove</span>
                    <button 
                      className={`sec-n cursor-pointer ${officeLedTop ? "on" : ""}`}
                      onClick={() => setOfficeLedTop(!officeLedTop)}
                      style={{ padding: "2px 8px", fontSize: "9px" }}
                    >
                      {officeLedTop ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 10. Reset to Default */}
      <div className="rps" style={{ borderBottom: "none" }}>
        <button 
          className="sec-n cursor-pointer"
          onClick={() => {
            setOfficeDeskW(2.4); setOfficeDeskD(1.0); setOfficeDeskH(0.75); setOfficeDeskT(0.06);
            setOfficeDeskTopMat("natural_oak"); setOfficeDeskBaseMat("matte_beige");
            setOfficeDeskDrawer(true); setOfficeDeskDrawerCount(3); setOfficeDeskDrawerSide("left"); setOfficeDeskDrawerStyle("closed");
            setOfficeDeskFileCab(false);
            setOfficeCabW(4.0); setOfficeCabH(2.8); setOfficeCabD(0.40); setOfficeCabSections(3);
            setOfficeCabOpenShelves(3); setOfficeCabLowerDoors(4); setOfficeCabLowerHRatio(0.40);
            setOfficeCabColor("beige"); setOfficeCabPanelMat("natural_oak"); setOfficeCabShelfSpacing("even"); setOfficeCabAutoSync(true);
            setOfficeLedOn(true); setOfficeLedColor("warm"); setOfficeLedBright(0.70);
            setOfficeLedUnder(true); setOfficeLedBack(false); setOfficeLedTop(false);
            triggerNotification("Reset scene to defaults");
          }}
          style={{ width: "100%", padding: "10px", fontSize: "12px", background: "rgba(200,80,80,0.08)", color: "#ee6666", borderColor: "rgba(200,80,80,0.2)" }}
        >
          Reset to Default Settings
        </button>
      </div>

      {/* 11. Estimation & Exports */}
      <div className="rp-summary" style={{ padding: "12px", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)" }}>ESTIMATED COST</span>
          <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--accent)" }}>
            ${parseFloat(calculateEstimatedCost()).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <button
          className="vsave cursor-pointer"
          onClick={() => triggerNotification("Office layout saved to designs list!")}
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
