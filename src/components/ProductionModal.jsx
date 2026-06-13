"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatSpecAsPDF, formatSpecAsJSON, formatSpecAsXML } from "@/lib/productionSpec";
import JSZip from "jszip";
import { useAuth } from "@/hooks/useAuth";

export default function ProductionModal({ spec, isOpen, onClose }) {
  const { user, supabase } = useAuth();
  const [view, setView] = useState("spec"); // "spec", "checkout", "success"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emirate, setEmirate] = useState("Dubai");
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Prefill user info if logged in
  useEffect(() => {
    if (user && isOpen) {
      setName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      
      const loadProfileData = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!error && data) {
            if (data.full_name) setName(data.full_name);
            if (data.phone) setPhone(data.phone);
            if (data.default_address?.address) setAddress(data.default_address.address);
            if (data.default_address?.emirate) setEmirate(data.default_address.emirate);
          }
        } catch (err) {
          console.warn("[ProductionModal] Failed to load profile for checkout:", err);
        }
      };
      
      loadProfileData();
    }
  }, [user, isOpen, supabase]);

  if (!spec) return null;

  const handleExportPDF = () => {
    const pdfText = formatSpecAsPDF(spec);
    const blob = new Blob([pdfText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${spec.id}-production-spec.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonText = formatSpecAsJSON(spec);
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${spec.id}-spec.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportZIP = async () => {
    try {
      const zip = new JSZip();
      
      // 1. PDF / Text card
      const pdfText = formatSpecAsPDF(spec);
      zip.file(`${spec.id}-production-card.txt`, pdfText);
      
      // 2. JSON spec
      const jsonText = formatSpecAsJSON(spec);
      zip.file(`${spec.id}-spec.json`, jsonText);
      
      // 3. XML spec for BAZIS
      const xmlText = formatSpecAsXML(spec);
      zip.file(`${spec.id}-bazis-integration.xml`, xmlText);
      
      // 4. G-Code program files for each panel component
      const gcodeFolder = zip.folder("gcode");
      spec.components.forEach((comp) => {
        if (comp.unit !== "pcs" && comp.width && comp.height) {
          const cleanName = comp.name.replace(/\s+/g, "_").toLowerCase();
          const gcode = `; CNC Toolpath for panel: ${comp.name}
; Dimensions: ${comp.width}mm W x ${comp.height}mm H x ${comp.thickness || 18}mm T
G90 ; Absolute coordinates
G21 ; Units: Millimeters
G00 Z15.0000 ; Lift Z
G00 X0.0000 Y0.0000 ; Rapid to origin
M03 S12000 ; Spindle ON (12000 RPM)
G01 Z-18.0000 F1200 ; Cut to panel depth
; Cut geometry path...
G01 X${comp.width}.0000 F2400
G01 Y${comp.height}.0000
G01 X0.0000
G01 Y0.0000
G00 Z15.0000 ; Lift tool
M05 ; Spindle OFF
M30 ; Program End`;
          gcodeFolder.file(`${cleanName}.nc`, gcode);
        }
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${spec.id}-production-package.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP packaging error:", err);
      alert("Failed to generate ZIP package. Please try individual downloads.");
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !address) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const orderNum = `FURNI-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    // A. If logged in, perform real DB insert + Stripe checkout redirect
    if (user && supabase) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            design_id: (spec.id && spec.id.length === 36) ? spec.id : null,
            order_number: orderNum,
            status: "pending",
            production_spec: spec,
            total_price: spec.costs.total,
            currency: "AED",
            shipping_address: { name, email, phone, address, emirate },
          })
          .select()
          .single();

        if (error) throw error;

        // Create Stripe checkout session
        const response = await fetch("/api/payments/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            designId: spec.id,
            orderId: data.id,
            amount: Math.round(spec.costs.total * 100), // in fils
            currency: "AED",
            customerEmail: email,
          }),
        });

        const resData = await response.json();
        
        if (response.ok && resData.sessionUrl) {
          const localOrder = {
            orderId: orderNum,
            designId: spec.id,
            customer: { name, email, phone, address, emirate },
            type: spec.design.type,
            dimensions: spec.design.dimensions,
            color: spec.design.color,
            totalCost: spec.costs.total,
            productionTime: spec.productionTime,
            status: "pending",
            timestamp: new Date().toISOString(),
            supabaseId: data.id,
          };
          const orders = JSON.parse(localStorage.getItem("furnai-orders") || "[]");
          orders.push(localOrder);
          localStorage.setItem("furnai-orders", JSON.stringify(orders));

          // Redirect to Stripe checkout page
          window.location.href = resData.sessionUrl;
          return;
        } else {
          throw new Error(resData.error || "Failed to initiate Stripe checkout");
        }
      } catch (err) {
        console.error("Order checkout failed:", err);
        setErrorMessage(err.message || "Failed to process checkout. Please try again.");
        setSubmitting(false);
        return;
      }
    }

    // B. If not logged in, fall back to local simulated workflow
    const orderData = {
      orderId: orderNum,
      designId: spec.id,
      customer: { name, email, phone, address, emirate },
      type: spec.design.type,
      dimensions: spec.design.dimensions,
      color: spec.design.color,
      totalCost: spec.costs.total,
      productionTime: spec.productionTime,
      status: "confirmed",
      timestamp: new Date().toISOString(),
    };

    const orders = JSON.parse(localStorage.getItem("furnai-orders") || "[]");
    orders.push(orderData);
    localStorage.setItem("furnai-orders", JSON.stringify(orders));

    setCreatedOrderId(orderNum);
    setSubmitting(false);
    setView("success");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.93, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-3xl w-full max-w-2xl p-8 border border-white/15 floating-layer-deep my-8"
          >
            {/* VIEW 1: SPECIFICATION SUMMARY */}
            {view === "spec" && (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2 text-white">Production Specification</h2>
                    <p className="text-sm text-muted">Design ID: {spec.id}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-muted hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted mb-1">Type</p>
                      <p className="font-semibold text-white capitalize">{spec.design.type}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted mb-1">Style</p>
                      <p className="font-semibold text-white capitalize">{spec.design.style}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted mb-1">Material</p>
                      <p className="font-semibold text-white capitalize">{spec.design.color}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted mb-1">Dimensions</p>
                      <p className="font-semibold text-white text-sm">
                        {spec.design.dimensions.width} × {spec.design.dimensions.height} × {spec.design.dimensions.depth} cm
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/35 rounded-xl p-4 border border-white/5 text-left">
                    <p className="text-xs uppercase tracking-wider text-muted mb-2">Cost Breakdown</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted">Material</span>
                        <span className="text-white font-semibold">{spec.costs.material} AED</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Hardware</span>
                        <span className="text-white font-semibold">{spec.costs.hardware} AED</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Labor</span>
                        <span className="text-white font-semibold">{spec.costs.labor} AED</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Delivery</span>
                        <span className="text-white font-semibold">{spec.costs.delivery} AED</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                        <span className="font-semibold text-accent-light">TOTAL</span>
                        <span className="text-accent-light font-bold text-lg">{spec.costs.total} AED</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/35 rounded-xl p-4 border border-white/5 text-left">
                    <p className="text-xs uppercase tracking-wider text-muted mb-2">Production Details</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted">Components</span>
                        <span className="text-white font-semibold">{spec.components.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Est. Time</span>
                        <span className="text-white font-semibold">{spec.productionTime} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">CNC Ready</span>
                        <span className="text-green-400 font-semibold">✓ Yes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">BAZIS Integration</span>
                        <span className="text-green-400 font-semibold">✓ Ready</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-4 mb-6 border border-white/10 max-h-40 overflow-y-auto text-left">
                  <p className="text-xs uppercase tracking-wider text-muted mb-3">Component Breakdown</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {spec.components.slice(0, 10).map((comp, idx) => (
                      <div key={idx} className="text-muted">
                        <span className="text-white font-medium">{comp.name}</span>
                        {comp.unit ? ` (${comp.quantity} ${comp.unit})` : ` — Qty: ${comp.quantity}`}
                      </div>
                    ))}
                    {spec.components.length > 10 && (
                      <div className="text-muted col-span-2">
                        ... and {spec.components.length - 10} more components
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    📄 Text Spec
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    ⚙️ JSON Spec
                  </button>
                  <button
                    onClick={handleExportZIP}
                    className="px-4 py-2.5 rounded-lg bg-accent/10 hover:bg-accent/25 border border-accent/30 text-accent-light text-xs font-bold transition-all cursor-pointer"
                  >
                    📦 CNC ZIP Package
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setView("checkout")}
                    className="flex-1 px-6 py-3.5 rounded-lg bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/20 text-black font-bold transition-all cursor-pointer text-sm"
                  >
                    🏭 Order from UAE Factory
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold transition-all cursor-pointer text-sm"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {/* VIEW 2: UAE FACTORY CHECKOUT FORM */}
            {view === "checkout" && (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2 text-white">Factory Order Checkout</h2>
                    <p className="text-sm text-muted">FURNI UAE Production Line</p>
                  </div>
                  <button
                    onClick={() => setView("spec")}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-muted hover:text-white cursor-pointer"
                  >
                    ←
                  </button>
                </div>

                <form onSubmit={handleOrderSubmit} className="space-y-4 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted block mb-1.5 pl-1 uppercase font-semibold">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-accent/50 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1.5 pl-1 uppercase font-semibold">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-accent/50 text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted block mb-1.5 pl-1 uppercase font-semibold">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+971 50 123 4567"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-accent/50 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1.5 pl-1 uppercase font-semibold">Emirate (UAE) *</label>
                      <select
                        value={emirate}
                        onChange={(e) => setEmirate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/15 text-white focus:outline-none focus:border-accent/50 text-sm transition-all"
                      >
                        <option value="Dubai">Dubai</option>
                        <option value="Abu Dhabi">Abu Dhabi</option>
                        <option value="Sharjah">Sharjah</option>
                        <option value="Ajman">Ajman</option>
                        <option value="Umm Al Quwain">Umm Al Quwain</option>
                        <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                        <option value="Fujairah">Fujairah</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted block mb-1.5 pl-1 uppercase font-semibold">Delivery Address *</label>
                    <textarea
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, Building, Apartment, Community Name"
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-accent/50 text-sm transition-all resize-none"
                    />
                  </div>

                  <div className="bg-black/35 rounded-2xl p-4 border border-white/5 text-sm mt-6">
                    <div className="flex justify-between font-semibold text-white mb-1">
                      <span>Total Price:</span>
                      <span className="text-accent-light">{spec.costs.total} AED</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted">
                      <span>Estimated Production & Delivery:</span>
                      <span>{spec.productionTime} days (UAE wide)</span>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-semibold mt-4">
                      ⚠️ {errorMessage}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/20 text-black font-bold transition-all cursor-pointer text-sm disabled:opacity-50"
                    >
                      {submitting ? "Redirecting to Payment..." : "Confirm & Place Order"}
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setView("spec")}
                      className="flex-1 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold transition-all cursor-pointer text-sm disabled:opacity-50"
                    >
                      Back
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* VIEW 3: SUCCESS CONFIRMATION */}
            {view === "success" && (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg shadow-green-500/5">
                  ✓
                </div>
                
                <h2 className="text-3xl font-bold mb-2 text-white">Order Confirmed!</h2>
                <p className="text-sm text-accent-light font-semibold mb-6">Order ID: {createdOrderId}</p>
                
                <div className="max-w-md mx-auto bg-white/5 rounded-2xl p-6 border border-white/10 text-left text-sm space-y-3 mb-8">
                  <p className="text-muted leading-relaxed">
                    Thank you <span className="text-white font-semibold">{name}</span>. Your custom {spec.design.type} has been sent to our UAE factory floor.
                  </p>
                  <div className="border-t border-white/10 pt-3 mt-3 text-xs space-y-2 text-muted">
                    <div className="flex justify-between">
                      <span>Delivery To:</span>
                      <span className="text-white">{emirate}, UAE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Duration:</span>
                      <span className="text-white">{spec.productionTime} days</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Amount Billed:</span>
                      <span className="text-accent-light">{spec.costs.total} AED</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted mb-8 max-w-sm mx-auto">
                  A confirmation email with detailed BAZIS XML, cutting patterns, and assembly instructions has been sent to <span className="text-white">{email}</span>.
                </p>

                <div className="flex gap-3 justify-center max-w-xs mx-auto">
                  <button
                    onClick={() => {
                      onClose();
                      setView("spec");
                    }}
                    className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-accent to-accent-light text-black font-bold transition-all cursor-pointer text-sm shadow-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Info Footer */}
            {view !== "success" && (
              <p className="text-xs text-muted text-center mt-4">
                Production specs are CNC-ready. Download and share with your manufacturer, or place an order with FurniAI Factory.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
