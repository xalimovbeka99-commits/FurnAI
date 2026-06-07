"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const FURNITURE_OPTIONS = [
  {
    id: "wardrobe",
    name: "Wardrobe",
    description: "Tall cabinet for clothing storage",
    emoji: "👔",
  },
  {
    id: "cabinet",
    name: "Cabinet",
    description: "Storage unit for various items",
    emoji: "📦",
  },
  {
    id: "shelves",
    name: "Shelves",
    description: "Open shelving for display",
    emoji: "📚",
  },
  {
    id: "table",
    name: "Table",
    description: "Dining or work table",
    emoji: "🪑",
  },
  {
    id: "dressing_table",
    name: "Dressing Table",
    description: "Vanity with mirror and storage",
    emoji: "💄",
  },
  {
    id: "bed",
    name: "Bed",
    description: "Bed frame with storage",
    emoji: "🛏️",
  },
  {
    id: "kitchen",
    name: "Kitchen",
    description: "Full kitchen layout",
    emoji: "🍳",
  },
  {
    id: "office",
    name: "Office",
    description: "Desk and office setup",
    emoji: "🖥️",
  },
];

function DisambiguateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const originalDescription = searchParams.get("description") || "";

  const handleSelect = (furnitureType) => {
    const params = new URLSearchParams(searchParams);
    params.set("type", furnitureType);

    router.push(`/builder?${params.toString()}`);
  };

  return (
    <DisambiguatePageContent
      originalDescription={originalDescription}
      handleSelect={handleSelect}
      router={router}
    />
  );
}

function DisambiguatePageContent({ originalDescription, handleSelect, router }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 pt-32 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <motion.h1
            variants={fadeUp}
            custom={0}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            What did you mean?
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-lg text-muted max-w-2xl mx-auto mb-2"
          >
            I'm not quite sure which furniture type you're describing.
          </motion.p>
          {originalDescription && (
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-sm text-white/40 italic max-w-2xl mx-auto"
            >
              You said: "{originalDescription}"
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12"
        >
          {FURNITURE_OPTIONS.map((option, idx) => (
            <motion.button
              key={option.id}
              variants={fadeUp}
              custom={idx + 3}
              onClick={() => handleSelect(option.id)}
              className="group relative"
            >
              <div className="glass rounded-2xl p-6 text-center hover:bg-white/[0.08] transition-all duration-300 border border-white/10 hover:border-accent/50 cursor-pointer h-full flex flex-col items-center justify-center gap-3">
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {option.emoji}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {option.name}
                  </h3>
                  <p className="text-xs text-muted mt-1">{option.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={11}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/" className="btn-premium-secondary">
            ← Go Back
          </Link>
          <button
            onClick={() => router.push("/builder")}
            className="btn-premium-primary"
          >
            Skip & Go to Builder →
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default function DisambiguatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DisambiguateContent />
    </Suspense>
  );
}
