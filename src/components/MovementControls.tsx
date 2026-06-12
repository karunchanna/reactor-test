"use client";

import { useCallback, useEffect, useState } from "react";
import { useLingbot } from "@reactor-models/lingbot";

type Movement = "idle" | "forward" | "back" | "strafe_left" | "strafe_right";
type LookH = "idle" | "left" | "right";
type LookV = "idle" | "up" | "down";

const MOVEMENT_KEYS: Record<string, Movement> = {
  w: "forward",
  s: "back",
  a: "strafe_left",
  d: "strafe_right",
};
const LOOK_H_KEYS: Record<string, LookH> = { arrowleft: "left", arrowright: "right" };
const LOOK_V_KEYS: Record<string, LookV> = { arrowup: "up", arrowdown: "down" };

function isTypingTarget(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null;
  return !!(
    t &&
    (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
  );
}

export function MovementControls({
  enabled,
  rotationSpeedDeg,
}: {
  enabled: boolean;
  rotationSpeedDeg: number;
}) {
  const { setMovement, setLookHorizontal, setLookVertical, setRotationSpeedDeg } =
    useLingbot();

  // Local highlight state. The model snapshot lags a chunk behind the key
  // press, so we drive button highlights from local state for instant feedback.
  const [pressedMovement, setPressedMovement] = useState<Movement>("idle");
  const [pressedLookH, setPressedLookH] = useState<LookH>("idle");
  const [pressedLookV, setPressedLookV] = useState<LookV>("idle");

  const sendMovement = useCallback(
    (m: Movement) => {
      if (!enabled) return;
      setPressedMovement(m);
      void setMovement({ movement: m });
    },
    [enabled, setMovement],
  );
  const sendLookH = useCallback(
    (l: LookH) => {
      if (!enabled) return;
      setPressedLookH(l);
      void setLookHorizontal({ look_horizontal: l });
    },
    [enabled, setLookHorizontal],
  );
  const sendLookV = useCallback(
    (l: LookV) => {
      if (!enabled) return;
      setPressedLookV(l);
      void setLookVertical({ look_vertical: l });
    },
    [enabled, setLookVertical],
  );

  // Persistent-state axes: every keydown needs a matching keyup that sends idle.
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const k = e.key.toLowerCase();
      if (MOVEMENT_KEYS[k]) {
        e.preventDefault();
        sendMovement(MOVEMENT_KEYS[k]);
      } else if (LOOK_H_KEYS[k]) {
        e.preventDefault();
        sendLookH(LOOK_H_KEYS[k]);
      } else if (LOOK_V_KEYS[k]) {
        e.preventDefault();
        sendLookV(LOOK_V_KEYS[k]);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (MOVEMENT_KEYS[k]) sendMovement("idle");
      else if (LOOK_H_KEYS[k]) sendLookH("idle");
      else if (LOOK_V_KEYS[k]) sendLookV("idle");
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [enabled, sendMovement, sendLookH, sendLookV]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-center gap-6">
        {/* Move pad (WASD) */}
        <Pad title="Move (W A S D)">
          <PadButton
            label="W"
            active={pressedMovement === "forward"}
            disabled={!enabled}
            position="top"
            onPress={() => sendMovement("forward")}
            onRelease={() => sendMovement("idle")}
          />
          <PadButton
            label="A"
            active={pressedMovement === "strafe_left"}
            disabled={!enabled}
            position="left"
            onPress={() => sendMovement("strafe_left")}
            onRelease={() => sendMovement("idle")}
          />
          <PadButton
            label="S"
            active={pressedMovement === "back"}
            disabled={!enabled}
            position="bottom"
            onPress={() => sendMovement("back")}
            onRelease={() => sendMovement("idle")}
          />
          <PadButton
            label="D"
            active={pressedMovement === "strafe_right"}
            disabled={!enabled}
            position="right"
            onPress={() => sendMovement("strafe_right")}
            onRelease={() => sendMovement("idle")}
          />
        </Pad>

        {/* Look pad (arrows) */}
        <Pad title="Look (Arrows)">
          <PadButton
            label="↑"
            active={pressedLookV === "up"}
            disabled={!enabled}
            position="top"
            onPress={() => sendLookV("up")}
            onRelease={() => sendLookV("idle")}
          />
          <PadButton
            label="←"
            active={pressedLookH === "left"}
            disabled={!enabled}
            position="left"
            onPress={() => sendLookH("left")}
            onRelease={() => sendLookH("idle")}
          />
          <PadButton
            label="↓"
            active={pressedLookV === "down"}
            disabled={!enabled}
            position="bottom"
            onPress={() => sendLookV("down")}
            onRelease={() => sendLookV("idle")}
          />
          <PadButton
            label="→"
            active={pressedLookH === "right"}
            disabled={!enabled}
            position="right"
            onPress={() => sendLookH("right")}
            onRelease={() => sendLookH("idle")}
          />
        </Pad>
      </div>

      {/* Rotation speed slider — reads straight from the model snapshot. */}
      <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
        <span className="whitespace-nowrap">Turn speed</span>
        <input
          type="range"
          min={0}
          max={30}
          step={0.5}
          value={rotationSpeedDeg}
          disabled={!enabled}
          onChange={(e) =>
            setRotationSpeedDeg({ rotation_speed_deg: Number(e.target.value) })
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-violet-200 accent-violet-600 disabled:opacity-50"
        />
        <span className="w-12 text-right font-mono text-violet-700">
          {rotationSpeedDeg.toFixed(1)}°
        </span>
      </label>
    </div>
  );
}

function Pad({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative grid h-32 w-32 grid-cols-3 grid-rows-3">
        {children}
      </div>
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </span>
    </div>
  );
}

function PadButton({
  label,
  active,
  disabled,
  position,
  onPress,
  onRelease,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  position: "top" | "bottom" | "left" | "right";
  onPress: () => void;
  onRelease: () => void;
}) {
  const placement = {
    top: "col-start-2 row-start-1",
    bottom: "col-start-2 row-start-3",
    left: "col-start-1 row-start-2",
    right: "col-start-3 row-start-2",
  }[position];

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerLeave={() => {
        if (active) onRelease();
      }}
      className={[
        placement,
        "flex items-center justify-center rounded-xl border-2 text-lg font-extrabold transition select-none touch-none",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
          : active
            ? "border-violet-600 bg-violet-600 text-white shadow-lg scale-95"
            : "border-violet-300 bg-white text-violet-700 hover:bg-violet-50 active:scale-95",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
