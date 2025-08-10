"use client";

import { useEffect, useState } from "react";

type AutoScrollOptions = {
  nearBottomThreshold?: number;
  behavior?: ScrollBehavior;
};

export function useAutoScroll<T extends readonly unknown[]>(
  containerRef: React.RefObject<HTMLElement | null>,
  endRef: React.RefObject<HTMLElement | null>,
  watch: T,
  options: AutoScrollOptions = {}
) {
  const [stickToBottom, setStickToBottom] = useState(true);
  const { nearBottomThreshold = 200, behavior = "auto" } = options;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < nearBottomThreshold;
      setStickToBottom(nearBottom);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef, nearBottomThreshold]);

  useEffect(() => {
    if (stickToBottom) endRef.current?.scrollIntoView({ behavior });
  }, [stickToBottom, endRef, watch, behavior]);
}
