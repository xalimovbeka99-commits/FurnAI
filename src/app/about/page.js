"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const values = [
  {
    icon: "🎯",
    title: "Design First",
    desc: "We believe great furniture starts with great design. Our AI tools empower anyone to become a furniture designer.",
  },
  {
    icon: "🚀",
    title: "Innovation",
    desc: "We push the boundaries of what's possible with AI and 3D technology to deliver cutting-edge design experiences.",
  },
  {
    icon: "🤝",
    title: "Accessibility",
    desc: "Professional-grade furniture design should be accessible to everyone, from homeowners to industry professionals.",
  },
  {
    icon: "🌍",
    title: "Sustainability",
    desc: "By visualizing before manufacturing, we help reduce waste and promote thoughtful, intentional furniture creation.",
  },
];

const stats = [
  { num: "50K+", label: "Designs Created" },
  { num: "12K+", label: "Active Users" },
  { num: "98%", label: "Satisfaction Rate" },
  { num: "4", label: "Furniture Types" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="text-center mb-20">
          <motion.p variants={fadeUp} custom={0} className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
            About Us
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-bold mb-6">
            Reimagining Furniture Design with AI
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Furni AI was born from a simple belief: everyone deserves beautiful, 
            perfectly-fitted furniture — and designing it should be effortless.
          </motion.p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="glass rounded-2xl p-10 md:p-14 mb-20"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold mb-4">
            Our Mission
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted leading-relaxed text-lg">
            We are building the future of furniture design. By combining artificial intelligence 
            with real-time 3D visualization, we empower designers, makers, and homeowners to create 
            furniture that perfectly fits their space, style, and budget. Our platform turns ideas 
            into tangible designs in seconds — no CAD skills required.
          </motion.p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={i}
              className="glass rounded-2xl p-6 text-center"
            >
              <p className="text-3xl md:text-4xl font-bold text-accent mb-1">{stat.num}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Values */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold mb-10 text-center">
            Our Values
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                custom={i}
                className="glass rounded-2xl p-8 hover:bg-white/[0.07] transition-all"
              >
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
