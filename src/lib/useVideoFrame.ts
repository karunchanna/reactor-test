"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLingbotTrack } from "@reactor-models/lingbot";

const CAPTURE_WIDTH = 512;

/**
 * Captures downscaled JPEG frames from the LingBot main_video track via an
 * offscreen video element (does not touch the visible ReactorView).
 */
export function useVideoFrame() {
  const track = useLingbotTrack("main_video");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!track) return;

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    const stream = new MediaStream([track]);
    video.srcObject = stream;
    streamRef.current = stream;
    videoRef.current = video;

    void video.play().catch(() => {});

    return () => {
      video.pause();
      video.srcObject = null;
      streamRef.current = null;
      videoRef.current = null;
    };
  }, [track]);

  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) {
      return null;
    }

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvasRef.current = canvas;
    }

    const scale = CAPTURE_WIDTH / video.videoWidth;
    canvas.width = CAPTURE_WIDTH;
    canvas.height = Math.round(video.videoHeight * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  }, []);

  return { capture, hasTrack: !!track };
}
