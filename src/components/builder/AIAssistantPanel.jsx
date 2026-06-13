"use client";

import React, { useState } from "react";

export default function AIAssistantPanel({
  onGenerate,
  placeholder = "Describe your style…",
  examples = ["Luxury gold", "Minimal white", "Dark walnut", "Add warm LED"],
}) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
        <span className="text-emerald-500">✦</span> AI Prompt Designer
      </div>
      <div className="flex flex-col gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[50px] rounded-lg border border-neutral-300 p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
        <div className="flex items-center justify-between gap-4 mt-1">
          <div className="flex flex-wrap gap-1.5">
            {examples.map((ex) => (
              <span
                key={ex}
                className="text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                onClick={() => setPrompt(ex)}
              >
                {ex}
              </span>
            ))}
          </div>
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm ml-auto"
            onClick={() => {
              if (prompt.trim()) {
                onGenerate(prompt);
                setPrompt("");
              }
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

