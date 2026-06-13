"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderCancelPage() {
  const params = useParams();
  const orderId = params?.id;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-img-materials relative text-white">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-strong rounded-3xl p-8 border border-white/10 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Decorative glowing gradient */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-red-500/5 blur-[100px] pointer-events-none" />

          {/* Warning Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg shadow-red-500/10 font-bold"
          >
            !
          </motion.div>

          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Payment Cancelled</h1>
          <p className="text-sm text-red-400 font-semibold mb-6 uppercase tracking-wider">
            Order Reference: {orderId || "FURNI-ORDER"}
          </p>

          <div className="max-w-md mx-auto bg-black/40 rounded-2xl p-6 border border-white/5 text-left text-sm space-y-3 mb-8">
            <p className="text-muted leading-relaxed text-center">
              Your payment session was cancelled. No charges were made to your account.
            </p>
            <p className="text-xs text-muted text-center leading-relaxed">
              If you experienced an issue with payment, you can try placing the order again from the Builder or review your pending orders inside your dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Link href="/builder" className="flex-1">
              <span className="block w-full px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover:shadow-accent/20 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                Return to Builder
              </span>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <span className="block w-full px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                Go to Dashboard
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
