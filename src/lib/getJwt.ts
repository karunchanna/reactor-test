// Lazy JWT resolver used by <LingbotProvider> and the recording components.
// Calls our server route, which mints a short-lived token from the API key.
export async function getJwt(): Promise<string> {
  const res = await fetch("/api/reactor/token", { method: "POST" });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Failed to mint Reactor token (${res.status}). ${detail}`);
  }
  const { jwt } = await res.json();
  if (!jwt) throw new Error("Token endpoint returned no jwt.");
  return jwt as string;
}
