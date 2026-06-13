export type LoopExample = {
  id: string;
  label: string;
  emoji: string;
  /** Short description shown on the preset card. */
  summary: string;
  /** Full rules text sent to the game-loop parser. */
  text: string;
};

export const LOOP_EXAMPLES: LoopExample[] = [
  {
    id: "coins",
    label: "Coin Collector",
    emoji: "🪙",
    summary:
      "Small golden coins spawn on your travel path every 2 seconds — walk, fly, or drive through them to collect.",
    text: `A coin collection game. Small glowing golden coins appear every 2 seconds for the hero to collect.

basePromptAdditions: Small collectible golden coins keep appearing along whatever path the hero travels — walking, flying, driving, or any other movement. Coins must stay small in scale and sit directly on the route ahead, never floating far off to the side.

Counters:
- coins collected (start at 0)

Events (repeat every 2 seconds from 2s through 60s):
- Small golden coins materialize with a soft sparkle directly on the hero's current travel path ahead — on the road, trail, runway, flight line, or route they are following, whether walking, flying, or driving. Each coin must be small (roughly knee-height or smaller), grounded on the path surface, and placed where the hero will pass through, not off to the side or floating high above.

Monitors:
- Watch the video for small golden coins sitting on the hero's travel path ahead. Increment coins collected when new small coins appear on that path that the hero could reach.`,
  },
  {
    id: "styles",
    label: "World Styles",
    emoji: "🎨",
    summary:
      "Three buttons to restyle the world: photorealistic, anime, or Saturday-morning cartoon.",
    text: `A style-switching exploration. No counters or timed events — just three buttons to change how the world looks:

Scene prompt buttons:
- "Photorealistic" — the world becomes photorealistic with cinematic lighting, real textures, and natural colors.
- "Anime" — the world becomes vibrant Japanese anime style with clean lines, cel shading, and saturated hues.
- "Cartoon" — the world becomes a bright Saturday-morning cartoon with bold outlines, flat colors, and playful energy.`,
  },
  {
    id: "treasure",
    label: "Treasure Hunt",
    emoji: "💎",
    summary:
      "3 lives, treasure chests every 25s, storm and rainbow-bridge buttons, and a loot counter.",
    text: `A treasure hunt with stakes. The hero explores while hunting for loot.

Counters:
- lives (start at 3, minimum 0)
- treasures found (start at 0)

Events:
- Every 25 seconds, a hidden treasure chest appears ahead in the world.
- When lives reach 0, the sky turns stormy and the adventure feels perilous.

Scene prompt buttons:
- "Stormy weather" — dark clouds roll in, wind picks up, and rain begins to fall.
- "Rainbow bridge" — a magical rainbow bridge arches across the sky ahead.

Monitors:
- Watch the video for open treasure chests or glowing loot. Increment treasures found when a new chest is visible.`,
  },
  {
    id: "lap-timer",
    label: "Lap Timer",
    emoji: "⏱️",
    summary:
      "A lap counter and a finish-line check for a flat-out race — cross the line to bank a lap.",
    text: `A racing time trial. The hero races flat-out to complete laps as fast as possible.

basePromptAdditions: A photorealistic race with a clear track ahead, a racing line, curbs and barriers, and a strong sense of speed.

Counters:
- laps completed (start at 0)

Events:
- Every 30 seconds, the hero crosses the start/finish line and completes a lap.

Scene prompt buttons:
- "Speed up" — the vehicle accelerates hard, motion blur streaks past, intense sense of speed.

Monitors:
- Watch the video for the start/finish line or a checkered flag directly ahead. Increment laps completed when the hero crosses the finish line.`,
  },
  {
    id: "color-run",
    label: "Color Run",
    emoji: "🌈",
    summary:
      "Walk close to people and they splash you with color — count every color hit you take.",
    text: `A Holi color game. The hero walks down the street and people throw colored powder when approached.

basePromptAdditions: A festive Holi street full of people holding handfuls of bright colored powder, ready to throw color at anyone who comes close.

Counters:
- color hits (start at 0)

Events:
- Whenever the hero walks close to people, those people joyfully throw bright clouds of colored powder, covering the hero in pink, yellow, green and blue.

Scene prompt buttons:
- "Get colorful" — a huge burst of multicolored Holi powder explodes around the hero, covering them head to toe.

Monitors:
- Watch the video for bursts of colored powder being thrown at the hero. Increment color hits each time a new splash of color covers the hero.`,
  },
  {
    id: "neon-drift",
    label: "Neon Drift",
    emoji: "⚡",
    summary:
      "Rack up a style score as you cruise the neon streets, with boost and heavy-rain buttons.",
    text: `A neon street cruise focused on style and speed.

Counters:
- style points (start at 0)

Events:
- Every 5 seconds, the hero pulls off a flashy move and gains a few style points.

Scene prompt buttons:
- "Neon boost" — glowing neon speed trails streak behind the hero with electric energy.
- "Heavy rain" — heavier rain falls and neon reflections intensify on the wet streets.

Monitors:
- Watch the video for bright neon trails or motion blur around the hero. Increment style points when the scene looks fast and flashy.`,
  },
  {
    id: "wildlife-spotter",
    label: "Wildlife Spotter",
    emoji: "🦒",
    summary:
      "Spot wild animals as you roam the savanna — every new animal you see adds to your tally.",
    text: `A wildlife photo-safari. The hero roams the savanna spotting animals.

Counters:
- animals spotted (start at 0)

Scene prompt buttons:
- "Golden hour" — the savanna glows in warm golden sunset light.
- "Watering hole" — the hero reaches a busy watering hole crowded with animals.

Monitors:
- Watch the video for wild animals (elephants, giraffes, zebras, lions) in the frame. Increment animals spotted when a new animal appears.`,
  },
  {
    id: "oxygen",
    label: "Oxygen Countdown",
    emoji: "🫧",
    summary:
      "Oxygen slowly drains as you explore the red planet — find oxygen tanks before it runs out.",
    text: `A Mars survival exploration. The hero explores while oxygen slowly runs low.

Counters:
- oxygen (start at 100, minimum 0)
- oxygen tanks found (start at 0)

Events:
- Every 10 seconds, oxygen drops by 10.
- When oxygen reaches 0, the screen edges frost over and the world dims dramatically.

Scene prompt buttons:
- "Dust storm" — a red Martian dust storm sweeps across the terrain and the sky darkens.

Monitors:
- Watch the video for glowing oxygen tanks or supply crates on the ground. Increment oxygen tanks found when a new one is visible.`,
  },
];
