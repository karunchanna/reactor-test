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
  /** Static thumbnail bundled in /public/presets (optional). */
  thumb?: string;
  /** Tailwind gradient classes used for the card when no thumb is set. */
  gradient?: string;
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
  {
    id: "sf-race",
    label: "SF Race Circuit",
    emoji: "🏍️",
    thumb: "/presets/env-sf-race.png",
    gradient: "from-orange-400 via-rose-500 to-red-600",
    scenePrompt:
      "a realistic professional race track winding through the streets of San Francisco, past the Golden Gate Bridge, steep hills and cable-car lines along the bay, with grandstands, tire barriers and checkered curbs lining the asphalt",
    imagePrompt:
      "a photorealistic professional street race circuit winding through San Francisco, the Golden Gate Bridge and steep city hills in the background, asphalt track with checkered curbs, tire barriers and grandstands, bright daylight",
  },
  {
    id: "holi-mumbai",
    label: "Holi in Mumbai",
    emoji: "🎨",
    thumb: "/presets/env-holi-mumbai.png",
    gradient: "from-fuchsia-500 via-pink-500 to-yellow-400",
    scenePrompt:
      "the crowded festive streets of Mumbai during the Holi festival, joyful crowds throwing clouds of bright colored powder, splashes of pink, yellow, green and blue everywhere, colorful old buildings and busy street stalls",
    imagePrompt:
      "photorealistic crowded streets of Mumbai during the Holi festival, joyful people throwing clouds of vivid colored powder, pink yellow green and blue color in the air, colorful old buildings and festive street stalls, warm sunlight",
  },
  {
    id: "neon-tokyo",
    label: "Neon Tokyo Nights",
    emoji: "🌆",
    thumb: "/presets/env-neon-tokyo.png",
    gradient: "from-sky-500 via-violet-600 to-fuchsia-600",
    scenePrompt:
      "the rain-soaked neon streets of Tokyo at night, glowing signs and holographic billboards reflecting in the wet pavement, narrow alleys packed with ramen stalls, steam and crowds under colorful lights",
    imagePrompt:
      "photorealistic rain-soaked neon streets of Tokyo at night, glowing Japanese signs and holographic billboards reflecting on wet pavement, steam rising, colorful cinematic cyberpunk lighting",
  },
  {
    id: "serengeti",
    label: "Serengeti Safari",
    emoji: "🦁",
    thumb: "/presets/env-serengeti.png",
    gradient: "from-amber-400 via-orange-500 to-yellow-600",
    scenePrompt:
      "the golden African savanna of the Serengeti at sunset, tall grass swaying, acacia trees on the horizon, herds of elephants, giraffes and zebras roaming across the wide open plains",
    imagePrompt:
      "photorealistic golden African savanna of the Serengeti at sunset, acacia trees silhouetted on the horizon, herds of elephants giraffes and zebras across open grassland, warm golden-hour light",
  },
  {
    id: "mars",
    label: "Mars Frontier",
    emoji: "🪐",
    thumb: "/presets/env-mars.png",
    gradient: "from-red-500 via-orange-600 to-amber-700",
    scenePrompt:
      "the rugged red surface of Mars, towering rust-colored canyons and rolling dunes, a distant research base with solar panels and rovers, a pale pink dusty sky overhead",
    imagePrompt:
      "photorealistic rugged red surface of Mars, towering rust-colored canyons and sand dunes, a distant research base with solar panels and rovers, pale pink dusty sky, cinematic realism",
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
  {
    id: "motorcyclist",
    label: "Motorcycle Racer",
    emoji: "🏍️",
    thumb: "/presets/char-motorcyclist.png",
    gradient: "from-rose-500 via-red-500 to-orange-500",
    scenePrompt:
      "a man in full racing leathers and a helmet riding a fast sport motorcycle, leaning low into the turns",
    imagePrompt:
      "a man in photorealistic racing leathers and a helmet riding a fast sport motorcycle, seen from behind, leaning into a turn on the track",
  },
  {
    id: "street-walker",
    label: "Street Wanderer",
    emoji: "🚶",
    thumb: "/presets/char-street-walker.png",
    gradient: "from-pink-500 via-fuchsia-500 to-purple-500",
    scenePrompt:
      "a man in a plain white shirt walking calmly down the busy street, about to be covered in bright Holi colors",
    imagePrompt:
      "a man in a plain white shirt walking down a busy street seen from behind, about to be splashed with bright Holi colored powder, photorealistic",
  },
  {
    id: "courier",
    label: "Cyberpunk Courier",
    emoji: "🛹",
    thumb: "/presets/char-courier.png",
    gradient: "from-cyan-400 via-sky-500 to-violet-600",
    scenePrompt:
      "a young courier in a glowing neon-trimmed jacket riding a hoverboard through the city, a holographic backpack on their shoulders",
    imagePrompt:
      "a young courier in a glowing neon-trimmed jacket riding a hoverboard, seen from behind, with a holographic backpack, photorealistic cyberpunk style",
  },
  {
    id: "ranger",
    label: "Safari Ranger",
    emoji: "🧭",
    thumb: "/presets/char-ranger.png",
    gradient: "from-lime-500 via-green-600 to-emerald-700",
    scenePrompt:
      "a safari ranger in a wide-brim hat and khaki gear with binoculars around their neck, walking across the savanna",
    imagePrompt:
      "a safari ranger in a wide-brim hat and khaki gear with binoculars, seen from behind walking across the golden savanna, photorealistic",
  },
  {
    id: "astronaut",
    label: "Mars Astronaut",
    emoji: "👩‍🚀",
    thumb: "/presets/char-astronaut.png",
    gradient: "from-slate-400 via-zinc-500 to-stone-600",
    scenePrompt:
      "an astronaut in a sleek white-and-orange spacesuit exploring the Martian terrain, boots kicking up red dust",
    imagePrompt:
      "an astronaut in a sleek white and orange spacesuit, seen from behind exploring rocky red Martian terrain, kicking up red dust, photorealistic",
  },
];

export function findPreset(list: Preset[], id: string | null): Preset | undefined {
  if (!id) return undefined;
  return list.find((p) => p.id === id);
}
