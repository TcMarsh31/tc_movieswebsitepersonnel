"use client";

import { drivePreviewUrl } from "@/lib/drive";

export function DrivePlayer({
  driveUrl,
  title,
}: {
  driveUrl: string;
  title: string;
}) {
  const preview = drivePreviewUrl(driveUrl);

  if (!preview) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-6 text-sm text-red-200">
        Could not read this Drive link. Paste a normal Google Drive file share
        URL.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
      <div className="relative aspect-video w-full">
        <iframe
          src={preview}
          title={title}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <p className="border-t border-zinc-800 px-4 py-2 text-xs text-zinc-500">
        Uses Google Drive&apos;s player. File must be &quot;Anyone with the
        link&quot;.
      </p>
    </div>
  );
}
