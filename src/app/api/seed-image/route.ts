import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { buildImageEditPrompt, buildImagePrompt } from "@/lib/prompt";

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

  let body: {
    environmentText?: string;
    characterText?: string;
    environmentImageB64?: string;
    characterImageB64?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const environmentText = (body.environmentText ?? "").trim();
  const characterText = (body.characterText ?? "").trim();
  const environmentImageB64 = (body.environmentImageB64 ?? "").trim();
  const characterImageB64 = (body.characterImageB64 ?? "").trim();

  const hasEnvUpload = !!environmentImageB64;
  const hasCharUpload = !!characterImageB64;

  if (!environmentText && !hasEnvUpload) {
    return NextResponse.json(
      { error: "Provide environmentText and/or environmentImageB64." },
      { status: 400 },
    );
  }
  if (!characterText && !hasCharUpload) {
    return NextResponse.json(
      { error: "Provide characterText and/or characterImageB64." },
      { status: 400 },
    );
  }

  const envFragment =
    environmentText || "match the uploaded environment reference";
  const charFragment =
    characterText || "match the uploaded character reference";

  const prompt = hasEnvUpload || hasCharUpload
    ? buildImageEditPrompt(envFragment, charFragment, {
        hasEnvUpload,
        hasCharUpload,
      })
    : buildImagePrompt(envFragment, charFragment);

  try {
    const openai = new OpenAI({ apiKey });

    let b64: string | undefined;

    if (hasEnvUpload || hasCharUpload) {
      const uploads = [];
      if (hasEnvUpload) {
        uploads.push(
          await toFile(
            Buffer.from(environmentImageB64, "base64"),
            "environment.png",
            { type: "image/png" },
          ),
        );
      }
      if (hasCharUpload) {
        uploads.push(
          await toFile(
            Buffer.from(characterImageB64, "base64"),
            "character.png",
            { type: "image/png" },
          ),
        );
      }

      const result = await openai.images.edit({
        model: "gpt-image-1",
        image: uploads.length === 1 ? uploads[0] : uploads,
        prompt,
        size: "1536x1024",
        input_fidelity: "high",
      });

      b64 = result.data?.[0]?.b64_json;
    } else {
      const result = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        // Landscape frame close to LingBot's 1664x960 aspect ratio.
        size: "1536x1024",
        n: 1,
      });

      b64 = result.data?.[0]?.b64_json;
    }

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
