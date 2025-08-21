"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function useSocketAudio(
  audioRef: React.RefObject<HTMLAudioElement | null>
): string | null {
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const base = (process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "").trim();
    const url = base || "/";
    const socket = io(url, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
      timeout: 10000,
    });

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

    socket.on("connect_error", (err) => console.warn("Socket connect error:", err?.message || err));
    socket.on("error", (err) => console.warn("Socket error:", err));

    return () => {
      socket.disconnect();
    };
  }, [audioRef]);

  return socketId;
}
