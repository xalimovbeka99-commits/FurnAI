"use client";

import React from "react";

export default function AIAssistantPanel({
  prompt,
  setPrompt,
  handleRunAI,
  placeholder = "Describe your style…",
  examples = ["Luxury gold", "Minimal white", "Dark walnut", "Add warm LED"],
}) {
  return (
    <div className="rps">
      <div className="rpt">✦ AI Prompt</div>
      <div className="aibox">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
        />
        <div className="aifoot">
          <div className="aiex-list">
            {examples.map((ex) => (
              <span
                key={ex}
                className="aiex cursor-pointer"
                onClick={() => setPrompt(ex)}
              >
                {ex.split(" ").slice(0, 2).join(" ")}
              </span>
            ))}
          </div>
          <button
            className="aiapply cursor-pointer"
            onClick={() => {
              handleRunAI(prompt);
              setPrompt("");
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
