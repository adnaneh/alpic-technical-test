"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function useSocketAudio(
  audioRef: React.RefObject<HTMLAudioElement | null>
): string | null {
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const socket = io("/", { path: "/socket.io/", transports: ["websocket", "polling"] });

    socket.on("connect", () => setSocketId(socket.id ?? null));
    socket.on("disconnect", () => setSocketId(null));

    const withAudio = (action: (audio: HTMLAudioElement) => void) =>
      audioRef.current ? action(audioRef.current) : console.error("Audio element not found");

    const safePlay = () =>
      withAudio(a => a.play().catch(err => console.error("Play failed:", err)));

    socket.on("play", ({ url, start_sec = 0 }) =>
      withAudio(a => {
        a.pause();
        a.src = url;
        a.currentTime = start_sec;
        safePlay();
      })
    );

    socket.on("pause", () => withAudio(a => a.pause()));
    socket.on("resume", safePlay);

    return () => {
      socket.disconnect();
    };
  }, [audioRef]);

  return socketId;
}
