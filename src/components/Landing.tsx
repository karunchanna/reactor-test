"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CHARACTERS, ENVIRONMENTS, type Preset } from "@/lib/scenes";
import { buildScenePrompt } from "@/lib/prompt";
import type { Adventure } from "@/lib/types";

export function Landing({ onStart }: { onStart: (a: Adventure) => void }) {
  const [envId, setEnvId] = useState<string | null>(null);
  const [charId, setCharId] = useState<string | null>(null);
  const [envText, setEnvText] = useState("");
  const [charText, setCharText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const env = useMemo(
    () => resolve(ENVIRONMENTS, envId, envText, "Custom world"),
    [envId, envText],
  );
  const char = useMemo(
    () => resolve(CHARACTERS, charId, charText, "Custom hero"),
    [charId, charText],
  );

  const ready = !!env && !!char && !loading;

  async function explore() {
    if (!env || !char) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seed-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environmentText: env.imagePrompt,
          characterText: char.imagePrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || data?.error || "Image generation failed.");
      }

      onStart({
        environmentLabel: env.label,
        characterLabel: char.label,
        scenePrompt: buildScenePrompt(env.scenePrompt, char.scenePrompt),
        seedImageDataUrl: `data:image/png;base64,${data.image_b64}`,
        seed: Math.floor(Math.random() * 1_000_000),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-500 bg-clip-text text-4xl font-black text-transparent sm:text-6xl">
          World Explorer
        </h1>
        <p className="mt-3 text-lg font-semibold text-slate-600">
          Pick a world and a hero, then explore it for 60 magical seconds!
        </p>
      </header>

      <Section
        title="1. Choose your world"
        emoji="🌍"
        presets={ENVIRONMENTS}
        selectedId={envId}
        onSelect={(id) => {
          setEnvId(id);
          setEnvText("");
        }}
        freeText={envText}
        onFreeText={(v) => {
          setEnvText(v);
          if (v) setEnvId(null);
        }}
        placeholder="…or describe your own world (e.g. a candy city under the sea)"
      />

      <Section
        title="2. Choose your hero"
        emoji="🦸"
        presets={CHARACTERS}
        selectedId={charId}
        onSelect={(id) => {
          setCharId(id);
          setCharText("");
        }}
        freeText={charText}
        onFreeText={(v) => {
          setCharText(v);
          if (v) setCharId(null);
        }}
        placeholder="…or describe your own hero (e.g. a tiny robot on a hoverboard)"
      />

      {error && (
        <p className="mt-6 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="sticky bottom-4 mt-10 flex justify-center">
        <button
          type="button"
          disabled={!ready}
          onClick={() => void explore()}
          className="flex items-center gap-3 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-10 py-4 text-xl font-black text-white shadow-2xl transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Dreaming up your world…
            </>
          ) : (
            <>🚀 Start exploring</>
          )}
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  emoji,
  presets,
  selectedId,
  onSelect,
  freeText,
  onFreeText,
  placeholder,
}: {
  title: string;
  emoji: string;
  presets: Preset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  freeText: string;
  onFreeText: (v: string) => void;
  placeholder: string;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-2xl font-extrabold text-slate-700">
        <span className="mr-2">{emoji}</span>
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {presets.map((p) => {
          const active = selectedId === p.id && !freeText;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={[
                "group overflow-hidden rounded-3xl border-4 bg-white text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl",
                active ? "border-violet-500 ring-4 ring-violet-200" : "border-white",
              ].join(" ")}
            >
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-slate-100">
                <Image
                  src={p.thumb}
                  alt={p.label}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition group-hover:scale-105"
                />
                {active && (
                  <span className="absolute right-2 top-2 rounded-full bg-violet-600 px-2 py-1 text-xs font-bold text-white shadow">
                    ✓ Picked
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 px-4 py-3">
                <span className="text-xl">{p.emoji}</span>
                <span className="font-bold text-slate-700">{p.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      <input
        type="text"
        value={freeText}
        onChange={(e) => onFreeText(e.target.value)}
        placeholder={placeholder}
        className="mt-4 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />
    </section>
  );
}

function resolve(
  list: Preset[],
  selectedId: string | null,
  freeText: string,
  customLabel: string,
): { label: string; scenePrompt: string; imagePrompt: string } | null {
  const text = freeText.trim();
  if (text) {
    return {
      label: text.length > 28 ? `${text.slice(0, 28)}…` : text,
      scenePrompt: text,
      imagePrompt: text,
    };
  }
  const preset = list.find((p) => p.id === selectedId);
  if (preset) {
    return {
      label: preset.label,
      scenePrompt: preset.scenePrompt,
      imagePrompt: preset.imagePrompt,
    };
  }
  void customLabel;
  return null;
}
