import React from "react";

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
  { num: "8+", label: "Furniture Types" },
  { num: "14", label: "Material Options" },
  { num: "100%", label: "Free to Use" },
  { num: "∞", label: "Designs Possible" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-img-about relative">
      {/* Background opacity overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <p className="text-accent-light text-xs font-semibold tracking-widest uppercase mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            About Us
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white leading-tight animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Reimagining Furniture Design with AI
          </h1>
          <p className="text-base md:text-lg text-muted max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            Furni AI was born from a simple belief: everyone deserves beautiful, 
            perfectly-fitted furniture — and designing it should be effortless.
          </p>
        </div>

        {/* Mission - styled as a floating deep glass console */}
        <div className="glass-pro rounded-3xl p-10 md:p-14 mb-20 border border-white/10 floating-layer-deep animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white tracking-tight">
            Our Mission
          </h2>
          <p className="text-muted leading-relaxed text-sm md:text-base">
            We are building the future of furniture design. By combining artificial intelligence 
            with real-time 3D visualization, we empower designers, makers, and homeowners to create 
            furniture that perfectly fits their space, style, and budget. Our platform turns ideas 
            into tangible designs in seconds — no CAD skills required.
          </p>
        </div>

        {/* Stats - redesigned as independent floating plates */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="glass rounded-3xl p-6 text-center border border-white/5 floating-layer hover:bg-white/[0.08]"
            >
              <p className="text-3xl md:text-4xl font-extrabold text-accent-light mb-1.5">{stat.num}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center text-white tracking-tight">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="glass rounded-3xl p-8 border border-white/5 floating-layer hover:bg-white/[0.08]"
              >
                <div className="text-4xl mb-6">{v.icon}</div>
                <h3 className="text-lg font-semibold mb-3 text-white">{v.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
