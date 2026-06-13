"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clampCounter,
  counterConditionMet,
  type GameLoop,
} from "@/lib/gameLoop";

export type GameLoopRuntime = {
  counters: Record<string, number>;
  activeEventLabel: string | null;
  fireScenePrompt: (id: string) => void;
};

type UseGameLoopRuntimeArgs = {
  gameLoop: GameLoop;
  baseScenePrompt: string;
  running: boolean;
  elapsedSeconds: number;
  capture: () => string | null;
  applyScenePrompt: (prompt: string) => void;
};

export function useGameLoopRuntime({
  gameLoop,
  baseScenePrompt,
  running,
  elapsedSeconds,
  capture,
  applyScenePrompt,
}: UseGameLoopRuntimeArgs): GameLoopRuntime {
  const [counters, setCounters] = useState<Record<string, number>>(() =>
    initCounters(gameLoop),
  );
  const [activeEventLabel, setActiveEventLabel] = useState<string | null>(null);

  const firedEventsRef = useRef<Set<string>>(new Set());
  const monitorTimersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map(),
  );
  const applyRef = useRef(applyScenePrompt);
  const captureRef = useRef(capture);
  const countersRef = useRef(counters);
  const gameLoopRef = useRef(gameLoop);
  const basePromptRef = useRef(baseScenePrompt);

  useEffect(() => {
    applyRef.current = applyScenePrompt;
  }, [applyScenePrompt]);
  useEffect(() => {
    captureRef.current = capture;
  }, [capture]);
  useEffect(() => {
    countersRef.current = counters;
  }, [counters]);
  useEffect(() => {
    gameLoopRef.current = gameLoop;
  }, [gameLoop]);
  useEffect(() => {
    basePromptRef.current = baseScenePrompt;
  }, [baseScenePrompt]);

  const applyCounterDelta = useCallback(
    (id: string, delta: number) => {
      const spec = gameLoopRef.current.counters.find((c) => c.id === id);
      if (!spec) return;
      setCounters((prev) => {
        const next = { ...prev, [id]: clampCounter((prev[id] ?? 0) + delta, spec) };
        countersRef.current = next;
        return next;
      });
    },
    [],
  );

  const setCounterValue = useCallback((id: string, value: number) => {
    const spec = gameLoopRef.current.counters.find((c) => c.id === id);
    if (!spec) return;
    setCounters((prev) => {
      const next = { ...prev, [id]: clampCounter(value, spec) };
      countersRef.current = next;
      return next;
    });
  }, []);

  const fireEvent = useCallback(
    (eventId: string) => {
      if (firedEventsRef.current.has(eventId)) return;
      const event = gameLoopRef.current.events.find((e) => e.id === eventId);
      if (!event) return;

      firedEventsRef.current.add(eventId);
      setActiveEventLabel(event.label);
      window.setTimeout(() => setActiveEventLabel(null), 3500);

      if (event.prompt) {
        applyRef.current(event.prompt);
      }
      for (const effect of event.counterEffects ?? []) {
        applyCounterDelta(effect.id, effect.delta);
      }
    },
    [applyCounterDelta],
  );

  // Timed events
  useEffect(() => {
    if (!running) return;
    for (const event of gameLoop.events) {
      if (
        event.atSeconds !== undefined &&
        elapsedSeconds >= event.atSeconds &&
        !firedEventsRef.current.has(event.id)
      ) {
        fireEvent(event.id);
      }
    }
  }, [running, elapsedSeconds, gameLoop.events, fireEvent]);

  // Counter-triggered events
  useEffect(() => {
    if (!running) return;
    for (const event of gameLoop.events) {
      if (!event.whenCounter || firedEventsRef.current.has(event.id)) continue;
      const current = counters[event.whenCounter.id] ?? 0;
      if (
        counterConditionMet(
          current,
          event.whenCounter.op,
          event.whenCounter.value,
        )
      ) {
        fireEvent(event.id);
      }
    }
  }, [running, counters, gameLoop.events, fireEvent]);

  const fireScenePrompt = useCallback((id: string) => {
    const sp = gameLoopRef.current.scenePrompts.find((p) => p.id === id);
    if (sp) applyRef.current(sp.prompt);
  }, []);

  // VLM monitor polling — start once when running begins
  const monitorsStartedRef = useRef(false);
  useEffect(() => {
    if (!running) return;
    if (monitorsStartedRef.current) return;
    if (gameLoop.monitors.length === 0) return;
    monitorsStartedRef.current = true;

    for (const monitor of gameLoop.monitors) {
      const intervalMs = Math.max(3000, monitor.everySeconds * 1000);
      const timer = setInterval(() => {
        void (async () => {
          const frame = captureRef.current();
          if (!frame) return;

          const b64 = frame.replace(/^data:image\/\w+;base64,/, "");
          try {
            const res = await fetch("/api/monitor", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageB64: b64,
                monitors: gameLoopRef.current.monitors.map((m) => ({
                  id: m.id,
                  question: m.question,
                  counterId: m.counterId,
                  mode: m.mode,
                })),
                counters: countersRef.current,
              }),
            });
            if (!res.ok) return;
            const data = await res.json();
            for (const r of data.results ?? []) {
              const m = gameLoopRef.current.monitors.find(
                (mon) => mon.id === r.monitorId,
              );
              if (!m) continue;
              if (m.mode === "set") {
                setCounterValue(m.counterId, r.value);
              } else {
                if (r.value > 0) applyCounterDelta(m.counterId, r.value);
              }
            }
          } catch {
            // best-effort; game continues without VLM updates
          }
        })();
      }, intervalMs);
      monitorTimersRef.current.set(monitor.id, timer);
    }

    return () => {
      for (const timer of monitorTimersRef.current.values()) {
        clearInterval(timer);
      }
      monitorTimersRef.current.clear();
      monitorsStartedRef.current = false;
    };
  }, [running, gameLoop.monitors, applyCounterDelta, setCounterValue]);

  return { counters, activeEventLabel, fireScenePrompt };
}

function initCounters(gameLoop: GameLoop): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of gameLoop.counters) {
    out[c.id] = c.initial;
  }
  return out;
}
