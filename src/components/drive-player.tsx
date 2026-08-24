"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  drivePreviewUrl,
  driveStreamUrls,
  extractDriveFileId,
} from "@/lib/drive";

type Mode = "html5" | "embed";

export function DrivePlayer({
  driveUrl,
  title,
}: {
  driveUrl: string;
  title: string;
}) {
  const fileId = extractDriveFileId(driveUrl);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? null;
  const streams = useMemo(
    () => (fileId ? driveStreamUrls(fileId, apiKey) : []),
    [fileId, apiKey],
  );
  const embedUrl = drivePreviewUrl(driveUrl);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("html5");
  const [html5Failed, setHtml5Failed] = useState(false);
  const [status, setStatus] = useState("Loading video…");

  useEffect(() => {
    setSourceIndex(0);
    setMode("html5");
    setHtml5Failed(false);
    setStatus("Loading video…");
  }, [driveUrl]);

  const currentSrc = streams[sourceIndex] ?? null;

  const tryNextSource = useCallback(() => {
    setSourceIndex((current) => {
      if (current + 1 < streams.length) {
        setStatus("Trying another stream…");
        return current + 1;
      }
      setHtml5Failed(true);
      setMode("embed");
      setStatus("Direct stream blocked by Drive — using backup player.");
      return current;
    });
  }, [streams.length]);

  const enterFullscreen = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const anyVideo = video as HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
      };

      // iPhone / iPad Safari
      if (typeof anyVideo.webkitEnterFullscreen === "function") {
        anyVideo.webkitEnterFullscreen();
        return;
      }

      if (video.requestFullscreen) {
        await video.requestFullscreen();
        return;
      }

      const container = video.parentElement;
      if (container?.requestFullscreen) {
        await container.requestFullscreen();
      }
    } catch {
      setStatus("Fullscreen was blocked by the browser.");
    }
  }, []);

  if (!fileId || streams.length === 0) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-6 text-sm text-red-200">
        Could not read this Drive link. Paste a normal Google Drive file share
        URL.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
      <div className="relative aspect-video w-full bg-black">
        {mode === "html5" && currentSrc && !html5Failed ? (
          <video
            key={currentSrc}
            ref={videoRef}
            className="absolute inset-0 h-full w-full bg-black object-contain"
            controls
            playsInline
            preload="metadata"
            title={title}
            src={currentSrc}
            controlsList="nodownload"
            onLoadStart={() => setStatus("Loading video…")}
            onLoadedData={() => setStatus("")}
            onCanPlay={() => setStatus("")}
            onError={() => tryNextSource()}
          />
        ) : embedUrl ? (
          <iframe
            src={`${embedUrl}?usp=drivesdk`}
            title={title}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-zinc-300">
            Could not start playback for this file.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-800 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center">
        {mode === "html5" && !html5Failed ? (
          <button
            type="button"
            onClick={enterFullscreen}
            className="min-h-11 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950"
          >
            Full screen
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => {
            if (mode === "html5") {
              setMode("embed");
              setStatus("Switched to Drive embed backup.");
            } else {
              setMode("html5");
              setHtml5Failed(false);
              setSourceIndex(0);
              setStatus("Loading video…");
            }
          }}
          className="min-h-11 rounded-lg border border-zinc-600 px-4 py-2.5 text-sm text-zinc-200"
        >
          {mode === "html5" ? "Use Drive embed" : "Use HTML5 player"}
        </button>

        <p className="text-xs leading-5 text-zinc-500 sm:ml-1">
          {status ||
            "HTML5 player works best on phones. Prefer MP4 (H.264). Share as Anyone with the link."}
        </p>
      </div>
    </div>
  );
}
