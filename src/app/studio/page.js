"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const TONES = [
  { value: "minimalist", label: "Minimalist & Sleek" },
  { value: "bold", label: "Bold & Industrial" },
  { value: "professional", label: "Trustworthy & Professional" },
  { value: "energetic", label: "High-Energy & Creative" },
  { value: "playful", label: "Playful & Casual" }
];

const CHANNELS = [
  { id: "social", label: "Social Media Ads" },
  { id: "email", label: "Email Marketing" },
  { id: "search", label: "Search Ads" },
  { id: "video", label: "Video Copy" },
  { id: "print", label: "Print & Billboard" }
];

const SUGGESTIONS = [
  {
    product: "Modular Walnut desk organizer with magnetic phone rest",
    brief: "Increase holiday sales by offering a premium gift bundle",
    audience: "Remote software engineers and aesthetic desk creators",
    tone: "minimalist",
    channels: ["social", "email"]
  },
  {
    product: "Ergonomic steel standing frame desk with customizable wood tops",
    brief: "Raise brand awareness and explain ergonomic health benefits",
    audience: "Office administrators and wellness-conscious remote workers",
    tone: "bold",
    channels: ["search", "video"]
  }
];

export default function StudioPage() {
  const [product, setProduct] = useState("");
  const [brief, setBrief] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("minimalist");
  const [selectedChannels, setSelectedChannels] = useState(["social"]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("variants");
  const [completedItems, setCompletedItems] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);

  const toggleChannel = (id) => {
    if (selectedChannels.includes(id)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter(c => c !== id));
      }
    } else {
      setSelectedChannels([...selectedChannels, id]);
    }
  };

  const handleSuggestion = (s) => {
    setProduct(s.product);
    setBrief(s.brief);
    setAudience(s.audience);
    setTone(s.tone);
    setSelectedChannels(s.channels);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!product.trim() || !brief.trim() || !audience.trim()) {
      setError("Please fill in all prompt details.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);
    setLoadingStep(0);

    // Dynamic step animation for high-tech feeling
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 2500);

    try {
      const response = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          brief,
          audience,
          tone,
          channels: selectedChannels.map(c => CHANNELS.find(ch => ch.id === c)?.label || c)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate campaign concepts.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please check your network connection.");
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const toggleChecklist = (idx) => {
    setCompletedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const copyToClipboard = (text, message = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    alert(message);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background relative overflow-hidden">
      {/* Background CAD decorative grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.02] pointer-events-none" />

      {/* Floating orbs for aesthetic depth */}
      <div className="orb orb-purple w-[400px] h-[400px] top-[10%] left-[-10%]" />
      <div className="orb orb-blue w-[400px] h-[400px] bottom-[5%] right-[-10%]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted mb-3">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white font-semibold">Campaign Studio</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                Campaign <span className="gradient-text-warm font-black">Concept</span> Studio
              </h1>
              <p className="text-muted text-sm max-w-xl">
                Synthesize high-performing, multi-channel marketing campaigns. Powered by OpenAI Responses API.
              </p>
            </div>
            {/* Client/Server boundary badge */}
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-muted self-start md:self-center">
              <span className="font-bold text-accent">Boundary:</span> Client forms inputs &rarr; Next.js Server Route calling OpenAI Responses API &rarr; UI updates.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Inputs Form */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-pro rounded-3xl p-6 border border-white/10 relative"
            >
              <div className="absolute top-0 right-8 w-24 h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent" />
              
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-accent">📐</span> Brief Parameters
              </h2>

              <form onSubmit={handleGenerate} className="space-y-5">
                {/* Product details */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block">Product Details</label>
                  <textarea
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    rows={2}
                    placeholder="e.g., Ergonomic wooden dual-monitor stand with integrated cable drawer..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent focus:bg-white/[0.08] transition-all resize-none shadow-inner"
                    required
                  />
                </div>

                {/* Campaign Brief */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block">Campaign Brief / Goal</label>
                  <textarea
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    rows={2}
                    placeholder="e.g., Promote pre-orders for our product launch with an exclusive 15% discount..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent focus:bg-white/[0.08] transition-all resize-none shadow-inner"
                    required
                  />
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block">Target Audience</label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g., Creative professionals, architects, and remote designers..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent focus:bg-white/[0.08] transition-all shadow-inner"
                    required
                  />
                </div>

                {/* Tone of Voice */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block">Tone of Voice</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent focus:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    {TONES.map(t => (
                      <option key={t.value} value={t.value} className="bg-surface text-foreground">{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Marketing Channels */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block">Target Channels</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {CHANNELS.map(ch => {
                      const selected = selectedChannels.includes(ch.id);
                      return (
                        <button
                          type="button"
                          key={ch.id}
                          onClick={() => toggleChannel(ch.id)}
                          className={`px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-300 ${
                            selected
                              ? "bg-accent/15 border-accent text-accent-light shadow-md shadow-accent/5"
                              : "bg-white/5 border-white/10 text-muted hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {ch.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error Box */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-premium-primary text-sm py-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#070d19] border-t-transparent rounded-full animate-spin" />
                      Synthesizing Concept...
                    </>
                  ) : (
                    <>
                      <span>Synthesize Campaign →</span>
                    </>
                  )}
                </button>
              </form>

              {/* Suggestions template block */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-muted mb-3">Or choose a pre-configured scenario</p>
                <div className="space-y-2">
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestion(s)}
                      className="w-full p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-accent/30 text-left text-xs transition-all hover:bg-white/[0.04]"
                    >
                      <p className="text-white font-semibold truncate">{s.product}</p>
                      <p className="text-muted truncate mt-0.5">{s.brief}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Output Screen */}
          <div className="lg:col-span-7">
            {/* 1. Loading State */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-pro rounded-3xl p-12 border border-white/10 text-center h-[580px] flex flex-col items-center justify-center relative overflow-hidden"
              >
                {/* Moving grid overlay loader */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,229,255,0.01)_1px,transparent_1px)] [background-size:100%_40px] animate-pulse pointer-events-none" />
                
                {/* Glowing target circle */}
                <div className="w-24 h-24 rounded-full border border-accent/20 flex items-center justify-center relative mb-8">
                  <div className="absolute inset-0 rounded-full border border-dashed border-accent/40 animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute inset-2 rounded-full border border-accent/60 animate-ping" style={{ animationDuration: '3s' }} />
                  <span className="text-3xl">⚙️</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Campaign Synthesis Engine Active</h3>
                
                <div className="text-xs text-muted max-w-sm space-y-2 mt-4">
                  <p className={`transition-opacity duration-300 ${loadingStep >= 0 ? "opacity-100 text-accent-light" : "opacity-30"}`}>
                    ✓ [01/04] Establishing Client-Server Request handshake
                  </p>
                  <p className={`transition-opacity duration-300 ${loadingStep >= 1 ? "opacity-100 text-accent-light" : "opacity-30"}`}>
                    {loadingStep >= 1 ? "✓" : "⚡"} [02/04] Executing OpenAI Responses API model loop
                  </p>
                  <p className={`transition-opacity duration-300 ${loadingStep >= 2 ? "opacity-100 text-accent-light" : "opacity-30"}`}>
                    {loadingStep >= 2 ? "✓" : "⚡"} [03/04] Triggering DALL-E/gpt-image-2 key visual renderings
                  </p>
                  <p className={`transition-opacity duration-300 ${loadingStep >= 3 ? "opacity-100 text-accent-light" : "opacity-30"}`}>
                    {loadingStep >= 3 ? "✓" : "⚡"} [04/04] Bundling structured JSON objects for dashboard display
                  </p>
                </div>
              </motion.div>
            )}

            {/* 2. Empty State */}
            {!isLoading && !result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-pro rounded-3xl p-12 border border-white/10 text-center h-[580px] flex flex-col items-center justify-center relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl text-muted mb-6">
                  💡
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Workspace Ready</h3>
                <p className="text-muted text-xs max-w-xs mx-auto leading-relaxed">
                  Enter your product and brief details in the panel on the left, then click "Synthesize Campaign" to generate your concept.
                </p>
              </motion.div>
            )}

            {/* 3. Output Content State */}
            {!isLoading && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Generation source alert */}
                <div className={`px-4 py-3 rounded-2xl border flex items-center justify-between text-xs ${
                  result.source === "openai-responses-api"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                }`}>
                  <div>
                    <span className="font-bold">Mode:</span> {
                      result.source === "openai-responses-api" 
                        ? "OpenAI Responses API — Generation Completed" 
                        : "Smart Mock Fallback — Generation Mocked (No API key found in .env)"
                    }
                  </div>
                  {result.source === "mock-fallback" && (
                    <span className="text-[10px] underline cursor-pointer" onClick={() => alert("Please create a .env.local file in the project root containing: OPENAI_API_KEY=your_key")}>Setup Guide</span>
                  )}
                </div>

                {/* Concept Main Banner */}
                <div className="glass-pro rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 border-b border-l border-white/5 text-[9px] uppercase tracking-wider text-muted font-mono rounded-bl-xl">
                    Concept Spec
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-1">{result.concept.title}</h3>
                  <p className="text-accent-light font-bold text-xs uppercase tracking-widest mb-4">{result.concept.tagline}</p>
                  <p className="text-muted text-xs leading-relaxed">{result.concept.description}</p>
                </div>

                {/* Tabs for Variants, Checklist, Images */}
                <div className="flex border-b border-white/10">
                  {[
                    { id: "variants", label: "Copy Variants", emoji: "✍️" },
                    { id: "images", label: "Visual Direction", emoji: "🖼️" },
                    { id: "checklist", label: "Launch Checklist", emoji: "📋" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? "border-accent text-accent-light"
                          : "border-transparent text-muted hover:text-white"
                      }`}
                    >
                      <span>{tab.emoji}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab content renders */}
                <div className="space-y-4">
                  {/* TAB 1: Copy Variants */}
                  {activeTab === "variants" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {result.variants.map((v, i) => (
                        <div key={i} className="glass rounded-2xl p-5 border border-white/5 relative group hover:border-white/15 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-accent-light text-[9px] font-bold uppercase tracking-wider">
                              {v.channel}
                            </span>
                            <button
                              onClick={() => copyToClipboard(`Headline: ${v.headline}\n\nBody: ${v.body}`, "Copy Variant copied!")}
                              className="text-[10px] text-muted hover:text-white transition-colors cursor-pointer"
                            >
                              Copy Copy 📋
                            </button>
                          </div>
                          <h4 className="font-extrabold text-sm text-white mb-2">Headline: {v.headline}</h4>
                          <p className="text-muted text-xs leading-relaxed">{v.body}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* TAB 2: Visual Direction / Image Prompts */}
                  {activeTab === "images" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {result.generatedImages && result.generatedImages.map((img, i) => (
                          <div key={i} className="glass rounded-2xl overflow-hidden border border-white/5 flex flex-col">
                            {/* Image Visualizer */}
                            <div className="h-44 relative bg-black/40 overflow-hidden cursor-zoom-in" onClick={() => setLightboxImage(img)}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.url}
                                alt={img.prompt}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="p-4 flex-1">
                              <p className="text-[10px] uppercase font-bold text-accent-light mb-1">Image Prompt {i + 1}</p>
                              <p className="text-muted text-[10px] leading-normal">{img.prompt}</p>
                              <button
                                onClick={() => copyToClipboard(img.prompt, "Prompt copied!")}
                                className="mt-3 text-[9px] text-accent-light font-bold hover:underline"
                              >
                                Copy Prompt 📋
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: Launch Checklist */}
                  {activeTab === "checklist" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-2xl p-6 border border-white/5 space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <span className="text-[10px] uppercase font-bold text-muted">Launch checklist</span>
                        <button
                          onClick={() => copyToClipboard(result.checklist.join("\n"), "Checklist copied!")}
                          className="text-[10px] text-muted hover:text-white"
                        >
                          Copy List 📋
                        </button>
                      </div>

                      <div className="space-y-3.5">
                        {result.checklist.map((item, idx) => {
                          const isDone = completedItems[idx];
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleChecklist(idx)}
                              className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-white/[0.02] cursor-pointer transition-all border border-transparent hover:border-white/5"
                            >
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                isDone
                                  ? "bg-accent/20 border-accent text-accent-light"
                                  : "border-white/10"
                              }`}>
                                {isDone && "✓"}
                              </div>
                              <span className={`text-xs leading-normal transition-all ${
                                isDone ? "line-through text-muted" : "text-white"
                              }`}>
                                {item}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl w-full flex flex-col gap-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.url}
                alt={lightboxImage.prompt}
                className="w-full max-h-[75vh] object-contain rounded-2xl border border-white/15 shadow-2xl"
              />
              <div className="glass rounded-xl p-4 border border-white/10 text-xs text-white">
                <p className="font-bold text-accent-light mb-1">Generated Visual Prompt:</p>
                <p className="text-muted text-[11px] leading-relaxed">{lightboxImage.prompt}</p>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase transition-colors"
                >
                  Close Modal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
