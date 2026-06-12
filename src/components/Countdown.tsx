"use client";

import { EXPLORE_SECONDS } from "@/lib/types";

// Kid-friendly countdown ring + number for the exploration window.
export function Countdown({ secondsLeft }: { secondsLeft: number }) {
  const pct = Math.max(0, Math.min(1, secondsLeft / EXPLORE_SECONDS));
  const whole = Math.ceil(secondsLeft);
  const urgent = secondsLeft <= 5;

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-md backdrop-blur">
      <div className="relative h-8 w-8">
        <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            className="stroke-slate-200"
            strokeWidth="4"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            className={urgent ? "stroke-red-500" : "stroke-violet-500"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 15}
            strokeDashoffset={(1 - pct) * 2 * Math.PI * 15}
            style={{ transition: "stroke-dashoffset 0.2s linear" }}
          />
        </svg>
      </div>
      <span
        className={`font-mono text-lg font-extrabold ${
          urgent ? "text-red-600" : "text-slate-700"
        }`}
      >
        {whole}s
      </span>
    </div>
  );
}
