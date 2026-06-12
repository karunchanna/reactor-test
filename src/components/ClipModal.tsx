"use client";

import { ClipDownloadButton, ClipPlayer, type Clip } from "@reactor-team/js-sdk";
import { getJwt } from "@/lib/getJwt";

// Preview + download a captured clip. ClipPlayer keeps working after the
// session has ended, so this modal is usable on the "time's up" screen too.
export function ClipModal({
  clip,
  title,
  onClose,
}: {
  clip: Clip;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-slate-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-500 hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-black">
          <ClipPlayer clip={clip} getJwt={getJwt} />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <ClipDownloadButton
            clip={clip}
            getJwt={getJwt}
            filename="my-adventure.mp4"
            className="rounded-full bg-violet-600 px-5 py-2 font-bold text-white shadow hover:bg-violet-700"
          >
            ⬇ Download my movie
          </ClipDownloadButton>
        </div>
      </div>
    </div>
  );
}
