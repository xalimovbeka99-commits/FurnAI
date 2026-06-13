"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AuthModal — Sign In / Sign Up modal for Supabase authentication.
 *
 * @param {{ isOpen: boolean, onClose: () => void, onAuth: (email: string, password: string, mode: string, fullName?: string) => Promise<{error: Error|null}> }} props
 */
export default function AuthModal({ isOpen, onClose, onAuth }) {
  const [mode, setMode] = useState("signin"); // "signin" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await onAuth(email, password, mode, fullName);

      if (result?.error) {
        setError(result.error.message || "Authentication failed");
      } else if (mode === "signup") {
        setSuccess("Check your email to confirm your account!");
        setEmail("");
        setPassword("");
        setFullName("");
      } else {
        // Successful sign in — close modal
        onClose();
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setError("");
    setSuccess("");
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass-pro rounded-3xl border border-white/10 p-8 shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-muted hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              ✕
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/25">
                F
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Furni<span className="gradient-text-warm font-extrabold">AI</span>
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-muted mb-6">
              {mode === "signin"
                ? "Sign in to access your saved designs and orders."
                : "Join FurnAI to save designs and track orders."}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-black/45 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-black/45 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                  className="w-full bg-black/45 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-sm text-red-400">
                  ⚠ {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-3 text-sm text-green-400">
                  ✓ {success}
                </div>
              )}

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full btn-premium-primary py-3.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>
                  {loading
                    ? "Please wait..."
                    : mode === "signin"
                    ? "Sign In →"
                    : "Create Account →"}
                </span>
              </motion.button>
            </form>

            {/* Switch mode */}
            <p className="text-sm text-muted text-center mt-6">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={switchMode}
                className="text-accent-light font-semibold hover:underline cursor-pointer"
              >
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
