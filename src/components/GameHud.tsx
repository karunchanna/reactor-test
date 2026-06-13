"use client";

import type { GameLoop } from "@/lib/gameLoop";

type GameHudProps = {
  gameLoop: GameLoop;
  counters: Record<string, number>;
  activeEventLabel: string | null;
  onScenePrompt: (id: string) => void;
  enabled: boolean;
};

export function GameHud({
  gameLoop,
  counters,
  activeEventLabel,
  onScenePrompt,
  enabled,
}: GameHudProps) {
  const hasCounters = gameLoop.counters.length > 0;
  const hasPrompts = gameLoop.scenePrompts.length > 0;
  if (!hasCounters && !hasPrompts && !activeEventLabel) return null;

  return (
    <>
      {activeEventLabel && (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4">
          <span className="animate-pulse rounded-full bg-amber-400/95 px-4 py-2 text-sm font-extrabold text-amber-950 shadow-lg">
            {activeEventLabel}
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute right-3 top-3 z-20 flex max-w-[45%] flex-col items-end gap-2">
        {hasCounters && (
          <div className="flex flex-wrap justify-end gap-2">
            {gameLoop.counters.map((c) => (
              <span
                key={c.id}
                className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border-2 border-white/60 bg-black/55 px-3 py-1.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition-transform"
              >
                {c.emoji && <span>{c.emoji}</span>}
                <span className="text-white/80">{c.label}</span>
                <span className="font-mono text-base text-emerald-300">
                  {counters[c.id] ?? c.initial}
                </span>
              </span>
            ))}
          </div>
        )}

        {hasPrompts && enabled && (
          <div className="flex flex-wrap justify-end gap-2">
            {gameLoop.scenePrompts.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => onScenePrompt(sp.id)}
                className="pointer-events-auto rounded-full border-2 border-violet-300/80 bg-violet-600/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-violet-500 active:scale-95"
              >
                {sp.emoji && <span className="mr-1">{sp.emoji}</span>}
                {sp.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
