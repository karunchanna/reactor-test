"use client";

import { useState } from "react";
import { useLingbotCommandError, useLingbotState } from "@reactor-models/lingbot";

// Surfaces out-of-band command_error events (e.g. start before conditions are
// set). Clears itself on the next state snapshot so a stale banner can't pile up.
export function CommandErrorBanner() {
  const [error, setError] = useState<{ command: string; reason: string } | null>(
    null,
  );

  useLingbotCommandError((msg) => {
    setError({ command: msg.command, reason: msg.reason });
  });

  useLingbotState(() => {
    setError(null);
  });

  if (!error) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto max-w-md rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 shadow-lg">
        <p className="text-sm font-bold text-red-700">
          “{error.command}” didn’t work
        </p>
        <p className="text-xs text-red-600">{error.reason}</p>
      </div>
    </div>
  );
}
