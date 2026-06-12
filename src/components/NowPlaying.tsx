"use client";

import { useLingbot, type LingbotStateMessage } from "@reactor-models/lingbot";

// Reads the model snapshot (passed down from the session) and exposes the
// transport controls: pause / resume / reset, plus a "snap 10s" capture.
export function NowPlaying({
  snapshot,
  capturing,
  onSnap,
}: {
  snapshot: LingbotStateMessage | null;
  capturing: boolean;
  onSnap: () => void;
}) {
  const { pause, resume, reset } = useLingbot();

  const prompt =
    typeof snapshot?.current_prompt === "string" ? snapshot.current_prompt : null;

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white/80 p-4 shadow-md backdrop-blur">
      <div className="flex items-center gap-2 text-sm">
        <span className="rounded-full bg-violet-100 px-3 py-1 font-mono font-bold text-violet-700">
          {snapshot?.current_action || "still"}
        </span>
        <span className="text-slate-500">chunk {snapshot?.current_chunk ?? 0}</span>
        <span className="ml-auto text-xs text-slate-400">seed {snapshot?.seed}</span>
      </div>

      {prompt && (
        <p className="line-clamp-2 text-xs italic text-slate-500">“{prompt}”</p>
      )}

      <div className="flex flex-wrap gap-2">
        {snapshot?.running ? (
          <button
            type="button"
            onClick={() => void pause()}
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-500"
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void resume()}
            disabled={!snapshot?.started}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-emerald-600 disabled:opacity-40"
          >
            ▶ Resume
          </button>
        )}

        <button
          type="button"
          onClick={onSnap}
          disabled={capturing || !snapshot?.running}
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-sky-600 disabled:opacity-40"
        >
          {capturing ? "Saving…" : "📸 Snap last 10s"}
        </button>

        <button
          type="button"
          onClick={() => void reset()}
          className="rounded-full bg-slate-200 px-4 py-2 text-sm font-bold text-slate-600 shadow hover:bg-slate-300"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
