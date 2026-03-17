"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: "✨",
    title: "AI-Powered Design",
    desc: "Describe your vision in plain text and let our AI generate stunning furniture designs instantly.",
  },
  {
    icon: "🎨",
    title: "Full Customization",
    desc: "Fine-tune every dimension, material, color, and style to match your exact requirements.",
  },
  {
    icon: "📐",
    title: "3D Real-Time Preview",
    desc: "See your furniture come to life in an interactive 3D viewer. Rotate, zoom, and inspect every detail.",
  },
  {
    icon: "💾",
    title: "Save & Export",
    desc: "Save your designs, export specifications, and share your creations with the world.",
  },
];

const steps = [
  { num: "01", title: "Describe", desc: "Tell us what you want — a modern wardrobe, a glass coffee table, anything." },
  { num: "02", title: "Customize", desc: "Adjust dimensions, materials, colors, and style to perfection." },
  { num: "03", title: "Preview", desc: "Instantly see a 3D model of your design. Rotate and inspect it from every angle." },
];

const testimonials = [
  { name: "Sarah K.", role: "Interior Designer", quote: "Furni AI has completely transformed how I present concepts to clients. The 3D previews are stunning." },
  { name: "Michael R.", role: "Furniture Maker", quote: "I use the parametric builder daily. It saves me hours of manual sketching and prototyping." },
  { name: "Elena T.", role: "Homeowner", quote: "I designed my entire living room furniture set in under 10 minutes. Absolutely incredible!" },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                AI-Powered Furniture Design
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
            >
              Design Your Dream
              <br />
              <span className="text-accent glow-text">Furniture</span> with AI
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Create custom furniture in seconds with intelligent design tools.
              Real-time 3D preview, infinite customization, zero hassle.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/builder"
                className="px-8 py-4 bg-accent hover:bg-accent-dark text-white font-semibold rounded-full transition-all hover:shadow-xl hover:shadow-accent/25 hover:scale-105 text-sm"
              >
                Start Designing →
              </Link>
              <Link
                href="/gallery"
                className="px-8 py-4 glass hover:bg-white/10 text-white font-medium rounded-full transition-all text-sm"
              >
                View Gallery
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
              Features
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold">
              Everything You Need to Design
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-all group cursor-default"
              >
                <div className="text-3xl mb-4">{feat.icon}</div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <motion.p variants={fadeUp} custom={0} className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
              How it works
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold">
              Three Simple Steps
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <div className="text-6xl font-black text-accent/20 mb-4">{step.num}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
              Testimonials
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-bold">
              Loved by Designers
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="glass rounded-2xl p-8"
              >
                <p className="text-sm text-muted leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-surface">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Create Something Amazing?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted text-lg mb-10 max-w-xl mx-auto">
              Join thousands of designers who use Furni AI to bring their furniture visions to life.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Link
                href="/builder"
                className="inline-flex px-10 py-4 bg-accent hover:bg-accent-dark text-white font-semibold rounded-full transition-all hover:shadow-xl hover:shadow-accent/25 hover:scale-105"
              >
                Start Building for Free →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
