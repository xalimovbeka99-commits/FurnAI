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
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="text-center mb-12">
          <motion.p variants={fadeUp} custom={0} className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
            Contact
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4">
            Get in Touch
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-muted max-w-lg mx-auto">
            Have a question, feedback, or business inquiry? We would love to hear from you.
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-12 text-center"
            >
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
              <p className="text-sm text-muted mb-6">
                Thank you for reaching out. We will get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-8 py-3 glass hover:bg-white/10 rounded-full text-sm font-medium transition-all"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 md:p-10 space-y-6">
              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors ${
                    errors.name ? "border-red-500" : "border-border"
                  }`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors ${
                    errors.email ? "border-red-500" : "border-border"
                  }`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what you're thinking..."
                  rows={5}
                  className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-accent/50 resize-none transition-colors ${
                    errors.message ? "border-red-500" : "border-border"
                  }`}
                />
                {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full py-4 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-all shadow-lg shadow-accent/20"
              >
                Send Message →
              </motion.button>

              <p className="text-xs text-muted text-center">
                You can also reach us at{" "}
                <span className="text-accent">hello@furniai.com</span>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
