"use client";

import { LingbotMainVideoView } from "@reactor-models/lingbot";

// Typed wrapper around <ReactorView track="main_video">. Style the outer
// container; never reach for the underlying <video> element.
export function Video() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border-4 border-white/70 bg-black shadow-2xl">
      <LingbotMainVideoView
        className="h-full w-full"
        videoObjectFit="cover"
      />
    </div>
  );
}
