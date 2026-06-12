"use client";

import { useState } from "react";
import { Landing } from "./Landing";
import { ExplorerSession } from "./ExplorerSession";
import type { Adventure } from "@/lib/types";

export function App() {
  const [adventure, setAdventure] = useState<Adventure | null>(null);

  if (!adventure) {
    return <Landing onStart={setAdventure} />;
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[110rem] flex-col p-4">
      <ExplorerSession
        // Remount cleanly for each new adventure so the session state resets.
        key={`${adventure.seed}`}
        adventure={adventure}
        onExit={() => setAdventure(null)}
      />
    </div>
  );
}
