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
    <div className="min-h-screen pt-32 pb-20 px-4 gradient-bg-hero">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 pulse-glow">
            <span className="text-xs font-medium text-emerald-400">100% Free & Open</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Completely <span className="gradient-text">Free</span>
          </h1>
          <p className="text-muted max-w-lg mx-auto">
            Furni AI is a free platform. No hidden fees, no subscriptions, no limits.
            Design, export, and build your furniture for free.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl p-8 relative ${
                plan.highlight
                  ? "bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent border-2 border-indigo-500/30"
                  : "glass border border-border card-glow"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 btn-gradient text-white text-xs font-bold rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-xs text-muted mb-4">{plan.description}</p>

              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                <span className="text-sm text-muted ml-1">/{plan.period}</span>
              </div>

              <Link href="/builder">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-3 rounded-xl font-medium transition-all text-sm mb-6 ${
                    plan.highlight
                      ? "btn-gradient text-white"
                      : "glass hover:bg-white/10"
                  }`}
                >
                  Start Designing Free
                </motion.button>
              </Link>

              <ul className="space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-accent-light mt-0.5">✓</span>
                    <span className="text-muted">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center mb-8">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Why is it free?", a: "Furni AI is an open platform. We believe design tools should be accessible to everyone — hobbyists, students, small workshops, and factories alike." },
              { q: "Is the factory export accurate enough for production?", a: "Yes. The factory export generates mm-precision component breakdowns, hardware lists, edge banding specs, and assembly instructions that a skilled carpenter or factory can work from." },
              { q: "Do I need an OpenAI API key?", a: "No. Furni AI works without one using smart keyword-based generation. Add your OpenAI key in .env.local for enhanced AI-powered design suggestions." },
              { q: "Can I deploy this for my business?", a: "Absolutely. Furni AI is designed to be easily deployed on Vercel or any Node.js hosting. Perfect for furniture workshops and factories." },
            ].map((faq, i) => (
              <div key={i} className="glass rounded-xl p-5 card-glow">
                <h3 className="text-sm font-semibold mb-2">{faq.q}</h3>
                <p className="text-xs text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
