"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    highlight: false,
    description: "Everything you need to start designing",
    features: [
      "Unlimited furniture designs",
      "AI-powered generation",
      "5 furniture types",
      "Real-time 3D preview",
      "Save up to 10 designs",
      "Basic export (JSON)",
    ],
  },
  {
    name: "Free Pro",
    price: "$0",
    period: "forever",
    highlight: true,
    description: "Full access to every feature — no catch",
    badge: "EVERYTHING FREE",
    features: [
      "Everything in Free",
      "Factory-ready export system",
      "Component breakdown (mm precision)",
      "Hardware & material specs",
      "Assembly instructions",
      "Kitchen design system",
      "Unlimited saved designs",
      "OpenAI integration support",
    ],
  },
  {
    name: "Enterprise",
    price: "$0",
    period: "self-hosted",
    highlight: false,
    description: "Deploy Furni AI for your team or factory",
    features: [
      "Everything in Free Pro",
      "Self-hosted deployment",
      "Custom AI model integration",
      "Team collaboration (coming soon)",
      "Custom material library",
      "Priority community support",
      "White-label option",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 bg-img-materials relative">
      {/* Background opacity layer */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 pulse-glow">
            <span className="text-xs font-semibold text-emerald-400">100% Free & Open</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">
            Completely <span className="gradient-text-warm font-extrabold">Free</span>
          </h1>
          <p className="text-muted max-w-lg mx-auto leading-relaxed text-sm md:text-base">
            Furni AI is a free platform. No hidden fees, no subscriptions, no limits.
            Design, export, and build your furniture for free.
          </p>
        </motion.div>

        {/* Plans - redesigned as floating cards of varying depths */}
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`rounded-3xl p-8 relative border transition-all duration-500 ${
                plan.highlight
                  ? "bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-black/50 border-2 border-cyan-500/50 floating-layer-deep scale-105 z-10"
                  : "glass border-white/5 floating-layer hover:bg-white/[0.08]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold rounded-full border border-white/10 shadow-lg tracking-wider uppercase">
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold mb-1 text-white">{plan.name}</h3>
              <p className="text-xs text-muted mb-6">{plan.description}</p>

              <div className="flex items-baseline mb-6 border-b border-white/10 pb-6">
                <span className="text-5xl font-extrabold gradient-text-warm">{plan.price}</span>
                <span className="text-xs text-muted ml-1.5">/{plan.period}</span>
              </div>

              <Link href="/builder" className="block w-full mb-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-center cursor-pointer ${
                    plan.highlight
                      ? "btn-premium-primary"
                      : "btn-premium-secondary"
                  }`}
                >
                  <span>Start Designing Free</span>
                </motion.div>
              </Link>

              <ul className="space-y-4">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs">
                    <span className="text-accent-light mt-0.5 font-bold">✓</span>
                    <span className="text-muted leading-normal">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* FAQ - styled as floating cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-28 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-10 text-white tracking-tight">FAQ</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: "Why is it free?", a: "Furni AI is an open platform. We believe design tools should be accessible to everyone — hobbyists, students, small workshops, and factories alike." },
              { q: "Is the factory export accurate enough for production?", a: "Yes. The factory export generates mm-precision component breakdowns, hardware lists, edge banding specs, and assembly instructions that a skilled carpenter or factory can work from." },
              { q: "Do I need an OpenAI API key?", a: "No. Furni AI works without one using smart keyword-based generation. Add your OpenAI key in .env.local for enhanced AI-powered design suggestions." },
              { q: "Can I deploy this for my business?", a: "Absolutely. Furni AI is designed to be easily deployed on Vercel or any Node.js hosting. Perfect for furniture workshops and factories." },
            ].map((faq, i) => (
              <div key={i} className="glass rounded-2xl p-6 border border-white/5 floating-layer hover:bg-white/[0.08]">
                <h3 className="text-sm font-semibold mb-2.5 text-white">{faq.q}</h3>
                <p className="text-xs text-muted leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
