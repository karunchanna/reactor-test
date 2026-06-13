import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { emptyGameLoop, type GameLoop } from "@/lib/gameLoop";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You parse freeform gameplay rules for a kids' real-time AI world-exploration game into a structured JSON spec.

Map the user's rules into four capabilities:
1. counters — HUD stats (coins collected, lives, distance, etc.) with id, label, emoji, initial, optional min/max.
2. scenePrompts — clickable buttons that change the scene; each needs id, label, emoji, and a short LingBot-friendly prompt (describe what the world becomes, no camera instructions).
3. events — things that happen automatically: timed (atSeconds) or counter-triggered (whenCounter with op >=, <=, ==). May include prompt and/or counterEffects.
4. monitors — only when the user wants to WATCH/COUNT things visible in the video (coins on screen, enemies, etc.). Each needs id, question (what to count/observe), counterId, mode (increment or set), everySeconds (3-15).

Rules:
- Keep prompts short and aligned with third-person exploration (character seen from behind).
- Use snake_case ids (e.g. coins_collected, make_night).
- If the loop text is vague, infer reasonable kid-game defaults.
- Empty or minimal loop text: return empty arrays.
- basePromptAdditions: optional one sentence of extra world flavor for the base prompt.

Respond with valid JSON only: { basePromptAdditions?, counters[], scenePrompts[], events[], monitors[] }`;

export async function POST(req: NextRequest) {
  let body: {
    loopText?: string;
    environmentLabel?: string;
    characterLabel?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const loopText = (body.loopText ?? "").trim();
  if (!loopText) {
    return NextResponse.json({ gameLoop: emptyGameLoop() });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  const envLabel = body.environmentLabel ?? "the world";
  const charLabel = body.characterLabel ?? "the hero";

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `World: ${envLabel}\nHero: ${charLabel}\n\nLoop rules:\n${loopText}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "LLM returned no content." },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(raw) as GameLoop;
    const gameLoop: GameLoop = {
      basePromptAdditions: parsed.basePromptAdditions?.trim() || undefined,
      counters: parsed.counters ?? [],
      scenePrompts: parsed.scenePrompts ?? [],
      events: parsed.events ?? [],
      monitors: parsed.monitors ?? [],
    };

    return NextResponse.json({ gameLoop });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to parse game loop.", detail: message },
      { status: 502 },
    );
  }
}
