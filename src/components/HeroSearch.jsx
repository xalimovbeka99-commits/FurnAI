"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDescribe = async () => {
    if (!input.trim()) {
      setError("Please describe your furniture");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/nlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to process description");
      }

      const data = await response.json();

      if (data.success) {
        const params = new URLSearchParams();

        // Only add params that exist in the response
        if (data.parameters.furnitureType) params.append("type", data.parameters.furnitureType);
        if (data.parameters.style) params.append("style", data.parameters.style);
        if (data.parameters.primaryColor) params.append("color", data.parameters.primaryColor);
        if (data.parameters.doorType) params.append("doorType", data.parameters.doorType);
        if (data.parameters.handleStyle) params.append("handleStyle", data.parameters.handleStyle);
        if (data.parameters.drawerRows !== undefined) params.append("drawerRows", data.parameters.drawerRows);
        if (data.parameters.hangerRods !== undefined) params.append("hangerRods", data.parameters.hangerRods);
        if (data.parameters.ledLighting) params.append("ledLighting", data.parameters.ledLighting);
        if (data.parameters.width) params.append("width", data.parameters.width);
        if (data.parameters.height) params.append("height", data.parameters.height);
        if (data.parameters.depth) params.append("depth", data.parameters.depth);

        params.append("description", input);

        // Check if confidence is below 70% for furniture type
        if (data.parameters.confidence?.furnitureType < 0.7) {
          router.push(`/disambiguate?${params.toString()}`);
        } else {
          router.push(`/builder?${params.toString()}`);
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to process your description. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    "Luxury walnut wardrobe with mirror doors and LED lighting",
    "Queen size bed with padded headboard and under-bed storage drawers",
    "Modern kitchen with oak cabinets and open shelving",
    "Industrial office desk with black metal frame",
  ];

  return (
    <div className="max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-white/60 block text-left pl-1">
          Describe your furniture
        </label>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleDescribe()}
            placeholder="e.g., Luxury walnut wardrobe with mirror doors and LED lighting"
            className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent/50 focus:bg-white/[0.15] transition-all text-sm shadow-inner"
            disabled={isLoading}
          />
          <button
            onClick={handleDescribe}
            disabled={isLoading}
            className="px-6 py-3.5 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold transition-all w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-accent/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Describe"
            )}
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-sm text-left pl-1">{error}</div>
        )}

        <div className="flex flex-wrap items-center gap-2 justify-start mt-2">
          <span className="text-xs text-white/50">Inspiration:</span>
          {examplePrompts.map((prompt, idx) => {
            let label = prompt;
            if (prompt.includes(" wardrobe ")) label = "Luxury Wardrobe";
            else if (prompt.includes(" bed ")) label = "Queen Bed";
            else if (prompt.includes(" kitchen ")) label = "Modern Kitchen";
            else if (prompt.includes(" desk ")) label = "Office Desk";

            return (
              <button
                key={idx}
                onClick={() => {
                  setInput(prompt);
                  setError("");
                }}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-accent hover:text-black border border-white/10 hover:border-accent/40 text-white/70 transition-all text-xs cursor-pointer hover:scale-[1.05]"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
