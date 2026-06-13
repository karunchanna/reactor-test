import type { GameLoop } from "./gameLoop";

// Shape passed from the landing page into the live exploration session.
export type Adventure = {
  environmentLabel: string;
  characterLabel: string;
  /** Assembled LingBot scene prompt. */
  scenePrompt: string;
  /** Combined seed image as a data URL (data:image/png;base64,...). */
  seedImageDataUrl: string;
  /** RNG seed for reproducible runs. */
  seed: number;
  /** Raw Loop rules text from the landing page. */
  loopText: string;
  /** Parsed structured game-loop spec. */
  gameLoop: GameLoop;
};

/** Seconds the explorer is allowed to roam before the run is captured. */
export const EXPLORE_SECONDS = 60;
