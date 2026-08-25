"use client";

import { useEffect, useRef } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

export function VideoPlayer({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const player = new Plyr(video, {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "pip",
        "airplay",
        "fullscreen",
      ],
      fullscreen: { enabled: true, fallback: true, iosNative: true },
      ratio: "16:9",
      storage: { enabled: false },
    });

    playerRef.current = player;

    return () => {
      player.destroy();
      playerRef.current = null;
    };
  }, [src]);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
      <video
        ref={videoRef}
        className="plyr-react plyr"
        playsInline
        controls
        title={title}
        src={src}
      >
        <source src={src} type="video/mp4" />
      </video>
      <p className="border-t border-zinc-800 px-4 py-2 text-xs text-zinc-500">
        Streaming from Cloudflare R2 · Prefer MP4 (H.264 + AAC) for phones and
        TVs
      </p>
    </div>
  );
}
