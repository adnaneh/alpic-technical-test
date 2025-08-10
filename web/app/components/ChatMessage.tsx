"use client";

import ReactMarkdown from "react-markdown";
import { isToolUIPart } from "ai";
import { ToolPart } from "./ToolPart";
import { type UIMessage } from "@ai-sdk/react";

export function ChatMessage({
  message,
  isLast,
  loading,
}: {
  message: UIMessage;
  isLast: boolean;
  loading: boolean;
}) {
  const parts = message.parts ?? [];
  const isUser = message.role === "user";
  const text = parts.find((p) => p.type === "text")?.text ?? "";
  const hasToolOutput = parts.some((p) => isToolUIPart(p));

  if (isUser) return <div className="text-right"><ReactMarkdown>{text}</ReactMarkdown></div>;

  return (
    <div className="space-y-2">
      {loading && isLast && !hasToolOutput && <p className="italic text-gray-500">🤖 AI is thinking…</p>}
      {parts.map((p, i) => {
        if (p.type === "text") return <ReactMarkdown key={i}>{p.text ?? ""}</ReactMarkdown>;
        if (isToolUIPart(p)) return <ToolPart key={i} part={p} />;
        return null;
      })}
    </div>
  );
}
