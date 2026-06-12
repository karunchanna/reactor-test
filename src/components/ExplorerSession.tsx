"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LingbotProvider,
  useLingbot,
  useLingbotImageAccepted,
  useLingbotState,
  useLingbotGenerationComplete,
  type LingbotStateMessage,
} from "@reactor-models/lingbot";
import { RecordingError, type Clip } from "@reactor-team/js-sdk";
import { getJwt } from "@/lib/getJwt";
import { type Adventure, EXPLORE_SECONDS } from "@/lib/types";
import { Video } from "./Video";
import { MovementControls } from "./MovementControls";
import { StatusBadge } from "./StatusBadge";
import { NowPlaying } from "./NowPlaying";
import { CommandErrorBanner } from "./CommandErrorBanner";
import { Countdown } from "./Countdown";
import { ClipModal } from "./ClipModal";

export function ExplorerSession({
  adventure,
  onExit,
}: {
  adventure: Adventure;
  onExit: () => void;
}) {
  return (
    <LingbotProvider getJwt={getJwt} connectOptions={{ autoConnect: true }}>
      <SessionInner adventure={adventure} onExit={onExit} />
      <CommandErrorBanner />
    </LingbotProvider>
  );
}

type Phase = "launching" | "exploring" | "timeup";

function SessionInner({
  adventure,
  onExit,
}: {
  adventure: Adventure;
  onExit: () => void;
}) {
  const {
    status,
    uploadFile,
    setImage,
    setSeed,
    setPrompt,
    start,
    pause,
    reset,
    setMovement,
    setLookHorizontal,
    setLookVertical,
    requestRecording,
    requestClip,
    disconnect,
  } = useLingbot();

  const [phase, setPhase] = useState<Phase>("launching");
  const [snapshot, setSnapshot] = useState<LingbotStateMessage | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(EXPLORE_SECONDS);
  const [clip, setClip] = useState<Clip | null>(null);
  const [clipTitle, setClipTitle] = useState("Your adventure");
  const [capturing, setCapturing] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const launchedRef = useRef(false);
  const imageReadyRef = useRef<(() => void) | null>(null);
  const timerStartedRef = useRef(false);
  const timeUpHandledRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleTimeUpRef = useRef<() => void>(() => {});

  // Resolve the load-bearing image_accepted wait.
  useLingbotImageAccepted(() => {
    imageReadyRef.current?.();
    imageReadyRef.current = null;
  });

  // Snapshot is the source of truth for the UI.
  useLingbotState((msg) => setSnapshot(msg));

  // When a run finishes the server auto-restarts it; we don't reset here so the
  // world keeps streaming until the timer ends. (Hook present to exercise the API.)
  useLingbotGenerationComplete(() => {});

  // Launch sequence: uploadFile -> setImage -> await image_accepted -> setSeed
  // -> setPrompt -> start.
  const launch = useCallback(async () => {
    try {
      const blob = await fetch(adventure.seedImageDataUrl).then((r) => r.blob());

      // Park the resolver BEFORE calling setImage so we can't miss the ack.
      const imageReady = new Promise<void>((resolve) => {
        imageReadyRef.current = resolve;
      });

      const ref = await uploadFile(blob, { name: "seed.png" });
      await setImage({ image: ref });
      await imageReady;

      await setSeed({ seed: adventure.seed });
      await setPrompt({ prompt: adventure.scenePrompt });
      await start();
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : String(err));
    }
  }, [adventure, uploadFile, setImage, setSeed, setPrompt, start]);

  useEffect(() => {
    if (status !== "ready" || launchedRef.current) return;
    launchedRef.current = true;
    void launch();
  }, [status, launch]);

  const handleTimeUp = useCallback(async () => {
    if (timeUpHandledRef.current) return;
    timeUpHandledRef.current = true;
    setPhase("timeup");

    try {
      await setMovement({ movement: "idle" });
      await setLookHorizontal({ look_horizontal: "idle" });
      await setLookVertical({ look_vertical: "idle" });
      await pause();
    } catch {
      // best-effort stop
    }

    setCapturing(true);
    try {
      const captured = await requestRecording();
      setClipTitle("Your 30-second adventure!");
      setClip(captured);
    } catch (err) {
      setCaptureError(
        err instanceof RecordingError
          ? `${err.code}: ${err.reason}`
          : err instanceof Error
            ? err.message
            : String(err),
      );
    } finally {
      setCapturing(false);
    }
  }, [
    setMovement,
    setLookHorizontal,
    setLookVertical,
    pause,
    requestRecording,
  ]);

  // Keep a stable pointer to the latest time-up handler. The LingBot typed
  // setters aren't referentially stable, so we must not let the timer effect
  // depend on handleTimeUp directly (that would tear down the interval on
  // every incoming state message).
  useEffect(() => {
    handleTimeUpRef.current = () => void handleTimeUp();
  }, [handleTimeUp]);

  // Start the 30s timer exactly once, when frames first start streaming.
  // We intentionally depend only on the boolean `running` and never return a
  // cleanup here, so the interval survives `running` toggling at run
  // boundaries (the model auto-restarts runs). It's cleared on unmount below.
  const running = !!snapshot?.running;
  useEffect(() => {
    if (!running || timerStartedRef.current) return;
    timerStartedRef.current = true;
    setPhase("exploring");

    const startedAt = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const left = Math.max(0, EXPLORE_SECONDS - elapsed);
      setSecondsLeft(left);
      if (left <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        handleTimeUpRef.current();
      }
    }, 200);
  }, [running]);

  // Clear the timer only when the session unmounts.
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, []);

  const handleSnap = useCallback(async () => {
    setCapturing(true);
    try {
      const captured = await requestClip(10);
      setClipTitle("Snapshot: last 10 seconds");
      setClip(captured);
    } catch (err) {
      setCaptureError(
        err instanceof RecordingError
          ? `${err.code}: ${err.reason}`
          : err instanceof Error
            ? err.message
            : String(err),
      );
    } finally {
      setCapturing(false);
    }
  }, [requestClip]);

  const exploreAgain = useCallback(async () => {
    try {
      await reset();
    } catch {
      // ignore
    }
    onExit();
  }, [reset, onExit]);

  const leave = useCallback(async () => {
    try {
      await disconnect();
    } catch {
      // ignore
    }
    onExit();
  }, [disconnect, onExit]);

  const controlsEnabled = phase === "exploring" && !!snapshot?.running;
  const showLaunchOverlay =
    phase === "launching" && status !== "disconnected" && !launchError;

  return (
    <div className="relative flex h-full w-full flex-col gap-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StatusBadge />
          {phase !== "launching" && <Countdown secondsLeft={secondsLeft} />}
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
          <span className="hidden rounded-full bg-white/70 px-3 py-1 shadow sm:inline">
            {adventure.characterLabel} · {adventure.environmentLabel}
          </span>
          <button
            type="button"
            onClick={() => void leave()}
            className="rounded-full bg-white/80 px-4 py-2 shadow hover:bg-white"
          >
            ✕ Exit
          </button>
        </div>
      </div>

      {/* Video + controls */}
      <div className="flex flex-1 flex-col gap-4 lg:flex-row">
        <div className="flex min-h-[280px] flex-1 items-center justify-center">
          {/* Fixed 16:10 frame, sized to the largest box that fits the area. */}
          <div className="relative aspect-[16/10] w-full max-w-[calc((100dvh-7rem)*1.6)]">
            <Video />
            {showLaunchOverlay && <LaunchOverlay status={status} />}
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 lg:w-80">
          <NowPlaying
            snapshot={snapshot}
            capturing={capturing}
            onSnap={() => void handleSnap()}
          />
          <div className="rounded-3xl bg-white/80 p-4 shadow-md backdrop-blur">
            <MovementControls
              enabled={controlsEnabled}
              rotationSpeedDeg={snapshot?.rotation_speed_deg ?? 5}
            />
          </div>
        </div>
      </div>

      {launchError && (
        <ErrorCard
          title="Couldn’t start the world"
          message={launchError}
          onExit={() => void leave()}
        />
      )}

      {phase === "timeup" && !clip && (
        <TimeUpOverlay
          capturing={capturing}
          error={captureError}
          onAgain={() => void exploreAgain()}
          onLeave={() => void leave()}
        />
      )}

      {clip && (
        <>
          <ClipModal
            clip={clip}
            title={clipTitle}
            onClose={() => {
              setClip(null);
            }}
          />
          {phase === "timeup" && (
            <TimeUpActions
              onAgain={() => void exploreAgain()}
              onLeave={() => void leave()}
            />
          )}
        </>
      )}
    </div>
  );
}

