"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatSpecAsPDF, formatSpecAsJSON } from "@/lib/productionSpec";

export default function ProductionModal({ spec, isOpen, onClose }) {
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

  const handleOrderFromFactory = () => {
    // Phase Three: Order workflow
    const orderData = {
      designId: spec.id,
      type: spec.design.type,
      dimensions: spec.design.dimensions,
      color: spec.design.color,
      totalCost: spec.costs.total,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage for now (Phase Four will add database)
    const orders = JSON.parse(localStorage.getItem("furnai-orders") || "[]");
    orders.push(orderData);
    localStorage.setItem("furnai-orders", JSON.stringify(orders));

    // Show confirmation
    alert(
      `Order ${spec.id} created!\n\nTotal: ${spec.costs.total} AED\nProduction Time: ${spec.productionTime} days\n\nCheck your email for confirmation.`
    );
    onClose();
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
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-white">Production Specification</h2>
                <p className="text-sm text-muted">Order ID: {spec.id}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-muted hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Design Summary */}
            <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/35 rounded-xl p-3 border border-white/5">
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

              <div className="bg-black/35 rounded-xl p-3 border border-white/5">
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
                    <span className="text-muted">DXF Export</span>
                    <span className="text-green-400 font-semibold">✓ Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Components Summary */}
            <div className="bg-black/20 rounded-xl p-4 mb-6 border border-white/10 max-h-40 overflow-y-auto">
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

            {/* Hardware List */}
            <div className="bg-black/20 rounded-xl p-4 mb-6 border border-white/10 max-h-32 overflow-y-auto">
              <p className="text-xs uppercase tracking-wider text-muted mb-3">Hardware & Materials</p>
              <div className="space-y-2 text-xs">
                {spec.hardware.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-muted">
                    <span>
                      <span className="text-white font-medium">{item.description}</span> ({item.partNumber})
                    </span>
                    <span className="text-right">
                      {item.quantity}× @ {item.unitPrice} AED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold transition-all cursor-pointer"
              >
                📄 Export as Text
              </button>
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold transition-all cursor-pointer"
              >
                ⚙️ Export as JSON
              </button>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleOrderFromFactory}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/20 text-black font-bold transition-all cursor-pointer"
              >
                🏭 Order from Factory
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Info Footer */}
            <p className="text-xs text-muted text-center mt-4">
              Production specs are CNC-ready. Download and share with your manufacturer, or place an order with FurniAI Factory.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
