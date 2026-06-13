"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { CHARACTERS, ENVIRONMENTS, type Preset } from "@/lib/scenes";
import { emptyGameLoop, type GameLoop } from "@/lib/gameLoop";
import { buildScenePrompt } from "@/lib/prompt";
import type { Adventure } from "@/lib/types";

import { LOOP_EXAMPLES } from "@/lib/loopExamples";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

type ResolvedChoice = {
  label: string;
  scenePrompt: string;
  imagePrompt: string;
  imageB64?: string;
};

export function Landing({ onStart }: { onStart: (a: Adventure) => void }) {
  const [envId, setEnvId] = useState<string | null>(null);
  const [charId, setCharId] = useState<string | null>(null);
  const [envText, setEnvText] = useState("");
  const [charText, setCharText] = useState("");
  const [envUpload, setEnvUpload] = useState<string | null>(null);
  const [charUpload, setCharUpload] = useState<string | null>(null);
  const [loopFreeText, setLoopFreeText] = useState("");
  const [loopExampleId, setLoopExampleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const env = useMemo(
    () =>
      resolve(ENVIRONMENTS, envId, envText, envUpload, "Custom world", "Uploaded world"),
    [envId, envText, envUpload],
  );
  const char = useMemo(
    () =>
      resolve(CHARACTERS, charId, charText, charUpload, "Custom hero", "Uploaded hero"),
    [charId, charText, charUpload],
  );

  const loopRules = useMemo(
    () => resolveLoop(loopExampleId, loopFreeText),
    [loopExampleId, loopFreeText],
  );

  const ready = !!env && !!char && !loading;

  async function explore() {
    if (!env || !char) return;
    setLoading(true);
    setError(null);
    try {
      const [seedRes, loopRes] = await Promise.all([
        fetch("/api/seed-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            environmentText: env.imagePrompt,
            characterText: char.imagePrompt,
            environmentImageB64: env.imageB64,
            characterImageB64: char.imageB64,
          }),
        }),
        fetch("/api/game-loop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loopText: loopRules,
            environmentLabel: env.label,
            characterLabel: char.label,
          }),
        }),
      ]);

      const seedData = await seedRes.json();
      const loopData = await loopRes.json();

      if (!seedRes.ok) {
        throw new Error(
          seedData?.detail || seedData?.error || "Image generation failed.",
        );
      }
      if (!loopRes.ok) {
        throw new Error(
          loopData?.detail || loopData?.error || "Game loop parse failed.",
        );
      }

      const gameLoop: GameLoop = loopData.gameLoop ?? emptyGameLoop();

      onStart({
        environmentLabel: env.label,
        characterLabel: char.label,
        scenePrompt: buildScenePrompt(
          env.scenePrompt,
          char.scenePrompt,
          gameLoop.basePromptAdditions,
        ),
        seedImageDataUrl: `data:image/png;base64,${seedData.image_b64}`,
        seed: Math.floor(Math.random() * 1_000_000),
        loopText: loopRules,
        gameLoop,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[110rem] flex-col px-4 py-6">
      <header className="mb-4 shrink-0 text-center">
        <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-500 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
          World Explorer
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate-600 sm:text-base">
          Pick a world, a hero, and write your own game loop — then explore for
          60 seconds!
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
        <PickerColumn
          title="Select a world"
          emoji="🌍"
          presets={ENVIRONMENTS}
          selectedId={envId}
          onSelect={(id) => {
            setEnvId(id);
            setEnvText("");
            setEnvUpload(null);
          }}
          freeText={envText}
          onFreeText={(v) => {
            setEnvText(v);
            if (v) setEnvId(null);
          }}
          uploadedImage={envUpload}
          onUpload={(dataUrl) => {
            setEnvUpload(dataUrl);
            setEnvId(null);
          }}
          onClearUpload={() => setEnvUpload(null)}
          onUploadError={setError}
          placeholder="Describe your world…"
        />

        <PickerColumn
          title="Select a character"
          emoji="🦸"
          presets={CHARACTERS}
          selectedId={charId}
          onSelect={(id) => {
            setCharId(id);
            setCharText("");
            setCharUpload(null);
          }}
          freeText={charText}
          onFreeText={(v) => {
            setCharText(v);
            if (v) setCharId(null);
          }}
          uploadedImage={charUpload}
          onUpload={(dataUrl) => {
            setCharUpload(dataUrl);
            setCharId(null);
          }}
          onClearUpload={() => setCharUpload(null)}
          onUploadError={setError}
          placeholder="Describe your hero…"
        />

        <LoopColumn
          freeText={loopFreeText}
          selectedId={loopExampleId}
          onFreeText={(v) => {
            setLoopFreeText(v);
            if (v) setLoopExampleId(null);
          }}
          onSelect={(id) => {
            setLoopExampleId(id);
            setLoopFreeText("");
          }}
        />
      </div>

      {error && (
        <p className="mt-3 shrink-0 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex shrink-0 justify-center">
        <button
          type="button"
          disabled={!ready}
          onClick={() => void explore()}
          className="flex items-center gap-3 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-10 py-4 text-xl font-black text-white shadow-2xl transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Building your adventure…
            </>
          ) : (
            <>🚀 Start exploring</>
          )}
        </button>
      </div>
    </div>
  );
}

