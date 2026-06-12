// Preset choices shown on the landing page. Each preset carries two
// descriptions: one tuned for the LingBot text prompt (steers the live
// world) and one tuned for the OpenAI seed-image generation. They are kept
// aligned on purpose so the generated seed frame matches the prompt.

export type Preset = {
  id: string;
  /** Short kid-friendly label. */
  label: string;
  /** Emoji used as a fallback / accent on the card. */
  emoji: string;
  /** Static thumbnail bundled in /public/presets. */
  thumb: string;
  /** Fragment fed into the LingBot scene prompt. */
  scenePrompt: string;
  /** Fragment fed into the OpenAI seed-image prompt. */
  imagePrompt: string;
};

export const ENVIRONMENTS: Preset[] = [
  {
    id: "skywhales",
    label: "Floating Sky Islands",
    emoji: "🐋",
    thumb: "/presets/env-skywhales.png",
    scenePrompt:
      "a chain of lush floating islands carried on the backs of enormous, gentle migrating skywhales drifting through a golden sky, waterfalls spilling off the island edges into clouds",
    imagePrompt:
      "a world of lush green floating islands resting on the backs of colossal gentle migrating skywhales, drifting through a warm golden cloudy sky with waterfalls spilling off the island edges",
  },
  {
    id: "clockwork",
    label: "Clockwork Forest",
    emoji: "⚙️",
    thumb: "/presets/env-clockwork.png",
    scenePrompt:
      "a mechanical forest where brass-and-copper trees turn on ancient clockwork, glowing gears and ticking pendulums everywhere, moss growing over polished metal roots",
    imagePrompt:
      "a magical mechanical forest of brass and copper trees powered by ancient glowing clockwork, spinning golden gears and swinging pendulums, soft moss over polished metal roots",
  },
  {
    id: "storybook",
    label: "Storybook Worlds",
    emoji: "📖",
    thumb: "/presets/env-storybook.png",
    scenePrompt:
      "a cluster of interconnected storybook worlds linked by floating ribbons of magic and glowing pages, each little world a different fairy-tale landscape stitched together",
    imagePrompt:
      "many small interconnected storybook worlds linked by floating ribbons of glowing magic and drifting illuminated pages, each tiny world a different colorful fairy-tale landscape",
  },
];

export const CHARACTERS: Preset[] = [
  {
    id: "cartographer",
    label: "Crystal Cartographer",
    emoji: "🐉",
    thumb: "/presets/char-cartographer.png",
    scenePrompt:
      "a young crystal cartographer in a glittering cloak riding on the back of a sleek wind dragon, holding a glowing crystal map",
    imagePrompt:
      "a cheerful young crystal cartographer wearing a glittering cloak, riding on the back of a sleek friendly wind dragon and holding a glowing crystal map",
  },
  {
    id: "mechanic",
    label: "Forest Mechanic",
    emoji: "🔧",
    thumb: "/presets/char-mechanic.png",
    scenePrompt:
      "a curious young forest mechanic in patched overalls with a tool belt, repairing small living clockwork machines that scurry nearby",
    imagePrompt:
      "a curious young forest mechanic in patched overalls with a leather tool belt and goggles, kneeling to repair small adorable living clockwork creatures",
  },
  {
    id: "storykeeper",
    label: "Junior Storykeeper",
    emoji: "✨",
    thumb: "/presets/char-storykeeper.png",
    scenePrompt:
      "a brave junior storykeeper holding a glowing storybook lantern, with swirling pages of light orbiting around them, protecting the world from creeping shadows of chaos",
    imagePrompt:
      "a brave junior storykeeper child holding a glowing storybook lantern, swirling pages of golden light orbiting around them, gently pushing back wisps of dark chaos",
  },
];

export function findPreset(list: Preset[], id: string | null): Preset | undefined {
  if (!id) return undefined;
  return list.find((p) => p.id === id);
}
