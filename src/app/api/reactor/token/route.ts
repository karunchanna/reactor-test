import { NextResponse } from "next/server";

// Mint a short-lived Reactor JWT from the server-side API key.
// The `rk_...` key must never reach the browser; the client only ever
// sees the returned JWT (valid up to 6 hours).
export async function POST() {
  const apiKey = process.env.REACTOR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "REACTOR_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  try {
    const result = await fetch("https://api.reactor.inc/tokens", {
      method: "POST",
      headers: {
        "Reactor-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      // Shorten the token lifetime; an exploration session is short-lived.
      body: JSON.stringify({ expires_after: 60 * 30 }),
    });

    if (!result.ok) {
      const detail = await result.text();
      return NextResponse.json(
        { error: `Reactor token request failed (${result.status})`, detail },
        { status: 502 },
      );
    }

    const { jwt, expires_at } = await result.json();
    return NextResponse.json({ jwt, expires_at });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not reach the Reactor token endpoint.", detail: String(err) },
      { status: 502 },
    );
  }
}