function LaunchOverlay({ status }: { status: string }) {
  const message =
    status === "waiting"
      ? "Finding a magic portal (GPU)…"
      : status === "connecting"
        ? "Opening the portal…"
        : "Painting your world…";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl bg-violet-950/60 text-white backdrop-blur-sm">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      <p className="text-lg font-bold">{message}</p>
    </div>
  );
}

function TimeUpOverlay({
  capturing,
  error,
  onAgain,
  onLeave,
}: {
  capturing: boolean;
  error: string | null;
  onAgain: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
        <h2 className="text-2xl font-extrabold text-slate-800">Time’s up! ⏰</h2>
        {capturing ? (
          <p className="mt-2 text-slate-500">Saving your adventure movie…</p>
        ) : error ? (
          <p className="mt-2 text-sm text-red-600">Couldn’t save the clip: {error}</p>
        ) : (
          <p className="mt-2 text-slate-500">Great exploring!</p>
        )}
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={onAgain}
            className="rounded-full bg-violet-600 px-5 py-2 font-bold text-white shadow hover:bg-violet-700"
          >
            Explore again
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="rounded-full bg-slate-200 px-5 py-2 font-bold text-slate-600 hover:bg-slate-300"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}

function TimeUpActions({
  onAgain,
  onLeave,
}: {
  onAgain: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center gap-3 px-4">
      <button
        type="button"
        onClick={onAgain}
        className="rounded-full bg-violet-600 px-6 py-3 font-bold text-white shadow-xl hover:bg-violet-700"
      >
        Explore again
      </button>
      <button
        type="button"
        onClick={onLeave}
        className="rounded-full bg-white px-6 py-3 font-bold text-slate-600 shadow-xl hover:bg-slate-100"
      >
        Leave
      </button>
    </div>
  );
}

function ErrorCard({
  title,
  message,
  onExit,
}: {
  title: string;
  message: string;
  onExit: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
        <h2 className="text-xl font-extrabold text-red-600">{title}</h2>
        <p className="mt-2 break-words text-sm text-slate-500">{message}</p>
        <button
          type="button"
          onClick={onExit}
          className="mt-5 rounded-full bg-slate-200 px-5 py-2 font-bold text-slate-600 hover:bg-slate-300"
        >
          Back
        </button>
      </div>
    </div>
  );
}
