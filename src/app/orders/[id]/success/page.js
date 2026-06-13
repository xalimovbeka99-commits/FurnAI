"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = params?.id; // This is the order ID (UUID)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      // 1. Try to fetch from Supabase if authenticated
      if (user && supabase) {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

          if (!error && data) {
            setOrder({
              orderNumber: data.order_number,
              type: data.production_spec?.design?.type || "furniture",
              style: data.production_spec?.design?.style || "custom",
              color: data.production_spec?.design?.color || "wood",
              dimensions: data.production_spec?.design?.dimensions || { width: 120, height: 200, depth: 60 },
              totalCost: data.total_price || 0,
              customer: {
                name: data.shipping_address?.name || "",
                email: data.shipping_address?.email || "",
                phone: data.shipping_address?.phone || "",
                address: data.shipping_address?.address || "",
                emirate: data.shipping_address?.emirate || "Dubai",
              },
              productionTime: data.production_spec?.productionTime || 14,
              status: data.status,
              createdAt: data.created_at,
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("[success] Supabase order load failed:", err);
        }
      }

      // 2. Fallback to localStorage if not found or not authenticated
      const savedOrders = JSON.parse(localStorage.getItem("furnai-orders") || "[]");
      const localOrder = savedOrders.find((o) => o.supabaseId === orderId || o.orderId === orderId);

      if (localOrder) {
        setOrder({
          orderNumber: localOrder.orderId,
          type: localOrder.type,
          style: localOrder.style,
          color: localOrder.color,
          dimensions: localOrder.dimensions,
          totalCost: localOrder.totalCost,
          customer: localOrder.customer,
          productionTime: localOrder.productionTime,
          status: localOrder.status || "confirmed",
          createdAt: localOrder.timestamp,
        });
      }

      setLoading(false);
    };

    fetchOrder();
  }, [orderId, user, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/20 via-black to-indigo-950/20 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
          <p className="text-sm font-semibold text-muted uppercase tracking-wider">Loading Order Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-img-materials relative text-white">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-strong rounded-3xl p-8 border border-white/10 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Decorative glowing gradient */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

          {/* Success Check Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg shadow-emerald-500/10"
          >
            ✓
          </motion.div>

          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Payment Successful!</h1>
          <p className="text-sm text-accent-light font-semibold mb-6 uppercase tracking-wider">
            Order: {order?.orderNumber || "FURNI-ORDER"}
          </p>

          <div className="max-w-md mx-auto bg-black/40 rounded-2xl p-6 border border-white/5 text-left text-sm space-y-4 mb-8">
            <p className="text-muted leading-relaxed">
              Thank you for choosing FurniAI. Your custom <span className="text-white font-semibold capitalize">{order?.type}</span> has been sent to our UAE factory floor for fabrication.
            </p>
            
            <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs text-muted">
              <div className="flex justify-between">
                <span>Customer Name:</span>
                <span className="text-white font-medium">{order?.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Emirate:</span>
                <span className="text-white font-medium">{order?.customer?.emirate}, UAE</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Production:</span>
                <span className="text-white font-medium">{order?.productionTime || 14} days</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-white/5 pt-2.5">
                <span>Amount Paid:</span>
                <span className="text-accent-light text-sm font-bold">{order?.totalCost || 0} AED</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted mb-8 max-w-sm mx-auto leading-relaxed">
            We have generated factory cutting specifications (BAZIS XML, G-code packages) and sent them directly to production. You can track your order status live in your dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Link href="/dashboard" className="flex-1">
              <span className="block w-full px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/20 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                Go to Dashboard
              </span>
            </Link>
            <Link href="/builder" className="flex-1">
              <span className="block w-full px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                Back to Builder
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
