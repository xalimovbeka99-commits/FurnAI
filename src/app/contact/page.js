"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.message.trim()) errs.message = "Message is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    // Mock submit
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-img-about relative">
      {/* Background opacity overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="text-center mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-accent-light text-xs font-semibold tracking-widest uppercase mb-4">
            Contact
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white leading-tight">
            Get in Touch
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted max-w-lg mx-auto">
            Have a question, feedback, or business inquiry? We would love to hear from you.
          </motion.p>
        </motion.div>

        {/* Form - styled as a floating console */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-pro rounded-3xl p-12 text-center border border-white/10 floating-layer-deep"
            >
              <div className="text-5xl mb-6 text-accent-light">✓</div>
              <h3 className="text-2xl font-bold mb-3 text-white">Message Sent!</h3>
              <p className="text-sm text-muted mb-8 max-w-md mx-auto">
                Thank you for reaching out. We will get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-premium-secondary"
              >
                <span>Send Another Message</span>
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-pro rounded-3xl p-8 md:p-12 space-y-6 border border-white/10 floating-layer">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2.5 block">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className={`w-full bg-black/45 backdrop-blur-md border rounded-2xl px-4 py-3 text-sm text-white placeholder:text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300 ${
                    errors.name ? "border-red-500/60" : "border-white/10"
                  }`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2.5 block">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className={`w-full bg-black/45 backdrop-blur-md border rounded-2xl px-4 py-3 text-sm text-white placeholder:text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300 ${
                    errors.email ? "border-red-500/60" : "border-white/10"
                  }`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2.5 block">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what you're thinking..."
                  rows={5}
                  className={`w-full bg-black/45 backdrop-blur-md border rounded-2xl px-4 py-3 text-sm text-white placeholder:text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all duration-300 ${
                    errors.message ? "border-red-500/60" : "border-white/10"
                  }`}
                />
                {errors.message && <p className="text-red-400 text-xs mt-1.5">{errors.message}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full btn-premium-primary py-4 cursor-pointer"
              >
                <span>Send Message →</span>
              </motion.button>

              <p className="text-xs text-muted text-center pt-2">
                You can also reach us at{" "}
                <span className="text-accent-light font-medium">hello@furniai.com</span>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
