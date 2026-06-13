import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  let body: {
    imageB64?: string;
    monitors?: {
      id: string;
      question: string;
      counterId: string;
      mode: "increment" | "set";
    }[];
    counters?: Record<string, number>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const imageB64 = body.imageB64?.replace(/^data:image\/\w+;base64,/, "");
  const monitors = body.monitors ?? [];
  if (!imageB64 || monitors.length === 0) {
    return NextResponse.json(
      { error: "imageB64 and monitors are required." },
      { status: 400 },
    );
  }

  const counterSummary = JSON.stringify(body.counters ?? {});
  const questions = monitors
    .map(
      (m, i) =>
        `${i + 1}. monitorId="${m.id}" counterId="${m.counterId}" mode=${m.mode}: ${m.question}`,
    )
    .join("\n");

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are watching a frame from a kids' exploration game. Current counter values: ${counterSummary}.

For each monitor below, return a single non-negative number:
- mode "set": the current total/count you observe in the frame for that question.
- mode "increment": how many NEW instances appeared since last check (often 0 or 1).

Monitors:
${questions}

Return JSON only: { "results": [ { "monitorId": string, "value": number }, ... ] }`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageB64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "Vision model returned no content." },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(raw) as {
      results: { monitorId: string; value: number }[];
    };
    return NextResponse.json({ results: parsed.results ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Monitor analysis failed.", detail: message },
      { status: 502 },
    );
  }
}
