"use client";

import { useLingbot } from "@reactor-models/lingbot";

const TONE: Record<string, { dot: string; label: string }> = {
  disconnected: { dot: "bg-slate-400", label: "Disconnected" },
  connecting: { dot: "bg-amber-400 animate-pulse", label: "Connecting…" },
  waiting: { dot: "bg-amber-400 animate-pulse", label: "Waiting for GPU…" },
  ready: { dot: "bg-emerald-500", label: "Live" },
};

// Window into the four-state connection machine, plus a recoverable
// disconnect/reconnect pair to exercise those APIs.
export function StatusBadge() {
  const { status, sessionId, disconnect, reconnect } = useLingbot();
  const tone = TONE[status] ?? TONE.disconnected;

  return (
    <div className="flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-md backdrop-blur">
      <span className={`h-3 w-3 rounded-full ${tone.dot}`} />
      <span className="text-sm font-bold text-slate-700">{tone.label}</span>
      {sessionId && (
        <span
          className="hidden font-mono text-[10px] text-slate-400 sm:inline"
          title={sessionId}
        >
          {sessionId.slice(0, 8)}
        </span>
      )}
      {status === "ready" ? (
        <button
          type="button"
          onClick={() => void disconnect(true)}
          className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 hover:bg-amber-200"
          title="Recoverable disconnect (keeps the session alive ~30s)"
        >
          Pause link
        </button>
      ) : status === "disconnected" ? (
        <button
          type="button"
          onClick={() => void reconnect()}
          className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-200"
        >
          Resume link
        </button>
      ) : null}
    </div>
  );
}
