"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import useFurnitureStore from "@/store/furnitureStore";
import { useAuth } from "@/hooks/useAuth";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

export default function DashboardPage() {
  const { savedDesigns, loadDesigns, deleteDesign, renameDesign, loadDesignIntoBuilder, setAuthenticated } = useFurnitureStore();
  const { user, loading: authLoading, supabase } = useAuth();
  const [activeTab, setActiveTab] = useState("designs");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  // Orders State
  const [orders, setOrders] = useState([]);

  // Profile State
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileEmirate, setProfileEmirate] = useState("Dubai");
  const [profileLoading, setProfileLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Sync auth state to store
  useEffect(() => {
    setAuthenticated(!!user);
  }, [user, setAuthenticated]);

  useEffect(() => {
    loadDesigns();

    // Load Orders — from Supabase if authenticated, otherwise localStorage
    const loadOrders = async () => {
      if (user && supabase) {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (!error && data) {
            const formatted = data.map((o) => ({
              orderId: o.order_number,
              type: o.production_spec?.type || "furniture",
              style: o.production_spec?.style || "custom",
              color: o.production_spec?.color || "#8B7355",
              dimensions: o.production_spec?.dimensions || { width: 120, height: 200, depth: 60 },
              totalCost: o.total_price || 0,
              customer: {
                name: o.shipping_address?.name || user.user_metadata?.full_name || "",
                address: o.shipping_address?.address || "",
                emirate: o.shipping_address?.emirate || "Dubai",
              },
              productionTime: 14,
              timestamp: o.created_at,
              status: o.status,
              supabaseId: o.id,
            }));
            setOrders(formatted);
            return;
          }
        } catch (err) {
          console.warn("[dashboard] Cloud orders load failed:", err);
        }
      }

      // Fallback to localStorage
      const savedOrders = JSON.parse(localStorage.getItem("furnai-orders") || "[]");
      savedOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setOrders(savedOrders);
    };

    loadOrders();

    // Load Profile — from Supabase if authenticated, otherwise localStorage
    const loadProfile = async () => {
      if (user && supabase) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!error && data) {
            setProfileName(data.full_name || user.user_metadata?.full_name || "");
            setProfileEmail(user.email || "");
            setProfilePhone(data.phone || "");
            setProfileAddress(data.default_address?.address || "");
            setProfileEmirate(data.default_address?.emirate || "Dubai");
            return;
          }
        } catch (err) {
          console.warn("[dashboard] Cloud profile load failed:", err);
        }
      }

      // Fallback to localStorage
      const savedProfile = JSON.parse(localStorage.getItem("furnai-user") || "{}");
      setProfileName(savedProfile.name || (user?.user_metadata?.full_name) || "");
      setProfileEmail(savedProfile.email || (user?.email) || "");
      setProfilePhone(savedProfile.phone || "");
      setProfileAddress(savedProfile.address || "");
      setProfileEmirate(savedProfile.emirate || "Dubai");
    };

    loadProfile();
  }, [loadDesigns, user, supabase, setAuthenticated]);

  // Toast helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2200);
  };

  const handleRename = (id) => {
    if (editName.trim()) {
      renameDesign(id, editName.trim());
      setEditingId(null);
      setEditName("");
      triggerToast("Design renamed successfully!");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    const updatedProfile = {
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      address: profileAddress,
      emirate: profileEmirate,
    };

    // Always save to localStorage
    localStorage.setItem("furnai-user", JSON.stringify(updatedProfile));

    // If authenticated, also save to Supabase
    if (user && supabase) {
      try {
        await supabase
          .from("profiles")
          .update({
            full_name: profileName,
            phone: profilePhone,
            default_address: {
              address: profileAddress,
              emirate: profileEmirate,
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      } catch (err) {
        console.warn("[dashboard] Cloud profile save failed:", err);
      }
    }

    setProfileLoading(false);
    triggerToast("Profile updated successfully!");
  };

  const handleCancelOrder = async (orderId) => {
    const orderToCancel = orders.find((o) => o.orderId === orderId);
    const updatedOrders = orders.filter((o) => o.orderId !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem("furnai-orders", JSON.stringify(updatedOrders));

    // If authenticated and has Supabase ID, cancel in cloud
    if (user && supabase && orderToCancel?.supabaseId) {
      try {
        await supabase
          .from("orders")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", orderToCancel.supabaseId);
      } catch (err) {
        console.warn("[dashboard] Cloud order cancel failed:", err);
      }
    }

    triggerToast(`Order ${orderId} cancelled.`);
  };

  // Live Status Tracker
  const getOrderStatus = useCallback((timestamp, dbStatus) => {
    // If we have a real status from the database, use it
    if (dbStatus && dbStatus !== "pending") {
      const statusMap = {
        confirmed: { label: "Processing", step: 0, note: "Factory verifying specifications." },
        fabricating: { label: "Fabricating", step: 1, note: "CNC routers cutting panels." },
        quality_check: { label: "Quality Check", step: 2, note: "Panel tolerance inspections." },
        shipped: { label: "Shipped", step: 3, note: "In transit on delivery truck." },
        delivered: { label: "Delivered", step: 4, note: "Successfully delivered." },
        cancelled: { label: "Cancelled", step: -1, note: "Order was cancelled." },
      };
      return statusMap[dbStatus] || statusMap.confirmed;
    }

    // Fallback to time-based simulation
    const elapsedMs = Date.now() - new Date(timestamp).getTime();
    const elapsedMins = elapsedMs / 60000;

    if (elapsedMins < 1.5) {
      return { label: "Processing", step: 0, note: "Factory verifying specifications and optimizing raw sheets nesting." };
    } else if (elapsedMins < 4.0) {
      return { label: "Fabricating", step: 1, note: "CNC routers cutting panels to millimeter precision on the factory floor." };
    } else if (elapsedMins < 7.5) {
      return { label: "Quality Check", step: 2, note: "Applying edge banding and conducting panel tolerance inspections." };
    } else if (elapsedMins < 12.0) {
      return { label: "Shipped", step: 3, note: "Dispatched from warehouse. In transit on delivery truck." };
    } else {
      return { label: "Delivered", step: 4, note: "Order successfully delivered and handed over at your address." };
    }
  }, []);

  const displayName = profileName || user?.user_metadata?.full_name || "Designer";

  return (
    <div className="min-h-screen pt-28 pb-20 bg-img-about relative">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-none" />

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 z-50 px-5 py-2.5 rounded-full bg-accent border border-accent/40 text-black text-xs font-bold shadow-xl shadow-accent/25"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-12 text-left">
          <motion.p variants={fadeUp} custom={0} className="text-accent-light text-xs font-semibold tracking-widest uppercase mb-4">
            Dashboard
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white leading-tight">
            Welcome Back, {displayName}
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted text-sm md:text-base max-w-xl">
            {user
              ? "Access your custom parametric designs, track active factory shipments, and update your delivery locations."
              : "Sign in to sync your designs to the cloud. Your local designs are shown below."}
          </motion.p>
          {!user && !authLoading && (
            <motion.p variants={fadeUp} custom={3} className="mt-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold">
                ⚡ Local mode — designs saved in your browser only
              </span>
            </motion.p>
          )}
        </motion.div>

        {/* Tab Controls */}
        <div className="flex border-b border-white/10 gap-6 mb-10 text-sm overflow-x-auto pb-1">
          {[
            { id: "designs", label: "📐 Saved Designs", count: savedDesigns.length },
            { id: "orders", label: "🏭 Live Orders", count: orders.length },
            { id: "profile", label: "👤 My Profile" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "text-accent-light"
                  : "text-muted hover:text-white"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {tab.label}
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold">
                    {tab.count}
                  </span>
                )}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: SAVED DESIGNS */}
        {activeTab === "designs" && (
          <div>
            {savedDesigns.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-pro border border-white/10 rounded-3xl text-center py-20 max-w-xl mx-auto floating-layer-deep"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                  📐
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">No saved designs yet</h3>
                <p className="text-sm text-muted mb-8 max-w-xs mx-auto">
                  Start creating furniture in the AI Builder and save your configurations here.
                </p>
                <Link href="/builder" className="btn-premium-primary">
                  <span>Open Builder →</span>
                </Link>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {savedDesigns.map((design, i) => (
                  <motion.div
                    key={design.id}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.9 }}
                    variants={fadeUp}
                    custom={i}
                    className="glass rounded-3xl overflow-hidden group border border-white/5 transition-all floating-layer relative"
                  >
                    {/* Visual Preview */}
                    <div
                      className="h-44 flex items-center justify-center relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${design.color}15, ${design.color}35)` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                      <div
                        className="rounded-lg shadow-2xl border border-white/15 transition-transform duration-300 group-hover:scale-110"
                        style={{
                          width: Math.min(design.width * 0.5, 110),
                          height: Math.min(design.height * 0.4, 90),
                          backgroundColor: design.color,
                          opacity: 0.8,
                        }}
                      />
                      {design.supabaseId && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-accent-light text-[9px] uppercase font-bold tracking-wider">
                          ☁ Cloud
                        </span>
                      )}
                    </div>

                    <div className="p-6 relative z-10 bg-black/20 text-left">
                      {editingId === design.id ? (
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRename(design.id)}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent"
                            autoFocus
                          />
                          <button onClick={() => handleRename(design.id)} className="text-accent-light text-xs font-semibold uppercase tracking-wider cursor-pointer">
                            Save
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-semibold text-base mb-1.5 text-white group-hover:text-accent-light transition-colors">{design.name}</h3>
                      )}

                      <p className="text-xs text-muted mb-1 font-medium">
                        {design.width} × {design.height} × {design.depth} cm
                      </p>
                      <p className="text-xs text-muted mb-6 capitalize">
                        {design.type} · {design.style} · {design.material}
                      </p>

                      <div className="flex gap-2">
                        <Link
                          href="/builder"
                          onClick={() => loadDesignIntoBuilder(design)}
                          className="flex-1 py-2 text-center bg-accent/15 border border-accent/25 text-accent-light text-xs font-semibold rounded-xl hover:bg-accent/25 transition-all hover:scale-[1.03]"
                        >
                          Open
                        </Link>
                        <button
                          onClick={() => {
                            setEditingId(design.id);
                            setEditName(design.name);
                          }}
                          className="flex-1 py-2 bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-xl hover:bg-white/10 hover:border-white/20 transition-all hover:scale-[1.03] cursor-pointer"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => {
                            deleteDesign(design.id);
                            triggerToast("Design deleted.");
                          }}
                          className="flex-1 py-2 bg-white/5 border border-white/10 text-xs font-semibold rounded-xl hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all hover:scale-[1.03] cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE ORDERS TRACKING */}
        {activeTab === "orders" && (
          <div>
            {orders.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-pro border border-white/10 rounded-3xl text-center py-20 max-w-xl mx-auto floating-layer-deep"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                  🏭
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">No active orders</h3>
                <p className="text-sm text-muted mb-8 max-w-xs mx-auto">
                  Build your furniture design, click &quot;Send to Production&quot;, and submit an order to our UAE factory floor.
                </p>
                <Link href="/builder" className="btn-premium-primary">
                  <span>Start Designing →</span>
                </Link>
              </motion.div>
            )}

            <div className="space-y-6">
              <AnimatePresence>
                {orders.map((order) => {
                  const status = getOrderStatus(order.timestamp, order.status);
                  if (status.step === -1) return null; // Hide cancelled orders
                  return (
                    <motion.div
                      key={order.orderId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass rounded-3xl p-6 md:p-8 border border-white/5 text-left floating-layer relative bg-black/20"
                    >
                      {/* Top Row: Order Details */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-white">{order.orderId}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/25 text-accent-light text-[10px] uppercase font-bold tracking-wider animate-pulse">
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted mt-1">
                            Placed on {new Date(order.timestamp).toLocaleString()} · UAE Factory Line
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-muted">Billed Amount</p>
                          <p className="text-xl font-bold text-accent-light">{order.totalCost} AED</p>
                        </div>
                      </div>

                      {/* Middle Grid: Specs & Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">Furniture Details</p>
                          <p className="font-semibold text-white capitalize text-sm">{order.type} ({order.style} Style)</p>
                          <p className="text-xs text-muted mt-1 font-medium capitalize">Color: {order.color}</p>
                          <p className="text-xs text-muted font-medium">Dimensions: {order.dimensions.width}x{order.dimensions.height}x{order.dimensions.depth} cm</p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">Delivery Address</p>
                          <p className="font-semibold text-white text-sm">{order.customer.name}</p>
                          <p className="text-xs text-muted mt-1 leading-relaxed font-medium">
                            {order.customer.address}, {order.customer.emirate}, UAE
                          </p>
                        </div>

                        <div className="flex flex-col justify-between items-start">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-muted mb-1.5 font-bold">Timeline</p>
                            <p className="font-semibold text-white text-sm">Est. Completion: {order.productionTime} days</p>
                            <p className="text-xs text-muted mt-1 font-medium">Dynamic status auto-refreshes</p>
                          </div>
                          {status.step === 0 && (
                            <button
                              onClick={() => handleCancelOrder(order.orderId)}
                              className="mt-3 px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 hover:border-red-500/40 text-red-400 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Tracker Visual Map */}
                      <div className="bg-black/35 rounded-2xl p-5 border border-white/5">
                        <p className="text-xs text-white/50 mb-4 italic">
                          Status note: {status.note}
                        </p>

                        <div className="relative flex items-center justify-between mt-6">
                          {/* Progress bar background line */}
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 z-0" />
                          {/* Active highlight line */}
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-accent transition-all duration-1000 z-0"
                            style={{ width: `${(status.step / 4) * 100}%` }}
                          />

                          {[
                            { step: 0, label: "Processing", icon: "📑" },
                            { step: 1, label: "Fabricating", icon: "⚙️" },
                            { step: 2, label: "QC Checked", icon: "🔍" },
                            { step: 3, label: "Shipped", icon: "🚚" },
                            { step: 4, label: "Delivered", icon: "🏠" },
                          ].map((node) => {
                            const isPast = status.step >= node.step;
                            const isCurrent = status.step === node.step;

                            return (
                              <div key={node.step} className="flex flex-col items-center relative z-10">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-500 border ${
                                    isCurrent
                                      ? "bg-black border-accent text-accent scale-110 shadow-lg shadow-accent/25"
                                      : isPast
                                      ? "bg-accent border-accent text-black"
                                      : "bg-neutral-900 border-white/10 text-white/40"
                                  }`}
                                >
                                  {node.icon}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 transition-colors duration-500 ${
                                  isCurrent
                                    ? "text-accent-light"
                                    : isPast
                                    ? "text-white/80"
                                    : "text-white/20"
                                }`}>
                                  {node.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE MANAGEMENT */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 max-w-2xl mx-auto border border-white/10 text-left bg-black/20"
          >
            <h3 className="text-xl font-bold mb-2 text-white">Profile Details</h3>
            <p className="text-xs text-muted mb-6">
              {user
                ? "Your profile syncs to the cloud automatically."
                : "Update your personal contact details and default UAE delivery locations."}
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted block mb-1.5 pl-1 uppercase font-semibold">Display Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-accent text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5 pl-1 uppercase font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={!!user}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-accent text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted block mb-1.5 pl-1 uppercase font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-accent text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5 pl-1 uppercase font-semibold">Emirate (UAE)</label>
                  <select
                    value={profileEmirate}
                    onChange={(e) => setProfileEmirate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/15 text-white focus:outline-none focus:border-accent text-sm transition-all"
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
                <label className="text-xs text-muted block mb-1.5 pl-1 uppercase font-semibold">Default Delivery Address</label>
                <textarea
                  required
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="Street, Building, Apartment, Community Name"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/35 focus:outline-none focus:border-accent text-sm transition-all resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-black font-bold transition-all cursor-pointer text-xs shadow-md shadow-accent/25 hover:scale-[1.02] disabled:opacity-60"
                >
                  {profileLoading ? "Saving..." : "Save Profile Settings"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
