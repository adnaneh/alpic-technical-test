"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export function useSocketAudio(audioRef: React.RefObject<HTMLAudioElement | null>) {
  useEffect(() => {
    const socket = io(API_BASE, { transports: ['websocket'] });

    socket.on("play", ({ url, start_sec = 0 }: { url: string; start_sec?: number }) => {
      const a = audioRef.current;
      if (!a) return;
      a.pause();
      a.src = url;
      a.currentTime = start_sec;
      void a.play();
    });
    socket.on("pause", () => audioRef.current?.pause());
    socket.on("resume", () => audioRef.current?.play());

    return () => {
      socket.disconnect();
    };
  }, [audioRef]);
}
