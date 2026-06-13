// Structured game-loop spec parsed from the user's freeform Loop rules.

export type GameLoopCounter = {
  id: string;
  label: string;
  emoji?: string;
  initial: number;
  min?: number;
  max?: number;
};

export type GameLoopScenePrompt = {
  id: string;
  label: string;
  emoji?: string;
  /** LingBot prompt text applied on click via setPrompt. */
  prompt: string;
};

export type GameLoopCounterOp = ">=" | "<=" | "==";

export type GameLoopEvent = {
  id: string;
  label: string;
  /** Fire once when elapsed seconds reach this value. */
  atSeconds?: number;
  /** Fire once when a counter satisfies the condition. */
  whenCounter?: {
    id: string;
    op: GameLoopCounterOp;
    value: number;
  };
  /** Optional scene prompt to apply when the event fires. */
  prompt?: string;
  /** Counter deltas applied when the event fires. */
  counterEffects?: { id: string; delta: number }[];
};

export type GameLoopMonitor = {
  id: string;
  /** Question the vision model answers about the current frame. */
  question: string;
  counterId: string;
  mode: "increment" | "set";
  everySeconds: number;
};

export type GameLoop = {
  /** Extra flavor merged into the base scene prompt at launch. */
  basePromptAdditions?: string;
  counters: GameLoopCounter[];
  scenePrompts: GameLoopScenePrompt[];
  events: GameLoopEvent[];
  monitors: GameLoopMonitor[];
};

export function emptyGameLoop(): GameLoop {
  return {
    counters: [],
    scenePrompts: [],
    events: [],
    monitors: [],
  };
}

export function clampCounter(
  value: number,
  counter: Pick<GameLoopCounter, "min" | "max">,
): number {
  let v = value;
  if (counter.min !== undefined) v = Math.max(counter.min, v);
  if (counter.max !== undefined) v = Math.min(counter.max, v);
  return v;
}

export function counterConditionMet(
  current: number,
  op: GameLoopCounterOp,
  target: number,
): boolean {
  switch (op) {
    case ">=":
      return current >= target;
    case "<=":
      return current <= target;
    case "==":
      return current === target;
    default:
      return false;
  }
}
