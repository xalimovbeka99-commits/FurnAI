import Link from "next/link";
import HeroSearch from "../components/HeroSearch";

export const metadata = {
  title: "FurniAI — Parametric 3D Furniture Generator",
  description: "Create custom wardrobes, kitchen cabinets, office desks, TV walls, beds, bookshelves, and dressing tables with our AI-powered parametric 3D generator. Get instant factory-ready manufacturing specifications.",
};

const features = [
  {
    icon: "✨",
    title: "AI-Powered Design",
    desc: "Describe your vision in plain text and let our AI generate stunning furniture designs instantly.",
    glow: "from-cyan-500/20 to-blue-600/20",
  },
  {
    icon: "🎨",
    title: "Full Customization",
    desc: "Fine-tune every dimension, material, color, and style to match your exact requirements.",
    glow: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: "📐",
    title: "3D Real-Time Preview",
    desc: "See your furniture come to life in an interactive 3D viewer. Rotate, zoom, and inspect every detail.",
    glow: "from-cyan-500/20 to-teal-500/20",
  },
  {
    icon: "💾",
    title: "Save & Export",
    desc: "Save your designs, export specifications, and share your creations with the world.",
    glow: "from-teal-500/20 to-blue-500/20",
  },
];

const categories = [
  { id: "wardrobe", name: "Wardrobes", emoji: "🚪", desc: "Procedural sliding or solid doors, interior shelves, and led lighting.", link: "/builder?type=wardrobe" },
  { id: "kitchen", name: "Kitchen Cabinets", emoji: "🍳", desc: "Custom cabinet modules, countertops, and integrated appliance bays.", link: "/builder?type=kitchen" },
  { id: "office", name: "Office Desks", emoji: "💼", desc: "Parametric office setups with custom keyboard trays and filing drawers.", link: "/builder?type=office" },
  { id: "tv-wall", name: "TV Wall Units", emoji: "📺", desc: "Floating consoles, media storage boards, and ambient LED backing glow.", link: "/builder?type=tv-wall" },
  { id: "cabinet", name: "Cabinets & Sideboards", emoji: "🗄️", desc: "Tall chests or low sideboards with customizable shelving doors.", link: "/builder?type=cabinet" },
  { id: "bed", name: "Beds & Nightstands", emoji: "🛏️", desc: "Padded or wooden frames, under-bed storage, and bedside setups.", link: "/builder?type=bed", highlight: true },
  { id: "shelves", name: "Bookshelves", emoji: "📚", desc: "Ladder or cube layouts with backing panels and shelf count controls.", link: "/builder?type=shelves" },
  { id: "dressing-table", name: "Dressing Tables", emoji: "🪞", desc: "Hollywood mirror vanity setups with drawer storage and stools.", link: "/builder?type=dressing-table" },
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
      {/* Hero Section with background picture and floating console */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 bg-img-hero">
        {/* Animated glow orbs for layered depth */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="orb orb-purple w-[400px] h-[400px] top-[10%] left-[10%]" style={{ animationDelay: '0s' }} />
          <div className="orb orb-blue w-[350px] h-[350px] bottom-[15%] right-[15%]" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="glass-pro rounded-3xl p-8 md:p-16 floating-layer-deep relative overflow-hidden border border-white/10 animate-fade-in">
            {/* Background highlights inside floating card */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <div className="mb-8 flex justify-center animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/10 text-xs text-muted pulse-glow">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  AI-Powered Furniture Design
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-white animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                Design Your Dream
                <br />
                <span className="gradient-text-warm font-extrabold">Furniture</span> with AI
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
                Describe your furniture in plain language. AI generates a 3D design in seconds.
                Real-time preview, infinite customization, zero hassle.
              </p>

              <HeroSearch />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <Link href="/gallery" className="btn-premium-secondary w-full sm:w-auto">
                  <span>Browse Gallery</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </div>
        </div>
      </section>

      {/* Features Section - floating overlap on the hero */}
      <section className="py-24 relative gradient-bg-section bg-background/50">
        <div className="max-w-7xl mx-auto px-6 relative z-20 -mt-16 md:-mt-24">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-4 gradient-text">
              Features
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Everything You Need to Design
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className="glass rounded-3xl p-8 floating-layer transition-all hover:bg-white/[0.08] group cursor-default shimmer relative overflow-hidden border border-white/5"
              >
                {/* Card glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feat.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
                <div className="relative z-10">
                  <div className="text-4xl mb-6">{feat.icon}</div>
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-accent-light transition-colors text-white">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 relative bg-background/40">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-4 gradient-text">
              Catalog
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Explore Design Categories
            </h2>
            <p className="text-muted max-w-xl mx-auto mt-4 text-sm md:text-base leading-relaxed">
              Select any category template to jump directly into the parametric builder and start configuring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={cat.link}
                className={`glass rounded-3xl p-8 border transition-all duration-300 floating-layer hover:bg-white/[0.08] group flex flex-col justify-between ${
                  cat.highlight
                    ? "border-accent/30 shadow-lg shadow-accent/5"
                    : "border-white/5"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl">{cat.emoji}</span>
                    {cat.highlight && (
                      <span className="px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-[9px] font-bold uppercase tracking-wider text-accent-light animate-pulse">
                        Featured Bed
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-white group-hover:text-accent-light transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed mb-6">{cat.desc}</p>
                </div>
                <div className="text-xs font-bold text-accent-light group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                  Configure Template →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - featuring materials background texture overlay */}
      <section className="py-28 relative bg-img-materials">
        {/* Layer shadow overlays for floating card feel */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="glass-pro rounded-3xl p-10 md:p-16 floating-layer border border-white/10">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold tracking-widest uppercase mb-4 gradient-text">
                How it works
              </p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
                Three Simple Steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className="text-center relative group"
                >
                  <div className="text-7xl font-black gradient-text mb-4 opacity-40 select-none group-hover:scale-110 transition-transform duration-300">{step.num}</div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                  <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 relative bg-background/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-4 gradient-text">
              Testimonials
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Loved by Designers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="glass rounded-3xl p-8 floating-layer border border-white/5 hover:bg-white/[0.06] shimmer relative overflow-hidden"
              >
                <div className="text-accent text-3xl mb-4 font-serif">“</div>
                <p className="text-sm text-muted leading-relaxed mb-6 italic relative z-10">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-bold text-xs text-accent-light">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - floating box style */}
      <section className="py-24 relative bg-background/55">
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="glass-pro rounded-3xl p-12 md:p-20 text-center floating-layer-deep border border-white/10 relative overflow-hidden">
            {/* Colorful overlay inside floating layer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-cyan-500/5" />
            <div className="absolute inset-0 gradient-bg-cta opacity-40" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">
                Ready to Create Something <span className="gradient-text-warm font-extrabold">Amazing</span>?
              </h2>
              <p className="text-muted text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                Join thousands of designers who use Furni AI to bring their furniture visions to life.
              </p>
              <div>
                <Link href="/builder" className="btn-premium-primary">
                  <span>Start Building for Free →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
