import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildImagePrompt } from "@/lib/prompt";

// Generating a single high-quality seed frame can take a while.
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  let body: { environmentText?: string; characterText?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const environmentText = (body.environmentText ?? "").trim();
  const characterText = (body.characterText ?? "").trim();

  if (!environmentText || !characterText) {
    return NextResponse.json(
      { error: "Both environmentText and characterText are required." },
      { status: 400 },
    );
  }

  const prompt = buildImagePrompt(environmentText, characterText);

  try {
    const openai = new OpenAI({ apiKey });
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      // Landscape frame close to LingBot's 1664x960 aspect ratio.
      size: "1536x1024",
      n: 1,
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "Image generation returned no image data." },
        { status: 502 },
      );
    }

    return NextResponse.json({ image_b64: b64, prompt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Image generation failed.", detail: message },
      { status: 502 },
    );
  }
}
