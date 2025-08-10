"use client";

import { useEffect, useState } from "react";

export function useAutoScroll<T extends readonly unknown[]>(
  containerRef: React.RefObject<HTMLElement | null>,
  endRef: React.RefObject<HTMLElement | null>,
  watch: T
) {
  const [stickToBottom, setStickToBottom] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
      setStickToBottom(nearBottom);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  useEffect(() => {
    if (stickToBottom) endRef.current?.scrollIntoView({ behavior: "auto" });
  }, [stickToBottom, endRef, watch]);
}