function PickerColumn({
  title,
  emoji,
  presets,
  selectedId,
  onSelect,
  freeText,
  onFreeText,
  uploadedImage,
  onUpload,
  onClearUpload,
  onUploadError,
  placeholder,
}: {
  title: string;
  emoji: string;
  presets: Preset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  freeText: string;
  onFreeText: (v: string) => void;
  uploadedImage: string | null;
  onUpload: (dataUrl: string) => void;
  onClearUpload: () => void;
  onUploadError: (message: string | null) => void;
  placeholder: string;
}) {
  const inputId = useId();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onUploadError("Please choose an image file (PNG, JPG, or WebP).");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      onUploadError("Image must be 10 MB or smaller.");
      return;
    }

    try {
      onUploadError(null);
      const dataUrl = await readImageFile(file);
      onUpload(dataUrl);
    } catch {
      onUploadError("Could not read that image. Try another file.");
    }
  }

  const uploadActive = !!uploadedImage && !freeText && !selectedId;

  return (
    <div className="flex min-h-0 flex-col gap-3 rounded-3xl border-2 border-white/80 bg-white/60 p-4 shadow-md backdrop-blur">
      <h2 className="shrink-0 text-lg font-extrabold text-slate-700">
        <span className="mr-2">{emoji}</span>
        {title}
      </h2>

      <input
        type="text"
        value={freeText}
        onChange={(e) => onFreeText(e.target.value)}
        placeholder={placeholder}
        className="w-full shrink-0 rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />

      <div className="flex shrink-0 items-center gap-2">
        <input
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(e) => void handleFileChange(e)}
        />
        <label
          htmlFor={inputId}
          className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-violet-400 hover:text-violet-600"
        >
          📷 Upload image
        </label>
        {uploadedImage && (
          <button
            type="button"
            onClick={onClearUpload}
            className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
          >
            Remove upload
          </button>
        )}
      </div>

      {uploadedImage && (
        <div
          className={[
            "flex shrink-0 overflow-hidden rounded-2xl border-2 bg-white shadow",
            uploadActive
              ? "border-violet-500 ring-2 ring-violet-200"
              : "border-white",
          ].join(" ")}
        >
          <div className="relative h-28 w-40 shrink-0 overflow-hidden bg-slate-100 sm:h-32 sm:w-44">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedImage}
              alt="Uploaded reference"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-1 items-center gap-2 px-3 py-2">
            <span className="text-lg">📷</span>
            <span className="text-sm font-bold text-slate-700">
              Your upload
            </span>
            {uploadActive && (
              <span className="ml-auto text-xs font-bold text-violet-600">
                ✓
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {presets.map((p) => {
          const active =
            selectedId === p.id && !freeText && !uploadedImage;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={[
                "group flex shrink-0 overflow-hidden rounded-2xl border-2 bg-white text-left shadow transition hover:-translate-y-0.5 hover:shadow-lg",
                active
                  ? "border-violet-500 ring-2 ring-violet-200"
                  : "border-white",
              ].join(" ")}
            >
              {p.thumb ? (
                <div className="relative h-28 w-40 shrink-0 overflow-hidden bg-slate-100 sm:h-32 sm:w-44">
                  <Image
                    src={p.thumb}
                    alt={p.label}
                    fill
                    sizes="(max-width: 640px) 160px, 176px"
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>
              ) : (
                <div
                  className={[
                    "flex h-28 w-40 shrink-0 items-center justify-center bg-gradient-to-br sm:h-32 sm:w-44",
                    p.gradient ?? "from-violet-400 to-fuchsia-400",
                  ].join(" ")}
                >
                  <span className="text-4xl drop-shadow-md transition group-hover:scale-110">
                    {p.emoji}
                  </span>
                </div>
              )}
              <div className="flex flex-1 items-center gap-2 px-3 py-2">
                <span className="text-lg">{p.emoji}</span>
                <span className="text-sm font-bold text-slate-700">
                  {p.label}
                </span>
                {active && (
                  <span className="ml-auto text-xs font-bold text-violet-600">
                    ✓
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LoopColumn({
  freeText,
  selectedId,
  onFreeText,
  onSelect,
}: {
  freeText: string;
  selectedId: string | null;
  onFreeText: (v: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-3 rounded-3xl border-2 border-white/80 bg-white/60 p-4 shadow-md backdrop-blur">
      <h2 className="shrink-0 text-lg font-extrabold text-slate-700">
        <span className="mr-2">🔁</span>
        Loop
      </h2>

      <input
        type="text"
        value={freeText}
        onChange={(e) => onFreeText(e.target.value)}
        placeholder="Describe your game rules…"
        className="w-full shrink-0 rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {LOOP_EXAMPLES.map((ex) => {
          const active = selectedId === ex.id && !freeText;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onSelect(ex.id)}
              className={[
                "group flex shrink-0 overflow-hidden rounded-2xl border-2 bg-white text-left shadow transition hover:-translate-y-0.5 hover:shadow-lg",
                active
                  ? "border-violet-500 ring-2 ring-violet-200"
                  : "border-white",
              ].join(" ")}
            >
              <div className="flex w-full flex-col gap-1 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ex.emoji}</span>
                  <span className="text-sm font-bold text-slate-700">
                    {ex.label}
                  </span>
                  {active && (
                    <span className="ml-auto text-xs font-bold text-violet-600">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-slate-500">
                  {ex.summary}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function resolveLoop(selectedId: string | null, freeText: string): string {
  const text = freeText.trim();
  if (text) return text;
  const preset = LOOP_EXAMPLES.find((e) => e.id === selectedId);
  return preset?.text ?? "";
}

function resolve(
  list: Preset[],
  selectedId: string | null,
  freeText: string,
  uploadedImage: string | null,
  customLabel: string,
  uploadLabel: string,
): ResolvedChoice | null {
  const text = freeText.trim();
  const preset = list.find((p) => p.id === selectedId);
  const uploadB64 = uploadedImage ? dataUrlToB64(uploadedImage) : undefined;

  if (uploadB64) {
    const prompt = text || preset?.imagePrompt || preset?.scenePrompt || uploadLabel;
    const label = text
      ? text.length > 28
        ? `${text.slice(0, 28)}…`
        : text
      : preset?.label ?? uploadLabel;
    return {
      label,
      scenePrompt: text || preset?.scenePrompt || uploadLabel,
      imagePrompt: prompt,
      imageB64: uploadB64,
    };
  }

  if (text) {
    return {
      label: text.length > 28 ? `${text.slice(0, 28)}…` : text,
      scenePrompt: text,
      imagePrompt: text,
    };
  }

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

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Unexpected read result"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

function dataUrlToB64(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}
