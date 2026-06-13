// Prompt builders shared by the client (LingBot scene prompt) and the
// seed-image API route (OpenAI image prompt).
//
// The LingBot Prompt Guide recommends keeping the three conditions aligned
// (text vs seed image vs action) and describing the camera in position-only
// terms. We structure the live prompt into four explicit layers —
// Actions / World / Character / Dynamics — and keep the seed image aligned
// with it: same third-person, back-to-camera framing.

const MAX_PROMPT_CHARS = 1000;

/**
 * Build the structured LingBot scene prompt that steers the live world.
 *
 * Layers:
 * - Actions:    how the avatar moves (aligned with set_movement; forward-biased).
 * - World:      the environment + NPCs across near/mid/far depth.
 * - Character:  the main avatar + equipment, shown from behind (back to camera).
 * - Dynamics:   perspective (third-person, camera behind & above) + physics.
 */
export function buildScenePrompt(
  environmentFragment: string,
  characterFragment: string,
  baseAdditions?: string,
): string {
  const env = environmentFragment.trim();
  const char = characterFragment.trim();
  const extra = baseAdditions?.trim();

  const prompt = [
    `Actions: a third-person exploration adventure where the hero travels forward through the world at a gentle, steady pace, advancing when guided and holding still when idle.`,
    `World: ${env}; small friendly inhabitants and creatures move about across the near, middle, and far distance, with a bright open horizon.`,
    `Character: ${char}, seen from behind with their back to the camera and facing into the scene, kept fairly small and centered in the lower-middle of the frame so plenty of the world stays visible around and ahead of them, with outfit and equipment visible from the rear.`,
    `Dynamics: third-person camera floating just behind and slightly above the hero and smoothly tracking them; believable gravity and physics, gentle parallax depth, and bright whimsical storybook animation lighting with vivid saturated colors.`,
    extra ? `Loop: ${extra}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return clamp(prompt, MAX_PROMPT_CHARS);
}

/**
 * Build the OpenAI prompt for the single combined seed frame.
 *
 * Critically: the character is rendered from BEHIND (back to camera), facing
 * into the world, so the first LingBot frame matches the forward-walking POV.
 */
export function buildImagePrompt(
  environmentFragment: string,
  characterFragment: string,
): string {
  const env = environmentFragment.trim();
  const char = characterFragment.trim();

  return [
    `Children's animated film concept art, vibrant and whimsical, family friendly.`,
    `Third-person view from behind: ${char}, seen from behind with their back fully to the camera, facing away into the scene. The character is fairly small in the frame, positioned in the lower-middle and standing a short distance ahead of the camera, leaving plenty of the world visible around and above them; outfit and equipment visible from the rear, no face visible.`,
    `Setting: ${env}, with a few small friendly inhabitants in the mid and far distance.`,
    `Wide cinematic shot, camera slightly above and behind the character, strong sense of depth leading toward the horizon. Bright saturated colors, soft magical lighting, highly detailed painterly storybook style. No text, no watermark, no UI.`,
  ].join(" ");
}

/**
 * Build an OpenAI images.edit prompt when the user supplied reference uploads.
 */
export function buildImageEditPrompt(
  environmentFragment: string,
  characterFragment: string,
  options: { hasEnvUpload: boolean; hasCharUpload: boolean },
): string {
  const env =
    environmentFragment.trim() ||
    "the uploaded environment reference image";
  const char =
    characterFragment.trim() ||
    "the uploaded character reference image";

  if (options.hasEnvUpload && options.hasCharUpload) {
    return [
      buildImagePrompt(env, char),
      `Combine the uploaded environment and character reference images into one cohesive cinematic seed frame.`,
      `Honor the look of both references while placing the character from behind, back to camera, fairly small in the lower-middle of the frame.`,
    ].join(" ");
  }

  if (options.hasEnvUpload) {
    return [
      `Children's animated film concept art, vibrant and whimsical, family friendly.`,
      `Use the uploaded environment image as the setting and preserve its look.`,
      `Add ${char} into the scene, seen from behind with their back fully to the camera, facing away into the world. The character is fairly small in the frame, positioned in the lower-middle and standing a short distance ahead of the camera.`,
      `Wide cinematic shot, camera slightly above and behind the character. Bright saturated colors, soft magical lighting, highly detailed painterly storybook style. No text, no watermark, no UI.`,
    ].join(" ");
  }

  return [
    `Children's animated film concept art, vibrant and whimsical, family friendly.`,
    `Use the uploaded character reference for the hero's appearance, outfit, and equipment.`,
    `Place them in ${env}, seen from behind with their back fully to the camera, facing away into the scene. The character is fairly small in the frame, positioned in the lower-middle.`,
    `Wide cinematic shot, camera slightly above and behind the character. Bright saturated colors, soft magical lighting, highly detailed painterly storybook style. No text, no watermark, no UI.`,
  ].join(" ");
}

function clamp(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + "…";
}
